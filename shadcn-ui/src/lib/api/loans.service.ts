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
};

export default loansService;
