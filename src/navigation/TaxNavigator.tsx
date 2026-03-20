import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { TaxStackParamList } from "./types";

import TaxDashboardScreen from "../features/tax/screens/TaxDashboardScreen";
import VatReportScreen from "../features/tax/screens/VatReportScreen";
import PayeReportScreen from "../features/tax/screens/PayeReportScreen";
import PensionReportScreen from "../features/tax/screens/PensionReportScreen";
import NsitfReportScreen from "../features/tax/screens/NsitfReportScreen";
import TaxFilingHistoryScreen from "../features/tax/screens/TaxFilingHistoryScreen";
import TaxSettingsScreen from "../features/tax/screens/TaxSettingsScreen";

const Stack = createNativeStackNavigator<TaxStackParamList>();

export default function TaxNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#f5f5f5" },
        animation: "slide_from_right",
      }}>
      <Stack.Screen name="TaxDashboard" component={TaxDashboardScreen} />
      <Stack.Screen name="VatReport" component={VatReportScreen} />
      <Stack.Screen name="PayeReport" component={PayeReportScreen} />
      <Stack.Screen name="PensionReport" component={PensionReportScreen} />
      <Stack.Screen name="NsitfReport" component={NsitfReportScreen} />
      <Stack.Screen name="TaxFilings" component={TaxFilingHistoryScreen} />
      <Stack.Screen name="TaxSettings" component={TaxSettingsScreen} />
    </Stack.Navigator>
  );
}
