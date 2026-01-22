import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { CRMStackParamList } from "./types";
import CRMScreen from "../screens/CRMScreen";
import CustomerHomeScreen from "../features/crm/customers/screens/CustomerHomeScreen";
import CustomerCreateScreen from "../features/crm/customers/screens/CustomerCreateScreen";
import CustomerShowScreen from "../features/crm/customers/screens/CustomerShowScreen";
import CustomerEditScreen from "../features/crm/customers/screens/CustomerEditScreen";
import CustomerStatementsScreen from "../features/crm/customers/screens/CustomerStatementsScreen";
import CustomerStatementDetailScreen from "../features/crm/customers/screens/CustomerStatementDetailScreen";

const Stack = createNativeStackNavigator<CRMStackParamList>();

export default function CRMNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#f5f5f5" },
        animation: "slide_from_right",
      }}>
      <Stack.Screen name="CRMHome" component={CRMScreen} />
      <Stack.Screen name="CustomerHome" component={CustomerHomeScreen} />
      <Stack.Screen name="CustomerCreate" component={CustomerCreateScreen} />
      <Stack.Screen name="CustomerShow" component={CustomerShowScreen} />
      <Stack.Screen name="CustomerEdit" component={CustomerEditScreen} />
      <Stack.Screen
        name="CustomerStatements"
        component={CustomerStatementsScreen}
      />
      <Stack.Screen
        name="CustomerStatementDetail"
        component={CustomerStatementDetailScreen}
      />
    </Stack.Navigator>
  );
}
