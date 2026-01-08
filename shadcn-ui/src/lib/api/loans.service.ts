import apiClient from "@/lib/api/api-client";

// ==================== TYPES ====================

export interface Loan {
  id: number;
  user_id: number;
  cash_account_id: number;
  principal_amount: string | number;
  tenure_months: number;
  interest_rate: string | number;
  monthly_payment: string | number;
  total_payment: string | number;
  application_date: string;
  loan_purpose: string;
  loan_number?: string; // ✅ ADDED
  interest_percentage?: string | number; // ✅ ADDED
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "active"
    | "completed"
    | "overdue";
  disbursement_date?: string;
  rejection_reason?: string;
  approved_by?: {
    id: number;
    full_name: string;
  } | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user?: {
    id: number;
    full_name: string;
    employee_id: string;
  };
  cash_account?: {
    id: number;
    code: string;
    name: string;
  };

  // Legacy/computed fields
  remaining_balance?: string | number;
  paid_installments?: number;
  total_installments?: number;
}

// ✅ UPDATED: Complete Installment interface with all fields from API
export interface Installment {
  id: number;
  loan_id: number;
  installment_number: number;
  due_date: string;
  principal_amount: string | number;
  interest_amount: string | number;
  total_amount: string | number;
  payment_date?: string;
  payment_method?: string;
  notes?: string;
  status: "pending" | "paid" | "overdue" | "partial";
  created_at: string;
  updated_at: string;

  // ✅ ADDED: Missing fields that come from API
  late_fee?: string | number;
  days_overdue?: number;
  days_until_due?: number;

  // ✅ ADDED: Nested loan data (from API response)
  loan?: {
    id: number;
    loan_number: string;
    principal_amount: string | number;
    tenure_months: number;
    interest_percentage?: string | number;
    interest_rate?: string | number;
    status: string;
    user?: {
      id: number;
      full_name: string;
      employee_id: string;
    };
    cash_account?: {
      id: number;
      code: string;
      name: string;
    };
  };
}

export interface LoanSummary {
  total_loans: number;
  active_loans: number;
  completed_loans: number;
  total_principal: number;
  total_outstanding: number;
  total_paid: number;
  overdue_count: number;
  overdue_amount: number;
}

export interface LoanSimulation {
  principal_amount: number;
  tenure_months: number;
  interest_rate: number;
  monthly_payment: number;
  total_interest: number;
  total_payment: number;
  installments: Array<{
    month: number;
    principal: number;
    interest: number;
    total: number;
    balance: number;
  }>;
}

// ✅ NEW: Eligibility Check Types
export interface LoanEligibility {
  user: {
    id: number;
    full_name: string;
    employee_id: string;
    email: string;
  };
  loan_summary: {
    active_loans_count: number;
    max_loans_allowed: number;
    remaining_slots: number;
    total_principal_borrowed: number;
    total_remaining_principal: number;
    total_monthly_installment: number;
    active_loans: Array<{
      loan_number: string;
      cash_account: string;
      principal_amount: number;
      remaining_principal: number;
      monthly_installment: number;
      status: string;
    }>;
  };
  available_cash_accounts: Array<{
    id: number;
    code: string;
    name: string;
    type: string;
    type_name: string;
    can_apply: boolean;
    reason: string | null;
    current_interest_rate: number | null;
  }>;
  check_result?: {
    cash_account: {
      id: number;
      code: string;
      name: string;
      type: string;
    };
    can_apply: boolean;
    reason: string | null;
  };
}

export interface CreateLoanData {
  user_id: number;
  cash_account_id: number;
  principal_amount: number;
  tenure_months: number;
  application_date: string;
  loan_purpose: string;
}

export interface UpdateLoanData {
  user_id?: number;
  cash_account_id?: number;
  principal_amount?: number;
  tenure_months?: number;
  application_date?: string;
  loan_purpose?: string;
}

export interface ApproveLoanData {
  status: "approved" | "rejected";
  disbursement_date?: string;
  rejection_reason?: string;
}

export interface PayInstallmentData {
  payment_method: "cash" | "transfer" | "service_allowance" | "deduction";
  notes?: string;
}

// ==================== API SERVICE ====================

