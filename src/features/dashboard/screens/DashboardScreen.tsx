import React, { useCallback, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { MainTabParamList } from "../../../navigation/types";

import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../theme/colors";
import { useDashboard, useDismissTour } from "../hooks/useDashboard";
import { useBusiness } from "../../../context/BusinessContext";
import { useAuth } from "../../../context/AuthContext";
import AppHeader from "../../../components/AppHeader";

import type {
  DashboardData,
  Alert as DashAlert,
  Transaction,
  TopProduct,
  TopCustomer,
  OutstandingInvoiceItem,
  RevenueBreakdownItem,
} from "../types";

type Nav = BottomTabNavigationProp<MainTabParamList, "Dashboard">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Currency Formatter ──────────────────────────────────────────────────────
function formatCurrency(value: number, symbol = "₦"): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${symbol}${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${symbol}${(value / 1_000).toFixed(0)}K`;
  }
  return `${symbol}${value.toLocaleString()}`;
}

function formatFullCurrency(value: number, symbol = "₦"): string {
  return `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ─── Transaction Type Colors ─────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  SV: SEMANTIC_COLORS.success,
  SALES: SEMANTIC_COLORS.success,
  PUR: "#f59e0b",
  EXP: "#ef4444",
  PV: "#ef4444",
  RV: "#3b82f6",
  JV: "#6b7280",
};

// ─── Alert Severity ──────────────────────────────────────────────────────────
const SEVERITY_CONFIG: Record<string, { bg: string; icon: string }> = {
  critical: { bg: "#fef2f2", icon: "🔴" },
  warning: { bg: "#fffbeb", icon: "🟡" },
  info: { bg: "#eff6ff", icon: "🔵" },
};

// ─── Breakdown Colors ────────────────────────────────────────────────────────
const BREAKDOWN_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

// Module-level flag so flash alerts only show once per app launch
let hasShownAlerts = false;

export default function DashboardScreen() {
  const { data, isLoading, isRefetching, refetch } = useDashboard();
  const { getLabel, isHidden, modules } = useBusiness();
  const { user, tenant } = useAuth();
  const dismissTour = useDismissTour();
  const navigation = useNavigation<Nav>();

  // Flash alert animation state
  const flashAlerts = data?.alerts ?? [];
  const shouldShowFlash = flashAlerts.length > 0 && !hasShownAlerts;
  const flashAnims = useRef<Animated.Value[]>([]);

  // Ensure we have an Animated.Value per alert
  if (flashAnims.current.length !== flashAlerts.length) {
    flashAnims.current = flashAlerts.map(() => new Animated.Value(SCREEN_WIDTH));
  }

  useEffect(() => {
    if (!shouldShowFlash) return;
    hasShownAlerts = true;

    // Stagger entrance: slide in from right
    const enterAnims = flashAnims.current.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 0,
        duration: 350,
        delay: i * 150,
        useNativeDriver: true,
      })
    );
    Animated.stagger(150, enterAnims).start(() => {
      // After 4 seconds, slide out to the right
      const exitTimer = setTimeout(() => {
        const exitAnims = flashAnims.current.map((anim, i) =>
          Animated.timing(anim, {
            toValue: SCREEN_WIDTH,
            duration: 300,
            delay: i * 100,
            useNativeDriver: true,
          })
        );
        Animated.stagger(100, exitAnims).start();
      }, 4000);
      return () => clearTimeout(exitTimer);
    });
  }, [shouldShowFlash]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading || !data) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar style="light" />
        <AppHeader
          businessName={tenant?.name}
          userName={user?.name}
        />
        <View style={[styles.body, { alignItems: "center", paddingTop: 80 }]}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={{ color: "#6b7280", marginTop: 12, fontSize: 14 }}>
            Loading dashboard…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const {
    metrics,
    counts,
    balances,
    charts,
    inventory,
    pos,
    alerts,
    top_products,
    top_customers,
    outstanding_invoices,
    recent_transactions,
    show_tour,
  } = data;

  const salesLabel = getLabel("sales", "Sales") ?? "Sales";
  const customerLabel = getLabel("customers", "Customers") ?? "Customers";
  const productLabel = getLabel("products", "Products") ?? "Products";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="light" />

      {/* Header */}
      <AppHeader
        businessName={tenant?.name}
        userName={user?.name}
      />

      {/* Flash Alerts Overlay */}
      {shouldShowFlash && (
        <View style={styles.flashContainer} pointerEvents="none">
          {flashAlerts.slice(0, 3).map((a, i) => {
            const cfg = SEVERITY_CONFIG[a.severity] ?? SEVERITY_CONFIG.info;
            return (
              <Animated.View
                key={i}
                style={[
                  styles.flashAlert,
                  { backgroundColor: cfg.bg },
                  { transform: [{ translateX: flashAnims.current[i] }] },
                ]}>
                <Text style={styles.alertIcon}>{cfg.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertTitle}>{a.title}</Text>
                  <Text style={styles.alertMsg}>{a.message}</Text>
                </View>
              </Animated.View>
            );
          })}
        </View>
      )}

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={BRAND_COLORS.gold}
            colors={[BRAND_COLORS.gold]}
          />
        }>
        {/* ── Tour Banner ─────────────────────────────────────── */}
        {show_tour && (
          <View style={styles.tourBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tourTitle}>👋 Welcome to Ballie!</Text>
              <Text style={styles.tourText}>
                Your business dashboard is ready. Explore the modules to get started.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => dismissTour.mutate(undefined)}
              style={styles.tourDismiss}>
              <Text style={styles.tourDismissText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Metric Cards ────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, styles.financialOverviewTitle]}>Financial Overview</Text>
        <View style={styles.metricsGrid}>
          {/* Revenue */}
          <LinearGradient
            colors={[SEMANTIC_COLORS.success, "#69a2a4"]}
            style={[styles.metricCard, styles.metricCardLarge]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Text style={styles.metricLabel}>Monthly Revenue</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(metrics.monthly_revenue)}
            </Text>
            <Text style={styles.metricChange}>
              {metrics.revenue_growth >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(metrics.revenue_growth).toFixed(1)}% from last month
            </Text>
          </LinearGradient>

          <View style={styles.smallRow}>
            {/* Expenses */}
            <LinearGradient
              colors={["#ef4444", "#dc2626"]}
              style={[styles.metricCard, styles.metricCardSmall]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Text style={styles.metricLabel}>Expenses</Text>
              <Text style={styles.metricValueSm}>
                {formatCurrency(metrics.monthly_expenses)}
              </Text>
            </LinearGradient>

            {/* Net Profit */}
            <LinearGradient
              colors={
                metrics.net_profit >= 0
                  ? [BRAND_COLORS.gold, "#c9a556"]
                  : ["#ef4444", "#dc2626"]
              }
              style={[styles.metricCard, styles.metricCardSmall]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Text style={styles.metricLabel}>Net Profit</Text>
              <Text style={styles.metricValueSm}>
                {formatCurrency(metrics.net_profit)}
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.smallRow}>
            {/* Sales count */}
            <LinearGradient
              colors={[BRAND_COLORS.blue, "#1e4f7a"]}
              style={[styles.metricCard, styles.metricCardSmall]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Text style={styles.metricLabel}>{salesLabel} Count</Text>
              <Text style={styles.metricValueSm}>
                {metrics.total_sales_count}
              </Text>
            </LinearGradient>

            {/* Customers / Clients */}
            <LinearGradient
              colors={[BRAND_COLORS.purple, BRAND_COLORS.violet]}
              style={[styles.metricCard, styles.metricCardSmall]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Text style={styles.metricLabel}>{customerLabel}</Text>
              <Text style={styles.metricValueSm}>{counts.total_customers}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* ── Revenue Chart (bars) ────────────────────────────── */}
        {charts.revenue_vs_expenses && (
          <RevenueChartSection chart={charts.revenue_vs_expenses} />
        )}

        {/* ── Daily Revenue Sparkline ─────────────────────────── */}
        {charts.daily_revenue && charts.daily_revenue.length > 0 && (
          <DailyRevenueSection data={charts.daily_revenue} />
        )}

        {/* ── Revenue Breakdown ───────────────────────────────── */}
        {charts.revenue_breakdown && charts.revenue_breakdown.length > 0 && (
          <RevenueBreakdownSection items={charts.revenue_breakdown} />
        )}

        {/* ── Account Balances ────────────────────────────────── */}
        <BalancesSection balances={balances} />

        {/* ── POS Today (conditional) ─────────────────────────── */}
        {modules.pos && !isHidden("pos") && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's POS Sales</Text>
            <View style={styles.posCard}>
              <View style={styles.posLeft}>
                <Text style={styles.posIcon}>💳</Text>
                <View>
                  <Text style={styles.posAmount}>
                    {formatFullCurrency(pos.today_sales)}
                  </Text>
                  <Text style={styles.posCount}>
                    {pos.today_sales_count} sale{pos.today_sales_count !== 1 ? "s" : ""} today
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.posBtn}
                onPress={() => navigation.navigate("POS", { screen: "POSHome" } as any)}>
                <Text style={styles.posBtnText}>Open POS</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Inventory Alerts (conditional) ──────────────────── */}
        {modules.inventory && !isHidden("stock") && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {getLabel("stock", "Inventory") ?? "Inventory"} Status
            </Text>
            <View style={styles.inventoryRow}>
              <View style={[styles.inventoryCard, { borderLeftColor: "#f59e0b" }]}>
                <Text style={styles.inventoryNum}>{inventory.low_stock_count}</Text>
                <Text style={styles.inventoryLabel}>
                  {getLabel("low_stock", "Low Stock") ?? "Low Stock"}
                </Text>
              </View>
              <View style={[styles.inventoryCard, { borderLeftColor: "#ef4444" }]}>
                <Text style={styles.inventoryNum}>{inventory.out_of_stock_count}</Text>
                <Text style={styles.inventoryLabel}>Out of Stock</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Top Products (conditional) ──────────────────────── */}
        {modules.inventory && !isHidden("products") && top_products.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top {productLabel}</Text>
            <View style={styles.card}>
              {top_products.slice(0, 5).map((p, i) => (
                <TopProductRow key={p.product_id} product={p} rank={i + 1} />
              ))}
            </View>
          </View>
        )}

        {/* ── Top Customers ───────────────────────────────────── */}
        {!isHidden("customers") && top_customers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top {customerLabel}</Text>
            <View style={styles.card}>
              {top_customers.slice(0, 5).map((c, i) => (
                <TopCustomerRow key={c.id} customer={c} rank={i + 1} />
              ))}
            </View>
          </View>
        )}

        {/* ── Outstanding Invoices ────────────────────────────── */}
        {outstanding_invoices.count > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Outstanding {getLabel("invoice", "Invoice") ?? "Invoice"}s
              </Text>
              <View style={styles.outBadge}>
                <Text style={styles.outBadgeText}>{outstanding_invoices.count}</Text>
              </View>
            </View>
            <View style={styles.card}>
              <View style={styles.outTotal}>
                <Text style={styles.outTotalLabel}>Total Outstanding</Text>
                <Text style={styles.outTotalValue}>
                  {formatFullCurrency(outstanding_invoices.total)}
                </Text>
              </View>
              {outstanding_invoices.items.slice(0, 4).map((inv) => (
                <InvoiceRow key={inv.id} item={inv} />
              ))}
            </View>
          </View>
        )}

        {/* ── Recent Transactions ─────────────────────────────── */}
        {recent_transactions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <View style={styles.card}>
              {recent_transactions.slice(0, 8).map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function RevenueChartSection({
  chart,
}: {
  chart: { labels: string[]; revenue: number[]; expenses: number[] };
}) {
  const maxVal = Math.max(...chart.revenue, ...chart.expenses, 1);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Revenue vs Expenses</Text>
      <View style={styles.card}>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: SEMANTIC_COLORS.success }]} />
            <Text style={styles.legendText}>Revenue</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#ef4444" }]} />
            <Text style={styles.legendText}>Expenses</Text>
          </View>
        </View>

        {chart.labels.map((label, i) => {
          const rPct = (chart.revenue[i] / maxVal) * 100;
          const ePct = (chart.expenses[i] / maxVal) * 100;
          return (
            <View key={label} style={styles.barRow}>
              <Text style={styles.barLabel}>{label.substring(0, 3)}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${Math.max(rPct, 2)}%`,
                      backgroundColor: SEMANTIC_COLORS.success,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${Math.max(ePct, 2)}%`,
                      backgroundColor: "#ef4444",
                      marginTop: 3,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function DailyRevenueSection({
  data,
}: {
  data: { date: string; amount: number }[];
}) {
  const maxVal = Math.max(...data.map((d) => d.amount), 1);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Daily Revenue</Text>
      <View style={styles.card}>
        <View style={styles.sparkContainer}>
          {data.map((d, i) => {
            const pct = (d.amount / maxVal) * 100;
            return (
              <View key={i} style={styles.sparkCol}>
                <View
                  style={[
                    styles.sparkBar,
                    {
                      height: `${Math.max(pct, 4)}%`,
                      backgroundColor:
                        i === data.length - 1
                          ? BRAND_COLORS.gold
                          : "rgba(209,176,94,0.4)",
                    },
                  ]}
                />
                {i % 3 === 0 && (
                  <Text style={styles.sparkLabel}>{d.date}</Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function RevenueBreakdownSection({
  items,
}: {
  items: RevenueBreakdownItem[];
}) {
  const total = items.reduce((sum, it) => sum + it.total, 0) || 1;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Revenue Breakdown</Text>
      <View style={styles.card}>
        {/* Horizontal bar segments */}
        <View style={styles.breakdownBar}>
          {items.map((it, i) => (
            <View
              key={it.code}
              style={{
                flex: it.total / total,
                height: 16,
                backgroundColor: BREAKDOWN_COLORS[i % BREAKDOWN_COLORS.length],
                borderTopLeftRadius: i === 0 ? 8 : 0,
                borderBottomLeftRadius: i === 0 ? 8 : 0,
                borderTopRightRadius: i === items.length - 1 ? 8 : 0,
                borderBottomRightRadius: i === items.length - 1 ? 8 : 0,
              }}
            />
          ))}
        </View>

        {/* Legend */}
        {items.map((it, i) => (
          <View key={it.code} style={styles.breakdownRow}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: BREAKDOWN_COLORS[i % BREAKDOWN_COLORS.length] },
              ]}
            />
            <Text style={styles.breakdownName} numberOfLines={1}>
              {it.name}
            </Text>
            <Text style={styles.breakdownVal}>
              {formatCurrency(it.total)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function BalancesSection({
  balances,
}: {
  balances: { cash_balance: number; receivables: number; payables: number };
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Account Balances</Text>
      <View style={styles.balancesRow}>
        <BalanceCard
          label="Cash"
          amount={balances.cash_balance}
          color={SEMANTIC_COLORS.success}
          icon="💵"
        />
        <BalanceCard
          label="Receivables"
          amount={balances.receivables}
          color="#3b82f6"
          icon="📥"
        />
        <BalanceCard
          label="Payables"
          amount={balances.payables}
          color="#ef4444"
          icon="📤"
        />
      </View>
    </View>
  );
}

function BalanceCard({
  label,
  amount,
  color,
  icon,
}: {
  label: string;
  amount: number;
  color: string;
  icon: string;
}) {
  return (
    <View style={[styles.balanceCard, { borderTopColor: color }]}>
      <Text style={styles.balanceIcon}>{icon}</Text>
      <Text style={styles.balanceAmount}>{formatCurrency(amount)}</Text>
      <Text style={styles.balanceLabel}>{label}</Text>
    </View>
  );
}

function TopProductRow({ product, rank }: { product: TopProduct; rank: number }) {
  return (
    <View style={styles.listRow}>
      <Text style={styles.rank}>{rank}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.listName} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.listSub}>{product.quantity_sold} sold</Text>
      </View>
      <Text style={styles.listAmount}>{formatCurrency(product.revenue)}</Text>
    </View>
  );
}

function TopCustomerRow({ customer, rank }: { customer: TopCustomer; rank: number }) {
  return (
    <View style={styles.listRow}>
      <Text style={styles.rank}>{rank}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.listName} numberOfLines={1}>
          {customer.name}
        </Text>
        {customer.outstanding > 0 && (
          <Text style={[styles.listSub, { color: "#ef4444" }]}>
            Outstanding: {formatCurrency(customer.outstanding)}
          </Text>
        )}
      </View>
      <Text style={styles.listAmount}>{formatCurrency(customer.spent)}</Text>
    </View>
  );
}

function InvoiceRow({ item }: { item: OutstandingInvoiceItem }) {
  return (
    <View style={styles.listRow}>
      <Text style={[styles.listName, { flex: 0 }]}>{item.number}</Text>
      <View style={{ flex: 1 }} />
      <Text style={styles.listAmount}>{formatCurrency(item.amount)}</Text>
    </View>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const color = TYPE_COLORS[tx.type_code] ?? "#6b7280";
  const isIncome = ["SV", "SALES", "RV"].includes(tx.type_code);
  const dateStr = new Date(tx.date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <View style={styles.txRow}>
      <View style={[styles.txDot, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.txNumber}>{tx.number}</Text>
        <Text style={styles.txType}>{tx.type}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={[styles.txAmount, { color }]}>
          {isIncome ? "+" : "-"}
          {formatCurrency(tx.amount)}
        </Text>
        <Text style={styles.txDate}>{dateStr}</Text>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#3c2c64" },

  body: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -1,
  },
  bodyContent: { paddingTop: 20, paddingBottom: 24 },

  // ── Flash Alerts ──
  flashContainer: {
    position: "absolute",
    top: 100,
    right: 0,
    left: 0,
    zIndex: 100,
    paddingHorizontal: 16,
    gap: 8,
  },
  flashAlert: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  financialOverviewTitle: {
    paddingHorizontal: 20,
    marginTop: 4,
  },

  section: { paddingHorizontal: 20, marginTop: 18 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: -4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 12,
  },

  // ── Tour Banner ──
  tourBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: BRAND_COLORS.gold,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  tourTitle: { fontSize: 15, fontWeight: "700", color: "#1a0f33", marginBottom: 4 },
  tourText: { fontSize: 13, color: "#1a0f33", opacity: 0.8 },
  tourDismiss: { padding: 4, marginLeft: 8 },
  tourDismissText: { fontSize: 18, color: "#1a0f33", fontWeight: "700" },

  // ── Alerts ──
  alertIcon: { fontSize: 18 },
  alertTitle: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  alertMsg: { fontSize: 12, color: "#6b7280", marginTop: 2 },

  // ── Metrics ──
  metricsGrid: { paddingHorizontal: 20, gap: 10 },
  metricCard: {
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  metricCardLarge: { minHeight: 110 },
  metricCardSmall: { flex: 1, minHeight: 90 },
  smallRow: { flexDirection: "row", gap: 10 },
  metricLabel: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 6 },
  metricValue: { fontSize: 30, fontWeight: "800", color: "#fff" },
  metricValueSm: { fontSize: 20, fontWeight: "800", color: "#fff" },
  metricChange: { fontSize: 12, color: "rgba(255,255,255,0.9)", marginTop: 4, fontWeight: "600" },

  // ── Chart (bars) ──
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  chartLegend: { flexDirection: "row", gap: 16, marginBottom: 14 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: "#6b7280" },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  barLabel: { width: 32, fontSize: 11, color: "#6b7280", fontWeight: "600" },
  barTrack: { flex: 1 },
  bar: { height: 8, borderRadius: 4 },

  // ── Sparkline ──
  sparkContainer: { flexDirection: "row", alignItems: "flex-end", height: 100, gap: 2 },
  sparkCol: { flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end" },
  sparkBar: { width: "80%", borderRadius: 3, minHeight: 4 },
  sparkLabel: { fontSize: 8, color: "#9ca3af", marginTop: 4 },

  // ── Breakdown ──
  breakdownBar: { flexDirection: "row", borderRadius: 8, overflow: "hidden", marginBottom: 14 },
  breakdownRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  breakdownName: { flex: 1, fontSize: 13, color: "#374151" },
  breakdownVal: { fontSize: 13, fontWeight: "600", color: "#1f2937" },

  // ── Balances ──
  balancesRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20 },
  balanceCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderTopWidth: 3,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  balanceIcon: { fontSize: 20, marginBottom: 6 },
  balanceAmount: { fontSize: 15, fontWeight: "700", color: "#1f2937", marginBottom: 2 },
  balanceLabel: { fontSize: 11, color: "#6b7280" },

  // ── POS ──
  posCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  posLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  posIcon: { fontSize: 28 },
  posAmount: { fontSize: 18, fontWeight: "700", color: "#1f2937" },
  posCount: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  posBtn: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  posBtnText: { fontSize: 13, fontWeight: "700", color: "#1a0f33" },

  // ── Inventory ──
  inventoryRow: { flexDirection: "row", gap: 10 },
  inventoryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    alignItems: "center",
  },
  inventoryNum: { fontSize: 24, fontWeight: "800", color: "#1f2937" },
  inventoryLabel: { fontSize: 12, color: "#6b7280", marginTop: 4 },

  // ── Lists ──
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f3f4f6",
    gap: 10,
  },
  rank: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: BRAND_COLORS.darkPurple,
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 22,
    overflow: "hidden",
  },
  listName: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  listSub: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  listAmount: { fontSize: 14, fontWeight: "700", color: BRAND_COLORS.darkPurple },

  // ── Outstanding ──
  outBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  outBadgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  outTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f3f4f6",
    marginBottom: 4,
  },
  outTotalLabel: { fontSize: 13, color: "#6b7280" },
  outTotalValue: { fontSize: 15, fontWeight: "700", color: "#ef4444" },

  // ── Transactions ──
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f3f4f6",
    gap: 10,
  },
  txDot: { width: 10, height: 10, borderRadius: 5 },
  txNumber: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  txType: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: "700" },
  txDate: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
});
