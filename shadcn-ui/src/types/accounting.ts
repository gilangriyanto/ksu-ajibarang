export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  normal_balance: 'debit' | 'credit';
  parent_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  parent?: ChartOfAccount;
  children?: ChartOfAccount[];
  level?: number;
}

export interface AccountingPeriod {
  id: string;
  year: number;
  month: number;
  status: 'open' | 'closed';
  opened_date: string;
  closed_date?: string;
  closed_by?: string;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  journal_number: string;
  journal_type: 'general' | 'special' | 'adjustment' | 'closing' | 'reversing';
  entry_date: string;
  period_id: string;
  description: string;
  reference_type?: string;
  reference_id?: string;
  is_auto_generated: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Relations
  period?: AccountingPeriod;
  lines?: JournalEntryLine[];
  creator?: {
    full_name: string;
  };
}

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  debit: number;
  credit: number;
  description?: string;
  line_number: number;
  created_at: string;
  // Relations
  account?: ChartOfAccount;
}

export interface JournalEntryForm {
  entry_date: string;
  journal_type: 'general' | 'adjustment';
  description: string;
  lines: JournalLineForm[];
}

export interface JournalLineForm {
  account_id: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface COAForm {
  code: string;
  name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  normal_balance: 'debit' | 'credit';
  parent_id?: string;
  is_active: boolean;
}

export interface AutoJournalParams {
  transactionType: 'loan_disbursement' | 'loan_payment' | 'savings_deposit';
  data: {
    amount: number;
    principal_amount?: number;
    interest_amount?: number;
    member_id: string;
    reference_id: string;
    description: string;
    savings_type?: 'pokok' | 'wajib' | 'sukarela';
  };
  entry_date: string;
  created_by: string;
}

export const ACCOUNT_TYPES = [
  { value: 'asset', label: 'Aset', normal_balance: 'debit' },
  { value: 'liability', label: 'Liabilitas', normal_balance: 'credit' },
  { value: 'equity', label: 'Ekuitas', normal_balance: 'credit' },
  { value: 'revenue', label: 'Pendapatan', normal_balance: 'credit' },
  { value: 'expense', label: 'Beban', normal_balance: 'debit' },
] as const;

export const JOURNAL_TYPES = [
  { value: 'general', label: 'Jurnal Umum' },
  { value: 'special', label: 'Jurnal Khusus' },
  { value: 'adjustment', label: 'Jurnal Penyesuaian' },
  { value: 'closing', label: 'Jurnal Penutup' },
  { value: 'reversing', label: 'Jurnal Balik' },
] as const;

// Standard account codes for auto-journal generation
export const STANDARD_ACCOUNTS = {
  CASH: '1-1100',
  BANK: '1-1200',
  ACCOUNTS_RECEIVABLE: '1-1300',
  SIMPANAN_POKOK: '3-1200',
  SIMPANAN_WAJIB: '3-1300',
  SIMPANAN_SUKARELA: '3-1400',
  INTEREST_REVENUE: '4-1100',
} as const;