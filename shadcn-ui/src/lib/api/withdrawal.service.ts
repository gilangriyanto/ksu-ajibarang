// lib/api/withdrawal.service.ts
// 💰 MEMBER WITHDRAWAL SERVICE - Based on Postman Collection

import apiClient from "@/lib/api/api-client";

// ==================== INTERFACES ====================

export interface Withdrawal {
  id: number;
  resignation_id: number;
  user_id: number;
  user?: {
    id: number;
    full_name: string;
    employee_id: string;
    email?: string;
  };

  // Payment Info
  payment_method: "cash" | "transfer" | "check";
  cash_account_id: number;
  cash_account?: {
    id: number;
    name: string;
    account_number: string;
  };

  // Amount
  withdrawal_amount: number;

  // Bank Transfer Details (if payment_method = 'transfer')
  bank_name?: string;
  account_number?: string;
  account_holder_name?: string;
  transfer_reference?: string;

  // Check Details (if payment_method = 'check')
  check_number?: string;
  check_date?: string;

  // Additional
  notes?: string;
  processed_by?: number;
  processed_by_user?: {
    id: number;
    full_name: string;
  };

  // Timestamps
  processed_at: string;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalStatistics {
  total_withdrawals: number;
  total_amount: number;
  by_payment_method: {
    cash: number;
    transfer: number;
    check: number;
  };
  by_status?: Record<string, number>;
}

// Withdrawal Data Types per Payment Method
export interface CreateWithdrawalCash {
  cash_account_id: number;
  payment_method: "cash";
  notes?: string;
}

export interface CreateWithdrawalTransfer {
  cash_account_id: number;
  payment_method: "transfer";
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  transfer_reference?: string;
  notes?: string;
}

export interface CreateWithdrawalCheck {
  cash_account_id: number;
  payment_method: "check";
  check_number: string;
  check_date: string;
  notes?: string;
}

export type CreateWithdrawalData =
  | CreateWithdrawalCash
  | CreateWithdrawalTransfer
  | CreateWithdrawalCheck;

// ==================== SERVICE ====================

class WithdrawalService {
  private baseUrl = "/withdrawals";

  /**
   * 1️⃣ GET /withdrawals
   * List all withdrawal transactions (Admin/Manager)
   */
  async getWithdrawals(params?: {
    payment_method?: "cash" | "transfer" | "check";
    user_id?: number;
    start_date?: string;
    end_date?: string;
  }) {
    try {
      console.log("📤 GET /withdrawals", params);
      const response = await apiClient.get(this.baseUrl, { params });
      console.log("✅ Withdrawals loaded:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching withdrawals:", error);
      throw this.handleError(error);
    }
  }

  /**
   * 2️⃣ POST /resignations/{id}/withdraw
   * Process withdrawal from resignation
   */
  async processWithdrawal(resignationId: number, data: CreateWithdrawalData) {
    try {
      console.log(`📤 POST /resignations/${resignationId}/withdraw`, data);
      const response = await apiClient.post(
        `/resignations/${resignationId}/withdraw`,
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
   * 3️⃣ GET /withdrawals/{id}
   * Get withdrawal detail
   */
  async getWithdrawalById(id: number) {
    try {
      console.log(`📤 GET /withdrawals/${id}`);
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      console.log("✅ Withdrawal detail loaded:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching withdrawal detail:", error);
      throw this.handleError(error);
    }
  }

  /**
   * 4️⃣ GET /withdrawals/statistics
   * Get withdrawal statistics
   */
  async getStatistics(params: { year: number; month?: number }) {
    try {
      console.log("📤 GET /withdrawals/statistics", params);
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

  /**
   * Helper: Process Cash Withdrawal
   */
  async processWithdrawalCash(
    resignationId: number,
    cash_account_id: number,
    notes?: string,
  ) {
    return this.processWithdrawal(resignationId, {
      cash_account_id,
      payment_method: "cash",
      notes,
    });
  }

  /**
   * Helper: Process Transfer Withdrawal
   */
  async processWithdrawalTransfer(
    resignationId: number,
    data: Omit<CreateWithdrawalTransfer, "payment_method">,
  ) {
    return this.processWithdrawal(resignationId, {
      ...data,
      payment_method: "transfer",
    });
  }

  /**
   * Helper: Process Check Withdrawal
   */
  async processWithdrawalCheck(
    resignationId: number,
    data: Omit<CreateWithdrawalCheck, "payment_method">,
  ) {
    return this.processWithdrawal(resignationId, {
      ...data,
      payment_method: "check",
    });
  }

  /**
   * Helper: Get payment method badge color
   */
  getPaymentMethodBadgeColor(method: string): string {
    switch (method) {
      case "cash":
        return "bg-green-100 text-green-800";
      case "transfer":
        return "bg-blue-100 text-blue-800";
      case "check":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  /**
   * Helper: Get payment method display name
   */
  getPaymentMethodDisplayName(method: string): string {
    const methodMap: Record<string, string> = {
      cash: "Tunai",
      transfer: "Transfer Bank",
      check: "Cek",
    };
    return methodMap[method] || method;
  }

  /**
   * Helper: Format currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Helper: Format date
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  /**
   * Helper: Format date for backend (YYYY-MM-DD)
   */
  formatDateForBackend(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Helper: Better error handling
   */
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

// Export singleton instance
const withdrawalService = new WithdrawalService();
export default withdrawalService;
