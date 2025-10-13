import { IncomeStatementData, CashFlowData, TrialBalanceData, TrialBalanceAccount, FinancialSummary } from '@/types/financial-reports';

// Mock data generators for financial reports
export function generateMockIncomeStatement(periodId: string): IncomeStatementData {
  return {
    period_id: periodId,
    period_name: 'Februari 2024',
    generated_at: new Date().toISOString(),
    revenue: {
      loan_interest_income: 85000000,
      administration_income: 25000000,
      other_income: 15000000,
      total_revenue: 125000000,
    },
    expenses: {
      operational_expenses: 45000000,
      administrative_expenses: 20000000,
      depreciation_expenses: 8000000,
      other_expenses: 12000000,
      total_expenses: 85000000,
    },
    net_income: 40000000,
  };
}

export function generateMockCashFlow(periodId: string): CashFlowData {
  return {
    period_id: periodId,
    period_name: 'Februari 2024',
    generated_at: new Date().toISOString(),
    operating_activities: {
      cash_from_members: 150000000,
      cash_from_loans: 200000000,
      cash_paid_expenses: -75000000,
      net_operating_cash: 275000000,
    },
    investing_activities: {
      equipment_purchases: -50000000,
      asset_sales: 10000000,
      net_investing_cash: -40000000,
    },
    financing_activities: {
      member_contributions: 100000000,
      loan_repayments: -180000000,
      net_financing_cash: -80000000,
    },
    net_cash_flow: 155000000,
    beginning_cash: 150000000,
    ending_cash: 305000000,
  };
}

export function generateMockTrialBalance(periodId: string): TrialBalanceData {
  const accounts: TrialBalanceAccount[] = [
    // Assets
    { account_code: '1-11-001', account_name: 'Kas', account_type: 'asset', debit_balance: 150000000, credit_balance: 0 },
    { account_code: '1-12-001', account_name: 'Bank BRI', account_type: 'asset', debit_balance: 500000000, credit_balance: 0 },
    { account_code: '1-13-001', account_name: 'Piutang Anggota', account_type: 'asset', debit_balance: 75000000, credit_balance: 0 },
    { account_code: '1-21-001', account_name: 'Peralatan Kantor', account_type: 'asset', debit_balance: 300000000, credit_balance: 0 },
    { account_code: '1-22-001', account_name: 'Akum. Penyusutan Peralatan', account_type: 'asset', debit_balance: 0, credit_balance: 50000000 },
    
    // Liabilities
    { account_code: '2-11-001', account_name: 'Utang Usaha', account_type: 'liability', debit_balance: 0, credit_balance: 125000000 },
    
    // Equity
    { account_code: '3-11-001', account_name: 'Simpanan Pokok', account_type: 'equity', debit_balance: 0, credit_balance: 200000000 },
    { account_code: '3-12-001', account_name: 'Simpanan Wajib', account_type: 'equity', debit_balance: 0, credit_balance: 300000000 },
    { account_code: '3-13-001', account_name: 'Simpanan Sukarela', account_type: 'equity', debit_balance: 0, credit_balance: 250000000 },
    { account_code: '3-21-001', account_name: 'Laba Ditahan', account_type: 'equity', debit_balance: 0, credit_balance: 75000000 },
    
    // Revenue
    { account_code: '4-11-001', account_name: 'Pendapatan Bunga Pinjaman', account_type: 'revenue', debit_balance: 0, credit_balance: 85000000 },
    { account_code: '4-12-001', account_name: 'Pendapatan Administrasi', account_type: 'revenue', debit_balance: 0, credit_balance: 25000000 },
    
    // Expenses
    { account_code: '5-11-001', account_name: 'Beban Operasional', account_type: 'expense', debit_balance: 45000000, credit_balance: 0 },
    { account_code: '5-12-001', account_name: 'Beban Administrasi', account_type: 'expense', debit_balance: 20000000, credit_balance: 0 },
    { account_code: '5-13-001', account_name: 'Beban Penyusutan', account_type: 'expense', debit_balance: 8000000, credit_balance: 0 },
  ];

  const total_debits = accounts.reduce((sum, account) => sum + account.debit_balance, 0);
  const total_credits = accounts.reduce((sum, account) => sum + account.credit_balance, 0);

  return {
    period_id: periodId,
    period_name: 'Februari 2024',
    generated_at: new Date().toISOString(),
    accounts,
    total_debits,
    total_credits,
    is_balanced: Math.abs(total_debits - total_credits) < 1,
  };
}

export function generateFinancialSummary(periodId: string): FinancialSummary {
  return {
    period_name: 'Februari 2024',
    total_assets: 975000000,
    total_liabilities: 125000000,
    total_equity: 850000000,
    total_revenue: 125000000,
    total_expenses: 85000000,
    net_income: 40000000,
    cash_position: 650000000,
    member_savings: 750000000,
    outstanding_loans: 1200000000,
  };
}

// Real implementation functions (for production use)
export async function generateIncomeStatement(periodId: string): Promise<IncomeStatementData> {
  // In production, this would query the database
  // const { data, error } = await supabase
  //   .from('journal_entries')
  //   .select('...')
  //   .eq('period_id', periodId);
  
  return generateMockIncomeStatement(periodId);
}

export async function generateCashFlowStatement(periodId: string): Promise<CashFlowData> {
  // In production, this would analyze cash transactions
  return generateMockCashFlow(periodId);
}

export async function generateTrialBalance(periodId: string): Promise<TrialBalanceData> {
  // In production, this would calculate account balances
  return generateMockTrialBalance(periodId);
}