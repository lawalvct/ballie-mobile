import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import type { LedgerAccountOption } from "../types";

type NoteEntry = {
  ledger_account_id: number | undefined;
  amount: string;
  description: string;
};

type Props = {
  ledgerAccounts: LedgerAccountOption[];
  customerAccountId: number | undefined;
  customerAmount: string;
  creditEntries: NoteEntry[];
  onCustomerAccountChange: (value: number | undefined) => void;
  onCustomerAmountChange: (value: string) => void;
  onAddEntry: () => void;
  onRemoveEntry: (index: number) => void;
  onUpdateEntry: (
    index: number,
    field: keyof NoteEntry,
    value: string | number | undefined,
  ) => void;
};

const isCustomerAccount = (account: LedgerAccountOption) => {
  const groupName = (account.account_group_name || "").toLowerCase();
  const isArName = groupName.includes("receivable");
  const isArShort = /\b(ar)\b/.test(groupName);
  return isArName || isArShort;
};

const isRevenueAccount = (account: LedgerAccountOption) => {
  const accountType = (account.account_type || "").toLowerCase();
  return accountType.includes("income") || accountType.includes("revenue");
};

const normalizeAmountInput = (value: string) => {
  const cleaned = value.replace(/,/g, "").replace(/[^\d.]/g, "");
  if (!cleaned) return "";
  const hasTrailingDot = cleaned.endsWith(".");
  const parts = cleaned.split(".");
  const intPart = parts[0] ?? "";
  const decimalPart = parts.slice(1).join("");
  if (hasTrailingDot) {
    return `${intPart}.${decimalPart}`;
  }
  return decimalPart ? `${intPart}.${decimalPart}` : intPart;
};

const formatAmountInput = (value: string) => {
  const normalized = normalizeAmountInput(value);
  if (!normalized) return "";
  const hasTrailingDot = normalized.endsWith(".");
  const [intPart, decimalPart] = normalized.split(".");
  const intNumber = Number(intPart || "0");
  const formattedInt = intPart ? intNumber.toLocaleString() : "0";
  if (hasTrailingDot) return `${formattedInt}.`;
  if (decimalPart !== undefined) return `${formattedInt}.${decimalPart}`;
  return formattedInt;
};

export default function CreditNoteEntriesSection({
  ledgerAccounts,
  customerAccountId,
  customerAmount,
  creditEntries,
  onCustomerAccountChange,
  onCustomerAmountChange,
  onAddEntry,
  onRemoveEntry,
  onUpdateEntry,
}: Props) {
  const customerAccounts = ledgerAccounts.filter(isCustomerAccount);
  const revenueAccounts = ledgerAccounts.filter(isRevenueAccount);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Credit Note</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Customer Account <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={customerAccountId || ""}
            onValueChange={(value) =>
              onCustomerAccountChange(value === "" ? undefined : Number(value))
            }
            style={styles.picker}>
            <Picker.Item label="Select Customer" value="" />
            {customerAccounts.map((account) => (
              <Picker.Item
                key={account.id}
                label={
                  account.display_name || `${account.name} (${account.code})`
                }
                value={account.id}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Credit Note Amount <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={formatAmountInput(customerAmount)}
          onChangeText={(value) =>
            onCustomerAmountChange(normalizeAmountInput(value))
          }
          placeholder="0.00"
          placeholderTextColor="#9ca3af"
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.subTitle}>Revenue Lines (Credit)</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddEntry}>
          <Text style={styles.addButtonText}>+ Add Line</Text>
        </TouchableOpacity>
      </View>

      {creditEntries.map((entry, index) => (
        <View key={index} style={styles.entryCard}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryTitle}>Line {index + 1}</Text>
            {creditEntries.length > 1 && (
              <TouchableOpacity onPress={() => onRemoveEntry(index)}>
                <Text style={styles.removeButton}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Revenue Account <Text style={styles.required}>*</Text>
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
                {revenueAccounts.map((account) => (
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Amount <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formatAmountInput(entry.amount)}
              onChangeText={(value) =>
                onUpdateEntry(index, "amount", normalizeAmountInput(value))
              }
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Particulars</Text>
            <TextInput
              style={styles.input}
              value={entry.description}
              onChangeText={(value) =>
                onUpdateEntry(index, "description", value)
              }
              placeholder="Line description (optional)"
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  required: {
    color: "#ef4444",
  },
  addButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 12,
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
  },
  picker: {
    height: 50,
  },
});
