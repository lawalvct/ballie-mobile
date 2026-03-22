import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { ProjectExpense, ExpenseCategory } from "../../types";
import { useAddExpense, useDeleteExpense } from "../../hooks/useProjects";
import { EXPENSE_CATEGORIES, formatCurrency, formatDate, confirmDelete } from "../../utils/projectUtils";
import { tabStyles as s } from "./tabStyles";

interface Props {
  projectId: number;
  expenses: ProjectExpense[];
}

export default function ProjectExpensesTab({ projectId, expenses }: Props) {
  const addExpense = useAddExpense(projectId);
  const deleteExpense = useDeleteExpense(projectId);

  const [showForm, setShowForm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    expense_date: "",
    category: "general" as ExpenseCategory,
    description: "",
  });

  const handleAmountChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "");
    const formatted = digits ? parseInt(digits, 10).toLocaleString("en-US") : "";
    setForm((p) => ({ ...p, amount: formatted }));
  };

  const handleAdd = () => {
    if (!form.title.trim() || !form.amount || !form.expense_date) return;
    addExpense.mutate(
      {
        title: form.title,
        amount: parseFloat(form.amount.replace(/,/g, "")),
        expense_date: form.expense_date,
        category: form.category,
        description: form.description || undefined,
      },
      {
        onSuccess: () => {
          setForm({ title: "", amount: "", expense_date: "", category: "general", description: "" });
          setShowForm(false);
        },
      },
    );
  };

  return (
    <View style={s.tabContent}>
      <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(!showForm)}>
        <Text style={s.addBtnText}>{showForm ? "Cancel" : "+ Record Expense"}</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={s.inlineForm}>
          <TextInput
            style={s.formInput}
            placeholder="Title"
            placeholderTextColor="#9ca3af"
            value={form.title}
            onChangeText={(v) => setForm((p) => ({ ...p, title: v }))}
          />
          <TextInput
            style={s.formInput}
            placeholder="Amount (₦)"
            placeholderTextColor="#9ca3af"
            value={form.amount}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
          />
          <TouchableOpacity style={s.formInput} onPress={() => setShowDatePicker(true)}>
            <Text style={{ color: form.expense_date ? "#111827" : "#9ca3af", fontSize: 14 }}>
              {form.expense_date ? form.expense_date : "Expense date"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={form.expense_date ? new Date(form.expense_date) : new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_e, date) => {
                setShowDatePicker(Platform.OS === "ios");
                if (date) {
                  const iso = date.toISOString().split("T")[0];
                  setForm((p) => ({ ...p, expense_date: iso }));
                }
              }}
            />
          )}
          <Text style={s.miniLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {EXPENSE_CATEGORIES.map((c) => (
              <TouchableOpacity
                key={`ec-${c}`}
                style={[s.miniChip, form.category === c && s.miniChipActive]}
                onPress={() => setForm((p) => ({ ...p, category: c }))}>
                <Text style={[s.miniChipText, form.category === c && s.miniChipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput
            style={s.formInput}
            placeholder="Description (optional)"
            placeholderTextColor="#9ca3af"
            value={form.description}
            onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
          />
          <TouchableOpacity
            style={s.formSubmitBtn}
            onPress={handleAdd}
            disabled={addExpense.isPending}>
            {addExpense.isPending ? (
              <ActivityIndicator color="#1a0f33" size="small" />
            ) : (
              <Text style={s.formSubmitBtnText}>Record Expense</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {expenses.length === 0 ? (
        <View style={s.emptyTab}>
          <Text style={s.emptyTabIcon}>💸</Text>
          <Text style={s.emptyTabText}>No expenses yet</Text>
        </View>
      ) : (
        expenses.map((exp) => (
          <View key={`expense-${exp.id}`} style={s.expenseCard}>
            <View style={s.expenseHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.expenseTitle}>{exp.title}</Text>
                <View style={s.expenseMeta}>
                  {exp.category && (
                    <View style={s.categoryBadge}>
                      <Text style={s.categoryBadgeText}>{exp.category}</Text>
                    </View>
                  )}
                  <Text style={s.expenseDate}>{formatDate(exp.expense_date)}</Text>
                </View>
              </View>
              <Text style={s.expenseAmount}>{formatCurrency(exp.amount)}</Text>
            </View>
            <View style={s.expenseFooter}>
              <Text style={s.expenseCreator}>{exp.creator?.name || "—"}</Text>
              {exp.voucher && (
                <Text style={s.expenseVoucher}>{exp.voucher.voucher_number}</Text>
              )}
              <TouchableOpacity
                onPress={() => confirmDelete("expense", () => deleteExpense.mutate(exp.id))}>
                <Text style={s.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
}
