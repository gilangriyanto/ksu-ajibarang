// src/lib/api/member.service.ts
import apiClient, { ApiResponse } from "./api-client";

// ==================== TYPES ====================

export interface Member {
  id: number;
  employee_id: string;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  formatted_phone?: string;
  address: string | null;
  role: "admin" | "manager" | "anggota";
  status: "active" | "inactive" | "suspended";
  joined_at: string;
  membership_duration?: string;
  membership_status?: string;
  initials?: string;
  created_at: string;
  updated_at: string;
}

export interface MemberProfile {
  id: number;
  employee_id: string;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  formatted_phone: string;
  address: string | null;
  role: string;
  status: string;
  joined_at: string;
  membership_duration: string;
  membership_status: string;
  initials: string;
  created_at: string;
  updated_at: string;
}

export interface MemberDetails {
  profile: MemberProfile;
  financial_summary: {
    savings: {
      total: number;
      principal: number;
      mandatory: number;
      voluntary: number;
      holiday: number;
    };
    loans: {
      active_count: number;
      total_borrowed: number;
      remaining_balance: number;
      monthly_installment: number;
    };
    net_position: number;
  };
  statistics: {
    total_savings_transactions: number;
    total_loans: number;
    active_loans: number;
    completed_loans: number;
  };
}

export interface MemberActivity {
  type: "saving" | "loan";
  id: number;
  date: string;
  description: string;
  amount: number;
  status: string;
}

export interface MemberStatistics {
  total_members: number;
  active_members: number;
  inactive_members: number;
  suspended_members: number;
  new_members_this_month: number;
  members_with_active_loans: number;
  members_with_overdue_payments: number;
}

export interface MemberListParams {
  status?: "active" | "inactive" | "suspended";
  search?: string;
  joined_from?: string;
  joined_to?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
  all?: boolean;
}

export interface UpdateMemberRequest {
  employee_id?: string;
  full_name?: string;
  email?: string | null;
  phone_number?: string;
  address?: string | null;
  status?: "active" | "inactive" | "suspended";
}

