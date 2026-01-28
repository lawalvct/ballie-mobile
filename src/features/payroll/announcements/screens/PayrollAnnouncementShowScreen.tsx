import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { announcementService } from "../services/announcementService";
import type { AnnouncementRecord, AnnouncementRecipient } from "../types";
import { showConfirm, showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollAnnouncementShow"
>;

const formatDateLabel = (value?: string | null) => {
  if (!value) return "-";
  return value.replace(" ", " • ");
};

const statusSupportsEdit = (status?: string) =>
  status === "draft" || status === "failed";
const statusSupportsSend = (status?: string) =>
  status === "draft" || status === "scheduled" || status === "failed";
const statusSupportsDelete = (status?: string) =>
  status === "draft" || status === "failed";

export default function PayrollAnnouncementShowScreen({
  navigation,
  route,
}: Props) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<AnnouncementRecord | null>(null);
  const [recipients, setRecipients] = useState<AnnouncementRecipient[]>([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await announcementService.show(id);
      setRecord(response.announcement);
      setRecipients(response.recipients || []);
    } catch (error: any) {
      showToast(error.message || "Failed to load announcement", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!record) return;
    showConfirm(
      "Send Announcement",
      "Send this announcement now?",
      async () => {
        try {
          await announcementService.sendNow(record.id);
          showToast("Announcement sending started", "success");
          loadData();
        } catch (error: any) {
          showToast(error.message || "Failed to send", "error");
        }
      },
    );
  };

  const handleDelete = () => {
    if (!record) return;
    showConfirm(
      "Delete Announcement",
      "Delete this announcement?",
      async () => {
        try {
          await announcementService.delete(record.id);
          showToast("Announcement deleted", "success");
          navigation.goBack();
        } catch (error: any) {
          showToast(error.message || "Failed to delete", "error");
        }
      },
      { destructive: true },
    );
  };

  const handleOpenAttachment = async () => {
    if (!record?.attachment_url) return;
    try {
      await Linking.openURL(record.attachment_url);
    } catch (_error) {
      showToast("Unable to open attachment", "error");
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
          <Text style={styles.headerTitle}>Announcement</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
          <Text style={styles.loadingText}>Loading announcement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!record) {
    return null;
  }

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
        <Text style={styles.headerTitle}>Announcement</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{record.title}</Text>
          <Text style={styles.cardSub}>{record.status}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Priority</Text>
            <Text style={styles.detailValue}>{record.priority}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Delivery</Text>
            <Text style={styles.detailValue}>{record.delivery_method}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Recipients</Text>
            <Text style={styles.detailValue}>
              {record.total_recipients ?? 0}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Scheduled</Text>
            <Text style={styles.detailValue}>
              {formatDateLabel(record.scheduled_at)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Sent</Text>
            <Text style={styles.detailValue}>
              {formatDateLabel(record.sent_at)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>
              {formatDateLabel(record.created_at)}
            </Text>
          </View>
          <View style={styles.messageBox}>
            <Text style={styles.detailLabel}>Message</Text>
            <Text style={styles.messageText}>{record.message}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email Sent</Text>
            <Text style={styles.detailValue}>
              {record.email_sent_count ?? 0}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>SMS Sent</Text>
            <Text style={styles.detailValue}>{record.sms_sent_count ?? 0}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Failed</Text>
            <Text style={styles.detailValue}>{record.failed_count ?? 0}</Text>
          </View>

          {record.attachment_url ? (
            <TouchableOpacity
              style={styles.attachmentButton}
              onPress={handleOpenAttachment}>
              <Text style={styles.attachmentButtonText}>Open Attachment</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.actionsRow}>
          {statusSupportsEdit(record.status) && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() =>
                navigation.navigate("PayrollAnnouncementEdit", {
                  id: record.id,
                })
              }>
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          {statusSupportsSend(record.status) && (
            <TouchableOpacity
              style={[styles.actionButton, styles.sendButton]}
              onPress={handleSend}>
              <Text style={styles.actionButtonText}>Send</Text>
            </TouchableOpacity>
          )}
          {statusSupportsDelete(record.status) && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}>
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Recipients</Text>
          {recipients.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>No Recipients</Text>
              <Text style={styles.emptyText}>No recipient data available.</Text>
            </View>
          ) : (
            recipients.map((recipient) => (
              <View
                key={`${recipient.employee_id}-${recipient.employee_email}`}
                style={styles.recipientCard}>
                <Text style={styles.recipientTitle}>
                  {recipient.employee_name || "Employee"}
                </Text>
                <Text style={styles.recipientSubtext}>
                  {recipient.department_name || "Department"} •{" "}
                  {recipient.employee_email || "No email"}
                </Text>
                <Text style={styles.recipientSubtext}>
                  Email: {recipient.email_sent ? "Sent" : "Pending"} • SMS:{" "}
                  {recipient.sms_sent ? "Sent" : "Pending"}
                </Text>
                <Text style={styles.recipientSubtext}>
                  Read: {recipient.read ? "Yes" : "No"} • Acknowledged:{" "}
                  {recipient.acknowledged ? "Yes" : "No"}
                </Text>
              </View>
            ))
          )}
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
  },
  backButtonText: {
    fontSize: 16,
    color: SEMANTIC_COLORS.white,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  card: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  cardSub: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 12,
    textTransform: "capitalize",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  detailValue: {
    fontSize: 12,
    color: "#111827",
    flex: 1,
    textAlign: "right",
    marginLeft: 12,
  },
  messageBox: {
    marginTop: 8,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  messageText: {
    fontSize: 13,
    color: "#111827",
    marginTop: 6,
  },
  attachmentButton: {
    marginTop: 8,
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  attachmentButtonText: {
    color: SEMANTIC_COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 20,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f2937",
  },
  editButton: {
    backgroundColor: "#fef3c7",
  },
  sendButton: {
    backgroundColor: "#d1fae5",
  },
  deleteButton: {
    backgroundColor: "#fecaca",
  },
  listSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  emptyText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  recipientCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  recipientTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  recipientSubtext: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 4,
  },
});
