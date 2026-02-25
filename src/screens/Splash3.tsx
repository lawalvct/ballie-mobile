import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../theme/colors";

const { width, height } = Dimensions.get("window");

const MODULES = [
  { icon: "🧾", label: "Accounting", color: BRAND_COLORS.gold },
  { icon: "📦", label: "Inventory", color: BRAND_COLORS.teal },
  { icon: "👥", label: "Payroll", color: BRAND_COLORS.lightBlue },
  { icon: "🤝", label: "CRM", color: BRAND_COLORS.green },
  { icon: "📊", label: "Reports", color: "#e88c30" },
  { icon: "🛒", label: "Ecommerce", color: BRAND_COLORS.lavender },
];

export default function Splash3({ onNext }: { onNext: () => void }) {
  return (
    <LinearGradient
      colors={["#1a3a2e", "#1d5a4a", "#2b6399"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}>
      <View style={styles.content}>
        {/* Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ALL-IN-ONE PLATFORM</Text>
        </View>

        {/* Headline */}
        <Text style={styles.title}>Your Complete{"\n"}Business Suite</Text>
        <Text style={styles.subtitle}>
          Six powerful modules, one seamless app
        </Text>

        {/* Module grid */}
        <View style={styles.grid}>
          {MODULES.map((mod) => (
            <View key={mod.label} style={styles.moduleCard}>
              <View
                style={[
                  styles.moduleIconBg,
                  { backgroundColor: mod.color + "28" },
                ]}>
                <Text style={styles.moduleIcon}>{mod.icon}</Text>
              </View>
              <Text style={styles.moduleLabel}>{mod.label}</Text>
            </View>
          ))}
        </View>

        {/* Bottom tagline */}
        <View style={styles.taglineContainer}>
          <View style={styles.divider} />
          <Text style={styles.tagline}>
            Everything your business needs — right in your pocket
          </Text>
          <View style={styles.divider} />
        </View>

        {/* Dots placeholder (managed by carousel) */}
        <View style={styles.dotsContainer}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 20,
  },
  badgeText: {
    color: BRAND_COLORS.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    textAlign: "center",
    lineHeight: 44,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: BRAND_COLORS.lavender,
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.9,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  moduleCard: {
    width: "30%",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  moduleIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  moduleIcon: {
    fontSize: 24,
  },
  moduleLabel: {
    fontSize: 12,
    color: SEMANTIC_COLORS.white,
    fontWeight: "600",
    textAlign: "center",
  },
  taglineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 28,
    width: "100%",
    gap: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  tagline: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    flex: 2,
  },
  dotsContainer: {
    flexDirection: "row",
    marginTop: 36,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SEMANTIC_COLORS.white,
    opacity: 0.3,
  },
  dotActive: {
    opacity: 1,
    backgroundColor: BRAND_COLORS.gold,
  },
});
