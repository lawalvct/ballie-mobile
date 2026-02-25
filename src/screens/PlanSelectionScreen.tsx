import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../theme/colors";
import { authAPI } from "../api/endpoints/auth";
import { Plan } from "../api/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_GAP = 16;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

interface PlanSelectionScreenProps {
  onNext: (
    planId: number,
    termsAccepted: boolean,
    billingCycle: string,
  ) => void;
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
  const [selectedCycle, setSelectedCycle] = useState<
    "monthly" | "quarterly" | "biannual" | "yearly"
  >("monthly");
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const planScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  // Scroll to popular plan after loading
  useEffect(() => {
    if (!isLoading && plans.length > 0 && activePlanIndex > 0) {
      setTimeout(() => {
        planScrollRef.current?.scrollTo({
          x: activePlanIndex * SNAP_INTERVAL,
          animated: true,
        });
      }, 200);
    }
  }, [isLoading]);

  const loadPlans = async () => {
    try {
      const response = await authAPI.getPlans();
      setPlans(response.data);
      const popularPlan = response.data.find((p: Plan) => p.is_popular);
      if (popularPlan) {
        setSelectedPlanId(popularPlan.id);
        const idx = response.data.findIndex(
          (p: Plan) => p.id === popularPlan.id,
        );
        if (idx >= 0) setActivePlanIndex(idx);
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "Failed to load plans. Please try again.",
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
        "Please accept the terms and conditions to continue",
      );
      return;
    }
    onNext(selectedPlanId, termsAccepted, selectedCycle);
  };

