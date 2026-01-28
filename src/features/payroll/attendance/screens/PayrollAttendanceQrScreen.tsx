import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Platform,
  Image,
  Modal,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SvgXml } from "react-native-svg";
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { attendanceService } from "../services/attendanceService";
import type { AttendanceQrCodeResponse } from "../types";
import { showToast } from "../../../../utils/toast";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollAttendanceQr"
>;

const formatDate = (date: Date) => date.toISOString().split("T")[0];
const getQrPayload = (payload?: string) => payload?.trim();

const getQrXml = (payload?: string) => {
  const value = payload?.trim();
  if (!value) {
    return undefined;
  }

  if (value.startsWith("<?xml")) {
    const svgStart = value.indexOf("<svg");
    if (svgStart !== -1) {
      return value.slice(svgStart);
    }
  }

  if (value.startsWith("<svg")) {
    return value;
  }

  if (value.startsWith("data:image/svg+xml")) {
    const commaIndex = value.indexOf(",");
    if (commaIndex !== -1) {
      const data = value.slice(commaIndex + 1);
      try {
        const decoded =
          data.includes("%3C") || data.includes("%3E")
            ? decodeURIComponent(data)
            : data;
        if (
          decoded.trim().startsWith("<svg") ||
          decoded.trim().startsWith("<?xml")
        ) {
          return decoded;
        }
      } catch {
        return undefined;
      }
    }
  }

  return undefined;
};

const getQrImageSource = (payload?: string) => {
  const value = payload?.trim();
  if (!value) {
    return undefined;
  }

  const svgXml = getQrXml(value);
  if (svgXml) {
    return {
      uri: `data:image/svg+xml;utf8,${encodeURIComponent(svgXml)}`,
    };
  }

  if (value.startsWith("data:image/")) {
    return { uri: value };
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return { uri: value };
  }

  return undefined;
};

