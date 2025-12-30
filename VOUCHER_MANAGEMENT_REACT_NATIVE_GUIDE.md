# Voucher Management - React Native Implementation Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Endpoints Reference](#api-endpoints-reference)
4. [Screen Implementations](#screen-implementations)
5. [State Management](#state-management)
6. [Form Handling](#form-handling)
7. [Validation](#validation)
8. [Error Handling](#error-handling)
9. [Best Practices](#best-practices)

---

## Overview

The Voucher Management system implements **double-entry accounting** principles in a mobile-friendly interface. It supports six voucher types:

| Type            | Code | Description            | Use Case                          |
| --------------- | ---- | ---------------------- | --------------------------------- |
| Journal Voucher | JV   | General ledger entries | Opening balances, adjustments     |
| Payment Voucher | PV   | Cash/bank payments     | Expense payments, vendor payments |
| Receipt Voucher | RV   | Cash/bank receipts     | Customer receipts, income         |
| Contra Voucher  | CV   | Bank-to-bank transfers | Internal transfers                |
| Credit Note     | CN   | Customer credits       | Sales returns, discounts          |
| Debit Note      | DN   | Customer debits        | Purchase returns, adjustments     |

### Key Concepts

#### Double-Entry Accounting

Every transaction has two sides:

-   **Debit (Dr.)**: Left side - increases assets/expenses, decreases liabilities/income
-   **Credit (Cr.)**: Right side - increases liabilities/income, decreases assets/expenses

**Golden Rule**: Total Debits = Total Credits (must be balanced)

#### Voucher Workflow

```
Draft → Posted
  ↓       ↓
Edit    Read-only
Delete  Can unpost
```

---

## Architecture

### Project Structure

```
src/
├── screens/
│   ├── vouchers/
│   │   ├── VoucherListScreen.tsx
│   │   ├── CreateVoucherScreen.tsx
│   │   ├── VoucherDetailsScreen.tsx
│   │   └── EditVoucherScreen.tsx
├── components/
│   ├── vouchers/
│   │   ├── VoucherCard.tsx
│   │   ├── EntryRow.tsx
│   │   ├── VoucherTypeSelector.tsx
│   │   ├── AccountPicker.tsx
│   │   └── VoucherFilters.tsx
├── services/
│   └── api/
│       └── voucherService.ts
├── store/
│   └── slices/
│       └── voucherSlice.ts
├── hooks/
│   ├── useVouchers.ts
│   └── useVoucherForm.ts
└── types/
    └── voucher.types.ts
```

---

## API Endpoints Reference

### Base URL

```
https://yourdomain.com/api/v1/tenant/{tenant_slug}/accounting/vouchers
```

### Authentication

All requests require Bearer token:

```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}
```

### Endpoints Summary

| Method | Endpoint          | Purpose            |
| ------ | ----------------- | ------------------ |
| GET    | `/create`         | Get form data      |
| POST   | `/`               | Create voucher     |
| GET    | `/`               | List vouchers      |
| GET    | `/{id}`           | Get details        |
| PUT    | `/{id}`           | Update voucher     |
| DELETE | `/{id}`           | Delete voucher     |
| POST   | `/{id}/post`      | Post voucher       |
| POST   | `/{id}/unpost`    | Unpost voucher     |
| GET    | `/{id}/duplicate` | Get duplicate data |
| POST   | `/bulk-action`    | Bulk operations    |
| GET    | `/search`         | Search vouchers    |

---

## Screen Implementations

### 1. Voucher List Screen

```typescript
// src/screens/vouchers/VoucherListScreen.tsx
import React, { useState, useCallback } from "react";
import {
    View,
    FlatList,
    TouchableOpacity,
    Text,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { voucherService } from "../../services/api/voucherService";
import VoucherCard from "../../components/vouchers/VoucherCard";
import VoucherFilters from "../../components/vouchers/VoucherFilters";

interface Voucher {
    id: number;
    voucher_number: string;
    voucher_type_name: string;
    voucher_type_code: string;
    voucher_date: string;
    total_amount: number;
    status: "draft" | "posted";
    narration: string;
}

interface Filters {
    search: string;
    voucher_type_id: number | null;
    status: string | null;
    date_from: string | null;
    date_to: string | null;
}

export default function VoucherListScreen() {
    const navigation = useNavigation();
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [statistics, setStatistics] = useState({
        total_vouchers: 0,
        draft_vouchers: 0,
        posted_vouchers: 0,
        total_amount: 0,
    });
    const [filters, setFilters] = useState<Filters>({
        search: "",
        voucher_type_id: null,
        status: null,
        date_from: null,
        date_to: null,
    });
    const [selectedVouchers, setSelectedVouchers] = useState<number[]>([]);

    const fetchVouchers = useCallback(
        async (pageNum: number = 1, reset: boolean = false) => {
            if (loading || (!hasMore && !reset)) return;

            try {
                setLoading(true);
                const response = await voucherService.list({
                    page: pageNum,
                    per_page: 20,
                    ...filters,
                });

                if (response.success) {
                    const newVouchers = response.data.vouchers;
                    setVouchers((prev) =>
                        reset ? newVouchers : [...prev, ...newVouchers]
                    );
                    setStatistics(response.data.statistics);
                    setHasMore(
                        response.data.pagination.current_page <
                            response.data.pagination.last_page
                    );
                    setPage(pageNum);
                }
            } catch (error) {
                console.error("Failed to fetch vouchers:", error);
                Alert.alert("Error", "Failed to load vouchers");
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [filters, loading, hasMore]
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setHasMore(true);
        fetchVouchers(1, true);
    }, [fetchVouchers]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            fetchVouchers(page + 1);
        }
    }, [loading, hasMore, page, fetchVouchers]);

    const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
        setHasMore(true);
        setPage(1);
    }, []);

    const handleVoucherPress = useCallback(
        (voucher: Voucher) => {
            navigation.navigate("VoucherDetails", { voucherId: voucher.id });
        },
        [navigation]
    );

    const handleBulkAction = useCallback(
        async (action: "post" | "unpost" | "delete") => {
            if (selectedVouchers.length === 0) {
                Alert.alert("No Selection", "Please select vouchers first");
                return;
            }

            Alert.alert(
                "Confirm Action",
                `Are you sure you want to ${action} ${selectedVouchers.length} voucher(s)?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Confirm",
                        style: action === "delete" ? "destructive" : "default",
                        onPress: async () => {
                            try {
                                const response =
                                    await voucherService.bulkAction({
                                        action,
                                        voucher_ids: selectedVouchers,
                                    });

                                if (response.success) {
                                    Alert.alert("Success", response.message);
                                    setSelectedVouchers([]);
                                    onRefresh();
                                }
                            } catch (error: any) {
                                Alert.alert(
                                    "Error",
                                    error.message || "Bulk action failed"
                                );
                            }
                        },
                    },
                ]
            );
        },
        [selectedVouchers, onRefresh]
    );

    const toggleSelection = useCallback((voucherId: number) => {
        setSelectedVouchers((prev) =>
            prev.includes(voucherId)
                ? prev.filter((id) => id !== voucherId)
                : [...prev, voucherId]
        );
    }, []);

    React.useEffect(() => {
        fetchVouchers(1, true);
    }, [filters]);

    const renderStatCard = (
        label: string,
        value: string | number,
        color: string
    ) => (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
        </View>
    );

    const renderVoucherItem = ({ item }: { item: Voucher }) => (
        <VoucherCard
            voucher={item}
            onPress={() => handleVoucherPress(item)}
            isSelected={selectedVouchers.includes(item.id)}
            onToggleSelect={() => toggleSelection(item.id)}
        />
    );

    const renderFooter = () => {
        if (!loading) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color="#007AFF" />
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No vouchers found</Text>
            <Text style={styles.emptySubtext}>
                Create your first voucher to get started
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Statistics */}
            <View style={styles.statsContainer}>
                {renderStatCard("Total", statistics.total_vouchers, "#007AFF")}
                {renderStatCard("Draft", statistics.draft_vouchers, "#FFA500")}
                {renderStatCard(
                    "Posted",
                    statistics.posted_vouchers,
                    "#34C759"
                )}
            </View>

            {/* Filters */}
            <VoucherFilters
                filters={filters}
                onFilterChange={handleFilterChange}
            />

            {/* Bulk Actions Bar */}
            {selectedVouchers.length > 0 && (
                <View style={styles.bulkActionsBar}>
                    <Text style={styles.bulkActionsText}>
                        {selectedVouchers.length} selected
                    </Text>
                    <View style={styles.bulkActionsButtons}>
                        <TouchableOpacity
                            style={[styles.bulkButton, styles.postButton]}
                            onPress={() => handleBulkAction("post")}
                        >
                            <Text style={styles.bulkButtonText}>Post</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.bulkButton, styles.unpostButton]}
                            onPress={() => handleBulkAction("unpost")}
                        >
                            <Text style={styles.bulkButtonText}>Unpost</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.bulkButton, styles.deleteButton]}
                            onPress={() => handleBulkAction("delete")}
                        >
                            <Text style={styles.bulkButtonText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Vouchers List */}
            <FlatList
                data={vouchers}
                renderItem={renderVoucherItem}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={!loading ? renderEmpty : null}
                contentContainerStyle={
                    vouchers.length === 0 && styles.emptyList
                }
            />

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate("CreateVoucher")}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    statsContainer: {
        flexDirection: "row",
        padding: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
    },
    bulkActionsBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#E3F2FD",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#BBDEFB",
    },
    bulkActionsText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1976D2",
    },
    bulkActionsButtons: {
        flexDirection: "row",
        gap: 8,
    },
    bulkButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    postButton: {
        backgroundColor: "#34C759",
    },
    unpostButton: {
        backgroundColor: "#FF9500",
    },
    deleteButton: {
        backgroundColor: "#FF3B30",
    },
    bulkButtonText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
    footer: {
        paddingVertical: 20,
        alignItems: "center",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
    },
    emptyList: {
        flexGrow: 1,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#666",
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#999",
    },
    fab: {
        position: "absolute",
        right: 16,
        bottom: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    fabText: {
        fontSize: 32,
        color: "#FFFFFF",
        marginTop: -4,
    },
});
```

### 2. Create Voucher Screen

```typescript
// src/screens/vouchers/CreateVoucherScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { voucherService } from "../../services/api/voucherService";
import VoucherTypeSelector from "../../components/vouchers/VoucherTypeSelector";
import EntryRow from "../../components/vouchers/EntryRow";
import AccountPicker from "../../components/vouchers/AccountPicker";

