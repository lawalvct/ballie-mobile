import React, { useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../context/AuthContext";
import CRMOverview from "../components/crm/CRMOverview";
import QuickActions from "../components/crm/QuickActions";
import CustomersSection from "../components/crm/CustomersSection";
import VendorsSection from "../components/crm/VendorsSection";
import DocumentsSection from "../components/crm/DocumentsSection";
import StatementsAndPayments from "../components/crm/StatementsAndPayments";

export default function CRMScreen() {
  const { user, tenant } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh - in a real app, you might reload data from APIs
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#3c2c64" translucent={false} />
      <AppHeader
        businessName={tenant?.name}
        userName={user?.name}
        userRole={user?.role}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3c2c64"]}
            tintColor="#3c2c64"
          />
        }>
        <CRMOverview />
        <QuickActions />
        <CustomersSection />
        <VendorsSection />
        <DocumentsSection />
        <StatementsAndPayments />

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
