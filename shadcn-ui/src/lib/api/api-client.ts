import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// Create axios instance
const apiClient = axios.create({
  baseURL: "https://ksp.gascpns.id/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // Add timeout
  timeout: 30000,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`,
      {
        params: config.params,
        data: config.data,
      }
    );

    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(
      `✅ API Response: ${response.config.method?.toUpperCase()} ${
        response.config.url
      }`,
      {
        status: response.status,
        data: response.data,
      }
    );

    // Handle 204 No Content
    if (response.status === 204) {
      console.warn("⚠️ 204 No Content received");
      return {
        ...response,
        data: {
          success: true,
          data: [],
          message: "No content",
        },
      };
    }

    // Return response data directly
    return response;
  },
  async (error: AxiosError) => {
    console.error("❌ Response Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Handle 401 Unauthorized - Redirect to login
    if (error.response?.status === 401) {
      console.warn("⚠️ Unauthorized - Redirecting to login");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error("❌ Forbidden - Insufficient permissions");
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error("❌ Not Found - Endpoint does not exist");
    }

    // Handle 422 Validation Error
    if (error.response?.status === 422) {
      console.error("❌ Validation Error:", error.response.data);
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error("❌ Server Error");
    }

    // Format error for easier handling
    const formattedError = {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    };

    return Promise.reject(formattedError);
  }
);

export default apiClient;
