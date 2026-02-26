import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS } from "../theme/colors";
import { useAuth } from "../context/AuthContext";

/* ── helpers ── */
const todayFormatted = (): string =>
  new Date().toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

interface ModuleScreenLayoutProps {
  children: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function ModuleScreenLayout({
  children,
  refreshing = false,
  onRefresh,
}: ModuleScreenLayoutProps) {
  const { user, tenant, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[BRAND_COLORS.gold]}
              tintColor={BRAND_COLORS.gold}
              progressBackgroundColor="#2d1f5e"
            />
          ) : undefined
        }>
        {/*  HEADER HERO  */}
        <LinearGradient
          colors={["#1a0f33", "#2d1f5e"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.hero}>
          <View style={styles.headerRow}>
            {/* Company name + date */}
            <View style={styles.headerLeft}>
              <Text style={styles.companyName} numberOfLines={1}>
                {tenant?.name || "Your Business"}
              </Text>
              <Text style={styles.headerDate}>{todayFormatted()}</Text>
            </View>

            {/* Notification + Profile */}
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
                <Text style={styles.bellIcon}>🔔</Text>
                <View style={styles.bellDot} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.avatar}
                onPress={() => setShowDropdown(true)}
                activeOpacity={0.8}>
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/*  BODY  */}
        <View style={styles.body}>
          {children}
          <View style={{ height: 30 }} />
        </View>
      </ScrollView>

      {/*  AVATAR DROPDOWN  */}
      {showDropdown && (
        <Modal
          transparent
          visible={showDropdown}
          animationType="fade"
          onRequestClose={() => setShowDropdown(false)}>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setShowDropdown(false)}>
            <View style={styles.dropdown}>
              <View style={styles.ddHeader}>
                <View style={styles.ddAvatar}>
                  <Text style={styles.ddAvatarText}>{avatarLetter}</Text>
                </View>
                <View style={styles.ddInfo}>
                  <Text style={styles.ddName}>{user?.name || "User"}</Text>
                  <Text style={styles.ddRole}>{user?.role || "Admin"}</Text>
                </View>
              </View>
              <View style={styles.ddDivider} />
              <TouchableOpacity style={styles.ddItem}>
                <Text style={styles.ddItemIcon}>⚙️</Text>
                <Text style={styles.ddItemText}>Profile Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ddItem}
                onPress={() => {
                  setShowDropdown(false);
                  logout();
                }}>
                <Text style={styles.ddItemIcon}>🚪</Text>
                <Text style={styles.ddItemText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  );
}

/*  */
/*  STYLES                                                                     */
/*  */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#1a0f33",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#2d1f5e",
  },

  /* ── Header ── */
  hero: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  headerDate: {
    fontSize: 12,
    color: "rgba(209,176,94,0.85)",
    fontWeight: "500",
    marginTop: 3,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  bellIcon: {
    fontSize: 18,
  },
  bellDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 1.5,
    borderColor: "#2d1f5e",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BRAND_COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a0f33",
  },

  /*  Body  */
  body: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -1,
    paddingTop: 4,
  },

  /*  Avatar dropdown  */
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 80,
    paddingRight: 20,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 14,
    minWidth: 230,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    overflow: "hidden",
  },
  ddHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  ddAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BRAND_COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  ddAvatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  ddInfo: {
    flex: 1,
  },
  ddName: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  ddRole: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  ddDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 16,
  },
  ddItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  ddItemIcon: {
    fontSize: 18,
  },
  ddItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: BRAND_COLORS.darkPurple,
  },
});
