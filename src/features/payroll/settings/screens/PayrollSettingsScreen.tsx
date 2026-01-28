import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { payrollSettingsService } from "../services/payrollSettingsService";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<PayrollStackParamList, "PayrollSettings">;

const PLACEHOLDER_HELPERS = [
  "{YYYY} full year",
  "{YY} short year",
  "{MM} month",
  "{####} sequential number (4 digits)",
  "{###} sequential number (3 digits)",
];

export default function PayrollSettingsScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [employeeNumberFormat, setEmployeeNumberFormat] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await payrollSettingsService.get();
      setEmployeeNumberFormat(
        response.settings?.employee_number_format || "EMP-{YYYY}-{####}",
      );
    } catch (error: any) {
      showToast(error.message || "Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!employeeNumberFormat.trim()) {
      showToast("Employee number format is required", "error");
      return;
    }

    try {
      setSubmitting(true);
      await payrollSettingsService.update({
        employee_number_format: employeeNumberFormat.trim(),
      });
      showToast("Payroll settings updated", "success");
      navigation.goBack();
    } catch (error: any) {
      showToast(error.message || "Failed to update settings", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payroll Settings</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_COLORS.darkPurple}
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payroll Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Employee Number Format</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Format</Text>
            <TextInput
              style={styles.input}
              value={employeeNumberFormat}
              onChangeText={setEmployeeNumberFormat}
              placeholder="EMP-{YYYY}-{####}"
              autoCapitalize="characters"
            />
            <Text style={styles.helperText}>
              Use placeholders below to build the format.
            </Text>
          </View>

          <View style={styles.helperBox}>
            {PLACEHOLDER_HELPERS.map((item) => (
              <Text key={item} style={styles.helperItem}>
                • {item}
              </Text>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, submitting && styles.submitDisabled]}
            onPress={handleSave}
            disabled={submitting}>
            <Text style={styles.primaryBtnText}>
              {submitting ? "Saving..." : "Save Settings"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: SEMANTIC_COLORS.white,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
  },
  helperBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  helperItem: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 6,
  },
  primaryBtn: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  submitDisabled: {
    opacity: 0.7,
  },
});
