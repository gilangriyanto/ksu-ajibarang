export interface AccountingPeriod {
  id: string;
  year: number;
  month: number;
  status: 'open' | 'closed';
  open_date: string;
  close_date?: string;
  closed_by?: string;
  closing_notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClosingEntry {
  id: string;
  period_id: string;
  entry_type: 'closing' | 'reversing';
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  description: string;
  created_at: string;
}

export interface PeriodCloseRequest {
  period_id: string;
  closing_notes: string;
  confirmations: {
    all_transactions_journaled: boolean;
    no_pending_journals: boolean;
    reports_reviewed: boolean;
  };
}

export interface BalanceSheetData {
  period_id: string;
  period_name: string;
  generated_at: string;
  current_assets: {
    cash: number;
    bank: number;
    receivables: number;
    total: number;
  };
  fixed_assets: {
    equipment: number;
    accumulated_depreciation: number;
    net_total: number;
  };
  total_assets: number;
  liabilities: {
    short_term_debt: number;
    total: number;
  };
  equity: {
    share_capital: number;
    mandatory_savings: number;
    voluntary_savings: number;
    retained_earnings: number;
    current_year_earnings: number;
    total: number;
  };
  total_liabilities_equity: number;
}