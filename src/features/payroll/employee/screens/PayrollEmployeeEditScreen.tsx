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
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { employeeService } from "../services/employeeService";
import { departmentService } from "../../department/services/departmentService";
import { positionService } from "../../position/services/positionService";
import { salaryComponentService } from "../../salarycomponent/services/salaryComponentService";
import type { PayrollDepartment } from "../../department/types";
import type { PayrollPosition } from "../../position/types";
import type { PayrollEmployee, PayrollEmployeeStatus } from "../types";
import type {
  PayrollSalaryComponent,
  SalaryComponentCalculationType,
} from "../../salarycomponent/types";
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

const GENDER_OPTIONS = [
  { label: "Select gender", value: "" },
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

type ComponentInput = {
  id: number;
  name: string;
  code: string;
  calculation_type: SalaryComponentCalculationType;
  type: string;
  amount: string;
  percentage: string;
  is_active: boolean;
  hasExistingAssignment: boolean;
};

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollEmployeeEdit"
>;

export default function PayrollEmployeeEditScreen({
  navigation,
  route,
}: Props) {
  const { id, onUpdated } = route.params;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState<PayrollDepartment[]>([]);
  const [positions, setPositions] = useState<PayrollPosition[]>([]);
  const [salaryComponents, setSalaryComponents] = useState<
    PayrollSalaryComponent[]
  >([]);
  const [employee, setEmployee] = useState<PayrollEmployee | null>(null);

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
  const [status, setStatus] = useState<PayrollEmployeeStatus | "">("");
  const [hireDate, setHireDate] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [attendanceDeductionExempt, setAttendanceDeductionExempt] =
    useState(false);
  const [attendanceExemptionReason, setAttendanceExemptionReason] =
    useState("");

  const [basicSalary, setBasicSalary] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [salaryComponentInputs, setSalaryComponentInputs] = useState<
    ComponentInput[]
  >([]);
  const [componentsInitialized, setComponentsInitialized] = useState(false);

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [pfaProvider, setPfaProvider] = useState("");
  const [tin, setTin] = useState("");
  const [pensionPin, setPensionPin] = useState("");
  const [rsaPin, setRsaPin] = useState("");
  const [pensionExempt, setPensionExempt] = useState(false);
  const [showHirePicker, setShowHirePicker] = useState(false);
  const [showEffectivePicker, setShowEffectivePicker] = useState(false);
  const [dobYear, setDobYear] = useState<number | undefined>();
  const [dobMonth, setDobMonth] = useState<number | undefined>();
  const [dobDay, setDobDay] = useState<number | undefined>();

  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  const padDatePart = (value: number) => String(value).padStart(2, "0");
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - 1900 + 1 },
    (_, idx) => currentYear - idx,
  );
  const monthOptions = [
    { label: "Jan", value: 1 },
    { label: "Feb", value: 2 },
    { label: "Mar", value: 3 },
    { label: "Apr", value: 4 },
    { label: "May", value: 5 },
    { label: "Jun", value: 6 },
    { label: "Jul", value: 7 },
    { label: "Aug", value: 8 },
    { label: "Sep", value: 9 },
    { label: "Oct", value: 10 },
    { label: "Nov", value: 11 },
    { label: "Dec", value: 12 },
  ];
  const daysInMonth = (year?: number, month?: number) => {
    if (!year || !month) return 31;
    return new Date(year, month, 0).getDate();
  };
  const dayOptions = Array.from(
    { length: daysInMonth(dobYear, dobMonth) },
    (_, idx) => idx + 1,
  );

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    loadEmployee();
  }, [id]);

  useEffect(() => {
    if (!employee || componentsInitialized || salaryComponents.length === 0) {
      return;
    }

    const existingComponents = employee.current_salary?.components || [];
    const inputs = salaryComponents.map((component) => {
      const existing = existingComponents.find(
        (item) =>
          item.salary_component_id === component.id || item.id === component.id,
      );

      const amountValue =
        existing?.amount !== undefined && existing?.amount !== null
          ? String(existing.amount)
          : "";
      const percentageValue =
        existing?.percentage !== undefined && existing?.percentage !== null
          ? String(existing.percentage)
          : "";

      return {
        id: component.id,
        name: component.name,
        code: component.code,
        calculation_type: component.calculation_type,
        type: component.type,
        amount: amountValue,
        percentage: percentageValue,
        is_active:
          existing?.is_active ?? Boolean(amountValue || percentageValue),
        hasExistingAssignment: Boolean(existing),
      };
    });

    setSalaryComponentInputs(inputs);
    setComponentsInitialized(true);
  }, [employee, salaryComponents, componentsInitialized]);

  useEffect(() => {
    setComponentsInitialized(false);
    setSalaryComponentInputs([]);
  }, [id]);

  const loadFormData = async () => {
    try {
      const [deptRes, posRes, compRes] = await Promise.all([
        departmentService.list({ per_page: 1000 }),
        positionService.list({ per_page: 1000 }),
        salaryComponentService.list({ per_page: 1000 }),
      ]);
      setDepartments(deptRes.departments || []);
      setPositions(posRes.positions || []);
      setSalaryComponents(compRes.components || []);
    } catch (_error) {
      // ignore
    }
  };

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const response = await employeeService.show(id);
      setEmployee(response);

      setFirstName(response.first_name || "");
      setLastName(response.last_name || "");
      setEmail(response.email || "");
      setPhone(response.phone || "");
      setEmployeeNumber(response.employee_number || "");
      setDepartmentId(response.department_id || undefined);
      setPositionId(response.position_id || undefined);
      setJobTitle(response.job_title || "");
      setEmploymentType(response.employment_type || "");
      setPayFrequency(response.pay_frequency || "");
      setStatus(response.status || "");
      setHireDate(response.hire_date || "");
      setDateOfBirth(response.date_of_birth || "");
      setGender(response.gender || "");
      setAttendanceDeductionExempt(!!response.attendance_deduction_exempt);
      setAttendanceExemptionReason(response.attendance_exemption_reason || "");
      setBasicSalary(
        response.basic_salary !== undefined && response.basic_salary !== null
          ? String(response.basic_salary)
          : "",
      );
      setEffectiveDate(response.effective_date || "");
      setAddress(response.address || "");
      setCity(response.city || "");
      setStateName(response.state || "");
      setPostalCode(response.postal_code || "");
      setCountry(response.country || "");
      setBankName(response.bank_name || "");
      setAccountNumber(response.account_number || "");
      setAccountName(response.account_name || "");
      setPfaProvider(response.pfa_provider || "");
      setTin(response.tin || "");
      setPensionPin(response.pension_pin || "");
      setRsaPin(response.rsa_pin || "");
      setPensionExempt(!!response.pension_exempt);

      if (response.date_of_birth) {
        const [yearPart, monthPart, dayPart] = response.date_of_birth
          .split("-")
          .map((value) => Number(value));
        setDobYear(!Number.isNaN(yearPart) ? yearPart : undefined);
        setDobMonth(!Number.isNaN(monthPart) ? monthPart : undefined);
        setDobDay(!Number.isNaN(dayPart) ? dayPart : undefined);
      } else {
        setDobYear(undefined);
        setDobMonth(undefined);
        setDobDay(undefined);
      }
    } catch (error: any) {
      showToast(error.message || "Failed to load employee", "error");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const parseNumber = (value: string) => {
    if (!value.trim()) return undefined;
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isNaN(parsed)) return undefined;
    return parsed;
  };

  const updateComponent = (
    id: number,
    updates: Partial<Omit<ComponentInput, "id">>,
  ) => {
    setSalaryComponentInputs((prev) =>
      prev.map((component) =>
        component.id === id ? { ...component, ...updates } : component,
      ),
    );
  };

  useEffect(() => {
    if (!dobYear || !dobMonth || !dobDay) {
      setDateOfBirth("");
      return;
    }

    const maxDay = daysInMonth(dobYear, dobMonth);
    if (dobDay > maxDay) {
      setDobDay(maxDay);
      return;
    }

    setDateOfBirth(
      `${dobYear}-${padDatePart(dobMonth)}-${padDatePart(dobDay)}`,
    );
  }, [dobYear, dobMonth, dobDay]);

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

    const invalidComponent = salaryComponentInputs.find((component) => {
      if (
        component.amount.trim() &&
        parseNumber(component.amount) === undefined
      ) {
        return true;
      }
      if (
        component.percentage.trim() &&
        parseNumber(component.percentage) === undefined
      ) {
        return true;
      }
      return false;
    });

    if (invalidComponent) {
      showToast(
        `Please enter valid values for ${invalidComponent.name}`,
        "error",
      );
      return;
    }

    const normalizedStatus = status === "" ? undefined : status;

    try {
      setSubmitting(true);
      const componentsPayload = salaryComponentInputs
        .filter((component) => {
          const hasValue =
            component.amount.trim() !== "" ||
            component.percentage.trim() !== "";
          if (hasValue) return true;
          if (component.hasExistingAssignment) return true;
          return component.is_active;
        })
        .map((component) => ({
          id: component.id,
          amount: component.amount.trim()
            ? parseNumber(component.amount)
            : undefined,
          percentage: component.percentage.trim()
            ? parseNumber(component.percentage)
            : undefined,
          is_active: component.is_active,
        }));

      await employeeService.update(id, {
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
        date_of_birth: dateOfBirth.trim() || undefined,
        gender: gender || undefined,
        attendance_deduction_exempt: attendanceDeductionExempt,
        attendance_exemption_reason: attendanceDeductionExempt
          ? attendanceExemptionReason.trim() || undefined
          : undefined,
        basic_salary: basicSalaryValue,
        effective_date: effectiveDate.trim() || undefined,
        tin: tin.trim() || undefined,
        pension_pin: pensionPin.trim() || undefined,
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
        components: componentsPayload.length ? componentsPayload : undefined,
      });
      showToast("Employee updated successfully", "success");
      onUpdated?.(id);
      navigation.goBack();
    } catch (error: any) {
      showToast(error.message || "Failed to update employee", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !employee) {
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
          <Text style={styles.headerTitle}>Edit Employee</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading employee...</Text>
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
        <Text style={styles.headerTitle}>Edit Employee</Text>
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
            <Text style={styles.label}>Date of Birth</Text>
            <View style={styles.dobRow}>
              <View style={[styles.dobPickerWrapper, styles.dobPickerYear]}>
                <Picker
                  selectedValue={dobYear}
                  onValueChange={(value) =>
                    setDobYear(typeof value === "number" ? value : undefined)
                  }>
                  <Picker.Item label="Year" value={undefined} />
                  {yearOptions.map((year) => (
                    <Picker.Item key={year} label={`${year}`} value={year} />
                  ))}
                </Picker>
              </View>
              <View style={[styles.dobPickerWrapper, styles.dobPickerMonth]}>
                <Picker
                  selectedValue={dobMonth}
                  onValueChange={(value) =>
                    setDobMonth(typeof value === "number" ? value : undefined)
                  }>
                  <Picker.Item label="Month" value={undefined} />
                  {monthOptions.map((month) => (
                    <Picker.Item
                      key={month.value}
                      label={month.label}
                      value={month.value}
                    />
                  ))}
                </Picker>
              </View>
              <View style={[styles.dobPickerWrapper, styles.dobPickerDay]}>
                <Picker
                  selectedValue={dobDay}
                  onValueChange={(value) =>
                    setDobDay(typeof value === "number" ? value : undefined)
                  }>
                  <Picker.Item label="Day" value={undefined} />
                  {dayOptions.map((day) => (
                    <Picker.Item key={day} label={`${day}`} value={day} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={gender}
                onValueChange={(value) =>
                  setGender(typeof value === "string" ? value : "")
                }>
                {GENDER_OPTIONS.map((option) => (
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
          <Text style={styles.sectionTitle}>Payroll & Tax</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>TIN</Text>
            <TextInput
              style={styles.input}
              value={tin}
              onChangeText={setTin}
              placeholder="Tax Identification Number"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Pension PIN</Text>
            <TextInput
              style={styles.input}
              value={pensionPin}
              onChangeText={setPensionPin}
              placeholder="Pension PIN"
              placeholderTextColor="#9ca3af"
              autoCapitalize="characters"
            />
          </View>
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
          <Text style={styles.sectionTitle}>Salary Components</Text>
          {salaryComponentInputs.length === 0 ? (
            <View style={styles.emptyInline}>
              <Text style={styles.emptyInlineText}>
                No salary components configured yet.
              </Text>
            </View>
          ) : (
            salaryComponentInputs.map((component) => {
              const isPercentage = component.calculation_type === "percentage";
              const isComputed = component.calculation_type === "computed";
              const allowAmount =
                component.calculation_type === "fixed" ||
                component.calculation_type === "variable";

              return (
                <View key={component.id} style={styles.componentCard}>
                  <View style={styles.componentHeader}>
                    <View style={styles.componentTitleBlock}>
                      <Text style={styles.componentTitle}>
                        {component.name}
                      </Text>
                      <Text style={styles.componentSubtitle}>
                        {component.code} • {component.calculation_type}
                      </Text>
                    </View>
                    <Switch
                      value={component.is_active}
                      onValueChange={(value) =>
                        updateComponent(component.id, { is_active: value })
                      }
                      trackColor={{ false: "#d1d5db", true: BRAND_COLORS.gold }}
                      thumbColor={
                        component.is_active
                          ? BRAND_COLORS.darkPurple
                          : "#f3f4f6"
                      }
                    />
                  </View>

                  {isComputed ? (
                    <Text style={styles.componentHint}>
                      This component is computed automatically.
                    </Text>
                  ) : (
                    <View style={styles.componentInputsRow}>
                      <View style={styles.componentInputBlock}>
                        <Text style={styles.label}>Amount</Text>
                        <TextInput
                          style={[
                            styles.input,
                            (!allowAmount || isPercentage) &&
                              styles.inputDisabled,
                          ]}
                          value={component.amount}
                          onChangeText={(value) =>
                            updateComponent(component.id, { amount: value })
                          }
                          placeholder="0"
                          placeholderTextColor="#9ca3af"
                          keyboardType="numeric"
                          editable={allowAmount && !isPercentage}
                        />
                      </View>
                      <View style={styles.componentInputBlock}>
                        <Text style={styles.label}>Percentage</Text>
                        <TextInput
                          style={[
                            styles.input,
                            !isPercentage && styles.inputDisabled,
                          ]}
                          value={component.percentage}
                          onChangeText={(value) =>
                            updateComponent(component.id, { percentage: value })
                          }
                          placeholder="0"
                          placeholderTextColor="#9ca3af"
                          keyboardType="numeric"
                          editable={isPercentage}
                        />
                      </View>
                    </View>
                  )}
                </View>
              );
            })
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
  dobRow: {
    flexDirection: "row",
    gap: 8,
  },
  dobPickerWrapper: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  dobPickerYear: {
    flex: 1,
  },
  dobPickerMonth: {
    flex: 1,
  },
  dobPickerDay: {
    flex: 0.9,
    minWidth: 80,
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
  inputDisabled: {
    backgroundColor: "#f3f4f6",
    color: "#9ca3af",
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  emptyInline: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyInlineText: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
  },
  componentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  componentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  componentTitleBlock: {
    flex: 1,
    marginRight: 12,
  },
  componentTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  componentSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#6b7280",
  },
  componentHint: {
    marginTop: 10,
    fontSize: 12,
    color: "#6b7280",
  },
  componentInputsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  componentInputBlock: {
    flex: 1,
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
