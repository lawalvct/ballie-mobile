import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { shiftService } from "../services/shiftService";
import type { PayrollShiftAssignment, PayrollShift } from "../types";
import { showConfirm, showToast } from "../../../../utils/toast";

const formatWorkingDays = (days: string[] = []) => {
  if (!days.length) return "N/A";
  return days
    .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
    .join(", ");
};

type Props = NativeStackScreenProps<PayrollStackParamList, "PayrollShiftShow">;

export default function PayrollShiftShowScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [shift, setShift] = useState<PayrollShift | null>(null);
  const [assignments, setAssignments] = useState<PayrollShiftAssignment[]>([]);

  useEffect(() => {
    loadShift();
  }, [id]);

  const loadShift = async () => {
    try {
      setLoading(true);
      const response = await shiftService.show(id, { per_page: 5 });
      setShift(response.shift);
      setAssignments(response.assignments || []);
    } catch (error: any) {
      showToast(error.message || "Failed to load shift", "error");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    showConfirm(
      "Delete Shift",
      "Are you sure you want to delete this shift?",
      async () => {
        try {
          await shiftService.delete(id);
          showToast("Shift deleted successfully", "success");
          navigation.goBack();
        } catch (error: any) {
          showToast(error.message || "Failed to delete shift", "error");
        }
      },
      { destructive: true, confirmText: "Delete" },
    );
  };

  const handleEndAssignment = (assignmentId: number) => {
    showConfirm(
      "End Assignment",
      "Are you sure you want to end this shift assignment?",
      async () => {
        try {
          await shiftService.endAssignment(assignmentId);
          showToast("Assignment ended", "success");
          loadShift();
        } catch (error: any) {
          showToast(error.message || "Failed to end assignment", "error");
        }
      },
      { destructive: true, confirmText: "End" },
    );
  };

  if (loading || !shift) {
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
          <Text style={styles.headerTitle}>Shift Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading shift...</Text>
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
        <Text style={styles.headerTitle}>Shift Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{shift.name}</Text>
          <Text style={styles.sectionSubtitle}>Code: {shift.code}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Time:{" "}
              {shift.time_range || `${shift.start_time} - ${shift.end_time}`}
            </Text>
            <Text style={styles.metaText}>
              Work Hours: {shift.work_hours ?? "N/A"}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Working Days: {formatWorkingDays(shift.working_days)}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Grace Minutes: {shift.late_grace_minutes ?? "N/A"}
            </Text>
            <Text style={styles.metaText}>
              Allowance: {shift.shift_allowance ?? "N/A"}
            </Text>
          </View>

          {shift.description ? (
            <Text style={styles.metaText}>
              Description: {shift.description}
            </Text>
          ) : null}

          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                shift.is_active ? styles.statusActive : styles.statusInactive,
              ]}>
              <Text
                style={[
                  styles.statusText,
                  shift.is_active
                    ? styles.statusTextActive
                    : styles.statusTextInactive,
                ]}>
                {shift.is_active ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Assignments</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("PayrollShiftAssignments", {
                  shiftId: shift.id,
                })
              }>
              <Text style={styles.linkText}>View all</Text>
            </TouchableOpacity>
          </View>

          {assignments.length === 0 ? (
            <View style={styles.emptyInline}>
              <Text style={styles.emptyText}>No assignments yet.</Text>
            </View>
          ) : (
            assignments.map((assignment) => (
              <View key={assignment.id} style={styles.assignmentCard}>
                <View style={styles.assignmentHeader}>
                  <View style={styles.assignmentInfo}>
                    <Text style={styles.assignmentName}>
                      {assignment.employee_name || "Employee"}
                    </Text>
                    <Text style={styles.assignmentSubtext}>
                      {assignment.department_name || "No Department"}
                    </Text>
                    <Text style={styles.assignmentSubtext}>
                      Effective: {assignment.effective_from}
                      {assignment.effective_to
                        ? ` → ${assignment.effective_to}`
                        : assignment.is_permanent
                          ? " (Permanent)"
                          : ""}
                    </Text>
                  </View>
                  <View style={styles.assignmentBadgeRow}>
                    <View
                      style={[
                        styles.statusBadge,
                        assignment.status === "ended" ||
                        assignment.is_active === false
                          ? styles.statusInactive
                          : styles.statusActive,
                      ]}>
                      <Text
                        style={[
                          styles.statusText,
                          assignment.status === "ended" ||
                          assignment.is_active === false
                            ? styles.statusTextInactive
                            : styles.statusTextActive,
                        ]}>
                        {assignment.status === "ended" ||
                        assignment.is_active === false
                          ? "Ended"
                          : "Active"}
                      </Text>
                    </View>
                  </View>
                </View>

                {(assignment.status === "active" || assignment.is_active) && (
                  <TouchableOpacity
                    style={styles.endButton}
                    onPress={() => handleEndAssignment(assignment.id)}>
                    <Text style={styles.endButtonText}>End Assignment</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              navigation.navigate("PayrollShiftEdit", {
                id: shift.id,
                onUpdated: loadShift,
              })
            }
            activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>Edit Shift</Text>
          </TouchableOpacity>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() =>
                navigation.navigate("PayrollShiftAssign", { shiftId: shift.id })
              }
              activeOpacity={0.8}>
              <Text style={styles.secondaryBtnText}>Assign Employees</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryBtn, styles.dangerBtn]}
              onPress={handleDelete}
              activeOpacity={0.8}>
              <Text style={[styles.secondaryBtnText, styles.dangerText]}>
                Delete Shift
              </Text>
            </TouchableOpacity>
          </View>
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
  },
  backButtonText: {
    fontSize: 16,
    color: SEMANTIC_COLORS.white,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  sectionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: SEMANTIC_COLORS.textLight,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  metaText: {
    fontSize: 13,
    color: SEMANTIC_COLORS.text,
  },
  statusRow: {
    marginTop: 12,
    alignItems: "flex-start",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusActive: {
    backgroundColor: "#dcfce7",
  },
  statusInactive: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusTextActive: {
    color: "#16a34a",
  },
  statusTextInactive: {
    color: "#dc2626",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  linkText: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.blue,
  },
  emptyInline: {
    paddingVertical: 12,
  },
  emptyText: {
    fontSize: 13,
    color: SEMANTIC_COLORS.textLight,
  },
  assignmentCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  assignmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  assignmentInfo: {
    flex: 1,
    marginRight: 12,
  },
  assignmentName: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  assignmentSubtext: {
    fontSize: 12,
    color: SEMANTIC_COLORS.textLight,
    marginTop: 4,
  },
  assignmentBadgeRow: {
    alignItems: "flex-end",
  },
  endButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#fee2e2",
    alignSelf: "flex-start",
  },
  endButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#dc2626",
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  primaryBtn: {
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
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  dangerBtn: {
    borderColor: "#fecaca",
    backgroundColor: "#fff5f5",
  },
  dangerText: {
    color: "#dc2626",
  },
});
