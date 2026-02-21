import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const [showPointer, setShowPointer] = useState(true);
  const [pointerAnim] = useState(new Animated.Value(0));
  const [pointerOpacity] = useState(new Animated.Value(1));
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const insets = useSafeAreaInsets();

  // For Android with 3-button navigation, insets.bottom is often 0 even though
  // the navigation bar exists. We use a fixed minimum padding of 56dp for Android
  // which covers both gesture nav (~24dp) and 3-button nav (~48dp) with some buffer.
  // This ensures the tab bar is always tappable above the system navigation.
  const ANDROID_NAV_BAR_PADDING = 56;

  const bottomInset =
    Platform.OS === "android"
      ? Math.max(insets.bottom, ANDROID_NAV_BAR_PADDING)
      : insets.bottom;

  const tabs = [
    { id: "Dashboard", label: "Dashboard", icon: "📊" },
    { id: "Accounting", label: "Accounting", icon: "💰" },
    { id: "Inventory", label: "Inventory", icon: "📦" },
    // { id: "POS", label: "POS", icon: "💳" },
    { id: "CRM", label: "CRM", icon: "👥" },
    { id: "Payroll", label: "Payroll", icon: "💵" },
    { id: "Reports", label: "Reports", icon: "📈" },
    { id: "Audit", label: "Audit", icon: "🔍" },
    { id: "Ecommerce", label: "E-commerce", icon: "🛒" },

    { id: "Admins", label: "Admins", icon: "👔" },
    { id: "Statutory", label: "Statutory", icon: "📜" },
  ];

  const isOverflowing = useMemo(
    () => contentWidth > containerWidth + 8,
    [contentWidth, containerWidth],
  );
  const shouldShowHint = useMemo(() => {
    if (contentWidth === 0 || containerWidth === 0) {
      return tabs.length > 5;
    }
    return isOverflowing;
  }, [contentWidth, containerWidth, isOverflowing, tabs.length]);

  useEffect(() => {
    if (!shouldShowHint) {
      setShowPointer(false);
      return;
    }

    setShowPointer(true);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pointerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pointerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pointerOpacity, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pointerOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const timer = setTimeout(() => {
      Animated.timing(pointerOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setShowPointer(false));
    }, 5000);

    return () => clearTimeout(timer);
  }, [shouldShowHint, pointerAnim, pointerOpacity]);

  const handleScroll = () => {
    // Hide pointer when user starts scrolling
    setShowPointer(false);
  };

  const translateX = pointerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 12],
  });

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: bottomInset, height: 70 + bottomInset },
      ]}>
      <View
        style={styles.scrollWrapper}
        onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 10 + bottomInset },
          ]}
          onContentSizeChange={(width) => setContentWidth(width)}
          onScroll={handleScroll}
          scrollEventThrottle={16}>
          {tabs.map((tab, index) => {
            const isFocused = state.index === index;

            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tab}
                onPress={() => navigation.navigate(tab.id)}>
                <Text style={[styles.icon, isFocused && styles.activeIcon]}>
                  {tab.icon}
                </Text>
                <Text style={[styles.label, isFocused && styles.activeLabel]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isOverflowing && (
          <>
            <LinearGradient
              colors={["rgba(60, 44, 100, 0)", "rgba(60, 44, 100, 0.9)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rightFade}
              pointerEvents="none"
            />
            <LinearGradient
              colors={["rgba(60, 44, 100, 0.9)", "rgba(60, 44, 100, 0)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.leftFade}
              pointerEvents="none"
            />
          </>
        )}
      </View>

      {/* Scroll Indicator Pointer */}
      {showPointer && shouldShowHint && (
        <Animated.View
          style={[
            styles.pointerContainer,
            {
              transform: [{ translateX }],
              opacity: pointerOpacity,
            },
          ]}>
          <LinearGradient
            colors={["#f7d68f", "#d1b05e", "#b89950"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.pointerBackground}
          />
          <View style={styles.pointerContent}>
            <Text style={styles.pointerText}>Swipe tabs</Text>
            <Text style={styles.pointerArrow}>→</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#3c2c64",
    height: 70,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scrollWrapper: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingBottom: 10,
    paddingTop: 10,
    alignItems: "center",
  },
  tab: {
    minWidth: 80,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 24,
    opacity: 0.6,
    marginBottom: 4,
  },
  activeIcon: {
    opacity: 1,
  },
  label: {
    fontSize: 11,
    color: "#a48cb4",
    fontWeight: "600",
  },
  activeLabel: {
    color: "#d1b05e",
    fontWeight: "bold",
  },
  leftFade: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 30,
  },
  rightFade: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 36,
  },
  pointerContainer: {
    position: "absolute",
    right: 16,
    top: 10,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  pointerBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  pointerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pointerText: {
    fontSize: 13,
    color: "#2a1e4a",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  pointerArrow: {
    fontSize: 16,
    color: "#2a1e4a",
    fontWeight: "bold",
  },
});
