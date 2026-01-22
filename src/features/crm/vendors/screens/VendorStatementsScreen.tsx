import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Share,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BRAND_COLORS } from "../../../../theme/colors";
import { vendorService } from "../services/vendorService";
import type { CRMStackParamList } from "../../../../navigation/types";
import type {
  VendorStatementListItem,
  VendorStatementsStats,
  VendorStatementsResponse,
  VendorListParams,
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
  "VendorStatements"
>;

export default function VendorStatementsScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<VendorStatementListItem[]>([]);
  const [stats, setStats] = useState<VendorStatementsStats | null>(null);
  const [pagination, setPagination] = useState<VendorStatementsResponse | null>(
    null,
  );

  const [filters, setFilters] = useState<VendorListParams>({
    page: 1,
    per_page: 50,
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await vendorService.statements(filters);
      console.log("Vendor statements response:", response);
      console.log("Items:", response.data?.data);
      console.log("Stats:", response.statistics);
      setItems(response.data?.data || []);
      setPagination(response.data || null);
      setStats(response.statistics || null);
    } catch (error: any) {
      console.error("Error loading vendor statements:", error);
      Alert.alert("Error", error.message || "Failed to load statements");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleExport = async (item: VendorStatementListItem) => {
    Alert.alert(
      "Export Statement",
      `Export statement for ${item.display_name} as PDF or Excel?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "PDF",
          onPress: () => downloadStatement(item, "pdf"),
        },
        {
          text: "Excel",
          onPress: () => downloadStatement(item, "excel"),
        },
      ],
    );
  };

  const downloadStatement = async (
    item: VendorStatementListItem,
    format: "pdf" | "excel",
  ) => {
    try {
      // Get current date range (last 30 days)
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      // Get download URL
      const url =
        format === "pdf"
          ? await vendorService.exportStatementPDF(item.id, startDate, endDate)
          : await vendorService.exportStatementExcel(
              item.id,
              startDate,
              endDate,
            );

      // Set file extension and name
      const extension = format === "pdf" ? "pdf" : "csv";
      const fileName = `${item.display_name.replace(/\s+/g, "_")}_statement_${startDate}_to_${endDate}.${extension}`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Download file
      Alert.alert("Downloading...", `Exporting ${format.toUpperCase()} file`);

      if (!FileSystem.downloadAsync || !FileSystem.documentDirectory) {
        await Linking.openURL(url);
        return;
      }

      const downloadResult = await FileSystem.downloadAsync(url, fileUri);

      if (downloadResult.status === 200) {
        // Share/Open the file
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: format === "pdf" ? "application/pdf" : "text/csv",
            dialogTitle: `${item.display_name} Statement`,
          });
        } else {
          Alert.alert(
            "Success",
            `Statement exported successfully to:\n${downloadResult.uri}`,
          );
        }
      } else {
        throw new Error("Download failed");
      }
    } catch (error: any) {
      console.error("Export error:", error);
      Alert.alert(
        "Export Failed",
        error.message || "Failed to export statement. Please try again.",
      );
    }
  };

  const handleShare = async (item: VendorStatementListItem) => {
    try {
      const message = `Vendor Statement\n${item.display_name}\nBalance: ₦${formatCurrency(item.running_balance)}\nType: ${item.balance_type}`;
      await Share.share({ message });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

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
        <Text style={styles.title}>Vendor Statements</Text>
        <Text style={styles.subtitle}>View balances and statements</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[BRAND_COLORS.darkPurple]}
            tintColor={BRAND_COLORS.darkPurple}
          />
        }>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BRAND_COLORS.darkPurple} />
            <Text style={styles.loadingText}>Loading statements...</Text>
          </View>
        ) : (
          <>
            {stats && (
              <View style={styles.statsRow}>
                <LinearGradient
                  colors={["#8B5CF6", "#6D28D9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.total_vendors}</Text>
                  <Text style={styles.statLabel}>Vendors</Text>
                </LinearGradient>
                <LinearGradient
                  colors={["#EF4444", "#DC2626"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCard}>
                  <Text style={styles.statValue}>
                    ₦{formatCurrency(stats.total_payable)}
                  </Text>
                  <Text style={styles.statLabel}>Payable</Text>
                </LinearGradient>
                <LinearGradient
                  colors={["#10B981", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCard}>
                  <Text style={styles.statValue}>
                    ₦{formatCurrency(stats.total_receivable)}
                  </Text>
                  <Text style={styles.statLabel}>Receivable</Text>
                </LinearGradient>
              </View>
            )}

            <View style={styles.listSection}>
              {items.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📊</Text>
                  <Text style={styles.emptyTitle}>No Statements</Text>
                  <Text style={styles.emptyText}>
                    No vendor statements found
                  </Text>
                </View>
              ) : (
                items.map((item) => (
                  <View key={item.id} style={styles.card}>
                    <View style={styles.cardContent}>
                      <View style={styles.cardLeft}>
                        <Text style={styles.cardTitle}>
                          {item.display_name}
                        </Text>
                        <View style={styles.balanceTypeBadge}>
                          <Text style={styles.balanceTypeText}>
                            {item.balance_type}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.cardRight}>
                        <Text style={styles.cardLabel}>Balance</Text>
                        <Text style={styles.cardValue}>
                          ₦{formatCurrency(item.running_balance)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() =>
                          navigation.navigate("VendorStatementDetail", {
                            id: item.id,
                          })
                        }>
                        <Text style={styles.actionButtonText}>📄 View</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleExport(item)}>
                        <Text style={styles.actionButtonText}>📥 Export</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.whatsappButton]}
                        onPress={() => handleShare(item)}>
                        <Text style={styles.actionButtonText}>WhatsApp</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
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
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: BRAND_COLORS.gold,
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
  listSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyContainer: {
    padding: 60,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardLeft: {
    flex: 1,
    paddingRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  balanceTypeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  balanceTypeText: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  cardRight: {
    alignItems: "flex-end",
    minWidth: 100,
  },
  cardLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
    textAlign: "right",
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    textAlign: "right",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  actionButton: {
    flex: 1,
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  whatsappButton: {
    backgroundColor: "#25D366",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
