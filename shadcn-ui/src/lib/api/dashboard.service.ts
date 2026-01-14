// src/lib/api/dashboard.service.ts
import apiClient from "./api-client";
import type { ApiResponse } from "./api-client";

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

// Manager Dashboard Types
export interface ManagerInfo {
  full_name: string;
  employee_id: string;
  email: string;
  managed_accounts_count: number;
}

export interface ManagedAccount {
  id: number;
  code: string;
  name: string;
  description: string;
  type: string;
  current_balance: number;
  is_active: boolean;
  loan_rate: number;
  savings_rate: number;
  savings_count: number;
  active_loans_count: number;
}

export interface ManagerSummary {
  total_accounts: number;
  total_balance: number;
  total_savings: number;
  total_loans_disbursed: number;
  active_loans: number;
  pending_savings: number;
  pending_loans: number;
}

export interface ManagerTransaction {
  type: "loan" | "saving";
  id: number;
  title: string;
  description: string;
  amount: number;
  date: string;
  status: string;
  cash_account: {
    id: number;
    code: string;
    name: string;
  };
}

export interface PendingApprovals {
  pending_savings: any[];
  pending_loans: Array<{
    id: number;
    loan_number: string;
    member_name: string;
    employee_id: string;
    amount: number;
    tenure_months: number;
    date: string;
    cash_account: string;
  }>;
}

export interface ManagerStatistics {
  this_month: {
    savings_collected: number;
    loans_disbursed: number;
    installments_collected: number;
  };
  this_year: {
    savings_collected: number;
    loans_disbursed: number;
    installments_collected: number;
  };
}

export interface ManagerDashboardData {
  manager_info: ManagerInfo;
  managed_accounts: ManagedAccount[];
  summary: ManagerSummary;
  recent_transactions: ManagerTransaction[];
  pending_approvals: PendingApprovals;
  alerts: Alert[];
  statistics: ManagerStatistics;
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

// Union type for Quick Stats
export type QuickStats = AdminQuickStats | MemberQuickStats;

// ==================== SERVICE ====================

class DashboardService {
  /**
   * Get Admin Dashboard Data
   * For Admin role only
   */
  async getAdminDashboard(): Promise<AdminDashboardData> {
    const response = await apiClient.get("/dashboard/admin");
    return response.data.data;
  }

  /**
   * Get Manager Dashboard Data
   * For Manager role only
   */
  async getManagerDashboard(): Promise<ManagerDashboardData> {
    const response = await apiClient.get("/dashboard/manager");
    return response.data.data;
  }

  /**
   * Get Member Dashboard Data
   * For Member role only (shows own data)
   */
  async getMemberDashboard(): Promise<MemberDashboardData> {
    const response = await apiClient.get("/dashboard/member");
    return response.data.data;
  }

  /**
   * Get Quick Stats Widget
   * Response differs based on user role
   */
  async getQuickStats(): Promise<QuickStats> {
    const response = await apiClient.get("/dashboard/quick-stats");
    return response.data.data;
  }
}

// Export singleton instance
const dashboardService = new DashboardService();
export default dashboardService;
