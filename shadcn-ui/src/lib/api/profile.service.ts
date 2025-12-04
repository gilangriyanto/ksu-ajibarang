import apiClient from "@/lib/api/api-client";

// ==================== TYPES ====================

export interface MemberProfile {
  id: number;
  employee_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  formatted_phone: string;
  address: string;
  role: string;
  status: "active" | "inactive" | "suspended";
  joined_at: string;
  membership_duration: number;
  membership_status: string;
  initials: string;
  work_unit?: string;
  position?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  full_name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  work_unit?: string;
  position?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

// ==================== API SERVICE ====================

const profileService = {
  /**
   * Get member profile
   */
  getProfile: async () => {
    const response = await apiClient.get("/members/profile");
    return response.data;
  },

  /**
   * Update member profile
   */
  updateProfile: async (memberId: number, data: UpdateProfileData) => {
    const response = await apiClient.put(`/members/${memberId}`, data);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (memberId: number, data: ChangePasswordData) => {
    const response = await apiClient.post(
      `/members/${memberId}/change-password`,
      data
    );
    return response.data;
  },
};

export default profileService;