interface VoucherEntry {
    id: string; // Temporary ID for UI
    ledger_account_id: number | null;
    ledger_account_name: string;
    debit_amount: string;
    credit_amount: string;
    description: string;
}

interface FormData {
    voucher_type_id: number | null;
    voucher_date: string;
    voucher_number: string;
    narration: string;
    reference_number: string;
    entries: VoucherEntry[];
}

export default function CreateVoucherScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { voucherType, duplicateId } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        voucher_type_id: null,
        voucher_date: new Date().toISOString().split("T")[0],
        voucher_number: "",
        narration: "",
        reference_number: "",
        entries: [
            {
                id: "1",
                ledger_account_id: null,
                ledger_account_name: "",
                debit_amount: "",
                credit_amount: "",
                description: "",
            },
            {
                id: "2",
                ledger_account_id: null,
                ledger_account_name: "",
                debit_amount: "",
                credit_amount: "",
                description: "",
            },
        ],
    });
    const [voucherTypes, setVoucherTypes] = useState([]);
    const [ledgerAccounts, setLedgerAccounts] = useState([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadFormData();
    }, []);

    const loadFormData = async () => {
        try {
            setLoading(true);

            // If duplicating, load duplicate data
            if (duplicateId) {
                const duplicateResponse = await voucherService.getDuplicate(
                    duplicateId
                );
                if (duplicateResponse.success) {
                    setFormData((prev) => ({
                        ...prev,
                        voucher_type_id: duplicateResponse.data.voucher_type_id,
                        narration: duplicateResponse.data.narration,
                        entries: duplicateResponse.data.entries.map(
                            (entry: any, index: number) => ({
                                id: String(index + 1),
                                ledger_account_id: entry.ledger_account_id,
                                ledger_account_name: entry.ledger_account_name,
                                debit_amount: String(entry.debit_amount),
                                credit_amount: String(entry.credit_amount),
                                description: entry.description || "",
                            })
                        ),
                    }));
                }
            }

            // Load form data
            const response = await voucherService.getCreateData(voucherType);
            if (response.success) {
                setVoucherTypes(response.data.voucher_types);
                setLedgerAccounts(response.data.ledger_accounts);

                if (voucherType && response.data.selected_type) {
                    setFormData((prev) => ({
                        ...prev,
                        voucher_type_id: response.data.selected_type.id,
                    }));
                }
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to load form data");
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = useCallback(() => {
        const totalDebits = formData.entries.reduce(
            (sum, entry) => sum + (parseFloat(entry.debit_amount) || 0),
            0
        );
        const totalCredits = formData.entries.reduce(
            (sum, entry) => sum + (parseFloat(entry.credit_amount) || 0),
            0
        );
        const difference = totalDebits - totalCredits;

        return {
            totalDebits,
            totalCredits,
            difference,
            isBalanced: Math.abs(difference) < 0.01,
        };
    }, [formData.entries]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.voucher_type_id) {
            newErrors.voucher_type_id = "Voucher type is required";
        }

        if (!formData.voucher_date) {
            newErrors.voucher_date = "Voucher date is required";
        }

        // Validate entries
        let hasValidEntry = false;
        formData.entries.forEach((entry, index) => {
            if (!entry.ledger_account_id) {
                newErrors[`entry_${index}_account`] = "Account is required";
            }

            const debit = parseFloat(entry.debit_amount) || 0;
            const credit = parseFloat(entry.credit_amount) || 0;

            if (debit > 0 && credit > 0) {
                newErrors[`entry_${index}_both`] =
                    "Entry cannot have both debit and credit";
            }

            if (debit === 0 && credit === 0) {
                newErrors[`entry_${index}_empty`] =
                    "Entry must have debit or credit amount";
            } else {
                hasValidEntry = true;
            }
        });

        if (!hasValidEntry) {
            newErrors.entries = "At least one valid entry is required";
        }

        // Check if balanced
        const { isBalanced } = calculateTotals();
        if (!isBalanced) {
            newErrors.balance = "Total debits must equal total credits";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (action: "save" | "save_and_post" = "save") => {
        if (!validateForm()) {
            Alert.alert(
                "Validation Error",
                "Please fix the errors before submitting"
            );
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                voucher_type_id: formData.voucher_type_id,
                voucher_date: formData.voucher_date,
                voucher_number: formData.voucher_number || undefined,
                narration: formData.narration || undefined,
                reference_number: formData.reference_number || undefined,
                entries: formData.entries
                    .filter((entry) => entry.ledger_account_id)
                    .map((entry) => ({
                        ledger_account_id: entry.ledger_account_id,
                        debit_amount: parseFloat(entry.debit_amount) || 0,
                        credit_amount: parseFloat(entry.credit_amount) || 0,
                        description: entry.description || undefined,
                    })),
                action,
            };

            const response = await voucherService.create(payload);

            if (response.success) {
                Alert.alert("Success", response.message, [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack(),
                    },
                ]);
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to create voucher");
        } finally {
            setSubmitting(false);
        }
    };

    const addEntry = () => {
        setFormData((prev) => ({
            ...prev,
            entries: [
                ...prev.entries,
                {
                    id: String(Date.now()),
                    ledger_account_id: null,
                    ledger_account_name: "",
                    debit_amount: "",
                    credit_amount: "",
                    description: "",
                },
            ],
        }));
    };

    const removeEntry = (id: string) => {
        if (formData.entries.length <= 2) {
            Alert.alert("Error", "At least 2 entries are required");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            entries: prev.entries.filter((entry) => entry.id !== id),
        }));
    };

    const updateEntry = (id: string, field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            entries: prev.entries.map((entry) =>
                entry.id === id ? { ...entry, [field]: value } : entry
            ),
        }));

        // Clear related errors
        setErrors((prev) => {
            const newErrors = { ...prev };
            const index = formData.entries.findIndex((e) => e.id === id);
            delete newErrors[`entry_${index}_${field}`];
            delete newErrors[`entry_${index}_both`];
            delete newErrors[`entry_${index}_empty`];
            delete newErrors.balance;
            return newErrors;
        });
    };

    const { totalDebits, totalCredits, difference, isBalanced } =
        calculateTotals();

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                keyboardShouldPersistTaps="handled"
            >
                {/* Voucher Type */}
                <View style={styles.section}>
                    <Text style={styles.label}>Voucher Type *</Text>
                    <VoucherTypeSelector
                        types={voucherTypes}
                        selectedId={formData.voucher_type_id}
                        onSelect={(id) =>
                            setFormData((prev) => ({
                                ...prev,
                                voucher_type_id: id,
                            }))
                        }
                    />
                    {errors.voucher_type_id && (
                        <Text style={styles.errorText}>
                            {errors.voucher_type_id}
                        </Text>
                    )}
                </View>

                {/* Date */}
                <View style={styles.section}>
                    <Text style={styles.label}>Date *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.voucher_date}
                        onChangeText={(text) =>
                            setFormData((prev) => ({
                                ...prev,
                                voucher_date: text,
                            }))
                        }
                        placeholder="YYYY-MM-DD"
                    />
                    {errors.voucher_date && (
                        <Text style={styles.errorText}>
                            {errors.voucher_date}
                        </Text>
                    )}
                </View>

                {/* Voucher Number */}
                <View style={styles.section}>
                    <Text style={styles.label}>Voucher Number (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.voucher_number}
                        onChangeText={(text) =>
                            setFormData((prev) => ({
                                ...prev,
                                voucher_number: text,
                            }))
                        }
                        placeholder="Auto-generated if empty"
                    />
                </View>

                {/* Narration */}
                <View style={styles.section}>
                    <Text style={styles.label}>Narration</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.narration}
                        onChangeText={(text) =>
                            setFormData((prev) => ({
                                ...prev,
                                narration: text,
                            }))
                        }
                        placeholder="Description of the transaction"
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Reference Number */}
                <View style={styles.section}>
                    <Text style={styles.label}>Reference Number</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.reference_number}
                        onChangeText={(text) =>
                            setFormData((prev) => ({
                                ...prev,
                                reference_number: text,
                            }))
                        }
                        placeholder="External reference (optional)"
                    />
                </View>

                {/* Entries */}
                <View style={styles.section}>
                    <View style={styles.entriesHeader}>
                        <Text style={styles.sectionTitle}>Entries</Text>
                        <TouchableOpacity
                            onPress={addEntry}
                            style={styles.addButton}
                        >
                            <Text style={styles.addButtonText}>
                                + Add Entry
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {formData.entries.map((entry, index) => (
                        <EntryRow
                            key={entry.id}
                            entry={entry}
                            index={index}
                            accounts={ledgerAccounts}
                            onUpdate={(field, value) =>
                                updateEntry(entry.id, field, value)
                            }
                            onRemove={() => removeEntry(entry.id)}
                            canRemove={formData.entries.length > 2}
                            errors={errors}
                        />
                    ))}

                    {errors.entries && (
                        <Text style={styles.errorText}>{errors.entries}</Text>
                    )}
                </View>

                {/* Totals */}
                <View
                    style={[
                        styles.totalsCard,
                        !isBalanced && styles.totalsCardError,
                    ]}
                >
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Debits:</Text>
                        <Text style={styles.totalValue}>
                            ₹{totalDebits.toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Credits:</Text>
                        <Text style={styles.totalValue}>
                            ₹{totalCredits.toFixed(2)}
                        </Text>
                    </View>
                    <View style={[styles.totalRow, styles.differenceRow]}>
                        <Text style={styles.totalLabel}>Difference:</Text>
                        <Text
                            style={[
                                styles.totalValue,
                                styles.differenceValue,
                                isBalanced
                                    ? styles.balanced
                                    : styles.unbalanced,
                            ]}
                        >
                            ₹{Math.abs(difference).toFixed(2)}
                        </Text>
                    </View>
                    {isBalanced && (
                        <Text style={styles.balancedMessage}>
                            ✓ Entries are balanced
                        </Text>
                    )}
                    {errors.balance && (
                        <Text style={styles.errorText}>{errors.balance}</Text>
                    )}
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => navigation.goBack()}
                    disabled={submitting}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={() => handleSubmit("save")}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>Save Draft</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.postButton]}
                    onPress={() => handleSubmit("save_and_post")}
                    disabled={submitting}
                >
                    <Text style={styles.buttonText}>Save & Post</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollView: {
        flex: 1,
    },
    section: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        marginBottom: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: "#FAFAFA",
    },
    textArea: {
        height: 80,
        textAlignVertical: "top",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    entriesHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    addButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
    totalsCard: {
        backgroundColor: "#E8F5E9",
        margin: 16,
        padding: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#4CAF50",
    },
    totalsCardError: {
        backgroundColor: "#FFEBEE",
        borderColor: "#F44336",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    totalLabel: {
        fontSize: 14,
        color: "#666",
    },
    totalValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    differenceRow: {
        borderTopWidth: 1,
        borderTopColor: "#CCC",
        paddingTop: 8,
        marginTop: 4,
    },
    differenceValue: {
        fontSize: 18,
    },
    balanced: {
        color: "#4CAF50",
    },
    unbalanced: {
        color: "#F44336",
    },
    balancedMessage: {
        textAlign: "center",
        color: "#4CAF50",
        fontWeight: "600",
        marginTop: 8,
    },
    errorText: {
        color: "#F44336",
        fontSize: 12,
        marginTop: 4,
    },
    actionButtons: {
        flexDirection: "row",
        padding: 16,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButton: {
        backgroundColor: "#E0E0E0",
    },
    saveButton: {
        backgroundColor: "#FF9500",
    },
    postButton: {
        backgroundColor: "#34C759",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    cancelButtonText: {
        color: "#666",
        fontSize: 16,
        fontWeight: "600",
    },
});
```

### 3. API Service

```typescript
// src/services/api/voucherService.ts
import axios from "axios";
import { getAuthToken, getTenantSlug } from "../auth/authService";

const API_BASE_URL = "https://yourdomain.com/api/v1";

class VoucherService {
    private async getHeaders() {
        const token = await getAuthToken();
        return {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
        };
    }

    private async getBaseUrl() {
        const tenant = await getTenantSlug();
        return `${API_BASE_URL}/tenant/${tenant}/accounting/vouchers`;
    }

    /**
     * Get form data for creating a voucher
     */
    async getCreateData(type?: string) {
        const headers = await this.getHeaders();
        const baseUrl = await this.getBaseUrl();
        const url = type
            ? `${baseUrl}/create?type=${type}`
            : `${baseUrl}/create`;

        const response = await axios.get(url, { headers });
        return response.data;
    }

    /**
     * Create a new voucher
     */
    async create(data: any) {
        const headers = await this.getHeaders();
        const baseUrl = await this.getBaseUrl();

        const response = await axios.post(baseUrl, data, { headers });
        return response.data;
    }

    /**
     * List vouchers with filters
     */
    async list(params: {
        page?: number;
        per_page?: number;
        search?: string;
        voucher_type_id?: number | null;
        status?: string | null;
        date_from?: string | null;
        date_to?: string | null;
        sort_by?: string;
        sort_direction?: string;
    }) {
        const headers = await this.getHeaders();
        const baseUrl = await this.getBaseUrl();

        // Remove null/undefined params
        const cleanParams = Object.entries(params).reduce(
            (acc, [key, value]) => {
                if (value !== null && value !== undefined && value !== "") {
                    acc[key] = value;
                }
                return acc;
            },
            {} as Record<string, any>
        );

        const response = await axios.get(baseUrl, {
            headers,
            params: cleanParams,
        });
        return response.data;
    }

    /**
     * Get voucher details
     */
    async get(id: number) {
        const headers = await this.getHeaders();
        const baseUrl = await this.getBaseUrl();

        const response = await axios.get(`${baseUrl}/${id}`, { headers });
        return response.data;
    }

    /**
     * Update voucher
     */
    async update(id: number, data: any) {
        const headers = await this.getHeaders();
        const baseUrl = await this.getBaseUrl();

        const response = await axios.put(`${baseUrl}/${id}`, data, { headers });
        return response.data;
    }

    /**
     * Delete voucher
     */
    async delete(id: number) {
        const headers = await this.getHeaders();
        const baseUrl = await this.getBaseUrl();

        const response = await axios.delete(`${baseUrl}/${id}`, { headers });
        return response.data;
    }

    /**
     * Post a voucher
     */
    async post(id: number) {
        const headers = await this.getHeaders();
        const baseUrl = await this.getBaseUrl();

        const response = await axios.post(
            `${baseUrl}/${id}/post`,
            {},
            { headers }
        );
        return response.data;
    }

    /**
     * Unpost a voucher
     */
    async unpost(id: number) {
        const headers = await this.getHeaders();
        const baseUrl = await this.getBaseUrl();

        const response = await axios.post(
            `${baseUrl}/${id}/unpost`,
            {},
            { headers }
        );
        return response.data;
    }

    /**
     * Get duplicate voucher data
     */
    async getDuplicate(id: number) {
        const headers = await this.getHeaders();
        const baseUrl = await this.getBaseUrl();

        const response = await axios.get(`${baseUrl}/${id}/duplicate`, {
            headers,
        });
        return response.data;
    }

    /**
     * Bulk actions
     */
    async bulkAction(data: {
        action: "post" | "unpost" | "delete";
        voucher_ids: number[];
    }) {
        const headers = await this.getHeaders();
        const baseUrl = await this.getBaseUrl();

        const response = await axios.post(`${baseUrl}/bulk-action`, data, {
            headers,
        });
        return response.data;
    }

    /**
     * Search vouchers
     */
    async search(params: {
        q?: string;
        status?: string;
        voucher_type_id?: number;
    }) {
        const headers = await this.getHeaders();
        const baseUrl = await this.getBaseUrl();

        const cleanParams = Object.entries(params).reduce(
            (acc, [key, value]) => {
                if (value !== null && value !== undefined && value !== "") {
                    acc[key] = value;
                }
                return acc;
            },
            {} as Record<string, any>
        );

        const response = await axios.get(`${baseUrl}/search`, {
            headers,
            params: cleanParams,
        });
        return response.data;
    }
}

export const voucherService = new VoucherService();
```

---

## State Management

### Redux Toolkit Slice

```typescript
// src/store/slices/voucherSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { voucherService } from "../../services/api/voucherService";

interface Voucher {
    id: number;
    voucher_number: string;
    voucher_type_name: string;
    voucher_type_code: string;
    voucher_date: string;
    total_amount: number;
    status: "draft" | "posted";
    narration: string;
}

interface VoucherState {
    vouchers: Voucher[];
    selectedVoucher: Voucher | null;
    loading: boolean;
    error: string | null;
    statistics: {
        total_vouchers: number;
        draft_vouchers: number;
        posted_vouchers: number;
        total_amount: number;
    };
    filters: {
        search: string;
        voucher_type_id: number | null;
        status: string | null;
        date_from: string | null;
        date_to: string | null;
    };
    page: number;
    hasMore: boolean;
}

const initialState: VoucherState = {
    vouchers: [],
    selectedVoucher: null,
    loading: false,
    error: null,
    statistics: {
        total_vouchers: 0,
        draft_vouchers: 0,
        posted_vouchers: 0,
        total_amount: 0,
    },
    filters: {
        search: "",
        voucher_type_id: null,
        status: null,
        date_from: null,
        date_to: null,
    },
    page: 1,
    hasMore: true,
};

export const fetchVouchers = createAsyncThunk(
    "vouchers/fetchVouchers",
    async (params: { page: number; reset?: boolean }, { getState }) => {
        const state = getState() as { vouchers: VoucherState };
        const response = await voucherService.list({
            page: params.page,
            per_page: 20,
            ...state.vouchers.filters,
        });
        return { data: response.data, reset: params.reset };
    }
);

export const fetchVoucherDetails = createAsyncThunk(
    "vouchers/fetchDetails",
    async (id: number) => {
        const response = await voucherService.get(id);
        return response.data;
    }
);

const voucherSlice = createSlice({
    name: "vouchers",
    initialState,
    reducers: {
        setFilters: (
            state,
            action: PayloadAction<Partial<VoucherState["filters"]>>
        ) => {
            state.filters = { ...state.filters, ...action.payload };
            state.page = 1;
            state.hasMore = true;
        },
        clearFilters: (state) => {
            state.filters = initialState.filters;
            state.page = 1;
            state.hasMore = true;
        },
        clearSelectedVoucher: (state) => {
            state.selectedVoucher = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Vouchers
            .addCase(fetchVouchers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVouchers.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.reset) {
                    state.vouchers = action.payload.data.vouchers;
                } else {
                    state.vouchers = [
                        ...state.vouchers,
                        ...action.payload.data.vouchers,
                    ];
                }
                state.statistics = action.payload.data.statistics;
                state.page = action.payload.data.pagination.current_page;
                state.hasMore =
                    action.payload.data.pagination.current_page <
                    action.payload.data.pagination.last_page;
            })
            .addCase(fetchVouchers.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to fetch vouchers";
            })
            // Fetch Details
            .addCase(fetchVoucherDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVoucherDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedVoucher = action.payload;
            })
            .addCase(fetchVoucherDetails.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to fetch voucher details";
            });
    },
});

