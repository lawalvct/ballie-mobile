import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import Splash1 from "./src/screens/Splash1";
import Splash2 from "./src/screens/Splash2";
import LoginScreen from "./src/screens/LoginScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { BRAND_COLORS } from "./src/theme/colors";

type Screen = "splash1" | "splash2" | "login" | "forgotPassword";

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash1");
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: BRAND_COLORS.darkPurple,
        }}>
        <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
      </View>
    );
  }

  // If authenticated, show dashboard
  if (isAuthenticated) {
    return (
      <>
        <StatusBar style="light" />
        <DashboardScreen />
      </>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case "splash1":
        return <Splash1 onNext={() => setCurrentScreen("splash2")} />;
      case "splash2":
        return <Splash2 onNext={() => setCurrentScreen("login")} />;
      case "login":
        return (
          <LoginScreen
            onForgotPassword={() => setCurrentScreen("forgotPassword")}
          />
        );
      case "forgotPassword":
        return (
          <ForgotPasswordScreen onBack={() => setCurrentScreen("login")} />
        );
      default:
        return (
          <LoginScreen
            onForgotPassword={() => setCurrentScreen("forgotPassword")}
          />
        );
    }
  };

  return (
    <>
      <StatusBar style="light" />
      {renderScreen()}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