const getQrServerSource = (payload?: string) => {
  const value = payload?.trim();
  if (!value) {
    return undefined;
  }

  if (value.length > 1500) {
    return undefined;
  }

  const encoded = encodeURIComponent(value);
  return {
    uri: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encoded}`,
  };
};

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function PayrollAttendanceQrScreen({ navigation }: Props) {
  const [date, setDate] = useState(formatDate(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clockInImageError, setClockInImageError] = useState(false);
  const [clockOutImageError, setClockOutImageError] = useState(false);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomTitle, setZoomTitle] = useState<string | null>(null);
  const [zoomPayload, setZoomPayload] = useState<string | null>(null);
  const [clockInQr, setClockInQr] = useState<AttendanceQrCodeResponse | null>(
    null,
  );
  const [clockOutQr, setClockOutQr] = useState<AttendanceQrCodeResponse | null>(
    null,
  );

  useEffect(() => {
    loadQrCodes();
  }, [date]);

  const loadQrCodes = async () => {
    try {
      setLoading(true);
      setClockInImageError(false);
      setClockOutImageError(false);
      const [clockIn, clockOut] = await Promise.all([
        attendanceService.getQrCode("clock_in", date),
        attendanceService.getQrCode("clock_out", date),
      ]);
      setClockInQr(clockIn);
      setClockOutQr(clockOut);
    } catch (error: any) {
      showToast(error.message || "Failed to load QR codes", "error");
    } finally {
      setLoading(false);
    }
  };

  const openZoom = (title: string, payload?: string) => {
    if (!payload?.trim()) {
      showToast("QR payload unavailable", "error");
      return;
    }
    setZoomTitle(title);
    setZoomPayload(payload);
    setZoomVisible(true);
  };

  const handleShare = async (payload?: string) => {
    const value = payload?.trim();
    if (!value) {
      showToast("QR payload unavailable", "error");
      return;
    }

    try {
      const sharingAvailable = await Sharing.isAvailableAsync();
      if (!sharingAvailable) {
        showToast("Sharing is not available on this device", "error");
        return;
      }

      if (value.startsWith("data:image/")) {
        await Sharing.shareAsync(value);
        return;
      }

      if (value.startsWith("http://") || value.startsWith("https://")) {
        await Sharing.shareAsync(value);
        return;
      }

      const svgXml = getQrXml(value) ?? value;
      const fileUri = `${FileSystem.cacheDirectory}attendance-qr-${Date.now()}.svg`;
      const encoding = (FileSystem as any)?.EncodingType?.UTF8 ?? "utf8";
      await FileSystem.writeAsStringAsync(fileUri, svgXml, { encoding });
      await Sharing.shareAsync(fileUri);
    } catch (error: any) {
      showToast(error?.message || "Failed to share QR code", "error");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_COLORS.darkPurple}
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance QR</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.filtersSection}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateButtonText}>{date}</Text>
            <Text style={styles.calendarIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BRAND_COLORS.gold} />
            <Text style={styles.loadingText}>Loading QR codes...</Text>
          </View>
        ) : (
          <View style={styles.qrSection}>
            <View style={styles.qrCard}>
              <Text style={styles.qrTitle}>Clock In</Text>
              <Text style={styles.qrSubtitle}>
                Expires: {clockInQr?.expires_at || "N/A"}
              </Text>
              <TouchableOpacity
                style={styles.qrBox}
                activeOpacity={0.8}
                onPress={() => openZoom("Clock In", clockInQr?.qr_code)}>
                {getQrXml(clockInQr?.qr_code) ? (
                  <SvgXml
                    xml={getQrXml(clockInQr?.qr_code) as string}
                    width={200}
                    height={200}
                  />
                ) : getQrImageSource(clockInQr?.qr_code) ? (
                  <Image
                    source={getQrImageSource(clockInQr?.qr_code)}
                    style={styles.qrImage}
                    resizeMode="contain"
                    onError={() => setClockInImageError(true)}
                  />
                ) : getQrPayload(clockInQr?.qr_code) && !clockInImageError ? (
                  getQrServerSource(clockInQr?.qr_code) ? (
                    <Image
                      source={getQrServerSource(clockInQr?.qr_code)}
                      style={styles.qrImage}
                      resizeMode="contain"
                      onError={() => setClockInImageError(true)}
                    />
                  ) : (
                    <Text style={styles.qrPayloadText} numberOfLines={6}>
                      QR payload too long to render as image
                    </Text>
                  )
                ) : (
                  <Text style={styles.qrPayloadText} numberOfLines={6}>
                    {clockInImageError
                      ? "Failed to load QR image"
                      : "QR payload unavailable"}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => handleShare(clockInQr?.qr_code)}>
                <Text style={styles.shareButtonText}>Share QR</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.qrCard}>
              <Text style={styles.qrTitle}>Clock Out</Text>
              <Text style={styles.qrSubtitle}>
                Expires: {clockOutQr?.expires_at || "N/A"}
              </Text>
              <TouchableOpacity
                style={styles.qrBox}
                activeOpacity={0.8}
                onPress={() => openZoom("Clock Out", clockOutQr?.qr_code)}>
                {getQrXml(clockOutQr?.qr_code) ? (
                  <SvgXml
                    xml={getQrXml(clockOutQr?.qr_code) as string}
                    width={200}
                    height={200}
                  />
                ) : getQrImageSource(clockOutQr?.qr_code) ? (
                  <Image
                    source={getQrImageSource(clockOutQr?.qr_code)}
                    style={styles.qrImage}
                    resizeMode="contain"
                    onError={() => setClockOutImageError(true)}
                  />
                ) : getQrPayload(clockOutQr?.qr_code) && !clockOutImageError ? (
                  getQrServerSource(clockOutQr?.qr_code) ? (
                    <Image
                      source={getQrServerSource(clockOutQr?.qr_code)}
                      style={styles.qrImage}
                      resizeMode="contain"
                      onError={() => setClockOutImageError(true)}
                    />
                  ) : (
                    <Text style={styles.qrPayloadText} numberOfLines={6}>
                      QR payload too long to render as image
                    </Text>
                  )
                ) : (
                  <Text style={styles.qrPayloadText} numberOfLines={6}>
                    {clockOutImageError
                      ? "Failed to load QR image"
                      : "QR payload unavailable"}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => handleShare(clockOutQr?.qr_code)}>
                <Text style={styles.shareButtonText}>Share QR</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {showDatePicker && (
          <DateTimePicker
            value={date ? new Date(date) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_event, selectedDate) => {
              setShowDatePicker(Platform.OS === "ios");
              if (selectedDate) {
                setDate(formatDate(selectedDate));
              }
            }}
          />
        )}

        <Modal
          visible={zoomVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setZoomVisible(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{zoomTitle || "QR Code"}</Text>
                <TouchableOpacity
                  onPress={() => setZoomVisible(false)}
                  style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalQrBox}>
                {getQrXml(zoomPayload || undefined) ? (
                  <SvgXml
                    xml={getQrXml(zoomPayload || undefined) as string}
                    width={screenWidth - 80}
                    height={screenWidth - 80}
                  />
                ) : getQrImageSource(zoomPayload || undefined) ? (
                  <Image
                    source={getQrImageSource(zoomPayload || undefined)}
                    style={styles.modalQrImage}
                    resizeMode="contain"
                  />
                ) : getQrPayload(zoomPayload || undefined) ? (
                  getQrServerSource(zoomPayload || undefined) ? (
                    <Image
                      source={getQrServerSource(zoomPayload || undefined)}
                      style={styles.modalQrImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.qrPayloadText} numberOfLines={6}>
                      QR payload too long to render as image
                    </Text>
                  )
                ) : (
                  <Text style={styles.qrPayloadText}>
                    QR payload unavailable
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.modalShareButton}
                onPress={() => handleShare(zoomPayload || undefined)}>
                <Text style={styles.modalShareText}>Share QR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: SEMANTIC_COLORS.white,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: SEMANTIC_COLORS.white,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  filtersSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 6,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateButtonText: {
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  calendarIcon: {
    fontSize: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BRAND_COLORS.darkPurple,
  },
  qrSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  qrCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 4,
  },
  qrSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 12,
  },
  qrBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  qrImage: {
    width: 180,
    height: 180,
    backgroundColor: "#f0f0f0",
  },
  qrPayloadText: {
    fontSize: 11,
    color: "#374151",
  },
  shareButton: {
    marginTop: 12,
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  shareButtonText: {
    color: SEMANTIC_COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  modalCloseButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  modalCloseText: {
    color: BRAND_COLORS.darkPurple,
    fontWeight: "600",
  },
  modalQrBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  modalQrImage: {
    width: screenWidth - 80,
    height: screenWidth - 80,
  },
  modalShareButton: {
    marginTop: 16,
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalShareText: {
    color: BRAND_COLORS.darkPurple,
    fontSize: 14,
    fontWeight: "700",
  },
});
