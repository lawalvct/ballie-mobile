import React, { useEffect, useState } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BRAND_COLORS } from "../../../../theme/colors";
import { showToast } from "../../../../utils/toast";
import { customerService } from "../services/customerService";
import type { CRMStackParamList } from "../../../../navigation/types";
import type {
  CustomerDetails,
  CustomerUpdatePayload,
  CustomerType,
} from "../types";

type NavigationProp = NativeStackNavigationProp<
  CRMStackParamList,
  "CustomerEdit"
>;

type RouteProp = {
  key: string;
  name: string;
  params: { id: number };
};

export default function CustomerEditScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const customerId = route.params.id;

  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadCustomer();
  }, [customerId]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const response = await customerService.show(customerId);
      const customer = response.customer as CustomerDetails;

      setCustomerType(customer.customer_type || "business");
      setCompanyName(customer.company_name || "");
      setFirstName(customer.first_name || "");
      setLastName(customer.last_name || "");
      setEmail(customer.email || "");
      setPhone(customer.phone || "");
      setMobile(customer.mobile || "");
      setAddressLine1(customer.address_line1 || "");
      setAddressLine2(customer.address_line2 || "");
      setCity(customer.city || "");
      setState(customer.state || "");
      setPostalCode(customer.postal_code || "");
      setCountry(customer.country || "Nigeria");
      setCurrency(customer.currency || "NGN");
      setPaymentTerms(customer.payment_terms || "");
      setCreditLimit(
        customer.credit_limit ? String(customer.credit_limit) : "",
      );
      setOpeningBalanceAmount(
        customer.opening_balance_amount
          ? String(customer.opening_balance_amount)
          : "",
      );
      setOpeningBalanceType(
        customer.opening_balance_type === "credit" ? "credit" : "debit",
      );
      setOpeningBalanceDate(
        customer.opening_balance_date || openingBalanceDate,
      );
      setNotes(customer.notes || "");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load customer");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (_event: any, selected?: Date) => {
    setShowDatePicker(false);
    if (!selected) return;
    setOpeningBalanceDate(selected.toISOString().split("T")[0]);
  };

  const handleUpdate = async () => {
    try {
      setSubmitting(true);

      const payload: CustomerUpdatePayload = {
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

      await customerService.update(customerId, payload);
      showToast("✅ Customer updated successfully", "success");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update customer");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BRAND_COLORS.darkPurple} />
        <Text style={styles.loadingText}>Loading customer...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Customer</Text>
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
              <Text style={styles.label}>Company Name</Text>
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
                <Text style={styles.label}>First Name</Text>
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
            onPress={handleUpdate}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Save Changes</Text>
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
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#6b7280" },
});
