import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
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
import type { ParsedInvoice, AIInvoicePrefillData } from "../types";
import { useVoiceInput } from "../hooks/useVoiceInput";
import {
  EXAMPLE_PROMPTS,
  formatNumber,
  formatDate,
} from "./aiInvoiceConstants";
import { styles } from "./aiInvoiceStyles";

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

/*  */

export default function AIInvoiceScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { tenant } = useAuth();

  console.log("[AIInvoiceScreen] LOADED  v2026-02-26-refactor");

  /*  state  */
  const [screenState, setScreenState] = useState<ScreenState>("idle");
  const [description, setDescription] = useState("");
  const [parsedInvoice, setParsedInvoice] = useState<ParsedInvoice | null>(null);
  const [aiInterpretation, setAiInterpretation] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /*  voice input (speech-to-text)  */
  const { isListening, voicePartial, pulseAnim, handleVoiceToggle } =
    useVoiceInput(setDescription);

  /*  derived  */
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

  /*  AI generate  */
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
      console.error("[AI-Generate] ERROR:", JSON.stringify(err, null, 2));
      const message =
        typeof err === "string"
          ? err
          : err?.message || "Something went wrong. Please try again.";
      setErrorMessage(message);
      setScreenState("error");
    }
  }, [description, tenant]);

  /*  Submit directly  */
  const handleSubmitDirectly = useCallback(async () => {
    if (!parsedInvoice || !canSubmitDirectly) return;

    setScreenState("submitting");
    setIsSubmitting(true);

    try {
      // The AI parse endpoint returns party_id as a ledger account ID,
      // but the invoice store needs the party record ID.
      // Resolve it by searching customers/vendors by name.
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
      navigation.replace("InvoiceShow", { id: invoice.id });
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

  /*  Apply to form  */
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

  /*  Try again  */
  const handleTryAgain = useCallback(() => {
    setParsedInvoice(null);
    setAiInterpretation("");
    setErrorMessage(null);
    setScreenState("idle");
  }, []);

  /*   RENDER   */

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
          <Text style={styles.heroEmoji}></Text>
          <Text style={styles.heroTitle}>BallieAI Invoice Creator</Text>
          <Text style={styles.heroSubtitle}>
            Just tell me what you sold or bought  I'll build the invoice for
            you automatically.
          </Text>
        </View>

        {/* Text input */}
        <View style={styles.inputCard}>
          <View style={styles.inputLabelRow}>
            <Text style={styles.inputLabel}>Describe your invoice</Text>
            <TouchableOpacity
              onPress={handleVoiceToggle}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Animated.View
                style={[
                  styles.micButton,
                  isListening && styles.micButtonActive,
                  { transform: [{ scale: pulseAnim }] },
                ]}>
                <Text style={styles.micIcon}>{isListening ? "⏹" : "🎤"}</Text>
              </Animated.View>
            </TouchableOpacity>
          </View>

          {isListening && (
            <View style={styles.listeningBanner}>
              <View style={styles.listeningDot} />
              <Text style={styles.listeningText}>🔴 Listening… speak now</Text>
            </View>
          )}

          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder='e.g., "Sold 5 bags of rice at 45000 each to Alhaji Musa with VAT"'
            placeholderTextColor="#9ca3af"
            value={
              voicePartial
                ? description + (description.trim() ? " " : "") + voicePartial
                : description
            }
            onChangeText={(text) => {
              if (!isListening) setDescription(text);
            }}
            maxLength={1000}
            textAlignVertical="top"
            editable={!isListening}
          />
          <View style={styles.charCountRow}>
            {isListening && (
              <Text style={styles.voiceHint}>Tap ⏹ to stop</Text>
            )}
            <Text style={styles.charCount}>{description.length}/1000</Text>
          </View>
        </View>

        {/* Example prompt chips */}
        <Text style={styles.chipSectionLabel}> Try an example:</Text>
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
            <Text style={styles.errorIcon}></Text>
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
            <Text style={styles.generateBtnText}> Generate Invoice</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingCard}>
        <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
        <Text style={styles.loadingTitle}>
          BallieAI is analyzing your description
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
                ? " Sales Invoice"
                : " Purchase Invoice"}
            </Text>
          </View>
          {parsedInvoice.voucher_type_name && (
            <Text style={styles.voucherTypeName}>
              {parsedInvoice.voucher_type_name}
            </Text>
          )}
        </View>

        {/* Party */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            {parsedInvoice.party_type === "customer" ? "Customer" : "Vendor"}
          </Text>
          {parsedInvoice.party_id ? (
            <View style={styles.matchedRow}>
              <Text style={styles.matchIcon}></Text>
              <Text style={styles.matchedText}>{parsedInvoice.party_name}</Text>
            </View>
          ) : (
            <View style={styles.unmatchedRow}>
              <Text style={styles.warnIcon}></Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.unmatchedText}>
                  "{parsedInvoice.party_name_suggested}"  Not found in records
                </Text>
                <Text style={styles.unmatchedHint}>
                  Use "Apply to Form" to select manually
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Date */}
        <View style={styles.card}>
          <View style={styles.dateRow}>
            <Text style={styles.cardLabel}>Date</Text>
            <Text style={styles.dateValue}>
               {formatDate(parsedInvoice.invoice_date)}
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
                  {item.product_id ? "" : ""}
                </Text>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product_name ||
                    item.product_name_suggested ||
                    "Unknown"}
                </Text>
              </View>
              <View style={styles.itemMeta}>
                <Text style={styles.itemQty}>
                  {item.quantity}  {formatNumber(item.rate)}
                </Text>
                <Text style={styles.itemAmount}>
                  {formatNumber(item.amount)}
                </Text>
              </View>
              {item.not_found && (
                <Text style={styles.itemNotFound}>
                  Product not found in records
                </Text>
              )}
              {item.product_id != null && item.current_stock !== undefined && (
                <Text style={styles.itemStock}>
                   Stock: {item.current_stock} {item.unit ?? ""}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatNumber(subtotal)}</Text>
          </View>
          {parsedInvoice.vat_enabled && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>VAT (7.5%)</Text>
              <Text style={styles.totalValue}>{formatNumber(vatAmount)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>
              {formatNumber(grandTotal)}
            </Text>
          </View>
        </View>

        {/* AI Interpretation */}
        <View style={styles.interpretationCard}>
          <Text style={styles.interpretationLabel}> AI Interpretation</Text>
          <Text style={styles.interpretationText}>
            {parsedInvoice.interpretation}
          </Text>
        </View>

        {/* Warnings */}
        {hasUnmatchedItems && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningBannerIcon}></Text>
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
                  <Text style={styles.submitDirectText}> Submit Directly</Text>
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
              <Text style={styles.applyFormText}> Apply to Form</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tryAgainBtn}
            onPress={handleTryAgain}
            activeOpacity={0.7}>
            <Text style={styles.tryAgainText}> Try Again</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  const renderSubmitting = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingCard}>
        <ActivityIndicator size="large" color={BRAND_COLORS.green} />
        <Text style={styles.loadingTitle}>Creating your invoice</Text>
        <Text style={styles.loadingSubtitle}>Posting to your books</Text>
      </View>
    </View>
  );

  /*  Main render  */
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />
      <AccountingModuleHeader
        title=" Create with AI"
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
