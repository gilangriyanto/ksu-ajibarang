// lib/api/salary-deduction.service.ts
import apiClient from "./api-client";

// ========================================
// 📦 TYPES & INTERFACES
// ========================================

export interface User {
  id: number;
  full_name: string;
  employee_id: string;
  member_number?: string;
}

export interface Loan {
  id: number;
  loan_number: string;
  remaining_balance: number;
  monthly_installment: number;
}

export interface SalaryDeduction {
  id: number;
  user_id: number;
  period_month: number;
  period_year: number;
  gross_salary: number;
  savings_deduction: number;
  loan_deductions: number;
  other_deductions: number;
  total_deductions: number;
  net_salary: number;
  status: "pending" | "processed" | "cancelled";
  notes: string | null;
  processed_at: string | null;
  processed_by_id: number | null;
  created_at: string;
  updated_at: string;

  // Relationships
  user?: User;
  processed_by?: User;
  deduction_details?: DeductionDetail[];
}

export interface DeductionDetail {
  id: number;
  salary_deduction_id: number;
  loan_id: number;
  installment_amount: number;
  installment_number: number;
  loan?: Loan;
}

export interface CreateSalaryDeductionData {
  user_id: number;
  period_month: number;
  period_year: number;
  gross_salary: number;
  savings_deduction: number;
  other_deductions: number;
  notes?: string;
}

export interface BatchMemberData {
  user_id: number;
  gross_salary: number;
  savings_deduction: number;
  other_deductions: number;
}

export interface BatchProcessData {
  period_month: number;
  period_year: number;
  members: BatchMemberData[];
}

export interface SalaryDeductionListParams {
  page?: number;
  per_page?: number;
  period_year?: number;
  period_month?: number;
  status?: "pending" | "processed" | "cancelled";
  user_id?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface AnnualSummary {
  year: number;
  user_id: number;
  total_gross_salary: number;
  total_savings_deduction: number;
  total_loan_deductions: number;
  total_other_deductions: number;
  total_deductions: number;
  total_net_salary: number;
  monthly_data: MonthlyData[];
}

export interface MonthlyData {
  month: number;
  month_name: string;
  gross_salary: number;
  total_deductions: number;
  net_salary: number;
  status: string;
}

export interface Statistics {
  year: number;
  total_members_processed: number;
  total_gross_salary: number;
  total_savings_deduction: number;
  total_loan_deductions: number;
  total_other_deductions: number;
  total_deductions: number;
  total_net_salary: number;
  monthly_breakdown: {
    month: number;
    month_name: string;
    members_count: number;
    total_gross: number;
    total_deductions: number;
  }[];
}

// ========================================
// 🔧 SERVICE CLASS
// ========================================

class SalaryDeductionService {
  private baseUrl = "/salary-deductions";

  /**
   * 1️⃣ GET /salary-deductions
   * List all salary deductions with filters
   */
  async getSalaryDeductions(params?: SalaryDeductionListParams) {
    try {
      const response = await apiClient.get(this.baseUrl, { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * 2️⃣ POST /salary-deductions
   * Process single salary deduction
   */
  async processSalaryDeduction(data: CreateSalaryDeductionData) {
    try {
      const response = await apiClient.post(this.baseUrl, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * 3️⃣ POST /salary-deductions/batch
   * Process batch salary deductions
   */
  async batchProcessDeductions(data: BatchProcessData) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/batch`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * 4️⃣ GET /salary-deductions/{id}
   * Get deduction detail by ID
   */
  async getDeductionById(id: number) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * 5️⃣ GET /salary-deductions/period/{year}/{month}
   * Get all deductions for specific period
   */
  async getDeductionsByPeriod(year: number, month: number) {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/period/${year}/${month}`,
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * 6️⃣ GET /members/{userId}/salary-deductions/annual/{year}
   * Get member annual summary
   */
  async getMemberAnnualSummary(userId: number, year: number) {
    try {
      const response = await apiClient.get(
        `/members/${userId}/salary-deductions/annual/${year}`,
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * 7️⃣ GET /salary-deductions/statistics
   * Get deduction statistics
   */
  async getStatistics(params: { year: number; month?: number }) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/statistics`, {
        params,
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // ========================================
  // 🎨 HELPER METHODS
  // ========================================

  getStatusBadgeColor(status: string): string {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  }

  getStatusDisplayName(status: string): string {
    const names: Record<string, string> = {
      pending: "Menunggu Proses",
      processed: "Sudah Diproses",
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

  getMonthName(month: number): string {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return months[month - 1] || "";
  }

  getPeriodDisplay(year: number, month: number): string {
    return `${this.getMonthName(month)} ${year}`;
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

const salaryDeductionService = new SalaryDeductionService();
export default salaryDeductionService;
