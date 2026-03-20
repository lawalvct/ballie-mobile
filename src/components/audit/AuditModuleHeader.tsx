/**
 * AuditModuleHeader
 *
 * Reusable dark-gradient header for audit feature screens.
 * Provides:
 *  - ‹ Back button (left)
 *  - Centred title
 *  - ⋮ three-dot menu button (right) → slides up a bottom sheet
 */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuditStackParamList } from "../../navigation/types";

type NavProp = Pick<
  NativeStackNavigationProp<AuditStackParamList>,
  "navigate"
>;

type Props = {
  title: string;
  onBack: () => void;
  navigation: NavProp;
};

export default function AuditModuleHeader({
  title,
  onBack,
  navigation,
}: Props) {
  const [menuVisible, setMenuVisible] = useState(false);

  const menuNav = (action: () => void) => {
    setMenuVisible(false);
    setTimeout(action, 250);
  };

  const MENU_ITEMS = [
    {
      icon: "📊",
      label: "Audit Dashboard",
      onPress: () =>
        menuNav(() => navigation.navigate("AuditDashboard", undefined)),
    },
  ];

  return (
    <>
      <LinearGradient
        colors={["#1a0f33", "#2d1f5e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerMid}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.dotsBtn}
          onPress={() => setMenuVisible(true)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </TouchableOpacity>
      </LinearGradient>

      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}>
        <Pressable
          style={styles.overlay}
          onPress={() => setMenuVisible(false)}
        />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetHeading}>Audit Quick Actions</Text>

          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.row}
              onPress={item.onPress}
              activeOpacity={0.7}>
              <Text style={styles.rowIcon}>{item.icon}</Text>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowChevron}>›</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setMenuVisible(false)}
            activeOpacity={0.8}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  backBtn: { flexDirection: "row", alignItems: "center", minWidth: 64 },
  backArrow: { fontSize: 28, color: "#fff", marginRight: 2, lineHeight: 30 },
  backLabel: { fontSize: 15, color: "rgba(255,255,255,0.85)", fontWeight: "500" },
  headerMid: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  dotsBtn: {
    minWidth: 64,
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.85)",
  },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d1d5db",
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeading: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f3f4f6",
  },
  rowIcon: { fontSize: 20, marginRight: 14 },
  rowLabel: { flex: 1, fontSize: 15, color: "#374151", fontWeight: "500" },
  rowChevron: { fontSize: 20, color: "#9ca3af" },
  closeBtn: {
    marginTop: 18,
    alignItems: "center",
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },
  closeBtnText: { fontSize: 15, fontWeight: "600", color: "#6b7280" },
});
