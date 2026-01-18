import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../context/AuthContext";
import InventoryOverview from "../components/inventory/InventoryOverview";
import QuickActions from "../components/inventory/QuickActions";
import ProductsSection from "../components/inventory/ProductsSection";
import CategorySection from "../components/inventory/CategorySection";
import StockManagement from "../components/inventory/StockManagement";
import UnitsAndReports from "../components/inventory/UnitsAndReports";

export default function InventoryScreen() {
  const { user, tenant } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#3c2c64" translucent={false} />
      <AppHeader
        businessName={tenant?.name}
        userName={user?.name}
        userRole={user?.role}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <InventoryOverview />
        <QuickActions />
        <ProductsSection />
        <CategorySection />
        <StockManagement />
        <UnitsAndReports />

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3c2c64",
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
