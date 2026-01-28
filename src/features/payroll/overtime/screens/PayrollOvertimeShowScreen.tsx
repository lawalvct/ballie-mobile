import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { overtimeService } from "../services/overtimeService";
import type { OvertimeRecord } from "../types";
import { showConfirm, showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollOvertimeShow"
>;

const formatAmount = (value?: number) => {
  if (typeof value !== "number") return "0";
  return new Intl.NumberFormat("en-US").format(value);
};

const formatStatus = (value?: string) =>
  value ? value.replace(/_/g, " ") : "N/A";

export default function PayrollOvertimeShowScreen({
  navigation,
  route,
}: Props) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<OvertimeRecord | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await overtimeService.show(id);
      setRecord(response.overtime);
    } catch (error: any) {
      showToast(error.message || "Failed to load overtime", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    if (!record) return;
    showConfirm("Approve Overtime", "Approve this overtime?", async () => {
      try {
        await overtimeService.approve(record.id);
        showToast("Overtime approved", "success");
        loadData();
      } catch (error: any) {
        showToast(error.message || "Failed to approve", "error");
      }
    });
  };

  const handleReject = () => {
    if (!record) return;
    showConfirm("Reject Overtime", "Reject this overtime?", async () => {
      try {
        await overtimeService.reject(record.id, {
          rejection_reason: "Rejected from mobile",
        });
        showToast("Overtime rejected", "success");
        loadData();
      } catch (error: any) {
        showToast(error.message || "Failed to reject", "error");
      }
    });
  };

  const handleMarkPaid = () => {
    if (!record) return;
    showConfirm("Mark Paid", "Mark overtime as paid?", async () => {
      try {
        await overtimeService.markPaid(record.id, {
          payment_date: new Date().toISOString().split("T")[0],
          payment_method: "bank",
        });
        showToast("Overtime marked as paid", "success");
        loadData();
      } catch (error: any) {
        showToast(error.message || "Failed to mark paid", "error");
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Overtime Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading overtime...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!record) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_COLORS.darkPurple}
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Overtime Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{record.overtime_number}</Text>
          <Text style={styles.cardSub}>{formatStatus(record.status)}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Employee</Text>
            <Text style={styles.detailValue}>{record.employee_name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Department</Text>
            <Text style={styles.detailValue}>{record.department_name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{record.overtime_date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>
              {record.start_time} - {record.end_time}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hours</Text>
            <Text style={styles.detailValue}>{record.total_hours ?? "-"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Rate</Text>
            <Text style={styles.detailValue}>
              {formatAmount(record.hourly_rate)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Multiplier</Text>
            <Text style={styles.detailValue}>{record.multiplier ?? "-"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>
              {formatAmount(record.total_amount)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>{record.overtime_type}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reason</Text>
            <Text style={styles.detailValue}>{record.reason || "-"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>
              {record.work_description || "-"}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {record.status === "pending" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() =>
                navigation.navigate("PayrollOvertimeEdit", { id: record.id })
              }>
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          {record.status === "pending" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={handleApprove}>
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
          )}
          {record.status === "pending" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}>
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          )}
          {record.status === "approved" && !record.is_paid && (
            <TouchableOpacity
              style={[styles.actionButton, styles.payButton]}
              onPress={handleMarkPaid}>
              <Text style={styles.actionButtonText}>Mark Paid</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: SEMANTIC_COLORS.white,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  card: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  cardSub: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  detailValue: {
    fontSize: 12,
    color: "#111827",
    flex: 1,
    textAlign: "right",
    marginLeft: 12,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 20,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f2937",
  },
  editButton: {
    backgroundColor: "#fef3c7",
  },
  approveButton: {
    backgroundColor: "#d1fae5",
  },
  rejectButton: {
    backgroundColor: "#fee2e2",
  },
  payButton: {
    backgroundColor: "#e0e7ff",
  },
});
