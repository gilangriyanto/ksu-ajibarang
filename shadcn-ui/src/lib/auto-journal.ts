import { AutoJournalParams, STANDARD_ACCOUNTS } from '@/types/accounting';

// Auto Journal Generation Functions
export class AutoJournalGenerator {
  
  /**
   * Create auto journal entry for loan disbursement
   * Debit: Piutang Anggota (1-1300) = principal_amount
   * Credit: Kas/Bank (1-1100/1-1200) = principal_amount
   */
  static createLoanDisbursementJournal(params: AutoJournalParams) {
    const { data, entry_date, created_by } = params;
    
    return {
      journal_type: 'general' as const,
      entry_date,
      description: `Pencairan Pinjaman - ${data.description}`,
      reference_type: 'loan',
      reference_id: data.reference_id,
      is_auto_generated: true,
      created_by,
      lines: [
        {
          account_code: STANDARD_ACCOUNTS.ACCOUNTS_RECEIVABLE,
          debit: data.amount,
          credit: 0,
          description: 'Pencairan pinjaman',
          line_number: 1,
        },
        {
          account_code: STANDARD_ACCOUNTS.CASH,
          debit: 0,
          credit: data.amount,
          description: 'Pencairan pinjaman',
          line_number: 2,
        },
      ],
    };
  }

  /**
   * Create auto journal entry for loan payment
   * Debit: Kas/Bank (1-1100) = total_payment
   * Credit: Piutang Anggota (1-1300) = principal_amount
   * Credit: Pendapatan Bunga (4-1100) = interest_amount
   */
  static createLoanPaymentJournal(params: AutoJournalParams) {
    const { data, entry_date, created_by } = params;
    const { amount, principal_amount = 0, interest_amount = 0 } = data;
    
    const lines = [
      {
        account_code: STANDARD_ACCOUNTS.CASH,
        debit: amount,
        credit: 0,
        description: 'Pembayaran angsuran',
        line_number: 1,
      },
    ];

    let lineNumber = 2;
    
    if (principal_amount > 0) {
      lines.push({
        account_code: STANDARD_ACCOUNTS.ACCOUNTS_RECEIVABLE,
        debit: 0,
        credit: principal_amount,
        description: 'Pembayaran pokok pinjaman',
        line_number: lineNumber++,
      });
    }

    if (interest_amount > 0) {
      lines.push({
        account_code: STANDARD_ACCOUNTS.INTEREST_REVENUE,
        debit: 0,
        credit: interest_amount,
        description: 'Pendapatan bunga pinjaman',
        line_number: lineNumber++,
      });
    }

    return {
      journal_type: 'general' as const,
      entry_date,
      description: `Pembayaran Angsuran - ${data.description}`,
      reference_type: 'loan',
      reference_id: data.reference_id,
      is_auto_generated: true,
      created_by,
      lines,
    };
  }

  /**
   * Create auto journal entry for savings deposit
   * Debit: Kas/Bank (1-1100) = amount
   * Credit: Simpanan [Type] (3-1200/3-1300/3-1400) = amount
   */
  static createSavingsDepositJournal(params: AutoJournalParams) {
    const { data, entry_date, created_by } = params;
    const { savings_type } = data;
    
    let creditAccountCode: string;
    let savingsTypeName: string;
    
    switch (savings_type) {
      case 'pokok':
        creditAccountCode = STANDARD_ACCOUNTS.SIMPANAN_POKOK;
        savingsTypeName = 'Pokok';
        break;
      case 'wajib':
        creditAccountCode = STANDARD_ACCOUNTS.SIMPANAN_WAJIB;
        savingsTypeName = 'Wajib';
        break;
      case 'sukarela':
        creditAccountCode = STANDARD_ACCOUNTS.SIMPANAN_SUKARELA;
        savingsTypeName = 'Sukarela';
        break;
      default:
        throw new Error(`Invalid savings type: ${savings_type}`);
    }

    return {
      journal_type: 'general' as const,
      entry_date,
      description: `Setoran Simpanan ${savingsTypeName} - ${data.description}`,
      reference_type: 'saving',
      reference_id: data.reference_id,
      is_auto_generated: true,
      created_by,
      lines: [
        {
          account_code: STANDARD_ACCOUNTS.CASH,
          debit: data.amount,
          credit: 0,
          description: `Penerimaan simpanan ${savingsTypeName.toLowerCase()}`,
          line_number: 1,
        },
        {
          account_code: creditAccountCode,
          debit: 0,
          credit: data.amount,
          description: `Simpanan ${savingsTypeName.toLowerCase()} anggota`,
          line_number: 2,
        },
      ],
    };
  }

