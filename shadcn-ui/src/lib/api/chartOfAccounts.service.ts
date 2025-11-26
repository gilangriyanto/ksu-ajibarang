// src/lib/api/chartOfAccounts.service.ts

const BASE_URL = "https://ksp.gascpns.id/api";

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

export interface COAMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface COAResponse {
  success: boolean;
  message: string;
  data: ChartOfAccount[];
  meta?: COAMeta;
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
// HELPER FUNCTIONS
// =====================================================

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Request failed",
    }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const result = await response.json();
  return result.data;
};

// =====================================================
// SERVICE
// =====================================================

export const chartOfAccountsService = {
  /**
   * Get all chart of accounts
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
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.per_page)
      queryParams.append("per_page", params.per_page.toString());
    if (params?.category) queryParams.append("category", params.category);
    if (params?.account_type)
      queryParams.append("account_type", params.account_type);
    if (params?.is_debit !== undefined)
      queryParams.append("is_debit", params.is_debit.toString());
    if (params?.is_active !== undefined)
      queryParams.append("is_active", params.is_active.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.all) queryParams.append("all", "true");

    const url = queryParams.toString()
      ? `${BASE_URL}/chart-of-accounts?${queryParams}`
      : `${BASE_URL}/chart-of-accounts`;

    const response = await fetch(url, {
      headers: getHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * Get COA by category (assets)
   */
  getByCategory: async (
    category: "assets" | "liabilities" | "equity" | "revenue" | "expenses"
  ): Promise<ChartOfAccount[]> => {
    const response = await fetch(
      `${BASE_URL}/chart-of-accounts?category=${category}`,
      { headers: getHeaders() }
    );

    return handleResponse(response);
  },

  /**
   * Get COA by account type (Cash, Bank, etc)
   */
  getByAccountType: async (accountType: string): Promise<ChartOfAccount[]> => {
    const response = await fetch(
      `${BASE_URL}/chart-of-accounts?account_type=${accountType}`,
      { headers: getHeaders() }
    );

    return handleResponse(response);
  },

  /**
   * Get COA by debit/credit
   */
  getByDebitCredit: async (isDebit: boolean): Promise<ChartOfAccount[]> => {
    const response = await fetch(
      `${BASE_URL}/chart-of-accounts?is_debit=${isDebit}`,
      { headers: getHeaders() }
    );

    return handleResponse(response);
  },

  /**
   * Get COA category revenue (special endpoint)
   */
  getRevenueCategory: async (): Promise<ChartOfAccount[]> => {
    const response = await fetch(
      `${BASE_URL}/chart-of-accounts/category/revenue`,
      { headers: getHeaders() }
    );

    return handleResponse(response);
  },

  /**
   * Get COA summary
   */
  getSummary: async (): Promise<COASummary> => {
    const response = await fetch(`${BASE_URL}/chart-of-accounts/summary`, {
      headers: getHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * Get single COA by ID
   */
  getById: async (id: number): Promise<ChartOfAccount> => {
    const response = await fetch(`${BASE_URL}/chart-of-accounts/${id}`, {
      headers: getHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * Create new COA
   */
  create: async (data: CreateCOARequest): Promise<ChartOfAccount> => {
    const response = await fetch(`${BASE_URL}/chart-of-accounts`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  /**
   * Update COA
   */
  update: async (
    id: number,
    data: Partial<CreateCOARequest>
  ): Promise<ChartOfAccount> => {
    const response = await fetch(`${BASE_URL}/chart-of-accounts/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  /**
   * Delete COA
   */
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/chart-of-accounts/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "Delete failed",
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
  },
};

export default chartOfAccountsService;
