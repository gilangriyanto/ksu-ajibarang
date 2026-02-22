// lib/api/resignation.service.ts
// ✅ UPDATED: Sesuai Postman Collection terbaru
// ✅ POST /resignations body: { user_id, reason }
// ✅ POST /resignations/{id}/process body: { status, admin_notes }
// ✅ POST /resignations/{id}/withdraw body: { cash_account_id, notes }
// ✅ GET /members/{id}/resignations for member history

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
  reason: string;
  resignation_date: string;
  request_date: string;
  status: "pending" | "approved" | "rejected" | "completed";
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
  processed_by?: number;
  processed_by_user?: {
    id: number;
    full_name: string;
    employee_id: string;
  };
  processed_at?: string;
  admin_notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ResignationStatistics {
  total_resignations: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
}

// ✅ Member submit - tanpa user_id (otomatis dari JWT)
export interface MemberCreateResignationData {
  reason: string;
  resignation_date?: string;
}

// ✅ Admin submit - wajib user_id
export interface AdminCreateResignationData {
  user_id: number;
  reason: string;
  resignation_date?: string;
}

export type CreateResignationData =
  | MemberCreateResignationData
  | AdminCreateResignationData;

// ✅ UPDATED: Process uses "status" field, not "action"
export interface ProcessResignationData {
  status: "approved" | "rejected";
  admin_notes?: string;
}

export interface WithdrawResignationData {
  cash_account_id: number;
  notes?: string;
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
   * GET /resignations
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
   * POST /resignations
   * Body: { user_id, reason } or { reason } (member)
   */
  async createResignation(data: CreateResignationData) {
    try {
      console.log("📤 POST /resignations", data);
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

  /** Member submit (tanpa user_id) */
  async memberSubmitResignation(reason: string, resignationDate?: string) {
    const data: MemberCreateResignationData = { reason };
    if (resignationDate) data.resignation_date = resignationDate;
    return this.createResignation(data);
  }

  /** Admin submit (wajib user_id) */
  async adminSubmitResignation(
    userId: number,
    reason: string,
    resignationDate?: string,
  ) {
    const data: AdminCreateResignationData = { user_id: userId, reason };
    if (resignationDate) data.resignation_date = resignationDate;
    return this.createResignation(data);
  }

  /**
   * GET /resignations/{id}
   */
  async getResignationById(id: number) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * GET /resignations/statistics
   */
  async getStatistics(params?: { year?: number }) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/statistics`, {
        params,
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * POST /resignations/{id}/process
   * ✅ UPDATED: Sends action instead of status so the backend validation passes
   */
  async processResignation(id: number, data: ProcessResignationData) {
    try {
      console.log(`📤 POST /resignations/${id}/process`, data);
      const payload = {
        action: data.status === "approved" ? "approve" : "reject",
        admin_notes: data.admin_notes
      };
      const response = await apiClient.post(
        `${this.baseUrl}/${id}/process`,
        payload,
      );
      console.log("✅ Resignation processed:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error processing resignation:", error);
      throw this.handleError(error);
    }
  }

  async approveResignation(id: number, admin_notes?: string) {
    return this.processResignation(id, { status: "approved", admin_notes });
  }

  async rejectResignation(id: number, admin_notes?: string) {
    return this.processResignation(id, { status: "rejected", admin_notes });
  }

  /**
   * POST /resignations/{id}/withdraw
   * ✅ NEW: Process withdrawal/pencairan
   */
  async processWithdrawal(id: number, data: WithdrawResignationData) {
    try {
      console.log(`📤 POST /resignations/${id}/withdraw`, data);
      const response = await apiClient.post(
        `${this.baseUrl}/${id}/withdraw`,
        data,
      );
      console.log("✅ Withdrawal processed:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error processing withdrawal:", error);
      throw this.handleError(error);
    }
  }

  /**
   * GET /members/{memberId}/resignations
   */
  async getMemberResignations(memberId: number) {
    try {
      const response = await apiClient.get(`/members/${memberId}/resignations`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // ==================== HELPERS ====================

  private formatDateForBackend(dateString: string): string {
    const date = new Date(dateString.includes("T") ? dateString : dateString + "T00:00:00");
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.message || error.message;
      const errors = error.response.data?.errors;
      if (errors) {
        return new Error(Object.values(errors).flat().join(", "));
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
    const map: Record<string, string> = {
      pending: "Menunggu",
      approved: "Disetujui",
      rejected: "Ditolak",
      completed: "Selesai",
    };
    return map[status] || status;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return "-";
    const date = dateString.includes("T") ? new Date(dateString) : new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  getMaxResignationDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().split("T")[0];
  }

  getTodayDate(): string {
    return new Date().toISOString().split("T")[0];
  }
}

const resignationService = new ResignationService();
export default resignationService;
