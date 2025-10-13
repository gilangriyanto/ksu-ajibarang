// CRUD Operations Library for Cooperative Management System
import { toast } from 'sonner';

// Member Management CRUD
export interface Member {
  id: string;
  memberNumber: string;
  fullName: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  totalSavings: number;
  totalLoans: number;
  address?: string;
  occupation?: string;
  emergencyContact?: string;
}

export interface Loan {
  id: string;
  loanNumber: string;
  memberName: string;
  memberNumber: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
  applicationDate: string;
  approvalDate?: string;
  dueDate?: string;
  remainingAmount: number;
  monthlyPayment: number;
  interestRate: number;
  term: number;
}

export interface SavingsAccount {
  id: string;
  accountNumber: string;
  memberName: string;
  memberNumber: string;
  accountType: 'mandatory' | 'voluntary' | 'special';
  balance: number;
  lastTransaction: string;
  monthlyDeposit: number;
  status: 'active' | 'inactive' | 'frozen';
}

export interface Transaction {
  id: string;
  accountNumber: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
}

// Mock data storage (in production, this would be replaced with API calls)
let membersData: Member[] = [
  {
    id: '1',
    memberNumber: 'M001',
    fullName: 'Dr. Ahmad Santoso',
    email: 'ahmad.santoso@rs.com',
    phone: '081234567890',
    joinDate: '2023-01-15',
    status: 'active',
    totalSavings: 15000000,
    totalLoans: 50000000,
    address: 'Jl. Kesehatan No. 123, Jakarta',
    occupation: 'Dokter Spesialis',
    emergencyContact: '081234567891',
  },
  {
    id: '2',
    memberNumber: 'M002',
    fullName: 'Ns. Siti Rahayu',
    email: 'siti.rahayu@rs.com',
    phone: '081234567892',
    joinDate: '2023-02-20',
    status: 'active',
    totalSavings: 8000000,
    totalLoans: 0,
    address: 'Jl. Perawat No. 456, Jakarta',
    occupation: 'Perawat',
    emergencyContact: '081234567893',
  },
];

let loansData: Loan[] = [
  {
    id: '1',
    loanNumber: 'L2024001',
    memberName: 'Dr. Ahmad Santoso',
    memberNumber: 'M001',
    amount: 50000000,
    purpose: 'Renovasi Rumah',
    status: 'active',
    applicationDate: '2024-01-15',
    approvalDate: '2024-01-20',
    dueDate: '2026-01-20',
    remainingAmount: 35000000,
    monthlyPayment: 2500000,
    interestRate: 12,
    term: 24,
  },
];

let savingsData: SavingsAccount[] = [
  {
    id: '1',
    accountNumber: 'S001001',
    memberName: 'Dr. Ahmad Santoso',
    memberNumber: 'M001',
    accountType: 'mandatory',
    balance: 15000000,
    lastTransaction: '2024-01-28',
    monthlyDeposit: 500000,
    status: 'active',
  },
];

let transactionsData: Transaction[] = [
  {
    id: '1',
    accountNumber: 'S001001',
    type: 'deposit',
    amount: 500000,
    date: '2024-01-28',
    description: 'Setoran Bulanan Januari 2024',
    status: 'completed',
  },
];

// Member CRUD Operations
export const memberCRUD = {
  // Create
  create: async (memberData: Omit<Member, 'id' | 'memberNumber'>): Promise<Member> => {
    const newMember: Member = {
      ...memberData,
      id: Date.now().toString(),
      memberNumber: `M${String(membersData.length + 1).padStart(3, '0')}`,
    };
    membersData.push(newMember);
    toast.success('Anggota berhasil ditambahkan');
    return newMember;
  },

  // Read
  getAll: async (): Promise<Member[]> => {
    return membersData;
  },

  getById: async (id: string): Promise<Member | null> => {
    return membersData.find(member => member.id === id) || null;
  },

  // Update
  update: async (id: string, updateData: Partial<Member>): Promise<Member | null> => {
    const index = membersData.findIndex(member => member.id === id);
    if (index === -1) {
      toast.error('Anggota tidak ditemukan');
      return null;
    }
    membersData[index] = { ...membersData[index], ...updateData };
    toast.success('Data anggota berhasil diperbarui');
    return membersData[index];
  },

  // Delete
  delete: async (id: string): Promise<boolean> => {
    const index = membersData.findIndex(member => member.id === id);
    if (index === -1) {
      toast.error('Anggota tidak ditemukan');
      return false;
    }
    membersData.splice(index, 1);
    toast.success('Anggota berhasil dihapus');
    return true;
  },
};

