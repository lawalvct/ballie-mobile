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
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { employeeService } from "../services/employeeService";
import { departmentService } from "../../department/services/departmentService";
import { positionService } from "../../position/services/positionService";
import type { PayrollDepartment } from "../../department/types";
import type { PayrollPosition } from "../../position/types";
import type { PayrollEmployeeStatus } from "../types";
import { showToast } from "../../../../utils/toast";

const EMPLOYMENT_TYPES = [
  { label: "Select employment type", value: "" },
  { label: "Full Time", value: "full_time" },
  { label: "Part Time", value: "part_time" },
  { label: "Contract", value: "contract" },
  { label: "Temporary", value: "temporary" },
  { label: "Intern", value: "intern" },
];

const PAY_FREQUENCY = [
  { label: "Select pay frequency", value: "" },
  { label: "Monthly", value: "monthly" },
  { label: "Weekly", value: "weekly" },
  { label: "Bi-Weekly", value: "biweekly" },
  { label: "Daily", value: "daily" },
];

const STATUS_OPTIONS = [
  { label: "Select status", value: "" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Terminated", value: "terminated" },
];

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollEmployeeCreate"
>;

export default function PayrollEmployeeCreateScreen({
  navigation,
  route,
}: Props) {
  const { onCreated } = route.params || {};
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState<PayrollDepartment[]>([]);
  const [positions, setPositions] = useState<PayrollPosition[]>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");

  const [departmentId, setDepartmentId] = useState<number | undefined>();
  const [positionId, setPositionId] = useState<number | undefined>();
  const [jobTitle, setJobTitle] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [payFrequency, setPayFrequency] = useState("");
  const [status, setStatus] = useState<PayrollEmployeeStatus | "">("active");
  const [hireDate, setHireDate] = useState("");
  const [attendanceDeductionExempt, setAttendanceDeductionExempt] =
    useState(false);
  const [attendanceExemptionReason, setAttendanceExemptionReason] =
    useState("");

  const [basicSalary, setBasicSalary] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [pfaProvider, setPfaProvider] = useState("");
  const [rsaPin, setRsaPin] = useState("");
  const [pensionExempt, setPensionExempt] = useState(false);
  const [showHirePicker, setShowHirePicker] = useState(false);
  const [showEffectivePicker, setShowEffectivePicker] = useState(false);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const [deptRes, posRes] = await Promise.all([
        departmentService.list({ per_page: 1000 }),
        positionService.list({ per_page: 1000 }),
      ]);
      setDepartments(deptRes.departments || []);
      setPositions(posRes.positions || []);
    } catch (_error) {
      // ignore form data load errors
    }
  };

  const parseNumber = (value: string) => {
    if (!value.trim()) return undefined;
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isNaN(parsed)) return undefined;
    return parsed;
  };

  const handleSubmit = async () => {
    if (!firstName.trim()) {
      showToast("Please enter first name", "error");
      return;
    }
    if (!lastName.trim()) {
      showToast("Please enter last name", "error");
      return;
    }
    if (!departmentId) {
      showToast("Please select a department", "error");
      return;
    }

    const basicSalaryValue = parseNumber(basicSalary);
    if (basicSalaryValue === undefined) {
      showToast("Please enter a valid basic salary", "error");
      return;
    }

    const normalizedStatus = status === "" ? undefined : status;

    try {
      setSubmitting(true);
      await employeeService.create({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        employee_number: employeeNumber.trim() || undefined,
        department_id: departmentId,
        position_id: positionId,
        job_title: jobTitle.trim() || undefined,
        employment_type: employmentType || undefined,
        pay_frequency: payFrequency || undefined,
        status: normalizedStatus,
        hire_date: hireDate.trim() || undefined,
        attendance_deduction_exempt: attendanceDeductionExempt,
        attendance_exemption_reason: attendanceDeductionExempt
          ? attendanceExemptionReason.trim() || undefined
          : undefined,
        basic_salary: basicSalaryValue,
        effective_date: effectiveDate.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: stateName.trim() || undefined,
        postal_code: postalCode.trim() || undefined,
        country: country.trim() || undefined,
        bank_name: bankName.trim() || undefined,
        account_number: accountNumber.trim() || undefined,
        account_name: accountName.trim() || undefined,
        pfa_provider: pfaProvider.trim() || undefined,
        rsa_pin: rsaPin.trim() || undefined,
        pension_exempt: pensionExempt,
      });
      showToast("Employee created successfully", "success");
      onCreated?.();
      navigation.goBack();
    } catch (error: any) {
      showToast(error.message || "Failed to create employee", "error");
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
        <Text style={styles.headerTitle}>Create Employee</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              First Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="e.g., John"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Last Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="e.g., Lawal"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="e.g., john@company.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g., +2348012345678"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Employee Number</Text>
            <TextInput
              style={styles.input}
              value={employeeNumber}
              onChangeText={setEmployeeNumber}
              placeholder="e.g., EMP-2026-0001"
              placeholderTextColor="#9ca3af"
              autoCapitalize="characters"
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Employment Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Department <Text style={styles.required}>*</Text>
            </Text>
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
            <Text style={styles.label}>Position</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={positionId}
                onValueChange={(value) =>
                  setPositionId(typeof value === "number" ? value : undefined)
                }>
                <Picker.Item label="Select position" value={undefined} />
                {positions.map((position) => (
                  <Picker.Item
                    key={position.id}
                    label={position.name}
                    value={position.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Job Title</Text>
            <TextInput
              style={styles.input}
              value={jobTitle}
              onChangeText={setJobTitle}
              placeholder="e.g., Accountant"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Employment Type</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={employmentType}
                onValueChange={(value) =>
                  setEmploymentType(typeof value === "string" ? value : "")
                }>
                {EMPLOYMENT_TYPES.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Pay Frequency</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={payFrequency}
                onValueChange={(value) =>
                  setPayFrequency(typeof value === "string" ? value : "")
                }>
                {PAY_FREQUENCY.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={status}
                onValueChange={(value) =>
                  setStatus(typeof value === "string" ? value : "active")
                }>
                {STATUS_OPTIONS.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Hire Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowHirePicker(true)}>
              <Text
                style={[
                  styles.dateButtonText,
                  !hireDate && styles.datePlaceholder,
                ]}>
                {hireDate || "YYYY-MM-DD"}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.label}>Attendance Deduction Exempt</Text>
                <Text style={styles.helperText}>
                  {attendanceDeductionExempt
                    ? "Employee is exempt"
                    : "Attendance deductions apply"}
                </Text>
              </View>
              <Switch
                value={attendanceDeductionExempt}
                onValueChange={setAttendanceDeductionExempt}
                trackColor={{ false: "#d1d5db", true: BRAND_COLORS.gold }}
                thumbColor={
                  attendanceDeductionExempt
                    ? BRAND_COLORS.darkPurple
                    : "#f3f4f6"
                }
              />
            </View>
          </View>

          {attendanceDeductionExempt && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Exemption Reason</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={attendanceExemptionReason}
                onChangeText={setAttendanceExemptionReason}
                placeholder="Optional reason"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Salary Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Basic Salary <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={basicSalary}
              onChangeText={setBasicSalary}
              placeholder="e.g., 250000"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Effective Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEffectivePicker(true)}>
              <Text
                style={[
                  styles.dateButtonText,
                  !effectiveDate && styles.datePlaceholder,
                ]}>
                {effectiveDate || "YYYY-MM-DD"}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          {showHirePicker && (
            <DateTimePicker
              value={hireDate ? new Date(hireDate) : new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_event, selectedDate) => {
                setShowHirePicker(Platform.OS === "ios");
                if (selectedDate) {
                  setHireDate(formatDate(selectedDate));
                }
              }}
            />
          )}

          {showEffectivePicker && (
            <DateTimePicker
              value={effectiveDate ? new Date(effectiveDate) : new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_event, selectedDate) => {
                setShowEffectivePicker(Platform.OS === "ios");
                if (selectedDate) {
                  setEffectiveDate(formatDate(selectedDate));
                }
              }}
            />
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Address</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Street address"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="City"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              value={stateName}
              onChangeText={setStateName}
              placeholder="State"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Postal Code</Text>
            <TextInput
              style={styles.input}
              value={postalCode}
              onChangeText={setPostalCode}
              placeholder="Postal code"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              value={country}
              onChangeText={setCountry}
              placeholder="Country"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Bank & Pension</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Bank Name</Text>
            <TextInput
              style={styles.input}
              value={bankName}
              onChangeText={setBankName}
              placeholder="Bank name"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Account Number</Text>
            <TextInput
              style={styles.input}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="Account number"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Account Name</Text>
            <TextInput
              style={styles.input}
              value={accountName}
              onChangeText={setAccountName}
              placeholder="Account name"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>PFA Provider</Text>
            <TextInput
              style={styles.input}
              value={pfaProvider}
              onChangeText={setPfaProvider}
              placeholder="Pension provider"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>RSA Pin</Text>
            <TextInput
              style={styles.input}
              value={rsaPin}
              onChangeText={setRsaPin}
              placeholder="RSA PIN"
              placeholderTextColor="#9ca3af"
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.label}>Pension Exempt</Text>
                <Text style={styles.helperText}>
                  {pensionExempt
                    ? "Pension deductions are disabled"
                    : "Pension deductions apply"}
                </Text>
              </View>
              <Switch
                value={pensionExempt}
                onValueChange={setPensionExempt}
                trackColor={{ false: "#d1d5db", true: BRAND_COLORS.gold }}
                thumbColor={pensionExempt ? BRAND_COLORS.darkPurple : "#f3f4f6"}
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
              {submitting ? "Saving..." : "Create Employee"}
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
