import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../theme/colors";

interface OnboardingCompleteScreenProps {
  onComplete: () => void;
}

export default function OnboardingCompleteScreen({
  onComplete,
}: OnboardingCompleteScreenProps) {
  return (
    <LinearGradient colors={["#3c2c64", "#4a3570"]} style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.successCircle}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
        </View>

        {/* Celebration Message */}
        <Text style={styles.title}>Setup Complete!</Text>
        <Text style={styles.subtitle}>
          Congratulations! Your business is now set up and ready to go. You can
          now start using Ballie to manage your business.
        </Text>

        {/* Success Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✓</Text>
            <Text style={styles.statLabel}>Accounts Created</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⚙️</Text>
            <Text style={styles.statLabel}>Preferences Set</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🚀</Text>
            <Text style={styles.statLabel}>Ready to Launch</Text>
          </View>
        </View>

        {/* Main CTA */}
        <TouchableOpacity style={styles.dashboardButton} onPress={onComplete}>
          <Text style={styles.dashboardButtonText}>Go to Dashboard</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    alignItems: "center",
    paddingTop: 80,
  },
  iconContainer: {
    marginVertical: 32,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: SEMANTIC_COLORS.success,
  },
  successIcon: {
    fontSize: 60,
    color: SEMANTIC_COLORS.success,
    fontWeight: "bold",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: BRAND_COLORS.lavender,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 48,
    flexWrap: "wrap",
    gap: 8,
  },
  statCard: {
    alignItems: "center",
    padding: 12,
    width: "28%",
    minWidth: 90,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    color: BRAND_COLORS.lavender,
    textAlign: "center",
    lineHeight: 14,
  },
  dashboardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dashboardButtonText: {
    color: BRAND_COLORS.darkPurple,
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  arrow: {
    fontSize: 20,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "bold",
  },
});
