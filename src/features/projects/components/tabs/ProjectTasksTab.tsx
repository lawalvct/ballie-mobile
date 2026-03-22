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
import type { ProjectTask, Priority, TaskStatus } from "../../types";
import { useAddTask, useUpdateTask, useDeleteTask } from "../../hooks/useProjects";
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS, PRIORITY_COLORS, formatDate, confirmDelete } from "../../utils/projectUtils";
import { tabStyles as s } from "./tabStyles";

interface Props {
  projectId: number;
  tasks: ProjectTask[];
}

export default function ProjectTasksTab({ projectId, tasks }: Props) {
  const addTask = useAddTask(projectId);
  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);

  const [showForm, setShowForm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [form, setForm] = useState({
    title: "",
    priority: "medium" as Priority,
    assigned_to: null as number | null,
    due_date: "",
  });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addTask.mutate(
      {
        title: form.title,
        priority: form.priority,
        assigned_to: form.assigned_to,
        due_date: form.due_date || undefined,
      },
      {
        onSuccess: () => {
          setForm({ title: "", priority: "medium", assigned_to: null, due_date: "" });
          setShowForm(false);
        },
      },
    );
  };

  const handleStatusChange = (task: ProjectTask, status: TaskStatus) => {
    updateTask.mutate({ taskId: task.id, data: { status } });
  };

  return (
    <View style={s.tabContent}>
      <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(!showForm)}>
        <Text style={s.addBtnText}>{showForm ? "Cancel" : "+ Add Task"}</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={s.inlineForm}>
          <TextInput
            style={s.formInput}
            placeholder="Task title"
            placeholderTextColor="#9ca3af"
            value={form.title}
            onChangeText={(v) => setForm((p) => ({ ...p, title: v }))}
          />
          <Text style={s.miniLabel}>Priority</Text>
          <View style={s.chipRow}>
            {(["low", "medium", "high", "urgent"] as Priority[]).map((p) => (
              <TouchableOpacity
                key={`tp-${p}`}
                style={[s.miniChip, form.priority === p && s.miniChipActive]}
                onPress={() => setForm((prev) => ({ ...prev, priority: p }))}>
                <Text style={[s.miniChipText, form.priority === p && s.miniChipTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
          <TouchableOpacity style={s.formSubmitBtn} onPress={handleAdd} disabled={addTask.isPending}>
            {addTask.isPending ? (
              <ActivityIndicator color="#1a0f33" size="small" />
            ) : (
              <Text style={s.formSubmitBtnText}>Add Task</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {tasks.length === 0 ? (
        <View style={s.emptyTab}>
          <Text style={s.emptyTabIcon}>✅</Text>
          <Text style={s.emptyTabText}>No tasks yet</Text>
        </View>
      ) : (
        tasks.map((task) => {
          const ts = TASK_STATUS_COLORS[task.status];
          return (
            <View key={`task-${task.id}`} style={[s.taskCard, { borderLeftColor: ts.border }]}>
              <View style={s.taskHeader}>
                <Text style={s.taskTitle} numberOfLines={2}>{task.title}</Text>
                <View style={[s.priorityBadge, { backgroundColor: PRIORITY_COLORS[task.priority] + "20" }]}>
                  <Text style={[s.priorityBadgeText, { color: PRIORITY_COLORS[task.priority] }]}>
                    {task.priority}
                  </Text>
                </View>
              </View>

              <View style={s.taskMeta}>
                {task.assigned_user && (
                  <Text style={s.taskMetaText}>🎯 {task.assigned_user.name}</Text>
                )}
                {task.due_date && (
                  <Text style={[s.taskMetaText, task.is_overdue ? { color: "#dc2626" } : null]}>
                    {task.is_overdue ? "⚠️" : "📅"} {formatDate(task.due_date)}
                  </Text>
                )}
              </View>

              <View style={s.taskActions}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {(["todo", "in_progress", "review", "done"] as TaskStatus[]).map((status) => (
                    <TouchableOpacity
                      key={`ts-${task.id}-${status}`}
                      style={[s.statusChip, task.status === status && { backgroundColor: ts.border }]}
                      onPress={() => handleStatusChange(task, status)}>
                      <Text style={[s.statusChipText, task.status === status && { color: "#fff" }]}>
                        {TASK_STATUS_LABELS[status]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity onPress={() => confirmDelete("task", () => deleteTask.mutate(task.id))}>
                  <Text style={s.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}
