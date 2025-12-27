import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../theme/colors";
import { StatusBar } from "expo-status-bar";
import { authAPI } from "../api/endpoints/auth";

interface ForgotPasswordScreenProps {
  onBack: () => void;
}

export default function ForgotPasswordScreen({
  onBack,
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.forgotPassword(email);

      setEmailSent(true);
      Alert.alert(
        "Success!",
        response.message ||
          "Password reset instructions have been sent to your email.",
        [
          {
            text: "OK",
            onPress: () => {
              // Wait a moment then navigate back
              setTimeout(() => {
                onBack();
              }, 1000);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Forgot password error:", error);
      const errorMessage =
        error?.message ||
        error?.error ||
        "Failed to send reset instructions. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[BRAND_COLORS.darkPurple, BRAND_COLORS.deepPurple]}
      style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back to Login</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Image
                  source={require("../../assets/images/ballie_logo.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              {emailSent
                ? "Check your email for reset instructions"
                : "Enter your email and we'll send you instructions to reset your password"}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {!emailSent && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor={BRAND_COLORS.lavender}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!isLoading}
                  />
                </View>

                {/* Reset Button */}
                <TouchableOpacity
                  style={[
                    styles.resetButton,
                    isLoading && styles.resetButtonDisabled,
                  ]}
                  onPress={handleResetPassword}
                  disabled={isLoading}>
                  <LinearGradient
                    colors={[BRAND_COLORS.gold, "#c9a556"]}
                    style={styles.resetButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}>
                    <Text style={styles.resetButtonText}>
                      {isLoading ? "Sending..." : "Send Reset Instructions"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {emailSent && (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Text style={styles.successIconText}>✓</Text>
                </View>
                <Text style={styles.successTitle}>Email Sent!</Text>
                <Text style={styles.successMessage}>
                  We've sent password reset instructions to:
                </Text>
                <Text style={styles.emailText}>{email}</Text>
                <Text style={styles.successMessage}>
                  Please check your inbox and follow the instructions to reset
                  your password.
                </Text>

                <TouchableOpacity
                  style={styles.backToLoginButton}
                  onPress={onBack}>
                  <Text style={styles.backToLoginText}>
                    Back to Login Screen
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Additional Help */}
          {!emailSent && (
            <View style={styles.helpContainer}>
              <Text style={styles.helpText}>
                💡 Remember your password?{" "}
                <Text style={styles.helpLink} onPress={onBack}>
                  Sign In
                </Text>
              </Text>
              <Text style={styles.helpText}>
                Need help? Contact support at{"\n"}
                <Text style={styles.helpLink}>support@ballie.ng</Text>
              </Text>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              🔒 Secure password recovery process
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: BRAND_COLORS.lightBlue,
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: SEMANTIC_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 12,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    color: BRAND_COLORS.lavender,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: SEMANTIC_COLORS.white,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: SEMANTIC_COLORS.white,
    borderWidth: 1,
    borderColor: BRAND_COLORS.violet,
  },
  resetButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: SEMANTIC_COLORS.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successIconText: {
    fontSize: 48,
    color: SEMANTIC_COLORS.white,
    fontWeight: "bold",
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 15,
    color: BRAND_COLORS.lavender,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  emailText: {
    fontSize: 16,
    color: BRAND_COLORS.gold,
    fontWeight: "600",
    marginBottom: 12,
  },
  backToLoginButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BRAND_COLORS.lightBlue,
  },
  backToLoginText: {
    color: BRAND_COLORS.lightBlue,
    fontSize: 16,
    fontWeight: "600",
  },
  helpContainer: {
    alignItems: "center",
    marginTop: 24,
    gap: 16,
  },
  helpText: {
    color: BRAND_COLORS.lavender,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  helpLink: {
    color: BRAND_COLORS.lightBlue,
    fontWeight: "600",
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
  footerText: {
    color: BRAND_COLORS.lavender,
    fontSize: 12,
    textAlign: "center",
  },
});
