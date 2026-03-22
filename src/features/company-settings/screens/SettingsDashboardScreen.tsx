import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompanySettingsStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import { useCompanySettings } from "../hooks/useCompanySettings";

type Props = NativeStackScreenProps<CompanySettingsStackParamList, "SettingsDashboard">;

export default function SettingsDashboardScreen({ navigation }: Props) {
  const { data, isLoading } = useCompanySettings();

  const enabledCount = data?.modules?.filter((m) => m.enabled).length ?? 0;
  const totalModules = data?.modules?.length ?? 17;

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
        <Text style={styles.headerTitle}>Company Settings</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={BRAND_COLORS.gold}
            style={{ marginTop: 60 }}
          />
        ) : (
          <>
            {/* Company Info Card */}
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("CompanyInfo")}>
              <View style={styles.cardIcon}>
                <Text style={styles.cardEmoji}>🏢</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Company Information</Text>
                <Text style={styles.cardSub} numberOfLines={1}>
                  {data?.company?.name || "Not set"}
                  {data?.company?.email ? ` · ${data.company.email}` : ""}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* Business Details Card */}
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("BusinessDetails")}>
              <View style={styles.cardIcon}>
                <Text style={styles.cardEmoji}>📋</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Business Details</Text>
                <Text style={styles.cardSub} numberOfLines={1}>
                  {data?.business?.business_type
                    ? data.business.business_type.charAt(0).toUpperCase() +
                      data.business.business_type.slice(1)
                    : "Not configured"}
                  {data?.business?.payment_terms != null
                    ? ` · ${data.business.payment_terms} day terms`
                    : ""}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* Branding Card */}
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("Branding")}>
              <View style={styles.cardIcon}>
                {data?.branding?.logo ? (
                  <Image
                    source={{ uri: data.branding.logo }}
                    style={styles.logoThumb}
                  />
                ) : (
                  <Text style={styles.cardEmoji}>🎨</Text>
                )}
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Logo & Branding</Text>
                <Text style={styles.cardSub}>
                  {data?.branding?.logo ? "Logo uploaded" : "No logo set"}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* Preferences Card */}
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("Preferences")}>
              <View style={styles.cardIcon}>
                <Text style={styles.cardEmoji}>🌍</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Regional Preferences</Text>
                <Text style={styles.cardSub} numberOfLines={1}>
                  {data?.preferences?.currency ?? "NGN"} (
                  {data?.preferences?.currency_symbol ?? "₦"}) ·{" "}
                  {data?.preferences?.timezone ?? "Africa/Lagos"}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* Modules Card */}
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("Modules")}>
              <View style={styles.cardIcon}>
                <Text style={styles.cardEmoji}>🧩</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Module Management</Text>
                <Text style={styles.cardSub}>
                  {enabledCount} of {totalModules} modules enabled
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <View style={{ height: 30 }} />
          </>
        )}
      </ScrollView>
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
  bodyContent: { paddingTop: 24, paddingHorizontal: 20 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(60,44,100,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardEmoji: { fontSize: 22 },
  logoThumb: { width: 36, height: 36, borderRadius: 8 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#1f2937", marginBottom: 3 },
  cardSub: { fontSize: 12, color: "#6b7280" },
  chevron: { fontSize: 22, color: "#9ca3af", marginLeft: 8 },
});
