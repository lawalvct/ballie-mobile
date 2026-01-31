import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { ReportsStackParamList } from "./types";
import ReportsScreen from "../screens/ReportsScreen";
import ProfitLossReportScreen from "../features/reports/financial/screens/ProfitLossReportScreen";
import BalanceSheetReportScreen from "../features/reports/financial/screens/BalanceSheetReportScreen";
import TrialBalanceReportScreen from "../features/reports/financial/screens/TrialBalanceReportScreen";
import CashFlowReportScreen from "../features/reports/financial/screens/CashFlowReportScreen";
import StockSummaryReportScreen from "../features/reports/inventory/screens/StockSummaryReportScreen";
import LowStockAlertReportScreen from "../features/reports/inventory/screens/LowStockAlertReportScreen";
import StockValuationReportScreen from "../features/reports/inventory/screens/StockValuationReportScreen";
import StockMovementReportScreen from "../features/reports/inventory/screens/StockMovementReportScreen";
import BinCardReportScreen from "../features/reports/inventory/screens/BinCardReportScreen";
import PayrollSummaryReportScreen from "../features/reports/payroll/screens/PayrollSummaryReportScreen";
import PayrollTaxReportScreen from "../features/reports/payroll/screens/PayrollTaxReportScreen";
import PayrollTaxSummaryReportScreen from "../features/reports/payroll/screens/PayrollTaxSummaryReportScreen";
import PayrollEmployeeSummaryReportScreen from "../features/reports/payroll/screens/PayrollEmployeeSummaryReportScreen";
import PayrollBankScheduleReportScreen from "../features/reports/payroll/screens/PayrollBankScheduleReportScreen";
import PayrollDetailedReportScreen from "../features/reports/payroll/screens/PayrollDetailedReportScreen";
import CustomerActivitiesReportScreen from "../features/reports/crm/screens/CustomerActivitiesReportScreen";
import CustomerStatementsReportScreen from "../features/reports/crm/screens/CustomerStatementsReportScreen";
import PaymentReportsScreen from "../features/reports/crm/screens/PaymentReportsScreen";
import SalesSummaryReportScreen from "../features/reports/sales/screens/SalesSummaryReportScreen";
import SalesCustomersReportScreen from "../features/reports/sales/screens/SalesCustomersReportScreen";
import SalesProductsReportScreen from "../features/reports/sales/screens/SalesProductsReportScreen";
import SalesByPeriodReportScreen from "../features/reports/sales/screens/SalesByPeriodReportScreen";
import PurchaseSummaryReportScreen from "../features/reports/purchases/screens/PurchaseSummaryReportScreen";
import PurchaseVendorsReportScreen from "../features/reports/purchases/screens/PurchaseVendorsReportScreen";
import PurchaseProductsReportScreen from "../features/reports/purchases/screens/PurchaseProductsReportScreen";
import PurchaseByPeriodReportScreen from "../features/reports/purchases/screens/PurchaseByPeriodReportScreen";

const Stack = createNativeStackNavigator<ReportsStackParamList>();

export default function ReportsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#f5f5f5" },
        animation: "slide_from_right",
      }}>
      <Stack.Screen name="ReportsHome" component={ReportsScreen} />
      <Stack.Screen
        name="ProfitLossReport"
        component={ProfitLossReportScreen}
      />
      <Stack.Screen
        name="BalanceSheetReport"
        component={BalanceSheetReportScreen}
      />
      <Stack.Screen
        name="TrialBalanceReport"
        component={TrialBalanceReportScreen}
      />
      <Stack.Screen name="CashFlowReport" component={CashFlowReportScreen} />
      <Stack.Screen
        name="StockSummaryReport"
        component={StockSummaryReportScreen}
      />
      <Stack.Screen
        name="LowStockAlertReport"
        component={LowStockAlertReportScreen}
      />
      <Stack.Screen
        name="StockValuationReport"
        component={StockValuationReportScreen}
      />
      <Stack.Screen
        name="StockMovementReport"
        component={StockMovementReportScreen}
      />
      <Stack.Screen name="BinCardReport" component={BinCardReportScreen} />
      <Stack.Screen
        name="PayrollSummaryReport"
        component={PayrollSummaryReportScreen}
      />
      <Stack.Screen
        name="PayrollTaxReport"
        component={PayrollTaxReportScreen}
      />
      <Stack.Screen
        name="PayrollTaxSummaryReport"
        component={PayrollTaxSummaryReportScreen}
      />
      <Stack.Screen
        name="PayrollEmployeeSummaryReport"
        component={PayrollEmployeeSummaryReportScreen}
      />
      <Stack.Screen
        name="PayrollBankScheduleReport"
        component={PayrollBankScheduleReportScreen}
      />
      <Stack.Screen
        name="PayrollDetailedReport"
        component={PayrollDetailedReportScreen}
      />
      <Stack.Screen
        name="CrmActivitiesReport"
        component={CustomerActivitiesReportScreen}
      />
      <Stack.Screen
        name="CrmCustomerStatementsReport"
        component={CustomerStatementsReportScreen}
      />
      <Stack.Screen name="CrmPaymentReports" component={PaymentReportsScreen} />
      <Stack.Screen
        name="SalesSummaryReport"
        component={SalesSummaryReportScreen}
      />
      <Stack.Screen
        name="SalesCustomersReport"
        component={SalesCustomersReportScreen}
      />
      <Stack.Screen
        name="SalesProductsReport"
        component={SalesProductsReportScreen}
      />
      <Stack.Screen
        name="SalesByPeriodReport"
        component={SalesByPeriodReportScreen}
      />
      <Stack.Screen
        name="PurchaseSummaryReport"
        component={PurchaseSummaryReportScreen}
      />
      <Stack.Screen
        name="PurchaseVendorsReport"
        component={PurchaseVendorsReportScreen}
      />
      <Stack.Screen
        name="PurchaseProductsReport"
        component={PurchaseProductsReportScreen}
      />
      <Stack.Screen
        name="PurchaseByPeriodReport"
        component={PurchaseByPeriodReportScreen}
      />
    </Stack.Navigator>
  );
}
