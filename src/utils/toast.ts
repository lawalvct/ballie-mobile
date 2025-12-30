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

export const showConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  options?: {
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
  }
): void => {
  Alert.alert(title, message, [
    {
      text: options?.cancelText || "Cancel",
      style: "cancel",
    },
    {
      text: options?.confirmText || "Confirm",
      style: options?.destructive ? "destructive" : "default",
      onPress: onConfirm,
    },
  ]);
};
