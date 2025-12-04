// src/lib/api/journal.service.ts
import apiClient, { ApiResponse } from "./api-client";

// =====================================================
// TYPES
// =====================================================

export interface JournalDetail {
  id: number;
  journal_id: number;
  chart_of_account_id: number;
  debit: string;
  credit: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  chart_of_account: {
    id: number;
    code: string;
    name: string;
    account_type?: string;
  };
}

export interface Journal {
  id: number;
  journal_number: string;
  accounting_period_id: number | null;
  journal_type: "general" | "special" | "adjusting" | "closing" | "reversing";
  description: string;
  transaction_date: string;
  total_debit: string;
  total_credit: string;
  created_by: number;
  is_locked: boolean;
  is_balanced: boolean;
  reference_type: string | null;
  reference_id: number | null;
  created_at: string;
  updated_at: string;
  type_name: string;
  details: JournalDetail[];
  accounting_period: {
    id: number;
    period_name: string;
  } | null;
  creator: {
    id: number;
    full_name: string;
    email?: string;
  };
}

export interface CreateJournalRequest {
  journal_type: "general" | "special" | "adjusting" | "closing" | "reversing";
  description: string;
  transaction_date: string; // YYYY-MM-DD
  accounting_period_id?: number;
  details: Array<{
    chart_of_account_id: number;
    debit: number;
    credit: number;
    description?: string;
  }>;
}

export interface UpdateJournalRequest {
  journal_type?: "general" | "special" | "adjusting" | "closing" | "reversing";
  description?: string;
  transaction_date?: string;
  accounting_period_id?: number;
  details?: Array<{
    chart_of_account_id: number;
    debit: number;
    credit: number;
    description?: string;
  }>;
}

export interface GeneralLedgerTransaction {
  date: string;
  journal_number: string;
  description: string;
  debit: string;
  credit: string;
  balance: number;
}

export interface GeneralLedgerAccount {
  account: {
    id: number;
    code: string;
    name: string;
  };
  transactions: GeneralLedgerTransaction[];
  total_debit: number;
  total_credit: number;
  balance: number;
}

export interface TrialBalanceItem {
  account_code: string;
  account_name: string;
  account_type: string;
  debit: number;
  credit: number;
}

export interface TrialBalance {
  trial_balance: TrialBalanceItem[];
  total_debit: number;
  total_credit: number;
  is_balanced: boolean;
  end_date: string;
}

// =====================================================
// SERVICE
// =====================================================

const journalService = {
  /**
   * Get all journals
   * GET /journals
   */
  getAll: async (params?: {
    journal_type?: string;
    start_date?: string;
    end_date?: string;
    per_page?: number;
    page?: number;
  }): Promise<Journal[]> => {
    const response = await apiClient.get<ApiResponse<Journal[]>>("/journals", {
      params,
    });
    return response.data.data;
  },

  /**
   * Get single journal by ID
   * GET /journals/{id}
   */
  getById: async (id: number): Promise<Journal> => {
    const response = await apiClient.get<ApiResponse<Journal>>(
      `/journals/${id}`
    );
    return response.data.data;
  },

  /**
   * Create new journal
   * POST /journals
   */
  create: async (data: CreateJournalRequest): Promise<Journal> => {
    const response = await apiClient.post<ApiResponse<Journal>>(
      "/journals",
      data
    );
    return response.data.data;
  },

  /**
   * Update journal
   * PUT /journals/{id}
   */
  update: async (id: number, data: UpdateJournalRequest): Promise<Journal> => {
    const response = await apiClient.put<ApiResponse<Journal>>(
      `/journals/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete journal
   * DELETE /journals/{id}
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/journals/${id}`);
  },

  /**
   * Lock journal (prevent editing)
   * POST /journals/{id}/lock
   */
  lock: async (id: number): Promise<Journal> => {
    const response = await apiClient.post<ApiResponse<Journal>>(
      `/journals/${id}/lock`
    );
    return response.data.data;
  },

  /**
   * Get general ledger
   * GET /journals/general-ledger
   */
  getGeneralLedger: async (params: {
    start_date: string;
    end_date: string;
    chart_of_account_id?: number;
  }): Promise<GeneralLedgerAccount[]> => {
    const response = await apiClient.get<ApiResponse<GeneralLedgerAccount[]>>(
      "/journals/general-ledger",
      { params }
    );
    return response.data.data;
  },

  /**
   * Get trial balance
   * GET /journals/trial-balance
   */
  getTrialBalance: async (params: {
    end_date: string;
    start_date?: string;
  }): Promise<TrialBalance> => {
    const response = await apiClient.get<ApiResponse<TrialBalance>>(
      "/journals/trial-balance",
      { params }
    );
    return response.data.data;
  },
};

export default journalService;
