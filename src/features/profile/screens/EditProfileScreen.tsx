import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import { useProfile, useUpdateProfile, useRemoveAvatar } from "../hooks/useProfile";

type Props = NativeStackScreenProps<ProfileStackParamList, "ProfileEdit">;

export default function EditProfileScreen({ navigation }: Props) {
  const { profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const removeAvatar = useRemoveAvatar();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | undefined>();
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setPreviewUri(profile.avatar_url || null);
    }
  }, [profile]);

  const originalEmail = profile?.email || "";

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
        Alert.alert("File too large", "Avatar must be under 2MB.");
        return;
      }
      setAvatarUri(asset.uri);
      setPreviewUri(asset.uri);
    }
  };

  const handleRemoveAvatar = () => {
    Alert.alert("Remove Avatar", "Are you sure you want to remove your photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          removeAvatar.mutate(undefined, {
            onSuccess: () => {
              setPreviewUri(null);
              setAvatarUri(undefined);
            },
          });
        },
      },
    ]);
  };

  const handleSave = () => {
    const payload: { name?: string; email?: string; phone?: string } = {};
    if (name.trim() && name !== profile?.name) payload.name = name.trim();
    if (email.trim() && email !== profile?.email) payload.email = email.trim();
    if (phone !== (profile?.phone || "")) payload.phone = phone.trim();

    if (Object.keys(payload).length === 0 && !avatarUri) {
      navigation.goBack();
      return;
    }

    if (payload.email && payload.email !== originalEmail) {
      Alert.alert(
        "Email Change",
        "Changing your email will require re-verification. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: () => doSave(payload),
          },
        ],
      );
    } else {
      doSave(payload);
    }
  };

  const doSave = (payload: { name?: string; email?: string; phone?: string }) => {
    updateProfile.mutate(
      { data: payload, avatarUri },
      { onSuccess: () => navigation.goBack() },
    );
  };

  const avatarLetter = (name || profile?.name)?.charAt(0).toUpperCase() || "U";

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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            {previewUri ? (
              <Image source={{ uri: previewUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>{avatarLetter}</Text>
              </View>
            )}
            <View style={styles.avatarActions}>
              <TouchableOpacity style={styles.avatarBtn} onPress={pickImage}>
                <Text style={styles.avatarBtnText}>📷 Change Photo</Text>
              </TouchableOpacity>
              {profile?.avatar && (
                <TouchableOpacity
                  style={[styles.avatarBtn, styles.removeAvatarBtn]}
                  onPress={handleRemoveAvatar}>
                  <Text style={styles.removeAvatarBtnText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formCard}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#9ca3af"
              autoCapitalize="words"
            />

            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {email !== originalEmail && email.trim() !== "" && (
              <Text style={styles.emailWarning}>
                ⚠️ Changing email will require re-verification
              </Text>
            )}

            <Text style={styles.fieldLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+234..."
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              (updateProfile.isPending || removeAvatar.isPending) && styles.saveBtnDisabled,
            ]}
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={updateProfile.isPending || removeAvatar.isPending}>
            <Text style={styles.saveBtnText}>
              {updateProfile.isPending ? "Saving…" : "Save Changes"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  bodyContent: { paddingTop: 4 },

  avatarSection: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: BRAND_COLORS.gold,
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: BRAND_COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(209,176,94,0.3)",
  },
  avatarFallbackText: { fontSize: 40, fontWeight: "bold", color: "#1a0f33" },
  avatarActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  avatarBtn: {
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  avatarBtnText: { fontSize: 13, fontWeight: "600", color: "#fff" },
  removeAvatarBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  removeAvatarBtnText: { fontSize: 13, fontWeight: "600", color: "#ef4444" },

  formCard: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1f2937",
  },
  emailWarning: {
    fontSize: 12,
    color: "#d97706",
    marginTop: 6,
  },

  saveBtn: {
    marginHorizontal: 20,
    marginTop: 24,
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
