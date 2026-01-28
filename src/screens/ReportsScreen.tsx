import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import AppHeader from "../components/AppHeader";
import ReportsHeader from "../components/reports/ReportsHeader";
import ReportCategory from "../components/reports/ReportCategory";
import type { ReportsStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<ReportsStackParamList, "ReportsHome">;

type ReportRouteName = Exclude<keyof ReportsStackParamList, "ReportsHome">;

type ReportItem = {
  name: string;
  icon: string;
  routeName?: ReportRouteName;
};

export default function ReportsScreen({ navigation }: Props) {
  const { user, tenant } = useAuth();

  const financialReports: ReportItem[] = [
    { name: "Profit & Loss Statement", icon: "📈" },
    { name: "Balance Sheet", icon: "📊" },
    { name: "Cash Flow Statement", icon: "💰" },
    { name: "Trial Balance", icon: "⚖️" },
  ];

  const salesReports: ReportItem[] = [
    {
      name: "Sales Summary Report",
      icon: "🛒",
      routeName: "SalesSummaryReport",
    },
    {
      name: "Customer Sales Report",
      icon: "👥",
      routeName: "SalesCustomersReport",
    },
    {
      name: "Product Sales Report",
      icon: "📦",
      routeName: "SalesProductsReport",
    },
    {
      name: "Sales by Period",
      icon: "📅",
      routeName: "SalesByPeriodReport",
    },
  ];

  const purchaseReports: ReportItem[] = [
    {
      name: "Purchase Summary Report",
      icon: "🛍️",
      routeName: "PurchaseSummaryReport",
    },
    {
      name: "Vendor Purchase Report",
      icon: "🏪",
      routeName: "PurchaseVendorsReport",
    },
    {
      name: "Product Purchase Report",
      icon: "📦",
      routeName: "PurchaseProductsReport",
    },
    {
      name: "Purchase by Period",
      icon: "📅",
      routeName: "PurchaseByPeriodReport",
    },
  ];

  const inventoryReports: ReportItem[] = [
    { name: "Stock Summary Report", icon: "📊" },
    { name: "Low Stock Alert Report", icon: "⚠️" },
    { name: "Stock Valuation Report", icon: "💵" },
    { name: "Stock Movement Report", icon: "📦" },
  ];

  const payrollReports: ReportItem[] = [
    { name: "Payroll Summary Report", icon: "💳" },
    { name: "Payroll Tax Report", icon: "📋" },
    { name: "Employee Payroll Summary", icon: "👤" },
    { name: "Bank Payment Schedule", icon: "🏦" },
  ];

  const crmReports: ReportItem[] = [
    { name: "Customer Account Statement", icon: "📄" },
    { name: "Payment Reports", icon: "💰" },
    { name: "Sales Analysis Report", icon: "📈" },
    { name: "Customer Activity Summary", icon: "📊" },
  ];

  const posReports: ReportItem[] = [
    { name: "Daily Sales Report", icon: "📅" },
    { name: "Product Performance Report", icon: "🏆" },
    { name: "Transaction History", icon: "🧾" },
    { name: "POS Overview Report", icon: "🖥️" },
  ];

  const ecommerceReports: ReportItem[] = [
    { name: "Orders Report", icon: "📦" },
    { name: "Revenue Report", icon: "💰" },
    { name: "Product Performance", icon: "📊" },
    { name: "Customer Analytics", icon: "👥" },
    { name: "Abandoned Carts Report", icon: "🛒" },
  ];

  const handleReportPress = (report: ReportItem) => {
    if (!report.routeName) {
      return;
    }
    navigation.navigate(report.routeName);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#3c2c64" translucent={false} />
      <AppHeader
        businessName={tenant?.name}
        userName={user?.name}
        userRole={user?.role}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ReportsHeader />

        <ReportCategory
          title="Financial Reports"
          subtitle="View financial performance and health"
          reports={financialReports}
          iconColor="#8b5cf6"
          onReportPress={handleReportPress}
        />

        <ReportCategory
          title="Sales Reports"
          subtitle="Track sales performance and trends"
          reports={salesReports}
          iconColor="#10b981"
          onReportPress={handleReportPress}
        />

        <ReportCategory
          title="Purchase Reports"
          subtitle="Monitor purchasing activities"
          reports={purchaseReports}
          iconColor="#f59e0b"
          onReportPress={handleReportPress}
        />

        <ReportCategory
          title="Inventory Reports"
          subtitle="Analyze stock levels and movements"
          reports={inventoryReports}
          iconColor="#3b82f6"
          onReportPress={handleReportPress}
        />

        <ReportCategory
          title="Payroll Reports"
          subtitle="Review employee compensation"
          reports={payrollReports}
          iconColor="#ef4444"
          onReportPress={handleReportPress}
        />

        <ReportCategory
          title="CRM Reports"
          subtitle="Understand customer relationships"
          reports={crmReports}
          iconColor="#6366f1"
          onReportPress={handleReportPress}
        />

        <ReportCategory
          title="POS Reports"
          subtitle="Track point of sale activities"
          reports={posReports}
          iconColor="#ec4899"
          onReportPress={handleReportPress}
        />

        <ReportCategory
          title="E-commerce Reports"
          subtitle="Analyze online store performance"
          reports={ecommerceReports}
          iconColor="#14b8a6"
          onReportPress={handleReportPress}
        />

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3c2c64",
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
