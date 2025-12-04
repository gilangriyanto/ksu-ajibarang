// src/lib/api/chartOfAccounts.service.ts
import apiClient, { ApiResponse } from "./api-client";

// =====================================================
// TYPES
// =====================================================

export interface ChartOfAccount {
  id: number;
  code: string;
  name: string;
  category: "assets" | "liabilities" | "equity" | "revenue" | "expenses";
  account_type: string;
  is_debit: boolean;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface COASummary {
  assets: number;
  liabilities: number;
  equity: number;
  revenue: number;
  expenses: number;
}

export interface CreateCOARequest {
  code: string;
  name: string;
  category: "assets" | "liabilities" | "equity" | "revenue" | "expenses";
  account_type: string;
  is_debit: boolean;
  is_active?: boolean;
  description?: string;
}

// =====================================================
// SERVICE
// =====================================================

const chartOfAccountsService = {
  /**
   * Get all chart of accounts
   * GET /chart-of-accounts
   */
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    category?: string;
    account_type?: string;
    is_debit?: boolean;
    is_active?: boolean;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    all?: boolean;
  }): Promise<ChartOfAccount[]> => {
    const response = await apiClient.get<ApiResponse<ChartOfAccount[]>>(
      "/chart-of-accounts",
      { params }
    );
    return response.data.data;
  },

  /**
   * Get COA by category
   * GET /chart-of-accounts?category={category}
   */
  getByCategory: async (
    category: "assets" | "liabilities" | "equity" | "revenue" | "expenses"
  ): Promise<ChartOfAccount[]> => {
    const response = await apiClient.get<ApiResponse<ChartOfAccount[]>>(
      "/chart-of-accounts",
      { params: { category } }
    );
    return response.data.data;
  },

  /**
   * Get COA by account type
   * GET /chart-of-accounts?account_type={type}
   */
  getByAccountType: async (accountType: string): Promise<ChartOfAccount[]> => {
    const response = await apiClient.get<ApiResponse<ChartOfAccount[]>>(
      "/chart-of-accounts",
      { params: { account_type: accountType } }
    );
    return response.data.data;
  },

  /**
   * Get COA by debit/credit
   * GET /chart-of-accounts?is_debit={boolean}
   */
  getByDebitCredit: async (isDebit: boolean): Promise<ChartOfAccount[]> => {
    const response = await apiClient.get<ApiResponse<ChartOfAccount[]>>(
      "/chart-of-accounts",
      { params: { is_debit: isDebit } }
    );
    return response.data.data;
  },

  /**
   * Get COA category revenue (special endpoint)
   * GET /chart-of-accounts/category/revenue
   */
  getRevenueCategory: async (): Promise<ChartOfAccount[]> => {
    const response = await apiClient.get<ApiResponse<ChartOfAccount[]>>(
      "/chart-of-accounts/category/revenue"
    );
    return response.data.data;
  },

  /**
   * Get COA summary
   * GET /chart-of-accounts/summary
   */
  getSummary: async (): Promise<COASummary> => {
    const response = await apiClient.get<ApiResponse<COASummary>>(
      "/chart-of-accounts/summary"
    );
    return response.data.data;
  },

  /**
   * Get single COA by ID
   * GET /chart-of-accounts/{id}
   */
  getById: async (id: number): Promise<ChartOfAccount> => {
    const response = await apiClient.get<ApiResponse<ChartOfAccount>>(
      `/chart-of-accounts/${id}`
    );
    return response.data.data;
  },

  /**
   * Create new COA
   * POST /chart-of-accounts
   */
  create: async (data: CreateCOARequest): Promise<ChartOfAccount> => {
    const response = await apiClient.post<ApiResponse<ChartOfAccount>>(
      "/chart-of-accounts",
      data
    );
    return response.data.data;
  },

  /**
   * Update COA
   * PUT /chart-of-accounts/{id}
   */
  update: async (
    id: number,
    data: Partial<CreateCOARequest>
  ): Promise<ChartOfAccount> => {
    const response = await apiClient.put<ApiResponse<ChartOfAccount>>(
      `/chart-of-accounts/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete COA
   * DELETE /chart-of-accounts/{id}
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/chart-of-accounts/${id}`);
  },
};

// Named exports for types
export type { ChartOfAccount, COASummary, CreateCOARequest };

export default chartOfAccountsService;
