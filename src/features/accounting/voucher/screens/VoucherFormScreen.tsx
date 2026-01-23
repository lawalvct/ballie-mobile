import React, { useState, useEffect, useReducer } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { showToast, showConfirm } from "../../../../utils/toast";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AccountingStackParamList } from "../../../../navigation/types";
import { voucherService } from "../services/voucherService";
import { LedgerAccountOption } from "../types";
import VoucherEntriesSection from "../components/VoucherEntriesSection";
import ReceiptVoucherEntriesSection from "../components/ReceiptVoucherEntriesSection";
import PaymentVoucherEntriesSection from "../components/PaymentVoucherEntriesSection";
import ContraVoucherEntriesSection from "../components/ContraVoucherEntriesSection";
import CreditNoteEntriesSection from "../components/CreditNoteEntriesSection";
import DebitNoteEntriesSection from "../components/DebitNoteEntriesSection";

type Props = NativeStackScreenProps<AccountingStackParamList, "VoucherForm">;

interface VoucherEntry {
  ledger_account_id: number | undefined;
  debit_amount: string;
  credit_amount: string;
  description: string;
  document?: EntryDocument;
}

interface NoteEntry {
  ledger_account_id: number | undefined;
  amount: string;
  description: string;
}

interface EntryDocument {
  uri: string;
  name: string;
  type: string;
}

interface FormState {
  voucher_date: string;
  voucher_number: string;
  narration: string;
  reference_number: string;
  entries: VoucherEntry[];
}

type FormAction =
  | { type: "SET_FIELD"; field: string; value: string }
  | { type: "ADD_ENTRY" }
  | {
      type: "UPDATE_ENTRY";
      index: number;
      field: keyof VoucherEntry;
      value: string | number | undefined | EntryDocument;
    }
  | { type: "REMOVE_ENTRY"; index: number };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "ADD_ENTRY":
      return {
        ...state,
        entries: [
          ...state.entries,
          {
            ledger_account_id: undefined,
            debit_amount: "",
            credit_amount: "",
            description: "",
            document: undefined,
          },
        ],
      };
    case "UPDATE_ENTRY":
      return {
        ...state,
        entries: state.entries.map((entry, i) =>
          i === action.index
            ? { ...entry, [action.field]: action.value }
            : entry,
        ),
      };
    case "REMOVE_ENTRY":
      return {
        ...state,
        entries: state.entries.filter((_, i) => i !== action.index),
      };
    default:
      return state;
  }
}

