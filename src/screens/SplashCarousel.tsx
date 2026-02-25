import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../theme/colors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const SLIDE_COUNT = 3;

// ─── Slide 1 ─────────────────────────────────────────────────────────────────
function Slide1() {
  return (
    <LinearGradient
      colors={["#3c2c64", "#4a3570", "#614c80"]}
      style={slide.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}>
      <View style={slide.content}>
        <View style={slide.iconContainer}>
          <View style={slide.iconCircle}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={slide.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <Text style={slide.title}>Ballie</Text>
        <Text style={slide.subtitle}>Manage Your Business Like a Pro</Text>

        <View style={slide.featureList}>
          <FeatureRow
            color={BRAND_COLORS.gold}
            text="Track Every Transaction"
          />
          <FeatureRow
            color={BRAND_COLORS.teal}
            text="Access your business data anytime, anywhere"
          />
          <FeatureRow
            color={BRAND_COLORS.lightBlue}
            text="Your intelligent business companion"
          />
          <FeatureRow
            color={BRAND_COLORS.blue}
            text="Availability & Affordability at its finest"
          />
        </View>
      </View>
    </LinearGradient>
  );
}

// ─── Slide 2 ─────────────────────────────────────────────────────────────────
const AI_FEATURES = [
  { title: "Smart Suggestions", desc: "AI recommends products and actions" },
  { title: "Data Validation", desc: "Automatic error detection" },
  { title: "Q&A Assistant", desc: "Get answers instantly" },
  { title: "Smart Templates", desc: "Personalized workflows" },
];

function Slide2() {
  return (
    <LinearGradient
      colors={["#1e1348", "#2d1f6e", "#1a2f6b"]}
      style={slide.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}>
      <View style={slide.content}>
        {/* Icon + heading row */}
        <View style={s2.headingRow}>
          <View style={s2.aiIconCircle}>
            <Text style={s2.aiIconEmoji}>💡</Text>
          </View>
          <View style={s2.headingText}>
            <Text style={s2.aiTitle}>AI-Powered Assistant</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={s2.description}>
          Experience the future of business management with AI that learns your
          patterns, suggests improvements, and automates routine tasks.
        </Text>

        {/* 2×2 feature cards */}
        <View style={s2.cardGrid}>
          {AI_FEATURES.map((f) => (
            <View key={f.title} style={s2.featureCard}>
              <Text style={s2.cardTitle}>{f.title}</Text>
              <Text style={s2.cardDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

// ─── Slide 3 ─────────────────────────────────────────────────────────────────
const MODULES = [
  {
    icon: "�",
    label: "BallieAI",
    desc: "AI business assistant",
    color: BRAND_COLORS.lavender,
  },
  {
    icon: "📋",
    label: "Accounting",
    desc: "Double-entry & reports",
    color: BRAND_COLORS.gold,
  },
  {
    icon: "📦",
    label: "Inventory",
    desc: "Stock & warehouse",
    color: BRAND_COLORS.teal,
  },
  {
    icon: "🤝",
    label: "CRM",
    desc: "Sales pipeline",
    color: BRAND_COLORS.lightBlue,
  },
  { icon: "🖥️", label: "POS", desc: "Point of sale", color: "#a78bfa" },
  {
    icon: "🌐",
    label: "E-Commerce",
    desc: "Online store",
    color: BRAND_COLORS.teal,
  },
  {
    icon: "💰",
    label: "Payroll",
    desc: "Salary & HR",
    color: BRAND_COLORS.gold,
  },
  {
    icon: "🏛️",
    label: "Tax & More",
    desc: "VAT, PAYE, audit",
    color: BRAND_COLORS.lightBlue,
  },
];

function Slide3() {
  return (
    <LinearGradient
      colors={["#1a3a2e", "#1d5a4a", "#2b6399"]}
      style={slide.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}>
      <View style={slide.content}>
        {/* Headline */}
        <Text style={s3.headline}>
          <Text style={s3.headlineGold}>13+ Modules</Text>
          <Text style={s3.headlineWhite}>{" — One Platform"}</Text>
        </Text>

        {/* Subtitle */}
        <Text style={s3.subtitle}>
          Stop paying for 10 different tools. Everything your business needs, in
          one affordable subscription.
        </Text>

        {/* 4 × 2 module grid */}
        <View style={s3.grid}>
          {MODULES.map((mod) => (
            <View key={mod.label} style={s3.moduleCard}>
              <View style={s3.cardRow}>
                <Text style={s3.moduleIcon}>{mod.icon}</Text>
                <Text style={[s3.moduleLabel, { color: mod.color }]}>
                  {mod.label}
                </Text>
              </View>
              <Text style={s3.moduleDesc}>{mod.desc}</Text>
            </View>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function FeatureRow({ color, text }: { color: string; text: string }) {
  return (
    <View style={slide.featureRow}>
      <View style={[slide.dot, { backgroundColor: color }]} />
      <Text style={slide.featureText}>{text}</Text>
    </View>
  );
}

// ─── Carousel ────────────────────────────────────────────────────────────────
export default function SplashCarousel({ onFinish }: { onFinish: () => void }) {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-advance: 4 s per slide; resets whenever the active index changes
  // (covers both manual swipe and button taps)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const next = activeIndex + 1;
      if (next >= SLIDE_COUNT) {
        onFinish();
      } else {
        scrollTo(next);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  const scrollTo = (index: number) => {
    scrollRef.current?.scrollTo({ x: SCREEN_W * index, animated: true });
    setActiveIndex(index);
  };

  const handleNext = () => {
    const next = activeIndex + 1;
    if (next >= SLIDE_COUNT) {
      onFinish();
    } else {
      scrollTo(next);
    }
  };

  const handleMomentumEnd = (e: any) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setActiveIndex(page);
  };

  const isLast = activeIndex === SLIDE_COUNT - 1;

  return (
    <View style={styles.wrapper}>
      {/* ── Slides ─────────────────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumEnd}
        decelerationRate="fast"
        style={{ width: SCREEN_W, height: SCREEN_H }}>
        <View style={{ width: SCREEN_W, height: SCREEN_H }}>
          <Slide1 />
        </View>
        <View style={{ width: SCREEN_W, height: SCREEN_H }}>
          <Slide2 />
        </View>
        <View style={{ width: SCREEN_W, height: SCREEN_H }}>
          <Slide3 />
        </View>
      </ScrollView>

      {/* ── Skip button ────────────────────────────────────── */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={onFinish}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* ── Bottom overlay: dots + next/get-started ────────── */}
      <View style={styles.bottomOverlay} pointerEvents="box-none">
        {/* Dot indicators */}
        <View style={styles.dotsRow}>
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => scrollTo(i)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <View
                style={[
                  styles.dotBase,
                  i === activeIndex
                    ? styles.dotActiveStyle
                    : styles.dotInactiveStyle,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Action button */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleNext}>
          <Text style={styles.actionText}>
            {isLast ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Shared slide styles ──────────────────────────────────────────────────────
const slide = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 120, // leave room for overlay
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
    fontSize: 40,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: BRAND_COLORS.lavender,
    textAlign: "center",
    opacity: 0.9,
  },
  featureList: {
    width: "100%",
    marginTop: 32,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dot: {
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
});

// ─── Slide 2 styles ───────────────────────────────────────────────────────────
const s2 = StyleSheet.create({
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
  },
  aiIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#7c3aed",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  aiIconEmoji: {
    fontSize: 28,
  },
  headingText: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: BRAND_COLORS.gold,
    marginBottom: 4,
  },
  aiTagline: {
    fontSize: 14,
    color: SEMANTIC_COLORS.white,
    opacity: 0.75,
  },
  description: {
    fontSize: 15,
    color: SEMANTIC_COLORS.white,
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.85,
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    gap: 12,
  },
  featureCard: {
    width: "47%",
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
    padding: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.gold,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: SEMANTIC_COLORS.white,
    opacity: 0.75,
    lineHeight: 18,
  },
});

// ─── Slide 3 styles ───────────────────────────────────────────────────────────
const s3 = StyleSheet.create({
  headline: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 36,
  },
  headlineGold: {
    color: BRAND_COLORS.gold,
  },
  headlineWhite: {
    color: SEMANTIC_COLORS.white,
  },
  subtitle: {
    fontSize: 14,
    color: SEMANTIC_COLORS.white,
    textAlign: "center",
    opacity: 0.8,
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },
  moduleCard: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  moduleIcon: {
    fontSize: 18,
  },
  moduleLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  moduleDesc: {
    fontSize: 12,
    color: SEMANTIC_COLORS.white,
    opacity: 0.65,
    lineHeight: 16,
  },
});

// ─── Carousel overlay styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  skipBtn: {
    position: "absolute",
    top: 56,
    right: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    zIndex: 10,
  },
  skipText: {
    color: SEMANTIC_COLORS.white,
    fontWeight: "600",
    fontSize: 14,
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 24,
    zIndex: 10,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dotBase: {
    borderRadius: 5,
    height: 8,
  },
  dotActiveStyle: {
    width: 24,
    backgroundColor: BRAND_COLORS.gold,
    opacity: 1,
  },
  dotInactiveStyle: {
    width: 8,
    backgroundColor: SEMANTIC_COLORS.white,
    opacity: 0.35,
  },
  actionBtn: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  actionText: {
    color: BRAND_COLORS.darkPurple,
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
