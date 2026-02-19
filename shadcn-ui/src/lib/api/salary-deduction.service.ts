// lib/api/salary-deduction.service.ts
// ✅ UPDATED: Sesuai Postman Collection terbaru
// ✅ Tambah endpoint /my-deductions untuk role member
// ✅ Tambah endpoint /period/{year}/{month}
// ✅ Tambah endpoint /members/{id}/salary-deductions/annual/{year}

import apiClient from "./api-client";

// ==================== INTERFACES ====================

export interface SalaryDeduction {
  id: number;
  user_id: number;
  user?: {
    id: number;
    full_name: string;
    employee_id: string;
  };
  period_month: number;
  period_year: number;
  gross_salary: number;
  loan_deduction: number;
  savings_deduction: number;
  other_deductions: number;
  total_deduction: number;
  total_deductions?: number; // alias - some code uses plural
  net_salary: number;
  status: "pending" | "processed" | "paid";
  notes?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  [key: string]: any; // allow extra fields from API
}

export interface SalaryDeductionStatistics {
  total_deductions: number;
  total_amount: number;
  by_status: Record<string, number>;
  by_month?: Array<{ month: number; total: number }>;
}

export interface ProcessDeductionData {
  user_id: number;
  period_month: number;
  period_year: number;
  gross_salary: number;
  savings_deduction?: number;
  other_deductions?: number;
  notes?: string;
}

export interface BatchProcessData {
  period_month: number;
  period_year: number;
  members: Array<{
    user_id: number;
    gross_salary: number;
  }>;
}

export interface SalaryDeductionListParams {
  user_id?: number;
  period_month?: number;
  period_year?: number;
  status?: string;
  page?: number;
  per_page?: number;
}

// ==================== SERVICE ====================

class SalaryDeductionService {
  private baseUrl = "/salary-deductions";

  /**
   * 1️⃣ GET /salary-deductions (Admin only)
   * List all salary deductions with filters
   */
  async getAll(params?: SalaryDeductionListParams) {
    try {
      console.log("📤 GET /salary-deductions", params);
      const response = await apiClient.get(this.baseUrl, { params });
      console.log("✅ Salary deductions loaded:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching salary deductions:", error);
      throw this.handleError(error);
    }
  }

  /**
   * 2️⃣ GET /salary-deductions/my-deductions (Member only)
   * ✅ NEW: Endpoint khusus member - tanpa perlu user_id
   * Query params: period_year (optional)
   */
  async getMyDeductions(periodYear?: number) {
    try {
      const params: any = {};
      if (periodYear) params.period_year = periodYear;

      console.log("📤 GET /salary-deductions/my-deductions", params);
      const response = await apiClient.get(`${this.baseUrl}/my-deductions`, {
        params,
      });
      console.log("✅ My deductions loaded:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching my deductions:", error);
      throw this.handleError(error);
    }
  }

  /**
   * 3️⃣ GET /salary-deductions/statistics (Admin only)
   */
  async getStatistics() {
    try {
      const response = await apiClient.get(`${this.baseUrl}/statistics`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * 4️⃣ GET /salary-deductions/period/{year}/{month} (Admin only)
   */
  async getByPeriod(year: number, month: number) {
    try {
      console.log(`📤 GET /salary-deductions/period/${year}/${month}`);
      const response = await apiClient.get(
        `${this.baseUrl}/period/${year}/${month}`,
      );
      console.log("✅ Period deductions loaded:", response.data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * 5️⃣ POST /salary-deductions (Admin - process single)
   */
  async processSingle(data: ProcessDeductionData) {
    try {
      console.log("📤 POST /salary-deductions", data);
      const response = await apiClient.post(this.baseUrl, data);
      console.log("✅ Deduction processed:", response.data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * 6️⃣ POST /salary-deductions/batch (Admin - batch process)
   */
  async processBatch(data: BatchProcessData) {
    try {
      console.log("📤 POST /salary-deductions/batch", data);
      const response = await apiClient.post(`${this.baseUrl}/batch`, data);
      console.log("✅ Batch processed:", response.data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * 7️⃣ GET /members/{memberId}/salary-deductions/annual/{year}
   */
  async getMemberAnnualSummary(memberId: number, year: number) {
    try {
      const response = await apiClient.get(
        `/members/${memberId}/salary-deductions/annual/${year}`,
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // ==================== HELPERS ====================

  formatCurrency(amount: number): string {
    const val = Number(amount);
    if (isNaN(val) || amount === null || amount === undefined) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  }

  formatPeriod(month: number, year: number): string {
    const monthNames = [
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
    return `${monthNames[(month || 1) - 1] || "?"} ${year || ""}`;
  }

  // ✅ Called as getPeriodDisplay(year, month) in SalaryDeductionManagement
  getPeriodDisplay(year: number, month: number): string {
    return this.formatPeriod(month, year);
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
      case "processed":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  getStatusDisplayName(status: string): string {
    const map: Record<string, string> = {
      pending: "Menunggu",
      processed: "Diproses",
      paid: "Dibayar",
    };
    return map[status] || status;
  }

  formatDate(dateString: string): string {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
}

const salaryDeductionService = new SalaryDeductionService();
export default salaryDeductionService;
