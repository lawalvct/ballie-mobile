import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import type { LedgerAccountOption } from "../types";

type Props = {
  ledgerAccounts: LedgerAccountOption[];
  fromAccountId: number | undefined;
  toAccountId: number | undefined;
  transferAmount: string;
  particulars: string;
  onFromAccountChange: (value: number | undefined) => void;
  onToAccountChange: (value: number | undefined) => void;
  onTransferAmountChange: (value: string) => void;
  onParticularsChange: (value: string) => void;
};

const isBankCashAccount = (account: LedgerAccountOption) => {
  const accountType = (account.account_type || "").toLowerCase();
  const name = (account.display_name || account.name || "").toLowerCase();
  const isAsset = accountType.includes("asset");
  const isBankCash = name.includes("bank") || name.includes("cash");
  return isAsset && isBankCash;
};

export default function ContraVoucherEntriesSection({
  ledgerAccounts,
  fromAccountId,
  toAccountId,
  transferAmount,
  particulars,
  onFromAccountChange,
  onToAccountChange,
  onTransferAmountChange,
  onParticularsChange,
}: Props) {
  const bankCashAccounts = ledgerAccounts.filter(isBankCashAccount);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Contra Transfer</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          From Account (Credit) <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={fromAccountId || ""}
            onValueChange={(value) =>
              onFromAccountChange(value === "" ? undefined : Number(value))
            }
            style={styles.picker}>
            <Picker.Item label="Select Bank/Cash" value="" />
            {bankCashAccounts.map((account) => (
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
          To Account (Debit) <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={toAccountId || ""}
            onValueChange={(value) =>
              onToAccountChange(value === "" ? undefined : Number(value))
            }
            style={styles.picker}>
            <Picker.Item label="Select Bank/Cash" value="" />
            {bankCashAccounts.map((account) => (
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
          Transfer Amount <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={transferAmount}
          onChangeText={onTransferAmountChange}
          placeholder="0.00"
          placeholderTextColor="#9ca3af"
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Particulars</Text>
        <TextInput
          style={styles.input}
          value={particulars}
          onChangeText={onParticularsChange}
          placeholder="Transfer description (optional)"
          placeholderTextColor="#9ca3af"
        />
      </View>
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
  required: {
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
