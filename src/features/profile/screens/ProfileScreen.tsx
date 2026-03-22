import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import { useProfile } from "../hooks/useProfile";

type Props = NativeStackScreenProps<ProfileStackParamList, "ProfileHome">;

export default function ProfileScreen({ navigation }: Props) {
  const { profile, tenant, isLoading, isRefreshing, refresh } = useProfile();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
        </View>
      </SafeAreaView>
    );
  }

  const avatarLetter = profile?.name?.charAt(0).toUpperCase() || "U";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={["#1a0f33", "#2d1f5e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </LinearGradient>

      {/* Profile Card */}
      <View style={styles.body}>
        <View style={styles.avatarSection}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>{avatarLetter}</Text>
            </View>
          )}
          <Text style={styles.userName}>{profile?.name || "User"}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {profile?.role?.replace("_", " ") || "Admin"}
            </Text>
          </View>
        </View>

        {/* Email Verification Warning */}
        {profile && !profile.email_verified && (
          <TouchableOpacity
            style={styles.verifyBanner}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("EmailVerification")}>
            <Text style={styles.verifyIcon}>⚠️</Text>
            <View style={styles.verifyContent}>
              <Text style={styles.verifyTitle}>Email not verified</Text>
              <Text style={styles.verifySub}>
                Tap to verify your email address
              </Text>
            </View>
            <Text style={styles.verifyArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Info Cards */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {profile?.email || "—"}
            </Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>
              {profile?.phone || "Not set"}
            </Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: profile?.is_active
                    ? "rgba(16,185,129,0.1)"
                    : "rgba(239,68,68,0.1)",
                },
              ]}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: profile?.is_active
                      ? "#10b981"
                      : "#ef4444",
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: profile?.is_active ? "#059669" : "#dc2626" },
                ]}>
                {profile?.is_active ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
          {profile?.last_login_at && (
            <>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Login</Text>
                <Text style={styles.infoValue}>
                  {new Date(profile.last_login_at).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Tenant Info */}
        {tenant && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Business</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {tenant.name}
              </Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Subscription</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      tenant.subscription_status === "active"
                        ? "rgba(16,185,129,0.1)"
                        : "rgba(209,176,94,0.12)",
                  },
                ]}>
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        tenant.subscription_status === "active"
                          ? "#059669"
                          : BRAND_COLORS.gold,
                    },
                  ]}>
                  {tenant.subscription_status}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("ProfileEdit")}>
            <Text style={styles.actionIcon}>✏️</Text>
            <Text style={styles.actionLabel}>Edit Profile</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("ChangePassword")}>
            <Text style={styles.actionIcon}>🔒</Text>
            <Text style={styles.actionLabel}>Change Password</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1a0f33" },
  loadingWrap: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  body: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -1,
    paddingTop: 0,
  },

  avatarSection: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: BRAND_COLORS.gold,
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: BRAND_COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(209,176,94,0.3)",
  },
  avatarFallbackText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1a0f33",
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: BRAND_COLORS.darkPurple,
    marginTop: 14,
  },
  roleBadge: {
    marginTop: 6,
    backgroundColor: "rgba(60,44,100,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    textTransform: "capitalize",
  },

  verifyBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
    gap: 12,
  },
  verifyIcon: { fontSize: 22 },
  verifyContent: { flex: 1 },
  verifyTitle: { fontSize: 14, fontWeight: "700", color: "#92400e" },
  verifySub: { fontSize: 12, color: "#a16207", marginTop: 2 },
  verifyArrow: { fontSize: 24, color: "#f59e0b", fontWeight: "700" },

  infoCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    maxWidth: "60%",
    textAlign: "right",
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 10,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  actionsSection: {
    marginHorizontal: 20,
    gap: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  actionIcon: { fontSize: 20 },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  actionArrow: { fontSize: 22, color: "#9ca3af", fontWeight: "700" },
});
