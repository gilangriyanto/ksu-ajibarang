import apiClient from "@/lib/api/api-client";

// ==================== TYPES ====================

export interface CashAccount {
  id: number;
  code: string;
  name: string;
  type: string;
  opening_balance: string | number;
  current_balance: string | number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  active_managers?: Manager[];
}

export interface Manager {
  id: number;
  full_name: string;
  email: string;
  pivot?: {
    cash_account_id: number;
    manager_id: number;
    assigned_at: string;
    is_active: number;
    created_at: string;
    updated_at: string;
  };
}

export interface CashAccountSummary {
  total_accounts: number;
  total_balance: string;
  by_type: {
    type: string;
    type_name: string;
    count: number;
    balance: number;
  }[];
}

export interface InterestRate {
  id: number;
  cash_account_id: number;
  transaction_type: "savings" | "loans";
  rate_percentage: string | number;
  effective_date: string;
  updated_by:
    | {
        id: number;
        full_name: string;
        email: string;
      }
    | number;
  created_at: string;
  updated_at: string;
}

export interface InterestRatesData {
  cash_account: {
    id: number;
    code: string;
    name: string;
  };
  rates: InterestRate[];
  current_savings_rate: InterestRate | null;
  current_loan_rate: InterestRate | null;
}

export interface CurrentRate {
  id: number;
  code: string;
  name: string;
  type: string;
  savings_rate: string;
  loan_rate: string;
}

export interface CreateCashAccountData {
  code: string;
  name: string;
  type: string;
  opening_balance: number;
  description?: string;
}

export interface UpdateCashAccountData {
  code?: string;
  name?: string;
  type?: string;
  description?: string;
  is_active?: boolean;
}

export interface AssignManagerData {
  manager_id: number;
  assigned_at: string;
}

export interface CreateInterestRateData {
  transaction_type: "savings" | "loans";
  rate_percentage: number;
  effective_date: string;
}

export interface UpdateInterestRateData {
  transaction_type?: "savings" | "loans";
  rate_percentage?: number;
  effective_date?: string;
}

// ==================== API SERVICE ====================

const cashAccountsService = {
  // ==================== CASH ACCOUNTS CRUD ====================

  /**
   * Get all cash accounts
   */
  getAll: async (params?: { all?: boolean }) => {
    const response = await apiClient.get("/cash-accounts", { params });
    return response.data;
  },

  /**
   * Get cash account by ID
   */
  getById: async (id: number) => {
    const response = await apiClient.get(`/cash-accounts/${id}`);
    return response.data;
  },

  /**
   * Create new cash account
   */
  create: async (data: CreateCashAccountData) => {
    const response = await apiClient.post("/cash-accounts", data);
    return response.data;
  },

  /**
   * Update cash account
   */
  update: async (id: number, data: UpdateCashAccountData) => {
    const response = await apiClient.put(`/cash-accounts/${id}`, data);
    return response.data;
  },

  /**
   * Delete cash account
   */
  delete: async (id: number) => {
    const response = await apiClient.delete(`/cash-accounts/${id}`);
    return response.data;
  },

  /**
   * Get cash accounts summary
   */
  getSummary: async () => {
    const response = await apiClient.get("/cash-accounts/summary");
    return response.data;
  },

  // ==================== MANAGER ASSIGNMENT ====================

  /**
   * Get managers for a cash account
   */
  getManagers: async (cashAccountId: number) => {
    const response = await apiClient.get(
      `/cash-accounts/${cashAccountId}/managers`
    );
    return response.data;
  },

  /**
   * Assign manager to cash account
   */
  assignManager: async (cashAccountId: number, data: AssignManagerData) => {
    const response = await apiClient.post(
      `/cash-accounts/${cashAccountId}/managers`,
      data
    );
    return response.data;
  },

  /**
   * Remove manager from cash account
   */
  removeManager: async (cashAccountId: number, managerId: number) => {
    const response = await apiClient.delete(
      `/cash-accounts/${cashAccountId}/managers/${managerId}`
    );
    return response.data;
  },

  /**
   * Get cash accounts for a manager
   */
  getManagerCashAccounts: async (managerId: number) => {
    const response = await apiClient.get(
      `/managers/${managerId}/cash-accounts`
    );
    return response.data;
  },

  // ==================== INTEREST RATES ====================

  /**
   * Get interest rates for a cash account
   */
  getInterestRates: async (cashAccountId: number) => {
    const response = await apiClient.get(
      `/cash-accounts/${cashAccountId}/interest-rates`
    );
    return response.data;
  },

  /**
   * Create interest rate for cash account
   */
  createInterestRate: async (
    cashAccountId: number,
    data: CreateInterestRateData
  ) => {
    const response = await apiClient.post(
      `/cash-accounts/${cashAccountId}/interest-rates`,
      data
    );
    return response.data;
  },

  /**
   * Update interest rate
   */
  updateInterestRate: async (rateId: number, data: UpdateInterestRateData) => {
    const response = await apiClient.put(`/interest-rates/${rateId}`, data);
    return response.data;
  },

  /**
   * Delete interest rate
   */
  deleteInterestRate: async (rateId: number) => {
    const response = await apiClient.delete(`/interest-rates/${rateId}`);
    return response.data;
  },

  /**
   * Get current rates for all cash accounts
   */
  getCurrentRates: async () => {
    const response = await apiClient.get("/interest-rates/current");
    return response.data;
  },
};

export default cashAccountsService;