export const { setFilters, clearFilters, clearSelectedVoucher } =
    voucherSlice.actions;
export default voucherSlice.reducer;
```

---

## Validation

### Client-Side Validation Rules

```typescript
// src/utils/voucherValidation.ts
interface VoucherEntry {
    ledger_account_id: number | null;
    debit_amount: string;
    credit_amount: string;
    description: string;
}

interface VoucherFormData {
    voucher_type_id: number | null;
    voucher_date: string;
    voucher_number: string;
    narration: string;
    reference_number: string;
    entries: VoucherEntry[];
}

interface ValidationErrors {
    [key: string]: string;
}

export const validateVoucher = (
    formData: VoucherFormData
): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Voucher Type
    if (!formData.voucher_type_id) {
        errors.voucher_type_id = "Voucher type is required";
    }

    // Date
    if (!formData.voucher_date) {
        errors.voucher_date = "Voucher date is required";
    } else {
        const date = new Date(formData.voucher_date);
        if (isNaN(date.getTime())) {
            errors.voucher_date = "Invalid date format";
        }
    }

    // Entries validation
    let hasValidEntry = false;
    let totalDebits = 0;
    let totalCredits = 0;

    formData.entries.forEach((entry, index) => {
        // Account required
        if (!entry.ledger_account_id) {
            errors[`entry_${index}_account`] = "Account is required";
        }

        const debit = parseFloat(entry.debit_amount) || 0;
        const credit = parseFloat(entry.credit_amount) || 0;

        // Check for both debit and credit
        if (debit > 0 && credit > 0) {
            errors[`entry_${index}_both`] =
                "Entry cannot have both debit and credit amounts";
        }

        // Check for zero amounts
        if (debit === 0 && credit === 0) {
            errors[`entry_${index}_empty`] =
                "Entry must have either debit or credit amount";
        }

        // Check for negative amounts
        if (debit < 0 || credit < 0) {
            errors[`entry_${index}_negative`] = "Amounts cannot be negative";
        }

        if (debit > 0 || credit > 0) {
            hasValidEntry = true;
            totalDebits += debit;
            totalCredits += credit;
        }
    });

    // Check if at least one valid entry exists
    if (!hasValidEntry) {
        errors.entries = "At least one valid entry is required";
    }

    // Check if entries are balanced
    if (Math.abs(totalDebits - totalCredits) >= 0.01) {
        errors.balance = `Total debits (₹${totalDebits.toFixed(
            2
        )}) must equal total credits (₹${totalCredits.toFixed(2)})`;
    }

    // Minimum entries check
    const validEntries = formData.entries.filter(
        (e) => e.ledger_account_id !== null
    );
    if (validEntries.length < 2) {
        errors.min_entries = "At least 2 entries are required";
    }

    return errors;
};

