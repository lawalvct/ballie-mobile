import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BRAND_COLORS } from "../../../../theme/colors";
import { customerService } from "../services/customerService";
import type { CRMStackParamList } from "../../../../navigation/types";
import type {
  CustomerStatementListItem,
  CustomerStatementsStats,
  CustomerStatementsResponse,
  CustomerListParams,
} from "../types";

const formatCurrency = (value: number | null | undefined) => {
  const amount = typeof value === "number" ? value : 0;
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

type NavigationProp = NativeStackNavigationProp<
  CRMStackParamList,
  "CustomerStatements"
>;

export default function CustomerStatementsScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CustomerStatementListItem[]>([]);
  const [stats, setStats] = useState<CustomerStatementsStats | null>(null);
  const [pagination, setPagination] =
    useState<CustomerStatementsResponse | null>(null);

  const [filters, setFilters] = useState<CustomerListParams>({
    page: 1,
    per_page: 50,
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await customerService.statements(filters);
      setItems(response.data?.data || []);
      setPagination(response.data || null);
      setStats(response.statistics || null);
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
        <Text style={styles.title}>Customer Statements</Text>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BRAND_COLORS.darkPurple} />
            <Text style={styles.loadingText}>Loading statements...</Text>
          </View>
        ) : (
          <>
            {stats && (
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.total_customers}</Text>
                  <Text style={styles.statLabel}>Customers</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    ₦{formatCurrency(stats.total_receivable)}
                  </Text>
                  <Text style={styles.statLabel}>Receivable</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    ₦{formatCurrency(stats.total_payable)}
                  </Text>
                  <Text style={styles.statLabel}>Payable</Text>
                </View>
              </View>
            )}

            <View style={styles.listSection}>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={() =>
                    navigation.navigate("CustomerStatementDetail", {
                      id: item.id,
                    })
                  }>
                  <View style={styles.cardLeft}>
                    <Text style={styles.cardTitle}>{item.display_name}</Text>
                    <Text style={styles.cardSub}>{item.balance_type}</Text>
                  </View>
                  <Text style={styles.cardValue}>
                    ₦{formatCurrency(item.running_balance)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
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
  loadingContainer: { alignItems: "center", padding: 40 },
  loadingText: { marginTop: 12, color: "#6b7280" },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  statLabel: { fontSize: 11, color: "#6b7280" },
  listSection: { paddingHorizontal: 20, paddingTop: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLeft: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  cardSub: { fontSize: 11, color: "#6b7280", marginTop: 4 },
  cardValue: { fontSize: 14, fontWeight: "700", color: BRAND_COLORS.gold },
});
