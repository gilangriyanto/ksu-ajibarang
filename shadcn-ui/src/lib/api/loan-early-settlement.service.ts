// lib/api/loan-early-settlement.service.ts
// ✅ FIXED: Type updated to match actual API response
import apiClient from "./api-client";

// ========================================
// 📦 TYPES & INTERFACES
// ========================================

export interface EarlySettlementPreview {
  // ✅ Fields from actual API response:
  loan_number: string;
  original_principal: string | number; // API returns "20000000.00"
  remaining_principal: number;
  settlement_amount: number;
  interest_saved: number;
  paid_installments: number; // ✅ API field (was: installments_paid)
  pending_installments: number; // ✅ API field (number, not array)
  total_interest_paid: number; // ✅ API field (was: total_paid)
  message: string;

  // Optional fields that may or may not be in API response
  loan_id?: number;
  total_installments?: number; // May not exist, compute: paid + pending
  total_paid?: number; // Alias compatibility
  installments_paid?: number; // Alias compatibility
  remaining_installments?: number; // Alias compatibility

  // Installment breakdown (may or may not exist)
  pending_installments_detail?: PendingInstallment[];

  // Summary (may not exist in API response)
  savings_summary?: {
    original_total_payment: number;
    settlement_payment: number;
    total_savings: number;
  };
}

export interface PendingInstallment {
  installment_number: number;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  status: string;
}

export interface ProcessSettlementData {
  settlement_notes?: string;
  confirm_amount: boolean;
}

export interface SettlementResult {
  success: boolean;
  message: string;
  loan_id: number;
  settlement_amount: number;
  settlement_date: string;
  loan_status: string;
  transaction_id?: number;
}

// ========================================
// 🔧 SERVICE CLASS
// ========================================

class LoanEarlySettlementService {
  /**
   * GET /loans/{loanId}/early-settlement/preview
   */
  async getSettlementPreview(
    loanId: number,
  ): Promise<{ data: EarlySettlementPreview }> {
    try {
      const response = await apiClient.get(
        `/loans/${loanId}/early-settlement/preview`,
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * POST /loans/{loanId}/early-settlement
   */
  async processSettlement(
    loanId: number,
    data: ProcessSettlementData,
  ): Promise<{ data: SettlementResult }> {
    try {
      const response = await apiClient.post(
        `/loans/${loanId}/early-settlement`,
        data,
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // ========================================
  // 🎨 HELPER METHODS
  // ========================================

  formatCurrency(amount: number | string): string {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  calculateSavingsPercentage(savings: number, originalTotal: number): number {
    if (originalTotal === 0) return 0;
    return (savings / originalTotal) * 100;
  }

  getStatusBadgeColor(status: string): string {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  }

  getStatusDisplayName(status: string): string {
    const names: Record<string, string> = {
      pending: "Belum Dibayar",
      paid: "Sudah Dibayar",
      overdue: "Terlambat",
      cancelled: "Dibatalkan",
    };
    return names[status] || status;
  }

  validateSettlementAmount(preview: EarlySettlementPreview): {
    isValid: boolean;
    message?: string;
  } {
    if (preview.remaining_principal <= 0) {
      return { isValid: false, message: "Pinjaman sudah lunas" };
    }
    if (preview.pending_installments === 0) {
      return { isValid: false, message: "Tidak ada cicilan yang tersisa" };
    }
    return { isValid: true };
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

const loanEarlySettlementService = new LoanEarlySettlementService();
export default loanEarlySettlementService;
