import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import { useChangePassword } from "../hooks/useProfile";

type Props = NativeStackScreenProps<ProfileStackParamList, "ChangePassword">;

export default function ChangePasswordScreen({ navigation }: Props) {
  const changePassword = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordStrength = (() => {
    if (newPassword.length === 0) return null;
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/\d/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    if (score <= 1) return { label: "Weak", color: "#ef4444" };
    if (score <= 2) return { label: "Fair", color: "#f59e0b" };
    if (score <= 3) return { label: "Good", color: "#3b82f6" };
    return { label: "Strong", color: "#22c55e" };
  })();

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    confirmPassword === newPassword &&
    !changePassword.isPending;

  const handleSubmit = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    changePassword.mutate(
      {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Password changed successfully.", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#1a0f33", "#2d1f5e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            {/* Current Password */}
            <Text style={styles.fieldLabel}>Current Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showCurrent}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowCurrent(!showCurrent)}>
                <Text style={styles.eyeText}>{showCurrent ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>

            {/* New Password */}
            <Text style={[styles.fieldLabel, { marginTop: 20 }]}>New Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showNew}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowNew(!showNew)}>
                <Text style={styles.eyeText}>{showNew ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>
            {passwordStrength && (
              <View style={styles.strengthRow}>
                <View style={styles.strengthBarTrack}>
                  <View
                    style={[
                      styles.strengthBarFill,
                      {
                        backgroundColor: passwordStrength.color,
                        width:
                          passwordStrength.label === "Weak"
                            ? "25%"
                            : passwordStrength.label === "Fair"
                              ? "50%"
                              : passwordStrength.label === "Good"
                                ? "75%"
                                : "100%",
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                  {passwordStrength.label}
                </Text>
              </View>
            )}

            {/* Confirm Password */}
            <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Confirm New Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter new password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowConfirm(!showConfirm)}>
                <Text style={styles.eyeText}>{showConfirm ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && confirmPassword !== newPassword && (
              <Text style={styles.mismatchText}>Passwords do not match</Text>
            )}
          </View>

          {/* Requirements */}
          <View style={styles.requirementsCard}>
            <Text style={styles.reqTitle}>Password Requirements</Text>
            <Requirement met={newPassword.length >= 8} text="At least 8 characters" />
            <Requirement met={/[A-Z]/.test(newPassword)} text="One uppercase letter" />
            <Requirement met={/\d/.test(newPassword)} text="One number" />
            <Requirement
              met={/[^A-Za-z0-9]/.test(newPassword)}
              text="One special character"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={!canSubmit}>
            <Text style={styles.submitBtnText}>
              {changePassword.isPending ? "Updating…" : "Update Password"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Requirement({ met, text }: { met: boolean; text: string }) {
  return (
    <View style={styles.reqRow}>
      <Text style={{ color: met ? "#22c55e" : "#9ca3af", fontSize: 14 }}>
        {met ? "✓" : "○"}
      </Text>
      <Text style={[styles.reqText, met && styles.reqTextMet]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1a0f33" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 32, color: "#fff", marginTop: -4 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },

  body: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -1,
  },
  bodyContent: { paddingTop: 24 },

  formCard: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1f2937",
  },
  eyeBtn: { paddingHorizontal: 12, paddingVertical: 10 },
  eyeText: { fontSize: 18 },

  strengthRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 10 },
  strengthBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthBarFill: { height: "100%", borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: "600" },

  mismatchText: { fontSize: 12, color: "#ef4444", marginTop: 6 },

  requirementsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  reqTitle: { fontSize: 14, fontWeight: "700", color: "#374151", marginBottom: 12 },
  reqRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  reqText: { fontSize: 13, color: "#9ca3af" },
  reqTextMet: { color: "#374151" },

  submitBtn: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: BRAND_COLORS.gold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 16, fontWeight: "700", color: "#1a0f33" },
});
