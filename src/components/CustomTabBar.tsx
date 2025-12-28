import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";

interface TabBarProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export default function CustomTabBar({ activeTab, onTabPress }: TabBarProps) {
  const [showPointer, setShowPointer] = useState(true);
  const [pointerAnim] = useState(new Animated.Value(0));

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "accounting", label: "Accounting", icon: "💰" },
    { id: "inventory", label: "Inventory", icon: "📦" },
    { id: "pos", label: "POS", icon: "💳" },
    { id: "crm", label: "CRM", icon: "👥" },
    { id: "reports", label: "Reports", icon: "📈" },
    { id: "audit", label: "Audit", icon: "🔍" },
    { id: "ecommerce", label: "E-commerce", icon: "🛒" },
    { id: "payroll", label: "Payroll", icon: "💵" },
    { id: "admins", label: "Admins", icon: "👔" },
    { id: "statutory", label: "Statutory", icon: "📜" },
  ];

  useEffect(() => {
    // Start animation after component mounts
    Animated.loop(
      Animated.sequence([
        Animated.timing(pointerAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pointerAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Hide pointer after 4 seconds
    const timer = setTimeout(() => {
      setShowPointer(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleScroll = () => {
    // Hide pointer when user starts scrolling
    setShowPointer(false);
  };

  const translateX = pointerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onTabPress(tab.id)}>
            <Text
              style={[styles.icon, activeTab === tab.id && styles.activeIcon]}>
              {tab.icon}
            </Text>
            <Text
              style={[
                styles.label,
                activeTab === tab.id && styles.activeLabel,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Scroll Indicator Pointer */}
      {showPointer && (
        <Animated.View
          style={[styles.pointerContainer, { transform: [{ translateX }] }]}>
          <Text style={styles.pointerText}>→</Text>
          <Text style={styles.pointerHint}>Swipe for more</Text>
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
  pointerContainer: {
    position: "absolute",
    right: 10,
    top: "50%",
    marginTop: -20,
    alignItems: "center",
    backgroundColor: "rgba(209, 176, 94, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pointerText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  pointerHint: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
    marginTop: 2,
  },
});
