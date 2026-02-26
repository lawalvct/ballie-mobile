/**
 * PayrollModuleHeader
 *
 * Reusable dark-gradient header for every payroll feature screen.
 * Mirrors AccountingModuleHeader: ‹ Back (left), title (centre-left),
 * ⋮ three-dot menu (right) → bottom sheet with payroll quick actions.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { PayrollStackParamList } from "../../navigation/types";

type NavProp = Pick<
  NativeStackNavigationProp<PayrollStackParamList>,
  "navigate"
>;

type Props = {
  title: string;
  onBack: () => void;
  navigation: NavProp;
};

export default function PayrollModuleHeader({
  title,
  onBack,
  navigation,
}: Props) {
  const [menuVisible, setMenuVisible] = useState(false);
  const { height: screenHeight } = useWindowDimensions();

  const menuNav = (action: () => void) => {
    setMenuVisible(false);
    setTimeout(action, 250);
  };

  const EMPLOYEE_ITEMS = [
    {
      icon: "➕",
      label: "Add Employee",
      onPress: () =>
        menuNav(() => navigation.navigate("PayrollEmployeeCreate", undefined)),
    },
    {
      icon: "👥",
      label: "All Employees",
      onPress: () => menuNav(() => navigation.navigate("PayrollEmployeeHome")),
    },
    {
      icon: "🏢",
      label: "Departments",
      onPress: () =>
        menuNav(() => navigation.navigate("PayrollDepartmentHome")),
    },
    {
      icon: "💼",
      label: "Positions",
      onPress: () => menuNav(() => navigation.navigate("PayrollPositionHome")),
    },
    {
      icon: "📊",
      label: "Salary Components",
      onPress: () =>
        menuNav(() => navigation.navigate("PayrollSalaryComponentHome")),
    },
    {
      icon: "🗓️",
      label: "Shift Management",
      onPress: () => menuNav(() => navigation.navigate("PayrollShiftHome")),
    },
  ];

  const PROCESSING_ITEMS = [
    {
      icon: "⚙️",
      label: "Process Payroll",
      onPress: () =>
        menuNav(() =>
          navigation.navigate("PayrollProcessingCreate", undefined),
        ),
    },
    {
      icon: "🧾",
      label: "Payroll History",
      onPress: () =>
        menuNav(() => navigation.navigate("PayrollProcessingHome")),
    },
    {
      icon: "⏱️",
      label: "Attendance",
      onPress: () =>
        menuNav(() => navigation.navigate("PayrollAttendanceHome")),
    },
    {
      icon: "⏰",
      label: "Overtime",
      onPress: () => menuNav(() => navigation.navigate("PayrollOvertimeHome")),
    },
    {
      icon: "💳",
      label: "Salary Advance",
      onPress: () => menuNav(() => navigation.navigate("PayrollSalaryAdvance")),
    },
    {
      icon: "📣",
      label: "Announcements",
      onPress: () =>
        menuNav(() => navigation.navigate("PayrollAnnouncementsHome")),
    },
  ];

  const SETTINGS_ITEMS = [
    {
      icon: "🛠️",
      label: "Payroll Settings",
      onPress: () => menuNav(() => navigation.navigate("PayrollSettings")),
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

      {/* ── Quick-Jump Modal ─────────────────────────────────────────── */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}>
        <Pressable
          style={styles.overlay}
          onPress={() => setMenuVisible(false)}
        />
        <View style={[styles.sheet, { maxHeight: screenHeight * 0.85 }]}>
          <View style={styles.handle} />
          <Text style={styles.sheetHeading}>Payroll Quick Actions</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            style={styles.sheetScroll}>
            <Text style={styles.sectionLabel}>Employee Management</Text>
            {EMPLOYEE_ITEMS.map((item) => (
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

            <Text style={styles.sectionLabel}>Payroll Processing</Text>
            {PROCESSING_ITEMS.map((item) => (
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

            <Text style={styles.sectionLabel}>Settings</Text>
            {SETTINGS_ITEMS.map((item) => (
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
          </ScrollView>

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
  /* ── Header bar ── */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  backArrow: {
    fontSize: 30,
    lineHeight: 30,
    color: "rgba(164,212,255,0.85)",
  },
  backLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(164,212,255,0.85)",
    marginLeft: 2,
  },
  headerMid: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
  },
  dotsBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.85)",
  },

  /* ── Bottom sheet ── */
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d1d5db",
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetScroll: {
    flexGrow: 0,
  },
  sheetHeading: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1a0f33",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9ca3af",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 12,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f3f4f6",
  },
  rowIcon: {
    fontSize: 18,
    width: 32,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },
  rowChevron: {
    fontSize: 20,
    color: "#d1b05e",
    fontWeight: "700",
  },
  closeBtn: {
    marginTop: 22,
    backgroundColor: "#1a0f33",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#d1b05e",
  },
});
