// types/loan.ts
// Updated types to match backend API response

export interface Loan {
  id: number;
  user_id: number;
  cash_account_id: number;
  loan_number: string;
  principal_amount: number;
  interest_percentage: number;
  tenure_months: number;
  installment_amount: number;
  remaining_principal: number;
  status: 'pending' | 'disbursed' | 'active' | 'paid_off' | 'rejected';
  application_date: string;
  approval_date?: string;
  disbursement_date?: string;
  loan_purpose: string;
  document_path?: string;
  rejection_reason?: string;
  approved_by?: number;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  total_amount?: number;
  total_interest?: number;
  paid_installments_count?: number;
  pending_installments_count?: number;
  overdue_installments_count?: number;
  
  // Relations
  user?: {
    id: number;
    full_name: string;
    employee_id: string;
    email?: string;
  };
  
  cash_account?: {
    id: number;
    code: string;
    name: string;
    type: string;
  };
  
  approved_by_user?: {
    id: number;
    full_name: string;
  };
  
  installments?: Installment[];
}

export interface Installment {
  id: number;
  loan_id: number;
  installment_number: number;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  paid_amount?: number;
  payment_date?: string;
  payment_method?: 'auto_paid' | 'manual' | 'service_allowance';
  status: 'pending' | 'paid' | 'auto_paid' | 'overdue';
  created_at: string;
  updated_at: string;
  
  // Computed fields
  days_until_due?: number;
  days_overdue?: number;
}

export interface LoanSummary {
  user?: {
    id: number;
    full_name: string;
    employee_id: string;
  };
  total_active_loans: number;
  total_principal_borrowed: number;
  total_remaining_principal: number;
  total_monthly_installment: number;
  loan_history: {
    completed: number;
    rejected: number;
  };
}

export interface LoanSimulation {
  principal_amount: number;
  interest_percentage: number;
  tenure_months: number;
  monthly_installment: number;
  total_amount: number;
  total_interest: number;
  effective_rate: number;
}

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

// Form Data Types
export interface CreateLoanData {
  user_id: number;
  cash_account_id: number;
  principal_amount: number;
  tenure_months: number;
  application_date: string;
  loan_purpose: string;
  document_path?: string;
}

export interface UpdateLoanData {
  user_id?: number;
  cash_account_id?: number;
  principal_amount?: number;
  tenure_months?: number;
  application_date?: string;
  loan_purpose?: string;
  document_path?: string;
}

export interface ApproveLoanData {
  status: 'approved' | 'rejected';
  disbursement_date?: string;
  rejection_reason?: string;
}

export interface SimulateLoanData {
  principal_amount: number;
  tenure_months: number;
  cash_account_id: number;
}

export interface CheckEligibilityData {
  user_id: number;
  cash_account_id?: number;
}

// API Response Types
export interface LoansResponse {
  success: boolean;
  message: string;
  data: Loan[] | {
    data: Loan[];
    meta?: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}

export interface LoanResponse {
  success: boolean;
  message: string;
  data: Loan;
}

export interface LoanSummaryResponse {
  success: boolean;
  message: string;
  data: LoanSummary;
}

export interface LoanSimulationResponse {
  success: boolean;
  message: string;
  data: LoanSimulation;
}

export interface LoanEligibilityResponse {
  success: boolean;
  message: string;
  data: LoanEligibility;
}