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
// Voucher Management Feature
import {
  VoucherHomeScreen,
  VoucherCreateScreen,
  VoucherFormScreen,
} from "../features/accounting/voucher";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "./types";
import { BRAND_COLORS } from "../theme/colors";
import AccountingScreen from "../screens/AccountingScreen";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useEffect } from "react";

// Temporary placeholder component for unimplemented screens
const PlaceholderScreen = ({ navigation, route }: any) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>Coming Soon</Text>
    <Text style={styles.placeholderText}>
      {route.name} screen is under development
    </Text>
    <TouchableOpacity
      style={styles.placeholderButton}
      onPress={() => navigation.goBack()}>
      <Text style={styles.placeholderButtonText}>Go Back</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  placeholderButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  placeholderButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
});

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

      {/* Voucher Management Module */}
      <Stack.Screen
        name="VoucherHome"
        component={VoucherHomeScreen}
        options={{ title: "Vouchers" }}
      />
      <Stack.Screen
        name="VoucherCreate"
        component={VoucherCreateScreen}
        options={{ title: "Create Voucher" }}
      />
      <Stack.Screen
        name="VoucherForm"
        component={VoucherFormScreen}
        options={{ title: "Voucher Form" }}
      />
      <Stack.Screen
        name="VoucherShow"
        component={PlaceholderScreen}
        options={{ title: "Voucher Details" }}
      />
      <Stack.Screen
        name="VoucherEdit"
        component={PlaceholderScreen}
        options={{ title: "Edit Voucher" }}
      />

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
