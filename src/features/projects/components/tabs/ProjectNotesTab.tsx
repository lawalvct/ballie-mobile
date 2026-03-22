import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from "react-native";
import type { ProjectNote } from "../../types";
import { useAddNote, useDeleteNote } from "../../hooks/useProjects";
import { formatDate, confirmDelete } from "../../utils/projectUtils";
import { BRAND_COLORS } from "../../../../theme/colors";
import { tabStyles as s } from "./tabStyles";

interface Props {
  projectId: number;
  notes: ProjectNote[];
}

export default function ProjectNotesTab({ projectId, notes }: Props) {
  const addNote = useAddNote(projectId);
  const deleteNote = useDeleteNote(projectId);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ content: "", is_internal: true });

  const handleAdd = () => {
    if (!form.content.trim()) return;
    addNote.mutate(
      { content: form.content, is_internal: form.is_internal },
      {
        onSuccess: () => {
          setForm({ content: "", is_internal: true });
          setShowForm(false);
        },
      },
    );
  };

  return (
    <View style={s.tabContent}>
      <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(!showForm)}>
        <Text style={s.addBtnText}>{showForm ? "Cancel" : "+ Add Note"}</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={s.inlineForm}>
          <TextInput
            style={[s.formInput, { minHeight: 80, textAlignVertical: "top" }]}
            placeholder="Write your note..."
            placeholderTextColor="#9ca3af"
            value={form.content}
            onChangeText={(v) => setForm((p) => ({ ...p, content: v }))}
            multiline
          />
          <View style={s.switchRow}>
            <Text style={s.switchLabel}>Internal note</Text>
            <Switch
              value={form.is_internal}
              onValueChange={(v) => setForm((p) => ({ ...p, is_internal: v }))}
              trackColor={{ true: BRAND_COLORS.gold }}
            />
          </View>
          <TouchableOpacity
            style={s.formSubmitBtn}
            onPress={handleAdd}
            disabled={addNote.isPending}>
            {addNote.isPending ? (
              <ActivityIndicator color="#1a0f33" size="small" />
            ) : (
              <Text style={s.formSubmitBtnText}>Add Note</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {notes.length === 0 ? (
        <View style={s.emptyTab}>
          <Text style={s.emptyTabIcon}>📝</Text>
          <Text style={s.emptyTabText}>No notes yet</Text>
        </View>
      ) : (
        notes.map((note) => (
          <View key={`note-${note.id}`} style={s.noteCard}>
            <View style={s.noteHeader}>
              <View style={s.noteAvatar}>
                <Text style={s.noteAvatarText}>{note.user?.name?.charAt(0) || "?"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.noteNameRow}>
                  <Text style={s.noteName}>{note.user?.name || "Unknown"}</Text>
                  {note.is_internal && (
                    <View style={s.internalBadge}>
                      <Text style={s.internalBadgeText}>Internal</Text>
                    </View>
                  )}
                </View>
                <Text style={s.noteTime}>{formatDate(note.created_at)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => confirmDelete("note", () => deleteNote.mutate(note.id))}>
                <Text style={s.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.noteContent}>{note.content}</Text>
          </View>
        ))
      )}
    </View>
  );
}