  const onPlanScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
    if (index >= 0 && index < plans.length) {
      setActivePlanIndex(index);
      setSelectedPlanId(plans[index].id);
    }
  };

  const getCycleSuffix = (cycle: string) => {
    switch (cycle) {
      case "monthly":
        return "/mo";
      case "quarterly":
        return "/qtr";
      case "biannual":
        return "/6 mo";
      case "yearly":
        return "/yr";
      default:
        return "";
    }
  };

  return (
    <LinearGradient
      colors={["#0f0a1e", "#1e1242", "#0f0a1e"]}
      style={styles.container}>
      <StatusBar style="light" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Choose Your Plan</Text>

        <View style={styles.headerMeta}>
          <View style={styles.stepPill}>
            <Text style={styles.stepText}>STEP 3 OF 3</Text>
          </View>
          <View style={styles.trialPill}>
            <Text style={styles.trialPillText}> 30-day free trial</Text>
          </View>
        </View>
      </View>

      {/* ── Billing cycle selector ── */}
      {!isLoading && plans.length > 0 && (
        <View style={styles.cycleSection}>
          <View style={styles.cycleRow}>
            {(plans[0].billing_cycles ?? []).map((bc) => {
              const isActive = selectedCycle === bc.cycle;
              return (
                <TouchableOpacity
                  key={bc.cycle}
                  style={[styles.cyclePill, isActive && styles.cyclePillActive]}
                  onPress={() => setSelectedCycle(bc.cycle)}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.cyclePillLabel,
                      isActive && styles.cyclePillLabelActive,
                    ]}
                    numberOfLines={1}>
                    {bc.label}
                  </Text>
                  {!!bc.savings_label && (
                    <Text
                      style={[
                        styles.cycleSavings,
                        isActive && styles.cycleSavingsActive,
                      ]}
                      numberOfLines={1}>
                      {bc.savings_label}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* ── Plan cards ── */}
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingLabel}>Loading plans…</Text>
        </View>
      ) : (
        <View style={styles.plansSection}>
          <ScrollView
            ref={planScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SNAP_INTERVAL}
            decelerationRate="fast"
            contentContainerStyle={styles.plansScroll}
            onMomentumScrollEnd={onPlanScrollEnd}>
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const activeCycle = plan.billing_cycles?.find(
                (c) => c.cycle === selectedCycle,
              );

              return (
                <TouchableOpacity
                  key={plan.id}
                  style={[styles.card, isSelected && styles.cardSelected]}
                  onPress={() => setSelectedPlanId(plan.id)}
                  activeOpacity={0.95}>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.cardContent}
                    nestedScrollEnabled>
                    {/* Popular ribbon */}
                    {plan.is_popular && (
                      <LinearGradient
                        colors={["#d4a844", "#f0cf72"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.popularBadge}>
                        <Text style={styles.popularText}>⭐ MOST POPULAR</Text>
                      </LinearGradient>
                    )}

                    {/* Name + description */}
                    <Text style={styles.planName}>{plan.name}</Text>
                    {!!plan.description && (
                      <Text style={styles.planDesc}>{plan.description}</Text>
                    )}

                    {/* Price */}
                    {activeCycle && (
                      <View style={styles.priceBlock}>
                        <View style={styles.priceRow}>
                          <Text style={styles.priceAmount}>
                            {activeCycle.formatted_price}
                          </Text>
                          <Text style={styles.priceSuffix}>
                            {getCycleSuffix(activeCycle.cycle)}
                          </Text>
                        </View>
                        {activeCycle.cycle !== "monthly" && (
                          <Text style={styles.pricePerMonth}>
                            {activeCycle.formatted_price_per_month}/month
                          </Text>
                        )}
                        {!!activeCycle.savings_description && (
                          <View style={styles.savingsChip}>
                            <Text style={styles.savingsChipText}>
                              {activeCycle.savings_description}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Trial */}
                    <View style={styles.cardTrialPill}>
                      <Text style={styles.cardTrialText}>
                        🎁 30 Days Free Trial
                      </Text>
                    </View>

                    {/* Features */}
                    <View style={styles.featuresWrap}>
                      {plan.features.map((f, i) => (
                        <View key={i} style={styles.featureRow}>
                          <View style={styles.featureCheck}>
                            <Text style={styles.featureCheckText}>✓</Text>
                          </View>
                          <Text style={styles.featureLabel}>{f}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Limits */}
                    <View style={styles.limitsWrap}>
                      <View style={styles.limitRow}>
                        <Text style={styles.limitEmoji}>👥</Text>
                        <Text style={styles.limitText}>
                          {plan.limits.max_users === null
                            ? "Unlimited"
                            : `Up to ${plan.limits.max_users}`}{" "}
                          users
                        </Text>
                      </View>
                      <View style={styles.limitRow}>
                        <Text style={styles.limitEmoji}>👤</Text>
                        <Text style={styles.limitText}>
                          {plan.limits.max_customers === null
                            ? "Unlimited"
                            : `${plan.limits.max_customers}`}{" "}
                          customers
                        </Text>
                      </View>
                    </View>

                    {/* Capabilities */}
                    <View style={styles.capsRow}>
                      {plan.capabilities.pos && (
                        <View style={styles.capBadge}>
                          <Text style={styles.capLabel}>POS</Text>
                        </View>
                      )}
                      {plan.capabilities.payroll && (
                        <View style={styles.capBadge}>
                          <Text style={styles.capLabel}>Payroll</Text>
                        </View>
                      )}
                      {plan.capabilities.api_access && (
                        <View style={styles.capBadge}>
                          <Text style={styles.capLabel}>API</Text>
                        </View>
                      )}
                      {plan.capabilities.advanced_reports && (
                        <View style={styles.capBadge}>
                          <Text style={styles.capLabel}>Reports+</Text>
                        </View>
                      )}
                    </View>

                    {/* Select button */}
                    {isSelected ? (
                      <LinearGradient
                        colors={["#d4a844", "#c9a556"]}
                        style={styles.selectBtnGold}>
                        <Text style={styles.selectBtnGoldText}>Selected ✓</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.selectBtnOutline}>
                        <Text style={styles.selectBtnOutlineText}>
                          Select Plan
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Pagination dots */}
          {plans.length > 1 && (
            <View style={styles.dotsRow}>
              {plans.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === activePlanIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* ── Footer ── */}
      {!isLoading && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setTermsAccepted(!termsAccepted)}
            activeOpacity={0.7}>
            <View style={[styles.checkbox, termsAccepted && styles.checkboxOn]}>
              {termsAccepted && <Text style={styles.checkboxTick}>✓</Text>}
            </View>
            <Text style={styles.termsLabel}>
              I agree to the{" "}
              <Text style={styles.termsLink}>Terms & Conditions</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.ctaWrap,
              (!selectedPlanId || !termsAccepted) && styles.ctaDisabled,
            ]}
            onPress={handleNext}
            disabled={!selectedPlanId || !termsAccepted}
            activeOpacity={0.85}>
            <LinearGradient
              colors={["#d4a844", "#c9a556"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}>
              <Text style={styles.ctaLabel}>Complete Registration</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Styles                                                                    */
/* ═══════════════════════════════════════════════════════════════════════════ */

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* ── Header ── */
  header: {
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  backArrow: {
    fontSize: 30,
    color: "rgba(164,212,255,0.9)",
    lineHeight: 30,
    marginRight: 2,
  },
  backLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(164,212,255,0.9)",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepPill: {
    backgroundColor: "rgba(209,176,94,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  stepText: {
    fontSize: 11,
    fontWeight: "800",
    color: BRAND_COLORS.gold,
    letterSpacing: 1,
  },
  trialPill: {
    backgroundColor: "rgba(164,212,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  trialPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(164,212,255,0.8)",
  },

  /* ── Billing Cycle ── */
  cycleSection: {
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  cycleRow: {
    flexDirection: "row",
    gap: 8,
  },
  cyclePill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    minHeight: 48,
  },
  cyclePillActive: {
    backgroundColor: BRAND_COLORS.gold,
    borderColor: BRAND_COLORS.gold,
  },
  cyclePillLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
  },
  cyclePillLabelActive: {
    color: "#1a1035",
  },
  cycleSavings: {
    fontSize: 9,
    fontWeight: "800",
    color: "#22c55e",
    marginTop: 2,
    textAlign: "center",
  },
  cycleSavingsActive: {
    color: "#15532c",
  },

  /* ── Loading ── */
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingLabel: {
    marginTop: 14,
    fontSize: 15,
    color: "rgba(255,255,255,0.4)",
  },

  /* ── Plans Section ── */
  plansSection: { flex: 1 },
  plansScroll: {
    paddingHorizontal: 24,
  },

  /* ── Plan Card ── */
  card: {
    width: CARD_WIDTH,
    marginRight: CARD_GAP,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    overflow: "hidden",
  },
  cardSelected: {
    borderColor: "rgba(209,176,94,0.6)",
    backgroundColor: "rgba(209,176,94,0.06)",
  },
  cardContent: {
    padding: 20,
    paddingBottom: 24,
  },

  /* Card – Popular */
  popularBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 14,
  },
  popularText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1a1035",
    letterSpacing: 0.4,
  },

  /* Card – Name */
  planName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
  },
  planDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    marginTop: 4,
    lineHeight: 18,
  },

  /* Card – Price */
  priceBlock: {
    marginTop: 16,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceAmount: {
    fontSize: 34,
    fontWeight: "800",
    color: BRAND_COLORS.gold,
    letterSpacing: -1,
  },
  priceSuffix: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.35)",
    marginLeft: 4,
  },
  pricePerMonth: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    marginTop: 3,
  },
  savingsChip: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(34,197,94,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  savingsChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#22c55e",
  },

  /* Card – Divider */
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 16,
  },

  /* Card – Trial */
  cardTrialPill: {
    backgroundColor: "rgba(164,212,255,0.1)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  cardTrialText: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(164,212,255,0.8)",
  },

  /* Card – Features */
  featuresWrap: {
    marginBottom: 14,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  featureCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(34,197,94,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  featureCheckText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#22c55e",
  },
  featureLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    flex: 1,
    lineHeight: 18,
  },

  /* Card – Limits */
  limitsWrap: {
    marginBottom: 14,
    gap: 8,
  },
  limitRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  limitEmoji: {
    fontSize: 14,
    marginRight: 8,
  },
  limitText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
  },

  /* Card – Capabilities */
  capsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  capBadge: {
    backgroundColor: "rgba(209,176,94,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(209,176,94,0.2)",
  },
  capLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: BRAND_COLORS.gold,
  },

  /* Card – Select Button */
  selectBtnGold: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  selectBtnGoldText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1a1035",
  },
  selectBtnOutline: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
  },
  selectBtnOutlineText: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
  },

  /* ── Pagination Dots ── */
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  dotActive: {
    backgroundColor: BRAND_COLORS.gold,
    width: 24,
    borderRadius: 4,
  },

  /* ── Footer ── */
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 6,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: {
    backgroundColor: BRAND_COLORS.gold,
    borderColor: BRAND_COLORS.gold,
  },
  checkboxTick: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1035",
  },
  termsLabel: {
    flex: 1,
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    lineHeight: 18,
  },
  termsLink: {
    color: "rgba(164,212,255,0.8)",
    textDecorationLine: "underline",
  },
  ctaWrap: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#d4a844",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaDisabled: {
    opacity: 0.35,
  },
  ctaGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaLabel: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1a1035",
    letterSpacing: 0.3,
  },
});
