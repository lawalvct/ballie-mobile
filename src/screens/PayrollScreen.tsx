import React from "react";
import ModuleScreenLayout from "../components/ModuleScreenLayout";
import PayrollOverview from "../components/payroll/PayrollOverview";
import EmployeeManagement from "../components/payroll/EmployeeManagement";
import PayrollOperations from "../components/payroll/PayrollOperations";
import PayrollHistory from "../components/payroll/PayrollHistory";
import PayrollReportsSection from "../components/payroll/PayrollReportsSection";

export default function PayrollScreen() {
  return (
    <ModuleScreenLayout>
      <PayrollOverview />
      <EmployeeManagement />
      <PayrollOperations />
      <PayrollHistory />
      <PayrollReportsSection />
    </ModuleScreenLayout>
  );
}
