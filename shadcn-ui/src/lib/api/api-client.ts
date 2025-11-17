// src/lib/api/api-client.ts (UPDATED VERSION)
import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import ENV from "@/lib/config/env";

// Interface untuk standar response dari backend
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// Buat instance axios
const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor - Tambahkan token ke setiap request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(ENV.TOKEN_KEY);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request di development
    if (ENV.IS_DEV) {
      console.log("🚀 API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle error global
apiClient.interceptors.response.use(
  (response) => {
    // Log response di development
    if (ENV.IS_DEV) {
      console.log("✅ API Response:", {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Log error di development
    if (ENV.IS_DEV) {
      console.error("❌ API Error:", {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear token dan redirect ke login
      localStorage.removeItem(ENV.TOKEN_KEY);
      localStorage.removeItem(ENV.USER_KEY);

      // Redirect ke login page
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error("Access forbidden - Insufficient permissions");
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error("Server error - Please try again later");
    }

    // Handle Network Error
    if (!error.response) {
      console.error("Network error - Please check your connection");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export type { ApiResponse };
