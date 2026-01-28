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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { overtimeService } from "../services/overtimeService";
import type { OvertimeCalculationMethod, OvertimeType } from "../types";
import { employeeService } from "../../employee/services/employeeService";
import type { PayrollEmployee } from "../../employee/types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollOvertimeCreate"
>;

const OVERTIME_TYPES: { label: string; value: OvertimeType }[] = [
  { label: "Weekday", value: "weekday" },
  { label: "Weekend", value: "weekend" },
  { label: "Holiday", value: "holiday" },
  { label: "Emergency", value: "emergency" },
];

const formatDate = (date: Date) => date.toISOString().split("T")[0];

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

const parseNumber = (value: string) => {
  if (!value.trim()) return undefined;
  const parsed = Number(value.replace(/,/g, ""));
  if (Number.isNaN(parsed)) return undefined;
  return parsed;
};

const calculateHours = (start: string, end: string) => {
  if (!start || !end) return undefined;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if ([sh, sm, eh, em].some((item) => Number.isNaN(item))) return undefined;
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  const diff =
    endMinutes >= startMinutes
      ? endMinutes - startMinutes
      : endMinutes + 24 * 60 - startMinutes;
  return Math.round((diff / 60) * 100) / 100;
};

export default function PayrollOvertimeCreateScreen({
  navigation,
  route,
}: Props) {
  const { onCreated } = route.params || {};
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [employeeId, setEmployeeId] = useState<number | undefined>();
  const [overtimeDate, setOvertimeDate] = useState(formatDate(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calculationMethod, setCalculationMethod] =
    useState<OvertimeCalculationMethod>("hourly");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [overtimeType, setOvertimeType] = useState<OvertimeType>("weekday");
  const [hourlyRate, setHourlyRate] = useState("");
  const [fixedAmount, setFixedAmount] = useState("");
  const [reason, setReason] = useState("");
  const [workDescription, setWorkDescription] = useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await employeeService.list({ per_page: 1000 });
      setEmployees(response.employees || []);
    } catch (_error) {
      // ignore
    }
  };

  const totalHours = useMemo(
    () => calculateHours(startTime, endTime),
    [startTime, endTime],
  );

  const handleSubmit = async () => {
    if (!employeeId) {
      showToast("Please select employee", "error");
      return;
    }
    if (!overtimeDate) {
      showToast("Please select overtime date", "error");
      return;
    }
    if (!reason.trim()) {
      showToast("Please enter reason", "error");
      return;
    }

    if (calculationMethod === "hourly") {
      if (!startTime.trim() || !endTime.trim()) {
        showToast("Please select start and end time", "error");
        return;
      }
      const rate = parseNumber(hourlyRate);
      if (rate === undefined) {
        showToast("Please enter valid hourly rate", "error");
        return;
      }

      try {
        setSubmitting(true);
        await overtimeService.create({
          employee_id: employeeId,
          overtime_date: overtimeDate,
          calculation_method: "hourly",
          start_time: startTime,
          end_time: endTime,
          overtime_type: overtimeType,
          hourly_rate: rate,
          reason: reason.trim(),
          work_description: workDescription.trim() || undefined,
        });
        showToast("Overtime created", "success");
        onCreated?.();
        navigation.goBack();
      } catch (error: any) {
        showToast(error.message || "Failed to create overtime", "error");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const amount = parseNumber(fixedAmount);
    if (amount === undefined) {
      showToast("Please enter valid fixed amount", "error");
      return;
    }

    try {
      setSubmitting(true);
      await overtimeService.create({
        employee_id: employeeId,
        overtime_date: overtimeDate,
        calculation_method: "fixed",
        fixed_amount: amount,
        reason: reason.trim(),
        work_description: workDescription.trim() || undefined,
      } as any);
      showToast("Overtime created", "success");
      onCreated?.();
      navigation.goBack();
    } catch (error: any) {
      showToast(error.message || "Failed to create overtime", "error");
    } finally {
      setSubmitting(false);
    }
  };

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
        <Text style={styles.headerTitle}>Create Overtime</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Overtime Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Employee <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={employeeId}
                onValueChange={(value) => setEmployeeId(value)}>
                <Picker.Item label="Select employee" value={undefined} />
                {employees.map((emp) => (
                  <Picker.Item key={emp.id} label={emp.name} value={emp.id} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Overtime Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateButtonText}>{overtimeDate}</Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Calculation Method</Text>
            <View style={styles.methodRow}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  calculationMethod === "hourly" && styles.methodButtonActive,
                ]}
                onPress={() => setCalculationMethod("hourly")}>
                <Text
                  style={[
                    styles.methodText,
                    calculationMethod === "hourly" && styles.methodTextActive,
                  ]}>
                  Hourly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  calculationMethod === "fixed" && styles.methodButtonActive,
                ]}
                onPress={() => setCalculationMethod("fixed")}>
                <Text
                  style={[
                    styles.methodText,
                    calculationMethod === "fixed" && styles.methodTextActive,
                  ]}>
                  Fixed
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {calculationMethod === "hourly" && (
            <>
              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Start Time</Text>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowStartTimePicker(true)}>
                    <Text style={styles.timeButtonText}>
                      {startTime || "Select"}
                    </Text>
                    <Text style={styles.timeIcon}>⏰</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>End Time</Text>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowEndTimePicker(true)}>
                    <Text style={styles.timeButtonText}>
                      {endTime || "Select"}
                    </Text>
                    <Text style={styles.timeIcon}>⏰</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Overtime Type</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={overtimeType}
                    onValueChange={(value) => setOvertimeType(value)}>
                    {OVERTIME_TYPES.map((type) => (
                      <Picker.Item
                        key={type.value}
                        label={type.label}
                        value={type.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Hourly Rate</Text>
                <TextInput
                  style={styles.input}
                  value={hourlyRate}
                  onChangeText={setHourlyRate}
                  placeholder="e.g., 3000"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.previewBox}>
                <Text style={styles.previewTitle}>Preview</Text>
                <Text style={styles.previewText}>
                  Hours: {totalHours ?? "-"}
                </Text>
              </View>
            </>
          )}

          {calculationMethod === "fixed" && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Fixed Amount</Text>
              <TextInput
                style={styles.input}
                value={fixedAmount}
                onChangeText={setFixedAmount}
                placeholder="e.g., 15000"
                keyboardType="numeric"
              />
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Reason <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={reason}
              onChangeText={setReason}
              placeholder="Reason for overtime"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Work Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={workDescription}
              onChangeText={setWorkDescription}
              placeholder="Optional description"
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={submitting}>
            <Text style={styles.submitButtonText}>
              {submitting ? "Saving..." : "Create Overtime"}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={overtimeDate ? new Date(overtimeDate) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_event, selectedDate) => {
              setShowDatePicker(Platform.OS === "ios");
              if (selectedDate) {
                setOvertimeDate(formatDate(selectedDate));
              }
            }}
          />
        )}

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
  label: {
    fontSize: 13,
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
    textAlignVertical: "top",
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
  calendarIcon: {
    fontSize: 16,
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  methodRow: {
    flexDirection: "row",
    gap: 10,
  },
  methodButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  methodButtonActive: {
    backgroundColor: BRAND_COLORS.darkPurple,
    borderColor: BRAND_COLORS.darkPurple,
  },
  methodText: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  methodTextActive: {
    color: "#fff",
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
    marginBottom: 14,
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
  timeIcon: {
    fontSize: 16,
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
    fontSize: 12,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 12,
    color: "#6b7280",
  },
  submitButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
});
