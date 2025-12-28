import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { onboardingAPI } from "../api/endpoints/onboarding";
import { useAuth } from "../context/AuthContext";

interface OnboardingCompanyScreenProps {
  tenantSlug: string;
  onNext: () => void;
  onBack: () => void;
}

interface CompanyFormData {
  logoUri: string;
  logoBase64: string;
  companyName: string;
  businessStructure: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  registrationNumber: string;
  taxId: string;
}

const BUSINESS_STRUCTURES = [
  "Sole Proprietorship",
  "Partnership",
  "LLC",
  "Corporation",
  "Other",
];

export default function OnboardingCompanyScreen({
  tenantSlug,
  onNext,
  onBack,
}: OnboardingCompanyScreenProps) {
  const { user, tenant } = useAuth();

  const [formData, setFormData] = useState<CompanyFormData>({
    logoUri: "",
    logoBase64: "",
    companyName: tenant?.name || "",
    businessStructure: "",
    email: user?.email || "",
    phone: user?.phone || "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    registrationNumber: "",
    taxId: "",
  });
  const [showStructurePicker, setShowStructurePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to upload a logo."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;

      try {
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: "base64",
        });

        setFormData({
          ...formData,
          logoUri: imageUri,
          logoBase64: base64,
        });
      } catch (error) {
        console.error("Image processing error:", error);
        Alert.alert("Error", "Failed to process image. Please try again.");
      }
    }
  };

  const validateForm = (): boolean => {
    if (!formData.companyName.trim()) {
      Alert.alert("Validation Error", "Company name is required");
      return false;
    }

    if (!formData.businessStructure) {
      Alert.alert("Validation Error", "Please select a business structure");
      return false;
    }

    if (!formData.email.trim()) {
      Alert.alert("Validation Error", "Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return false;
    }

    if (!formData.phone.trim()) {
      Alert.alert("Validation Error", "Phone number is required");
      return false;
    }

    if (formData.website && formData.website.trim()) {
      const urlRegex =
        /^(https?:\/\/)?([-\w.]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
      if (!urlRegex.test(formData.website)) {
        Alert.alert("Validation Error", "Please enter a valid website URL");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await onboardingAPI.saveCompanyInfo(tenantSlug, {
        logo_base64: formData.logoBase64,
        company_name: formData.companyName,
        business_structure: formData.businessStructure,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postal_code: formData.postalCode,
        registration_number: formData.registrationNumber,
        tax_id: formData.taxId,
      });

      onNext();
    } catch (error: any) {
      // Handle validation errors from backend
      let errorMessage = "Failed to save company information";

      if (error.response?.data) {
        const data = error.response.data;

        // Check if there are specific field errors
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

      Alert.alert("Validation Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#3c2c64", "#2a1f4a"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Company Information</Text>
          <Text style={styles.subtitle}>Tell us about your business</Text>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
          <View style={styles.progressLine} />
          <View style={styles.progressDotInactive} />
          <View style={styles.progressLine} />
          <View style={styles.progressDotInactive} />
        </View>
        <Text style={styles.progressText}>Step 1 of 2</Text>

        {/* Logo Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Logo</Text>
          <TouchableOpacity style={styles.logoUpload} onPress={pickImage}>
            {formData.logoUri ? (
              <Image
                source={{ uri: formData.logoUri }}
                style={styles.logoImage}
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoIcon}>📷</Text>
                <Text style={styles.logoText}>Upload Logo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Text style={styles.label}>
            Company Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.companyName}
            onChangeText={(text) =>
              setFormData({ ...formData, companyName: text })
            }
            placeholder="Enter company name"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>
            Business Structure <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowStructurePicker(true)}>
            <Text
              style={
                formData.businessStructure
                  ? styles.inputText
                  : styles.placeholderText
              }>
              {formData.businessStructure || "Select business structure"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>
            Email <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="company@example.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>
            Phone <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="+234 XXX XXX XXXX"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Website</Text>
          <TextInput
            style={styles.input}
            value={formData.website}
            onChangeText={(text) => setFormData({ ...formData, website: text })}
            placeholder="https://www.example.com"
            placeholderTextColor="#999"
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        {/* Address Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Information</Text>

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="Street address"
            placeholderTextColor="#999"
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) =>
                  setFormData({ ...formData, city: text })
                }
                placeholder="City"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                value={formData.state}
                onChangeText={(text) =>
                  setFormData({ ...formData, state: text })
                }
                placeholder="State"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Country</Text>
              <TextInput
                style={styles.input}
                value={formData.country}
                onChangeText={(text) =>
                  setFormData({ ...formData, country: text })
                }
                placeholder="Country"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Postal Code</Text>
              <TextInput
                style={styles.input}
                value={formData.postalCode}
                onChangeText={(text) =>
                  setFormData({ ...formData, postalCode: text })
                }
                placeholder="Postal code"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>

        {/* Registration Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registration Information</Text>

          <Text style={styles.label}>Registration Number</Text>
          <TextInput
            style={styles.input}
            value={formData.registrationNumber}
            onChangeText={(text) =>
              setFormData({ ...formData, registrationNumber: text })
            }
            placeholder="Business registration number"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Tax ID</Text>
          <TextInput
            style={styles.input}
            value={formData.taxId}
            onChangeText={(text) => setFormData({ ...formData, taxId: text })}
            placeholder="Tax identification number"
            placeholderTextColor="#999"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>Continue to Preferences</Text>
              <Text style={styles.buttonArrow}>→</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Business Structure Modal */}
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
                style={styles.modalOption}
                onPress={() => {
                  setFormData({ ...formData, businessStructure: structure });
                  setShowStructurePicker(false);
                }}>
                <Text style={styles.modalOptionText}>{structure}</Text>
                {formData.businessStructure === structure && (
                  <Text style={styles.modalCheckmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#d1b05e",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#d1b05e",
  },
  progressDotInactive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#555",
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: "#555",
  },
  progressText: {
    fontSize: 14,
    color: "#d1b05e",
    textAlign: "center",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#d1b05e",
    marginBottom: 16,
  },
  logoUpload: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
    alignSelf: "center",
    overflow: "hidden",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  logoPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  logoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 14,
    color: "#666",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    marginBottom: 8,
  },
  required: {
    color: "#ff6b6b",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
  },
  inputText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  button: {
    backgroundColor: "#d1b05e",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  buttonArrow: {
    color: "#fff",
    fontSize: 18,
  },
  bottomPadding: {
    height: 20,
  },
  backButton: {
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: "#d1b05e",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3c2c64",
    marginBottom: 16,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
  modalCheckmark: {
    fontSize: 18,
    color: "#d1b05e",
  },
});
