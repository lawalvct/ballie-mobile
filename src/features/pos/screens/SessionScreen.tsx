import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { POSStackParamList } from "../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../theme/colors";
import { useAuth } from "../../../context/AuthContext";
import {
  usePosSession,
  usePosRegisters,
  useOpenSession,
  useCloseSession,
} from "../hooks/usePos";

type Props = NativeStackScreenProps<POSStackParamList, "POSSession">;

const todayFormatted = (): string =>
  new Date().toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function formatCurrency(n: number | string): string {
  const val = typeof n === "string" ? parseFloat(n) : n;
  return `₦${val.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function formatDuration(openedAt: string): string {
  const ms = Date.now() - new Date(openedAt).getTime();
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

export default function SessionScreen({ navigation }: Props) {
  const { user, tenant } = useAuth();
  const { hasActiveSession, session, isLoading, isRefreshing, refresh } = usePosSession();
  const { registers, isLoading: registersLoading } = usePosRegisters();
  const openSession = useOpenSession();
  const closeSession = useCloseSession();

  const [selectedRegisterId, setSelectedRegisterId] = useState<number | null>(null);
  const [openingBalance, setOpeningBalance] = useState("");
  const [openingNotes, setOpeningNotes] = useState("");
  const [closingBalance, setClosingBalance] = useState("");
  const [closingNotes, setClosingNotes] = useState("");

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || "U";

  const quickAmounts = [
    { label: "₦0", value: 0 },
    { label: "₦5,000", value: 5000 },
    { label: "₦10,000", value: 10000 },
    { label: "₦20,000", value: 20000 },
  ];

  const handleOpenSession = () => {
    if (!selectedRegisterId) return;
    openSession.mutate(
      {
        cash_register_id: selectedRegisterId,
        opening_balance: parseFloat(openingBalance) || 0,
        opening_notes: openingNotes || undefined,
      },
      {
        onSuccess: () => {
          setOpeningBalance("");
          setOpeningNotes("");
          setSelectedRegisterId(null);
          refresh();
        },
      },
    );
  };

  const handleCloseSession = () => {
    Alert.alert(
      "Close Session",
      "Are you sure you want to close this session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Close",
          style: "destructive",
          onPress: () => {
            closeSession.mutate(
              {
                closing_balance: parseFloat(closingBalance) || 0,
                closing_notes: closingNotes || undefined,
              },
              {
                onSuccess: () => {
                  setClosingBalance("");
                  setClosingNotes("");
                  refresh();
                },
              },
            );
          },
        },
      ],
    );
  };

  const availableRegisters = registers?.filter((r) => r.is_active && !r.active_session) ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={[BRAND_COLORS.gold]}
            tintColor={BRAND_COLORS.gold}
            progressBackgroundColor="#2d1f5e"
          />
        }>
        {/* Header Hero */}
        <LinearGradient
          colors={["#1a0f33", "#2d1f5e"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.hero}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.companyName} numberOfLines={1}>
                {tenant?.name || "Your Business"}
              </Text>
              <Text style={styles.headerDate}>{todayFormatted()}</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
                <Text style={styles.bellIcon}>🔔</Text>
                <View style={styles.bellDot} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatar} activeOpacity={0.8}>
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Body */}
        <View style={styles.body}>
          {/* Title */}
          <View style={styles.introCard}>
            <View style={styles.introLeft}>
              <Text style={styles.introTitle}>
                {hasActiveSession ? "Active Session" : "Cash Register"}
              </Text>
              <Text style={styles.introSubtitle}>
                {hasActiveSession
                  ? "Your register session is currently open"
                  : "Open a session to start selling"}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                hasActiveSession ? styles.statusActive : styles.statusInactive,
              ]}>
              <Text
                style={[
                  styles.statusText,
                  hasActiveSession ? styles.statusTextActive : styles.statusTextInactive,
                ]}>
                {hasActiveSession ? "Open" : "Closed"}
              </Text>
            </View>
          </View>

          {isLoading || registersLoading ? (
            <ActivityIndicator size="large" color={BRAND_COLORS.gold} style={{ marginTop: 40 }} />
          ) : hasActiveSession && session ? (
            /* ── Active Session View ─────────────────────────────── */
            <View>
              {/* Session Info Card */}
              <View style={styles.sessionCard}>
                <View style={styles.sessionRow}>
                  <Text style={styles.sessionLabel}>Register</Text>
                  <Text style={styles.sessionValue}>{session.cash_register.name}</Text>
                </View>
                <View style={styles.sessionRow}>
                  <Text style={styles.sessionLabel}>Location</Text>
                  <Text style={styles.sessionValue}>{session.cash_register.location}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.sessionRow}>
                  <Text style={styles.sessionLabel}>Opening Balance</Text>
                  <Text style={styles.sessionValue}>
                    {formatCurrency(session.opening_balance)}
                  </Text>
                </View>
                <View style={styles.sessionRow}>
                  <Text style={styles.sessionLabel}>Total Sales</Text>
                  <Text style={[styles.sessionValue, { color: BRAND_COLORS.green }]}>
                    {formatCurrency(session.total_sales)}
                  </Text>
                </View>
                <View style={styles.sessionRow}>
                  <Text style={styles.sessionLabel}>Cash Sales</Text>
                  <Text style={styles.sessionValue}>
                    {formatCurrency(session.total_cash_sales)}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.sessionRow}>
                  <Text style={styles.sessionLabel}>Duration</Text>
                  <Text style={styles.sessionValue}>{formatDuration(session.opened_at)}</Text>
                </View>
                {session.opening_notes && (
                  <View style={styles.sessionRow}>
                    <Text style={styles.sessionLabel}>Notes</Text>
                    <Text style={[styles.sessionValue, { flex: 1 }]} numberOfLines={2}>
                      {session.opening_notes}
                    </Text>
                  </View>
                )}
              </View>

              {/* Quick Actions */}
              <TouchableOpacity
                style={styles.startSellingButton}
                onPress={() => navigation.navigate("POSSale")}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={[BRAND_COLORS.gold, "#c9a556"]}
                  style={styles.startSellingGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  <Text style={styles.startSellingText}>Start Selling</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Close Session */}
              <View style={styles.closeSection}>
                <Text style={styles.closeSectionTitle}>Close Session</Text>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Closing Balance (₦)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter closing cash balance"
                    placeholderTextColor="#9ca3af"
                    value={closingBalance}
                    onChangeText={setClosingBalance}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Closing Notes (Optional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Any notes about the session..."
                    placeholderTextColor="#9ca3af"
                    value={closingNotes}
                    onChangeText={setClosingNotes}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseSession}
                  disabled={closeSession.isPending}>
                  {closeSession.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.closeButtonText}>Close Session</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* ── Open Session Form ───────────────────────────────── */
            <View>
              {/* Register Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Select Cash Register</Text>
                {availableRegisters.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No available registers</Text>
                    <Text style={styles.emptySubtext}>
                      All registers are either inactive or in use
                    </Text>
                  </View>
                ) : (
                  <View style={styles.selectContainer}>
                    {availableRegisters.map((register) => (
                      <TouchableOpacity
                        key={`register-${register.id}`}
                        style={[
                          styles.registerOption,
                          selectedRegisterId === register.id && styles.registerOptionSelected,
                        ]}
                        onPress={() => setSelectedRegisterId(register.id)}>
                        <View
                          style={[
                            styles.radioButton,
                            selectedRegisterId === register.id && styles.radioButtonSelected,
                          ]}>
                          {selectedRegisterId === register.id && (
                            <View style={styles.radioButtonInner} />
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.registerOptionText,
                              selectedRegisterId === register.id && styles.registerOptionTextSelected,
                            ]}>
                            {register.name}
                          </Text>
                          {register.location ? (
                            <Text style={styles.registerLocation}>{register.location}</Text>
                          ) : null}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Opening Balance */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Opening Balance (₦)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter opening balance"
                  placeholderTextColor="#9ca3af"
                  value={openingBalance}
                  onChangeText={setOpeningBalance}
                  keyboardType="numeric"
                />
              </View>

              {/* Quick Amounts */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Quick Amount</Text>
                <View style={styles.quickAmountGrid}>
                  {quickAmounts.map((amount) => (
                    <TouchableOpacity
                      key={`quick-${amount.value}`}
                      style={[
                        styles.quickAmountButton,
                        openingBalance === String(amount.value) && styles.quickAmountButtonActive,
                      ]}
                      onPress={() => setOpeningBalance(String(amount.value))}>
                      <Text
                        style={[
                          styles.quickAmountText,
                          openingBalance === String(amount.value) && styles.quickAmountTextActive,
                        ]}>
                        {amount.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notes */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Opening Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Add any notes about this session..."
                  placeholderTextColor="#9ca3af"
                  value={openingNotes}
                  onChangeText={setOpeningNotes}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Actions */}
              <TouchableOpacity
                style={[styles.openButton, !selectedRegisterId && styles.openButtonDisabled]}
                onPress={handleOpenSession}
                disabled={!selectedRegisterId || openSession.isPending}>
                <LinearGradient
                  colors={
                    selectedRegisterId
                      ? [BRAND_COLORS.gold, "#c9a556"]
                      : ["#d1d5db", "#d1d5db"]
                  }
                  style={styles.openButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  {openSession.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.openButtonText}>Open Session</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1a0f33" },
  scroll: { flex: 1, backgroundColor: "#f5f5f5" },
  hero: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  companyName: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  headerDate: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  bellBtn: { position: "relative", padding: 4 },
  bellIcon: { fontSize: 22 },
  bellDot: { position: "absolute", top: 2, right: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444" },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: BRAND_COLORS.gold, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  body: { backgroundColor: "#f5f5f5", borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -12, paddingTop: 20, paddingHorizontal: 20, minHeight: 600 },
  introCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  introLeft: { flex: 1, marginRight: 12 },
  introTitle: { fontSize: 22, fontWeight: "bold", color: BRAND_COLORS.darkPurple },
  introSubtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  statusActive: { backgroundColor: "#DEF7EC" },
  statusInactive: { backgroundColor: "#FDE8E8" },
  statusText: { fontSize: 13, fontWeight: "600" },
  statusTextActive: { color: "#03543F" },
  statusTextInactive: { color: "#9B1C1C" },

  // Session card
  sessionCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  sessionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 },
  sessionLabel: { fontSize: 14, color: "#6b7280" },
  sessionValue: { fontSize: 15, fontWeight: "600", color: BRAND_COLORS.darkPurple },
  divider: { height: 1, backgroundColor: "#f3f4f6", marginVertical: 4 },

  // Start selling
  startSellingButton: { borderRadius: 12, marginBottom: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  startSellingGradient: { padding: 18, borderRadius: 12, alignItems: "center" },
  startSellingText: { fontSize: 17, fontWeight: "bold", color: "#fff" },

  // Close session
  closeSection: { backgroundColor: "#fff", borderRadius: 16, padding: 20, marginTop: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  closeSectionTitle: { fontSize: 17, fontWeight: "bold", color: BRAND_COLORS.darkPurple, marginBottom: 16 },
  closeButton: { backgroundColor: "#dc2626", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 4 },
  closeButtonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },

  // Form
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", color: BRAND_COLORS.darkPurple, marginBottom: 8 },
  input: { backgroundColor: "#fff", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", fontSize: 15, color: BRAND_COLORS.darkPurple },
  textArea: { minHeight: 80, paddingTop: 16 },
  selectContainer: { gap: 10 },
  registerOption: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 16, borderRadius: 12, borderWidth: 2, borderColor: "#e5e7eb" },
  registerOptionSelected: { borderColor: BRAND_COLORS.gold, backgroundColor: "#fef9f3" },
  radioButton: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#d1d5db", alignItems: "center", justifyContent: "center", marginRight: 12 },
  radioButtonSelected: { borderColor: BRAND_COLORS.gold },
  radioButtonInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: BRAND_COLORS.gold },
  registerOptionText: { fontSize: 15, fontWeight: "500", color: "#4b5563" },
  registerOptionTextSelected: { color: BRAND_COLORS.darkPurple, fontWeight: "600" },
  registerLocation: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  quickAmountGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickAmountButton: { width: "47%", backgroundColor: "#fff", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center" },
  quickAmountButtonActive: { borderColor: BRAND_COLORS.gold, backgroundColor: "#fef9f3" },
  quickAmountText: { fontSize: 15, fontWeight: "600", color: BRAND_COLORS.darkPurple },
  quickAmountTextActive: { color: BRAND_COLORS.gold },
  openButton: { borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  openButtonDisabled: { opacity: 0.6 },
  openButtonGradient: { padding: 18, borderRadius: 12, alignItems: "center" },
  openButtonText: { fontSize: 17, fontWeight: "bold", color: "#fff" },
  emptyCard: { backgroundColor: "#fff", padding: 24, borderRadius: 12, alignItems: "center" },
  emptyText: { fontSize: 15, fontWeight: "600", color: "#6b7280" },
  emptySubtext: { fontSize: 13, color: "#9ca3af", marginTop: 4 },
});
