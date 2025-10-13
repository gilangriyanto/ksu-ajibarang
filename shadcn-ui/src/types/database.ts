export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'member' | 'manager';
  nik?: string;
  phone?: string;
  address?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: string;
  member_id: string;
  amount: number;
  tenor_months: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
  interest_rate: number;
  monthly_payment: number;
  remaining_balance: number;
  approved_by?: string;
  approved_at?: string;
  disbursed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  amount: number;
  principal_amount: number;
  interest_amount: number;
  payment_date: string;
  payment_method: 'auto_debit' | 'manual';
  created_at: string;
}

export interface Savings {
  id: string;
  member_id: string;
  type: 'pokok' | 'wajib' | 'sukarela';
  amount: number;
  transaction_date: string;
  description?: string;
  created_at: string;
}

export interface Member {
  id: string;
  profile_id: string;
  employee_id: string;
  department: string;
  position: string;
  monthly_service_fee: number;
  join_date: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalMembers: number;
  totalLoansOutstanding: number;
  totalSavings: number;
  pendingLoanApplications: number;
  overduePayments: number;
}

export interface MemberDashboardStats {
  totalActiveLoans: number;
  monthlyInstallment: number;
  totalSavings: number;
  nextPaymentDate?: string;
}