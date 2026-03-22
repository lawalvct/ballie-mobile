import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
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
import { useResendVerification, useVerifyEmail } from "../hooks/useProfile";

type Props = NativeStackScreenProps<ProfileStackParamList, "EmailVerification">;

const CODE_LENGTH = 4;
const COOLDOWN_SECONDS = 60;

export default function EmailVerificationScreen({ navigation }: Props) {
  const resendVerification = useResendVerification();
  const verifyEmail = useVerifyEmail();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback(() => {
    setCooldown(COOLDOWN_SECONDS);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleCodeChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste of full code
      const pasted = value.replace(/\D/g, "").slice(0, CODE_LENGTH);
      if (pasted.length > 0) {
        const newCode = Array(CODE_LENGTH).fill("");
        pasted.split("").forEach((char, i) => {
          newCode[i] = char;
        });
        setCode(newCode);
        if (pasted.length === CODE_LENGTH) {
          submitCode(newCode.join(""));
        } else {
          inputRefs.current[pasted.length]?.focus();
        }
        return;
      }
    }

    const digit = value.replace(/\D/g, "");
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newCode.join("");
    if (fullCode.length === CODE_LENGTH) {
      submitCode(fullCode);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const submitCode = (fullCode: string) => {
    verifyEmail.mutate(
      fullCode,
      {
        onSuccess: () => {
          Alert.alert("Verified!", "Your email has been verified.", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
        },
        onError: () => {
          setCode(Array(CODE_LENGTH).fill(""));
          inputRefs.current[0]?.focus();
        },
      },
    );
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    resendVerification.mutate(undefined, {
      onSuccess: () => {
        startCooldown();
        Alert.alert("Sent", "A new verification code has been sent to your email.");
      },
    });
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
        <Text style={styles.headerTitle}>Email Verification</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✉️</Text>
          </View>

          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            Enter the 4-digit code sent to your email address. The code expires in 60
            minutes.
          </Text>

          {/* OTP Inputs */}
          <View style={styles.codeRow}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.codeInput,
                  digit !== "" && styles.codeInputFilled,
                  verifyEmail.isError && styles.codeInputError,
                ]}
                value={digit}
                onChangeText={(val) => handleCodeChange(val, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={index === 0 ? CODE_LENGTH : 1} // allow paste on first input
                textContentType="oneTimeCode"
                autoFocus={index === 0}
              />
            ))}
          </View>

          {verifyEmail.isError && (
            <Text style={styles.errorText}>
              Invalid or expired verification code. Please try again.
            </Text>
          )}

          {verifyEmail.isPending && (
            <Text style={styles.verifyingText}>Verifying…</Text>
          )}

          {/* Resend */}
          <TouchableOpacity
            style={[styles.resendBtn, cooldown > 0 && styles.resendBtnDisabled]}
            onPress={handleResend}
            disabled={cooldown > 0 || resendVerification.isPending}>
            <Text
              style={[
                styles.resendText,
                cooldown > 0 && styles.resendTextDisabled,
              ]}>
              {resendVerification.isPending
                ? "Sending…"
                : cooldown > 0
                  ? `Resend Code in ${cooldown}s`
                  : "Resend Verification Code"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(209,176,94,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  iconText: { fontSize: 36 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 36,
  },

  codeRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 24,
  },
  codeInput: {
    width: 58,
    height: 62,
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 14,
    textAlign: "center",
    fontSize: 26,
    fontWeight: "700",
    color: "#1f2937",
    backgroundColor: "#fff",
  },
  codeInputFilled: {
    borderColor: BRAND_COLORS.gold,
    backgroundColor: "rgba(209,176,94,0.06)",
  },
  codeInputError: {
    borderColor: "#ef4444",
  },

  errorText: {
    fontSize: 13,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 16,
  },
  verifyingText: {
    fontSize: 14,
    color: BRAND_COLORS.gold,
    fontWeight: "600",
    marginBottom: 16,
  },

  resendBtn: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  resendBtnDisabled: {
    backgroundColor: "#e5e7eb",
  },
  resendText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  resendTextDisabled: {
    color: "#9ca3af",
  },
});
