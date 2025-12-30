import { useNavigation } from "@react-navigation/native";

import LedgerAccountHomeScreen from "../screens/LedgerAccountHomeScreen";
import AccountingActionsScreen from "../screens/AccountingActionsScreen";
// Account Groups Feature
import {
  AccountGroupHomeScreen,
  AccountGroupCreateScreen,
  AccountGroupShowScreen,
  AccountGroupEditScreen,
} from "../features/accounting/accountgroup";
// Ledger Accounts Feature
import {
  LedgerAccountCreateScreen,
  LedgerAccountEditScreen,
  LedgerAccountShowScreen,
} from "../features/accounting/ledgeraccount";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "./types";
import { BRAND_COLORS } from "../theme/colors";
import AccountingScreen from "../screens/AccountingScreen";
import { useEffect } from "react";

const Stack = createNativeStackNavigator<AccountingStackParamList>();

function AccountingStack() {
  const navigation = useNavigation();

  useEffect(() => {
    // Reset to AccountingHome when tab is pressed
    const unsubscribe = navigation.addListener("tabPress" as any, (_e) => {
      // Reset the stack to AccountingHome
      navigation.reset({
        index: 0,
        routes: [{ name: "AccountingHome" as any }],
      });
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // We'll use custom headers in each screen
        contentStyle: { backgroundColor: "#f5f5f5" },
        animation: "slide_from_right",
      }}>
      {/* Main Accounting Home - shows all accounting modules */}
      <Stack.Screen
        name="AccountingHome"
        component={AccountingScreen}
        options={{ title: "Accounting" }}
      />

      {/* All Accounting Actions Screen */}
      <Stack.Screen
        name="AccountingActions"
        component={AccountingActionsScreen}
        options={{ title: "All Accounting Actions" }}
      />

      {/* Account Groups Module */}
      <Stack.Screen
        name="AccountGroupHome"
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
        name="LedgerAccountHome"
        component={LedgerAccountHomeScreen}
        options={{ title: "Ledger Accounts" }}
      />
      <Stack.Screen
        name="LedgerAccountCreate"
        component={LedgerAccountCreateScreen}
        options={{ title: "Create Ledger Account" }}
      />
      <Stack.Screen
        name="LedgerAccountEdit"
        component={LedgerAccountEditScreen}
        options={{ title: "Edit Ledger Account" }}
      />
      <Stack.Screen
        name="LedgerAccountShow"
        component={LedgerAccountShowScreen}
        options={{ title: "Ledger Account Details" }}
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

export default function AccountingNavigator() {
  return <AccountingStack />;
}
