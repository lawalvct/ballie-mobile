import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BRAND_COLORS } from "../../../../theme/colors";
import { showToast } from "../../../../utils/toast";
import { customerService } from "../services/customerService";
import type { CRMStackParamList } from "../../../../navigation/types";
import type { CustomerCreatePayload, CustomerType } from "../types";

type NavigationProp = NativeStackNavigationProp<
  CRMStackParamList,
  "CustomerCreate"
>;

export default function CustomerCreateScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [submitting, setSubmitting] = useState(false);
  const [customerType, setCustomerType] = useState<CustomerType>("business");
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [mobile, setMobile] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [currency, setCurrency] = useState("NGN");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [openingBalanceAmount, setOpeningBalanceAmount] = useState("");
  const [openingBalanceType, setOpeningBalanceType] = useState<
    "debit" | "credit"
  >("debit");
  const [openingBalanceDate, setOpeningBalanceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [notes, setNotes] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (_event: any, selected?: Date) => {
    setShowDatePicker(false);
    if (!selected) return;
    setOpeningBalanceDate(selected.toISOString().split("T")[0]);
  };

  const validate = () => {
    if (customerType === "business" && !companyName.trim()) {
      Alert.alert("Validation Error", "Company name is required");
      return false;
    }
    if (customerType === "individual" && !firstName.trim()) {
      Alert.alert("Validation Error", "First name is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);

      const payload: CustomerCreatePayload = {
        customer_type: customerType,
        company_name: companyName || undefined,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        email: email || undefined,
        phone: phone || undefined,
        mobile: mobile || undefined,
        address_line1: addressLine1 || undefined,
        address_line2: addressLine2 || undefined,
        city: city || undefined,
        state: state || undefined,
        postal_code: postalCode || undefined,
        country: country || undefined,
        currency: currency || undefined,
        payment_terms: paymentTerms || undefined,
        credit_limit: creditLimit ? Number(creditLimit) : undefined,
        opening_balance_amount: openingBalanceAmount
          ? Number(openingBalanceAmount)
          : undefined,
        opening_balance_type: openingBalanceAmount
          ? openingBalanceType
          : undefined,
        opening_balance_date: openingBalanceAmount
          ? openingBalanceDate
          : undefined,
        notes: notes || undefined,
      };

      const customer = await customerService.create(payload);

      showToast("✅ Customer created successfully", "success");
      navigation.replace("CustomerShow", { id: customer.id });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create customer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Customer</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Type</Text>
          <View style={styles.segmentedRow}>
            <TouchableOpacity
              style={[
                styles.segmentedButton,
                customerType === "business" && styles.segmentedActive,
              ]}
              onPress={() => setCustomerType("business")}>
              <Text
                style={[
                  styles.segmentedText,
                  customerType === "business" && styles.segmentedTextActive,
                ]}>
                Business
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentedButton,
                customerType === "individual" && styles.segmentedActive,
              ]}
              onPress={() => setCustomerType("individual")}>
              <Text
                style={[
                  styles.segmentedText,
                  customerType === "individual" && styles.segmentedTextActive,
                ]}>
                Individual
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          {customerType === "business" ? (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Company Name *</Text>
              <TextInput
                style={styles.input}
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="Company name"
                placeholderTextColor="#9ca3af"
              />
            </View>
          ) : (
            <View style={styles.row}>
              <View style={[styles.formGroup, styles.flex1]}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={[styles.formGroup, styles.flex1]}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last name"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              keyboardType="email-address"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="08012345678"
              keyboardType="phone-pad"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Mobile</Text>
            <TextInput
              style={styles.input}
              value={mobile}
              onChangeText={setMobile}
              placeholder="08012345678"
              keyboardType="phone-pad"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Address Line 1</Text>
            <TextInput
              style={styles.input}
              value={addressLine1}
              onChangeText={setAddressLine1}
              placeholder="Address line 1"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Address Line 2</Text>
            <TextInput
              style={styles.input}
              value={addressLine2}
              onChangeText={setAddressLine2}
              placeholder="Address line 2"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.formGroup, styles.flex1]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={[styles.formGroup, styles.flex1]}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                value={state}
                onChangeText={setState}
                placeholder="State"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.formGroup, styles.flex1]}>
              <Text style={styles.label}>Postal Code</Text>
              <TextInput
                style={styles.input}
                value={postalCode}
                onChangeText={setPostalCode}
                placeholder="Postal code"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={[styles.formGroup, styles.flex1]}>
              <Text style={styles.label}>Country</Text>
              <TextInput
                style={styles.input}
                value={country}
                onChangeText={setCountry}
                placeholder="Country"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Settings</Text>
          <View style={styles.row}>
            <View style={[styles.formGroup, styles.flex1]}>
              <Text style={styles.label}>Currency</Text>
              <TextInput
                style={styles.input}
                value={currency}
                onChangeText={setCurrency}
                placeholder="NGN"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={[styles.formGroup, styles.flex1]}>
              <Text style={styles.label}>Payment Terms</Text>
              <TextInput
                style={styles.input}
                value={paymentTerms}
                onChangeText={setPaymentTerms}
                placeholder="Net 30"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Credit Limit</Text>
            <TextInput
              style={styles.input}
              value={creditLimit}
              onChangeText={setCreditLimit}
              placeholder="0.00"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opening Balance</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              value={openingBalanceAmount}
              onChangeText={setOpeningBalanceAmount}
              placeholder="0.00"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.formGroup, styles.flex1]}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.segmentedRow}>
                <TouchableOpacity
                  style={[
                    styles.segmentedButton,
                    openingBalanceType === "debit" && styles.segmentedActive,
                  ]}
                  onPress={() => setOpeningBalanceType("debit")}>
                  <Text
                    style={[
                      styles.segmentedText,
                      openingBalanceType === "debit" &&
                        styles.segmentedTextActive,
                    ]}>
                    Debit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.segmentedButton,
                    openingBalanceType === "credit" && styles.segmentedActive,
                  ]}
                  onPress={() => setOpeningBalanceType("credit")}>
                  <Text
                    style={[
                      styles.segmentedText,
                      openingBalanceType === "credit" &&
                        styles.segmentedTextActive,
                    ]}>
                    Credit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                style={styles.input}
                value={openingBalanceDate}
                editable={false}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
              />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={new Date(openingBalanceDate)}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional notes..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Create Customer</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: { marginBottom: 12 },
  backButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  content: { flex: 1 },
  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  formGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  textArea: { height: 80, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 12 },
  flex1: { flex: 1 },
  segmentedRow: { flexDirection: "row", gap: 10 },
  segmentedButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  segmentedActive: {
    backgroundColor: "#fff7e6",
    borderColor: BRAND_COLORS.gold,
  },
  segmentedText: { fontSize: 13, color: "#6b7280", fontWeight: "600" },
  segmentedTextActive: { color: BRAND_COLORS.darkPurple },
  buttonContainer: { paddingHorizontal: 20, marginTop: 16 },
  submitButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: BRAND_COLORS.darkPurple,
    fontSize: 16,
    fontWeight: "700",
  },
});
