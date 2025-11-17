// src/lib/api/dashboard.service.ts
import apiClient, { ApiResponse } from "./api-client";

// ==================== TYPES ====================

// Admin Dashboard Types
export interface AdminOverview {
  members: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    new_this_month: number;
  };
  savings: {
    total_balance: number;
    transactions_count: number;
    pending_count: number;
    this_month: number;
  };
  loans: {
    active_count: number;
    total_principal: number;
    total_remaining: number;
    pending_applications: number;
  };
  installments: {
    overdue_count: number;
    pending_count: number;
    upcoming_7days: number;
  };
  cash_accounts: {
    total_balance: number;
    active_accounts: number;
  };
}

export interface FinancialSummary {
  year: number;
  savings_collected: number;
  loans_disbursed: number;
  installments_collected: number;
  service_allowances_distributed: number;
  gifts_distributed: number;
}

export interface RecentActivity {
  id: number;
  type: string;
  description: string;
  amount?: number;
  member_name?: string;
  created_at: string;
}

export interface Alert {
  type: "danger" | "warning" | "info" | "success";
  title: string;
  message: string;
  action?: string;
  link?: string;
}

export interface ChartsData {
  monthly_savings: Array<{ month: string; amount: number }>;
  savings_vs_loans: Array<{ name: string; value: number }>;
  savings_by_type: Array<{ name: string; value: number }>;
  member_growth: Array<{ month: string; count: number }>;
}

export interface AdminDashboardData {
  overview: AdminOverview;
  financial_summary: FinancialSummary;
  recent_activities: RecentActivity[];
  alerts: Alert[];
  charts_data: ChartsData;
}

// Member Dashboard Types
export interface MemberProfile {
  full_name: string;
  employee_id: string;
  email: string;
  joined_date: string;
  membership_duration: string;
  status: string;
}

export interface MemberFinancialSummary {
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
}

export interface SavingsSummary {
  pokok: { name: string; balance: number };
  wajib: { name: string; balance: number };
  sukarela: { name: string; balance: number };
  hari_raya: { name: string; balance: number };
}

export interface LoansSummary {
  active_count: number;
  total_borrowed: number;
  remaining_balance: number;
  monthly_installment: number;
  paid_off_count: number;
}

export interface MemberTransaction {
  id: number;
  type: "savings" | "installment";
  description: string;
  amount: number;
  date: string;
  status: string;
}

export interface UpcomingInstallment {
  id: number;
  loan_number: string;
  installment_number: number;
  amount: number;
  due_date: string;
  status: "pending" | "paid" | "overdue";
  days_until_due: number;
}

export interface ThisYearSummary {
  year: number;
  total_savings: number;
  total_installments_paid: number;
  service_allowance_received: number;
  gifts_received: number;
}

export interface MemberDashboardData {
  profile: MemberProfile;
  financial_summary: MemberFinancialSummary;
  savings_summary: SavingsSummary;
  loans_summary: LoansSummary;
  recent_transactions: MemberTransaction[];
  upcoming_installments: UpcomingInstallment[];
  this_year_summary: ThisYearSummary;
}

// Quick Stats Types
export interface AdminQuickStats {
  total_members: number;
  total_savings: number;
  active_loans: number;
  overdue_installments: number;
}

export interface MemberQuickStats {
  total_savings: number;
  active_loans: number;
  monthly_installment: number;
  upcoming_installments: number;
}

// ==================== SERVICE ====================

class DashboardService {
  /**
   * Get Admin Dashboard Data
   * For Admin/Manager role only
   */
  async getAdminDashboard(): Promise<AdminDashboardData> {
    try {
      const response = await apiClient.get<ApiResponse<AdminDashboardData>>(
        "/dashboard/admin"
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || "Failed to fetch admin dashboard"
      );
    } catch (error: any) {
      console.error("Get admin dashboard error:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Gagal mengambil data dashboard admin");
    }
  }

  /**
   * Get Member Dashboard Data
   * For Member role only (shows own data)
   */
  async getMemberDashboard(): Promise<MemberDashboardData> {
    try {
      const response = await apiClient.get<ApiResponse<MemberDashboardData>>(
        "/dashboard/member"
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || "Failed to fetch member dashboard"
      );
    } catch (error: any) {
      console.error("Get member dashboard error:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Gagal mengambil data dashboard anggota");
    }
  }

  /**
   * Get Quick Stats Widget
   * Response differs based on user role
   */
  async getQuickStats(): Promise<AdminQuickStats | MemberQuickStats> {
    try {
      const response = await apiClient.get<
        ApiResponse<AdminQuickStats | MemberQuickStats>
      >("/dashboard/quick-stats");

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to fetch quick stats");
    } catch (error: any) {
      console.error("Get quick stats error:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Gagal mengambil statistik cepat");
    }
  }
}

// Export singleton instance
const dashboardService = new DashboardService();
export default dashboardService;
