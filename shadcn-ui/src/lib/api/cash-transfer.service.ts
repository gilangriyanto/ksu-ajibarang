// lib/api/cash-transfer.service.ts
// ✅ UPDATED: Sesuai Postman Collection terbaru
// ✅ Backward-compatible method aliases included

import apiClient from "./api-client";

// ==================== INTERFACES ====================

export interface CashTransfer {
  id: number;
  transfer_number: string;
  from_cash_account_id: number;
  to_cash_account_id: number;
  from_cash_account?: {
    id: number;
    name: string;
    code?: string;
  };
  to_cash_account?: {
    id: number;
    name: string;
    code?: string;
  };
  amount: number;
  transfer_date: string;
  purpose: string;
  status: "pending" | "approved" | "cancelled";
  approved_by?: number;
  approved_at?: string;
  approved_by_user?: {
    id: number;
    full_name: string;
  };
  created_by?: number;
  created_by_user?: {
    id: number;
    full_name: string;
  };
  journal_id?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CashTransferStatistics {
  total_transfers: number;
  pending: number;
  approved: number;
  cancelled: number;
  total_amount: number;
}

export interface CreateCashTransferData {
  from_cash_account_id: number;
  to_cash_account_id: number;
  amount: number;
  transfer_date: string;
  purpose: string;
}

export interface CashTransferListParams {
  status?: string;
  from_cash_account_id?: number;
  to_cash_account_id?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// ==================== SERVICE ====================

class CashTransferService {
  private baseUrl = "/cash-transfers";

  // ==================== CORE METHODS ====================

  /**
   * GET /cash-transfers
   */
  async getAll(params?: CashTransferListParams) {
    try {
      console.log("📤 GET /cash-transfers", params);
      const response = await apiClient.get(this.baseUrl, { params });
      console.log("✅ Transfers list response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching transfers:", error);
      throw this.handleError(error);
    }
  }

  /**
   * GET /cash-transfers/statistics
   */
  async getStatistics(): Promise<CashTransferStatistics> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/statistics`);
      return response.data?.data || response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * GET /cash-transfers/{id}
   */
  async getById(id: number) {
    try {
      console.log(`📤 GET /cash-transfers/${id}`);
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      console.log("✅ Transfer detail:", response.data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * POST /cash-transfers
   */
  async create(data: CreateCashTransferData) {
    try {
      console.log("📤 POST /cash-transfers", data);
      const response = await apiClient.post(this.baseUrl, data);
      console.log("✅ Transfer created:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error creating transfer:", error);
      throw this.handleError(error);
    }
  }

  /**
   * POST /cash-transfers/{id}/approve
   * ✅ No body needed - backend handles journal creation
   */
  async approve(id: number) {
    try {
      console.log(`📤 POST /cash-transfers/${id}/approve`);
      const response = await apiClient.post(`${this.baseUrl}/${id}/approve`);
      console.log("✅ Transfer approved:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error approving transfer:", error);
      throw this.handleError(error);
    }
  }

  /**
   * POST /cash-transfers/{id}/cancel
   */
  async cancel(id: number) {
    try {
      console.log(`📤 POST /cash-transfers/${id}/cancel`);
      const response = await apiClient.post(`${this.baseUrl}/${id}/cancel`);
      console.log("✅ Transfer cancelled:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error cancelling transfer:", error);
      throw this.handleError(error);
    }
  }

  // ==================== BACKWARD-COMPATIBLE ALIASES ====================
  // ✅ These keep existing code working without changes

  async getCashTransfers(params?: CashTransferListParams) {
    return this.getAll(params);
  }

  async getCashTransferById(id: number) {
    return this.getById(id);
  }

  async createCashTransfer(data: CreateCashTransferData) {
    return this.create(data);
  }

  async approveCashTransfer(id: number) {
    return this.approve(id);
  }

  async cancelCashTransfer(id: number) {
    return this.cancel(id);
  }

  // ==================== HELPERS ====================

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  getStatusBadgeColor(status: string): string {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  getStatusDisplayName(status: string): string {
    const map: Record<string, string> = {
      pending: "Menunggu",
      approved: "Disetujui",
      cancelled: "Dibatalkan",
    };
    return map[status] || status;
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
}

const cashTransferService = new CashTransferService();
export default cashTransferService;
