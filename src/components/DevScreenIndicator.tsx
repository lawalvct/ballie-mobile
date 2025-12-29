import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";

/**
 * Development mode indicator that shows the current screen name
 * Similar to Laravel Debugbar - shows current route/screen name
 * Only visible when __DEV__ is true
 */

// Global state to track current screen
let currentScreenName = "Loading...";
const listeners: Array<(name: string) => void> = [];

export const updateScreenName = (name: string) => {
  currentScreenName = name;
  listeners.forEach((listener) => listener(name));
};

export const DevScreenIndicator: React.FC = () => {
  const [screenName, setScreenName] = useState(currentScreenName);

  useEffect(() => {
    const listener = (name: string) => setScreenName(name);
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  // Only show in development mode
  if (!__DEV__) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>📱 {screenName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 40,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  text: {
    color: "#00ff00",
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "monospace",
  },
});
