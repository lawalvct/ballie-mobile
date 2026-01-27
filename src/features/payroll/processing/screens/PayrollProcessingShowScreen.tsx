import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { payrollProcessingService } from "../services/processingService";
import type { PayrollProcessingPeriod, PayrollProcessingRun } from "../types";
import { showConfirm, showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollProcessingShow"
>;

export default function PayrollProcessingShowScreen({
  navigation,
  route,
}: Props) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PayrollProcessingPeriod | null>(null);
  const [runs, setRuns] = useState<PayrollProcessingRun[]>([]);
  const [applyPayeTax, setApplyPayeTax] = useState(true);
  const [applyNsitf, setApplyNsitf] = useState(true);
  const [payeTaxRate, setPayeTaxRate] = useState("");
  const [nsitfRate, setNsitfRate] = useState("");
  const [taxExemptionReason, setTaxExemptionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPeriod();
  }, [id]);

  const loadPeriod = async () => {
    try {
      setLoading(true);
      const response = await payrollProcessingService.show(id, {
        per_page: 50,
      });
      setPeriod(response.period);
      setRuns(response.runs || []);
      setApplyPayeTax(Boolean(response.period?.apply_paye_tax ?? true));
      setApplyNsitf(Boolean(response.period?.apply_nsitf ?? true));
      setTaxExemptionReason(response.period?.tax_exemption_reason || "");
    } catch (error: any) {
      showToast(error.message || "Failed to load payroll period", "error");
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

  const formatAmount = (value?: string | number | null) => {
    if (value === null || value === undefined || value === "") return "0.00";
    const numeric = Number(String(value).replace(/,/g, ""));
    if (Number.isNaN(numeric)) return String(value);
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  };

  const handleGenerate = async () => {
    if (!period) return;

    try {
      setSubmitting(true);
      await payrollProcessingService.generate(period.id, {
        apply_paye_tax: applyPayeTax,
        apply_nsitf: applyNsitf,
        paye_tax_rate: payeTaxRate.trim()
          ? (parseNumber(payeTaxRate) ?? null)
          : null,
        nsitf_rate: nsitfRate.trim() ? (parseNumber(nsitfRate) ?? null) : null,
        tax_exemption_reason: taxExemptionReason.trim() || null,
      });
      showToast("Payroll generated successfully", "success");
      loadPeriod();
    } catch (error: any) {
      showToast(error.message || "Failed to generate payroll", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!period) return;
    try {
      setSubmitting(true);
      await payrollProcessingService.approve(period.id);
      showToast("Payroll approved successfully", "success");
      loadPeriod();
    } catch (error: any) {
      showToast(error.message || "Failed to approve payroll", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (!period) return;
    showConfirm(
      "Reset Payroll",
      "This will reset generated payroll runs. Continue?",
      async () => {
        try {
          setSubmitting(true);
          await payrollProcessingService.reset(period.id);
          showToast("Payroll reset successfully", "success");
          loadPeriod();
        } catch (error: any) {
          showToast(error.message || "Failed to reset payroll", "error");
        } finally {
          setSubmitting(false);
        }
      },
      { destructive: true, confirmText: "Reset" },
    );
  };

  const handleExport = async () => {
    if (!period) return;
    try {
      setSubmitting(true);
      await payrollProcessingService.exportBankFile(period.id);
      showToast("Bank file export requested", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to export bank file", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!period) return;
    showConfirm(
      "Delete Payroll Period",
      "Are you sure you want to delete this payroll period?",
      async () => {
        try {
          setSubmitting(true);
          await payrollProcessingService.delete(period.id);
          showToast("Payroll period deleted successfully", "success");
          navigation.goBack();
        } catch (error: any) {
          showToast(
            error.message || "Failed to delete payroll period",
            "error",
          );
        } finally {
          setSubmitting(false);
        }
      },
      { destructive: true, confirmText: "Delete" },
    );
  };

  const canGenerate = period?.status === "draft";
  const canReset = period?.status === "processing";
  const canApprove = period?.status === "processing";
  const canExport = period?.status === "approved";
  const canDelete =
    period?.status === "draft" || period?.status === "processing";

  const summaryLabel = useMemo(() => {
    if (!period) return "";
    return `${period.start_date} → ${period.end_date}`;
  }, [period]);

  if (loading || !period) {
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
          <Text style={styles.headerTitle}>Payroll Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading payroll period...</Text>
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
        <Text style={styles.headerTitle}>Payroll Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{period.name}</Text>
          <Text style={styles.sectionSubtitle}>{summaryLabel}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Type: {period.type}</Text>
            <Text style={styles.metaText}>Status: {period.status}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Pay Date: {period.pay_date}</Text>
            <Text style={styles.metaText}>
              Employees: {period.payroll_runs_count ?? 0}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Total Gross: {formatAmount(period.total_gross)}
            </Text>
            <Text style={styles.metaText}>
              Total Net: {formatAmount(period.total_net)}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Total Tax: {formatAmount(period.total_tax)}
            </Text>
            <Text style={styles.metaText}>
              Total NSITF: {formatAmount(period.total_nsitf)}
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Generate Payroll</Text>
          <Text style={styles.sectionSubtitle}>
            Configure tax options before generating payroll.
          </Text>

          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.label}>Apply PAYE Tax</Text>
                <Text style={styles.helperText}>
                  {applyPayeTax ? "Tax will be applied" : "No PAYE tax"}
                </Text>
              </View>
              <Switch
                value={applyPayeTax}
                onValueChange={setApplyPayeTax}
                trackColor={{ false: "#d1d5db", true: BRAND_COLORS.gold }}
                thumbColor={applyPayeTax ? BRAND_COLORS.darkPurple : "#f3f4f6"}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>PAYE Tax Rate</Text>
            <TextInput
              style={styles.input}
              value={payeTaxRate}
              onChangeText={setPayeTaxRate}
              placeholder="Optional"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.label}>Apply NSITF</Text>
                <Text style={styles.helperText}>
                  {applyNsitf ? "NSITF will be applied" : "No NSITF"}
                </Text>
              </View>
              <Switch
                value={applyNsitf}
                onValueChange={setApplyNsitf}
                trackColor={{ false: "#d1d5db", true: BRAND_COLORS.gold }}
                thumbColor={applyNsitf ? BRAND_COLORS.darkPurple : "#f3f4f6"}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>NSITF Rate</Text>
            <TextInput
              style={styles.input}
              value={nsitfRate}
              onChangeText={setNsitfRate}
              placeholder="Optional"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tax Exemption Reason</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={taxExemptionReason}
              onChangeText={setTaxExemptionReason}
              placeholder="Optional"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              (!canGenerate || submitting) && styles.buttonDisabled,
            ]}
            onPress={handleGenerate}
            disabled={!canGenerate || submitting}
            activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>
              {submitting ? "Generating..." : "Generate Payroll"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Payroll Runs</Text>
          {runs.length === 0 ? (
            <View style={styles.emptyInline}>
              <Text style={styles.emptyText}>No payroll runs yet.</Text>
            </View>
          ) : (
            runs.map((run) => (
              <View key={run.id} style={styles.runCard}>
                <Text style={styles.runTitle}>{run.employee_name}</Text>
                <Text style={styles.runSubtext}>
                  {run.employee_number || ""} {run.department_name || ""}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    Basic: {formatAmount(run.basic_salary)}
                  </Text>
                  <Text style={styles.metaText}>
                    Net: {formatAmount(run.net_salary)}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    Allowances: {formatAmount(run.total_allowances)}
                  </Text>
                  <Text style={styles.metaText}>
                    Deductions: {formatAmount(run.total_deductions)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.actionsSection}>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                (!canReset || submitting) && styles.buttonDisabled,
              ]}
              onPress={handleReset}
              disabled={!canReset || submitting}
              activeOpacity={0.8}>
              <Text style={styles.secondaryBtnText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                (!canApprove || submitting) && styles.buttonDisabled,
              ]}
              onPress={handleApprove}
              disabled={!canApprove || submitting}
              activeOpacity={0.8}>
              <Text style={styles.secondaryBtnText}>Approve</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              (!canExport || submitting) && styles.buttonDisabled,
            ]}
            onPress={handleExport}
            disabled={!canExport || submitting}
            activeOpacity={0.8}>
            <Text style={styles.secondaryBtnText}>Export Bank File</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.dangerBtn,
              (!canDelete || submitting) && styles.buttonDisabled,
            ]}
            onPress={handleDelete}
            disabled={!canDelete || submitting}
            activeOpacity={0.8}>
            <Text style={styles.dangerText}>Delete Period</Text>
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
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: SEMANTIC_COLORS.textLight,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  metaText: {
    fontSize: 13,
    color: SEMANTIC_COLORS.text,
  },
  formGroup: {
    marginTop: 12,
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
  textArea: {
    minHeight: 90,
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
  primaryBtn: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  emptyInline: {
    paddingVertical: 12,
  },
  emptyText: {
    fontSize: 13,
    color: SEMANTIC_COLORS.textLight,
  },
  runCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  runTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  runSubtext: {
    fontSize: 12,
    color: SEMANTIC_COLORS.textLight,
    marginTop: 4,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  dangerBtn: {
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#fff5f5",
  },
  dangerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#dc2626",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
