import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { AuditStackParamList } from "./types";

import AuditDashboardScreen from "../features/audit/screens/AuditDashboardScreen";
import AuditTrailScreen from "../features/audit/screens/AuditTrailScreen";

const Stack = createNativeStackNavigator<AuditStackParamList>();

export default function AuditNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#f5f5f5" },
        animation: "slide_from_right",
      }}>
      <Stack.Screen name="AuditDashboard" component={AuditDashboardScreen} />
      <Stack.Screen name="AuditTrail" component={AuditTrailScreen} />
    </Stack.Navigator>
  );
}
