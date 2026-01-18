import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import Splash1 from "./src/screens/Splash1";
import Splash2 from "./src/screens/Splash2";
import LoginScreen from "./src/screens/LoginScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import BusinessTypeScreen from "./src/screens/BusinessTypeScreen";
import RegistrationFormScreen from "./src/screens/RegistrationFormScreen";
import PlanSelectionScreen from "./src/screens/PlanSelectionScreen";
import OnboardingWelcomeScreen from "./src/screens/OnboardingWelcomeScreen";
import OnboardingCompanyScreen from "./src/screens/OnboardingCompanyScreen";
import OnboardingPreferencesScreen from "./src/screens/OnboardingPreferencesScreen";
import OnboardingCompleteScreen from "./src/screens/OnboardingCompleteScreen";
import MainNavigator from "./src/screens/MainNavigator";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { authAPI } from "./src/api/endpoints/auth";
import { onboardingAPI } from "./src/api/endpoints/onboarding";
import { BRAND_COLORS } from "./src/theme/colors";
import { updateScreenName } from "./src/components/DevScreenIndicator";
import { SafeAreaProvider } from "react-native-safe-area-context";

type Screen =
  | "splash1"
  | "splash2"
  | "login"
  | "forgotPassword"
  | "businessType"
  | "registrationForm"
  | "planSelection"
  | "onboardingWelcome"
  | "onboardingCompany"
  | "onboardingPreferences"
  | "onboardingComplete";

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
  const {
    isAuthenticated,
    isLoading,
    login,
    tenant,
    needsOnboarding,
    setNeedsOnboarding,
  } = useAuth();

  // Check onboarding status when authenticated
  useEffect(() => {
    const checkOnboarding = async () => {
      if (isAuthenticated && tenant?.slug) {
        // Skip check if we just completed registration (needsOnboarding is already set)
        if (needsOnboarding && currentScreen === "onboardingWelcome") {
          return;
        }

        try {
          const response = await onboardingAPI.getStatus(tenant.slug);
          const data = response.data;

          if (!data.onboarding_completed) {
            setNeedsOnboarding(true);

            // If current step is "complete", go directly to completion screen
            if (data.current_step === "complete") {
              setCurrentScreen("onboardingComplete");
            } else if (data.current_step === "preferences") {
              setCurrentScreen("onboardingPreferences");
            } else if (data.current_step === "company") {
              setCurrentScreen("onboardingCompany");
            } else {
              setCurrentScreen("onboardingWelcome");
            }
          } else {
            setNeedsOnboarding(false);
          }
        } catch (error) {
          console.error("Error checking onboarding:", error);
        }
      }
    };
    checkOnboarding();
  }, [isAuthenticated, tenant]);

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

      // After registration, always start at onboarding welcome
      setNeedsOnboarding(true);
      setCurrentScreen("onboardingWelcome");

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

  // Onboarding flow handlers
  const handleGuidedSetup = () => {
    setCurrentScreen("onboardingCompany");
  };

  const handleQuickStart = async () => {
    if (!tenant?.slug) return;

    setIsSubmitting(true);
    try {
      const response = await onboardingAPI.skip(tenant.slug);
      Alert.alert(
        "Setup Complete! ✅",
        response.data.data?.message || "Your business is ready to go!"
      );
      setNeedsOnboarding(false);
      setCurrentScreen("onboardingComplete");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to skip onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnboardingComplete = async () => {
    if (!tenant?.slug) {
      Alert.alert("Error", "Tenant information not found. Please login again.");
      return;
    }

    try {
      const response = await onboardingAPI.complete(tenant.slug);
      console.log("Onboarding complete response:", response);
      setNeedsOnboarding(false);
    } catch (error: any) {
      console.error("Error completing onboarding:", error);

      let errorMessage = "Failed to complete onboarding";
      if (error.response?.data) {
        const data = error.response.data;
        if (data.errors && typeof data.errors === "object") {
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]) => {
              const fieldName = field
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
              return `${fieldName}: ${
                Array.isArray(messages) ? messages[0] : messages
              }`;
            })
            .join("\n");
          errorMessage = errorMessages;
        } else if (data.message) {
          errorMessage = data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show error but allow user to proceed to dashboard
      Alert.alert(
        "Warning",
        errorMessage + "\n\nWould you like to proceed to the dashboard anyway?",
        [
          {
            text: "Try Again",
            style: "cancel",
          },
          {
            text: "Proceed to Dashboard",
            onPress: () => setNeedsOnboarding(false),
          },
        ]
      );
    }
  };

  const handleCompanyInfoNext = () => {
    setCurrentScreen("onboardingPreferences");
  };

  const handlePreferencesNext = () => {
    setCurrentScreen("onboardingComplete");
  };

  const handleCompanyBack = () => {
    setCurrentScreen("onboardingWelcome");
  };

  const handlePreferencesBack = () => {
    setCurrentScreen("onboardingCompany");
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

  // If authenticated and onboarding complete, show main navigator
  if (isAuthenticated && !needsOnboarding) {
    return (
      <NavigationContainer
        onStateChange={(state) => {
          if (state) {
            const currentRoute = state.routes[state.index];
            if (currentRoute.state) {
              const nestedState = currentRoute.state as any;
              const nestedRoute = nestedState.routes[nestedState.index];
              updateScreenName(`${currentRoute.name} → ${nestedRoute.name}`);
            } else {
              updateScreenName(currentRoute.name);
            }
          }
        }}>
        <StatusBar style="light" />
        <MainNavigator />
      </NavigationContainer>
    );
  }

  // If authenticated but needs onboarding
  if (isAuthenticated && needsOnboarding) {
    return (
      <>
        <StatusBar style="light" />
        {currentScreen === "onboardingWelcome" && (
          <OnboardingWelcomeScreen
            onGuidedSetup={handleGuidedSetup}
            onQuickStart={handleQuickStart}
          />
        )}
        {currentScreen === "onboardingCompany" && tenant && (
          <OnboardingCompanyScreen
            tenantSlug={tenant.slug}
            onNext={handleCompanyInfoNext}
            onBack={handleCompanyBack}
          />
        )}
        {currentScreen === "onboardingPreferences" && tenant && (
          <OnboardingPreferencesScreen
            tenantSlug={tenant.slug}
            onNext={handlePreferencesNext}
            onBack={handlePreferencesBack}
          />
        )}
        {currentScreen === "onboardingComplete" && (
          <OnboardingCompleteScreen onComplete={handleOnboardingComplete} />
        )}
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
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
