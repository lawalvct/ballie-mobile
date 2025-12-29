import { useNavigation } from "@react-navigation/native";

import LedgerAccountListScreen from "../screens/LedgerAccountListScreen";
// Account Groups Feature
import {
  AccountGroupHomeScreen,
  AccountGroupCreateScreen,
  AccountGroupShowScreen,
  AccountGroupEditScreen,
} from "../features/accounting/accountgroup";
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
    const unsubscribe = navigation.addListener("tabPress" as any, (e) => {
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

export default function AccountingNavigator() {
  return <AccountingStack />;
}
