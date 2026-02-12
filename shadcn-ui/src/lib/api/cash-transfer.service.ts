// services/cash-transfer.service.ts
import apiClient from "./api-client";

// ========================================
// 📦 TYPES & INTERFACES
// ========================================

export interface CashAccount {
  id: number;
  name: string;
  balance: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface CashTransfer {
  id: number;
  from_cash_account_id: number;
  to_cash_account_id: number;
  amount: number;
  transfer_date: string;
  purpose: string;
  notes: string | null;
  status: "pending" | "completed" | "cancelled";
  requester_id: number;
  approved_by_id: number | null;
  reason: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  cancelled_at: string | null;

  // Relationships
  from_cash_account?: CashAccount;
  to_cash_account?: CashAccount;
  requester?: User;
  approved_by?: User;
}

export interface CreateCashTransferData {
  from_cash_account_id: number;
  to_cash_account_id: number;
  amount: number;
  transfer_date: string;
  purpose: string;
  notes?: string;
}

export interface CancelCashTransferData {
  reason: string;
}

export interface CashTransferListParams {
  page?: number;
  per_page?: number;
  status?: "pending" | "completed" | "cancelled";
  from_cash_account_id?: number;
  to_cash_account_id?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// ========================================
// 🔧 SERVICE CLASS
// ========================================

class CashTransferService {
  private baseUrl = "/cash-transfers";

  /**
   * 1️⃣ GET /cash-transfers
   */
  async getCashTransfers(params?: CashTransferListParams) {
    try {
      const response = await apiClient.get(this.baseUrl, { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * 2️⃣ POST /cash-transfers
   */
  async createCashTransfer(data: CreateCashTransferData) {
    try {
      const response = await apiClient.post(this.baseUrl, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * 3️⃣ GET /cash-transfers/{id}
   */
  async getCashTransferById(id: number) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * 4️⃣ POST /cash-transfers/{id}/approve
   */
  async approveCashTransfer(id: number) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${id}/approve`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * 5️⃣ POST /cash-transfers/{id}/cancel
   */
  async cancelCashTransfer(id: number, data: CancelCashTransferData) {
    try {
      const response = await apiClient.post(
        `${this.baseUrl}/${id}/cancel`,
        data,
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * 6️⃣ GET /cash-transfers/statistics
   */
  async getStatistics(params: { year: number; month: number }) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/statistics`, {
        params,
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  getStatusBadgeColor(status: string): string {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  }

  getStatusDisplayName(status: string): string {
    const names: Record<string, string> = {
      pending: "Menunggu Approval",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    };
    return names[status] || status;
  }

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
