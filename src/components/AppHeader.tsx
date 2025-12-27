import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../theme/colors";
import { useAuth } from "../context/AuthContext";

interface AppHeaderProps {
  businessName?: string;
  userName?: string;
  userRole?: string;
}

export default function AppHeader({
  businessName,
  userName,
  userRole,
}: AppHeaderProps) {
  const { logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const avatarLetter = userName?.charAt(0).toUpperCase() || "U";

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
  };

  return (
    <LinearGradient colors={["#3c2c64", "#4a3570"]} style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.businessName}>
            {businessName || "Your Business"}
          </Text>
        </View>
        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.notificationBell}>
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>
          <View style={styles.userSection}>
            <TouchableOpacity
              style={styles.userAvatar}
              onPress={() => setShowDropdown(!showDropdown)}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </TouchableOpacity>
            <Text style={styles.userRole}>{userRole || "Admin"}</Text>
          </View>
        </View>
      </View>

      {showDropdown && (
        <Modal
          transparent={true}
          visible={showDropdown}
          animationType="fade"
          onRequestClose={() => setShowDropdown(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDropdown(false)}>
            <View style={styles.dropdown}>
              <View style={styles.dropdownHeader}>
                <View style={styles.dropdownAvatar}>
                  <Text style={styles.dropdownAvatarText}>{avatarLetter}</Text>
                </View>
                <View style={styles.dropdownUserInfo}>
                  <Text style={styles.dropdownUserName}>
                    {userName || "User"}
                  </Text>
                  <Text style={styles.dropdownUserRole}>
                    {userRole || "Admin"}
                  </Text>
                </View>
              </View>
              <View style={styles.dropdownDivider} />
              <TouchableOpacity style={styles.dropdownItem}>
                <Text style={styles.dropdownItemIcon}>⚙️</Text>
                <Text style={styles.dropdownItemText}>Profile Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={handleLogout}>
                <Text style={styles.dropdownItemIcon}>🚪</Text>
                <Text style={styles.dropdownItemText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: BRAND_COLORS.lavender,
    marginBottom: 4,
  },
  businessName: {
    fontSize: 24,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationBell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  bellIcon: {
    fontSize: 18,
  },
  userSection: {
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND_COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: SEMANTIC_COLORS.white,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: SEMANTIC_COLORS.white,
  },
  userRole: {
    fontSize: 11,
    color: BRAND_COLORS.lavender,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 80,
    paddingRight: 20,
  },
  dropdown: {
    backgroundColor: SEMANTIC_COLORS.white,
    borderRadius: 12,
    minWidth: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  dropdownAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BRAND_COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
  dropdownUserInfo: {
    flex: 1,
  },
  dropdownUserName: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 2,
  },
  dropdownUserRole: {
    fontSize: 12,
    color: "#6b7280",
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 16,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  dropdownItemIcon: {
    fontSize: 18,
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: BRAND_COLORS.darkPurple,
  },
});
