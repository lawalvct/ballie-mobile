import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, Alert } from "react-native";
import Splash1 from "./src/screens/Splash1";
import Splash2 from "./src/screens/Splash2";
import LoginScreen from "./src/screens/LoginScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import BusinessTypeScreen from "./src/screens/BusinessTypeScreen";
import RegistrationFormScreen from "./src/screens/RegistrationFormScreen";
import PlanSelectionScreen from "./src/screens/PlanSelectionScreen";
import MainNavigator from "./src/screens/MainNavigator";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { authAPI } from "./src/api/endpoints/auth";
import { BRAND_COLORS } from "./src/theme/colors";

type Screen =
  | "splash1"
  | "splash2"
  | "login"
  | "forgotPassword"
  | "businessType"
  | "registrationForm"
  | "planSelection";

interface RegistrationData {
  businessTypeId?: number;
  name?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
  phone?: string;
  businessName?: string;
  businessStructure?: string;
  planId?: number;
  terms?: boolean;
}

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash1");
  const [registrationData, setRegistrationData] = useState<RegistrationData>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, isLoading, login } = useAuth();

  // Registration flow handlers
  const handleBusinessTypeSelected = (businessTypeId: number) => {
    setRegistrationData({ ...registrationData, businessTypeId });
    setCurrentScreen("registrationForm");
  };

  const handleFormCompleted = (formData: any) => {
    setRegistrationData({
      ...registrationData,
      name: formData.name,
      email: formData.email,
      password: formData.password,
      passwordConfirmation: formData.passwordConfirmation,
      phone: formData.phone,
      businessName: formData.businessName,
      businessStructure: formData.businessStructure,
    });
    setCurrentScreen("planSelection");
  };

  const handlePlanSelected = async (planId: number, termsAccepted: boolean) => {
    setIsSubmitting(true);
    try {
      const response = await authAPI.register({
        business_type_id: registrationData.businessTypeId!,
        business_structure: registrationData.businessStructure,
        name: registrationData.name!,
        email: registrationData.email!,
        password: registrationData.password!,
        password_confirmation: registrationData.passwordConfirmation!,
        business_name: registrationData.businessName!,
        phone: registrationData.phone,
        plan_id: planId,
        terms: termsAccepted,
        device_name: "Ballie Mobile App",
      });

      // Login user with response
      await login(
        response.data.token,
        response.data.user,
        response.data.tenant
      );

      Alert.alert(
        "Welcome to Ballie! 🎉",
        response.data.message ||
          "Registration successful! Your 30-day free trial has started."
      );
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage =
        error?.message ||
        error?.error ||
        "Registration failed. Please try again.";
      Alert.alert("Registration Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // If authenticated, show main navigator with tabs
  if (isAuthenticated) {
    return (
      <>
        <StatusBar style="light" />
        <MainNavigator />
      </>
    );
  }

  const renderScreen = () => {
    if (isSubmitting) {
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

    switch (currentScreen) {
      case "splash1":
        return <Splash1 onNext={() => setCurrentScreen("splash2")} />;
      case "splash2":
        return <Splash2 onNext={() => setCurrentScreen("login")} />;
      case "login":
        return (
          <LoginScreen
            onForgotPassword={() => setCurrentScreen("forgotPassword")}
            onSignUp={() => setCurrentScreen("businessType")}
          />
        );
      case "forgotPassword":
        return (
          <ForgotPasswordScreen onBack={() => setCurrentScreen("login")} />
        );
      case "businessType":
        return (
          <BusinessTypeScreen
            onNext={handleBusinessTypeSelected}
            onBack={() => setCurrentScreen("login")}
          />
        );
      case "registrationForm":
        return (
          <RegistrationFormScreen
            onNext={handleFormCompleted}
            onBack={() => setCurrentScreen("businessType")}
          />
        );
      case "planSelection":
        return (
          <PlanSelectionScreen
            onNext={handlePlanSelected}
            onBack={() => setCurrentScreen("registrationForm")}
          />
        );
      default:
        return (
          <LoginScreen
            onForgotPassword={() => setCurrentScreen("forgotPassword")}
            onSignUp={() => setCurrentScreen("businessType")}
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
