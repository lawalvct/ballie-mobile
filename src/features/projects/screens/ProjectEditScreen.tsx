import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProjectStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import {
  useProjectDetail,
  useProjectFormData,
  useUpdateProject,
  useDeleteProject,
} from "../hooks/useProjects";
import type { UpdateProjectPayload, ProjectStatus, Priority } from "../types";

type Props = NativeStackScreenProps<ProjectStackParamList, "ProjectEdit">;

const STATUSES: { label: string; value: ProjectStatus }[] = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "On Hold", value: "on_hold" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
];

const PRIORITIES: { label: string; value: Priority }[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

const formatDate = (date: Date): string => date.toISOString().split("T")[0];

const formatBudgetInput = (value: string): string => {
  if (!value) return "";

  const normalized = value.replace(/,/g, "");
  const [wholePart, decimalPart] = normalized.split(".");
  const formattedWhole = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return decimalPart !== undefined
    ? `${formattedWhole}.${decimalPart.replace(/[^\d]/g, "")}`
    : formattedWhole;
};

const formatDateDisplay = (date: string): string =>
  new Date(date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

export default function ProjectEditScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const { project, isLoading: detailLoading } = useProjectDetail(id);
  const { formData, isLoading: formLoading } = useProjectFormData();
  const updateProject = useUpdateProject(id);
  const deleteProject = useDeleteProject();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<UpdateProjectPayload>({
    name: "",
    status: "draft",
    priority: "medium",
  });
  const [budgetInput, setBudgetInput] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const filteredClients = useMemo(() => {
    if (!formData?.customers || !clientSearch.trim()) return formData?.customers ?? [];

    const query = clientSearch.toLowerCase();
    return formData.customers.filter(
      (customer) =>
        (customer.company_name && customer.company_name.toLowerCase().includes(query)) ||
        `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(query),
    );
  }, [formData?.customers, clientSearch]);

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name,
        description: project.description,
        customer_id: project.customer_id,
        assigned_to: project.assigned_to,
        status: project.status,
        priority: project.priority,
        start_date: project.start_date,
        end_date: project.end_date,
        budget: project.budget,
      });

      setBudgetInput(project.budget != null ? formatBudgetInput(String(project.budget)) : "");
    }
  }, [project]);

  useEffect(() => {
    if (!formData?.customers || !project) return;

    const selectedCustomer = formData.customers.find((customer) => customer.id === project.customer_id);
    if (selectedCustomer) {
      setClientSearch(selectedCustomer.company_name || `${selectedCustomer.first_name} ${selectedCustomer.last_name}`);
    }
  }, [formData?.customers, project]);

  const updateField = <K extends keyof UpdateProjectPayload>(
    key: K,
    value: UpdateProjectPayload[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleBudgetChange = (value: string) => {
    const sanitized = value.replace(/,/g, "").replace(/[^\d.]/g, "");
    const [wholePart = "", ...decimalParts] = sanitized.split(".");
    const normalized = decimalParts.length > 0
      ? `${wholePart}.${decimalParts.join("")}`
      : wholePart;

    setBudgetInput(formatBudgetInput(normalized));
    updateField("budget", normalized ? parseFloat(normalized) : null);
  };

  const handleSubmit = () => {
    if (!form.name?.trim()) {
      Alert.alert("Validation", "Project name is required.");
      return;
    }
    updateProject.mutate(form, {
      onSuccess: () => navigation.goBack(),
    });
  };

  const handleDelete = () => {
    Alert.alert("Delete Project", "Are you sure? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteProject.mutate(id, {
            onSuccess: () => navigation.navigate("ProjectList"),
          }),
      },
    ]);
  };

  if (detailLoading || formLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="light" />

      <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerSide}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Project</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.headerSide}>
          <Text style={styles.deleteText}>🗑️</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Step indicator */}
        <View style={styles.stepRow}>
          <TouchableOpacity
            style={[styles.stepDot, step === 1 && styles.stepDotActive]}
            onPress={() => setStep(1)}>
            <Text style={[styles.stepText, step === 1 && styles.stepTextActive]}>1</Text>
          </TouchableOpacity>
          <View style={styles.stepLine} />
          <TouchableOpacity
            style={[styles.stepDot, step === 2 && styles.stepDotActive]}
            onPress={() => setStep(2)}>
            <Text style={[styles.stepText, step === 2 && styles.stepTextActive]}>2</Text>
          </TouchableOpacity>
        </View>

        {step === 1 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Project Details</Text>

            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Project name"
              placeholderTextColor="#9ca3af"
              value={form.name}
              onChangeText={(v) => updateField("name", v)}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Brief description..."
              placeholderTextColor="#9ca3af"
              value={form.description || ""}
              onChangeText={(v) => updateField("description", v)}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Client</Text>
            <View style={styles.searchSelectWrap}>
              <TextInput
                style={styles.input}
                placeholder="Search client..."
                placeholderTextColor="#9ca3af"
                value={clientSearch}
                onChangeText={(value) => {
                  setClientSearch(value);
                  setShowClientDropdown(true);
                  if (!value.trim()) {
                    updateField("customer_id", null);
                  }
                }}
                onFocus={() => setShowClientDropdown(true)}
              />
              {form.customer_id && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => {
                    updateField("customer_id", null);
                    setClientSearch("");
                  }}>
                  <Text style={styles.clearBtnText}>✕</Text>
                </TouchableOpacity>
              )}
              {showClientDropdown && filteredClients.length > 0 && (
                <View style={styles.dropdown}>
                  <ScrollView style={styles.dropdownScroll} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                    {filteredClients.map((customer) => {
                      const label = customer.company_name || `${customer.first_name} ${customer.last_name}`;

                      return (
                        <TouchableOpacity
                          key={`client-${customer.id}`}
                          style={[
                            styles.dropdownItem,
                            form.customer_id === customer.id && styles.dropdownItemActive,
                          ]}
                          onPress={() => {
                            updateField("customer_id", customer.id);
                            setClientSearch(label);
                            setShowClientDropdown(false);
                          }}>
                          <Text style={styles.dropdownItemText}>{label}</Text>
                          {customer.company_name && (
                            <Text style={styles.dropdownItemSub}>{customer.first_name} {customer.last_name}</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>

            <Text style={styles.label}>Manager</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.assigned_to}
                onValueChange={(value) => updateField("assigned_to", value)}
                style={styles.picker}>
                <Picker.Item label="Select Manager" value={null} />
                {formData?.team_members.map((member) => (
                  <Picker.Item key={`member-${member.id}`} label={member.name} value={member.id} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Status *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.status}
                onValueChange={(value) => updateField("status", value)}
                style={styles.picker}>
                {STATUSES.map((status) => (
                  <Picker.Item key={`status-${status.value}`} label={status.label} value={status.value} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Priority *</Text>
            <View style={styles.chipWrap}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={`priority-${p.value}`}
                  style={[styles.chip, form.priority === p.value && styles.chipActive]}
                  onPress={() => updateField("priority", p.value)}>
                  <Text style={[styles.chipText, form.priority === p.value && styles.chipTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
              <Text style={styles.nextBtnText}>Next →</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Timeline & Budget</Text>

            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>
                {form.start_date ? formatDateDisplay(form.start_date) : "Select start date"}
              </Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={form.start_date ? new Date(form.start_date) : new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_event, selectedDate) => {
                  setShowStartPicker(Platform.OS === "ios");
                  if (selectedDate) updateField("start_date", formatDate(selectedDate));
                }}
              />
            )}

            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>
                {form.end_date ? formatDateDisplay(form.end_date) : "Select end date"}
              </Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={form.end_date ? new Date(form.end_date) : new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_event, selectedDate) => {
                  setShowEndPicker(Platform.OS === "ios");
                  if (selectedDate) updateField("end_date", formatDate(selectedDate));
                }}
              />
            )}

            <Text style={styles.label}>Budget (₦)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#9ca3af"
              value={budgetInput}
              onChangeText={handleBudgetChange}
              keyboardType="numeric"
            />

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.stepBackBtn} onPress={() => setStep(1)}>
                <Text style={styles.stepBackBtnText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                disabled={updateProject.isPending}
                onPress={handleSubmit}>
                {updateProject.isPending ? (
                  <ActivityIndicator color="#1a0f33" />
                ) : (
                  <Text style={styles.submitBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1a0f33" },
  loadingWrap: { flex: 1, backgroundColor: "#f3f4f8", justifyContent: "center", alignItems: "center" },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  headerSide: { width: 50 },
  backText: { fontSize: 15, color: BRAND_COLORS.gold, fontWeight: "600" },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "bold", color: "#fff", textAlign: "center" },
  deleteText: { fontSize: 20, textAlign: "right" },

  body: { flex: 1, backgroundColor: "#f3f4f8", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20 },

  stepRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#e5e7eb", alignItems: "center", justifyContent: "center" },
  stepDotActive: { backgroundColor: BRAND_COLORS.gold },
  stepLine: { width: 40, height: 2, backgroundColor: "#e5e7eb" },
  stepText: { fontSize: 14, fontWeight: "700", color: "#6b7280" },
  stepTextActive: { color: "#1a0f33" },

  formSection: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: BRAND_COLORS.darkPurple, marginBottom: 16 },

  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: "#fff", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", fontSize: 15, color: "#1f2937" },
  textArea: { minHeight: 100, textAlignVertical: "top" },

  searchSelectWrap: { position: "relative", zIndex: 10 },
  clearBtn: { position: "absolute", right: 12, top: 12 },
  clearBtnText: { fontSize: 16, color: "#9ca3af", fontWeight: "600" },
  dropdown: { position: "absolute", top: 52, left: 0, right: 0, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, maxHeight: 200, zIndex: 100, elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
  dropdownScroll: { maxHeight: 200 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  dropdownItemActive: { backgroundColor: "#f3f0ff" },
  dropdownItemText: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  dropdownItemSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },

  pickerContainer: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, overflow: "hidden", marginBottom: 4 },
  picker: { height: 50, color: "#1f2937" },

  dateButton: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14 },
  dateIcon: { fontSize: 16 },
  dateText: { fontSize: 15, fontWeight: "600", color: "#1f2937" },

  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", marginRight: 8, marginBottom: 4 },
  chipActive: { backgroundColor: BRAND_COLORS.darkPurple, borderColor: BRAND_COLORS.darkPurple },
  chipText: { fontSize: 13, fontWeight: "500", color: "#6b7280" },
  chipTextActive: { color: "#fff" },

  nextBtn: { marginTop: 24, backgroundColor: BRAND_COLORS.gold, paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  nextBtnText: { fontSize: 16, fontWeight: "700", color: "#1a0f33" },

  btnRow: { flexDirection: "row", gap: 12, marginTop: 24 },
  stepBackBtn: { flex: 1, backgroundColor: "#fff", paddingVertical: 16, borderRadius: 14, alignItems: "center", borderWidth: 1, borderColor: "#e5e7eb" },
  stepBackBtnText: { fontSize: 15, fontWeight: "600", color: BRAND_COLORS.darkPurple },
  submitBtn: { flex: 2, backgroundColor: BRAND_COLORS.gold, paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  submitBtnText: { fontSize: 16, fontWeight: "700", color: "#1a0f33" },
});
