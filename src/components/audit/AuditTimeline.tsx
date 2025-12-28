import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

interface AuditEntry {
  id: string;
  user: string;
  action: string;
  module: string;
  description: string;
  timestamp: string;
  time: string;
}

export default function AuditTimeline() {
  const auditEntries: AuditEntry[] = [
    {
      id: "1",
      user: "John Doe",
      action: "Create",
      module: "Sales",
      description: "Created sales invoice INV-2025-001 for Acme Corp",
      timestamp: "Today",
      time: "10:45 AM",
    },
    {
      id: "2",
      user: "Jane Smith",
      action: "Update",
      module: "Inventory",
      description: "Updated product SKU-12345 quantity from 100 to 150",
      timestamp: "Today",
      time: "10:30 AM",
    },
    {
      id: "3",
      user: "Admin User",
      action: "Delete",
      module: "CRM",
      description: "Deleted customer contact: inactive@example.com",
      timestamp: "Today",
      time: "09:15 AM",
    },
    {
      id: "4",
      user: "John Doe",
      action: "Create",
      module: "Accounting",
      description: "Created journal entry JE-2025-042 for rent expense",
      timestamp: "Today",
      time: "08:45 AM",
    },
    {
      id: "5",
      user: "Jane Smith",
      action: "Update",
      module: "POS",
      description: "Updated cash register opening balance to ₦10,000",
      timestamp: "Yesterday",
      time: "05:30 PM",
    },
    {
      id: "6",
      user: "Admin User",
      action: "Export",
      module: "Reports",
      description: "Exported financial report for December 2025",
      timestamp: "Yesterday",
      time: "03:20 PM",
    },
    {
      id: "7",
      user: "John Doe",
      action: "Create",
      module: "Purchase",
      description: "Created purchase order PO-2025-089 for office supplies",
      timestamp: "Yesterday",
      time: "02:10 PM",
    },
    {
      id: "8",
      user: "Jane Smith",
      action: "Update",
      module: "CRM",
      description: "Updated customer credit limit to ₦500,000",
      timestamp: "Yesterday",
      time: "11:45 AM",
    },
  ];

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return "#10b981";
      case "update":
        return "#f59e0b";
      case "delete":
        return "#ef4444";
      case "export":
        return "#3b82f6";
      case "view":
        return "#6366f1";
      default:
        return "#6b7280";
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module.toLowerCase()) {
      case "accounting":
        return "💰";
      case "inventory":
        return "📦";
      case "sales":
        return "🛒";
      case "purchase":
        return "🛍️";
      case "crm":
        return "👥";
      case "pos":
        return "🖥️";
      case "reports":
        return "📊";
      default:
        return "📋";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Audit Timeline</Text>
        <Text style={styles.entryCount}>{auditEntries.length} entries</Text>
      </View>

      <View style={styles.timeline}>
        {auditEntries.map((entry, index) => (
          <View key={entry.id} style={styles.timelineItem}>
            {/* Timeline Line */}
            {index < auditEntries.length - 1 && (
              <View style={styles.timelineLine} />
            )}

            {/* Timeline Dot */}
            <View
              style={[
                styles.timelineDot,
                { backgroundColor: getActionColor(entry.action) },
              ]}
            />

            {/* Entry Card */}
            <View style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <View style={styles.moduleTag}>
                  <Text style={styles.moduleIcon}>
                    {getModuleIcon(entry.module)}
                  </Text>
                  <Text style={styles.moduleText}>{entry.module}</Text>
                </View>
                <View
                  style={[
                    styles.actionTag,
                    { backgroundColor: getActionColor(entry.action) },
                  ]}>
                  <Text style={styles.actionText}>{entry.action}</Text>
                </View>
              </View>

              <Text style={styles.description}>{entry.description}</Text>

              <View style={styles.entryFooter}>
                <Text style={styles.userText}>👤 {entry.user}</Text>
                <Text style={styles.timeText}>
                  {entry.timestamp} • {entry.time}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  entryCount: {
    fontSize: 13,
    color: "#6b7280",
  },
  timeline: {
    position: "relative",
  },
  timelineItem: {
    position: "relative",
    paddingLeft: 32,
    marginBottom: 20,
  },
  timelineLine: {
    position: "absolute",
    left: 7,
    top: 24,
    width: 2,
    height: "100%",
    backgroundColor: "#e5e7eb",
  },
  timelineDot: {
    position: "absolute",
    left: 0,
    top: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: SEMANTIC_COLORS.white,
  },
  entryCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  moduleTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  moduleIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  moduleText: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  actionTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 11,
    fontWeight: "600",
    color: SEMANTIC_COLORS.white,
  },
  description: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 10,
  },
  entryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userText: {
    fontSize: 12,
    color: "#6b7280",
  },
  timeText: {
    fontSize: 11,
    color: "#9ca3af",
  },
});
