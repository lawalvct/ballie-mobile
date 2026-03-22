import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { ProjectMilestone } from "../../types";
import {
  useAddMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  useInvoiceMilestone,
} from "../../hooks/useProjects";
import { formatCurrency, formatDate, confirmDelete } from "../../utils/projectUtils";
import { BRAND_COLORS } from "../../../../theme/colors";
import { tabStyles as s } from "./tabStyles";

interface Props {
  projectId: number;
  milestones: ProjectMilestone[];
}

export default function ProjectMilestonesTab({ projectId, milestones }: Props) {
  const addMilestone = useAddMilestone(projectId);
  const updateMilestone = useUpdateMilestone(projectId);
  const deleteMilestone = useDeleteMilestone(projectId);
  const invoiceMilestone = useInvoiceMilestone(projectId);

  const [showForm, setShowForm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    due_date: "",
    is_billable: true,
  });

  const handleAmountChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "");
    const formatted = digits ? parseInt(digits, 10).toLocaleString("en-US") : "";
    setForm((p) => ({ ...p, amount: formatted }));
  };

  const parsedAmount = () => {
    const clean = form.amount.replace(/,/g, "");
    return clean ? parseFloat(clean) : undefined;
  };

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addMilestone.mutate(
      {
        title: form.title,
        amount: form.amount ? parseFloat(form.amount.replace(/,/g, "")) : undefined,
        due_date: form.due_date || undefined,
        is_billable: form.is_billable,
      },
      {
        onSuccess: () => {
          setForm({ title: "", amount: "", due_date: "", is_billable: true });
          setShowForm(false);
        },
      },
    );
  };

  const handleToggle = (m: ProjectMilestone) => {
    const data = m.completed_at ? { mark_incomplete: true } : { mark_complete: true };
    updateMilestone.mutate({ milestoneId: m.id, data });
  };

  return (
    <View style={s.tabContent}>
      <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(!showForm)}>
        <Text style={s.addBtnText}>{showForm ? "Cancel" : "+ Add Milestone"}</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={s.inlineForm}>
          <TextInput
            style={s.formInput}
            placeholder="Milestone title"
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
            <Text style={{ color: form.due_date ? "#111827" : "#9ca3af", fontSize: 14 }}>
              {form.due_date ? form.due_date : "Due date (optional)"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={form.due_date ? new Date(form.due_date) : new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_e, date) => {
                setShowDatePicker(Platform.OS === "ios");
                if (date) {
                  const iso = date.toISOString().split("T")[0];
                  setForm((p) => ({ ...p, due_date: iso }));
                }
              }}
            />
          )}
          <View style={s.switchRow}>
            <Text style={s.switchLabel}>Billable</Text>
            <Switch
              value={form.is_billable}
              onValueChange={(v) => setForm((p) => ({ ...p, is_billable: v }))}
              trackColor={{ true: BRAND_COLORS.gold }}
            />
          </View>
          <TouchableOpacity
            style={s.formSubmitBtn}
            onPress={handleAdd}
            disabled={addMilestone.isPending}>
            {addMilestone.isPending ? (
              <ActivityIndicator color="#1a0f33" size="small" />
            ) : (
              <Text style={s.formSubmitBtnText}>Add Milestone</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {milestones.length === 0 ? (
        <View style={s.emptyTab}>
          <Text style={s.emptyTabIcon}>🏁</Text>
          <Text style={s.emptyTabText}>No milestones yet</Text>
        </View>
      ) : (
        milestones.map((m) => (
          <View key={`milestone-${m.id}`} style={s.milestoneCard}>
            <View style={s.milestoneHeader}>
              <TouchableOpacity onPress={() => handleToggle(m)} style={s.checkBtn}>
                <Text style={{ fontSize: 20 }}>{m.completed_at ? "☑️" : "⬜"}</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={[s.milestoneTitle, m.completed_at ? s.completedText : null]}>
                  {m.title}
                </Text>
                <View style={s.milestoneMeta}>
                  {m.amount != null && (
                    <Text style={s.milestoneAmount}>{formatCurrency(m.amount)}</Text>
                  )}
                  {m.is_billable && (
                    <View style={s.billableBadge}>
                      <Text style={s.billableBadgeText}>Billable</Text>
                    </View>
                  )}
                  {m.invoice && (
                    <View style={s.invoiceBadge}>
                      <Text style={s.invoiceBadgeText}>{m.invoice.voucher_number}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={s.milestoneActions}>
              {m.due_date && <Text style={s.milestoneDue}>📅 {formatDate(m.due_date)}</Text>}
              <View style={s.milestoneActionBtns}>
                {m.completed_at && m.is_billable && !m.invoice_id && m.amount && (
                  <TouchableOpacity
                    style={s.invoiceBtn}
                    onPress={() => invoiceMilestone.mutate(m.id)}>
                    <Text style={s.invoiceBtnText}>Invoice</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => confirmDelete("milestone", () => deleteMilestone.mutate(m.id))}>
                  <Text style={s.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );
}
