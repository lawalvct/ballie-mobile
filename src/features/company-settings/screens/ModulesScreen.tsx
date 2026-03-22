import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompanySettingsStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import {
  useCompanySettings,
  useUpdateModules,
  useResetModules,
} from "../hooks/useCompanySettings";
import type { ModuleKey, AppModule } from "../types";

type Props = NativeStackScreenProps<CompanySettingsStackParamList, "Modules">;

const MODULE_EMOJIS: Record<string, string> = {
  dashboard: "📊",
  accounting: "🧮",
  inventory: "📦",
  crm: "👥",
  pos: "💳",
  ecommerce: "🛒",
  payroll: "💰",
  procurement: "🚚",
  banking: "🏦",
  projects: "📐",
  reports: "📈",
  statutory: "📄",
  audit: "🔍",
  admin: "🛡️",
  settings: "⚙️",
  support: "🎧",
  help: "❓",
};

export default function ModulesScreen({ navigation }: Props) {
  const { data, isLoading } = useCompanySettings();
  const updateModules = useUpdateModules();
  const resetModules = useResetModules();

  const [enabledKeys, setEnabledKeys] = useState<Set<ModuleKey>>(new Set());
  const [modules, setModules] = useState<AppModule[]>([]);

  useEffect(() => {
    if (data?.modules) {
      setModules(data.modules);
      const enabled = new Set<ModuleKey>();
      data.modules.forEach((m) => {
        if (m.enabled) enabled.add(m.key);
      });
      setEnabledKeys(enabled);
    }
  }, [data?.modules]);

  const enabledCount = enabledKeys.size;
  const totalCount = modules.length;

  const toggleModule = (key: ModuleKey, core: boolean) => {
    if (core) return;
    setEnabledKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSave = () => {
    updateModules.mutate(Array.from(enabledKeys), {
      onSuccess: () => navigation.goBack(),
    });
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Modules",
      `Reset all modules to the recommended defaults for your "${data?.business_category ?? "trading"}" business category?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => resetModules.mutate(undefined),
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar style="light" />
        <LinearGradient colors={["#1a0f33", "#2d1f5e"]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Module Management</Text>
          <View style={{ width: 36 }} />
        </LinearGradient>
        <View style={[styles.body, { alignItems: "center", paddingTop: 60 }]}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#1a0f33", "#2d1f5e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Module Management</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}>
        {/* Counter */}
        <View style={styles.counterCard}>
          <Text style={styles.counterNum}>{enabledCount}</Text>
          <Text style={styles.counterLabel}>of {totalCount} modules enabled</Text>
        </View>

        {/* Module List */}
        {modules.map((mod) => {
          const isEnabled = enabledKeys.has(mod.key);
          return (
            <View key={mod.key} style={styles.moduleRow}>
              <Text style={styles.moduleEmoji}>
                {MODULE_EMOJIS[mod.key] ?? "📌"}
              </Text>
              <View style={styles.moduleInfo}>
                <View style={styles.moduleNameRow}>
                  <Text style={styles.moduleName}>{mod.name}</Text>
                  {mod.core && (
                    <View style={styles.coreBadge}>
                      <Text style={styles.coreBadgeText}>Core</Text>
                    </View>
                  )}
                  {mod.recommended && !mod.core && (
                    <View style={styles.recBadge}>
                      <Text style={styles.recBadgeText}>Recommended</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.moduleDesc} numberOfLines={1}>
                  {mod.description}
                </Text>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={() => toggleModule(mod.key, mod.core)}
                disabled={mod.core}
                trackColor={{ false: "#d1d5db", true: BRAND_COLORS.gold }}
                thumbColor={isEnabled ? "#fff" : "#f4f3f4"}
              />
            </View>
          );
        })}

        {/* Reset to Defaults */}
        <TouchableOpacity
          style={styles.resetBtn}
          activeOpacity={0.7}
          onPress={handleReset}
          disabled={resetModules.isPending}>
          <Text style={styles.resetBtnText}>
            {resetModules.isPending ? "Resetting…" : "Reset to Defaults"}
          </Text>
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, updateModules.isPending && styles.saveBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={updateModules.isPending}>
          <Text style={styles.saveBtnText}>
            {updateModules.isPending ? "Saving…" : "Save Changes"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1a0f33" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 32, color: "#fff", marginTop: -4 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },

  body: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -1,
  },
  bodyContent: { paddingTop: 24, paddingHorizontal: 20 },

  counterCard: {
    backgroundColor: BRAND_COLORS.darkPurple,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 18,
  },
  counterNum: { fontSize: 28, fontWeight: "800", color: BRAND_COLORS.gold },
  counterLabel: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 },

  moduleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  moduleEmoji: { fontSize: 22, marginRight: 14 },
  moduleInfo: { flex: 1 },
  moduleNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  moduleName: { fontSize: 15, fontWeight: "600", color: "#1f2937" },
  moduleDesc: { fontSize: 12, color: "#6b7280" },

  coreBadge: {
    backgroundColor: "rgba(60,44,100,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  coreBadgeText: { fontSize: 10, fontWeight: "700", color: BRAND_COLORS.darkPurple },

  recBadge: {
    backgroundColor: "rgba(209,176,94,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recBadgeText: { fontSize: 10, fontWeight: "700", color: "#b8941e" },

  resetBtn: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  resetBtnText: { fontSize: 14, fontWeight: "600", color: "#6b7280" },

  saveBtn: {
    marginTop: 14,
    backgroundColor: BRAND_COLORS.gold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: "#1a0f33" },
});