// Real-time balance check
export const calculateBalance = (entries: VoucherEntry[]) => {
    const totalDebits = entries.reduce(
        (sum, entry) => sum + (parseFloat(entry.debit_amount) || 0),
        0
    );
    const totalCredits = entries.reduce(
        (sum, entry) => sum + (parseFloat(entry.credit_amount) || 0),
        0
    );
    const difference = totalDebits - totalCredits;
    const isBalanced = Math.abs(difference) < 0.01;

    return {
        totalDebits,
        totalCredits,
        difference,
        isBalanced,
    };
};
```

---

## Error Handling

### Global Error Handler

```typescript
// src/utils/errorHandler.ts
import { Alert } from "react-native";
import axios, { AxiosError } from "axios";

interface ApiError {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
    error?: string;
}

export const handleApiError = (error: any, context?: string) => {
    let errorMessage = "An unexpected error occurred";

    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;

        if (axiosError.response) {
            const { status, data } = axiosError.response;

            switch (status) {
                case 400:
                    errorMessage = data.message || "Bad request";
                    break;
                case 401:
                    errorMessage = "Unauthorized. Please login again.";
                    // Handle logout/redirect
                    break;
                case 403:
                    errorMessage =
                        "You do not have permission to perform this action";
                    break;
                case 404:
                    errorMessage = data.message || "Resource not found";
                    break;
                case 422:
                    // Validation errors
                    if (data.errors) {
                        const validationErrors = Object.entries(data.errors)
                            .map(
                                ([field, messages]) =>
                                    `${field}: ${messages.join(", ")}`
                            )
                            .join("\n");
                        errorMessage = `Validation Error:\n${validationErrors}`;
                    } else {
                        errorMessage = data.message || "Validation failed";
                    }
                    break;
                case 500:
                    errorMessage = "Server error. Please try again later.";
                    break;
                default:
                    errorMessage = data.message || `Error ${status}`;
            }
        } else if (axiosError.request) {
            errorMessage =
                "No response from server. Please check your connection.";
        } else {
            errorMessage = axiosError.message;
        }
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    // Log error for debugging
    console.error(`${context || "API"} Error:`, error);

    // Show alert
    Alert.alert("Error", errorMessage, [{ text: "OK", style: "cancel" }], {
        cancelable: true,
    });

    return errorMessage;
};

