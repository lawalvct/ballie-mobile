import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../theme/colors";
import { StatusBar } from "expo-status-bar";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    // TODO: Implement actual login logic
    setTimeout(() => {
      setIsLoading(false);
      console.log("Login:", { email, password });
    }, 1500);
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>₹</Text>
              </View>
            </View>
            <Text style={styles.title}>Ballie</Text>
            <Text style={styles.subtitle}>Welcome Back</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={BRAND_COLORS.lavender}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={BRAND_COLORS.lavender}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}>
              <LinearGradient
                colors={[BRAND_COLORS.gold, "#c9a556"]}
                style={styles.loginButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                <Text style={styles.loginButtonText}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Options */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>
                  📱 Continue with Phone
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>🔐 Biometric Login</Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Secure • Encrypted • Trusted by 10,000+ businesses
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
    backgroundColor: BRAND_COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 48,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: BRAND_COLORS.lavender,
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: BRAND_COLORS.lightBlue,
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BRAND_COLORS.violet,
  },
  dividerText: {
    color: BRAND_COLORS.lavender,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialContainer: {
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BRAND_COLORS.violet,
  },
  socialButtonText: {
    color: SEMANTIC_COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    color: BRAND_COLORS.lavender,
    fontSize: 14,
  },
  signupLink: {
    color: BRAND_COLORS.gold,
    fontSize: 14,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
  },
  footerText: {
    color: BRAND_COLORS.lavender,
    fontSize: 12,
    textAlign: "center",
  },
});
