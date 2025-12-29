import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../navigation/types";
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

  useEffect(() => {
    if (id) {
      loadAccountGroup();
    }
  }, [id]);

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
      ]
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
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!accountGroup) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.darkPurple}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Account group not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}>
          <Text style={styles.headerButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Group Details</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("accountgroupedit", { id })}
          style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Coming Soon Notice */}
        <View style={styles.comingSoonBanner}>
          <Text style={styles.comingSoonText}>
            🚧 Full details view coming soon
          </Text>
        </View>

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
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  headerButton: {
    paddingVertical: 8,
    minWidth: 60,
  },
  headerButtonText: {
    fontSize: 16,
    color: SEMANTIC_COLORS.white,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  comingSoonBanner: {
    backgroundColor: "#fef3c7",
    padding: 16,
    margin: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  comingSoonText: {
    fontSize: 14,
    color: "#92400e",
    textAlign: "center",
    fontWeight: "600",
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
