import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { CompanySettingsStackParamList } from "./types";

import SettingsDashboardScreen from "../features/company-settings/screens/SettingsDashboardScreen";
import CompanyInfoScreen from "../features/company-settings/screens/CompanyInfoScreen";
import BusinessDetailsScreen from "../features/company-settings/screens/BusinessDetailsScreen";
import BrandingScreen from "../features/company-settings/screens/BrandingScreen";
import PreferencesScreen from "../features/company-settings/screens/PreferencesScreen";
import ModulesScreen from "../features/company-settings/screens/ModulesScreen";

const Stack = createNativeStackNavigator<CompanySettingsStackParamList>();

export default function CompanySettingsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#f5f5f5" },
        animation: "slide_from_right",
      }}>
      <Stack.Screen name="SettingsDashboard" component={SettingsDashboardScreen} />
      <Stack.Screen name="CompanyInfo" component={CompanyInfoScreen} />
      <Stack.Screen name="BusinessDetails" component={BusinessDetailsScreen} />
      <Stack.Screen name="Branding" component={BrandingScreen} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
      <Stack.Screen name="Modules" component={ModulesScreen} />
    </Stack.Navigator>
  );
}
