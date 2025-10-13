export interface LoanApplication {
  id: string;
  member_id: string;
  amount: number;
  tenor_months: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_date: string;
  reviewed_by?: string;
  reviewed_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  member?: {
    full_name: string;
    employee_id: string;
  };
  reviewer?: {
    full_name: string;
  };
}

export interface Loan {
  id: string;
  application_id: string;
  member_id: string;
  principal_amount: number;
  interest_rate: number;
  tenor_months: number;
  monthly_payment: number;
  total_payment: number;
  remaining_balance: number;
  disbursement_date: string;
  status: 'active' | 'paid_off' | 'defaulted';
  created_at: string;
  updated_at: string;
  // Relations
  member?: {
    full_name: string;
    employee_id: string;
  };
  application?: LoanApplication;
  payments?: LoanPayment[];
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  payment_date: string;
  period_month: number;
  period_year: number;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  payment_method: 'auto_debit' | 'manual';
  status: 'paid' | 'pending' | 'overdue';
  created_at: string;
  updated_at: string;
}

export interface LoanCalculation {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: {
    month: number;
    principalAmount: number;
    interestAmount: number;
    totalAmount: number;
    remainingBalance: number;
  }[];
}

export interface LoanApplicationForm {
  amount: number;
  tenor_months: number;
  purpose: string;
}

export interface LoanApprovalForm {
  approved_amount: number;
  interest_rate: number;
  disbursement_date: string;
  notes?: string;
}