import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiResponse, ApiError } from "./types";

// Use localhost:8000 for dev (adjust for your setup)
// For Android emulator: use 10.0.2.2:8000
// For iOS simulator: use localhost:8000
// For physical device: use your computer's IP address
const API_BASE_URL = __DEV__
  ? "http://10.0.2.2:8000/api/v1" // Android emulator
  : "https://api.ballie.co/api/v1"; // Production

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
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
  }
);

export default apiClient;
