import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../theme/colors";

interface AppHeaderProps {
  businessName?: string;
  userName?: string;
  userRole?: string;
}

export default function AppHeader({
  businessName,
  userName,
  userRole,
}: AppHeaderProps) {
  const avatarLetter = userName?.charAt(0).toUpperCase() || "U";

  return (
    <LinearGradient colors={["#3c2c64", "#4a3570"]} style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.businessName}>
            {businessName || "Your Business"}
          </Text>
        </View>
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>
          <Text style={styles.userRole}>{userRole || "Admin"}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: BRAND_COLORS.lavender,
    marginBottom: 4,
  },
  businessName: {
    fontSize: 24,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
  userSection: {
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND_COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: SEMANTIC_COLORS.white,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: SEMANTIC_COLORS.white,
  },
  userRole: {
    fontSize: 11,
    color: BRAND_COLORS.lavender,
    marginTop: 4,
  },
});
