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

type VoucherEntry = {
  ledger_account_id: number | undefined;
  debit_amount: string;
  credit_amount: string;
  description: string;
  document?: {
    uri: string;
    name: string;
    type: string;
  };
};

type Props = {
  entries: VoucherEntry[];
  ledgerAccounts: LedgerAccountOption[];
  onAddEntry: () => void;
  onRemoveEntry: (index: number) => void;
  onUpdateEntry: (
    index: number,
    field: keyof VoucherEntry,
    value:
      | string
      | number
      | undefined
      | {
          uri: string;
          name: string;
          type: string;
        },
  ) => void;
  onPickDocument: (index: number) => void;
  onTakePhoto: (index: number) => void;
  onRemoveDocument: (index: number) => void;
};

export default function VoucherEntriesSection({
  entries,
  ledgerAccounts,
  onAddEntry,
  onRemoveEntry,
  onUpdateEntry,
  onPickDocument,
  onTakePhoto,
  onRemoveDocument,
}: Props) {
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

  return (
    <View style={styles.section}>
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
                value={formatAmountInput(entry.debit_amount)}
                onChangeText={(value) =>
                  onUpdateEntry(
                    index,
                    "debit_amount",
                    normalizeAmountInput(value),
                  )
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
                value={formatAmountInput(entry.credit_amount)}
                onChangeText={(value) =>
                  onUpdateEntry(
                    index,
                    "credit_amount",
                    normalizeAmountInput(value),
                  )
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Attachment (Optional)</Text>
            <View style={styles.documentRow}>
              <TouchableOpacity
                style={styles.documentButton}
                onPress={() => onTakePhoto(index)}>
                <Text style={styles.documentButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.documentButton}
                onPress={() => onPickDocument(index)}>
                <Text style={styles.documentButtonText}>Upload File</Text>
              </TouchableOpacity>
            </View>
            {entry.document ? (
              <View style={styles.documentInfo}>
                <Text style={styles.documentName} numberOfLines={1}>
                  {entry.document.name}
                </Text>
                <TouchableOpacity onPress={() => onRemoveDocument(index)}>
                  <Text style={styles.documentRemove}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : null}
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
  documentRow: {
    flexDirection: "row",
    gap: 8,
  },
  documentButton: {
    backgroundColor: "#e0e7ff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  documentButtonText: {
    color: BRAND_COLORS.darkPurple,
    fontSize: 13,
    fontWeight: "600",
  },
  documentInfo: {
    marginTop: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  documentName: {
    flex: 1,
    fontSize: 13,
    color: BRAND_COLORS.darkPurple,
    marginRight: 12,
  },
  documentRemove: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ef4444",
  },
});
