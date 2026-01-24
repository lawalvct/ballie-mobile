// Inventory Navigator - Stack navigator for inventory module
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { InventoryStackParamList } from "./types";

// Main Inventory Screen
import InventoryScreen from "../screens/InventoryScreen";

// Product Screens
import ProductHomeScreen from "../features/inventory/product/screens/ProductHomeScreen";
import ProductCreateScreen from "../features/inventory/product/screens/ProductCreateScreen";
import ProductShowScreen from "../features/inventory/product/screens/ProductShowScreen";
import ProductEditScreen from "../features/inventory/product/screens/ProductEditScreen";

// Category Screens
import CategoryHomeScreen from "../features/inventory/category/screens/CategoryHomeScreen";
import CategoryCreateScreen from "../features/inventory/category/screens/CategoryCreateScreen";
import CategoryShowScreen from "../features/inventory/category/screens/CategoryShowScreen";
import CategoryEditScreen from "../features/inventory/category/screens/CategoryEditScreen";

// Unit Screens
import UnitHomeScreen from "../features/inventory/unit/screens/UnitHomeScreen";
import UnitCreateScreen from "../features/inventory/unit/screens/UnitCreateScreen";
import UnitShowScreen from "../features/inventory/unit/screens/UnitShowScreen";
import UnitEditScreen from "../features/inventory/unit/screens/UnitEditScreen";

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
      <Stack.Screen name="ProductShow" component={ProductShowScreen} />
      <Stack.Screen name="ProductEdit" component={ProductEditScreen} />
      <Stack.Screen name="CategoryHome" component={CategoryHomeScreen} />
      <Stack.Screen name="CategoryCreate" component={CategoryCreateScreen} />
      <Stack.Screen name="CategoryShow" component={CategoryShowScreen} />
      <Stack.Screen name="CategoryEdit" component={CategoryEditScreen} />
      <Stack.Screen name="UnitHome" component={UnitHomeScreen} />
      <Stack.Screen name="UnitCreate" component={UnitCreateScreen} />
      <Stack.Screen name="UnitShow" component={UnitShowScreen} />
      <Stack.Screen name="UnitEdit" component={UnitEditScreen} />
    </Stack.Navigator>
  );
}
