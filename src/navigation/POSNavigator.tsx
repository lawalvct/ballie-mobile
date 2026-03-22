import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { POSStackParamList } from "./types";
import { CartProvider } from "../features/pos/context/CartContext";

import SessionScreen from "../features/pos/screens/SessionScreen";
import SaleScreen from "../features/pos/screens/SaleScreen";
import TransactionsScreen from "../features/pos/screens/TransactionsScreen";
import TransactionDetailScreen from "../features/pos/screens/TransactionDetailScreen";
import ReportsScreen from "../features/pos/screens/ReportsScreen";

const Stack = createNativeStackNavigator<POSStackParamList>();

export default function POSNavigator() {
  return (
    <CartProvider>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#f5f5f5" },
          animation: "slide_from_right",
        }}>
        <Stack.Screen name="POSSession" component={SessionScreen} />
        <Stack.Screen name="POSSale" component={SaleScreen} />
        <Stack.Screen name="POSTransactions" component={TransactionsScreen} />
        <Stack.Screen name="POSTransactionDetail" component={TransactionDetailScreen} />
        <Stack.Screen name="POSReports" component={ReportsScreen} />
      </Stack.Navigator>
    </CartProvider>
  );
}
