import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BRAND_COLORS } from "../../../../theme/colors";
import { customerService } from "../services/customerService";
import type { CRMStackParamList } from "../../../../navigation/types";
import type { CustomerStatementDetail } from "../types";

type NavigationProp = NativeStackNavigationProp<
  CRMStackParamList,
  "CustomerStatementDetail"
>;

type RouteProp = {
  key: string;
  name: string;
  params: { id: number };
};

const formatCurrency = (value: number | null | undefined) => {
  const amount = typeof value === "number" ? value : 0;
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function CustomerStatementDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const customerId = route.params.id;

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<CustomerStatementDetail | null>(null);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    loadDetail();
  }, [customerId, startDate, endDate]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const response = await customerService.statementDetail(
        customerId,
        startDate,
        endDate,
      );
      setDetail(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Statement</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.filtersRow}>
          <TouchableOpacity
            onPress={() => setShowStartPicker(true)}
            style={styles.filterButton}>
            <Text style={styles.filterText}>From: {startDate}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowEndPicker(true)}
            style={styles.filterButton}>
            <Text style={styles.filterText}>To: {endDate}</Text>
          </TouchableOpacity>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={new Date(startDate)}
            mode="date"
            display="default"
            onChange={(_event, selected) => {
              setShowStartPicker(false);
              if (selected) setStartDate(selected.toISOString().split("T")[0]);
            }}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={new Date(endDate)}
            mode="date"
            display="default"
            onChange={(_event, selected) => {
              setShowEndPicker(false);
              if (selected) setEndDate(selected.toISOString().split("T")[0]);
            }}
          />
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BRAND_COLORS.darkPurple} />
            <Text style={styles.loadingText}>Loading statement...</Text>
          </View>
        ) : (
          detail && (
            <>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>
                  {detail.customer?.company_name ||
                    detail.customer?.display_name ||
                    "Customer"}
                </Text>
                <Text style={styles.summaryText}>
                  Opening: ₦{formatCurrency(detail.opening_balance)}
                </Text>
                <Text style={styles.summaryText}>
                  Debits: ₦{formatCurrency(detail.total_debits)}
                </Text>
                <Text style={styles.summaryText}>
                  Credits: ₦{formatCurrency(detail.total_credits)}
                </Text>
                <Text style={styles.summaryTextStrong}>
                  Closing: ₦{formatCurrency(detail.closing_balance)}
                </Text>
              </View>

              <View style={styles.listSection}>
                {detail.transactions.map((tx, idx) => (
                  <View key={idx} style={styles.txRow}>
                    <View style={styles.txLeft}>
                      <Text style={styles.txDate}>{tx.date}</Text>
                      <Text style={styles.txParticulars}>{tx.particulars}</Text>
                      {tx.voucher_number && (
                        <Text style={styles.txMeta}>
                          {tx.voucher_type} • {tx.voucher_number}
                        </Text>
                      )}
                    </View>
                    <View style={styles.txRight}>
                      <Text style={styles.txAmount}>
                        ₦{formatCurrency(tx.debit || tx.credit || 0)}
                      </Text>
                      {tx.running_balance !== undefined && (
                        <Text style={styles.txBalance}>
                          Bal: ₦{formatCurrency(tx.running_balance)}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </>
          )
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: { marginBottom: 12 },
  backButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  title: { fontSize: 22, fontWeight: "700", color: "#fff" },
  content: { flex: 1 },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  filterButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
  },
  filterText: { fontSize: 12, color: BRAND_COLORS.darkPurple },
  loadingContainer: { alignItems: "center", padding: 40 },
  loadingText: { marginTop: 12, color: "#6b7280" },
  summaryCard: {
    backgroundColor: "#fff",
    marginTop: 16,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  summaryText: { fontSize: 12, color: "#6b7280", marginBottom: 4 },
  summaryTextStrong: {
    fontSize: 14,
    color: BRAND_COLORS.gold,
    fontWeight: "700",
    marginTop: 6,
  },
  listSection: { paddingHorizontal: 20, paddingTop: 16 },
  txRow: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  txLeft: { flex: 1, paddingRight: 10 },
  txDate: { fontSize: 11, color: "#6b7280" },
  txParticulars: {
    fontSize: 13,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
    marginTop: 4,
  },
  txMeta: { fontSize: 11, color: "#9ca3af", marginTop: 4 },
  txRight: { alignItems: "flex-end" },
  txAmount: { fontSize: 13, fontWeight: "700", color: BRAND_COLORS.gold },
  txBalance: { fontSize: 11, color: "#6b7280", marginTop: 4 },
});
