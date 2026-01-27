import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Switch,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { shiftService } from "../services/shiftService";
import { employeeService } from "../../employee/services/employeeService";
import type { PayrollShift, PayrollShiftAssignment } from "../types";
import type { PayrollEmployee } from "../../employee/types";
import { showToast } from "../../../../utils/toast";

const ASSIGNMENT_MODES = [
  { label: "Single", value: "single" },
  { label: "Bulk", value: "bulk" },
] as const;

type AssignmentMode = (typeof ASSIGNMENT_MODES)[number]["value"];

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollShiftAssign"
>;

export default function PayrollShiftAssignScreen({ navigation, route }: Props) {
  const { shiftId, employeeId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shifts, setShifts] = useState<PayrollShift[]>([]);
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [assignmentMode, setAssignmentMode] =
    useState<AssignmentMode>("single");
  const [selectedShift, setSelectedShift] = useState<number | undefined>(
    shiftId,
  );
  const [selectedEmployee, setSelectedEmployee] = useState<number | undefined>(
    employeeId,
  );
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [isPermanent, setIsPermanent] = useState(true);
  const [showEffectiveFromPicker, setShowEffectiveFromPicker] = useState(false);
  const [showEffectiveToPicker, setShowEffectiveToPicker] = useState(false);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [shiftRes, employeeRes] = await Promise.all([
        shiftService.list({ per_page: 1000 }),
        employeeService.list({ per_page: 1000 }),
      ]);
      setShifts(shiftRes.shifts || []);
      setEmployees(employeeRes.employees || []);
    } catch (error: any) {
      showToast(error.message || "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    if (!employeeSearch.trim()) return employees;
    const query = employeeSearch.trim().toLowerCase();
    return employees.filter((emp) => {
      const name = (emp.full_name || `${emp.first_name} ${emp.last_name}`)
        .toLowerCase()
        .trim();
      const number = emp.employee_number?.toLowerCase() || "";
      return name.includes(query) || number.includes(query);
    });
  }, [employeeSearch, employees]);

  const toggleEmployee = (id: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (!selectedShift) {
      showToast("Please select a shift", "error");
      return;
    }
    if (!effectiveFrom.trim()) {
      showToast("Please enter effective from date", "error");
      return;
    }

    if (assignmentMode === "single") {
      if (!selectedEmployee) {
        showToast("Please select an employee", "error");
        return;
      }
      const payload: Partial<PayrollShiftAssignment> = {
        shift_id: selectedShift,
        employee_id: selectedEmployee,
        effective_from: effectiveFrom.trim(),
        is_permanent: isPermanent,
        effective_to: isPermanent ? undefined : effectiveTo.trim() || undefined,
      };

      try {
        setSubmitting(true);
        await shiftService.assignEmployee(payload);
        showToast("Employee assigned successfully", "success");
        navigation.goBack();
      } catch (error: any) {
        showToast(error.message || "Failed to assign employee", "error");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (selectedEmployees.length === 0) {
      showToast("Please select at least one employee", "error");
      return;
    }

    if (!isPermanent && !effectiveTo.trim()) {
      showToast("Please enter effective to date", "error");
      return;
    }

    try {
      setSubmitting(true);
      await shiftService.assignEmployeesBulk({
        shift_id: selectedShift,
        employee_ids: selectedEmployees,
        effective_from: effectiveFrom.trim(),
        is_permanent: isPermanent,
        effective_to: isPermanent ? undefined : effectiveTo.trim(),
      });
      showToast("Employees assigned successfully", "success");
      navigation.goBack();
    } catch (error: any) {
      showToast(error.message || "Failed to assign employees", "error");
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
          <Text style={styles.headerTitle}>Assign Shift</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading data...</Text>
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
        <Text style={styles.headerTitle}>Assign Shift</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Assignment Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Assignment Type <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.modeRow}>
              {ASSIGNMENT_MODES.map((mode) => (
                <TouchableOpacity
                  key={mode.value}
                  style={[
                    styles.modeChip,
                    assignmentMode === mode.value && styles.modeChipActive,
                  ]}
                  onPress={() => setAssignmentMode(mode.value)}>
                  <Text
                    style={[
                      styles.modeChipText,
                      assignmentMode === mode.value &&
                        styles.modeChipTextActive,
                    ]}>
                    {mode.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Shift <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedShift}
                onValueChange={(value) =>
                  setSelectedShift(
                    typeof value === "number" ? value : undefined,
                  )
                }>
                <Picker.Item label="Select Shift" value={undefined} />
                {shifts.map((shift) => (
                  <Picker.Item
                    key={shift.id}
                    label={shift.name}
                    value={shift.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {assignmentMode === "single" ? (
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Employee <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedEmployee}
                  onValueChange={(value) =>
                    setSelectedEmployee(
                      typeof value === "number" ? value : undefined,
                    )
                  }>
                  <Picker.Item label="Select Employee" value={undefined} />
                  {employees.map((emp) => (
                    <Picker.Item
                      key={emp.id}
                      label={
                        emp.full_name || `${emp.first_name} ${emp.last_name}`
                      }
                      value={emp.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          ) : (
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Employees <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.searchInput}
                value={employeeSearch}
                onChangeText={setEmployeeSearch}
                placeholder="Search employees..."
                placeholderTextColor="#9ca3af"
              />
              <View style={styles.employeeList}>
                {filteredEmployees.map((emp) => {
                  const isSelected = selectedEmployees.includes(emp.id);
                  return (
                    <TouchableOpacity
                      key={emp.id}
                      style={[
                        styles.employeeChip,
                        isSelected && styles.employeeChipActive,
                      ]}
                      onPress={() => toggleEmployee(emp.id)}>
                      <Text
                        style={[
                          styles.employeeChipText,
                          isSelected && styles.employeeChipTextActive,
                        ]}>
                        {emp.full_name || `${emp.first_name} ${emp.last_name}`}
                      </Text>
                      {emp.employee_number ? (
                        <Text
                          style={[
                            styles.employeeNumber,
                            isSelected && styles.employeeChipTextActive,
                          ]}>
                          {emp.employee_number}
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.helperText}>
                Selected: {selectedEmployees.length}
              </Text>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Effective From <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEffectiveFromPicker(true)}>
              <Text
                style={[
                  styles.dateButtonText,
                  !effectiveFrom && styles.datePlaceholder,
                ]}>
                {effectiveFrom || "YYYY-MM-DD"}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          {!isPermanent && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Effective To <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEffectiveToPicker(true)}>
                <Text
                  style={[
                    styles.dateButtonText,
                    !effectiveTo && styles.datePlaceholder,
                  ]}>
                  {effectiveTo || "YYYY-MM-DD"}
                </Text>
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>
            </View>
          )}

          {showEffectiveFromPicker && (
            <DateTimePicker
              value={effectiveFrom ? new Date(effectiveFrom) : new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_event, selectedDate) => {
                setShowEffectiveFromPicker(Platform.OS === "ios");
                if (selectedDate) {
                  setEffectiveFrom(formatDate(selectedDate));
                }
              }}
            />
          )}

          {showEffectiveToPicker && !isPermanent && (
            <DateTimePicker
              value={effectiveTo ? new Date(effectiveTo) : new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_event, selectedDate) => {
                setShowEffectiveToPicker(Platform.OS === "ios");
                if (selectedDate) {
                  setEffectiveTo(formatDate(selectedDate));
                }
              }}
            />
          )}

          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.label}>Permanent Assignment</Text>
                <Text style={styles.helperText}>
                  {isPermanent
                    ? "No end date for this assignment"
                    : "Assignment will end on selected date"}
                </Text>
              </View>
              <Switch
                value={isPermanent}
                onValueChange={(value) => {
                  setIsPermanent(value);
                  if (value) {
                    setEffectiveTo("");
                    setShowEffectiveToPicker(false);
                  }
                }}
                trackColor={{ false: "#d1d5db", true: BRAND_COLORS.gold }}
                thumbColor={isPermanent ? BRAND_COLORS.darkPurple : "#f3f4f6"}
              />
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.primaryBtn, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>
              {submitting ? "Assigning..." : "Assign Shift"}
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
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 6,
  },
  required: {
    color: "#ef4444",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f9fafb",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateButtonText: {
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  datePlaceholder: {
    color: "#9ca3af",
  },
  calendarIcon: {
    fontSize: 16,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  modeRow: {
    flexDirection: "row",
    gap: 10,
  },
  modeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  modeChipActive: {
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  modeChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  modeChipTextActive: {
    color: SEMANTIC_COLORS.white,
  },
  employeeList: {
    marginTop: 12,
    gap: 10,
  },
  employeeChip: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  employeeChipActive: {
    backgroundColor: BRAND_COLORS.darkPurple,
    borderColor: BRAND_COLORS.darkPurple,
  },
  employeeChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  employeeChipTextActive: {
    color: SEMANTIC_COLORS.white,
  },
  employeeNumber: {
    marginTop: 4,
    fontSize: 11,
    color: "#6b7280",
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchLabel: {
    flex: 1,
    marginRight: 12,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
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
  buttonDisabled: {
    opacity: 0.7,
  },
});
