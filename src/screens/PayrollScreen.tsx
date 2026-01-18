import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../context/AuthContext";
import PayrollOverview from "../components/payroll/PayrollOverview";
import EmployeeManagement from "../components/payroll/EmployeeManagement";
import PayrollOperations from "../components/payroll/PayrollOperations";
import PayrollHistory from "../components/payroll/PayrollHistory";
import PayrollReportsSection from "../components/payroll/PayrollReportsSection";

export default function PayrollScreen() {
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
        <PayrollOverview />
        <EmployeeManagement />
        <PayrollOperations />
        <PayrollHistory />
        <PayrollReportsSection />

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
