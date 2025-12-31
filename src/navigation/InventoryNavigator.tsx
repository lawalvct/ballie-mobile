// Inventory Navigator - Stack navigator for inventory module
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { InventoryStackParamList } from "./types";

// Main Inventory Screen
import InventoryScreen from "../screens/InventoryScreen";

// Product Screens
import ProductHomeScreen from "../features/inventory/product/screens/ProductHomeScreen";
import ProductCreateScreen from "../features/inventory/product/screens/ProductCreateScreen";

const Stack = createNativeStackNavigator<InventoryStackParamList>();

export default function InventoryNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="InventoryHome">
      <Stack.Screen name="InventoryHome" component={InventoryScreen} />
      <Stack.Screen name="ProductHome" component={ProductHomeScreen} />
      <Stack.Screen name="ProductCreate" component={ProductCreateScreen} />
    </Stack.Navigator>
  );
}
