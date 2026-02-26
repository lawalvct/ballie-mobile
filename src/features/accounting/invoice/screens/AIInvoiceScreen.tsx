import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BRAND_COLORS } from "../../../../theme/colors";
import AccountingModuleHeader from "../../../../components/accounting/AccountingModuleHeader";
import { useAuth } from "../../../../context/AuthContext";
import { showToast } from "../../../../utils/toast";
import { invoiceService } from "../services/invoiceService";
import type { AccountingStackParamList } from "../../../../navigation/types";
import type { ParsedInvoice, ParsedItem, AIInvoicePrefillData } from "../types";

type NavigationProp = NativeStackNavigationProp<
  AccountingStackParamList,
  "AIInvoice"
>;

type ScreenState =
  | "idle"
  | "loading"
  | "preview"
  | "submitting"
  | "applying"
  | "error";

const { width: SCREEN_W } = Dimensions.get("window");

/* ─── Example prompts ──────────────────────────────────────────────────────── */
const EXAMPLE_PROMPTS = [
  "Sold 10 bags of cement at 5500 to ABC Construction",
  "Purchase 200 units of palm oil at 1200 from Mama T Suppliers",
  "Invoice 5 laptops at 350k each to TechHub Ltd with VAT",
  "Bought 50 reams of A4 paper at 4500 from Office Mart",
];

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const formatNumber = (num: number): string => {
  if (!num || isNaN(num)) return "0.00";
  return parseFloat(String(num)).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/* ════════════════════════════════════════════════════════════════════════════ */

export default function AIInvoiceScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { tenant } = useAuth();

  // Version marker — check Metro console to confirm new bundle is loaded
  console.log("[AIInvoiceScreen] LOADED — v2026-02-26-fix3");

  /* ── state ── */
  const [screenState, setScreenState] = useState<ScreenState>("idle");
  const [description, setDescription] = useState("");
  const [parsedInvoice, setParsedInvoice] = useState<ParsedInvoice | null>(
    null,
  );
  const [aiInterpretation, setAiInterpretation] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* ── local submitting state for "Submit Directly" ── */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── derived ── */
  const subtotal = useMemo(() => {
    if (!parsedInvoice) return 0;
    return parsedInvoice.items.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0,
    );
  }, [parsedInvoice]);

  const canSubmitDirectly = useMemo(() => {
    if (!parsedInvoice) return false;
    if (!parsedInvoice.party_id) return false;
    if (!parsedInvoice.voucher_type_id) return false;
    if (!parsedInvoice.items || parsedInvoice.items.length === 0) return false;
    return parsedInvoice.items.every((item) => item.product_id !== null);
  }, [parsedInvoice]);

  const hasUnmatchedItems = useMemo(() => {
    if (!parsedInvoice) return false;
    return (
      !parsedInvoice.party_id ||
      parsedInvoice.items.some(
        (item) => item.not_found === true || item.product_id === null,
      )
    );
  }, [parsedInvoice]);

  /* ── AI generate ── */
  const handleGenerate = useCallback(async () => {
    const trimmed = description.trim();
    if (!trimmed || trimmed.length < 5) {
      Alert.alert("Error", "Please enter at least 5 characters.");
      return;
    }

    setScreenState("loading");
    setErrorMessage(null);

    try {
      const result = await invoiceService.aiParse({
        description: trimmed,
        tenant_id: tenant?.id ?? 0,
        voucher_type_id: null,
      });

      if (result.success && result.parsed_invoice) {
        setParsedInvoice(result.parsed_invoice);
        setAiInterpretation(result.ai_interpretation ?? "");
        setScreenState("preview");
      } else {
        setErrorMessage("Could not parse the description. Try rephrasing it.");
        setScreenState("error");
      }
    } catch (err: any) {
      // apiClient interceptor rejects with error.response?.data directly,
      // so `err` IS the API body (not nested under err.response.data)
      console.error("[AI-Generate] ERROR:", JSON.stringify(err, null, 2));
      const message =
        typeof err === "string"
          ? err
          : err?.message || "Something went wrong. Please try again.";
      setErrorMessage(message);
      setScreenState("error");
    }
  }, [description, tenant]);

  /* ── Submit directly ── */
  const handleSubmitDirectly = useCallback(async () => {
    if (!parsedInvoice || !canSubmitDirectly) return;

    setScreenState("submitting");
    setIsSubmitting(true);

    try {
      // ─── Resolve the correct party record ID ───
      // The AI parse endpoint returns `party_id` as the **ledger account ID**,
      // but the invoice store endpoint expects the **party record ID** (from the
      // parties / customers table).  When "Apply to Form" works it's because the
      // party-search auto-match in InvoiceCreateScreen resolves the real party.id.
      // We replicate that lookup here.
      let resolvedPartyId = parsedInvoice.party_id!;

      if (parsedInvoice.party_name) {
        const partyType =
          parsedInvoice.party_type === "customer" ? "customer" : "vendor";
        const parties = await invoiceService.searchCustomers(
          parsedInvoice.party_name,
          partyType,
        );

        if (parties && parties.length > 0) {
          const exactMatch = parties.find(
            (p) =>
              p.name?.trim().toLowerCase() ===
              parsedInvoice.party_name?.trim().toLowerCase(),
          );
          resolvedPartyId = exactMatch ? exactMatch.id : parties[0].id;
          console.log(
            "[AI-Submit] Resolved party_id:",
            resolvedPartyId,
            "from AI party_id:",
            parsedInvoice.party_id,
          );
        }
      }

      // ─── Build payload (same shape as InvoiceCreateScreen) ───
      const payload = {
        voucher_type_id: parsedInvoice.voucher_type_id!,
        voucher_date: parsedInvoice.invoice_date,
        party_id: resolvedPartyId,
        narration: parsedInvoice.narration || undefined,
        items: parsedInvoice.items.map((item) => ({
          product_id: item.product_id!,
          quantity: item.quantity,
          rate: item.rate,
          discount: 0,
          vat_rate: 0,
        })),
        status: "posted" as const,
      };

      console.log("[AI-Submit] PAYLOAD:", JSON.stringify(payload, null, 2));

      const invoice = await invoiceService.create(payload);
      showToast("Invoice created and posted successfully!", "success");
      navigation.navigate("InvoiceShow", { id: invoice.id });
    } catch (err: any) {
      const apiMessage =
        typeof err === "string"
          ? err
          : err?.message ||
            (err?.errors
              ? Object.values(err.errors as Record<string, string[]>)
                  .flat()
                  .join("\n")
              : null);
      Alert.alert(
        "Error",
        apiMessage ||
          'Failed to create invoice. Please try "Apply to Form" instead.',
      );
      setScreenState("preview");
    } finally {
      setIsSubmitting(false);
    }
  }, [parsedInvoice, canSubmitDirectly, navigation]);

  /* ── Apply to form ── */
  const handleApplyToForm = useCallback(() => {
    if (!parsedInvoice) return;

    const prefillData: AIInvoicePrefillData = {
      type: parsedInvoice.invoice_type,
      voucher_type_id: parsedInvoice.voucher_type_id,
      voucher_date: parsedInvoice.invoice_date,
      reference_number: parsedInvoice.reference_number,
      narration: parsedInvoice.narration,
      customer_id: parsedInvoice.party_id,
      customer_name: parsedInvoice.party_name,
      party_type: parsedInvoice.party_type,
      vat_enabled: parsedInvoice.vat_enabled,
      items: parsedInvoice.items.map((item) => ({
        product_id: item.product_id ?? null,
        product_name: item.product_name || item.product_name_suggested || "",
        description: item.description || "",
        quantity: item.quantity || 1,
        rate: item.rate || 0,
        amount: item.amount || 0,
        unit: item.unit || "Pcs",
        current_stock: item.current_stock ?? null,
        purchase_rate: item.purchase_rate || 0,
        not_found: item.not_found || false,
      })),
    };

    navigation.navigate("InvoiceCreate", {
      type: parsedInvoice.invoice_type,
      prefillData,
    });
  }, [parsedInvoice, navigation]);

  /* ── Try again ── */
  const handleTryAgain = useCallback(() => {
    setParsedInvoice(null);
    setAiInterpretation("");
    setErrorMessage(null);
    setScreenState("idle");
  }, []);

  /* ═══════════════════════════════════  RENDER  ═══════════════════════════ */

  /* ── Idle / Input state ── */
  const renderInput = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        keyboardShouldPersistTaps="handled">
        {/* Hero card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🤖</Text>
          <Text style={styles.heroTitle}>BallieAI Invoice Creator</Text>
          <Text style={styles.heroSubtitle}>
            Just tell me what you sold or bought — I'll build the invoice for
            you automatically.
          </Text>
        </View>

        {/* Text input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Describe your invoice</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder='e.g., "Sold 5 bags of rice at 45000 each to Alhaji Musa with VAT"'
            placeholderTextColor="#9ca3af"
            value={description}
            onChangeText={setDescription}
            maxLength={1000}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{description.length}/1000</Text>
        </View>

        {/* Example prompt chips */}
        <Text style={styles.chipSectionLabel}>💡 Try an example:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipContainer}>
          {EXAMPLE_PROMPTS.map((prompt, i) => (
            <TouchableOpacity
              key={i}
              style={styles.chip}
              onPress={() => setDescription(prompt)}
              activeOpacity={0.7}>
              <Text style={styles.chipText} numberOfLines={2}>
                {prompt}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Error banner */}
        {screenState === "error" && errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Generate button */}
        <TouchableOpacity
          style={[
            styles.generateBtn,
            (!description.trim() || description.trim().length < 5) &&
              styles.disabledBtn,
          ]}
          disabled={!description.trim() || description.trim().length < 5}
          onPress={handleGenerate}
          activeOpacity={0.8}>
          <LinearGradient
            colors={[BRAND_COLORS.gold, "#c9a84c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.generateBtnGradient}>
            <Text style={styles.generateBtnText}>✨ Generate Invoice</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  /* ── Loading state ── */
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingCard}>
        <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
        <Text style={styles.loadingTitle}>
          BallieAI is analyzing your description…
        </Text>
        <Text style={styles.loadingSubtitle}>
          Matching products, customers & amounts
        </Text>
        <View style={styles.loadingDots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, { opacity: 0.3 + i * 0.3 }]} />
          ))}
        </View>
      </View>
    </View>
  );

  /* ── Preview state ── */
  const renderPreview = () => {
    if (!parsedInvoice) return null;

    const vatAmount = parsedInvoice.vat_enabled ? subtotal * 0.075 : 0;
    const grandTotal = subtotal + vatAmount;

    return (
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.previewInner}>
        {/* Invoice type badge */}
        <View style={styles.typeBadgeRow}>
          <View
            style={[
              styles.typeBadge,
              parsedInvoice.invoice_type === "sales"
                ? styles.salesBadge
                : styles.purchaseBadge,
            ]}>
            <Text style={styles.typeBadgeText}>
              {parsedInvoice.invoice_type === "sales"
                ? "📤 Sales Invoice"
                : "📥 Purchase Invoice"}
            </Text>
          </View>
          {parsedInvoice.voucher_type_name && (
            <Text style={styles.voucherTypeName}>
              {parsedInvoice.voucher_type_name}
            </Text>
          )}
        </View>

        {/* Party card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            {parsedInvoice.party_type === "customer" ? "Customer" : "Vendor"}
          </Text>
          {parsedInvoice.party_id ? (
            <View style={styles.matchedRow}>
              <Text style={styles.matchIcon}>✅</Text>
              <Text style={styles.matchedText}>{parsedInvoice.party_name}</Text>
            </View>
          ) : (
            <View style={styles.unmatchedRow}>
              <Text style={styles.warnIcon}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.unmatchedText}>
                  "{parsedInvoice.party_name_suggested}" — Not found in records
                </Text>
                <Text style={styles.unmatchedHint}>
                  Use "Apply to Form" to select manually
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Date card */}
        <View style={styles.card}>
          <View style={styles.dateRow}>
            <Text style={styles.cardLabel}>Date</Text>
            <Text style={styles.dateValue}>
              📅 {formatDate(parsedInvoice.invoice_date)}
            </Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            Items ({parsedInvoice.items.length})
          </Text>
          {parsedInvoice.items.map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.itemRow,
                item.not_found && styles.itemRowWarning,
                idx > 0 && styles.itemRowBorder,
              ]}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemMatchIcon}>
                  {item.product_id ? "✅" : "⚠️"}
                </Text>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product_name ||
                    item.product_name_suggested ||
                    "Unknown"}
                </Text>
              </View>
              <View style={styles.itemMeta}>
                <Text style={styles.itemQty}>
                  {item.quantity} × ₦{formatNumber(item.rate)}
                </Text>
                <Text style={styles.itemAmount}>
                  ₦{formatNumber(item.amount)}
                </Text>
              </View>
              {item.not_found && (
                <Text style={styles.itemNotFound}>
                  Product not found in records
                </Text>
              )}
              {item.product_id != null && item.current_stock !== undefined && (
                <Text style={styles.itemStock}>
                  📦 Stock: {item.current_stock} {item.unit ?? ""}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₦{formatNumber(subtotal)}</Text>
          </View>
          {parsedInvoice.vat_enabled && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>VAT (7.5%)</Text>
              <Text style={styles.totalValue}>₦{formatNumber(vatAmount)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>
              ₦{formatNumber(grandTotal)}
            </Text>
          </View>
        </View>

        {/* AI Interpretation */}
        <View style={styles.interpretationCard}>
          <Text style={styles.interpretationLabel}>🤖 AI Interpretation</Text>
          <Text style={styles.interpretationText}>
            {parsedInvoice.interpretation}
          </Text>
        </View>

        {/* Warnings */}
        {hasUnmatchedItems && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningBannerIcon}>⚠️</Text>
            <Text style={styles.warningBannerText}>
              Some items or the customer/vendor could not be matched. Use "Apply
              to Form" to review and select manually.
            </Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionSection}>
          {canSubmitDirectly && (
            <TouchableOpacity
              style={styles.submitDirectBtn}
              onPress={handleSubmitDirectly}
              disabled={screenState === "submitting"}
              activeOpacity={0.8}>
              <LinearGradient
                colors={[BRAND_COLORS.green, "#1e8073"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionBtnGradient}>
                {screenState === "submitting" ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitDirectText}>
                    🚀 Submit Directly
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.applyFormBtn}
            onPress={handleApplyToForm}
            activeOpacity={0.8}>
            <LinearGradient
              colors={[BRAND_COLORS.blue, "#245580"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionBtnGradient}>
              <Text style={styles.applyFormText}>📝 Apply to Form</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tryAgainBtn}
            onPress={handleTryAgain}
            activeOpacity={0.7}>
            <Text style={styles.tryAgainText}>🔄 Try Again</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  /* ── Submitting overlay ── */
  const renderSubmitting = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingCard}>
        <ActivityIndicator size="large" color={BRAND_COLORS.green} />
        <Text style={styles.loadingTitle}>Creating your invoice…</Text>
        <Text style={styles.loadingSubtitle}>Posting to your books</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />
      <AccountingModuleHeader
        title="✨ Create with AI"
        onBack={() => navigation.goBack()}
        navigation={navigation}
      />

      {screenState === "idle" || screenState === "error"
        ? renderInput()
        : screenState === "loading"
          ? renderLoading()
          : screenState === "submitting"
            ? renderSubmitting()
            : renderPreview()}
    </SafeAreaView>
  );
}

/* ════════════════════════════════════════════════════════════════════════════ */
/*  STYLES                                                                     */
/* ════════════════════════════════════════════════════════════════════════════ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  /* ── Content ── */
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 16,
    paddingBottom: 40,
  },
  previewInner: {
    padding: 16,
    paddingBottom: 40,
  },

  /* ── Hero card ── */
  heroCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },

  /* ── Input card ── */
  inputCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#1f2937",
    minHeight: 110,
    backgroundColor: "#fafafa",
    lineHeight: 22,
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 6,
  },

  /* ── Chips ── */
  chipSectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 10,
  },
  chipScroll: {
    marginBottom: 20,
  },
  chipContainer: {
    gap: 10,
    paddingRight: 8,
  },
  chip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BRAND_COLORS.gold,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: SCREEN_W * 0.7,
  },
  chipText: {
    fontSize: 13,
    color: BRAND_COLORS.darkPurple,
    lineHeight: 18,
  },

  /* ── Error ── */
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#991b1b",
    lineHeight: 20,
  },

  /* ── Generate button ── */
  generateBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 4,
  },
  generateBtnGradient: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 14,
  },
  generateBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  disabledBtn: {
    opacity: 0.45,
  },

  /* ── Loading ── */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  loadingTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginTop: 20,
    textAlign: "center",
  },
  loadingSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 6,
    textAlign: "center",
  },
  loadingDots: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND_COLORS.gold,
  },

  /* ── Preview — Type badge ── */
  typeBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  typeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  salesBadge: {
    backgroundColor: "#dcfce7",
  },
  purchaseBadge: {
    backgroundColor: "#dbeafe",
  },
  typeBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  voucherTypeName: {
    fontSize: 13,
    color: "#6b7280",
    fontStyle: "italic",
  },

  /* ── Preview — Cards ── */
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  matchedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  matchIcon: {
    fontSize: 16,
  },
  matchedText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#166534",
  },
  unmatchedRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  warnIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  unmatchedText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#92400e",
  },
  unmatchedHint: {
    fontSize: 12,
    color: "#b45309",
    marginTop: 2,
  },

  /* ── Date ── */
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },

  /* ── Items ── */
  itemRow: {
    paddingVertical: 10,
  },
  itemRowWarning: {
    backgroundColor: "#fffbeb",
    borderRadius: 8,
    paddingHorizontal: 8,
    marginHorizontal: -4,
  },
  itemRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  itemMatchIcon: {
    fontSize: 14,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },
  itemMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 28,
  },
  itemQty: {
    fontSize: 14,
    color: "#6b7280",
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  itemNotFound: {
    paddingLeft: 28,
    fontSize: 12,
    color: "#b45309",
    marginTop: 4,
    fontStyle: "italic",
  },
  itemStock: {
    paddingLeft: 28,
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  /* ── Totals ── */
  totalsCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  grandTotalRow: {
    borderTopWidth: 1.5,
    borderTopColor: BRAND_COLORS.gold,
    marginTop: 8,
    paddingTop: 12,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: BRAND_COLORS.darkPurple,
  },

  /* ── Interpretation ── */
  interpretationCard: {
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  interpretationLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND_COLORS.blue,
    marginBottom: 6,
  },
  interpretationText: {
    fontSize: 14,
    color: "#1e40af",
    lineHeight: 20,
  },

  /* ── Warning banner ── */
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  warningBannerIcon: {
    fontSize: 18,
  },
  warningBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#92400e",
    lineHeight: 19,
  },

  /* ── Action buttons ── */
  actionSection: {
    gap: 10,
    marginTop: 4,
  },
  submitDirectBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  applyFormBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  actionBtnGradient: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 14,
  },
  submitDirectText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  applyFormText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  tryAgainBtn: {
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 14,
    backgroundColor: "#fff",
  },
  tryAgainText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
});
