import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "./types";
import { BRAND_COLORS } from "../theme/colors";

// Main Accounting Screen
import AccountingScreen from "../screens/AccountingScreen";
import LedgerAccountListScreen from "../screens/LedgerAccountListScreen";
// Account Groups Feature
import {
  AccountGroupHomeScreen,
  AccountGroupCreateScreen,
  AccountGroupShowScreen,
  AccountGroupEditScreen,
} from "../features/accounting/accountgroup";

const Stack = createNativeStackNavigator<AccountingStackParamList>();

export default function AccountingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // We'll use custom headers in each screen
        contentStyle: { backgroundColor: BRAND_COLORS.background },
        animation: "slide_from_right",
      }}>
      {/* Main Accounting Home - shows all accounting modules */}
      <Stack.Screen
        name="AccountingHome"
        component={AccountingScreen}
        options={{ title: "Accounting" }}
      />

      {/* Account Groups Module */}
      <Stack.Screen
        name="AccountGroupList"
        component={AccountGroupHomeScreen}
        options={{ title: "Account Groups" }}
      />
      <Stack.Screen
        name="AccountGroupCreate"
        component={AccountGroupCreateScreen}
        options={{ title: "Create Account Group" }}
      />
      <Stack.Screen
        name="AccountGroupShow"
        component={AccountGroupShowScreen}
        options={{ title: "Account Group Details" }}
      />
      <Stack.Screen
        name="AccountGroupEdit"
        component={AccountGroupEditScreen}
        options={{ title: "Edit Account Group" }}
      />

      {/* Ledger Accounts Module - Placeholder */}
      <Stack.Screen
        name="LedgerAccountList"
        component={LedgerAccountListScreen}
        options={{ title: "Ledger Accounts" }}
      />
      {/*
      <Stack.Screen name="LedgerAccountCreate" component={LedgerAccountCreateScreen} />
      <Stack.Screen name="LedgerAccountShow" component={LedgerAccountShowScreen} />
      <Stack.Screen name="LedgerAccountEdit" component={LedgerAccountEditScreen} />
      */}

      {/* Journal Entries Module - Placeholder for future */}
      {/*
      <Stack.Screen name="JournalEntryList" component={JournalEntryListScreen} />
      <Stack.Screen name="JournalEntryCreate" component={JournalEntryCreateScreen} />
      <Stack.Screen name="JournalEntryShow" component={JournalEntryShowScreen} />
      <Stack.Screen name="JournalEntryEdit" component={JournalEntryEditScreen} />
      */}
    </Stack.Navigator>
  );
}
