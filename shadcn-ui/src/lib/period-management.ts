import { AccountingPeriod, ClosingEntry, PeriodCloseRequest, BalanceSheetData } from '@/types/period';
import { JournalEntry } from '@/types/accounting';

// Mock data for periods
const mockPeriods: AccountingPeriod[] = [
  {
    id: '1',
    year: 2023,
    month: 12,
    status: 'closed',
    open_date: '2023-12-01',
    close_date: '2024-01-05',
    closed_by: 'Manager Admin',
    closing_notes: 'Penutupan periode Desember 2023',
    is_active: false,
    created_at: '2023-12-01T00:00:00Z',
    updated_at: '2024-01-05T10:30:00Z',
  },
  {
    id: '2',
    year: 2024,
    month: 1,
    status: 'open',
    open_date: '2024-01-01',
    closed_by: undefined,
    closing_notes: undefined,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export class PeriodManager {
  private periods: AccountingPeriod[] = mockPeriods;

  // Get all periods
  getAllPeriods(): AccountingPeriod[] {
    return this.periods.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }

  // Get active period
  getActivePeriod(): AccountingPeriod | null {
    return this.periods.find(p => p.is_active) || null;
  }

  // Get period by ID
  getPeriodById(id: string): AccountingPeriod | null {
    return this.periods.find(p => p.id === id) || null;
  }

  // Open new period
  openNewPeriod(year: number, month: number): AccountingPeriod {
    // Deactivate current active period
    this.periods = this.periods.map(p => ({ ...p, is_active: false }));

    const newPeriod: AccountingPeriod = {
      id: Date.now().toString(),
      year,
      month,
      status: 'open',
      open_date: new Date().toISOString().split('T')[0],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.periods.push(newPeriod);
    return newPeriod;
  }

  // Validate period closure requirements
  validatePeriodClosure(periodId: string): {
    canClose: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Mock validation - in real app, check database
    const pendingTransactions = 0; // Mock: no pending transactions
    const pendingJournals = 0; // Mock: no pending journals

    if (pendingTransactions > 0) {
      issues.push(`${pendingTransactions} transaksi belum dijurnal`);
    }

    if (pendingJournals > 0) {
      issues.push(`${pendingJournals} jurnal masih pending`);
    }

    return {
      canClose: issues.length === 0,
      issues,
    };
  }

  // Generate closing entries
  generateClosingEntries(periodId: string): ClosingEntry[] {
    const closingEntries: ClosingEntry[] = [];

    // Mock closing entries - in real app, calculate from actual account balances
    
    // Close revenue accounts to Current Year Earnings
    closingEntries.push({
      id: `closing_${Date.now()}_1`,
      period_id: periodId,
      entry_type: 'closing',
      account_code: '4-11-001',
      account_name: 'Pendapatan Bunga Pinjaman',
      debit: 50000000, // Close revenue (debit)
      credit: 0,
      description: 'Penutupan akun pendapatan',
      created_at: new Date().toISOString(),
    });

    closingEntries.push({
      id: `closing_${Date.now()}_2`,
      period_id: periodId,
      entry_type: 'closing',
      account_code: '4-12-001',
      account_name: 'Pendapatan Administrasi',
      debit: 15000000,
      credit: 0,
      description: 'Penutupan akun pendapatan',
      created_at: new Date().toISOString(),
    });

    // Close expense accounts to Current Year Earnings
    closingEntries.push({
      id: `closing_${Date.now()}_3`,
      period_id: periodId,
      entry_type: 'closing',
      account_code: '5-11-001',
      account_name: 'Beban Operasional',
      debit: 0,
      credit: 25000000, // Close expense (credit)
      description: 'Penutupan akun beban',
      created_at: new Date().toISOString(),
    });

    closingEntries.push({
      id: `closing_${Date.now()}_4`,
      period_id: periodId,
      entry_type: 'closing',
      account_code: '5-12-001',
      account_name: 'Beban Administrasi',
      debit: 0,
      credit: 10000000,
      description: 'Penutupan akun beban',
      created_at: new Date().toISOString(),
    });

    // Net income to Current Year Earnings
    const netIncome = 65000000 - 35000000; // Revenue - Expenses
    closingEntries.push({
      id: `closing_${Date.now()}_5`,
      period_id: periodId,
      entry_type: 'closing',
      account_code: '3-15-001',
      account_name: 'Laba Tahun Berjalan',
      debit: 0,
      credit: netIncome,
      description: 'Transfer laba bersih ke laba tahun berjalan',
      created_at: new Date().toISOString(),
    });

    return closingEntries;
  }

  // Close period
  closePeriod(request: PeriodCloseRequest): {
    success: boolean;
    message: string;
    closingEntries?: ClosingEntry[];
  } {
    const period = this.getPeriodById(request.period_id);
    if (!period) {
      return { success: false, message: 'Periode tidak ditemukan' };
    }

    if (period.status === 'closed') {
      return { success: false, message: 'Periode sudah ditutup' };
    }

    // Validate confirmations
    const { all_transactions_journaled, no_pending_journals, reports_reviewed } = request.confirmations;
    if (!all_transactions_journaled || !no_pending_journals || !reports_reviewed) {
      return { success: false, message: 'Semua konfirmasi harus dicentang' };
    }

    // Validate period can be closed
    const validation = this.validatePeriodClosure(request.period_id);
    if (!validation.canClose) {
      return { 
        success: false, 
        message: `Periode tidak dapat ditutup: ${validation.issues.join(', ')}` 
      };
    }

    // Generate closing entries
    const closingEntries = this.generateClosingEntries(request.period_id);

    // Update period status
    this.periods = this.periods.map(p => 
      p.id === request.period_id 
        ? {
            ...p,
            status: 'closed' as const,
            close_date: new Date().toISOString().split('T')[0],
            closed_by: 'Current User', // In real app, get from auth context
            closing_notes: request.closing_notes,
            is_active: false,
            updated_at: new Date().toISOString(),
          }
        : p
    );

    return {
      success: true,
      message: 'Periode berhasil ditutup',
      closingEntries,
    };
  }

  // Generate balance sheet
  generateBalanceSheet(periodId: string): BalanceSheetData {
    const period = this.getPeriodById(periodId);
    if (!period) {
      throw new Error('Periode tidak ditemukan');
    }

    // Mock balance sheet data - in real app, calculate from journal entries
    const balanceSheet: BalanceSheetData = {
      period_id: periodId,
      period_name: `${this.getMonthName(period.month)} ${period.year}`,
      generated_at: new Date().toISOString(),
      current_assets: {
        cash: 150000000,
        bank: 500000000,
        receivables: 75000000,
        total: 725000000,
      },
      fixed_assets: {
        equipment: 200000000,
        accumulated_depreciation: -50000000,
        net_total: 150000000,
      },
      total_assets: 875000000,
      liabilities: {
        short_term_debt: 125000000,
        total: 125000000,
      },
      equity: {
        share_capital: 100000000,
        mandatory_savings: 300000000,
        voluntary_savings: 200000000,
        retained_earnings: 120000000,
        current_year_earnings: 30000000,
        total: 750000000,
      },
      total_liabilities_equity: 875000000,
    };

    return balanceSheet;
  }

  private getMonthName(month: number): string {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1];
  }
}

// Export singleton instance
export const periodManager = new PeriodManager();