export interface ChangePasswordRequest {
  current_password?: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface UpdateStatusRequest {
  status: "active" | "inactive" | "suspended";
  reason?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// ==================== SERVICE ====================

// ✅ UPDATED: Added role field and made employee_id optional
export interface CreateMemberRequest {
  full_name: string;
  email?: string;
  password: string;
  password_confirmation: string;
  phone_number?: string;
  address?: string;
  role?: "admin" | "manager" | "anggota"; // ✅ Added role field
  employee_id?: string; // Optional, will be auto-generated if not provided
  work_unit?: string;
  position?: string;
  joined_at?: string;
  status?: "active" | "inactive";
}

class MemberService {
  /**
   * Create new member
   * Admin & Manager only
   * ✅ UPDATED: Now supports role parameter
   */
  async createMember(data: CreateMemberRequest): Promise<Member> {
    try {
      const response = await apiClient.post<ApiResponse<Member>>(
        "/members",
        data
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to create member");
    } catch (error: any) {
      console.error("Create member error:", error);

      if (error.response?.status === 403) {
        throw new Error(
          "Akses ditolak. Hanya admin dan manager yang dapat menambah anggota."
        );
      }

      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        throw new Error(
          Array.isArray(firstError) ? firstError[0] : "Validasi gagal"
        );
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Gagal menambahkan anggota");
    }
  }

  /**
   * Get list of all members
   * Admin & Manager only
   */
  async getMembers(
    params?: MemberListParams
  ): Promise<Member[] | PaginatedResponse<Member>> {
    try {
      const response = await apiClient.get<
        ApiResponse<Member[] | PaginatedResponse<Member>>
      >("/members", { params });

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to fetch members");
    } catch (error: any) {
      console.error("Get members error:", error);

      if (error.response?.status === 403) {
        throw new Error(
          "Akses ditolak. Hanya admin dan manager yang dapat melihat daftar anggota."
        );
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Gagal mengambil data anggota");
    }
  }

  /**
   * Get member profile (own profile or specific member)
   */
  async getProfile(userId?: number): Promise<MemberProfile> {
    try {
      const params = userId ? { user_id: userId } : {};
      const response = await apiClient.get<ApiResponse<MemberProfile>>(
        "/members/profile",
        { params }
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to fetch profile");
    } catch (error: any) {
      console.error("Get profile error:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Gagal mengambil data profil");
    }
  }

  /**
   * Get member details by ID
   */
  async getMemberById(id: number): Promise<MemberDetails> {
    try {
      const response = await apiClient.get<ApiResponse<MemberDetails>>(
        `/members/${id}`
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to fetch member");
    } catch (error: any) {
      console.error("Get member by ID error:", error);

      if (error.response?.status === 404) {
        throw new Error("Anggota tidak ditemukan");
      }

      if (error.response?.status === 403) {
        throw new Error("Akses ditolak");
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Gagal mengambil detail anggota");
    }
  }

  /**
   * Update member profile
   */
  async updateMember(id: number, data: UpdateMemberRequest): Promise<Member> {
    try {
      const response = await apiClient.put<ApiResponse<Member>>(
        `/members/${id}`,
        data
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to update member");
    } catch (error: any) {
      console.error("Update member error:", error);

      if (error.response?.status === 403) {
        throw new Error("Akses ditolak");
      }

      if (error.response?.status === 404) {
        throw new Error("Anggota tidak ditemukan");
      }

      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        throw new Error(
          Array.isArray(firstError) ? firstError[0] : "Validasi gagal"
        );
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Gagal mengupdate data anggota");
    }
  }

  /**
   * Change member password
   */
  async changePassword(id: number, data: ChangePasswordRequest): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<null>>(
        `/members/${id}/change-password`,
        data
      );

      if (response.data.success) {
        return;
      }

      throw new Error(response.data.message || "Failed to change password");
    } catch (error: any) {
      console.error("Change password error:", error);

      if (error.response?.status === 400) {
        throw new Error("Password saat ini salah");
      }

      if (error.response?.status === 403) {
        throw new Error("Akses ditolak");
      }

      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        throw new Error(
          Array.isArray(firstError) ? firstError[0] : "Validasi gagal"
        );
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Gagal mengubah password");
    }
  }

  /**
   * Get member financial summary
   */
  async getFinancialSummary(id: number): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        `/members/${id}/financial-summary`
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || "Failed to fetch financial summary"
      );
    } catch (error: any) {
      console.error("Get financial summary error:", error);

      if (error.response?.status === 403) {
        throw new Error("Akses ditolak");
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Gagal mengambil ringkasan keuangan");
    }
  }

  /**
   * Get member activity history
   */
  async getActivityHistory(
    id: number,
    limit?: number
  ): Promise<MemberActivity[]> {
    try {
      const params = limit ? { limit } : {};
      const response = await apiClient.get<ApiResponse<MemberActivity[]>>(
        `/members/${id}/activity-history`,
        { params }
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || "Failed to fetch activity history"
      );
    } catch (error: any) {
      console.error("Get activity history error:", error);

      if (error.response?.status === 403) {
        throw new Error("Akses ditolak");
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Gagal mengambil riwayat aktivitas");
    }
  }

  /**
   * Get member statistics
   * Admin & Manager only
   */
  async getStatistics(): Promise<MemberStatistics> {
    try {
      const response = await apiClient.get<ApiResponse<MemberStatistics>>(
        "/members/statistics"
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to fetch statistics");
    } catch (error: any) {
      console.error("Get statistics error:", error);

      if (error.response?.status === 403) {
        throw new Error(
          "Akses ditolak. Hanya admin dan manager yang dapat melihat statistik."
        );
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Gagal mengambil statistik anggota");
    }
  }

  /**
   * Update member status
   * Admin only
   */
  async updateStatus(id: number, data: UpdateStatusRequest): Promise<Member> {
    try {
      const response = await apiClient.post<ApiResponse<Member>>(
        `/members/${id}/update-status`,
        data
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to update status");
    } catch (error: any) {
      console.error("Update status error:", error);

      if (error.response?.status === 403) {
        throw new Error(
          "Akses ditolak. Hanya admin yang dapat mengubah status anggota."
        );
      }

      if (error.response?.status === 400) {
        throw new Error("User bukan anggota");
      }

      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        throw new Error(
          Array.isArray(firstError) ? firstError[0] : "Validasi gagal"
        );
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Gagal mengupdate status anggota");
    }
  }

  /**
   * Get list of management users (Admin & Manager)
   * Admin & Manager only
   */
  async getManagementUsers(
    params?: MemberListParams
  ): Promise<Member[] | PaginatedResponse<Member>> {
    try {
      const response = await apiClient.get<
        ApiResponse<Member[] | PaginatedResponse<Member>>
      >("/members/management", { params });

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || "Failed to fetch management users"
      );
    } catch (error: any) {
      console.error("Get management users error:", error);

      if (error.response?.status === 403) {
        throw new Error("Akses ditolak.");
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Gagal mengambil data staff");
    }
  }
}

// Export singleton instance
const memberService = new MemberService();
export default memberService;
