import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiResponse, ApiError } from "./types";

// API Base URL Configuration
// IMPORTANT: Use your computer's LOCAL NETWORK IP address, NOT localhost/127.0.0.1
//
// Your computer's IP addresses (run 'ipconfig' in terminal to find yours):
// - Wi-Fi: 10.75.201.104 (most common for development)
// - Ethernet: 192.168.56.1
//
// Development IP addresses by platform:
// - Android Emulator: Use your computer's IP (e.g., 10.75.201.104)
// - iOS Simulator: Use localhost (127.0.0.1) or your computer's IP
// - Physical Device: Use your computer's IP (must be on same Wi-Fi network)
//
// Make sure your backend server accepts connections from your IP address
// and that your firewall allows the connection on port 8000

// const API_BASE_URL = __DEV__
//   ? "http://10.75.201.104:8000/api/v1" // Your computer's Wi-Fi IP address
//   : "https://ballie.co/api/v1"; // Production

// Alternative configurations (uncomment the one you need):
// const API_BASE_URL = __DEV__ ? "http://192.168.56.1:8000/api/v1" : "https://ballie.co/api/v1"; // Ethernet IP
// const API_BASE_URL = __DEV__ ? "http://127.0.0.1:8000/api/v1" : "https://ballie.co/api/v1"; // Localhost (iOS Simulator only)

const API_BASE_URL = "https://ballie.co/api/v1"; // Production

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor - Add auth token and tenant slug
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem("auth_token");
    const tenantSlug = await AsyncStorage.getItem("tenant_slug");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add tenant slug to URL path (only if not already present)
    if (tenantSlug && config.url && !config.url.startsWith("/tenant/")) {
      // Prepend /tenant/{slug} to all API paths
      config.url = `/tenant/${tenantSlug}${config.url}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Token expired - logout user
      await AsyncStorage.multiRemove([
        "auth_token",
        "user_data",
        "tenant_slug",
        "tenant_id",
      ]);
      // Navigate to login (implement with navigation ref)
    }
    return Promise.reject(error.response?.data || error.message);
  },
);

export default apiClient;
