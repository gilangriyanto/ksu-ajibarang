export interface IncomeStatementData {
  period_id: string;
  period_name: string;
  generated_at: string;
  revenue: {
    loan_interest_income: number;
    administration_income: number;
    other_income: number;
    total_revenue: number;
  };
  expenses: {
    operational_expenses: number;
    administrative_expenses: number;
    depreciation_expenses: number;
    other_expenses: number;
    total_expenses: number;
  };
  net_income: number;
}

export interface CashFlowData {
  period_id: string;
  period_name: string;
  generated_at: string;
  operating_activities: {
    cash_from_members: number;
    cash_from_loans: number;
    cash_paid_expenses: number;
    net_operating_cash: number;
  };
  investing_activities: {
    equipment_purchases: number;
    asset_sales: number;
    net_investing_cash: number;
  };
  financing_activities: {
    member_contributions: number;
    loan_repayments: number;
    net_financing_cash: number;
  };
  net_cash_flow: number;
  beginning_cash: number;
  ending_cash: number;
}

export interface TrialBalanceData {
  period_id: string;
  period_name: string;
  generated_at: string;
  accounts: TrialBalanceAccount[];
  total_debits: number;
  total_credits: number;
  is_balanced: boolean;
}

export interface TrialBalanceAccount {
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  debit_balance: number;
  credit_balance: number;
}

export interface FinancialSummary {
  period_name: string;
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  total_revenue: number;
  total_expenses: number;
  net_income: number;
  cash_position: number;
  member_savings: number;
  outstanding_loans: number;
}