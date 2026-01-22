import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BRAND_COLORS } from "../../../../theme/colors";
import { vendorService } from "../services/vendorService";
import type { VendorUpdatePayload, VendorDetails } from "../types";
import type { CRMStackParamList } from "../../../../navigation/types";
import { showToast } from "../../../../utils/toast";

type VendorType = "individual" | "business";

type NavigationProp = NativeStackNavigationProp<
  CRMStackParamList,
  "VendorEdit"
>;

type RouteProp = {
  key: string;
  name: string;
  params: { id: number };
};

export default function VendorEditScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const vendorId = route.params.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [vendorType, setVendorType] = useState<VendorType>("business");
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [mobile, setMobile] = useState("");
  const [website, setWebsite] = useState("");
  const [taxId, setTaxId] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [openingBalanceAmount, setOpeningBalanceAmount] = useState("");
  const [openingBalanceType, setOpeningBalanceType] = useState<
    "debit" | "credit"
  >("credit");
  const [openingBalanceDate, setOpeningBalanceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [notes, setNotes] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadVendor();
  }, [vendorId]);

  const loadVendor = async () => {
    try {
      setLoading(true);
      const response = await vendorService.show(vendorId);
      const vendor = response.vendor as VendorDetails;

      setVendorType(vendor.vendor_type || "business");
      setCompanyName(vendor.company_name || "");
      setFirstName(vendor.first_name || "");
      setLastName(vendor.last_name || "");
      setEmail(vendor.email || "");
      setPhone(vendor.phone || "");
      setMobile(vendor.mobile || "");
      setWebsite(vendor.website || "");
      setTaxId(vendor.tax_id || "");
      setRegistrationNumber(vendor.registration_number || "");
      setAddressLine1(vendor.address_line1 || "");
      setAddressLine2(vendor.address_line2 || "");
      setCity(vendor.city || "");
      setState(vendor.state || "");
      setPostalCode(vendor.postal_code || "");
      setCountry(vendor.country || "Nigeria");
      setBankName(vendor.bank_name || "");
      setBankAccountNumber(vendor.bank_account_number || "");
      setBankAccountName(vendor.bank_account_name || "");
      setCurrency(vendor.currency || "NGN");
      setPaymentTerms(vendor.payment_terms || "");
      setCreditLimit(vendor.credit_limit ? String(vendor.credit_limit) : "");
      setOpeningBalanceAmount(
        vendor.opening_balance_amount
          ? String(vendor.opening_balance_amount)
          : "",
      );
      setOpeningBalanceType(
        vendor.opening_balance_type === "debit" ? "debit" : "credit",
      );
      setOpeningBalanceDate(vendor.opening_balance_date || openingBalanceDate);
      setNotes(vendor.notes || "");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load vendor");
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

      const payload: VendorUpdatePayload = {
        vendor_type: vendorType,
        company_name: companyName || undefined,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        email: email || undefined,
        phone: phone || undefined,
        mobile: mobile || undefined,
        website: website || undefined,
        tax_id: taxId || undefined,
        registration_number: registrationNumber || undefined,
        address_line1: addressLine1 || undefined,
        address_line2: addressLine2 || undefined,
        city: city || undefined,
        state: state || undefined,
        postal_code: postalCode || undefined,
        country: country || undefined,
        bank_name: bankName || undefined,
        bank_account_number: bankAccountNumber || undefined,
        bank_account_name: bankAccountName || undefined,
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

      await vendorService.update(vendorId, payload);
      showToast("✅ Vendor updated successfully", "success");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update vendor");
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
          <Text style={styles.title}>Edit Vendor</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading vendor...</Text>
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
        <Text style={styles.title}>Edit Vendor</Text>
        <Text style={styles.subtitle}>Update vendor information</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>👤</Text>
            <Text style={styles.sectionTitle}>Vendor Type</Text>
          </View>
          <View style={styles.segmentedRow}>
            <TouchableOpacity
              style={[
                styles.segmentedButton,
                vendorType === "business" && styles.segmentedActive,
              ]}
              onPress={() => setVendorType("business")}>
              <Text
                style={[
                  styles.segmentedText,
                  vendorType === "business" && styles.segmentedTextActive,
                ]}>
                🏢 Business
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentedButton,
                vendorType === "individual" && styles.segmentedActive,
              ]}
              onPress={() => setVendorType("individual")}>
              <Text
                style={[
                  styles.segmentedText,
                  vendorType === "individual" && styles.segmentedTextActive,
                ]}>
                👤 Individual
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📝</Text>
            <Text style={styles.sectionTitle}>Vendor Information</Text>
          </View>
          {vendorType === "business" ? (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Company Name *</Text>
                <TextInput
                  style={styles.input}
                  value={companyName}
                  onChangeText={setCompanyName}
                  placeholder="Acme Supplies Ltd"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tax ID / TIN</Text>
                <TextInput
                  style={styles.input}
                  value={taxId}
                  onChangeText={setTaxId}
                  placeholder="123456789"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Registration Number</Text>
                <TextInput
                  style={styles.input}
                  value={registrationNumber}
                  onChangeText={setRegistrationNumber}
                  placeholder="RC123456"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </>
          ) : (
            <View style={styles.row}>
              <View style={[styles.formGroup, styles.flex1]}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="John"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={[styles.formGroup, styles.flex1]}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Doe"
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
              placeholder="vendor@example.com"
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
              placeholder="08030000000"
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
              placeholder="08030000000"
              keyboardType="phone-pad"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              value={website}
              onChangeText={setWebsite}
              placeholder="https://example.com"
              keyboardType="url"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📍</Text>
            <Text style={styles.sectionTitle}>Address</Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Address Line 1</Text>
            <TextInput
              style={styles.input}
              value={addressLine1}
              onChangeText={setAddressLine1}
              placeholder="12 Industrial Road"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Address Line 2</Text>
            <TextInput
              style={styles.input}
              value={addressLine2}
              onChangeText={setAddressLine2}
              placeholder="Optional"
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
                placeholder="Ikeja"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={[styles.formGroup, styles.flex1]}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                value={state}
                onChangeText={setState}
                placeholder="Lagos"
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
                placeholder="100001"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={[styles.formGroup, styles.flex1]}>
              <Text style={styles.label}>Country</Text>
              <TextInput
                style={styles.input}
                value={country}
                onChangeText={setCountry}
                placeholder="Nigeria"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🏦</Text>
            <Text style={styles.sectionTitle}>Banking Information</Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Bank Name</Text>
            <TextInput
              style={styles.input}
              value={bankName}
              onChangeText={setBankName}
              placeholder="United Bank for Africa"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Account Number</Text>
            <TextInput
              style={styles.input}
              value={bankAccountNumber}
              onChangeText={setBankAccountNumber}
              placeholder="0123456789"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Account Name</Text>
            <TextInput
              style={styles.input}
              value={bankAccountName}
              onChangeText={setBankAccountName}
              placeholder="Account holder name"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>💰</Text>
            <Text style={styles.sectionTitle}>Financial Settings</Text>
          </View>
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>💵</Text>
            <Text style={styles.sectionTitle}>Opening Balance</Text>
          </View>
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
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateText}>{openingBalanceDate}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={new Date(openingBalanceDate)}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
              />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📋</Text>
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
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
            <Text style={styles.submitButtonText}>
              {submitting ? "Updating..." : "Update Vendor"}
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
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: BRAND_COLORS.gold,
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: BRAND_COLORS.darkPurple,
  },
  dateText: {
    fontSize: 15,
    color: BRAND_COLORS.darkPurple,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  segmentedRow: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#f9fafb",
    padding: 4,
    borderRadius: 10,
  },
  segmentedButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  segmentedActive: {
    backgroundColor: BRAND_COLORS.gold,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentedText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  segmentedTextActive: {
    color: BRAND_COLORS.darkPurple,
    fontWeight: "700",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: BRAND_COLORS.darkPurple,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
});
