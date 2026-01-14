// src/lib/api/auth.service.ts
import apiClient, { ApiResponse } from "./api-client";

// Interface untuk User dari backend
export interface User {
  id: number;
  full_name: string;
  employee_id: string;
  email: string;
  role:
    | "admin"
    | "manager"
    | "anggota"
    | "admin_kas_1"
    | "admin_kas_2"
    | "admin_kas_3"
    | "admin_kas_4";
  is_active: boolean;
  phone_number?: string;
  address?: string;
  work_unit?: string;
  position?: string;
  joined_at?: string;
  created_at?: string;
  kas_id?: number; // untuk admin kas (frontend preference)
  cash_account_id?: number; // ✅ Backend field (actual from API)
}

// Interface untuk Login Request
export interface LoginRequest {
  email: string;
  password: string;
}

// Interface untuk Login Response
export interface LoginResponse {
  user: User;
  token: string;
  token_type: string;
  expires_in: number;
}

// Interface untuk Register Request
export interface RegisterRequest {
  full_name: string;
  employee_id: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone_number?: string;
  address?: string;
  work_unit?: string;
  position?: string;
}

// Interface untuk Register Response
export interface RegisterResponse {
  user: User;
  token: string;
  token_type: string;
  expires_in: number;
}

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        "/auth/login",
        credentials
      );

      if (response.data.success) {
        // Simpan token ke localStorage
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));

        return response.data.data;
      }

      throw new Error(response.data.message || "Login failed");
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle specific error messages dari backend
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Login gagal. Silakan cek email dan password Anda.");
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<ApiResponse<RegisterResponse>>(
        "/auth/register",
        userData
      );

      if (response.data.success) {
        // Simpan token ke localStorage
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));

        return response.data.data;
      }

      throw new Error(response.data.message || "Registration failed");
    } catch (error: any) {
      console.error("Registration error:", error);

      // Handle validation errors dari backend
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        throw new Error(
          Array.isArray(firstError) ? firstError[0] : "Registration failed"
        );
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Registrasi gagal. Silakan coba lagi.");
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post<ApiResponse<null>>("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Selalu hapus token dan user data dari localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>("/auth/me");

      if (response.data.success) {
        // Update user data di localStorage
        localStorage.setItem("user", JSON.stringify(response.data.data));

        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to get user data");
    } catch (error: any) {
      console.error("Get current user error:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Gagal mengambil data user.");
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    return !!(token && user);
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem("token");
  }

  /**
   * Get stored user
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing stored user:", error);
      return null;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
