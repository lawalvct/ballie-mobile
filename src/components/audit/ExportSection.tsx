import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

type ExportFormat = "pdf" | "excel" | "csv";

const FORMATS: { key: ExportFormat; icon: string; label: string; desc: string }[] = [
  { key: "pdf", icon: "📄", label: "PDF Report", desc: "Download audit trail report" },
  { key: "excel", icon: "📊", label: "Excel Spreadsheet", desc: "Download spreadsheet format" },
  { key: "csv", icon: "📋", label: "CSV File", desc: "Download comma-separated file" },
];

export default function ExportSection() {
  const [selected, setSelected] = useState<ExportFormat>("pdf");

  const handleExport = () => {
    Alert.alert(
      "Export",
      `Exporting audit data as ${selected.toUpperCase()}...`,
      [{ text: "OK" }],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Export Data</Text>

      <View style={styles.exportOptions}>
        {FORMATS.map((fmt) => (
          <TouchableOpacity
            key={fmt.key}
            style={[
              styles.exportCard,
              selected === fmt.key && styles.exportCardSelected,
            ]}
            onPress={() => setSelected(fmt.key)}
            activeOpacity={0.7}>
            <View style={styles.exportCardRow}>
              <Text style={styles.exportIcon}>{fmt.icon}</Text>
              <View style={styles.exportInfo}>
                <Text
                  style={[
                    styles.exportLabel,
                    selected === fmt.key && styles.exportLabelSelected,
                  ]}>
                  {fmt.label}
                </Text>
                <Text style={styles.exportDescription}>{fmt.desc}</Text>
              </View>
              <View
                style={[
                  styles.radio,
                  selected === fmt.key && styles.radioSelected,
                ]}>
                {selected === fmt.key && <View style={styles.radioInner} />}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={handleExport} activeOpacity={0.8}>
        <LinearGradient
          colors={[BRAND_COLORS.darkPurple, "#5a4a7e"]}
          style={styles.exportButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}>
          <Text style={styles.exportButtonText}>
            📥 Export as {selected.toUpperCase()}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 16,
  },
  exportOptions: {
    gap: 10,
    marginBottom: 16,
  },
  exportCard: {
    backgroundColor: SEMANTIC_COLORS.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
  },
  exportCardSelected: {
    borderColor: BRAND_COLORS.darkPurple,
    backgroundColor: "#f8f6ff",
  },
  exportCardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  exportIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  exportInfo: {
    flex: 1,
  },
  exportLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 2,
  },
  exportLabelSelected: {
    fontWeight: "700",
  },
  exportDescription: {
    fontSize: 12,
    color: "#6b7280",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: BRAND_COLORS.darkPurple,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  exportButton: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  exportButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
});