// Axios interceptor setup
export const setupAxiosInterceptors = (navigation: any) => {
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                // Redirect to login
                navigation.navigate("Login");
            }
            return Promise.reject(error);
        }
    );
};
```

---

## Best Practices

### 1. Performance Optimization

```typescript
// Use React.memo for components
const VoucherCard = React.memo(({ voucher, onPress }) => {
    // Component implementation
});

// Use useCallback for event handlers
const handleVoucherPress = useCallback(
    (voucher) => {
        navigation.navigate("VoucherDetails", { voucherId: voucher.id });
    },
    [navigation]
);

// Use useMemo for expensive calculations
const totalAmount = useMemo(() => {
    return entries.reduce((sum, entry) => sum + entry.debit_amount, 0);
}, [entries]);

// Implement pagination and infinite scroll
const loadMore = useCallback(() => {
    if (!loading && hasMore) {
        fetchVouchers(page + 1);
    }
}, [loading, hasMore, page]);
```

### 2. Data Caching

```typescript
// Use AsyncStorage for offline support
import AsyncStorage from "@react-native-async-storage/async-storage";

const cacheVouchers = async (vouchers: Voucher[]) => {
    try {
        await AsyncStorage.setItem("cached_vouchers", JSON.stringify(vouchers));
    } catch (error) {
        console.error("Cache error:", error);
    }
};

