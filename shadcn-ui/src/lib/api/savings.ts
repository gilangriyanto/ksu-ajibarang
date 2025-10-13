export interface SavingsAccount {
  id: string;
  account_number: string;
  member_id: string;
  member_name: string;
  member_number: string;
  account_type: 'mandatory' | 'voluntary' | 'special';
  balance: number;
  last_transaction: string;
  monthly_deposit: number;
  status: 'active' | 'inactive' | 'frozen';
  created_at: string;
  updated_at: string;
}

export interface SavingsTransaction {
  id: string;
  account_id: string;
  account_number: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  description: string;
  balance_after: number;
  created_at: string;
}

export interface CreateSavingsAccountData {
  member_id: string;
  account_type: 'mandatory' | 'voluntary' | 'special';
  monthly_deposit: number;
}

export interface CreateTransactionData {
  account_id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  description: string;
}

// Mock data
let mockSavingsAccounts: SavingsAccount[] = [
  {
    id: '1',
    account_number: 'S001001',
    member_id: '1',
    member_name: 'Dr. Ahmad Santoso',
    member_number: 'M001',
    account_type: 'mandatory',
    balance: 15000000,
    last_transaction: '2024-01-28',
    monthly_deposit: 500000,
    status: 'active',
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2024-01-28T10:30:00Z',
  },
  {
    id: '2',
    account_number: 'S002001',
    member_id: '2',
    member_name: 'Ns. Siti Rahayu',
    member_number: 'M002',
    account_type: 'voluntary',
    balance: 8000000,
    last_transaction: '2024-01-25',
    monthly_deposit: 300000,
    status: 'active',
    created_at: '2023-02-20T00:00:00Z',
    updated_at: '2024-01-25T09:15:00Z',
  },
];

let mockTransactions: SavingsTransaction[] = [
  {
    id: '1',
    account_id: '1',
    account_number: 'S001001',
    type: 'deposit',
    amount: 500000,
    date: '2024-01-28',
    description: 'Setoran Bulanan Januari 2024',
    balance_after: 15000000,
    created_at: '2024-01-28T10:30:00Z',
  },
  {
    id: '2',
    account_id: '2',
    account_number: 'S002001',
    type: 'deposit',
    amount: 300000,
    date: '2024-01-25',
    description: 'Setoran Sukarela',
    balance_after: 8000000,
    created_at: '2024-01-25T09:15:00Z',
  },
];

export class SavingsService {
  async getSavingsAccounts(): Promise<SavingsAccount[]> {
    try {
      return mockSavingsAccounts;
    } catch (error) {
      console.error('Error fetching savings accounts:', error);
      throw error;
    }
  }

  async getSavingsAccountById(id: string): Promise<SavingsAccount | null> {
    try {
      return mockSavingsAccounts.find(a => a.id === id) || null;
    } catch (error) {
      console.error('Error fetching savings account:', error);
      throw error;
    }
  }

  async getSavingsAccountsByMember(memberId: string): Promise<SavingsAccount[]> {
    try {
      return mockSavingsAccounts.filter(a => a.member_id === memberId);
    } catch (error) {
      console.error('Error fetching member savings accounts:', error);
      throw error;
    }
  }

  async createSavingsAccount(data: CreateSavingsAccountData): Promise<SavingsAccount> {
    try {
      const accountTypePrefix = {
        mandatory: 'S001',
        voluntary: 'S002',
        special: 'S003',
      };

      const newAccount: SavingsAccount = {
        id: Date.now().toString(),
        account_number: `${accountTypePrefix[data.account_type]}${String(mockSavingsAccounts.length + 1).padStart(3, '0')}`,
        member_name: 'Member Name', // In production, fetch from member service
        member_number: 'M001', // In production, fetch from member service
        ...data,
        balance: 0,
        last_transaction: new Date().toISOString().split('T')[0],
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSavingsAccounts.push(newAccount);
      return newAccount;
    } catch (error) {
      console.error('Error creating savings account:', error);
      throw error;
    }
  }

  async updateSavingsAccount(id: string, data: Partial<SavingsAccount>): Promise<SavingsAccount> {
    try {
      const index = mockSavingsAccounts.findIndex(a => a.id === id);
      if (index === -1) {
        throw new Error('Savings account not found');
      }

      mockSavingsAccounts[index] = {
        ...mockSavingsAccounts[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      return mockSavingsAccounts[index];
    } catch (error) {
      console.error('Error updating savings account:', error);
      throw error;
    }
  }

  async createTransaction(data: CreateTransactionData): Promise<SavingsTransaction> {
    try {
      const account = await this.getSavingsAccountById(data.account_id);
      if (!account) {
        throw new Error('Savings account not found');
      }

      const newBalance = data.type === 'deposit' 
        ? account.balance + data.amount
        : account.balance - data.amount;

      if (newBalance < 0) {
        throw new Error('Insufficient balance');
      }

      const newTransaction: SavingsTransaction = {
        id: Date.now().toString(),
        account_number: account.account_number,
        ...data,
        date: new Date().toISOString().split('T')[0],
        balance_after: newBalance,
        created_at: new Date().toISOString(),
      };

      mockTransactions.push(newTransaction);

      // Update account balance
      await this.updateSavingsAccount(data.account_id, {
        balance: newBalance,
        last_transaction: newTransaction.date,
      });

      return newTransaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async getTransactions(accountId?: string): Promise<SavingsTransaction[]> {
    try {
      if (accountId) {
        return mockTransactions.filter(t => t.account_id === accountId);
      }
      return mockTransactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      const index = mockTransactions.findIndex(t => t.id === id);
      if (index === -1) {
        throw new Error('Transaction not found');
      }

      mockTransactions.splice(index, 1);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }
}

export const savingsService = new SavingsService();