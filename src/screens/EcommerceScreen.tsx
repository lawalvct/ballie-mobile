import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function EcommerceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>E-commerce</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
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