// Loan CRUD Operations
export const loanCRUD = {
  // Create
  create: async (loanData: Omit<Loan, 'id' | 'loanNumber'>): Promise<Loan> => {
    const newLoan: Loan = {
      ...loanData,
      id: Date.now().toString(),
      loanNumber: `L${new Date().getFullYear()}${String(loansData.length + 1).padStart(3, '0')}`,
    };
    loansData.push(newLoan);
    toast.success('Pengajuan pinjaman berhasil dibuat');
    return newLoan;
  },

  // Read
  getAll: async (): Promise<Loan[]> => {
    return loansData;
  },

  getById: async (id: string): Promise<Loan | null> => {
    return loansData.find(loan => loan.id === id) || null;
  },

  getByMember: async (memberNumber: string): Promise<Loan[]> => {
    return loansData.filter(loan => loan.memberNumber === memberNumber);
  },

  // Update
  update: async (id: string, updateData: Partial<Loan>): Promise<Loan | null> => {
    const index = loansData.findIndex(loan => loan.id === id);
    if (index === -1) {
      toast.error('Pinjaman tidak ditemukan');
      return null;
    }
    loansData[index] = { ...loansData[index], ...updateData };
    toast.success('Data pinjaman berhasil diperbarui');
    return loansData[index];
  },

  // Delete
  delete: async (id: string): Promise<boolean> => {
    const index = loansData.findIndex(loan => loan.id === id);
    if (index === -1) {
      toast.error('Pinjaman tidak ditemukan');
      return false;
    }
    loansData.splice(index, 1);
    toast.success('Pinjaman berhasil dihapus');
    return true;
  },

  // Approve
  approve: async (id: string): Promise<Loan | null> => {
    const loan = await loanCRUD.update(id, {
      status: 'approved',
      approvalDate: new Date().toISOString().split('T')[0],
    });
    if (loan) {
      toast.success('Pinjaman berhasil disetujui');
    }
    return loan;
  },

  // Reject
  reject: async (id: string): Promise<Loan | null> => {
    const loan = await loanCRUD.update(id, {
      status: 'rejected',
    });
    if (loan) {
      toast.success('Pinjaman ditolak');
    }
    return loan;
  },
};

// Savings CRUD Operations
export const savingsCRUD = {
  // Create
  create: async (savingsData: Omit<SavingsAccount, 'id' | 'accountNumber'>): Promise<SavingsAccount> => {
    const typePrefix = savingsData.accountType === 'mandatory' ? 'S001' : 
                      savingsData.accountType === 'voluntary' ? 'S002' : 'S003';
    const newAccount: SavingsAccount = {
      ...savingsData,
      id: Date.now().toString(),
      accountNumber: `${typePrefix}${String(savingsData.length + 1).padStart(3, '0')}`,
    };
    savingsData.push(newAccount);
    toast.success('Rekening simpanan berhasil dibuat');
    return newAccount;
  },

  // Read
  getAll: async (): Promise<SavingsAccount[]> => {
    return savingsData;
  },

  getById: async (id: string): Promise<SavingsAccount | null> => {
    return savingsData.find(account => account.id === id) || null;
  },

  getByMember: async (memberNumber: string): Promise<SavingsAccount[]> => {
    return savingsData.filter(account => account.memberNumber === memberNumber);
  },

  // Update
  update: async (id: string, updateData: Partial<SavingsAccount>): Promise<SavingsAccount | null> => {
    const index = savingsData.findIndex(account => account.id === id);
    if (index === -1) {
      toast.error('Rekening tidak ditemukan');
      return null;
    }
    savingsData[index] = { ...savingsData[index], ...updateData };
    toast.success('Data rekening berhasil diperbarui');
    return savingsData[index];
  },

  // Delete
  delete: async (id: string): Promise<boolean> => {
    const index = savingsData.findIndex(account => account.id === id);
    if (index === -1) {
      toast.error('Rekening tidak ditemukan');
      return false;
    }
    savingsData.splice(index, 1);
    toast.success('Rekening berhasil dihapus');
    return true;
  },
};

// Transaction CRUD Operations
export const transactionCRUD = {
  // Create
  create: async (transactionData: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
    };
    transactionsData.push(newTransaction);
    
    // Update account balance
    const account = savingsData.find(acc => acc.accountNumber === transactionData.accountNumber);
    if (account) {
      if (transactionData.type === 'deposit') {
        account.balance += transactionData.amount;
      } else {
        account.balance -= transactionData.amount;
      }
      account.lastTransaction = transactionData.date;
    }
    
    toast.success(`Transaksi ${transactionData.type === 'deposit' ? 'setoran' : 'penarikan'} berhasil`);
    return newTransaction;
  },

  // Read
  getAll: async (): Promise<Transaction[]> => {
    return transactionsData;
  },

  getById: async (id: string): Promise<Transaction | null> => {
    return transactionsData.find(transaction => transaction.id === id) || null;
  },

  getByAccount: async (accountNumber: string): Promise<Transaction[]> => {
    return transactionsData.filter(transaction => transaction.accountNumber === accountNumber);
  },

  // Update
  update: async (id: string, updateData: Partial<Transaction>): Promise<Transaction | null> => {
    const index = transactionsData.findIndex(transaction => transaction.id === id);
    if (index === -1) {
      toast.error('Transaksi tidak ditemukan');
      return null;
    }
    transactionsData[index] = { ...transactionsData[index], ...updateData };
    toast.success('Transaksi berhasil diperbarui');
    return transactionsData[index];
  },

  // Delete
  delete: async (id: string): Promise<boolean> => {
    const index = transactionsData.findIndex(transaction => transaction.id === id);
    if (index === -1) {
      toast.error('Transaksi tidak ditemukan');
      return false;
    }
    transactionsData.splice(index, 1);
    toast.success('Transaksi berhasil dihapus');
    return true;
  },
};

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('id-ID');
};

export const calculateLoanPayment = (principal: number, rate: number, term: number): number => {
  const monthlyRate = rate / 100 / 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
         (Math.pow(1 + monthlyRate, term) - 1);
};