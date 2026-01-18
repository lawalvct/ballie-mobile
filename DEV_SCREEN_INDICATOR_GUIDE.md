# Dev Screen Indicator - Implementation Guide

A lightweight, interactive development tool that displays the current screen/route name on your mobile app during development.

## 🎯 Features

- ✅ **Auto-detects current screen** using Expo Router
- ✅ **Shows route segments** (e.g., `auth → login`)
- ✅ **Development-only** - automatically disabled in production builds
- ✅ **Interactive controls**:
  - Tap to minimize/expand
  - Long press to move between top/bottom
- ✅ **Non-intrusive** - high z-index, semi-transparent
- ✅ **Zero configuration** required

## 📦 Installation

### Step 1: Create the Component

Create a new file: `components/DevScreenIndicator.tsx`

```tsx
import { usePathname, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Only show in development
const isDev = __DEV__;

export default function DevScreenIndicator() {
  const pathname = usePathname();
  const segments = useSegments();
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("top");

  // Don't render in production
  if (!isDev) return null;

  const screenName = pathname || "/";
  const segmentPath = segments.join(" → ") || "Root";

  const toggleMinimize = () => setIsMinimized(!isMinimized);
  const togglePosition = () =>
    setPosition(position === "top" ? "bottom" : "top");

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
            <Text style={styles.path}>{screenName}</Text>
            {segmentPath !== "Root" && (
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
}

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
```

### Step 2: Add to Root Layout

In your `app/_layout.tsx` (or main layout file):

```tsx
// Import at the top
import DevScreenIndicator from "@/components/DevScreenIndicator";

// Add inside your return statement, after other components
export default function RootLayout() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        {/* Your app navigation/screens */}
        <Stack />

        {/* Add the dev indicator last */}
        <DevScreenIndicator />
      </NavigationContainer>
    </ThemeProvider>
  );
}
```

**Example placement:**

```tsx
<NavThemeProvider value={NAV_THEME[colorScheme]}>
  <ThemeProvider theme={theme}>
    <Stack screenOptions={{ headerShown: false }} />
    <LoadingOverlay />
    <DevScreenIndicator /> {/* Add here */}
  </ThemeProvider>
</NavThemeProvider>
```

## 🎮 Usage

Once installed, the indicator appears automatically in development:

### Display States

**Expanded View:**

```
┌─────────────────────┐
│     DEV MODE        │
│   /user/profile     │
│  user → profile     │
│ Tap to minimize •   │
│ Long press to move  │
└─────────────────────┘
```

**Minimized View:**

```
┌─────┐
│  📱 │
└─────┘
```

### Controls

| Action         | Result                            |
| -------------- | --------------------------------- |
| **Tap**        | Toggle minimize/expand            |
| **Long Press** | Move between top/bottom of screen |

## 🎨 Customization

### Change Colors

```tsx
// Change border color
borderColor: "#ff0000", // Red

// Change background
backgroundColor: "rgba(255, 0, 0, 0.85)", // Red background

// Change text colors
label: { color: "#ff0000" }, // Red label
path: { color: "#ffffff" },  // White path
```

### Change Position Defaults

```tsx
// Start at bottom instead of top
const [position, setPosition] = useState<"top" | "bottom">("bottom");

// Start minimized
const [isMinimized, setIsMinimized] = useState(true);
```

### Adjust Positioning

```tsx
// For different safe area offsets
containerTop: {
  top: Platform.OS === "ios" ? 60 : 20, // Adjust these values
},
containerBottom: {
  bottom: Platform.OS === "ios" ? 60 : 20,
},
```

### Custom Screen Name Format

```tsx
// Show only last segment
const screenName = segments[segments.length - 1] || pathname;

// Uppercase
const screenName = (pathname || "/").toUpperCase();

// Remove slashes
const screenName = (pathname || "/").replace(/\//g, " > ");
```

## 🔧 Advanced Modifications

### Add Screen Metadata

```tsx
const [metadata, setMetadata] = useState<string>("");

useEffect(() => {
  // Add custom info (e.g., API status, user role)
  setMetadata(`User: ${userRole} | API: ${apiStatus}`);
}, [userRole, apiStatus]);

// Display in UI
{
  metadata && <Text style={styles.metadata}>{metadata}</Text>;
}
```

### Add Tap Counter

```tsx
const [tapCount, setTapCount] = useState(0);

const handleTap = () => {
  setTapCount((prev) => prev + 1);
  toggleMinimize();
};

// Show in minimized view
{
  isMinimized && tapCount > 0 && <Text style={styles.badge}>{tapCount}</Text>;
}
```

### Change Animation

```tsx
import Animated, { FadeIn, SlideInUp } from "react-native-reanimated";

return (
  <Animated.View entering={SlideInUp.duration(300)} style={styles.container}>
    {/* ... */}
  </Animated.View>
);
```

## 🚀 Requirements

- **Expo Router** (uses `usePathname` and `useSegments`)
- **React Native** 0.64+
- **Expo SDK** 48+

### For Non-Expo Projects

Replace the imports:

```tsx
// Instead of:
import { usePathname, useSegments } from "expo-router";

// Use React Navigation:
import { useRoute, useNavigationState } from "@react-navigation/native";

// Update logic:
const route = useRoute();
const screenName = route.name;
```

## 📝 Notes

- **Production Safety**: Uses `__DEV__` constant, automatically `false` in production
- **Performance**: Minimal re-renders, only updates on route changes
- **Z-Index**: Set to 999999 to ensure visibility above all UI elements
- **Pointer Events**: Uses `box-none` to allow touches to pass through to underlying UI

## 🐛 Troubleshooting

### Indicator Not Showing

1. Check `__DEV__` is `true`:

   ```tsx
   console.log("Dev mode:", __DEV__); // Should be true
   ```

2. Verify component is imported and rendered:

   ```tsx
   // Should be at bottom of your layout
   <DevScreenIndicator />
   ```

3. Check z-index conflicts - ensure no parent has `overflow: hidden`

### Wrong Screen Name

- Clear Metro bundler cache: `npx expo start -c`
- Restart development server

### Not Updating on Navigation

- Ensure you're using Expo Router navigation methods
- Check that the component is inside the navigation context

## 📄 License

Free to use in your projects. No attribution required.

---

**Questions?** Check the Expo Router docs: https://docs.expo.dev/router/introduction/