  /**
   * Main function to create auto journal based on transaction type
   */
  static async createAutoJournal(params: AutoJournalParams) {
    try {
      let journalData;

      switch (params.transactionType) {
        case 'loan_disbursement':
          journalData = this.createLoanDisbursementJournal(params);
          break;
        case 'loan_payment':
          journalData = this.createLoanPaymentJournal(params);
          break;
        case 'savings_deposit':
          journalData = this.createSavingsDepositJournal(params);
          break;
        default:
          throw new Error(`Unsupported transaction type: ${params.transactionType}`);
      }

      // Here you would typically save to database
      // For now, we'll just log and return the journal data
      console.log('Auto Journal Created:', journalData);
      
      return {
        success: true,
        journal_number: `AUTO-${Date.now()}`, // Mock journal number
        data: journalData,
      };

    } catch (error) {
      console.error('Error creating auto journal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate journal balance before saving
   */
  static validateJournalBalance(lines: Array<{ debit: number; credit: number }>) {
    const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);
    
    return {
      isBalanced: totalDebit === totalCredit,
      totalDebit,
      totalCredit,
      difference: Math.abs(totalDebit - totalCredit),
    };
  }

  /**
   * Generate journal number based on type and date
   */
  static generateJournalNumber(journalType: string, entryDate: string) {
    const date = new Date(entryDate);
    const yearMonth = date.toISOString().slice(0, 7).replace('-', '');
    const timestamp = Date.now().toString().slice(-4);
    
    const prefixes = {
      general: 'JU',
      special: 'JK',
      adjustment: 'JP',
      closing: 'JT',
      reversing: 'JB',
    };
    
    const prefix = prefixes[journalType as keyof typeof prefixes] || 'JU';
    return `${prefix}-${yearMonth}-${timestamp}`;
  }
}

// Integration hooks for transaction modules
export const integrationHooks = {
  /**
   * Hook to be called after loan disbursement
   */
  onLoanDisbursement: async (loanData: {
    loan_id: string;
    member_id: string;
    principal_amount: number;
    member_name: string;
    disbursement_date: string;
  }) => {
    const params: AutoJournalParams = {
      transactionType: 'loan_disbursement',
      data: {
        amount: loanData.principal_amount,
        member_id: loanData.member_id,
        reference_id: loanData.loan_id,
        description: `Member: ${loanData.member_name}`,
      },
      entry_date: loanData.disbursement_date,
      created_by: 'system',
    };

    return await AutoJournalGenerator.createAutoJournal(params);
  },

  /**
   * Hook to be called after loan payment
   */
  onLoanPayment: async (paymentData: {
    loan_id: string;
    member_id: string;
    total_amount: number;
    principal_amount: number;
    interest_amount: number;
    member_name: string;
    payment_date: string;
  }) => {
    const params: AutoJournalParams = {
      transactionType: 'loan_payment',
      data: {
        amount: paymentData.total_amount,
        principal_amount: paymentData.principal_amount,
        interest_amount: paymentData.interest_amount,
        member_id: paymentData.member_id,
        reference_id: paymentData.loan_id,
        description: `Member: ${paymentData.member_name}`,
      },
      entry_date: paymentData.payment_date,
      created_by: 'system',
    };

    return await AutoJournalGenerator.createAutoJournal(params);
  },

  /**
   * Hook to be called after savings deposit
   */
  onSavingsDeposit: async (savingsData: {
    transaction_id: string;
    member_id: string;
    amount: number;
    savings_type: 'pokok' | 'wajib' | 'sukarela';
    member_name: string;
    transaction_date: string;
  }) => {
    const params: AutoJournalParams = {
      transactionType: 'savings_deposit',
      data: {
        amount: savingsData.amount,
        member_id: savingsData.member_id,
        reference_id: savingsData.transaction_id,
        description: `Member: ${savingsData.member_name}`,
        savings_type: savingsData.savings_type,
      },
      entry_date: savingsData.transaction_date,
      created_by: 'system',
    };

    return await AutoJournalGenerator.createAutoJournal(params);
  },
};