import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { employeeService } from "../services/employeeService";
import type { PayrollEmployee } from "../types";
import { showConfirm, showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollEmployeeShow"
>;

export default function PayrollEmployeeShowScreen({
  navigation,
  route,
}: Props) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<PayrollEmployee | null>(null);

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const response = await employeeService.show(id);
      setEmployee(response);
    } catch (error: any) {
      showToast(error.message || "Failed to load employee", "error");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    showConfirm(
      "Delete Employee",
      "Are you sure you want to delete this employee?",
      async () => {
        try {
          await employeeService.delete(id);
          showToast("Employee deleted successfully", "success");
          navigation.goBack();
        } catch (error: any) {
          showToast(error.message || "Failed to delete employee", "error");
        }
      },
      { destructive: true, confirmText: "Delete" },
    );
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
          <Text style={styles.headerTitle}>Employee Details</Text>
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
        <Text style={styles.headerTitle}>Employee Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            {employee.full_name ||
              `${employee.first_name} ${employee.last_name}`}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {employee.employee_number
              ? `ID: ${employee.employee_number}`
              : employee.email || ""}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Department: {employee.department_name || "N/A"}
            </Text>
            <Text style={styles.metaText}>
              Position: {employee.position_name || employee.job_title || "N/A"}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Status: {employee.status || "N/A"}
            </Text>
            <Text style={styles.metaText}>
              Hire Date: {employee.hire_date || "N/A"}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Employment: {employee.employment_type || "N/A"}
            </Text>
            <Text style={styles.metaText}>
              Pay Frequency: {employee.pay_frequency || "N/A"}
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Salary</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Basic Salary: {employee.basic_salary || "N/A"}
            </Text>
            <Text style={styles.metaText}>
              Gross Salary: {employee.gross_salary || "N/A"}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Allowances: {employee.total_allowances || "N/A"}
            </Text>
            <Text style={styles.metaText}>
              Deductions: {employee.total_deductions || "N/A"}
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <Text style={styles.metaText}>Email: {employee.email || "N/A"}</Text>
          <Text style={styles.metaText}>Phone: {employee.phone || "N/A"}</Text>
          <Text style={styles.metaText}>
            Address: {employee.address || "N/A"}
          </Text>
          <Text style={styles.metaText}>
            City/State: {employee.city || ""} {employee.state || ""}
          </Text>
          <Text style={styles.metaText}>
            Country: {employee.country || "N/A"}
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Bank & Pension</Text>
          <Text style={styles.metaText}>
            Bank Name: {employee.bank_name || "N/A"}
          </Text>
          <Text style={styles.metaText}>
            Account Number: {employee.account_number || "N/A"}
          </Text>
          <Text style={styles.metaText}>
            Account Name: {employee.account_name || "N/A"}
          </Text>
          <Text style={styles.metaText}>
            PFA Provider: {employee.pfa_provider || "N/A"}
          </Text>
          <Text style={styles.metaText}>
            RSA PIN: {employee.rsa_pin || "N/A"}
          </Text>
          <Text style={styles.metaText}>
            Pension Exempt: {employee.pension_exempt ? "Yes" : "No"}
          </Text>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              navigation.navigate("PayrollEmployeeEdit", {
                id: employee.id,
                onUpdated: loadEmployee,
              })
            }
            activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>Edit Employee</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleDelete}
            activeOpacity={0.8}>
            <Text style={styles.secondaryBtnText}>Delete Employee</Text>
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
  sectionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 12,
  },
  metaRow: {
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
    color: "#4b5563",
    marginBottom: 4,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
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
    marginBottom: 10,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  secondaryBtn: {
    backgroundColor: "#fee2e2",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#991b1b",
  },
});
