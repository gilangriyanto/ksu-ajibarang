export interface Savings {
  id: string;
  member_id: string;
  month: number;
  year: number;
  simpanan_pokok: number;
  simpanan_wajib: number;
  simpanan_sukarela: number;
  total: number;
  created_at: string;
  created_by: string;
  updated_at: string;
  // Relations
  member?: {
    full_name: string;
    employee_id: string;
  };
}

export interface SavingsTransaction {
  id: string;
  member_id: string;
  transaction_date: string;
  type: 'pokok' | 'wajib' | 'sukarela' | 'withdrawal';
  amount: number;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Relations
  member?: {
    full_name: string;
    employee_id: string;
  };
}

export interface SavingsSummary {
  member_id: string;
  full_name: string;
  employee_id: string;
  total_pokok: number;
  total_wajib: number;
  total_sukarela: number;
  total_savings: number;
  months_count: number;
  last_updated: string;
}

export interface AutoDebitBatch {
  id: string;
  batch_date: string;
  period_month: number;
  period_year: number;
  total_members: number;
  total_amount: number;
  processed_by: string;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface SavingsForm {
  transaction_date: string;
  type: 'pokok' | 'wajib' | 'sukarela';
  amount: number;
  description?: string;
}

export interface PayrollData {
  nik: string;
  nama: string;
  bulan: number;
  tahun: number;
  nominal_gaji: number;
}

export interface InstallmentMonitoring {
  id: string;
  member_name: string;
  employee_id: string;
  loan_id: string;
  monthly_payment: number;
  due_date: string;
  payment_date?: string;
  status: 'paid' | 'pending' | 'overdue';
}

export const SAVINGS_CONSTANTS = {
  SIMPANAN_POKOK: 100000, // Rp 100,000
  MIN_SIMPANAN_WAJIB: 50000, // Rp 50,000
  SAVINGS_TYPES: [
    { value: 'pokok', label: 'Simpanan Pokok', description: 'Rp 100.000 (sekali saat bergabung)' },
    { value: 'wajib', label: 'Simpanan Wajib', description: 'Minimal Rp 50.000/bulan' },
    { value: 'sukarela', label: 'Simpanan Sukarela', description: 'Bebas sesuai kemampuan' },
  ],
};