import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ModuleScreenLayout from "../components/ModuleScreenLayout";

export default function StatutoryScreen() {
  return (
    <ModuleScreenLayout>
      <View style={styles.content}>
        <Text style={styles.title}>Statutory Compliance</Text>
        <Text style={styles.subtitle}>Coming Soon</Text>
      </View>
    </ModuleScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3c2c64",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});
