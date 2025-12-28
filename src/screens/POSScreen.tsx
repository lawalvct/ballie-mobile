import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../theme/colors";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../context/AuthContext";

export default function POSScreen() {
  const { user, tenant } = useAuth();
  const [selectedRegister, setSelectedRegister] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [openingNotes, setOpeningNotes] = useState("");

  const quickAmounts = [
    { label: "₦0", value: 0 },
    { label: "₦1,000", value: 1000 },
    { label: "₦5,000", value: 5000 },
    { label: "₦10,000", value: 10000 },
  ];

  const registers = [
    { id: 1, name: "Main Counter" },
    { id: 2, name: "Store Front" },
    { id: 3, name: "Warehouse" },
  ];

  const handleQuickAmount = (amount: number) => {
    setOpeningBalance(amount.toString());
  };

  const handleClear = () => {
    setSelectedRegister("");
    setOpeningBalance("");
    setOpeningNotes("");
  };

  const handleOpenSession = () => {
    // Handle opening session logic here
    console.log("Opening session with:", {
      register: selectedRegister,
      balance: openingBalance,
      notes: openingNotes,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#3c2c64" translucent={false} />
      <AppHeader
        businessName={tenant?.name}
        userName={user?.name}
        userRole={user?.role}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient
          colors={["#3c2c64", "#5a4a7e"]}
          style={styles.headerCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.headerIcon}>💳</Text>
          <Text style={styles.headerTitle}>Cash Register Session</Text>
          <Text style={styles.headerSubtitle}>
            Open a cash register session to start selling
          </Text>
        </LinearGradient>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Select Cash Register */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Select Cash Register</Text>
            <View style={styles.selectContainer}>
              {registers.map((register) => (
                <TouchableOpacity
                  key={register.id}
                  style={[
                    styles.registerOption,
                    selectedRegister === register.name &&
                      styles.registerOptionSelected,
                  ]}
                  onPress={() => setSelectedRegister(register.name)}>
                  <View
                    style={[
                      styles.radioButton,
                      selectedRegister === register.name &&
                        styles.radioButtonSelected,
                    ]}>
                    {selectedRegister === register.name && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.registerOptionText,
                      selectedRegister === register.name &&
                        styles.registerOptionTextSelected,
                    ]}>
                    {register.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Opening Balance */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Opening Balance (₦)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter opening balance"
              placeholderTextColor="#9ca3af"
              value={openingBalance}
              onChangeText={setOpeningBalance}
              keyboardType="numeric"
            />
          </View>

          {/* Quick Amount Buttons */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Quick Amount</Text>
            <View style={styles.quickAmountGrid}>
              {quickAmounts.map((amount, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickAmountButton}
                  onPress={() => handleQuickAmount(amount.value)}>
                  <Text style={styles.quickAmountText}>{amount.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Opening Notes */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Opening Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any notes about this session..."
              placeholderTextColor="#9ca3af"
              value={openingNotes}
              onChangeText={setOpeningNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.openButton}
              onPress={handleOpenSession}>
              <LinearGradient
                colors={["#d1b05e", "#c9a556"]}
                style={styles.openButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <Text style={styles.openButtonText}>Open Session</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3c2c64",
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerCard: {
    padding: 24,
    margin: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  formSection: {
    paddingHorizontal: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  selectContainer: {
    gap: 12,
  },
  registerOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  registerOptionSelected: {
    borderColor: BRAND_COLORS.gold,
    backgroundColor: "#fef9f3",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: BRAND_COLORS.gold,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BRAND_COLORS.gold,
  },
  registerOptionText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#4b5563",
  },
  registerOptionTextSelected: {
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
  },
  input: {
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 15,
    color: BRAND_COLORS.darkPurple,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  quickAmountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickAmountButton: {
    width: "48%",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  clearButton: {
    flex: 1,
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  openButton: {
    flex: 2,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  openButtonGradient: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  openButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
});
