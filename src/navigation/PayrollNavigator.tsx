import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { PayrollStackParamList } from "./types";
import PayrollScreen from "../screens/PayrollScreen";
import PayrollActionsScreen from "../screens/PayrollActionsScreen";
import PayrollEmployeeHomeScreen from "../features/payroll/employee/screens/PayrollEmployeeHomeScreen";
import PayrollEmployeeCreateScreen from "../features/payroll/employee/screens/PayrollEmployeeCreateScreen";
import PayrollEmployeeShowScreen from "../features/payroll/employee/screens/PayrollEmployeeShowScreen";
import PayrollEmployeeEditScreen from "../features/payroll/employee/screens/PayrollEmployeeEditScreen";
import PayrollAttendanceHomeScreen from "../features/payroll/attendance/screens/PayrollAttendanceHomeScreen";
import PayrollAttendanceClockInScreen from "../features/payroll/attendance/screens/PayrollAttendanceClockInScreen";
import PayrollAttendanceClockOutScreen from "../features/payroll/attendance/screens/PayrollAttendanceClockOutScreen";
import PayrollAttendanceMarkAbsentScreen from "../features/payroll/attendance/screens/PayrollAttendanceMarkAbsentScreen";
import PayrollAttendanceMarkLeaveScreen from "../features/payroll/attendance/screens/PayrollAttendanceMarkLeaveScreen";
import PayrollAttendanceManualEntryScreen from "../features/payroll/attendance/screens/PayrollAttendanceManualEntryScreen";
import PayrollAttendanceQrScreen from "../features/payroll/attendance/screens/PayrollAttendanceQrScreen";
import PayrollAttendanceMonthlyReportScreen from "../features/payroll/attendance/screens/PayrollAttendanceMonthlyReportScreen";
import PayrollAttendanceEmployeeScreen from "../features/payroll/attendance/screens/PayrollAttendanceEmployeeScreen";
import PayrollOvertimeHomeScreen from "../features/payroll/overtime/screens/PayrollOvertimeHomeScreen";
import PayrollOvertimeCreateScreen from "../features/payroll/overtime/screens/PayrollOvertimeCreateScreen";
import PayrollOvertimeShowScreen from "../features/payroll/overtime/screens/PayrollOvertimeShowScreen";
import PayrollOvertimeEditScreen from "../features/payroll/overtime/screens/PayrollOvertimeEditScreen";
import PayrollOvertimeMonthlyReportScreen from "../features/payroll/overtime/screens/PayrollOvertimeMonthlyReportScreen";
import PayrollSalaryAdvanceScreen from "../features/payroll/loans/screens/PayrollSalaryAdvanceScreen";
import PayrollLoansHomeScreen from "../features/payroll/loans/screens/PayrollLoansHomeScreen";
import PayrollLoanShowScreen from "../features/payroll/loans/screens/PayrollLoanShowScreen";
import PayrollAnnouncementsHomeScreen from "../features/payroll/announcements/screens/PayrollAnnouncementsHomeScreen";
import PayrollAnnouncementCreateScreen from "../features/payroll/announcements/screens/PayrollAnnouncementCreateScreen";
import PayrollAnnouncementShowScreen from "../features/payroll/announcements/screens/PayrollAnnouncementShowScreen";
import PayrollAnnouncementEditScreen from "../features/payroll/announcements/screens/PayrollAnnouncementEditScreen";
import PayrollSettingsScreen from "../features/payroll/settings/screens/PayrollSettingsScreen";
import PayrollProcessingHomeScreen from "../features/payroll/processing/screens/PayrollProcessingHomeScreen";
import PayrollProcessingCreateScreen from "../features/payroll/processing/screens/PayrollProcessingCreateScreen";
import PayrollProcessingShowScreen from "../features/payroll/processing/screens/PayrollProcessingShowScreen";
import PayrollShiftHomeScreen from "../features/payroll/shift/screens/PayrollShiftHomeScreen";
import PayrollShiftCreateScreen from "../features/payroll/shift/screens/PayrollShiftCreateScreen";
import PayrollShiftShowScreen from "../features/payroll/shift/screens/PayrollShiftShowScreen";
import PayrollShiftEditScreen from "../features/payroll/shift/screens/PayrollShiftEditScreen";
import PayrollShiftAssignmentsScreen from "../features/payroll/shift/screens/PayrollShiftAssignmentsScreen";
import PayrollShiftAssignScreen from "../features/payroll/shift/screens/PayrollShiftAssignScreen";
import PayrollDepartmentHomeScreen from "../features/payroll/department/screens/PayrollDepartmentHomeScreen";
import PayrollDepartmentCreateScreen from "../features/payroll/department/screens/PayrollDepartmentCreateScreen";
import PayrollDepartmentShowScreen from "../features/payroll/department/screens/PayrollDepartmentShowScreen";
import PayrollDepartmentEditScreen from "../features/payroll/department/screens/PayrollDepartmentEditScreen";
import PayrollSalaryComponentHomeScreen from "../features/payroll/salarycomponent/screens/PayrollSalaryComponentHomeScreen";
import PayrollSalaryComponentCreateScreen from "../features/payroll/salarycomponent/screens/PayrollSalaryComponentCreateScreen";
import PayrollSalaryComponentShowScreen from "../features/payroll/salarycomponent/screens/PayrollSalaryComponentShowScreen";
import PayrollSalaryComponentEditScreen from "../features/payroll/salarycomponent/screens/PayrollSalaryComponentEditScreen";
import PayrollPositionHomeScreen from "../features/payroll/position/screens/PayrollPositionHomeScreen";
import PayrollPositionCreateScreen from "../features/payroll/position/screens/PayrollPositionCreateScreen";
import PayrollPositionShowScreen from "../features/payroll/position/screens/PayrollPositionShowScreen";
import PayrollPositionEditScreen from "../features/payroll/position/screens/PayrollPositionEditScreen";