export default function VoucherFormScreen({ navigation, route }: Props) {
  const { voucherTypeId, voucherTypeCode, voucherTypeName } = route.params;
  const isReceiptVoucher =
    voucherTypeCode?.toUpperCase() === "RV" ||
    voucherTypeName?.toLowerCase().includes("receipt");
  const isPaymentVoucher =
    voucherTypeCode?.toUpperCase() === "PV" ||
    voucherTypeName?.toLowerCase().includes("payment");
  const isContraVoucher =
    voucherTypeCode?.toUpperCase() === "CV" ||
    voucherTypeName?.toLowerCase().includes("contra");
  const isCreditNoteVoucher =
    voucherTypeCode?.toUpperCase() === "CN" ||
    voucherTypeName?.toLowerCase().includes("credit note");
  const isDebitNoteVoucher =
    voucherTypeCode?.toUpperCase() === "DN" ||
    voucherTypeName?.toLowerCase().includes("debit note");

  const [ledgerAccounts, setLedgerAccounts] = useState<LedgerAccountOption[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [receiptBankAccountId, setReceiptBankAccountId] = useState<
    number | undefined
  >(undefined);
  const [paymentBankAccountId, setPaymentBankAccountId] = useState<
    number | undefined
  >(undefined);
  const [contraFromAccountId, setContraFromAccountId] = useState<
    number | undefined
  >(undefined);
  const [contraToAccountId, setContraToAccountId] = useState<
    number | undefined
  >(undefined);
  const [contraAmount, setContraAmount] = useState<string>("");
  const [contraParticulars, setContraParticulars] = useState<string>("");
  const [creditNoteCustomerAccountId, setCreditNoteCustomerAccountId] =
    useState<number | undefined>(undefined);
  const [creditNoteAmount, setCreditNoteAmount] = useState<string>("");
  const [creditEntries, setCreditEntries] = useState<NoteEntry[]>([
    { ledger_account_id: undefined, amount: "", description: "" },
  ]);
  const [debitNoteCustomerAccountId, setDebitNoteCustomerAccountId] = useState<
    number | undefined
  >(undefined);
  const [debitNoteAmount, setDebitNoteAmount] = useState<string>("");
  const [debitEntries, setDebitEntries] = useState<NoteEntry[]>([
    { ledger_account_id: undefined, amount: "", description: "" },
  ]);

  const initialEntries =
    isReceiptVoucher || isPaymentVoucher
      ? [
          {
            ledger_account_id: undefined,
            debit_amount: "",
            credit_amount: "",
            description: "",
            document: undefined,
          },
        ]
      : [
          {
            ledger_account_id: undefined,
            debit_amount: "",
            credit_amount: "",
            description: "",
            document: undefined,
          },
          {
            ledger_account_id: undefined,
            debit_amount: "",
            credit_amount: "",
            description: "",
            document: undefined,
          },
        ];

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  const [formState, dispatch] = useReducer(formReducer, {
    voucher_date: today,
    voucher_number: "",
    narration: "",
    reference_number: "",
    entries: initialEntries,
  });

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoading(true);
      const response = await voucherService.getFormData();

      // Debug: Log the response structure
      console.log("Form data response:", JSON.stringify(response, null, 2));

      // The API returns { success, data: { ledger_accounts, voucher_types } }
      const formData = response;
      const accounts = formData.ledger_accounts || [];

      console.log("Ledger accounts:", accounts.length, accounts[0]);
      setLedgerAccounts(accounts);
    } catch (error: any) {
      console.error("Error loading form data:", error);
      showToast(
        error.response?.data?.message ||
          error.message ||
          "Failed to load form data",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const buildDocument = (input: {
    uri: string;
    name?: string;
    type?: string;
    mimeType?: string | null;
  }): EntryDocument => {
    const nameFromUri = input.uri.split("/").pop() || "attachment";
    return {
      uri: input.uri,
      name: input.name || nameFromUri,
      type: input.type || input.mimeType || "application/octet-stream",
    };
  };

  const handlePickDocument = async (index: number) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        return;
      }

      const doc = buildDocument({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
      });

      dispatch({
        type: "UPDATE_ENTRY",
        index,
        field: "document",
        value: doc,
      });
    } catch (error: any) {
      showToast(error.message || "Failed to pick document", "error");
    }
  };

  const handleTakePhoto = async (index: number) => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showToast("Camera permission is required to take a photo", "error");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        allowsEditing: false,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        return;
      }

      const doc = buildDocument({
        uri: asset.uri,
        name: asset.fileName ?? undefined,
        type: asset.mimeType || "image/jpeg",
      });

      dispatch({
        type: "UPDATE_ENTRY",
        index,
        field: "document",
        value: doc,
      });
    } catch (error: any) {
      showToast(error.message || "Failed to take photo", "error");
    }
  };

  const handleRemoveDocument = (index: number) => {
    dispatch({
      type: "UPDATE_ENTRY",
      index,
      field: "document",
      value: undefined,
    });
  };

  const calculateBalance = () => {
    const totalCredits = formState.entries.reduce(
      (sum, entry) => sum + (parseFloat(entry.credit_amount) || 0),
      0,
    );
    const totalDebitsFromEntries = formState.entries.reduce(
      (sum, entry) => sum + (parseFloat(entry.debit_amount) || 0),
      0,
    );

    if (isPaymentVoucher) {
      const totalDebits = totalDebitsFromEntries;
      return {
        totalDebits,
        totalCredits: totalDebits,
        isBalanced: totalDebits > 0,
      };
    }

    if (isReceiptVoucher) {
      const totalDebits = totalCredits;
      return {
        totalDebits,
        totalCredits,
        isBalanced: totalCredits > 0,
      };
    }

    if (isContraVoucher) {
      const transferAmount = parseFloat(contraAmount) || 0;
      return {
        totalDebits: transferAmount,
        totalCredits: transferAmount,
        isBalanced: transferAmount > 0,
      };
    }

    if (isCreditNoteVoucher) {
      const customerAmount = parseFloat(creditNoteAmount) || 0;
      const creditsTotal = creditEntries.reduce(
        (sum, entry) => sum + (parseFloat(entry.amount) || 0),
        0,
      );
      return {
        totalDebits: customerAmount,
        totalCredits: creditsTotal,
        isBalanced:
          customerAmount > 0 && Math.abs(customerAmount - creditsTotal) < 0.01,
      };
    }

    if (isDebitNoteVoucher) {
      const customerAmount = parseFloat(debitNoteAmount) || 0;
      const creditsTotal = debitEntries.reduce(
        (sum, entry) => sum + (parseFloat(entry.amount) || 0),
        0,
      );
      return {
        totalDebits: customerAmount,
        totalCredits: creditsTotal,
        isBalanced:
          customerAmount > 0 && Math.abs(customerAmount - creditsTotal) < 0.01,
      };
    }

    const totalDebits = totalDebitsFromEntries;

    return {
      totalDebits,
      totalCredits,
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
    };
  };

  const { totalDebits, totalCredits, isBalanced } = calculateBalance();
  const canSave = isReceiptVoucher
    ? totalCredits > 0 &&
      !!receiptBankAccountId &&
      formState.entries.length >= 1 &&
      formState.entries.every(
        (e) => e.ledger_account_id && (parseFloat(e.credit_amount) || 0) > 0,
      )
    : isPaymentVoucher
      ? totalDebits > 0 &&
        !!paymentBankAccountId &&
        formState.entries.length >= 1 &&
        formState.entries.every(
          (e) => e.ledger_account_id && (parseFloat(e.debit_amount) || 0) > 0,
        )
      : isContraVoucher
        ? !!contraFromAccountId &&
          !!contraToAccountId &&
          (parseFloat(contraAmount) || 0) > 0
        : isCreditNoteVoucher
          ? !!creditNoteCustomerAccountId &&
            (parseFloat(creditNoteAmount) || 0) > 0 &&
            creditEntries.length >= 1 &&
            creditEntries.every(
              (e) => e.ledger_account_id && (parseFloat(e.amount) || 0) > 0,
            ) &&
            isBalanced
          : isDebitNoteVoucher
            ? !!debitNoteCustomerAccountId &&
              (parseFloat(debitNoteAmount) || 0) > 0 &&
              debitEntries.length >= 1 &&
              debitEntries.every(
                (e) => e.ledger_account_id && (parseFloat(e.amount) || 0) > 0,
              ) &&
              isBalanced
            : isBalanced &&
              totalDebits > 0 &&
              formState.entries.length >= 2 &&
              formState.entries.every((e) => e.ledger_account_id);

  const handleSave = async (action: "save" | "save_and_post" = "save") => {
    try {
      setSaving(true);

      if (isReceiptVoucher) {
        if (!receiptBankAccountId) {
          showToast("Select a bank/cash account", "error");
          return;
        }
      }

      if (isPaymentVoucher) {
        if (!paymentBankAccountId) {
          showToast("Select a bank/cash account", "error");
          return;
        }
      }

      if (isContraVoucher) {
        if (!contraFromAccountId || !contraToAccountId) {
          showToast("Select both bank/cash accounts", "error");
          return;
        }
      }

      if (isCreditNoteVoucher) {
        if (!creditNoteCustomerAccountId) {
          showToast("Select a customer account", "error");
          return;
        }
      }

      if (isDebitNoteVoucher) {
        if (!debitNoteCustomerAccountId) {
          showToast("Select a customer account", "error");
          return;
        }
      }

      // Validate entries
      if (!isContraVoucher && !isCreditNoteVoucher && !isDebitNoteVoucher) {
        for (const entry of formState.entries) {
          const debit = parseFloat(entry.debit_amount) || 0;
          const credit = parseFloat(entry.credit_amount) || 0;

          if (isReceiptVoucher) {
            if (credit === 0) {
              showToast("Each receipt must have a credit amount", "error");
              return;
            }
            if (debit > 0) {
              showToast("Receipt lines must be credit only", "error");
              return;
            }
          } else if (isPaymentVoucher) {
            if (debit === 0) {
              showToast("Each payment must have a debit amount", "error");
              return;
            }
            if (credit > 0) {
              showToast("Payment lines must be debit only", "error");
              return;
            }
          } else {
            if (debit > 0 && credit > 0) {
              showToast(
                "Each entry must have either debit OR credit, not both",
                "error",
              );
              return;
            }

            if (debit === 0 && credit === 0) {
              showToast(
                "Each entry must have either debit or credit amount",
                "error",
              );
              return;
            }
          }
        }
      }

      const receiptEntries = isReceiptVoucher
        ? [
            {
              ledger_account_id: receiptBankAccountId!,
              debit_amount: totalCredits,
              credit_amount: 0,
              particulars: "Bank/Cash Receipt",
            },
            ...formState.entries.map((entry) => ({
              ledger_account_id: entry.ledger_account_id!,
              debit_amount: 0,
              credit_amount: parseFloat(entry.credit_amount) || 0,
              particulars: entry.description || undefined,
              document: entry.document,
            })),
          ]
        : formState.entries.map((entry) => ({
            ledger_account_id: entry.ledger_account_id!,
            debit_amount: parseFloat(entry.debit_amount) || 0,
            credit_amount: parseFloat(entry.credit_amount) || 0,
            particulars: entry.description || undefined,
            document: entry.document,
          }));

      const payload: any = {
        voucher_type_id: voucherTypeId,
        voucher_date: formState.voucher_date,
        voucher_number: formState.voucher_number || undefined,
        narration: formState.narration || undefined,
        reference_number: formState.reference_number || undefined,
        action,
      };

      if (isReceiptVoucher) {
        payload.entries = receiptEntries;
      } else if (isPaymentVoucher) {
        payload.entries = [
          {
            ledger_account_id: paymentBankAccountId!,
            debit_amount: 0,
            credit_amount: totalDebits,
            particulars: "Bank/Cash Payment",
          },
          ...formState.entries.map((entry) => ({
            ledger_account_id: entry.ledger_account_id!,
            debit_amount: parseFloat(entry.debit_amount) || 0,
            credit_amount: 0,
            particulars: entry.description || undefined,
            document: entry.document,
          })),
        ];
      } else if (isContraVoucher) {
        payload.cv_from_account_id = contraFromAccountId!;
        payload.cv_to_account_id = contraToAccountId!;
        payload.cv_transfer_amount = parseFloat(contraAmount) || 0;
        payload.cv_particulars = contraParticulars || undefined;
        delete payload.entries;
      } else if (isCreditNoteVoucher) {
        payload.cn_customer_account_id = creditNoteCustomerAccountId!;
        payload.cn_customer_amount = parseFloat(creditNoteAmount) || 0;
        payload.credit_entries = creditEntries.map((entry) => ({
          ledger_account_id: entry.ledger_account_id!,
          amount: parseFloat(entry.amount) || 0,
          description: entry.description || undefined,
        }));
        delete payload.entries;
      } else if (isDebitNoteVoucher) {
        payload.dn_customer_account_id = debitNoteCustomerAccountId!;
        payload.dn_customer_amount = parseFloat(debitNoteAmount) || 0;
        payload.debit_entries = debitEntries.map((entry) => ({
          ledger_account_id: entry.ledger_account_id!,
          amount: parseFloat(entry.amount) || 0,
          description: entry.description || undefined,
        }));
        delete payload.entries;
      } else {
        payload.entries = receiptEntries;
      }

      if (isContraVoucher || isCreditNoteVoucher || isDebitNoteVoucher) {
        delete payload.entries;
      }

      console.log("Creating voucher:", payload);

      const hasEntryDocuments = Array.isArray(payload.entries)
        ? payload.entries.some((entry: any) => entry?.document?.uri)
        : false;

      const toFormData = (data: any) => {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
          if (value === undefined || value === null || value === "") {
            return;
          }

          if (key === "entries" && Array.isArray(value)) {
            value.forEach((entry: any, index: number) => {
              formData.append(
                `entries[${index}][ledger_account_id]`,
                String(entry.ledger_account_id),
              );
              formData.append(
                `entries[${index}][debit_amount]`,
                String(entry.debit_amount || 0),
              );
              formData.append(
                `entries[${index}][credit_amount]`,
                String(entry.credit_amount || 0),
              );

              if (entry.particulars) {
                formData.append(
                  `entries[${index}][particulars]`,
                  String(entry.particulars),
                );
              }

              if (entry.document?.uri) {
                formData.append(`entries[${index}][document]`, {
                  uri: entry.document.uri,
                  name: entry.document.name,
                  type: entry.document.type,
                } as any);
              }
            });
            return;
          }

          formData.append(key, String(value));
        });

        return formData;
      };

      const response = hasEntryDocuments
        ? await voucherService.create(toFormData(payload))
        : await voucherService.create(payload);
      console.log("Voucher created:", response);

      showToast(
        `🎉 Voucher ${response.voucher_number} ${
          action === "save_and_post" ? "posted" : "created"
        } successfully`,
        "success",
      );

      // Wait a bit for toast to show before navigating
      setTimeout(() => {
        navigation.goBack();
        navigation.goBack(); // Go back twice to return to VoucherHome
      }, 1500);
    } catch (error: any) {
      console.error("Error creating voucher:", error);
      showToast(
        error.response?.data?.message ||
          error.message ||
          "Failed to create voucher",
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
          <Text style={styles.headerTitle}>{voucherTypeName}</Text>
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{voucherTypeName}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {/* Voucher Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voucher Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Date <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.datePickerText}>
                {new Date(formState.voucher_date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={new Date(formState.voucher_date)}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate) {
                    const formattedDate = selectedDate
                      .toISOString()
                      .split("T")[0];
                    dispatch({
                      type: "SET_FIELD",
                      field: "voucher_date",
                      value: formattedDate,
                    });
                  }
                }}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Voucher Number (Optional)</Text>
            <TextInput
              style={styles.input}
              value={formState.voucher_number}
              onChangeText={(value) =>
                dispatch({ type: "SET_FIELD", field: "voucher_number", value })
              }
              placeholder="Auto-generated if left empty"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Narration</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formState.narration}
              onChangeText={(value) =>
                dispatch({ type: "SET_FIELD", field: "narration", value })
              }
              placeholder="Enter description..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Reference Number</Text>
            <TextInput
              style={styles.input}
              value={formState.reference_number}
              onChangeText={(value) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "reference_number",
                  value,
                })
              }
              placeholder="External reference (optional)"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {isReceiptVoucher ? (
          <ReceiptVoucherEntriesSection
            entries={formState.entries}
            ledgerAccounts={ledgerAccounts}
            bankAccountId={receiptBankAccountId}
            onBankAccountChange={setReceiptBankAccountId}
            onAddEntry={() => dispatch({ type: "ADD_ENTRY" })}
            onRemoveEntry={(index) => dispatch({ type: "REMOVE_ENTRY", index })}
            onUpdateEntry={(index, field, value) =>
              dispatch({ type: "UPDATE_ENTRY", index, field, value })
            }
            onPickDocument={handlePickDocument}
            onTakePhoto={handleTakePhoto}
            onRemoveDocument={handleRemoveDocument}
            totalCredits={totalCredits}
          />
        ) : isPaymentVoucher ? (
          <PaymentVoucherEntriesSection
            entries={formState.entries}
            ledgerAccounts={ledgerAccounts}
            bankAccountId={paymentBankAccountId}
            onBankAccountChange={setPaymentBankAccountId}
            onAddEntry={() => dispatch({ type: "ADD_ENTRY" })}
            onRemoveEntry={(index) => dispatch({ type: "REMOVE_ENTRY", index })}
            onUpdateEntry={(index, field, value) =>
              dispatch({ type: "UPDATE_ENTRY", index, field, value })
            }
            onPickDocument={handlePickDocument}
            onTakePhoto={handleTakePhoto}
            onRemoveDocument={handleRemoveDocument}
            totalDebits={totalDebits}
          />
        ) : isContraVoucher ? (
          <ContraVoucherEntriesSection
            ledgerAccounts={ledgerAccounts}
            fromAccountId={contraFromAccountId}
            toAccountId={contraToAccountId}
            transferAmount={contraAmount}
            particulars={contraParticulars}
            onFromAccountChange={setContraFromAccountId}
            onToAccountChange={setContraToAccountId}
            onTransferAmountChange={setContraAmount}
            onParticularsChange={setContraParticulars}
          />
        ) : isCreditNoteVoucher ? (
          <CreditNoteEntriesSection
            ledgerAccounts={ledgerAccounts}
            customerAccountId={creditNoteCustomerAccountId}
            customerAmount={creditNoteAmount}
            creditEntries={creditEntries}
            onCustomerAccountChange={setCreditNoteCustomerAccountId}
            onCustomerAmountChange={setCreditNoteAmount}
            onAddEntry={() =>
              setCreditEntries((prev) => [
                ...prev,
                { ledger_account_id: undefined, amount: "", description: "" },
              ])
            }
            onRemoveEntry={(index) =>
              setCreditEntries((prev) => prev.filter((_, i) => i !== index))
            }
            onUpdateEntry={(index, field, value) =>
              setCreditEntries((prev) =>
                prev.map((entry, i) =>
                  i === index ? { ...entry, [field]: value } : entry,
                ),
              )
            }
          />
        ) : isDebitNoteVoucher ? (
          <DebitNoteEntriesSection
            ledgerAccounts={ledgerAccounts}
            customerAccountId={debitNoteCustomerAccountId}
            customerAmount={debitNoteAmount}
            debitEntries={debitEntries}
            onCustomerAccountChange={setDebitNoteCustomerAccountId}
            onCustomerAmountChange={setDebitNoteAmount}
            onAddEntry={() =>
              setDebitEntries((prev) => [
                ...prev,
                { ledger_account_id: undefined, amount: "", description: "" },
              ])
            }
            onRemoveEntry={(index) =>
              setDebitEntries((prev) => prev.filter((_, i) => i !== index))
            }
            onUpdateEntry={(index, field, value) =>
              setDebitEntries((prev) =>
                prev.map((entry, i) =>
                  i === index ? { ...entry, [field]: value } : entry,
                ),
              )
            }
          />
        ) : (
          <VoucherEntriesSection
            entries={formState.entries}
            ledgerAccounts={ledgerAccounts}
            onAddEntry={() => dispatch({ type: "ADD_ENTRY" })}
            onRemoveEntry={(index) => dispatch({ type: "REMOVE_ENTRY", index })}
            onUpdateEntry={(index, field, value) =>
              dispatch({ type: "UPDATE_ENTRY", index, field, value })
            }
            onPickDocument={handlePickDocument}
            onTakePhoto={handleTakePhoto}
            onRemoveDocument={handleRemoveDocument}
          />
        )}

        {/* Balance Summary */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Total Debits:</Text>
            <Text style={styles.balanceValue}>
              ₦
              {totalDebits.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Total Credits:</Text>
            <Text style={styles.balanceValue}>
              ₦
              {totalCredits.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabelBold}>Difference:</Text>
            <Text
              style={[
                styles.balanceValueBold,
                isBalanced ? styles.balanceGreen : styles.balanceRed,
              ]}>
              ₦
              {Math.abs(totalDebits - totalCredits).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.balanceStatus}>
            {isBalanced && totalDebits > 0 ? (
              <Text style={styles.balanceStatusGreen}>
                ✓ Entries are balanced
              </Text>
            ) : (
              <Text style={styles.balanceStatusRed}>
                ✗ Entries must be balanced
              </Text>
            )}
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.saveButtonsRow}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!canSave || saving) && styles.saveButtonDisabled,
            ]}
            onPress={() => handleSave("save")}
            disabled={!canSave || saving}>
            {saving ? (
              <ActivityIndicator color={BRAND_COLORS.darkPurple} />
            ) : (
              <Text style={styles.saveButtonText}>Save Draft</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.postButton,
              (!canSave || saving) && styles.saveButtonDisabled,
            ]}
            onPress={() =>
              showConfirm(
                "Post Voucher",
                "This will save and post the voucher. Continue?",
                () => handleSave("save_and_post"),
              )
            }
            disabled={!canSave || saving}>
            {saving ? (
              <ActivityIndicator color={BRAND_COLORS.darkPurple} />
            ) : (
              <Text style={styles.postButtonText}>Save & Post</Text>
            )}
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
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: BRAND_COLORS.gold,
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 60,
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
  scrollView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 20,
  },
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
    marginBottom: 16,
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
  required: {
    color: "#ef4444",
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
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
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
  amountRow: {
    flexDirection: "row",
  },
  balanceCard: {
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
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  balanceLabelBold: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  balanceValueBold: {
    fontSize: 16,
    fontWeight: "bold",
  },
  balanceGreen: {
    color: "#10b981",
  },
  balanceRed: {
    color: "#ef4444",
  },
  balanceStatus: {
    marginTop: 8,
    alignItems: "center",
  },
  balanceStatusGreen: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
  },
  balanceStatusRed: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
  },
  saveButton: {
    flex: 1,
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: BRAND_COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  postButton: {
    flex: 1,
    backgroundColor: "#10b981",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: "#e5e7eb",
    shadowOpacity: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  datePickerButton: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  datePickerText: {
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
    fontWeight: "500",
  },
  calendarIcon: {
    fontSize: 18,
  },
});
