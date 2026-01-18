import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VoucherType } from "../types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AccountingStackParamList } from "../../../../navigation/types";
import { voucherService } from "../services/voucherService";

type Props = NativeStackScreenProps<AccountingStackParamList, "VoucherCreate">;

// Emoji mapping for voucher types
const VOUCHER_TYPE_EMOJIS: Record<string, string> = {
  JV: "📝",
  PV: "💳",
  RV: "💰",
  CV: "🔄",
  CN: "📉",
  DN: "📈",
};

// Color mapping for voucher types
const VOUCHER_TYPE_COLORS: Record<string, string> = {
  JV: "#e0e7ff",
  PV: "#ddd6fe",
  RV: "#dcfce7",
  CV: "#fef9c3",
  CN: "#fecaca",
  DN: "#fed7aa",
};

export default function VoucherCreateScreen({ navigation }: Props) {
  const [voucherTypes, setVoucherTypes] = useState<VoucherType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVoucherTypes();
  }, []);

  const loadVoucherTypes = async () => {
    try {
      setLoading(true);
      const formData = await voucherService.getFormData();
      setVoucherTypes(formData.voucher_types || []);
    } catch (error: any) {
      console.error("Error loading voucher types:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to load voucher types",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVoucherTypeSelect = (voucherType: VoucherType) => {
    navigation.navigate("VoucherForm", {
      voucherTypeId: voucherType.id,
      voucherTypeCode: voucherType.code,
      voucherTypeName: voucherType.name,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_COLORS.darkPurple}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Voucher</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading voucher types...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Select Voucher Type</Text>
            <Text style={styles.instructionsText}>
              Choose the type of voucher you want to create
            </Text>
          </View>

          {/* Voucher Types Grid */}
          <View style={styles.vouchersGrid}>
            {voucherTypes.map((voucherType) => (
              <TouchableOpacity
                key={voucherType.id}
                style={styles.voucherCard}
                onPress={() => handleVoucherTypeSelect(voucherType)}
                activeOpacity={0.7}>
                <View
                  style={[
                    styles.voucherIcon,
                    {
                      backgroundColor:
                        VOUCHER_TYPE_COLORS[voucherType.code] || "#e5e7eb",
                    },
                  ]}>
                  <Text style={styles.voucherEmoji}>
                    {VOUCHER_TYPE_EMOJIS[voucherType.code] || "📄"}
                  </Text>
                </View>
                <Text style={styles.voucherLabel}>{voucherType.name}</Text>
                <Text style={styles.voucherCode}>{voucherType.code}</Text>
                <Text style={styles.voucherDescription}>
                  {voucherType.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
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
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: BRAND_COLORS.gold,
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 20,
  },
  instructionsContainer: {
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  vouchersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  voucherCard: {
    width: "48%",
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  voucherIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  voucherEmoji: {
    fontSize: 32,
  },
  voucherLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    textAlign: "center",
    marginBottom: 4,
  },
  voucherCode: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND_COLORS.gold,
    marginBottom: 6,
  },
  voucherDescription: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 14,
  },
});
