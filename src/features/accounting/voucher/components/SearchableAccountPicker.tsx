import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { BRAND_COLORS } from "../../../../theme/colors";
import type { LedgerAccountOption } from "../types";

type Props = {
  /** Currently selected account id */
  selectedId: number | undefined;
  /** Full list of accounts to search / pick from */
  accounts: LedgerAccountOption[];
  /** Placeholder shown when nothing is selected */
  placeholder?: string;
  /** Called when user picks an account (undefined = cleared) */
  onSelect: (id: number | undefined) => void;
};

export default function SearchableAccountPicker({
  selectedId,
  accounts,
  placeholder = "Select Account",
  onSelect,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedId),
    [accounts, selectedId],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return accounts;
    const q = search.toLowerCase();
    return accounts.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        (a.display_name && a.display_name.toLowerCase().includes(q)) ||
        (a.account_group_name &&
          a.account_group_name.toLowerCase().includes(q)),
    );
  }, [accounts, search]);

  const handleSelect = useCallback(
    (account: LedgerAccountOption) => {
      onSelect(account.id);
      setVisible(false);
      setSearch("");
    },
    [onSelect],
  );

  const handleClear = useCallback(() => {
    onSelect(undefined);
    setVisible(false);
    setSearch("");
  }, [onSelect]);

  const renderItem = useCallback(
    ({ item }: { item: LedgerAccountOption }) => (
      <TouchableOpacity
        style={[
          pickerStyles.option,
          item.id === selectedId && pickerStyles.optionSelected,
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.6}>
        <View style={pickerStyles.optionContent}>
          <Text style={pickerStyles.optionCode}>{item.code}</Text>
          <Text style={pickerStyles.optionName} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        {item.account_group_name ? (
          <Text style={pickerStyles.optionGroup} numberOfLines={1}>
            {item.account_group_name}
          </Text>
        ) : null}
      </TouchableOpacity>
    ),
    [selectedId, handleSelect],
  );

  const keyExtractor = useCallback(
    (item: LedgerAccountOption) => String(item.id),
    [],
  );

  return (
    <>
      {/* Trigger button */}
      <TouchableOpacity
        style={pickerStyles.trigger}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}>
        <Text
          style={[
            pickerStyles.triggerText,
            !selectedAccount && pickerStyles.triggerPlaceholder,
          ]}
          numberOfLines={1}>
          {selectedAccount
            ? selectedAccount.display_name ||
              `${selectedAccount.name} (${selectedAccount.code})`
            : placeholder}
        </Text>
        <Text style={pickerStyles.triggerIcon}>▼</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setVisible(false);
          setSearch("");
        }}>
        <KeyboardAvoidingView
          style={pickerStyles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={pickerStyles.sheet}>
            {/* Header */}
            <View style={pickerStyles.sheetHeader}>
              <Text style={pickerStyles.sheetTitle}>{placeholder}</Text>
              <TouchableOpacity
                onPress={() => {
                  setVisible(false);
                  setSearch("");
                }}>
                <Text style={pickerStyles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search box */}
            <View style={pickerStyles.searchRow}>
              <TextInput
                style={pickerStyles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search by name or code…"
                placeholderTextColor="#9ca3af"
                autoFocus
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
            </View>

            {/* Clear selection */}
            {selectedId != null && (
              <TouchableOpacity
                style={pickerStyles.clearButton}
                onPress={handleClear}>
                <Text style={pickerStyles.clearText}>✕ Clear selection</Text>
              </TouchableOpacity>
            )}

            {/* List */}
            <FlatList
              data={filtered}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={pickerStyles.emptyContainer}>
                  <Text style={pickerStyles.emptyText}>
                    No accounts match "{search}"
                  </Text>
                </View>
              }
              style={pickerStyles.list}
              initialNumToRender={20}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const pickerStyles = StyleSheet.create({
  // Trigger
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 4,
  },
  triggerText: {
    flex: 1,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  triggerPlaceholder: {
    color: "#9ca3af",
  },
  triggerIcon: {
    fontSize: 10,
    color: "#9ca3af",
    marginLeft: 8,
  },

  // Overlay & sheet
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  closeText: {
    fontSize: 20,
    color: "#9ca3af",
    padding: 4,
  },

  // Search
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },

  // Clear
  clearButton: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  clearText: {
    fontSize: 13,
    color: "#ef4444",
    fontWeight: "600",
  },

  // List
  list: {
    paddingHorizontal: 16,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    borderRadius: 8,
  },
  optionSelected: {
    backgroundColor: "#ede9fe",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionCode: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND_COLORS.gold,
    backgroundColor: "#fef9c3",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  optionName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  optionGroup: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
    marginLeft: 4,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
  },
});
