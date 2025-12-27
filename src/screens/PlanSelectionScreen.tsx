import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../theme/colors";
import { authAPI } from "../api/endpoints/auth";
import { Plan } from "../api/types";

interface PlanSelectionScreenProps {
  onNext: (planId: number, termsAccepted: boolean) => void;
  onBack: () => void;
}

export default function PlanSelectionScreen({
  onNext,
  onBack,
}: PlanSelectionScreenProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showYearly, setShowYearly] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await authAPI.getPlans();
      setPlans(response.data);
      // Auto-select popular plan
      const popularPlan = response.data.find((p) => p.is_popular);
      if (popularPlan) {
        setSelectedPlanId(popularPlan.id);
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "Failed to load plans. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (!selectedPlanId) {
      Alert.alert("Selection Required", "Please select a plan");
      return;
    }

    if (!termsAccepted) {
      Alert.alert(
        "Terms Required",
        "Please accept the terms and conditions to continue"
      );
      return;
    }

    onNext(selectedPlanId, termsAccepted);
  };

  return (
    <LinearGradient colors={["#3c2c64", "#4a3570"]} style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>Step 3 of 3</Text>
        <Text style={styles.description}>
          🎉 30 Days Free Trial • Cancel Anytime
        </Text>
      </View>

      {/* Billing Toggle */}
      {!isLoading && (
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              !showYearly && styles.toggleButtonActive,
            ]}
            onPress={() => setShowYearly(false)}>
            <Text
              style={[
                styles.toggleText,
                !showYearly && styles.toggleTextActive,
              ]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              showYearly && styles.toggleButtonActive,
            ]}
            onPress={() => setShowYearly(true)}>
            <Text
              style={[
                styles.toggleText,
                showYearly && styles.toggleTextActive,
              ]}>
              Yearly
            </Text>
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>Save 17%</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Plans */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.plansScroll}
          style={styles.plansContainer}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlanId === plan.id && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlanId(plan.id)}>
              {/* Popular Badge */}
              {plan.is_popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>⭐ POPULAR</Text>
                </View>
              )}

              {/* Plan Name */}
              <Text style={styles.planName}>{plan.name}</Text>

              {/* Price */}
              <View style={styles.priceContainer}>
                <Text style={styles.price}>
                  {showYearly
                    ? plan.formatted_yearly_price
                    : plan.formatted_monthly_price}
                </Text>
                <Text style={styles.pricePeriod}>
                  /{showYearly ? "year" : "month"}
                </Text>
              </View>

              {/* Trial Badge */}
              <View style={styles.trialBadge}>
                <Text style={styles.trialText}>30 Days Free Trial</Text>
              </View>

              {/* Features */}
              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureIcon}>✓</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {/* Limits */}
              <View style={styles.limitsContainer}>
                <Text style={styles.limitText}>
                  • Up to {plan.limits.max_users} users
                </Text>
                <Text style={styles.limitText}>
                  • {plan.limits.max_customers} customers
                </Text>
              </View>

              {/* Capabilities */}
              <View style={styles.capabilitiesContainer}>
                {plan.capabilities.pos && (
                  <View style={styles.capabilityBadge}>
                    <Text style={styles.capabilityText}>POS</Text>
                  </View>
                )}
                {plan.capabilities.payroll && (
                  <View style={styles.capabilityBadge}>
                    <Text style={styles.capabilityText}>Payroll</Text>
                  </View>
                )}
                {plan.capabilities.api_access && (
                  <View style={styles.capabilityBadge}>
                    <Text style={styles.capabilityText}>API</Text>
                  </View>
                )}
              </View>

              {/* Select Button */}
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  selectedPlanId === plan.id && styles.selectButtonSelected,
                ]}
                onPress={() => setSelectedPlanId(plan.id)}>
                <Text
                  style={[
                    styles.selectButtonText,
                    selectedPlanId === plan.id &&
                      styles.selectButtonTextSelected,
                  ]}>
                  {selectedPlanId === plan.id ? "Selected ✓" : "Select Plan"}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Terms and Submit */}
      {!isLoading && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setTermsAccepted(!termsAccepted)}>
            <View
              style={[
                styles.checkbox,
                termsAccepted && styles.checkboxChecked,
              ]}>
              {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              I agree to the{" "}
              <Text style={styles.termsLink}>Terms & Conditions</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedPlanId || !termsAccepted) &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!selectedPlanId || !termsAccepted}>
            <LinearGradient
              colors={["#d1b05e", "#c9a556"]}
              style={styles.submitButtonGradient}>
              <Text style={styles.submitButtonText}>Complete Registration</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: BRAND_COLORS.lightBlue,
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: BRAND_COLORS.gold,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: BRAND_COLORS.lavender,
  },
  toggleContainer: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    position: "relative",
  },
  toggleButtonActive: {
    backgroundColor: BRAND_COLORS.gold,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.lavender,
  },
  toggleTextActive: {
    color: BRAND_COLORS.darkPurple,
  },
  savingsBadge: {
    position: "absolute",
    top: -8,
    right: 8,
    backgroundColor: SEMANTIC_COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: BRAND_COLORS.lavender,
  },
  plansContainer: {
    flex: 1,
  },
  plansScroll: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 16,
  },
  planCard: {
    width: 280,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: BRAND_COLORS.violet,
    marginRight: 16,
  },
  planCardSelected: {
    borderColor: BRAND_COLORS.gold,
    backgroundColor: "rgba(209, 176, 94, 0.1)",
  },
  popularBadge: {
    backgroundColor: BRAND_COLORS.gold,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  planName: {
    fontSize: 24,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  price: {
    fontSize: 32,
    fontWeight: "bold",
    color: BRAND_COLORS.gold,
  },
  pricePeriod: {
    fontSize: 16,
    color: BRAND_COLORS.lavender,
    marginLeft: 4,
  },
  trialBadge: {
    backgroundColor: "rgba(164, 212, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  trialText: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND_COLORS.lightBlue,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 16,
    color: SEMANTIC_COLORS.success,
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    color: SEMANTIC_COLORS.white,
  },
  limitsContainer: {
    marginBottom: 16,
  },
  limitText: {
    fontSize: 13,
    color: BRAND_COLORS.lavender,
    marginBottom: 4,
  },
  capabilitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  capabilityBadge: {
    backgroundColor: "rgba(209, 176, 94, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  capabilityText: {
    fontSize: 11,
    fontWeight: "600",
    color: BRAND_COLORS.gold,
  },
  selectButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BRAND_COLORS.violet,
  },
  selectButtonSelected: {
    backgroundColor: BRAND_COLORS.gold,
    borderColor: BRAND_COLORS.gold,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: SEMANTIC_COLORS.white,
  },
  selectButtonTextSelected: {
    color: BRAND_COLORS.darkPurple,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: BRAND_COLORS.lavender,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: BRAND_COLORS.gold,
    borderColor: BRAND_COLORS.gold,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: BRAND_COLORS.lavender,
  },
  termsLink: {
    color: BRAND_COLORS.lightBlue,
    textDecorationLine: "underline",
  },
  submitButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
});
