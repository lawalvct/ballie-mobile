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
import { employeeService } from "../../employee/services/employeeService";
import type { PayrollEmployee } from "../../employee/types";
import { loanService } from "../services/loanService";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollSalaryAdvance"
>;

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const parseNumber = (value: string) => {
  if (!value.trim()) return undefined;
  const parsed = Number(value.replace(/,/g, ""));
  if (Number.isNaN(parsed)) return undefined;
  return parsed;
};

const formatAmount = (value?: number) => {
  if (typeof value !== "number") return "0";
  return new Intl.NumberFormat("en-US").format(value);
};

const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6, 9, 12];

const getEmployeeName = (employee: PayrollEmployee) => {
  if (employee.full_name?.trim()) return employee.full_name.trim();
  const first = employee.first_name?.trim();
  const last = employee.last_name?.trim();
  const combined = [first, last].filter(Boolean).join(" ");
  if (combined) return combined;
  if (employee.employee_number) return employee.employee_number;
  return `Employee ${employee.id}`;
};

export default function PayrollSalaryAdvanceScreen({ navigation }: Props) {
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [employeeId, setEmployeeId] = useState<number | undefined>();
  const [amount, setAmount] = useState("");
  const [durationMonths, setDurationMonths] = useState(1);
  const [purpose, setPurpose] = useState("");
  const [voucherDate, setVoucherDate] = useState(formatDate(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank">("bank");
  const [reference, setReference] = useState("");
  const [cashBankAccountId, setCashBankAccountId] = useState("");
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

  const selectedEmployee = useMemo(
    () => employees.find((emp) => emp.id === employeeId),
    [employees, employeeId],
  );

  const monthlyDeduction = useMemo(() => {
    const amt = parseNumber(amount);
    if (!amt || !durationMonths) return 0;
    return Math.round((amt / durationMonths) * 100) / 100;
  }, [amount, durationMonths]);

  const handleSubmit = async () => {
    const amt = parseNumber(amount);
    const cashBankId = parseNumber(cashBankAccountId);

    if (!employeeId) {
      showToast("Please select employee", "error");
      return;
    }
    if (!amt) {
      showToast("Please enter valid amount", "error");
      return;
    }
    if (!durationMonths || durationMonths < 1) {
      showToast("Please enter valid duration", "error");
      return;
    }

    try {
      setSubmitting(true);
      await loanService.issueSalaryAdvance({
        employee_id: employeeId,
        amount: amt,
        duration_months: durationMonths,
        purpose: purpose.trim() || undefined,
        voucher_date: voucherDate,
        payment_method: paymentMethod,
        reference: reference.trim() || undefined,
        cash_bank_account_id: cashBankId,
      });
      showToast("Salary advance issued", "success");
      navigation.navigate("PayrollLoansHome");
    } catch (error: any) {
      showToast(error.message || "Failed to issue advance", "error");
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
        <Text style={styles.headerTitle}>Salary Advance</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate("PayrollLoansHome")}
            activeOpacity={0.85}>
            <Text style={styles.secondaryBtnIcon}>📋</Text>
            <Text style={styles.secondaryBtnText}>Loan History</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Advance Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Employee</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={employeeId}
                onValueChange={(value) => setEmployeeId(value)}>
                <Picker.Item label="Select employee" value={undefined} />
                {employees.map((emp) => (
                  <Picker.Item
                    key={emp.id}
                    label={getEmployeeName(emp)}
                    value={emp.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {selectedEmployee && (
            <View style={styles.employeePreview}>
              <Text style={styles.previewTitle}>
                {getEmployeeName(selectedEmployee)}
              </Text>
              <Text style={styles.previewText}>
                {selectedEmployee.employee_number || ""} •{" "}
                {selectedEmployee.department_name || "Department"}
              </Text>
              <Text style={styles.previewText}>
                Basic Salary:{" "}
                {formatAmount(Number(selectedEmployee.basic_salary || 0))}
              </Text>
            </View>
          )}

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="e.g., 50000"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Duration (months)</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={durationMonths}
                  onValueChange={(value) => setDurationMonths(value)}>
                  {DURATION_OPTIONS.map((value) => (
                    <Picker.Item
                      key={value}
                      label={`${value} months`}
                      value={value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.previewBox}>
            <Text style={styles.previewTitle}>Monthly Deduction</Text>
            <Text style={styles.previewValue}>
              {formatAmount(monthlyDeduction)}
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Purpose</Text>
            <TextInput
              style={styles.input}
              value={purpose}
              onChangeText={setPurpose}
              placeholder="Purpose / notes"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Voucher Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateButtonText}>{voucherDate}</Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Payment Method</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value)}>
                  <Picker.Item label="Bank" value="bank" />
                  <Picker.Item label="Cash" value="cash" />
                </Picker>
              </View>
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Reference</Text>
              <TextInput
                style={styles.input}
                value={reference}
                onChangeText={setReference}
                placeholder="TRX-8821"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Cash/Bank Account ID</Text>
            <TextInput
              style={styles.input}
              value={cashBankAccountId}
              onChangeText={setCashBankAccountId}
              placeholder="Optional ledger account id"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={submitting}>
            <Text style={styles.submitButtonText}>
              {submitting ? "Issuing..." : "Issue Salary Advance"}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={voucherDate ? new Date(voucherDate) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_event, selectedDate) => {
              setShowDatePicker(Platform.OS === "ios");
              if (selectedDate) {
                setVoucherDate(formatDate(selectedDate));
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
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  secondaryBtn: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  secondaryBtnIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
  pickerWrapper: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  employeePreview: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 14,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  previewText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  previewBox: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 14,
  },
  previewValue: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginTop: 4,
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
  submitButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
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
