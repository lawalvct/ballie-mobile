import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompanySettingsStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import {
  useCompanySettings,
  useUploadLogo,
  useRemoveLogo,
} from "../hooks/useCompanySettings";

type Props = NativeStackScreenProps<CompanySettingsStackParamList, "Branding">;

export default function BrandingScreen({ navigation }: Props) {
  const { data, isLoading } = useCompanySettings();
  const uploadLogo = useUploadLogo();
  const removeLogo = useRemoveLogo();

  const logoUrl = data?.branding?.logo ?? null;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
        Alert.alert("File too large", "Logo must be under 2MB.");
        return;
      }
      uploadLogo.mutate(asset.uri);
    }
  };

  const handleRemove = () => {
    Alert.alert("Remove Logo", "Are you sure you want to remove the company logo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeLogo.mutate(undefined),
      },
    ]);
  };

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
        <Text style={styles.headerTitle}>Logo & Branding</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <View style={styles.body}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={BRAND_COLORS.gold}
            style={{ marginTop: 60 }}
          />
        ) : (
          <View style={styles.content}>
            {/* Logo Preview */}
            <View style={styles.logoContainer}>
              {logoUrl ? (
                <Image source={{ uri: logoUrl }} style={styles.logoImage} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoPlaceholderEmoji}>🏢</Text>
                  <Text style={styles.logoPlaceholderText}>No logo uploaded</Text>
                </View>
              )}
            </View>

            <Text style={styles.hint}>
              Max 2MB · Recommended 400×400px{"\n"}Accepted: JPEG, PNG, JPG, GIF, SVG
            </Text>

            {/* Actions */}
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                (uploadLogo.isPending || removeLogo.isPending) && styles.btnDisabled,
              ]}
              activeOpacity={0.85}
              onPress={pickImage}
              disabled={uploadLogo.isPending || removeLogo.isPending}>
              <Text style={styles.primaryBtnText}>
                {uploadLogo.isPending
                  ? "Uploading…"
                  : logoUrl
                    ? "📷 Change Logo"
                    : "📷 Upload Logo"}
              </Text>
            </TouchableOpacity>

            {logoUrl && (
              <TouchableOpacity
                style={[
                  styles.removeBtn,
                  (uploadLogo.isPending || removeLogo.isPending) && styles.btnDisabled,
                ]}
                activeOpacity={0.85}
                onPress={handleRemove}
                disabled={uploadLogo.isPending || removeLogo.isPending}>
                <Text style={styles.removeBtnText}>
                  {removeLogo.isPending ? "Removing…" : "Remove Logo"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
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
  content: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 32,
  },

  logoContainer: {
    width: 200,
    height: 200,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  logoImage: { width: 200, height: 200, borderRadius: 20 },
  logoPlaceholder: { alignItems: "center" },
  logoPlaceholderEmoji: { fontSize: 56, marginBottom: 10 },
  logoPlaceholderText: { fontSize: 13, color: "#9ca3af" },

  hint: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 20,
    marginBottom: 28,
  },

  primaryBtn: {
    width: "100%",
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
  primaryBtnText: { fontSize: 16, fontWeight: "700", color: "#1a0f33" },

  removeBtn: {
    width: "100%",
    marginTop: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  removeBtnText: { fontSize: 16, fontWeight: "600", color: "#ef4444" },

  btnDisabled: { opacity: 0.5 },
});
