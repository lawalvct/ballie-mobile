import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import type { LedgerAccountOption } from "../types";

type VoucherEntry = {
  ledger_account_id: number | undefined;
  debit_amount: string;
  credit_amount: string;
  description: string;
};

type Props = {
  entries: VoucherEntry[];
  ledgerAccounts: LedgerAccountOption[];
  onAddEntry: () => void;
  onRemoveEntry: (index: number) => void;
  onUpdateEntry: (
    index: number,
    field: keyof VoucherEntry,
    value: string | number | undefined,
  ) => void;
};

const entryTypes = [
  { key: "journal", label: "Journal", available: true },
  { key: "receipt", label: "Receipt", available: false },
  { key: "payment", label: "Payment", available: false },
  { key: "contra", label: "Contra", available: false },
  { key: "credit_note", label: "Credit Note", available: false },
  { key: "debit_note", label: "Debit Note", available: false },
];

export default function VoucherEntriesSection({
  entries,
  ledgerAccounts,
  onAddEntry,
  onRemoveEntry,
  onUpdateEntry,
}: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Entry Type</Text>
      </View>

      <View style={styles.typeRow}>
        {entryTypes.map((type) => {
          const isActive = type.available;
          return (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.typeChip,
                isActive ? styles.typeChipActive : styles.typeChipInactive,
              ]}
              onPress={() => {
                if (!type.available) {
                  Alert.alert(
                    "Coming Soon",
                    `${type.label} entries will be available soon.`,
                  );
                }
              }}>
              <Text
                style={[
                  styles.typeChipText,
                  isActive ? styles.typeChipTextActive : null,
                ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Entries <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddEntry}>
          <Text style={styles.addButtonText}>+ Add Entry</Text>
        </TouchableOpacity>
      </View>

      {entries.map((entry, index) => (
        <View key={index} style={styles.entryCard}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryTitle}>Entry {index + 1}</Text>
            {entries.length > 2 && (
              <TouchableOpacity onPress={() => onRemoveEntry(index)}>
                <Text style={styles.removeButton}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Ledger Account <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={entry.ledger_account_id || ""}
                onValueChange={(value) =>
                  onUpdateEntry(
                    index,
                    "ledger_account_id",
                    value === "" ? undefined : Number(value),
                  )
                }
                style={styles.picker}>
                <Picker.Item label="Select Account" value="" />
                {ledgerAccounts.map((account) => (
                  <Picker.Item
                    key={account.id}
                    label={
                      account.display_name ||
                      `${account.name} (${account.code})`
                    }
                    value={account.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.amountRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Debit Amount</Text>
              <TextInput
                style={styles.input}
                value={entry.debit_amount}
                onChangeText={(value) =>
                  onUpdateEntry(index, "debit_amount", value)
                }
                placeholder="0.00"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Credit Amount</Text>
              <TextInput
                style={styles.input}
                value={entry.credit_amount}
                onChangeText={(value) =>
                  onUpdateEntry(index, "credit_amount", value)
                }
                placeholder="0.00"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              value={entry.description}
              onChangeText={(value) =>
                onUpdateEntry(index, "description", value)
              }
              placeholder="Entry description (optional)"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  required: {
    color: "#ef4444",
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  typeChipActive: {
    backgroundColor: BRAND_COLORS.gold,
    borderColor: BRAND_COLORS.gold,
  },
  typeChipInactive: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  typeChipTextActive: {
    color: BRAND_COLORS.darkPurple,
  },
  addButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  entryCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  removeButton: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  pickerContainer: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 4,
  },
  picker: {
    height: 50,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  amountRow: {
    flexDirection: "row",
  },
});
