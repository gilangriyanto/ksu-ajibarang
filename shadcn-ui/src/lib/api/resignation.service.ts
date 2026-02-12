// lib/api/resignation.service.ts
// 🔧 UPDATED: Sesuai Postman Collection Member Resignation (UPDATED)
// ✅ Member submit tanpa user_id (otomatis dari JWT)
// ✅ resignation_date opsional (default = hari ini)
// ✅ Max H+90, min hari ini

import apiClient from "@/lib/api/api-client";

// ==================== INTERFACES ====================

export interface Resignation {
  id: number;
  user_id: number;
  user?: {
    id: number;
    full_name: string;
    employee_id: string;
    email?: string;
    phone_number?: string;
  };

  // Resignation Info
  reason: string;
  resignation_date: string;
  request_date: string;

  // Status: pending → approved → completed | rejected
  status: "pending" | "approved" | "rejected" | "completed";

  // Settlement Calculation
  total_savings?: number;
  total_loans?: number;
  return_amount?: number;
  deduction_amount?: number;
  settlement_details?: {
    savings_breakdown?: {
      principal: number;
      mandatory: number;
      voluntary: number;
      holiday: number;
    };
    loan_details?: {
      total_borrowed: number;
      total_paid: number;
      remaining_balance: number;
    };
  };

  // Admin Process
  processed_by?: number;
  processed_by_user?: {
    id: number;
    full_name: string;
    employee_id: string;
  };
  processed_at?: string;
  admin_notes?: string;
  rejection_reason?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ResignationStatistics {
  total_resignations: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
  by_month?: Array<{
    month: number;
    month_name: string;
    count: number;
  }>;
  by_year?: Array<{
    year: number;
    count: number;
  }>;
}

// ✅ UPDATED: Member submit - user_id OPSIONAL (otomatis dari JWT)
// ✅ UPDATED: resignation_date OPSIONAL (default = hari ini)
export interface MemberCreateResignationData {
  reason: string;
  resignation_date?: string; // Opsional, default hari ini, max H+90
}

// ✅ Admin submit - user_id WAJIB
export interface AdminCreateResignationData {
  user_id: number;
  reason: string;
  resignation_date?: string;
}

export type CreateResignationData =
  | MemberCreateResignationData
  | AdminCreateResignationData;

export interface ProcessResignationData {
  action: "approve" | "reject";
  admin_notes?: string;
  rejection_reason?: string;
}

export interface ResignationListParams {
  status?: "pending" | "approved" | "rejected" | "completed";
  user_id?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

// ==================== SERVICE ====================

class ResignationService {
  private baseUrl = "/resignations";

  /**
   * 1️⃣ GET /api/resignations
   * List resignations with filters
   * - Admin/Manager: semua data
   * - Member: filter by user_id sendiri
   */
  async getResignations(params?: ResignationListParams) {
    try {
      console.log("📤 GET /resignations", params);
      const response = await apiClient.get(this.baseUrl, { params });
      console.log("✅ Resignations loaded:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching resignations:", error);
      throw this.handleError(error);
    }
  }

  /**
   * 2️⃣ POST /api/resignations
   * Create resignation request
   *
   * 🔧 UPDATED:
   * - Member: hanya kirim { reason } atau { reason, resignation_date }
   *   → user_id otomatis dari JWT token
   *   → resignation_date default = hari ini
   * - Admin/Manager: kirim { user_id, reason, resignation_date }
   *   → user_id WAJIB saat submit untuk member lain
   */
  async createResignation(data: CreateResignationData) {
    try {
      console.log("📤 POST /resignations", data);

      // Format date jika ada
      const formattedData: any = { ...data };
      if (formattedData.resignation_date) {
        formattedData.resignation_date = this.formatDateForBackend(
          formattedData.resignation_date,
        );
      }

      const response = await apiClient.post(this.baseUrl, formattedData);
      console.log("✅ Resignation created:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error creating resignation:", error);
      throw this.handleError(error);
    }
  }

  /**
   * 2a️⃣ Member submit sendiri (shortcut)
   * Hanya kirim reason + optional date
   */
  async memberSubmitResignation(reason: string, resignationDate?: string) {
    const data: MemberCreateResignationData = { reason };
    if (resignationDate) {
      data.resignation_date = resignationDate;
    }
    return this.createResignation(data);
  }

  /**
   * 2b️⃣ Admin submit untuk member lain (shortcut)
   * Wajib sertakan user_id
   */
  async adminSubmitResignation(
    userId: number,
    reason: string,
    resignationDate?: string,
  ) {
    const data: AdminCreateResignationData = {
      user_id: userId,
      reason,
    };
    if (resignationDate) {
      data.resignation_date = resignationDate;
    }
    return this.createResignation(data);
  }

  /**
   * 3️⃣ GET /api/resignations/{id}
   * Get resignation detail with financial summary
   */
  async getResignationById(id: number) {
    try {
      console.log(`📤 GET /resignations/${id}`);
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      console.log("✅ Resignation detail loaded:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching resignation detail:", error);
      throw this.handleError(error);
    }
  }

  /**
   * 4️⃣ POST /api/resignations/{id}/process
   * Approve or Reject resignation (Admin/Manager only)
   */
  async processResignation(id: number, data: ProcessResignationData) {
    try {
      console.log(`📤 POST /resignations/${id}/process`, data);
      const response = await apiClient.post(
        `${this.baseUrl}/${id}/process`,
        data,
      );
      console.log("✅ Resignation processed:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error processing resignation:", error);
      throw this.handleError(error);
    }
  }

  /**
   * 5️⃣ GET /api/resignations/statistics
   * Get resignation statistics (Admin/Manager only)
   */
  async getStatistics(params?: { year?: number }) {
    try {
      console.log("📤 GET /resignations/statistics", params);
      const response = await apiClient.get(`${this.baseUrl}/statistics`, {
        params,
      });
      console.log("✅ Statistics loaded:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching statistics:", error);
      throw this.handleError(error);
    }
  }

  // ==================== HELPER: Approve/Reject ====================

  async approveResignation(id: number, admin_notes?: string) {
    return this.processResignation(id, {
      action: "approve",
      admin_notes,
    });
  }

  async rejectResignation(
    id: number,
    rejection_reason: string,
    admin_notes?: string,
  ) {
    return this.processResignation(id, {
      action: "reject",
      rejection_reason,
      admin_notes,
    });
  }

  // ==================== UTILITY HELPERS ====================

  private formatDateForBackend(dateString: string): string {
    const date = new Date(dateString + "T00:00:00");
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.message || error.message;
      const errors = error.response.data?.errors;

      if (errors) {
        const errorMessages = Object.values(errors).flat().join(", ");
        return new Error(errorMessages);
      }

      return new Error(message);
    }
    return error;
  }

  getStatusBadgeColor(status: string): string {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  getStatusDisplayName(status: string): string {
    const statusMap: Record<string, string> = {
      pending: "Menunggu",
      approved: "Disetujui",
      rejected: "Ditolak",
      completed: "Selesai",
    };
    return statusMap[status] || status;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString + "T00:00:00").toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  /**
   * Helper: Get max resignation date (H+90)
   */
  getMaxResignationDate(): string {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    return maxDate.toISOString().split("T")[0];
  }

  /**
   * Helper: Get today's date formatted
   */
  getTodayDate(): string {
    return new Date().toISOString().split("T")[0];
  }
}

const resignationService = new ResignationService();
export default resignationService;