const Stack = createNativeStackNavigator<PayrollStackParamList>();

export default function PayrollNavigator() {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress" as any, () => {
      navigation.reset({
        index: 0,
        routes: [{ name: "PayrollHome" as any }],
      });
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#f5f5f5" },
        animation: "slide_from_right",
      }}>
      <Stack.Screen
        name="PayrollHome"
        component={PayrollScreen}
        options={{ title: "Payroll" }}
      />
      <Stack.Screen
        name="PayrollActions"
        component={PayrollActionsScreen}
        options={{ title: "All Payroll Actions" }}
      />
      <Stack.Screen
        name="PayrollEmployeeHome"
        component={PayrollEmployeeHomeScreen}
        options={{ title: "Employees" }}
      />
      <Stack.Screen
        name="PayrollEmployeeCreate"
        component={PayrollEmployeeCreateScreen}
        options={{ title: "Create Employee" }}
      />
      <Stack.Screen
        name="PayrollEmployeeShow"
        component={PayrollEmployeeShowScreen}
        options={{ title: "Employee Details" }}
      />
      <Stack.Screen
        name="PayrollEmployeeEdit"
        component={PayrollEmployeeEditScreen}
        options={{ title: "Edit Employee" }}
      />
      <Stack.Screen
        name="PayrollAttendanceHome"
        component={PayrollAttendanceHomeScreen}
        options={{ title: "Attendance" }}
      />
      <Stack.Screen
        name="PayrollAttendanceClockIn"
        component={PayrollAttendanceClockInScreen}
        options={{ title: "Clock In" }}
      />
      <Stack.Screen
        name="PayrollAttendanceClockOut"
        component={PayrollAttendanceClockOutScreen}
        options={{ title: "Clock Out" }}
      />
      <Stack.Screen
        name="PayrollAttendanceMarkAbsent"
        component={PayrollAttendanceMarkAbsentScreen}
        options={{ title: "Mark Absent" }}
      />
      <Stack.Screen
        name="PayrollAttendanceMarkLeave"
        component={PayrollAttendanceMarkLeaveScreen}
        options={{ title: "Mark Leave" }}
      />
      <Stack.Screen
        name="PayrollAttendanceManualEntry"
        component={PayrollAttendanceManualEntryScreen}
        options={{ title: "Manual Attendance" }}
      />
      <Stack.Screen
        name="PayrollAttendanceQr"
        component={PayrollAttendanceQrScreen}
        options={{ title: "Attendance QR" }}
      />
      <Stack.Screen
        name="PayrollAttendanceMonthlyReport"
        component={PayrollAttendanceMonthlyReportScreen}
        options={{ title: "Monthly Report" }}
      />
      <Stack.Screen
        name="PayrollAttendanceEmployee"
        component={PayrollAttendanceEmployeeScreen}
        options={{ title: "Employee Attendance" }}
      />
      <Stack.Screen
        name="PayrollOvertimeHome"
        component={PayrollOvertimeHomeScreen}
        options={{ title: "Overtime" }}
      />
      <Stack.Screen
        name="PayrollOvertimeCreate"
        component={PayrollOvertimeCreateScreen}
        options={{ title: "Create Overtime" }}
      />
      <Stack.Screen
        name="PayrollOvertimeShow"
        component={PayrollOvertimeShowScreen}
        options={{ title: "Overtime Details" }}
      />
      <Stack.Screen
        name="PayrollOvertimeEdit"
        component={PayrollOvertimeEditScreen}
        options={{ title: "Edit Overtime" }}
      />
      <Stack.Screen
        name="PayrollOvertimeMonthlyReport"
        component={PayrollOvertimeMonthlyReportScreen}
        options={{ title: "Overtime Report" }}
      />
      <Stack.Screen
        name="PayrollSalaryAdvance"
        component={PayrollSalaryAdvanceScreen}
        options={{ title: "Salary Advance" }}
      />
      <Stack.Screen
        name="PayrollLoansHome"
        component={PayrollLoansHomeScreen}
        options={{ title: "Loan History" }}
      />
      <Stack.Screen
        name="PayrollLoanShow"
        component={PayrollLoanShowScreen}
        options={{ title: "Loan Details" }}
      />
      <Stack.Screen
        name="PayrollAnnouncementsHome"
        component={PayrollAnnouncementsHomeScreen}
        options={{ title: "Announcements" }}
      />
      <Stack.Screen
        name="PayrollAnnouncementCreate"
        component={PayrollAnnouncementCreateScreen}
        options={{ title: "Create Announcement" }}
      />
      <Stack.Screen
        name="PayrollAnnouncementShow"
        component={PayrollAnnouncementShowScreen}
        options={{ title: "Announcement Details" }}
      />
      <Stack.Screen
        name="PayrollAnnouncementEdit"
        component={PayrollAnnouncementEditScreen}
        options={{ title: "Edit Announcement" }}
      />
      <Stack.Screen
        name="PayrollSettings"
        component={PayrollSettingsScreen}
        options={{ title: "Payroll Settings" }}
      />
      <Stack.Screen
        name="PayrollProcessingHome"
        component={PayrollProcessingHomeScreen}
        options={{ title: "Payroll Processing" }}
      />
      <Stack.Screen
        name="PayrollProcessingCreate"
        component={PayrollProcessingCreateScreen}
        options={{ title: "Create Payroll Period" }}
      />
      <Stack.Screen
        name="PayrollProcessingShow"
        component={PayrollProcessingShowScreen}
        options={{ title: "Payroll Details" }}
      />
      <Stack.Screen
        name="PayrollShiftHome"
        component={PayrollShiftHomeScreen}
        options={{ title: "Shifts" }}
      />
      <Stack.Screen
        name="PayrollShiftCreate"
        component={PayrollShiftCreateScreen}
        options={{ title: "Create Shift" }}
      />
      <Stack.Screen
        name="PayrollShiftShow"
        component={PayrollShiftShowScreen}
        options={{ title: "Shift Details" }}
      />
      <Stack.Screen
        name="PayrollShiftEdit"
        component={PayrollShiftEditScreen}
        options={{ title: "Edit Shift" }}
      />
      <Stack.Screen
        name="PayrollShiftAssignments"
        component={PayrollShiftAssignmentsScreen}
        options={{ title: "Shift Assignments" }}
      />
      <Stack.Screen
        name="PayrollShiftAssign"
        component={PayrollShiftAssignScreen}
        options={{ title: "Assign Shift" }}
      />
      <Stack.Screen
        name="PayrollDepartmentHome"
        component={PayrollDepartmentHomeScreen}
        options={{ title: "Departments" }}
      />
      <Stack.Screen
        name="PayrollDepartmentCreate"
        component={PayrollDepartmentCreateScreen}
        options={{ title: "Create Department" }}
      />
      <Stack.Screen
        name="PayrollDepartmentShow"
        component={PayrollDepartmentShowScreen}
        options={{ title: "Department Details" }}
      />
      <Stack.Screen
        name="PayrollDepartmentEdit"
        component={PayrollDepartmentEditScreen}
        options={{ title: "Edit Department" }}
      />
      <Stack.Screen
        name="PayrollSalaryComponentHome"
        component={PayrollSalaryComponentHomeScreen}
        options={{ title: "Salary Components" }}
      />
      <Stack.Screen
        name="PayrollSalaryComponentCreate"
        component={PayrollSalaryComponentCreateScreen}
        options={{ title: "Create Component" }}
      />
      <Stack.Screen
        name="PayrollSalaryComponentShow"
        component={PayrollSalaryComponentShowScreen}
        options={{ title: "Component Details" }}
      />
      <Stack.Screen
        name="PayrollSalaryComponentEdit"
        component={PayrollSalaryComponentEditScreen}
        options={{ title: "Edit Component" }}
      />
      <Stack.Screen
        name="PayrollPositionHome"
        component={PayrollPositionHomeScreen}
        options={{ title: "Positions" }}
      />
      <Stack.Screen
        name="PayrollPositionCreate"
        component={PayrollPositionCreateScreen}
        options={{ title: "Create Position" }}
      />
      <Stack.Screen
        name="PayrollPositionShow"
        component={PayrollPositionShowScreen}
        options={{ title: "Position Details" }}
      />
      <Stack.Screen
        name="PayrollPositionEdit"
        component={PayrollPositionEditScreen}
        options={{ title: "Edit Position" }}
      />
    </Stack.Navigator>
  );
}
