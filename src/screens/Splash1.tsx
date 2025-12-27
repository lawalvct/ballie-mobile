import React from "react";
import { View, Text, StyleSheet, Dimensions, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../theme/colors";

const { width, height } = Dimensions.get("window");

export default function Splash1({ onNext }: { onNext: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onNext, 3000);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <LinearGradient
      colors={[
        BRAND_COLORS.darkPurple,
        BRAND_COLORS.deepPurple,
        BRAND_COLORS.violet,
      ]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}>
      <View style={styles.content}>
        {/* Logo/Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Image
              source={require("../../assets/images/ballie_logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Brand Name */}
        <Text style={styles.title}>Ballie</Text>
        <Text style={styles.subtitle}>Smart Accounting Made Simple</Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <View
              style={[
                styles.featureDot,
                { backgroundColor: BRAND_COLORS.gold },
              ]}
            />
            <Text style={styles.featureText}>Track Every Transaction</Text>
          </View>
          <View style={styles.featureRow}>
            <View
              style={[
                styles.featureDot,
                { backgroundColor: BRAND_COLORS.teal },
              ]}
            />
            <Text style={styles.featureText}>Real-Time Financial Insights</Text>
          </View>
          <View style={styles.featureRow}>
            <View
              style={[
                styles.featureDot,
                { backgroundColor: BRAND_COLORS.lightBlue },
              ]}
            />
            <Text style={styles.featureText}>Automated Expense Management</Text>
          </View>
        </View>

        {/* Loading indicator */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
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
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: SEMANTIC_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: BRAND_COLORS.lavender,
    marginBottom: 48,
    textAlign: "center",
  },
  featuresContainer: {
    width: "100%",
    marginTop: 24,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: SEMANTIC_COLORS.white,
    opacity: 0.9,
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
