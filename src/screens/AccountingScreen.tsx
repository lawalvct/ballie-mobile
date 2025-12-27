import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AccountingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accounting</Text>
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
  },
});
