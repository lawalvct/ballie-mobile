import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../context/AuthContext";
import ExportSection from "../components/audit/ExportSection";
import AuditStats from "../components/audit/AuditStats";
import AuditFilters from "../components/audit/AuditFilters";
import AuditTimeline from "../components/audit/AuditTimeline";

export default function AuditScreen() {
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
        <AuditStats />
        <AuditFilters />
        <AuditTimeline />
        <ExportSection />

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
