import React, { useEffect, useState } from "react";
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
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { shiftService } from "../services/shiftService";
import type { PayrollShift } from "../types";
import { showToast } from "../../../../utils/toast";
import DateTimePicker from "@react-native-community/datetimepicker";

const WORKING_DAYS = [
  { label: "Mon", value: "monday" },
  { label: "Tue", value: "tuesday" },
  { label: "Wed", value: "wednesday" },
  { label: "Thu", value: "thursday" },
  { label: "Fri", value: "friday" },
  { label: "Sat", value: "saturday" },
  { label: "Sun", value: "sunday" },
];

type Props = NativeStackScreenProps<PayrollStackParamList, "PayrollShiftEdit">;

export default function PayrollShiftEditScreen({ navigation, route }: Props) {
  const { id, onUpdated } = route.params;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shift, setShift] = useState<PayrollShift | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [workHours, setWorkHours] = useState("");
  const [lateGrace, setLateGrace] = useState("");
  const [shiftAllowance, setShiftAllowance] = useState("");
  const [description, setDescription] = useState("");
  const [workingDays, setWorkingDays] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    loadShift();
  }, [id]);

  const loadShift = async () => {
    try {
      setLoading(true);
      const response = await shiftService.show(id, { per_page: 1 });
      const data = response.shift;
      setShift(data);
      setName(data.name || "");
      setCode(data.code || "");
      setStartTime(data.start_time || "");
      setEndTime(data.end_time || "");
      setWorkHours(
        data.work_hours !== undefined && data.work_hours !== null
          ? String(data.work_hours)
          : "",
      );
      setLateGrace(
        data.late_grace_minutes !== undefined &&
          data.late_grace_minutes !== null
          ? String(data.late_grace_minutes)
          : "",
      );
      setShiftAllowance(
        data.shift_allowance !== undefined && data.shift_allowance !== null
          ? String(data.shift_allowance)
          : "",
      );
      setDescription(data.description || "");
      setWorkingDays(data.working_days || []);
      setIsActive(Boolean(data.is_active));
    } catch (error: any) {
      showToast(error.message || "Failed to load shift", "error");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day],
    );
  };

  const parseNumber = (value: string) => {
    if (!value.trim()) return undefined;
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isNaN(parsed)) return undefined;
    return parsed;
  };

  const padTime = (value: number) => String(value).padStart(2, "0");

  const formatTime = (date: Date) =>
    `${padTime(date.getHours())}:${padTime(date.getMinutes())}`;

  const toTimeDate = (time: string) => {
    const fallback = new Date();
    if (!time) return fallback;
    const [hours, minutes] = time.split(":").map((item) => Number(item));
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return fallback;
    const value = new Date(fallback);
    value.setHours(hours, minutes, 0, 0);
    return value;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast("Please enter shift name", "error");
      return;
    }
    if (!code.trim()) {
      showToast("Please enter shift code", "error");
      return;
    }
    if (!startTime.trim()) {
      showToast("Please enter start time", "error");
      return;
    }
    if (!endTime.trim()) {
      showToast("Please enter end time", "error");
      return;
    }

    const workHoursValue = parseNumber(workHours);
    if (workHoursValue === undefined) {
      showToast("Please enter valid work hours", "error");
      return;
    }
    if (workingDays.length === 0) {
      showToast("Please select working days", "error");
      return;
    }

    const lateGraceValue = parseNumber(lateGrace);
    if (lateGrace && lateGraceValue === undefined) {
      showToast("Please enter valid grace minutes", "error");
      return;
    }

    const allowanceValue = parseNumber(shiftAllowance);
    if (shiftAllowance && allowanceValue === undefined) {
      showToast("Please enter valid allowance", "error");
      return;
    }

    try {
      setSubmitting(true);
      await shiftService.update(id, {
        name: name.trim(),
        code: code.trim(),
        start_time: startTime.trim(),
        end_time: endTime.trim(),
        work_hours: workHoursValue,
        working_days: workingDays,
        late_grace_minutes: lateGraceValue,
        shift_allowance: allowanceValue,
        description: description.trim() || undefined,
        is_active: isActive,
      });
      showToast("Shift updated successfully", "success");
      onUpdated?.(id);
      navigation.goBack();
    } catch (error: any) {
      showToast(error.message || "Failed to update shift", "error");
    } finally {
      setSubmitting(false);
    }
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
          <Text style={styles.headerTitle}>Edit Shift</Text>
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
        <Text style={styles.headerTitle}>Edit Shift</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Shift Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Morning Shift"
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
              placeholder="e.g., MS"
              placeholderTextColor="#9ca3af"
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>
                Start Time <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowStartTimePicker(true)}>
                <Text
                  style={[
                    styles.timeButtonText,
                    !startTime && styles.timePlaceholder,
                  ]}>
                  {startTime || "08:00"}
                </Text>
                <Text style={styles.clockIcon}>🕒</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>
                End Time <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowEndTimePicker(true)}>
                <Text
                  style={[
                    styles.timeButtonText,
                    !endTime && styles.timePlaceholder,
                  ]}>
                  {endTime || "17:00"}
                </Text>
                <Text style={styles.clockIcon}>🕒</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showStartTimePicker && (
            <DateTimePicker
              value={toTimeDate(startTime)}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_event, selectedDate) => {
                setShowStartTimePicker(Platform.OS === "ios");
                if (selectedDate) {
                  setStartTime(formatTime(selectedDate));
                }
              }}
            />
          )}

          {showEndTimePicker && (
            <DateTimePicker
              value={toTimeDate(endTime)}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_event, selectedDate) => {
                setShowEndTimePicker(Platform.OS === "ios");
                if (selectedDate) {
                  setEndTime(formatTime(selectedDate));
                }
              }}
            />
          )}

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>
                Work Hours <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={workHours}
                onChangeText={setWorkHours}
                placeholder="8"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Grace (mins)</Text>
              <TextInput
                style={styles.input}
                value={lateGrace}
                onChangeText={setLateGrace}
                placeholder="15"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Shift Allowance</Text>
            <TextInput
              style={styles.input}
              value={shiftAllowance}
              onChangeText={setShiftAllowance}
              placeholder="0"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Working Days <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.daysGrid}>
              {WORKING_DAYS.map((day) => {
                const isSelected = workingDays.includes(day.value);
                return (
                  <TouchableOpacity
                    key={day.value}
                    style={[styles.dayChip, isSelected && styles.dayChipActive]}
                    onPress={() => toggleDay(day.value)}>
                    <Text
                      style={[
                        styles.dayChipText,
                        isSelected && styles.dayChipTextActive,
                      ]}>
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.label}>Active</Text>
                <Text style={styles.helperText}>
                  {isActive ? "Shift is active" : "Shift is inactive"}
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
              {submitting ? "Saving..." : "Save Changes"}
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
  timeButton: {
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
  timeButtonText: {
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  timePlaceholder: {
    color: "#9ca3af",
  },
  clockIcon: {
    fontSize: 16,
  },
  textArea: {
    minHeight: 90,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  dayChipActive: {
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  dayChipTextActive: {
    color: SEMANTIC_COLORS.white,
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
