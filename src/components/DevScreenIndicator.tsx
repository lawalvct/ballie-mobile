import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";

/**
 * Development mode indicator that shows the current screen name
 * Interactive controls: Tap to minimize/expand, Long press to move position
 * Only visible when __DEV__ is true
 */

// Only show in development
const isDev = __DEV__;

// Global state to track current screen
let currentScreenName = "Loading...";
const listeners: Array<(name: string) => void> = [];

export const updateScreenName = (name: string) => {
  currentScreenName = name;
  listeners.forEach((listener) => listener(name));
};

export const DevScreenIndicator: React.FC = () => {
  const [screenName, setScreenName] = useState(currentScreenName);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("top");

  useEffect(() => {
    const listener = (name: string) => setScreenName(name);
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  // Don't render in production
  if (!isDev) {
    return null;
  }

  const toggleMinimize = () => setIsMinimized(!isMinimized);
  const togglePosition = () =>
    setPosition(position === "top" ? "bottom" : "top");

  // Parse screen name to show segments
  const segments = screenName.split(" → ");
  const pathname = segments[segments.length - 1] || screenName;
  const segmentPath = segments.join(" → ");

  return (
    <View
      style={[
        styles.container,
        position === "top" ? styles.containerTop : styles.containerBottom,
      ]}
      pointerEvents="box-none">
      <TouchableOpacity
        onPress={toggleMinimize}
        onLongPress={togglePosition}
        activeOpacity={0.8}
        style={[styles.indicator, isMinimized && styles.indicatorMinimized]}>
        {isMinimized ? (
          <Text style={styles.minimizedText}>📱</Text>
        ) : (
          <>
            <Text style={styles.label}>DEV MODE</Text>
            <Text style={styles.path}>{pathname}</Text>
            {segments.length > 1 && (
              <Text style={styles.segments}>{segmentPath}</Text>
            )}
            <Text style={styles.hint}>
              Tap to minimize • Long press to move
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999999,
    pointerEvents: "box-none",
  },
  containerTop: {
    top: Platform.OS === "ios" ? 50 : 10,
  },
  containerBottom: {
    bottom: Platform.OS === "ios" ? 50 : 10,
  },
  indicator: {
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#00ff00",
    maxWidth: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 8,
  },
  indicatorMinimized: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  label: {
    color: "#00ff00",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 4,
    textAlign: "center",
  },
  path: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  segments: {
    color: "#aaaaaa",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 4,
  },
  hint: {
    color: "#666666",
    fontSize: 9,
    textAlign: "center",
    marginTop: 4,
  },
  minimizedText: {
    fontSize: 20,
  },
});