const getCachedVouchers = async (): Promise<Voucher[]> => {
    try {
        const cached = await AsyncStorage.getItem("cached_vouchers");
        return cached ? JSON.parse(cached) : [];
    } catch (error) {
        console.error("Cache retrieval error:", error);
        return [];
    }
};
```

### 3. Debouncing Search

```typescript
import { useDebounce } from "use-debounce";

const [searchQuery, setSearchQuery] = useState("");
const [debouncedSearch] = useDebounce(searchQuery, 500);

useEffect(() => {
    if (debouncedSearch) {
        searchVouchers(debouncedSearch);
    }
}, [debouncedSearch]);
```

### 4. Form State Management

```typescript
// Use useReducer for complex form state
const formReducer = (state, action) => {
    switch (action.type) {
        case "SET_FIELD":
            return { ...state, [action.field]: action.value };
        case "ADD_ENTRY":
            return { ...state, entries: [...state.entries, action.entry] };
        case "UPDATE_ENTRY":
            return {
                ...state,
                entries: state.entries.map((entry) =>
                    entry.id === action.id
                        ? { ...entry, ...action.updates }
                        : entry
                ),
            };
        case "REMOVE_ENTRY":
            return {
                ...state,
                entries: state.entries.filter(
                    (entry) => entry.id !== action.id
                ),
            };
        case "RESET":
            return action.initialState;
        default:
            return state;
    }
};