const loansService = {
  // ==================== LOANS CRUD ====================

  /**
   * Get all loans with optional filters
   */
  getAll: async (params?: {
    all?: boolean;
    user_id?: number;
    status?: string;
    cash_account_id?: number;
  }) => {
    const response = await apiClient.get("/loans", { params });
    return response.data;
  },

  /**
   * Get loan by ID with details
   */
  getById: async (id: number) => {
    const response = await apiClient.get(`/loans/${id}`);
    return response.data;
  },

  /**
   * Create new loan application
   */
  create: async (data: CreateLoanData) => {
    const response = await apiClient.post("/loans", data);
    return response.data;
  },

  /**
   * Update loan application
   */
  update: async (id: number, data: UpdateLoanData) => {
    const response = await apiClient.put(`/loans/${id}`, data);
    return response.data;
  },

  /**
   * Delete loan application
   */
  delete: async (id: number) => {
    const response = await apiClient.delete(`/loans/${id}`);
    return response.data;
  },

  // ==================== LOAN APPROVAL ====================

  /**
   * Approve or reject loan
   */
  approve: async (id: number, data: ApproveLoanData) => {
    const response = await apiClient.post(`/loans/${id}/approve`, data);
    return response.data;
  },

  // ==================== INSTALLMENTS ====================

  /**
   * Get installments for a specific loan
   */
  getInstallments: async (loanId: number) => {
    const response = await apiClient.get(`/loans/${loanId}/installments`);
    return response.data;
  },

  /**
   * Get installment schedule for a loan
   */
  getSchedule: async (loanId: number) => {
    const response = await apiClient.get(`/loans/${loanId}/schedule`);
    return response.data;
  },

  /**
   * Get single installment detail
   */
  getInstallmentById: async (installmentId: number) => {
    const response = await apiClient.get(`/installments/${installmentId}`);
    return response.data;
  },

  /**
   * Pay installment (both manual and auto)
   */
  payInstallment: async (installmentId: number, data: PayInstallmentData) => {
    const response = await apiClient.post(
      `/installments/${installmentId}/pay`,
      data
    );
    return response.data;
  },

  /**
   * Get upcoming installments
   */
  getUpcomingInstallments: async (days: number = 7) => {
    const response = await apiClient.get("/installments/upcoming", {
      params: { days },
    });
    return response.data;
  },

  /**
   * Get overdue installments
   */
  getOverdueInstallments: async () => {
    const response = await apiClient.get("/installments/overdue");
    return response.data;
  },

  // ==================== REPORTS & TOOLS ====================

  /**
   * Get loan summary/statistics
   */
  getSummary: async (userId?: number) => {
    const response = await apiClient.get("/loans/summary", {
      params: userId ? { user_id: userId } : undefined,
    });
    return response.data;
  },

  /**
   * Simulate loan calculation
   */
  simulate: async (data: {
    principal_amount: number;
    tenure_months: number;
    cash_account_id: number;
  }) => {
    const response = await apiClient.post("/loans/simulate", data);
    return response.data;
  },

  // ✅ NEW: Check loan eligibility (Problem 3 - Loan Limit)
  /**
   * Check if user can apply for loan in specific cash account
   * Returns available cash accounts and loan limit status
   */
  checkEligibility: async (data: {
    user_id: number;
    cash_account_id?: number;
  }): Promise<{ data: LoanEligibility }> => {
    const response = await apiClient.post("/loans/check-eligibility", data);
    return response.data;
  },

  // ==================== HELPER METHODS ====================

  /**
   * Helper: Format currency to IDR
   */
  formatCurrency: (amount: number | string): string => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount);
  },

  /**
   * Helper: Get status badge color
   */
  getStatusColor: (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    const colors: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      pending: "outline",
      approved: "default",
      rejected: "destructive",
      active: "default",
      completed: "secondary",
      overdue: "destructive",
    };
    return colors[status] || "default";
  },

  /**
   * Helper: Get status label in Indonesian
   */
  getStatusLabel: (status: string): string => {
    const labels: Record<string, string> = {
      pending: "Menunggu Persetujuan",
      approved: "Disetujui",
      rejected: "Ditolak",
      active: "Aktif",
      completed: "Lunas",
      overdue: "Terlambat",
    };
    return labels[status] || status;
  },

  /**
   * Helper: Parse numeric value (handles string/number)
   */
  parseAmount: (amount: string | number): number => {
    return typeof amount === "string" ? parseFloat(amount) : amount;
  },

  /**
   * Helper: Calculate total from installments
   */
  calculateTotal: (
    principal: string | number,
    interest: string | number
  ): number => {
    const p = loansService.parseAmount(principal);
    const i = loansService.parseAmount(interest);
    return p + i;
  },

  /**
   * Helper: Check if loan is overdue
   */
  isOverdue: (dueDate: string): boolean => {
    return new Date(dueDate) < new Date();
  },

  /**
   * Helper: Get days until due
   */
  getDaysUntilDue: (dueDate: string): number => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },
};

export default loansService;
