import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import type { ProjectAttachment } from "../../types";
import { useUploadAttachment, useDeleteAttachment } from "../../hooks/useProjects";
import { formatDate, formatFileSize, confirmDelete } from "../../utils/projectUtils";
import { tabStyles as s } from "./tabStyles";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface Props {
  projectId: number;
  attachments: ProjectAttachment[];
}

export default function ProjectFilesTab({ projectId, attachments }: Props) {
  const uploadAttachment = useUploadAttachment(projectId);
  const deleteAttachment = useDeleteAttachment(projectId);
  const [activeFileId, setActiveFileId] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const buildDownloadUrl = async (attachmentId: number) => {
    const token = await AsyncStorage.getItem("auth_token");
    const tenantSlug = await AsyncStorage.getItem("tenant_slug");

    if (!token || !tenantSlug) {
      throw new Error("Authentication required. Please log in again.");
    }

    return {
      token,
      url: `https://ballie.co/api/v1/tenant/${tenantSlug}/projects/${projectId}/attachments/${attachmentId}/download`,
    };
  };

  const downloadAttachmentFile = async (file: ProjectAttachment) => {
    const { token, url } = await buildDownloadUrl(file.id);
    const safeName = file.file_name.replace(/[<>:"/\\|?*]+/g, "_");
    const fileUri = `${FileSystem.documentDirectory}${Date.now()}-${safeName}`;

    const result = await FileSystem.downloadAsync(url, fileUri, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: file.mime_type || "application/octet-stream",
      },
    });

    if (result.status !== 200) {
      throw new Error(`Failed to download file. Server returned status: ${result.status}`);
    }

    return result.uri;
  };

  const handleDownload = async (file: ProjectAttachment) => {
    try {
      setActiveFileId(file.id);
      setIsDownloading(true);
      const localUri = await downloadAttachmentFile(file);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri, {
          mimeType: file.mime_type || undefined,
          dialogTitle: `Save ${file.file_name}`,
        });
      } else {
        Alert.alert("Download complete", `Saved to ${localUri}`);
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to download file");
    } finally {
      setActiveFileId(null);
      setIsDownloading(false);
    }
  };

  const handleUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];

    if (asset.size && asset.size > MAX_FILE_SIZE) {
      Alert.alert("File too large", "Maximum file size is 10 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", {
      uri: asset.uri,
      name: asset.name,
      type: asset.mimeType ?? "application/octet-stream",
    } as any);

    uploadAttachment.mutate(formData);
  };

  return (
    <View style={s.tabContent}>
      <TouchableOpacity
        style={s.addBtn}
        onPress={handleUpload}
        disabled={uploadAttachment.isPending}>
        {uploadAttachment.isPending ? (
          <ActivityIndicator color="#1a0f33" size="small" />
        ) : (
          <Text style={s.addBtnText}>📎 Upload File</Text>
        )}
      </TouchableOpacity>

      {attachments.length === 0 ? (
        <View style={s.emptyTab}>
          <Text style={s.emptyTabIcon}>📎</Text>
          <Text style={s.emptyTabText}>No files yet</Text>
        </View>
      ) : (
        attachments.map((file) => (
          <View key={`file-${file.id}`} style={s.fileCard}>
            <Text style={s.fileIcon}>
              {file.mime_type.startsWith("image/") ? "🖼️" : "📄"}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={s.fileName} numberOfLines={1}>{file.file_name}</Text>
              <Text style={s.fileMeta}>
                {formatFileSize(file.file_size)} • {file.user?.name || "—"} • {formatDate(file.created_at)}
              </Text>
              <View style={{ flexDirection: "row", gap: 16, marginTop: 8 }}>
                <TouchableOpacity onPress={() => handleDownload(file)} disabled={activeFileId === file.id}>
                  {activeFileId === file.id && isDownloading ? (
                    <ActivityIndicator color="#1a0f33" size="small" />
                  ) : (
                    <Text style={{ color: "#059669", fontWeight: "600", fontSize: 13 }}>Download</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => confirmDelete("file", () => deleteAttachment.mutate(file.id))}>
              <Text style={s.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
}