const [formState, dispatch] = useReducer(formReducer, initialFormState);
```

### 5. Loading States

```typescript
// Different loading states for better UX
interface LoadingStates {
    initial: boolean; // First load
    refreshing: boolean; // Pull-to-refresh
    loadMore: boolean; // Pagination
    submitting: boolean; // Form submission
}

// Show skeleton loaders during initial load
{
    loading.initial && <SkeletonLoader />;
}

// Show refresh control for pull-to-refresh
<FlatList
    refreshControl={
        <RefreshControl refreshing={loading.refreshing} onRefresh={onRefresh} />
    }
/>;
```

### 6. Security

```typescript
// Never store sensitive data in plain text
import * as SecureStore from "expo-secure-store";

const storeToken = async (token: string) => {
    await SecureStore.setItemAsync("auth_token", token);
};

const getToken = async () => {
    return await SecureStore.getItemAsync("auth_token");
};

// Validate all user inputs
const sanitizeInput = (input: string) => {
    return input.trim().replace(/[<>]/g, "");
};
```

### 7. Testing

```typescript
// Unit test example
import { calculateBalance } from "../utils/voucherValidation";

describe("calculateBalance", () => {
    it("should calculate balanced entries correctly", () => {
        const entries = [
            { debit_amount: "100", credit_amount: "0" },
            { debit_amount: "0", credit_amount: "100" },
        ];

        const result = calculateBalance(entries);

        expect(result.totalDebits).toBe(100);
        expect(result.totalCredits).toBe(100);
        expect(result.isBalanced).toBe(true);
    });
});
```

---

## Troubleshooting

### Common Issues

#### 1. Unbalanced Voucher Error

**Problem**: "Total debits must equal total credits"

**Solution**:

```typescript
// Always validate before submission
const { isBalanced } = calculateBalance(formData.entries);
if (!isBalanced) {
    Alert.alert("Error", "Entries must be balanced");
    return;
}
```

#### 2. Cannot Edit Posted Voucher

**Problem**: "Cannot update a posted voucher"

**Solution**:

```typescript
// Check status before editing
if (voucher.status === "posted") {
    Alert.alert(
        "Posted Voucher",
        "This voucher is posted. Do you want to unpost it first?",
        [
            { text: "Cancel", style: "cancel" },
            {
                text: "Unpost",
                onPress: () => unpostVoucher(voucher.id),
            },
        ]
    );
    return;
}
```

#### 3. Network Timeout

**Problem**: Request times out

**Solution**:

```typescript
// Configure axios timeout
axios.defaults.timeout = 30000; // 30 seconds

// Implement retry logic
const retryRequest = async (fn, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
};
```

---

## Additional Resources

### Documentation Links

-   [Laravel API Documentation](https://laravel.com/docs)
-   [React Native Documentation](https://reactnative.dev)
-   [React Navigation](https://reactnavigation.org)
-   [Redux Toolkit](https://redux-toolkit.js.org)
-   [Axios](https://axios-http.com)

### Postman Collection

Import the `Ballie_Vouchers_API.postman_collection.json` file into Postman for:

-   Complete API reference
-   Sample requests and responses
-   Environment variables setup
-   API testing

---

## Conclusion

This guide provides a complete implementation roadmap for building a voucher management system in React Native. The key principles are:

1. **Double-entry accounting** - Always maintain balanced entries
2. **Validation** - Validate on both client and server
3. **User experience** - Provide clear feedback and loading states
4. **Error handling** - Handle all error cases gracefully
5. **Performance** - Optimize with pagination, caching, and memoization
6. **Security** - Protect sensitive data and validate inputs

Follow the patterns and examples provided to build a robust, production-ready mobile accounting application.
