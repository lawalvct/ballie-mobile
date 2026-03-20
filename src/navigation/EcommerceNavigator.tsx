import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { EcommerceStackParamList } from "./types";

import EcommerceDashboardScreen from "../features/ecommerce/screens/EcommerceDashboardScreen";
import OrderListScreen from "../features/ecommerce/screens/OrderListScreen";
import OrderDetailScreen from "../features/ecommerce/screens/OrderDetailScreen";
import EcommerceSettingsScreen from "../features/ecommerce/screens/EcommerceSettingsScreen";
import ShippingMethodsScreen from "../features/ecommerce/screens/ShippingMethodsScreen";
import ShippingMethodFormScreen from "../features/ecommerce/screens/ShippingMethodFormScreen";
import CouponListScreen from "../features/ecommerce/screens/CouponListScreen";
import CouponFormScreen from "../features/ecommerce/screens/CouponFormScreen";
import CouponDetailScreen from "../features/ecommerce/screens/CouponDetailScreen";
import PayoutDashboardScreen from "../features/ecommerce/screens/PayoutDashboardScreen";
import PayoutRequestScreen from "../features/ecommerce/screens/PayoutRequestScreen";
import PayoutDetailScreen from "../features/ecommerce/screens/PayoutDetailScreen";
import EcommerceReportsScreen from "../features/ecommerce/screens/EcommerceReportsScreen";
import OrderReportScreen from "../features/ecommerce/screens/OrderReportScreen";
import RevenueReportScreen from "../features/ecommerce/screens/RevenueReportScreen";
import ProductReportScreen from "../features/ecommerce/screens/ProductReportScreen";
import CustomerReportScreen from "../features/ecommerce/screens/CustomerReportScreen";
import AbandonedCartReportScreen from "../features/ecommerce/screens/AbandonedCartReportScreen";

const Stack = createNativeStackNavigator<EcommerceStackParamList>();

export default function EcommerceNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#f5f5f5" },
        animation: "slide_from_right",
      }}>
      <Stack.Screen
        name="EcommerceDashboard"
        component={EcommerceDashboardScreen}
      />
      <Stack.Screen name="OrderList" component={OrderListScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen
        name="EcommerceSettings"
        component={EcommerceSettingsScreen}
      />
      <Stack.Screen name="ShippingMethods" component={ShippingMethodsScreen} />
      <Stack.Screen
        name="ShippingMethodForm"
        component={ShippingMethodFormScreen}
      />
      <Stack.Screen name="CouponList" component={CouponListScreen} />
      <Stack.Screen name="CouponForm" component={CouponFormScreen} />
      <Stack.Screen name="CouponDetail" component={CouponDetailScreen} />
      <Stack.Screen name="PayoutDashboard" component={PayoutDashboardScreen} />
      <Stack.Screen name="PayoutRequest" component={PayoutRequestScreen} />
      <Stack.Screen name="PayoutDetail" component={PayoutDetailScreen} />
      <Stack.Screen
        name="EcommerceReports"
        component={EcommerceReportsScreen}
      />
      <Stack.Screen name="OrderReport" component={OrderReportScreen} />
      <Stack.Screen name="RevenueReport" component={RevenueReportScreen} />
      <Stack.Screen name="ProductReport" component={ProductReportScreen} />
      <Stack.Screen name="CustomerReport" component={CustomerReportScreen} />
      <Stack.Screen
        name="AbandonedCartReport"
        component={AbandonedCartReportScreen}
      />
    </Stack.Navigator>
  );
}
