import React from "react";
import { View, Text, StyleSheet } from "react-native";

/**
 * Legacy AuditScreen — replaced by AuditNavigator → AuditDashboardScreen.
 * Kept as a fallback placeholder.
 */
export default function AuditScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Audit module has moved to the new navigator.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 14, color: "#6b7280" },
});
