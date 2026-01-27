import React, { useEffect, useState } from "react";
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
import { attendanceService } from "../services/attendanceService";
import { employeeService } from "../../employee/services/employeeService";
import type { PayrollEmployee } from "../../employee/types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollAttendanceManualEntry"
>;

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

export default function PayrollAttendanceManualEntryScreen({
  navigation,
  route,
}: Props) {
  const { onCreated } = route.params || {};
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [employeeId, setEmployeeId] = useState<number | undefined>();
  const [date, setDate] = useState(formatDate(new Date()));
  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");
  const [breakMinutes, setBreakMinutes] = useState("");
  const [notes, setNotes] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showClockInPicker, setShowClockInPicker] = useState(false);
  const [showClockOutPicker, setShowClockOutPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!employeeId) {
      showToast("Please select an employee", "error");
      return;
    }
    if (!date) {
      showToast("Please select a date", "error");
      return;
    }
    if (!clockIn || !clockOut) {
      showToast("Please set clock-in and clock-out", "error");
      return;
    }

    const breakValue = breakMinutes.trim()
      ? Number(breakMinutes.trim())
      : undefined;

    if (breakMinutes && Number.isNaN(breakValue)) {
      showToast("Please enter a valid break minutes", "error");
      return;
    }

    try {
      setSubmitting(true);
      await attendanceService.manualEntry({
        employee_id: employeeId,
        date,
        clock_in_time: clockIn,
        clock_out_time: clockOut,
        break_minutes: breakValue,
        notes: notes.trim() || undefined,
      });
      showToast("Attendance saved", "success");
      onCreated?.();
      navigation.goBack();
    } catch (error: any) {
      showToast(error.message || "Failed to save attendance", "error");
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
        <Text style={styles.headerTitle}>Manual Attendance</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Attendance Entry</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Employee</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={employeeId}
                onValueChange={(value) =>
                  setEmployeeId(typeof value === "number" ? value : undefined)
                }>
                <Picker.Item label="Select employee" value={undefined} />
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateButtonText}>{date}</Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Clock In</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowClockInPicker(true)}>
                <Text style={styles.timeButtonText}>{clockIn || "08:00"}</Text>
                <Text style={styles.clockIcon}>🕒</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Clock Out</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowClockOutPicker(true)}>
                <Text style={styles.timeButtonText}>{clockOut || "17:00"}</Text>
                <Text style={styles.clockIcon}>🕒</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Break Minutes</Text>
            <TextInput
              style={styles.input}
              value={breakMinutes}
              onChangeText={setBreakMinutes}
              placeholder="60"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={styles.input}
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.primaryBtn, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>
              {submitting ? "Saving..." : "Save Attendance"}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date ? new Date(date) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_event, selectedDate) => {
              setShowDatePicker(Platform.OS === "ios");
              if (selectedDate) {
                setDate(formatDate(selectedDate));
              }
            }}
          />
        )}

        {showClockInPicker && (
          <DateTimePicker
            value={toTimeDate(clockIn)}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_event, selectedDate) => {
              setShowClockInPicker(Platform.OS === "ios");
              if (selectedDate) {
                setClockIn(formatTime(selectedDate));
              }
            }}
          />
        )}

        {showClockOutPicker && (
          <DateTimePicker
            value={toTimeDate(clockOut)}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_event, selectedDate) => {
              setShowClockOutPicker(Platform.OS === "ios");
              if (selectedDate) {
                setClockOut(formatTime(selectedDate));
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
  pickerWrapper: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
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
  clockIcon: {
    fontSize: 16,
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
