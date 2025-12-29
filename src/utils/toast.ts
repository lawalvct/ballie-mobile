import { Platform, ToastAndroid, Alert } from "react-native";

export const showToast = (
  message: string,
  type: "success" | "error" | "info" = "info"
) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    // For iOS and web, use Alert
    Alert.alert(
      type === "success" ? "Success" : type === "error" ? "Error" : "Info",
      message,
      [{ text: "OK" }]
    );
  }
};
