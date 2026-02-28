import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { showToast } from "../../../../utils/toast";
import { accountGroupService } from "../services/accountGroupService";
import type { AccountGroup } from "../types";

type Props = NativeStackScreenProps<
  AccountingStackParamList,
  "AccountGroupShow"
>;

export default function AccountGroupShowScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [accountGroup, setAccountGroup] = useState<AccountGroup | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadAccountGroup();
      }
    }, [id]),
  );

  const loadAccountGroup = async () => {
    try {
      setLoading(true);
      const data = await accountGroupService.show(id);
      setAccountGroup(data);
    } catch (error: any) {
      showToast(error.message || "Failed to load account group", "error");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Account Group",
      "Are you sure you want to delete this account group?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await accountGroupService.delete(id);
              showToast("🗑️ Account group deleted successfully", "success");
              setTimeout(() => {
                navigation.goBack();
              }, 500);
            } catch (error: any) {
              showToast(error.message || "Failed to delete", "error");
            }
          },
        },
      ],
    );
  };

  const handleToggleStatus = async () => {
    try {
      const updated = await accountGroupService.toggleStatus(id);
      setAccountGroup(updated);
      showToast("✅ Status updated successfully", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to update status", "error");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#1a0f33", "#2d1f5e"]}
          style={styles.loadingGradient}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading details...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!accountGroup) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#1a0f33", "#2d1f5e"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.backText}>‹ Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Account Group Details
            </Text>
            <View style={{ width: 50 }} />
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Account group not found</Text>
          <TouchableOpacity
            style={styles.errorBtn}
            onPress={() => navigation.goBack()}>
            <Text style={styles.errorBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      {/* ── Gradient Header ── */}
      <LinearGradient
        colors={["#1a0f33", "#2d1f5e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Account Group Details
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("AccountGroupEdit", { id })}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}>
        {/* Basic Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Basic Information</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Name</Text>
            <Text style={styles.fieldValue}>{accountGroup.name}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Code</Text>
            <Text style={styles.fieldValue}>{accountGroup.code}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nature</Text>
            <Text style={styles.fieldValue}>{accountGroup.nature_label}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Status</Text>
            <View
              style={[
                styles.statusBadge,
                accountGroup.is_active
                  ? styles.activeBadge
                  : styles.inactiveBadge,
              ]}>
              <Text
                style={[
                  styles.statusText,
                  accountGroup.is_active
                    ? styles.activeText
                    : styles.inactiveText,
                ]}>
                {accountGroup.is_active ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleToggleStatus}>
            <Text style={styles.actionButtonText}>
              {accountGroup.is_active ? "Deactivate" : "Activate"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}>
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
              Delete
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
    backgroundColor: "#1a0f33",
  },
  loadingGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f8",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 20,
  },
  errorBtn: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorBtnText: {
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
    fontSize: 14,
  },
  /* ── Header ── */
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backText: {
    fontSize: 16,
    color: "rgba(164,212,255,0.9)",
    fontWeight: "600",
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  editText: {
    fontSize: 15,
    color: BRAND_COLORS.gold,
    fontWeight: "700",
    minWidth: 60,
    textAlign: "right",
  },
  /* ── Body ── */
  content: {
    flex: 1,
    backgroundColor: "#f3f4f8",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  contentInner: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: SEMANTIC_COLORS.white,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
    fontWeight: "600",
  },
  fieldValue: {
    fontSize: 16,
    color: BRAND_COLORS.darkPurple,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  activeBadge: {
    backgroundColor: "#d1fae5",
  },
  inactiveBadge: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  activeText: {
    color: "#065f46",
  },
  inactiveText: {
    color: "#991b1b",
  },
  actionsCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
  },
  actionButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  deleteButtonText: {
    color: "#991b1b",
  },
});
