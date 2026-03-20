import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  Share,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { EcommerceStackParamList } from "../../../navigation/types";
import { BRAND_COLORS } from "../../../theme/colors";
import EcommerceModuleHeader from "../../../components/ecommerce/EcommerceModuleHeader";
import {
  useEcommerceSettings,
  useUpdateSettings,
  useQrCode,
} from "../hooks/useSettings";
import type { EcommerceSettings } from "../types";

type UploadFile = {
  uri: string;
  name: string;
  type: string;
};

type Nav = NativeStackNavigationProp<EcommerceStackParamList, "EcommerceSettings">;

export default function EcommerceSettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { settings, isLoading, isRefreshing, refresh } = useEcommerceSettings();
  const updateSettings = useUpdateSettings();
  const {
    qrData,
    isRefreshing: isQrRefreshing,
    refresh: refreshQrCode,
  } = useQrCode();

  const [form, setForm] = useState<Partial<EcommerceSettings>>({});
  const [dirty, setDirty] = useState(false);
  const [logoFile, setLogoFile] = useState<UploadFile | null>(null);
  const [bannerFile, setBannerFile] = useState<UploadFile | null>(null);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const updatePayment = (method: string, value: boolean) => {
    setForm((prev) => ({
      ...prev,
      payment_methods: { ...(prev.payment_methods as any), [method]: value },
    }));
    setDirty(true);
  };

  const handleSave = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (
        key === "store_email" ||
        key === "store_phone" ||
        key === "store_address" ||
        key === "store_logo_url" ||
        key === "store_banner_url"
      ) {
        return;
      }

      if (
        key === "payment_methods" &&
        typeof val === "object" &&
        val !== null
      ) {
        Object.entries(val).forEach(([pk, pv]) => {
          fd.append(`payment_methods[${pk}]`, pv ? "1" : "0");
        });
      } else if (typeof val === "boolean") {
        fd.append(key, val ? "1" : "0");
      } else if (val !== null && val !== undefined) {
        fd.append(key, String(val));
      }
    });

    if (logoFile) {
      fd.append("store_logo", logoFile as any);
    }

    if (bannerFile) {
      fd.append("store_banner", bannerFile as any);
    }

    updateSettings.mutate(fd, {
      onSuccess: () => {
        setDirty(false);
        setLogoFile(null);
        setBannerFile(null);
      },
    });
  };

  const pickImage = async (field: "logo" | "banner") => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to upload images.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: field === "logo" ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      const fileName =
        asset.fileName || asset.uri.split("/").pop() || `${field}.jpg`;
      const fileType =
        asset.mimeType || `image/${fileName.split(".").pop() || "jpeg"}`;
      const nextFile = {
        uri: asset.uri,
        name: fileName,
        type: fileType,
      };

      if (field === "logo") {
        setLogoFile(nextFile);
      } else {
        setBannerFile(nextFile);
      }

      setDirty(true);
    } catch (error) {
      Alert.alert("Error", `Unable to select ${field} image right now.`);
    }
  };

  const handleShareStoreUrl = async () => {
    if (!form.store_url) return;

    try {
      await Share.share({
        message: `Shop our store: ${form.store_url}`,
        url: form.store_url,
      });
    } catch (error) {
      Alert.alert("Error", "Unable to share store URL right now.");
    }
  };

  const handleCopyStoreUrl = async () => {
    if (!form.store_url) return;

    try {
      await Share.share({ message: form.store_url });
    } catch (error) {
      Alert.alert("Error", "Unable to copy store URL right now.");
    }
  };

  const handleRefresh = () => {
    refresh();
    refreshQrCode();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
        </View>
      </SafeAreaView>
    );
  }

  const pm = form.payment_methods as any;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <EcommerceModuleHeader
        title="Store Settings"
        onBack={() => navigation.goBack()}
        navigation={navigation}
      />

      <ScrollView
        style={styles.body}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || isQrRefreshing}
            onRefresh={handleRefresh}
            colors={[BRAND_COLORS.gold]}
            tintColor={BRAND_COLORS.gold}
          />
        }>
        {/* Store Enabled */}
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Store Enabled</Text>
            <Switch
              value={!!form.is_store_enabled}
              onValueChange={(v) => update("is_store_enabled", v)}
              trackColor={{ true: "#10b981" }}
            />
          </View>
        </View>

        {/* Store Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Store Information</Text>
          <Text style={styles.label}>Store Logo</Text>
          <View style={styles.uploadBlock}>
            {logoFile?.uri || form.store_logo_url ? (
              <Image
                source={{
                  uri: logoFile?.uri || form.store_logo_url || undefined,
                }}
                style={styles.logoPreview}
              />
            ) : (
              <View style={[styles.imagePlaceholder, styles.logoPreview]}>
                <Text style={styles.imagePlaceholderText}>
                  No logo selected
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickImage("logo")}>
              <Text style={styles.uploadButtonText}>
                {logoFile?.uri || form.store_logo_url
                  ? "Change Logo"
                  : "Upload Logo"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Store Banner</Text>
          <View style={styles.uploadBlock}>
            {bannerFile?.uri || form.store_banner_url ? (
              <Image
                source={{
                  uri: bannerFile?.uri || form.store_banner_url || undefined,
                }}
                style={styles.bannerPreview}
              />
            ) : (
              <View style={[styles.imagePlaceholder, styles.bannerPreview]}>
                <Text style={styles.imagePlaceholderText}>
                  No banner selected
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickImage("banner")}>
              <Text style={styles.uploadButtonText}>
                {bannerFile?.uri || form.store_banner_url
                  ? "Change Banner"
                  : "Upload Banner"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Store Name</Text>
          <TextInput
            style={styles.input}
            value={form.store_name || ""}
            onChangeText={(v) => update("store_name", v)}
          />
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.store_description || ""}
            onChangeText={(v) => update("store_description", v)}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Currency */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Currency</Text>
          <View style={styles.inlineRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Currency Code</Text>
              <TextInput
                style={styles.input}
                value={form.currency || ""}
                onChangeText={(v) => update("currency", v)}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Symbol</Text>
              <TextInput
                style={styles.input}
                value={form.currency_symbol || ""}
                onChangeText={(v) => update("currency_symbol", v)}
              />
            </View>
          </View>
        </View>

        {/* Tax */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tax & Shipping</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Tax Enabled</Text>
            <Switch
              value={form.tax_enabled ?? false}
              onValueChange={(v) => update("tax_enabled", v)}
              trackColor={{ true: BRAND_COLORS.gold }}
            />
          </View>
          {form.tax_enabled && (
            <>
              <Text style={styles.label}>Tax Name</Text>
              <TextInput
                style={styles.input}
                value={form.tax_name || ""}
                onChangeText={(v) => update("tax_name", v)}
              />
              <Text style={styles.label}>Tax Rate (%)</Text>
              <TextInput
                style={styles.input}
                value={String(form.tax_rate ?? "")}
                onChangeText={(v) => update("tax_rate", parseFloat(v) || 0)}
                keyboardType="decimal-pad"
              />
            </>
          )}
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Shipping Enabled</Text>
            <Switch
              value={form.shipping_enabled ?? false}
              onValueChange={(v) => update("shipping_enabled", v)}
              trackColor={{ true: BRAND_COLORS.gold }}
            />
          </View>
          <Text style={styles.label}>Free Shipping Threshold</Text>
          <TextInput
            style={styles.input}
            value={String(form.free_shipping_threshold ?? "")}
            onChangeText={(v) =>
              update("free_shipping_threshold", parseFloat(v) || null)
            }
            keyboardType="decimal-pad"
            placeholder="Leave empty for no free shipping"
            placeholderTextColor="#9ca3af"
          />
          <Text style={styles.label}>Minimum Order Amount</Text>
          <TextInput
            style={styles.input}
            value={String(form.minimum_order_amount ?? "")}
            onChangeText={(v) =>
              update("minimum_order_amount", parseFloat(v) || null)
            }
            keyboardType="decimal-pad"
            placeholder="Leave empty for no minimum"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Payment Methods */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          {pm &&
            Object.entries(pm).map(([key, val]) => (
              <View key={key} style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  {key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </Text>
                <Switch
                  value={!!val}
                  onValueChange={(v) => updatePayment(key, v)}
                  trackColor={{ true: BRAND_COLORS.gold }}
                />
              </View>
            ))}
        </View>

        {/* Checkout Options */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Checkout Options</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Guest Checkout</Text>
            <Switch
              value={form.enable_guest_checkout ?? false}
              onValueChange={(v) => update("enable_guest_checkout", v)}
              trackColor={{ true: BRAND_COLORS.gold }}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Customer Registration</Text>
            <Switch
              value={form.enable_customer_registration ?? false}
              onValueChange={(v) => update("enable_customer_registration", v)}
              trackColor={{ true: BRAND_COLORS.gold }}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Auto-confirm Orders</Text>
            <Switch
              value={form.auto_confirm_orders ?? false}
              onValueChange={(v) => update("auto_confirm_orders", v)}
              trackColor={{ true: BRAND_COLORS.gold }}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Order Notifications</Text>
            <Switch
              value={form.enable_order_notifications ?? false}
              onValueChange={(v) => update("enable_order_notifications", v)}
              trackColor={{ true: BRAND_COLORS.gold }}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Maintenance Mode</Text>
            <Switch
              value={form.maintenance_mode ?? false}
              onValueChange={(v) => update("maintenance_mode", v)}
              trackColor={{ true: "#ef4444" }}
            />
          </View>
        </View>

        {/* QR Code */}
        {qrData && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Store QR Code</Text>
            <Text style={styles.metaText}>Store URL: {qrData.store_url}</Text>
            <Text style={[styles.metaText, { marginTop: 4 }]}>
              Share QR code to let customers find your store
            </Text>
          </View>
        )}

        {/* Store URL */}
        {form.store_url && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Store URL</Text>
            <Text style={styles.urlText}>{form.store_url}</Text>
            <View style={styles.urlActions}>
              <TouchableOpacity
                onPress={handleShareStoreUrl}
                style={[styles.urlActionButton, styles.urlShareButton]}>
                <Text style={styles.urlShareButtonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCopyStoreUrl}
                style={[styles.urlActionButton, styles.urlCopyButton]}>
                <Text style={styles.urlCopyButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={handleSave}
          disabled={!dirty || updateSettings.isPending}
          style={[styles.saveButton, !dirty && { opacity: 0.5 }]}>
          <LinearGradient
            colors={[BRAND_COLORS.gold, "#b8962e"]}
            style={styles.saveGradient}>
            {updateSettings.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a0f33" },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { width: 60 },
  backText: { color: BRAND_COLORS.gold, fontSize: 17, fontWeight: "600" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  saveButton: { marginTop: 8, borderRadius: 12, overflow: "hidden" },
  saveGradient: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 12,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  body: { flex: 1, backgroundColor: "#f3f4f8", padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
    marginTop: 10,
  },
  uploadBlock: {
    marginTop: 4,
  },
  uploadButton: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BRAND_COLORS.gold,
    backgroundColor: "#fff8e6",
    paddingVertical: 12,
    alignItems: "center",
  },
  uploadButtonText: {
    color: BRAND_COLORS.darkPurple,
    fontSize: 14,
    fontWeight: "700",
  },
  logoPreview: {
    width: 84,
    height: 84,
    borderRadius: 12,
  },
  bannerPreview: {
    width: "100%",
    height: 140,
    borderRadius: 12,
  },
  imagePlaceholder: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "500",
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
  },
  textArea: { height: 80, textAlignVertical: "top", paddingTop: 10 },
  inlineRow: { flexDirection: "row" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  switchLabel: { fontSize: 14, color: "#374151", flex: 1 },
  metaText: { fontSize: 13, color: "#6b7280" },
  urlText: { fontSize: 14, color: BRAND_COLORS.darkPurple, fontWeight: "500" },
  urlActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  urlActionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  urlShareButton: {
    backgroundColor: BRAND_COLORS.darkPurple,
    borderColor: BRAND_COLORS.darkPurple,
  },
  urlCopyButton: {
    backgroundColor: "#fff8e6",
    borderColor: BRAND_COLORS.gold,
  },
  urlShareButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  urlCopyButtonText: {
    color: BRAND_COLORS.darkPurple,
    fontSize: 14,
    fontWeight: "700",
  },
});
