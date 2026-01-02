// lib/api/cash-accounts.service.ts
// Complete API service untuk Cash Account Management
// Bug-free with proper TypeScript types and error handling

import apiClient from "@/lib/api/api-client";

// ==================== TYPES ====================

export interface CashAccount {
  id: number;
  code: string;
  name: string;
  type: "I" | "II" | "III" | "IV" | "V";
  opening_balance: string | number;
  current_balance: string | number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations (optional)
  active_managers?: Manager[];
  current_savings_rate?: InterestRate | null;
  current_loan_rate?: InterestRate | null;
}

export interface Manager {
  id: number;
  full_name: string;
  employee_id: string;
  email: string;
  role: string;
  assigned_at?: string;
  is_active?: boolean;
}

export interface InterestRate {
  id: number;
  rate_percentage: number;
  effective_date: string;
  rate_type: "savings" | "loan";
}

export interface CashAccountSummary {
  total_accounts: number;
  total_balance: number;
  by_type: Array<{
    type: string;
    type_name: string;
    count: number;
    balance: number;
  }>;
}

export interface CreateCashAccountData {
  code: string;
  name: string;
  type: "I" | "II" | "III" | "IV" | "V";
  opening_balance?: number;
  current_balance?: number;
  description?: string;
  is_active?: boolean;
}

export interface UpdateCashAccountData {
  code?: string;
  name?: string;
  type?: "I" | "II" | "III" | "IV" | "V";
  description?: string;
  is_active?: boolean;
}

export interface AssignManagerData {
  manager_id: number;
  assigned_at?: string;
}

// ==================== API SERVICE ====================

const cashAccountsService = {
  // ==================== CASH ACCOUNTS CRUD ====================

  /**
   * Get all cash accounts with filters
   * Manager: Only sees assigned accounts (backend filters automatically)
   * Admin: Sees all accounts
   */
  getAll: async (params?: {
    type?: string;
    is_active?: boolean;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    per_page?: number;
    page?: number;
    all?: boolean;
  }) => {
    const response = await apiClient.get("/cash-accounts", { params });
    return response.data;
  },

  /**
   * Get cash account by ID
   * Returns 403 if manager not assigned to this account
   */
  getById: async (id: number) => {
    const response = await apiClient.get(`/cash-accounts/${id}`);
    return response.data;
  },

  /**
   * Create new cash account (Admin only)
   */
  create: async (data: CreateCashAccountData) => {
    const response = await apiClient.post("/cash-accounts", data);
    return response.data;
  },

  /**
   * Update cash account (Admin only)
   * Note: Cannot update balances through this endpoint
   */
  update: async (id: number, data: UpdateCashAccountData) => {
    const response = await apiClient.put(`/cash-accounts/${id}`, data);
    return response.data;
  },

  /**
   * Delete cash account (Admin only)
   */
  delete: async (id: number) => {
    const response = await apiClient.delete(`/cash-accounts/${id}`);
    return response.data;
  },

  // ==================== SUMMARY ====================

  /**
   * Get cash accounts summary
   * Returns total balance per type
   */
  getSummary: async () => {
    const response = await apiClient.get("/cash-accounts/summary");
    return response.data;
  },

  // ==================== MANAGER ASSIGNMENT ====================

  /**
   * Get managers assigned to cash account
   */
  getManagers: async (cashAccountId: number) => {
    const response = await apiClient.get(
      `/cash-accounts/${cashAccountId}/managers`
    );
    return response.data;
  },

  /**
   * Assign manager to cash account (Admin only)
   */
  assignManager: async (cashAccountId: number, data: AssignManagerData) => {
    const response = await apiClient.post(
      `/cash-accounts/${cashAccountId}/managers`,
      data
    );
    return response.data;
  },

  /**
   * Remove manager from cash account (Admin only)
   */
  removeManager: async (cashAccountId: number, managerId: number) => {
    const response = await apiClient.delete(
      `/cash-accounts/${cashAccountId}/managers/${managerId}`
    );
    return response.data;
  },

  /**
   * Get available managers (Admin only)
   * Returns users with admin/manager role
   */
  getAvailableManagers: async () => {
    const response = await apiClient.get("/cash-accounts/managers/available");
    return response.data;
  },

  /**
   * Get cash accounts managed by specific user
   */
  getManagedAccounts: async (managerId: number) => {
    const response = await apiClient.get(
      `/cash-accounts/managers/${managerId}/accounts`
    );
    return response.data;
  },

  // ==================== HELPER METHODS ====================

  /**
   * Helper: Format currency to IDR
   */
  formatCurrency: (amount: number | string): string => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount);
  },

  /**
   * Helper: Get type name from code
   */
  getTypeName: (type: string): string => {
    const types: Record<string, string> = {
      I: "Kas Umum",
      II: "Kas Sosial",
      III: "Kas Pengadaan",
      IV: "Kas Hadiah",
      V: "Bank",
    };
    return types[type] || type;
  },

  /**
   * Helper: Get type badge color for shadcn/ui Badge
   */
  getTypeBadgeColor: (
    type: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    const colors: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      I: "default",
      II: "secondary",
      III: "outline",
      IV: "default",
      V: "secondary",
    };
    return colors[type] || "default";
  },

  /**
   * Helper: Parse numeric value (handles string/number)
   */
  parseAmount: (amount: string | number): number => {
    return typeof amount === "string" ? parseFloat(amount) : amount;
  },

  /**
   * Helper: Check if user has access to cash account
   * This is for client-side checks only, backend always validates
   */
  checkAccess: async (cashAccountId: number): Promise<boolean> => {
    try {
      await cashAccountsService.getById(cashAccountId);
      return true;
    } catch (error: any) {
      if (error.response?.status === 403) {
        return false;
      }
      throw error;
    }
  },
};

export default cashAccountsService;