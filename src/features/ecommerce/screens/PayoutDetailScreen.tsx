import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { EcommerceStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import { usePayout, useCancelPayout } from "../hooks/usePayouts";
import type { PayoutDetail } from "../types";

type Route = NativeStackScreenProps<
  EcommerceStackParamList,
  "PayoutDetail"
>["route"];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#fef3c7", text: "#92400e" },
  approved: { bg: "#dbeafe", text: "#1e40af" },
  processing: { bg: "#e0e7ff", text: "#3730a3" },
  completed: { bg: "#d1fae5", text: "#065f46" },
  rejected: { bg: "#fee2e2", text: "#991b1b" },
  cancelled: { bg: "#e5e7eb", text: "#374151" },
};

const PROGRESS_STEPS = ["pending", "approved", "processing", "completed"];

export default function PayoutDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { id } = route.params;

  const { payout, isLoading } = usePayout(id);
  const cancelMutation = useCancelPayout();

  if (isLoading || !payout) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
        </View>
      </SafeAreaView>
    );
  }

  const p: PayoutDetail = payout;
  const sc = STATUS_COLORS[p.status] ?? STATUS_COLORS.pending;
  const progressIdx = PROGRESS_STEPS.indexOf(p.status);

  const handleCancel = () => {
    Alert.alert(
      "Cancel Payout",
      "Are you sure you want to cancel this payout request?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () =>
            cancelMutation.mutate(p.id, {
              onSuccess: () => navigation.goBack(),
            }),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payout Details</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.body}>
        {/* Header */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.requestNum}>{p.request_number}</Text>
            <View style={[styles.badge, { backgroundColor: sc.bg }]}>
              <Text style={[styles.badgeText, { color: sc.text }]}>
                {p.status_label || p.status}
              </Text>
            </View>
          </View>
          <Text style={styles.dateText}>
            {new Date(p.created_at).toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Progress */}
        {p.status !== "rejected" && p.status !== "cancelled" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Progress</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${p.progress_percentage}%` },
                ]}
              />
            </View>
            <View style={styles.stepsRow}>
              {PROGRESS_STEPS.map((step, i) => (
                <View key={step} style={styles.step}>
                  <View
                    style={[
                      styles.stepDot,
                      i <= progressIdx && styles.stepDotDone,
                    ]}
                  />
                  <Text
                    style={[
                      styles.stepLabel,
                      i <= progressIdx && styles.stepLabelDone,
                    ]}>
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Amounts */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Amount Breakdown</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Requested</Text>
            <Text style={styles.infoValue}>
              ₦{p.requested_amount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Deduction ({p.deduction_description})
            </Text>
            <Text style={[styles.infoValue, { color: "#ef4444" }]}>
              -₦{p.deduction_amount.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.infoRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Net Amount</Text>
            <Text style={styles.totalValue}>
              ₦{p.net_amount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Bank Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bank Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bank</Text>
            <Text style={styles.infoValue}>{p.bank_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Name</Text>
            <Text style={styles.infoValue}>{p.account_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Number</Text>
            <Text style={styles.infoValue}>{p.account_number}</Text>
          </View>
          {p.payment_reference && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Reference</Text>
              <Text style={styles.infoValue}>{p.payment_reference}</Text>
            </View>
          )}
        </View>

        {/* Requester / Processor */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>People</Text>
          {p.requester && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Requested by</Text>
              <Text style={styles.infoValue}>{p.requester.name}</Text>
            </View>
          )}
          {p.processor && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Processed by</Text>
              <Text style={styles.infoValue}>{p.processor.name}</Text>
            </View>
          )}
          {p.processed_at && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Processed at</Text>
              <Text style={styles.infoValue}>
                {new Date(p.processed_at).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {(p.notes || p.admin_notes || p.rejection_reason) && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Notes</Text>
            {p.notes && <Text style={styles.noteText}>Note: {p.notes}</Text>}
            {p.admin_notes && (
              <Text style={[styles.noteText, { marginTop: 4 }]}>
                Admin: {p.admin_notes}
              </Text>
            )}
            {p.rejection_reason && (
              <Text
                style={[styles.noteText, { color: "#ef4444", marginTop: 4 }]}>
                Rejection: {p.rejection_reason}
              </Text>
            )}
          </View>
        )}

        {/* Cancel Action */}
        {p.can_be_cancelled && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel Payout Request</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a0f33" },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { width: 60 },
  backText: { color: BRAND_COLORS.gold, fontSize: 17, fontWeight: "600" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  placeholder: { width: 60 },
  body: { flex: 1, backgroundColor: "#f3f4f8", padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requestNum: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  dateText: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  /* Progress */
  progressBar: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: BRAND_COLORS.gold,
    borderRadius: 3,
  },
  stepsRow: { flexDirection: "row", marginTop: 10 },
  step: { flex: 1, alignItems: "center" },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e5e7eb",
  },
  stepDotDone: { backgroundColor: BRAND_COLORS.gold },
  stepLabel: {
    fontSize: 9,
    color: "#9ca3af",
    marginTop: 4,
    textTransform: "capitalize",
  },
  stepLabelDone: { color: BRAND_COLORS.darkPurple, fontWeight: "600" },
  /* Info */
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoLabel: { fontSize: 13, color: "#6b7280", flex: 1 },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#1f2937" },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 4,
    paddingTop: 8,
    borderBottomWidth: 0,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  totalValue: { fontSize: 17, fontWeight: "bold", color: "#10b981" },
  noteText: { fontSize: 13, color: "#6b7280" },
  cancelBtn: {
    backgroundColor: "#fee2e2",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  cancelText: { color: "#991b1b", fontSize: 15, fontWeight: "700" },
});
