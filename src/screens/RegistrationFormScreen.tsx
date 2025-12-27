import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../theme/colors";

interface RegistrationFormData {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  phone: string;
  businessName: string;
  businessStructure: string;
}

interface RegistrationFormScreenProps {
  onNext: (formData: RegistrationFormData) => void;
  onBack: () => void;
}

const BUSINESS_STRUCTURES = [
  "Sole Proprietorship",
  "Limited Liability Company (LLC)",
  "Partnership",
  "Corporation",
  "Other",
];

export default function RegistrationFormScreen({
  onNext,
  onBack,
}: RegistrationFormScreenProps) {
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    phone: "",
    businessName: "",
    businessStructure: "",
  });
  const [showStructurePicker, setShowStructurePicker] = useState(false);

  const updateField = (field: keyof RegistrationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Please enter your name");
      return false;
    }

    if (!formData.email.trim()) {
      Alert.alert("Validation Error", "Please enter your email");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return false;
    }

    if (!formData.password) {
      Alert.alert("Validation Error", "Please enter a password");
      return false;
    }

    if (formData.password.length < 8) {
      Alert.alert(
        "Validation Error",
        "Password must be at least 8 characters long"
      );
      return false;
    }

    if (formData.password !== formData.passwordConfirmation) {
      Alert.alert("Validation Error", "Passwords do not match");
      return false;
    }

    if (!formData.businessName.trim()) {
      Alert.alert("Validation Error", "Please enter your business name");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData);
    }
  };

  return (
    <LinearGradient colors={["#3c2c64", "#4a3570"]} style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>Step 2 of 3</Text>
        </View>

        {/* Form */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Personal Information Section */}
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Full Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor={BRAND_COLORS.lavender}
              value={formData.name}
              onChangeText={(text) => updateField("name", text)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Email <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={BRAND_COLORS.lavender}
              value={formData.email}
              onChangeText={(text) => updateField("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Password <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Minimum 8 characters"
              placeholderTextColor={BRAND_COLORS.lavender}
              value={formData.password}
              onChangeText={(text) => updateField("password", text)}
              secureTextEntry
              autoComplete="password-new"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Confirm Password <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter password"
              placeholderTextColor={BRAND_COLORS.lavender}
              value={formData.passwordConfirmation}
              onChangeText={(text) => updateField("passwordConfirmation", text)}
              secureTextEntry
              autoComplete="password-new"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="08012345678"
              placeholderTextColor={BRAND_COLORS.lavender}
              value={formData.phone}
              onChangeText={(text) => updateField("phone", text)}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>

          {/* Business Information Section */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Business Information
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Business Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Your Company Name"
              placeholderTextColor={BRAND_COLORS.lavender}
              value={formData.businessName}
              onChangeText={(text) => updateField("businessName", text)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Structure (Optional)</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowStructurePicker(true)}>
              <Text style={styles.dropdownButtonText}>
                {formData.businessStructure || "Select structure..."}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Structure Picker Modal */}
          <Modal
            visible={showStructurePicker}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowStructurePicker(false)}>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowStructurePicker(false)}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Business Structure</Text>
                {BUSINESS_STRUCTURES.map((structure) => (
                  <TouchableOpacity
                    key={structure}
                    style={styles.modalItem}
                    onPress={() => {
                      updateField("businessStructure", structure);
                      setShowStructurePicker(false);
                    }}>
                    <Text style={styles.modalItemText}>{structure}</Text>
                    {formData.businessStructure === structure && (
                      <Text style={styles.modalItemCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
                {formData.businessStructure && (
                  <TouchableOpacity
                    style={styles.modalClearButton}
                    onPress={() => {
                      updateField("businessStructure", "");
                      setShowStructurePicker(false);
                    }}>
                    <Text style={styles.modalClearText}>Clear Selection</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          </Modal>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ All information can be updated later in your account settings
            </Text>
          </View>
        </ScrollView>

        {/* Next Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <LinearGradient
              colors={["#d1b05e", "#c9a556"]}
              style={styles.nextButtonGradient}>
              <Text style={styles.nextButtonText}>Continue to Plans</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: BRAND_COLORS.lightBlue,
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: BRAND_COLORS.gold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 16,
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
  required: {
    color: SEMANTIC_COLORS.error,
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
  dropdownButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BRAND_COLORS.violet,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: SEMANTIC_COLORS.white,
  },
  dropdownIcon: {
    fontSize: 12,
    color: BRAND_COLORS.lavender,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalItemText: {
    fontSize: 16,
    color: BRAND_COLORS.darkPurple,
  },
  modalItemCheck: {
    fontSize: 18,
    color: BRAND_COLORS.gold,
    fontWeight: "bold",
  },
  modalClearButton: {
    marginTop: 12,
    padding: 16,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 8,
    alignItems: "center",
  },
  modalClearText: {
    fontSize: 16,
    fontWeight: "600",
    color: SEMANTIC_COLORS.error,
  },
  infoBox: {
    backgroundColor: "rgba(164, 140, 180, 0.2)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BRAND_COLORS.lavender,
    marginTop: 8,
  },
  infoText: {
    color: BRAND_COLORS.lavender,
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  nextButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
});
