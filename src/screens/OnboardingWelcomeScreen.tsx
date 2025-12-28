import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../theme/colors";

interface OnboardingWelcomeScreenProps {
  onGuidedSetup: () => void;
  onQuickStart: () => void;
}

export default function OnboardingWelcomeScreen({
  onGuidedSetup,
  onQuickStart,
}: OnboardingWelcomeScreenProps) {
  return (
    <LinearGradient colors={["#3c2c64", "#4a3570"]} style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>📋</Text>
          </View>
          <Text style={styles.title}>Welcome to Ballie!</Text>
          <Text style={styles.subtitle}>
            Let's get your business set up in just a few minutes.
          </Text>
        </View>

        {/* Progress Steps */}
        <View style={styles.progressSteps}>
          <View style={styles.step}>
            <View style={[styles.stepCircle, styles.stepActive]}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <Text style={styles.stepLabel}>Company Info</Text>
          </View>
          <View style={styles.connector} />
          <View style={styles.step}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <Text style={styles.stepLabel}>Preferences</Text>
          </View>
          <View style={styles.connector} />
          <View style={styles.step}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <Text style={styles.stepLabel}>Complete</Text>
          </View>
        </View>

        {/* Options */}
        <View style={styles.options}>
          {/* Guided Setup */}
          <View style={styles.optionCard}>
            <View style={[styles.optionIcon, { backgroundColor: BRAND_COLORS.gold }]}>
              <Text style={styles.optionEmoji}>📊</Text>
            </View>
            <Text style={styles.optionTitle}>Guided Setup</Text>
            <Text style={styles.optionDesc}>
              We'll walk you through each step to configure your business.
            </Text>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>
                  Configure company information
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>
                  Set business preferences
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Customize settings</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onGuidedSetup}>
              <Text style={styles.primaryButtonText}>Start Setup →</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Start */}
          <View style={styles.optionCard}>
            <View
              style={[
                styles.optionIcon,
                { backgroundColor: BRAND_COLORS.darkPurple },
              ]}>
              <Text style={styles.optionEmoji}>⚡</Text>
            </View>
            <Text style={styles.optionTitle}>Quick Start</Text>
            <Text style={styles.optionDesc}>
              Skip setup and jump straight to dashboard with defaults.
            </Text>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Start immediately</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>
                  Sensible defaults applied
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>
                  Customize later in settings
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                Alert.alert(
                  "Skip Onboarding?",
                  "We'll use sensible defaults. You can customize settings later.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Skip to Dashboard", onPress: onQuickStart },
                  ]
                );
              }}>
              <Text style={styles.secondaryButtonText}>
                Skip to Dashboard →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: BRAND_COLORS.lavender,
    textAlign: "center",
    lineHeight: 24,
  },
  progressSteps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  step: {
    alignItems: "center",
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  stepActive: {
    backgroundColor: BRAND_COLORS.gold,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
  stepLabel: {
    fontSize: 12,
    color: BRAND_COLORS.lavender,
  },
  connector: {
    width: 40,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 8,
    marginBottom: 24,
  },
  options: {
    gap: 20,
  },
  optionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  optionEmoji: {
    fontSize: 32,
  },
  optionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 8,
  },
  optionDesc: {
    fontSize: 15,
    color: BRAND_COLORS.lavender,
    lineHeight: 22,
    marginBottom: 20,
  },
  featureList: {
    marginBottom: 20,
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureIcon: {
    fontSize: 16,
    color: SEMANTIC_COLORS.success,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: SEMANTIC_COLORS.white,
  },
  primaryButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: SEMANTIC_COLORS.white,
  },
});
