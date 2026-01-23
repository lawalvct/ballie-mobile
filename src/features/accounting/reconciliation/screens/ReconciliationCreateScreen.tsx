import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountingStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { reconciliationService } from "../services/reconciliationService";
import type { ReconciliationBankOption } from "../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<AccountingStackParamList>;

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function ReconciliationCreateScreen({ navigation }: Props) {
  const today = useMemo(() => new Date(), []);
  const defaultStart = useMemo(
    () => formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    [today],
  );
  const defaultEnd = useMemo(() => formatDate(today), [today]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banks, setBanks] = useState<ReconciliationBankOption[]>([]);

  const [bankId, setBankId] = useState<string>("");
  const [reconciliationDate, setReconciliationDate] = useState(defaultEnd);
  const [statementStart, setStatementStart] = useState(defaultStart);
  const [statementEnd, setStatementEnd] = useState(defaultEnd);
  const [closingBalance, setClosingBalance] = useState("");
  const [bankCharges, setBankCharges] = useState("");
  const [interestEarned, setInterestEarned] = useState("");
  const [notes, setNotes] = useState("");

  const [showReconPicker, setShowReconPicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoading(true);
      const response = await reconciliationService.getFormData();
      setBanks(response.banks || []);
      if (response.banks?.length) {
        setBankId(String(response.banks[0].id));
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to load reconciliation form",
        [{ text: "OK" }],
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!bankId) {
      showToast("Bank is required", "error");
      return;
    }
    if (!closingBalance.trim()) {
      showToast("Closing balance per bank is required", "error");
      return;
    }

    try {
      setSaving(true);
      await reconciliationService.create({
        bank_id: Number(bankId),
        reconciliation_date: reconciliationDate,
        statement_start_date: statementStart,
        statement_end_date: statementEnd,
        closing_balance_per_bank: Number(closingBalance),
        bank_charges: bankCharges ? Number(bankCharges) : undefined,
        interest_earned: interestEarned ? Number(interestEarned) : undefined,
        notes: notes.trim() || undefined,
      });

      showToast("✅ Reconciliation created", "success");
      navigation.goBack();
    } catch (error: any) {
      showToast(
        error.response?.data?.message ||
          error.message ||
          "Failed to create reconciliation",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
          <Text style={styles.headerTitle}>Start Reconciliation</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading form data...</Text>
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
        <Text style={styles.headerTitle}>Start Reconciliation</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentBody}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reconciliation Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Bank *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={bankId}
                onValueChange={(value) => setBankId(String(value))}
                style={styles.picker}>
                {banks.map((bank) => (
                  <Picker.Item
                    key={bank.id}
                    label={`${bank.bank_name} ${bank.masked_account_number || ""}`}
                    value={String(bank.id)}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Reconciliation Date *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowReconPicker(true)}>
              <Text style={styles.dateText}>{reconciliationDate}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.label}>Statement Start *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartPicker(true)}>
                <Text style={styles.dateText}>{statementStart}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.formCol}>
              <Text style={styles.label}>Statement End *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndPicker(true)}>
                <Text style={styles.dateText}>{statementEnd}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Closing Balance per Bank *</Text>
            <TextInput
              style={styles.input}
              value={closingBalance}
              onChangeText={setClosingBalance}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.label}>Bank Charges</Text>
              <TextInput
                style={styles.input}
                value={bankCharges}
                onChangeText={setBankCharges}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={styles.formCol}>
              <Text style={styles.label}>Interest Earned</Text>
              <TextInput
                style={styles.input}
                value={interestEarned}
                onChangeText={setInterestEarned}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color={SEMANTIC_COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>Create Reconciliation</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {showReconPicker && (
        <DateTimePicker
          value={new Date(reconciliationDate)}
          mode="date"
          display="default"
          onChange={(_event, selected) => {
            setShowReconPicker(false);
            if (selected) setReconciliationDate(formatDate(selected));
          }}
        />
      )}
      {showStartPicker && (
        <DateTimePicker
          value={new Date(statementStart)}
          mode="date"
          display="default"
          onChange={(_event, selected) => {
            setShowStartPicker(false);
            if (selected) setStatementStart(formatDate(selected));
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={new Date(statementEnd)}
          mode="date"
          display="default"
          onChange={(_event, selected) => {
            setShowEndPicker(false);
            if (selected) setStatementEnd(formatDate(selected));
          }}
        />
      )}
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
  contentBody: {
    padding: 20,
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
  section: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  formCol: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  pickerContainer: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: BRAND_COLORS.darkPurple,
  },
  dateButton: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: SEMANTIC_COLORS.white,
  },
});
