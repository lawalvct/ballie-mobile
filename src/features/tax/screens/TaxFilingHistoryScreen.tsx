import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { TaxStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import TaxModuleHeader from "../../../components/tax/TaxModuleHeader";
import {
  useTaxFilings,
  useCreateFiling,
  useUpdateFilingStatus,
  useDeleteFiling,
} from "../hooks/useTax";
import type {
  FilingType,
  FilingStatus,
  TaxFiling,
  CreateFilingPayload,
  FilingListFilters,
} from "../types";

type Props = NativeStackScreenProps<TaxStackParamList, "TaxFilings">;

const FILING_TYPES: { value: FilingType; label: string }[] = [
  { value: "vat", label: "VAT" },
  { value: "paye", label: "PAYE" },
  { value: "pension", label: "Pension" },
  { value: "nsitf", label: "NSITF" },
  { value: "wht", label: "WHT" },
  { value: "cit", label: "CIT" },
];

const STATUS_FILTERS: { value: FilingStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "filed", label: "Filed" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

const STATUS_COLORS: Record<FilingStatus, { bg: string; text: string }> = {
  draft: { bg: "rgba(107,114,128,0.1)", text: "#6b7280" },
  filed: { bg: "rgba(59,130,246,0.1)", text: "#3b82f6" },
  paid: { bg: "rgba(16,185,129,0.1)", text: "#10b981" },
  overdue: { bg: "rgba(239,68,68,0.1)", text: "#ef4444" },
};

function formatCurrency(n: number): string {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TaxFilingHistoryScreen({ navigation }: Props) {
  const [typeFilter, setTypeFilter] = useState<FilingType | undefined>();
  const [statusFilter, setStatusFilter] = useState<
    FilingStatus | undefined
  >();

  const filters: FilingListFilters = {
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const { filings, summary, isLoading, isRefreshing, refresh } =
    useTaxFilings(filters);
  const createFiling = useCreateFiling();
  const updateStatus = useUpdateFilingStatus();
  const deleteFiling = useDeleteFiling();

  // ── Create modal state ──
  const [showCreate, setShowCreate] = useState(false);
  const [newType, setNewType] = useState<FilingType>("vat");
  const [newPeriod, setNewPeriod] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDue, setNewDue] = useState("");
  const [newRef, setNewRef] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const resetForm = useCallback(() => {
    setNewType("vat");
    setNewPeriod("");
    setNewAmount("");
    setNewDue("");
    setNewRef("");
    setNewNotes("");
  }, []);

  const handleCreate = useCallback(() => {
    if (!newPeriod.trim() || !newAmount.trim()) {
      Alert.alert("Required", "Period and amount are required.");
      return;
    }
    const payload: CreateFilingPayload = {
      type: newType,
      period_label: newPeriod.trim(),
      period_start: "",
      period_end: "",
      amount: parseFloat(newAmount) || 0,
      status: "draft",
      ...(newDue.trim() ? { due_date: newDue.trim() } : {}),
      ...(newRef.trim() ? { reference_number: newRef.trim() } : {}),
      ...(newNotes.trim() ? { notes: newNotes.trim() } : {}),
    };
    createFiling.mutate(payload, {
      onSuccess: () => {
        setShowCreate(false);
        resetForm();
      },
    });
  }, [newType, newPeriod, newAmount, newDue, newRef, newNotes, createFiling, resetForm]);

  const handleMarkPaid = useCallback(
    (filing: TaxFiling) => {
      Alert.alert("Mark as Paid", `Mark ${filing.type.toUpperCase()} — ${filing.period_label} as paid?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () =>
            updateStatus.mutate({ id: filing.id, payload: { status: "paid" } }),
        },
      ]);
    },
    [updateStatus],
  );

  const handleDelete = useCallback(
    (filing: TaxFiling) => {
      Alert.alert("Delete Filing", `Delete ${filing.type.toUpperCase()} — ${filing.period_label}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteFiling.mutate(filing.id),
        },
      ]);
    },
    [deleteFiling],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="light" />
      <TaxModuleHeader
        title="Filing History"
        onBack={() => navigation.goBack()}
        navigation={navigation}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={[BRAND_COLORS.gold]}
          />
        }>
        {/* New Filing Button */}
        <TouchableOpacity
          style={styles.newFilingBtn}
          onPress={() => setShowCreate(true)}
          activeOpacity={0.8}>
          <Text style={styles.newFilingBtnText}>+ New Filing</Text>
        </TouchableOpacity>

        {/* Summary Badges */}
        {summary && (
          <View style={styles.summaryRow}>
            {(
              [
                { key: "paid", label: "Paid", color: "#10b981" },
                { key: "filed", label: "Filed", color: "#3b82f6" },
                { key: "draft", label: "Draft", color: "#6b7280" },
                { key: "overdue", label: "Overdue", color: "#ef4444" },
              ] as const
            ).map((s) => (
              <View
                key={`sum-${s.key}`}
                style={[styles.summaryBadge, { backgroundColor: `${s.color}12` }]}>
                <Text style={[styles.summaryCount, { color: s.color }]}>
                  {summary[s.key]}
                </Text>
                <Text style={[styles.summaryBadgeLabel, { color: s.color }]}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Type Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}>
          <TouchableOpacity
            style={[styles.chip, !typeFilter && styles.chipActive]}
            onPress={() => setTypeFilter(undefined)}>
            <Text
              style={[
                styles.chipText,
                !typeFilter && styles.chipTextActive,
              ]}>
              All Types
            </Text>
          </TouchableOpacity>
          {FILING_TYPES.map((t) => (
            <TouchableOpacity
              key={`type-${t.value}`}
              style={[styles.chip, typeFilter === t.value && styles.chipActive]}
              onPress={() =>
                setTypeFilter(typeFilter === t.value ? undefined : t.value)
              }>
              <Text
                style={[
                  styles.chipText,
                  typeFilter === t.value && styles.chipTextActive,
                ]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Status Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}>
          {STATUS_FILTERS.map((s) => {
            const active =
              s.value === "all" ? !statusFilter : statusFilter === s.value;
            return (
              <TouchableOpacity
                key={`status-${s.value}`}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() =>
                  setStatusFilter(s.value === "all" ? undefined : (s.value as FilingStatus))
                }>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Filings List */}
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={BRAND_COLORS.darkPurple} />
          </View>
        ) : filings.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No filings found</Text>
          </View>
        ) : (
          filings.map((f) => (
            <View key={`filing-${f.id}`} style={styles.filingCard}>
              <View style={styles.filingTop}>
                <View>
                  <Text style={styles.filingType}>{f.type.toUpperCase()}</Text>
                  <Text style={styles.filingPeriod}>{f.period_label}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[f.status].bg },
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      { color: STATUS_COLORS[f.status].text },
                    ]}>
                    {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.filingMeta}>
                <Text style={styles.filingAmount}>
                  {formatCurrency(f.amount)}
                </Text>
                {f.due_date && (
                  <Text style={styles.filingDue}>
                    Due: {formatDate(f.due_date)}
                  </Text>
                )}
              </View>

              {f.reference_number && (
                <Text style={styles.filingRef}>
                  Ref: {f.reference_number}
                </Text>
              )}

              {f.notes && (
                <Text style={styles.filingNotes} numberOfLines={2}>
                  {f.notes}
                </Text>
              )}

              <View style={styles.filingActions}>
                {f.status !== "paid" && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleMarkPaid(f)}>
                    <Text style={styles.actionBtnText}>Mark Paid</Text>
                  </TouchableOpacity>
                )}
                {f.status === "draft" && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDelete(f)}>
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ── Create Filing Modal ── */}
      <Modal
        visible={showCreate}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreate(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Filing</Text>

            {/* Type Picker */}
            <Text style={styles.fieldLabel}>Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.typePickerScroll}>
              {FILING_TYPES.map((t) => (
                <TouchableOpacity
                  key={`pick-${t.value}`}
                  style={[
                    styles.typePickerChip,
                    newType === t.value && styles.typePickerChipActive,
                  ]}
                  onPress={() => setNewType(t.value)}>
                  <Text
                    style={[
                      styles.typePickerText,
                      newType === t.value && styles.typePickerTextActive,
                    ]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>Period Label *</Text>
            <TextInput
              style={styles.input}
              value={newPeriod}
              onChangeText={setNewPeriod}
              placeholder="e.g. January 2025"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.fieldLabel}>Amount *</Text>
            <TextInput
              style={styles.input}
              value={newAmount}
              onChangeText={setNewAmount}
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />

            <Text style={styles.fieldLabel}>Due Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={newDue}
              onChangeText={setNewDue}
              placeholder="2025-02-21"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.fieldLabel}>Reference</Text>
            <TextInput
              style={styles.input}
              value={newRef}
              onChangeText={setNewRef}
              placeholder="Optional reference"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.fieldLabel}>Notes</Text>
            <TextInput
              style={[styles.input, { height: 60, textAlignVertical: "top" }]}
              value={newNotes}
              onChangeText={setNewNotes}
              placeholder="Optional notes"
              placeholderTextColor="#9ca3af"
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setShowCreate(false);
                  resetForm();
                }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleCreate}
                disabled={createFiling.isPending}>
                {createFiling.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1a0f33" },
  scroll: { flex: 1, backgroundColor: "#f3f4f6" },
  newFilingBtn: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: BRAND_COLORS.darkPurple,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  newFilingBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  loadingWrap: { paddingVertical: 60, alignItems: "center" },
  emptyWrap: { paddingVertical: 40, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#9ca3af" },

  // Summary
  summaryRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 16,
    gap: 8,
  },
  summaryBadge: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  summaryCount: { fontSize: 18, fontWeight: "800" },
  summaryBadgeLabel: { fontSize: 10, fontWeight: "600", marginTop: 2 },

  // Filters
  filterScroll: { marginTop: 10 },
  filterRow: { paddingHorizontal: 20, gap: 6 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  chipActive: {
    backgroundColor: BRAND_COLORS.darkPurple,
    borderColor: BRAND_COLORS.darkPurple,
  },
  chipText: { fontSize: 12, fontWeight: "600", color: "#6b7280" },
  chipTextActive: { color: "#fff" },

  // Filing card
  filingCard: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  filingTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  filingType: { fontSize: 13, fontWeight: "800", color: BRAND_COLORS.darkPurple },
  filingPeriod: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: "700" },
  filingMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  filingAmount: { fontSize: 16, fontWeight: "700", color: "#1f2937" },
  filingDue: { fontSize: 12, color: "#9ca3af" },
  filingRef: { fontSize: 11, color: "#9ca3af", marginTop: 4 },
  filingNotes: { fontSize: 12, color: "#6b7280", marginTop: 4, fontStyle: "italic" },
  filingActions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 10 },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "rgba(16,185,129,0.1)",
  },
  actionBtnText: { fontSize: 12, fontWeight: "700", color: "#10b981" },
  deleteBtn: { backgroundColor: "rgba(239,68,68,0.1)" },
  deleteBtnText: { fontSize: 12, fontWeight: "700", color: "#ef4444" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "85%",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#1f2937", marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: "#6b7280", marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
  },
  typePickerScroll: { marginBottom: 4 },
  typePickerChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  typePickerChipActive: { backgroundColor: BRAND_COLORS.darkPurple },
  typePickerText: { fontSize: 12, fontWeight: "600", color: "#6b7280" },
  typePickerTextActive: { color: "#fff" },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },
  cancelBtnText: { fontSize: 14, fontWeight: "600", color: "#6b7280" },
  submitBtn: {
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: BRAND_COLORS.darkPurple,
    minWidth: 80,
    alignItems: "center",
  },
  submitBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
