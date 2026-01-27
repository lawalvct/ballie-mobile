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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { PayrollStackParamList } from "../../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../../theme/colors";
import { attendanceService } from "../services/attendanceService";
import type { AttendanceQrCodeResponse } from "../types";
import { showToast } from "../../../../utils/toast";

type Props = NativeStackScreenProps<
  PayrollStackParamList,
  "PayrollAttendanceQr"
>;

const formatDate = (date: Date) => date.toISOString().split("T")[0];

export default function PayrollAttendanceQrScreen({ navigation }: Props) {
  const [date, setDate] = useState(formatDate(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
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
              <View style={styles.qrBox}>
                <Text style={styles.qrPayloadText} numberOfLines={6}>
                  {clockInQr?.qr_code || "QR payload unavailable"}
                </Text>
              </View>
            </View>

            <View style={styles.qrCard}>
              <Text style={styles.qrTitle}>Clock Out</Text>
              <Text style={styles.qrSubtitle}>
                Expires: {clockOutQr?.expires_at || "N/A"}
              </Text>
              <View style={styles.qrBox}>
                <Text style={styles.qrPayloadText} numberOfLines={6}>
                  {clockOutQr?.qr_code || "QR payload unavailable"}
                </Text>
              </View>
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
  },
  qrPayloadText: {
    fontSize: 11,
    color: "#374151",
  },
});
