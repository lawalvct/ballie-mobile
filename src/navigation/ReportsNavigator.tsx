import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { ReportsStackParamList } from "./types";
import ReportsScreen from "../screens/ReportsScreen";
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
