import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { positionService } from "../services/positionService";
import { departmentService } from "../../department/services/departmentService";
import type { PayrollDepartment } from "../../department/types";
import type { PayrollPosition } from "../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollPositionEdit"
>;

export default function PayrollPositionEditScreen({
  navigation,
  route,
}: Props) {
  const { id, onUpdated } = route.params;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState<PayrollDepartment[]>([]);
  const [positions, setPositions] = useState<PayrollPosition[]>([]);
  const [position, setPosition] = useState<PayrollPosition | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [departmentId, setDepartmentId] = useState<number | undefined>();
  const [level, setLevel] = useState<number | undefined>(undefined);
  const [reportsToId, setReportsToId] = useState<number | undefined>();
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [requirements, setRequirements] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadFormData();
    loadPosition();
  }, [id]);

  const loadFormData = async () => {
    try {
      const [deptRes, posRes] = await Promise.all([
        departmentService.list({ per_page: 1000 }),
        positionService.list({ per_page: 1000 }),
      ]);
      setDepartments(deptRes.departments || []);
      setPositions((posRes.positions || []).filter((item) => item.id !== id));
    } catch (_error) {
      // ignore form data load errors
    }
  };

  const loadPosition = async () => {
    try {
      setLoading(true);
      const response = await positionService.show(id);
      setPosition(response);
      setName(response.name || "");
      setCode(response.code || "");
      setDepartmentId(response.department_id);
      setLevel(response.level || undefined);
      setReportsToId(response.reports_to_position_id || undefined);
      setMinSalary(
        typeof response.min_salary === "number" ? `${response.min_salary}` : "",
      );
      setMaxSalary(
        typeof response.max_salary === "number" ? `${response.max_salary}` : "",
      );
      setRequirements(response.requirements || "");
      setResponsibilities(response.responsibilities || "");
      setDescription(response.description || "");
      setSortOrder(
        typeof response.sort_order === "number" ? `${response.sort_order}` : "",
      );
      setIsActive(Boolean(response.is_active));
    } catch (error: any) {
      showToast(error.message || "Failed to load position", "error");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const parseNumber = (value: string) => {
    if (!value.trim()) return undefined;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return undefined;
    return parsed;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast("Please enter position name", "error");
      return;
    }
    if (!code.trim()) {
      showToast("Please enter position code", "error");
      return;
    }

    const minSalaryValue = parseNumber(minSalary);
    const maxSalaryValue = parseNumber(maxSalary);
    const sortOrderValue = parseNumber(sortOrder);

    if (minSalary && minSalaryValue === undefined) {
      showToast("Please enter a valid minimum salary", "error");
      return;
    }
    if (maxSalary && maxSalaryValue === undefined) {
      showToast("Please enter a valid maximum salary", "error");
      return;
    }

    try {
      setSubmitting(true);
      await positionService.update(id, {
        name: name.trim(),
        code: code.trim(),
        description: description.trim() || undefined,
        department_id: departmentId,
        level: level || undefined,
        reports_to_position_id: reportsToId,
        min_salary: minSalaryValue,
        max_salary: maxSalaryValue,
        requirements: requirements.trim() || undefined,
        responsibilities: responsibilities.trim() || undefined,
        is_active: isActive,
        sort_order: sortOrderValue,
      });
      showToast("Position updated successfully", "success");
      onUpdated?.(id);
      navigation.goBack();
    } catch (error: any) {
      showToast(error.message || "Failed to update position", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !position) {
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
          <Text style={styles.headerTitle}>Edit Position</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading position...</Text>
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
        <Text style={styles.headerTitle}>Edit Position</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Position Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Senior Accountant"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Code <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder="e.g., ACC-SR"
              placeholderTextColor="#9ca3af"
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Department</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={departmentId}
                onValueChange={(value) =>
                  setDepartmentId(typeof value === "number" ? value : undefined)
                }>
                <Picker.Item label="Select department" value={undefined} />
                {departments.map((dept) => (
                  <Picker.Item
                    key={dept.id}
                    label={dept.name}
                    value={dept.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Level</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={level}
                onValueChange={(value) =>
                  setLevel(typeof value === "number" ? value : undefined)
                }>
                <Picker.Item label="Select level" value={undefined} />
                {Array.from({ length: 10 }, (_, idx) => idx + 1).map((item) => (
                  <Picker.Item
                    key={item}
                    label={`Level ${item}`}
                    value={item}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Reports To</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={reportsToId}
                onValueChange={(value) =>
                  setReportsToId(typeof value === "number" ? value : undefined)
                }>
                <Picker.Item label="None" value={undefined} />
                {positions.map((pos) => (
                  <Picker.Item key={pos.id} label={pos.name} value={pos.id} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Min Salary</Text>
              <TextInput
                style={styles.input}
                value={minSalary}
                onChangeText={setMinSalary}
                placeholder="e.g., 120000"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Max Salary</Text>
              <TextInput
                style={styles.input}
                value={maxSalary}
                onChangeText={setMaxSalary}
                placeholder="e.g., 200000"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Optional description"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Requirements</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={requirements}
              onChangeText={setRequirements}
              placeholder="Optional requirements"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Responsibilities</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={responsibilities}
              onChangeText={setResponsibilities}
              placeholder="Optional responsibilities"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Sort Order</Text>
            <TextInput
              style={styles.input}
              value={sortOrder}
              onChangeText={setSortOrder}
              placeholder="Optional"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.label}>Active</Text>
                <Text style={styles.helperText}>
                  {isActive ? "Position is active" : "Position is inactive"}
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: "#d1d5db", true: BRAND_COLORS.gold }}
                thumbColor={isActive ? BRAND_COLORS.darkPurple : "#f3f4f6"}
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
              {submitting ? "Saving..." : "Update Position"}
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
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
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
  textArea: {
    minHeight: 90,
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
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
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
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
