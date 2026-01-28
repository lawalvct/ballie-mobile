import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Platform,
  Switch,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { announcementService } from "../services/announcementService";
import type {
  AnnouncementDeliveryMethod,
  AnnouncementPriority,
  AnnouncementPreviewResponse,
  AnnouncementRecipientType,
} from "../types";
import { departmentService } from "../../department/services/departmentService";
import { employeeService } from "../../employee/services/employeeService";
import type { PayrollDepartment } from "../../department/types";
import type { PayrollEmployee } from "../../employee/types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollAnnouncementEdit"
>;

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const PRIORITY_OPTIONS: { label: string; value: AnnouncementPriority }[] = [
  { label: "Low", value: "low" },
  { label: "Normal", value: "normal" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

const DELIVERY_OPTIONS: { label: string; value: AnnouncementDeliveryMethod }[] =
  [
    { label: "Email", value: "email" },
    { label: "SMS", value: "sms" },
    { label: "Both", value: "both" },
  ];

const RECIPIENT_OPTIONS: { label: string; value: AnnouncementRecipientType }[] =
  [
    { label: "All Employees", value: "all" },
    { label: "Department", value: "department" },
    { label: "Selected Employees", value: "selected" },
  ];

const getEmployeeName = (employee: PayrollEmployee) => {
  if (employee.full_name?.trim()) return employee.full_name.trim();
  const first = employee.first_name?.trim();
  const last = employee.last_name?.trim();
  const combined = [first, last].filter(Boolean).join(" ");
  if (combined) return combined;
  if (employee.employee_number) return employee.employee_number;
  return `Employee ${employee.id}`;
};

export default function PayrollAnnouncementEditScreen({
  navigation,
  route,
}: Props) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<AnnouncementPriority>("normal");
  const [deliveryMethod, setDeliveryMethod] =
    useState<AnnouncementDeliveryMethod>("email");
  const [recipientType, setRecipientType] =
    useState<AnnouncementRecipientType>("all");
  const [departments, setDepartments] = useState<PayrollDepartment[]>([]);
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [requiresAck, setRequiresAck] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<string | undefined>();
  const [expiresAt, setExpiresAt] = useState<string | undefined>();
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [showExpiresPicker, setShowExpiresPicker] = useState(false);
  const [preview, setPreview] = useState<AnnouncementPreviewResponse | null>(
    null,
  );
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | undefined>();

  useEffect(() => {
    loadFilters();
    loadAnnouncement();
  }, [id]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadPreview();
    }, 250);
    return () => clearTimeout(handler);
  }, [recipientType, selectedDepartments, selectedEmployees]);

  const loadFilters = async () => {
    try {
      const [deptRes, empRes] = await Promise.all([
        departmentService.list({ per_page: 1000 }),
        employeeService.list({ per_page: 1000 }),
      ]);
      setDepartments(deptRes.departments || []);
      setEmployees(empRes.employees || []);
    } catch (_error) {
      // ignore
    }
  };

  const loadAnnouncement = async () => {
    try {
      setLoading(true);
      const response = await announcementService.show(id);
      const announcement = response.announcement;
      setTitle(announcement.title || "");
      setMessage(announcement.message || "");
      setPriority(announcement.priority || "normal");
      setDeliveryMethod(announcement.delivery_method || "email");
      setRecipientType(announcement.recipient_type || "all");
      setSelectedDepartments(
        Array.isArray(announcement.department_ids)
          ? announcement.department_ids
          : [],
      );
      setSelectedEmployees(
        Array.isArray(announcement.employee_ids)
          ? announcement.employee_ids
          : [],
      );
      setRequiresAck(Boolean(announcement.requires_acknowledgment));
      setScheduledAt(announcement.scheduled_at || undefined);
      setExpiresAt(announcement.expires_at || undefined);
      setStatus(announcement.status);
    } catch (error: any) {
      showToast(error.message || "Failed to load announcement", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadPreview = async () => {
    if (recipientType === "department" && selectedDepartments.length === 0) {
      setPreview(null);
      return;
    }
    if (recipientType === "selected" && selectedEmployees.length === 0) {
      setPreview(null);
      return;
    }

    try {
      setPreviewLoading(true);
      const response = await announcementService.previewRecipients({
        recipient_type: recipientType,
        department_ids: selectedDepartments,
        employee_ids: selectedEmployees,
      });
      setPreview(response);
    } catch (_error) {
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const filteredDepartments = useMemo(() => {
    const term = departmentSearch.trim().toLowerCase();
    if (!term) return departments;
    return departments.filter((dept) => dept.name.toLowerCase().includes(term));
  }, [departments, departmentSearch]);

  const filteredEmployees = useMemo(() => {
    const term = employeeSearch.trim().toLowerCase();
    if (!term) return employees;
    return employees.filter((emp) =>
      getEmployeeName(emp).toLowerCase().includes(term),
    );
  }, [employees, employeeSearch]);

  const toggleDepartment = (idValue: number) => {
    setSelectedDepartments((prev) =>
      prev.includes(idValue)
        ? prev.filter((value) => value !== idValue)
        : [...prev, idValue],
    );
  };

  const toggleEmployee = (idValue: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(idValue)
        ? prev.filter((value) => value !== idValue)
        : [...prev, idValue],
    );
  };

  const handleSubmit = async () => {
    if (status && status !== "draft" && status !== "failed") {
      showToast("Only draft or failed announcements can be edited", "error");
      return;
    }
    if (!title.trim()) {
      showToast("Please enter title", "error");
      return;
    }
    if (!message.trim()) {
      showToast("Please enter message", "error");
      return;
    }
    if (recipientType === "department" && selectedDepartments.length === 0) {
      showToast("Select at least one department", "error");
      return;
    }
    if (recipientType === "selected" && selectedEmployees.length === 0) {
      showToast("Select at least one employee", "error");
      return;
    }

    try {
      setSubmitting(true);
      await announcementService.update(id, {
        title: title.trim(),
        message: message.trim(),
        priority,
        delivery_method: deliveryMethod,
        recipient_type: recipientType,
        department_ids: selectedDepartments,
        employee_ids: selectedEmployees,
        requires_acknowledgment: requiresAck,
        scheduled_at: scheduledAt || null,
        expires_at: expiresAt || null,
      });
      showToast("Announcement updated", "success");
      navigation.goBack();
    } catch (error: any) {
      showToast(error.message || "Failed to update announcement", "error");
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
          <Text style={styles.headerTitle}>Edit Announcement</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading announcement...</Text>
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
        <Text style={styles.headerTitle}>Edit Announcement</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Announcement Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Announcement title"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="Type message"
              multiline
            />
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={priority}
                  onValueChange={(value) => setPriority(value)}>
                  {PRIORITY_OPTIONS.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Delivery</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={deliveryMethod}
                  onValueChange={(value) => setDeliveryMethod(value)}>
                  {DELIVERY_OPTIONS.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Recipient Type</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={recipientType}
                onValueChange={(value) => {
                  setRecipientType(value);
                  setSelectedDepartments([]);
                  setSelectedEmployees([]);
                }}>
                {RECIPIENT_OPTIONS.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {recipientType === "department" && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Departments</Text>
              <TextInput
                style={styles.searchInput}
                value={departmentSearch}
                onChangeText={setDepartmentSearch}
                placeholder="Search departments..."
                placeholderTextColor="#9ca3af"
              />
              <View style={styles.employeeList}>
                {filteredDepartments.map((dept) => {
                  const isSelected = selectedDepartments.includes(dept.id);
                  return (
                    <TouchableOpacity
                      key={dept.id}
                      style={[
                        styles.employeeChip,
                        isSelected && styles.employeeChipActive,
                      ]}
                      onPress={() => toggleDepartment(dept.id)}>
                      <Text
                        style={[
                          styles.employeeChipText,
                          isSelected && styles.employeeChipTextActive,
                        ]}>
                        {dept.name}
                      </Text>
                      {dept.employees_count !== undefined ? (
                        <Text
                          style={[
                            styles.employeeNumber,
                            isSelected && styles.employeeChipTextActive,
                          ]}>
                          {dept.employees_count} employees
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.helperText}>
                Selected: {selectedDepartments.length}
              </Text>
            </View>
          )}

          {recipientType === "selected" && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Employees</Text>
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
                        {getEmployeeName(emp)}
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
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.label}>Requires Acknowledgment</Text>
                <Text style={styles.helperText}>
                  Ask recipients to confirm they read it.
                </Text>
              </View>
              <Switch value={requiresAck} onValueChange={setRequiresAck} />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Scheduled Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowSchedulePicker(true)}>
                <Text
                  style={[
                    styles.dateButtonText,
                    !scheduledAt && styles.datePlaceholder,
                  ]}>
                  {scheduledAt || "YYYY-MM-DD"}
                </Text>
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>
              {scheduledAt ? (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setScheduledAt(undefined)}>
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Expires Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowExpiresPicker(true)}>
                <Text
                  style={[
                    styles.dateButtonText,
                    !expiresAt && styles.datePlaceholder,
                  ]}>
                  {expiresAt || "YYYY-MM-DD"}
                </Text>
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>
              {expiresAt ? (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setExpiresAt(undefined)}>
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={styles.previewBox}>
            <Text style={styles.previewTitle}>Recipient Preview</Text>
            <Text style={styles.previewText}>
              {previewLoading
                ? "Loading preview..."
                : preview
                  ? `${preview.count} recipient(s)`
                  : "Select recipients to preview"}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, submitting && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={submitting}>
            <Text style={styles.primaryBtnText}>
              {submitting ? "Saving..." : "Update Announcement"}
            </Text>
          </TouchableOpacity>
        </View>

        {showSchedulePicker && (
          <DateTimePicker
            value={scheduledAt ? new Date(scheduledAt) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_event, selectedDate) => {
              setShowSchedulePicker(Platform.OS === "ios");
              if (selectedDate) {
                setScheduledAt(formatDate(selectedDate));
              }
            }}
          />
        )}

        {showExpiresPicker && (
          <DateTimePicker
            value={expiresAt ? new Date(expiresAt) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_event, selectedDate) => {
              setShowExpiresPicker(Platform.OS === "ios");
              if (selectedDate) {
                setExpiresAt(formatDate(selectedDate));
              }
            }}
          />
        )}

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
    padding: 40,
    alignItems: "center",
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
    marginBottom: 14,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 6,
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
    minHeight: 110,
    textAlignVertical: "top",
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  searchInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
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
    fontSize: 13,
    color: BRAND_COLORS.darkPurple,
  },
  datePlaceholder: {
    color: "#9ca3af",
  },
  calendarIcon: {
    fontSize: 16,
  },
  clearButton: {
    marginTop: 6,
    alignSelf: "flex-start",
  },
  clearButtonText: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "600",
  },
  previewBox: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 14,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  previewText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  primaryBtn: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  submitDisabled: {
    opacity: 0.7,
  },
});
