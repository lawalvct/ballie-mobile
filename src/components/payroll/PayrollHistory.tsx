import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";
import { payrollProcessingService } from "../../features/payroll/processing/services/processingService";
import type {
  PayrollProcessingPeriod,
  PayrollProcessingStatus,
} from "../../features/payroll/processing/types";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { PayrollStackParamList } from "../../navigation/types";
import { showToast } from "../../utils/toast";

export default function PayrollHistory() {
  const navigation =
    useNavigation<NativeStackNavigationProp<PayrollStackParamList>>();
  const [periods, setPeriods] = useState<PayrollProcessingPeriod[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const parseNumber = (value?: string | number) => {
    if (typeof value === "number") return value;
    if (!value) return 0;
    const parsed = Number(String(value).replace(/,/g, ""));
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const formatCurrency = (value: number) =>
    `₦${new Intl.NumberFormat("en-US").format(value)}`;

  const formatDate = (value?: string) => {
    if (!value) return "-";
    return value.split(" ")[0];
  };

  const formatStatus = (status?: PayrollProcessingStatus) => {
    if (!status) return "-";
    return status.replace(/_/g, " ");
  };

  const statusColor = (status?: PayrollProcessingStatus) => {
    switch (status) {
      case "approved":
      case "completed":
        return "#10b981";
      case "processing":
        return "#f59e0b";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const loadHistory = async () => {
    try {
      const response = await payrollProcessingService.list({ per_page: 5 });
      setPeriods(response.periods || []);
    } catch (error: any) {
      showToast(error.message || "Failed to load payroll history", "error");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Payroll History</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("PayrollProcessingHome")}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {periods.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No payroll history yet.</Text>
        </View>
      ) : (
        periods.map((period) => (
          <View key={period.id} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.month}>{period.name}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor(period.status) },
                ]}>
                <Text style={styles.statusText}>
                  {formatStatus(period.status)}
                </Text>
              </View>
            </View>
            <View style={styles.historyDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Employees</Text>
                <Text style={styles.detailValue}>
                  {period.payroll_runs_count ?? 0}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Total Amount</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency(
                    parseNumber(period.total_net ?? period.total_gross),
                  )}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Pay Date</Text>
                <Text style={styles.detailValue}>
                  {formatDate(period.pay_date)}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  viewAll: {
    fontSize: 13,
    color: BRAND_COLORS.gold,
    fontWeight: "600",
  },
  historyCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  month: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  statusBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: SEMANTIC_COLORS.white,
  },
  historyDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  emptyCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 12,
    color: "#6b7280",
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
  },
});
