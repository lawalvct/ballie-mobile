import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../theme/colors";

const { width, height } = Dimensions.get("window");

export default function Splash2({ onNext }: { onNext: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onNext, 3000);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <LinearGradient
      colors={[BRAND_COLORS.blue, BRAND_COLORS.teal, BRAND_COLORS.lightBlue]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}>
      <View style={styles.content}>
        {/* Financial Dashboard Preview */}
        <View style={styles.dashboardPreview}>
          <Text style={styles.previewTitle}>Your Financial Dashboard</Text>

          <View style={styles.statsContainer}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: BRAND_COLORS.green },
              ]}>
              <Text style={styles.statLabel}>Revenue</Text>
              <Text style={styles.statValue}>₦2,45,890</Text>
              <Text style={styles.statChange}>↑ 12.5%</Text>
            </View>

            <View
              style={[styles.statCard, { backgroundColor: BRAND_COLORS.gold }]}>
              <Text style={styles.statLabel}>Expenses</Text>
              <Text style={styles.statValue}>₦1,23,456</Text>
              <Text style={styles.statChange}>↓ 8.2%</Text>
            </View>
          </View>

          <View style={styles.profitCard}>
            <Text style={styles.profitLabel}>Net Profit This Month</Text>
            <Text style={styles.profitValue}>₦1,22,434</Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Everything You Need</Text>
          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureLabel}>Analytics</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📱</Text>
              <Text style={styles.featureLabel}>Invoice</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💰</Text>
              <Text style={styles.featureLabel}>Expenses</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📈</Text>
              <Text style={styles.featureLabel}>Reports</Text>
            </View>
          </View>
        </View>

        {/* Loading indicator */}
        <View style={styles.dotsContainer}>
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
  dashboardPreview: {
    width: "100%",
    marginBottom: 32,
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 20,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statLabel: {
    fontSize: 12,
    color: SEMANTIC_COLORS.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 4,
  },
  statChange: {
    fontSize: 14,
    color: SEMANTIC_COLORS.white,
    fontWeight: "600",
  },
  profitCard: {
    backgroundColor: BRAND_COLORS.darkPurple,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  profitLabel: {
    fontSize: 14,
    color: BRAND_COLORS.lavender,
    marginBottom: 8,
  },
  profitValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: BRAND_COLORS.gold,
  },
  featuresContainer: {
    width: "100%",
    marginTop: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 16,
    textAlign: "center",
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 12,
  },
  featureItem: {
    width: "22%",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  featureLabel: {
    fontSize: 12,
    color: SEMANTIC_COLORS.white,
    fontWeight: "600",
  },
  dotsContainer: {
    flexDirection: "row",
    marginTop: 48,
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
