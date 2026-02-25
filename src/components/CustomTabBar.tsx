import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../theme/colors";

const TAB_BAR_HEIGHT = 62;

const TABS = [
  { id: "Dashboard", label: "Dashboard", icon: "📊" },
  { id: "Accounting", label: "Accounting", icon: "💰" },
  { id: "Inventory", label: "Inventory", icon: "📦" },
  // { id: "POS", label: "POS", icon: "💳" },
  { id: "CRM", label: "CRM", icon: "👥" },
  { id: "Payroll", label: "Payroll", icon: "💵" },
  { id: "Reports", label: "Reports", icon: "📈" },
  { id: "Audit", label: "Audit", icon: "🔍" },
  { id: "Ecommerce", label: "E-com", icon: "🛒" },
  { id: "Admins", label: "Admins", icon: "👔" },
  { id: "Statutory", label: "Statutory", icon: "📜" },
] as const;

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [showPointer, setShowPointer] = useState(false);
  const pointerAnim = useRef(new Animated.Value(0)).current;
  const pointerOpacity = useRef(new Animated.Value(1)).current;
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Safe area bottom covers both gesture nav and 3-button nav correctly.
  // Add a small minimum so the bar doesn't look glued to the edge on
  // devices that report insets.bottom === 0 (some older Android builds).
  const bottomPad = Math.max(insets.bottom, 4);

  const isOverflowing = useMemo(
    () => contentWidth > containerWidth + 8,
    [contentWidth, containerWidth],
  );

  const shouldShowHint = useMemo(() => {
    if (contentWidth === 0 || containerWidth === 0) return TABS.length > 5;
    return isOverflowing;
  }, [contentWidth, containerWidth, isOverflowing]);

  useEffect(() => {
    if (!shouldShowHint) {
      setShowPointer(false);
      return;
    }

    setShowPointer(true);
    pointerOpacity.setValue(1);

    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(pointerAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pointerAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    bounce.start();

    hintTimerRef.current = setTimeout(() => {
      Animated.timing(pointerOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setShowPointer(false));
    }, 5000);

    return () => {
      bounce.stop();
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [shouldShowHint]);

  const handleScroll = () => setShowPointer(false);

  const translateX = pointerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomPad }]}>
      {/* Tab content area — fixed height */}
      <View
        style={styles.tabArea}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={(w) => setContentWidth(w)}
          onScroll={handleScroll}
          scrollEventThrottle={64}>
          {TABS.map((tab, index) => {
            const isFocused = state.index === index;
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tab}
                onPress={() => navigation.navigate(tab.id)}
                activeOpacity={0.7}>
                <Text style={[styles.icon, isFocused && styles.iconActive]}>
                  {tab.icon}
                </Text>
                <Text
                  style={[styles.label, isFocused && styles.labelActive]}
                  numberOfLines={1}>
                  {tab.label}
                </Text>
                {isFocused && <View style={styles.activeBar} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Fade edges when scrollable */}
        {isOverflowing && (
          <>
            <LinearGradient
              colors={["rgba(15,10,30,0.95)", "rgba(15,10,30,0)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.fadeLeft}
              pointerEvents="none"
            />
            <LinearGradient
              colors={["rgba(15,10,30,0)", "rgba(15,10,30,0.95)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.fadeRight}
              pointerEvents="none"
            />
          </>
        )}
      </View>

      {/* Swipe hint */}
      {showPointer && shouldShowHint && (
        <Animated.View
          style={[
            styles.hintPill,
            { transform: [{ translateX }], opacity: pointerOpacity },
          ]}>
          <LinearGradient
            colors={["#f7d68f", "#d1b05e", "#b89950"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.hintText}>Swipe →</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  /* Outer wrapper – sits at the very bottom of the screen.
     paddingBottom is set dynamically from safe area insets
     so the bar clears the system nav on both gesture and
     3-button Android devices (and the home indicator on iOS). */
  wrapper: {
    backgroundColor: BRAND_COLORS.darkPurple,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.06)",
    elevation: 12,
    shadowColor: BRAND_COLORS.darkPurple,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },

  /* Fixed-height area that holds the scrollable tabs */
  tabArea: {
    height: TAB_BAR_HEIGHT,
    overflow: "hidden",
  },

  scrollContent: {
    paddingHorizontal: 6,
    alignItems: "center",
    height: TAB_BAR_HEIGHT,
  },

  tab: {
    width: 72,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingBottom: 6,
  },

  icon: {
    fontSize: 22,
    opacity: 0.45,
    marginBottom: 3,
  },
  iconActive: {
    opacity: 1,
  },

  label: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.35)",
  },
  labelActive: {
    color: "#d1b05e",
    fontWeight: "700",
  },

  /* Gold underline on active tab */
  activeBar: {
    position: "absolute",
    bottom: 4,
    width: 20,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#d1b05e",
  },

  fadeLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 28,
  },
  fadeRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 28,
  },

  hintPill: {
    position: "absolute",
    right: 14,
    top: 8,
    borderRadius: 16,
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 7,
    elevation: 6,
    shadowColor: BRAND_COLORS.darkPurple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  hintText: {
    fontSize: 12,
    fontWeight: "800",
    color: BRAND_COLORS.darkPurple,
  },
});
