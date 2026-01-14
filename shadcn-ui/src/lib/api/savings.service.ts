import apiClient from "@/lib/api/api-client";

// Types matching backend response
export interface Saving {
  id: number;
  user_id: number;
  cash_account_id: number;
  savings_type: "principal" | "mandatory" | "voluntary" | "holiday";
  amount: string | number; // Backend returns string
  interest_percentage: string | number;
  final_amount: string | number; // Backend returns string
  transaction_date: string;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
  approved_by?: {
    id: number;
    full_name: string;
  } | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user?: {
    id: number;
    full_name: string;
    employee_id: string;
  };
  cash_account?: {
    id: number;
    code: string;
    name: string;
  };

  // Legacy fields for backward compatibility
  user_name?: string;
  user_code?: string;
  saving_type?: string;
  balance?: number;
}

export interface SavingsSummary {
  total_balance: number;
  total_principal: number;
  total_mandatory: number;
  total_voluntary: number;
  total_holiday: number;
  total_deposits: number;
  active_members: number;
}

export interface SavingsByType {
  savings: Saving[];
  total: number;
  total_amount: number;
}

export interface CreateSavingData {
  user_id: number;
  savings_type: "principal" | "mandatory" | "voluntary" | "holiday";
  cash_account_id: number;
  transaction_date: string;
  amount: number;
  description?: string;
}

export interface UpdateSavingData {
  amount?: number;
  description?: string;
  status?: "pending" | "approved" | "rejected";
}

// API Service
const savingsService = {
  // Get all savings (Manager)
  getAll: async (params?: {
    all?: boolean;
    user_id?: number;
    savings_type?: string;
    _t?: number; // Cache buster
  }) => {
    const response = await apiClient.get("/savings", { params });
    return response.data;
  },

  // Get saving by ID
  getById: async (id: number) => {
    const response = await apiClient.get(`/savings/${id}`);
    return response.data;
  },

  // Create new saving
  create: async (data: CreateSavingData) => {
    const response = await apiClient.post("/savings", data);
    return response.data;
  },

  // Update saving
  update: async (id: number, data: UpdateSavingData) => {
    const response = await apiClient.put(`/savings/${id}`, data);
    return response.data;
  },

  // Delete saving
  delete: async (id: number) => {
    const response = await apiClient.delete(`/savings/${id}`);
    return response.data;
  },

  // Approve saving
  approve: async (id: number, notes?: string) => {
    const response = await apiClient.post(`/savings/${id}/approve`, {
      status: "approved",
      notes: notes || "Disetujui oleh manager",
    });
    return response.data;
  },

  // Reject saving
  reject: async (id: number, notes?: string) => {
    const response = await apiClient.post(`/savings/${id}/approve`, {
      status: "rejected",
      notes: notes || "Ditolak oleh manager",
    });
    return response.data;
  },

  // Get savings summary
  getSummary: async (userId?: number) => {
    const response = await apiClient.get("/savings/summary", {
      params: userId ? { user_id: userId } : undefined,
    });
    return response.data;
  },

  // Get savings by type
  getByType: {
    principal: async (userId?: number) => {
      const response = await apiClient.get("/savings/type/principal", {
        params: userId ? { user_id: userId } : undefined,
      });
      return response.data;
    },

    mandatory: async (userId?: number) => {
      const response = await apiClient.get("/savings/type/mandatory", {
        params: userId ? { user_id: userId } : undefined,
      });
      return response.data;
    },

    voluntary: async (userId?: number) => {
      const response = await apiClient.get("/savings/type/voluntary", {
        params: userId ? { user_id: userId } : undefined,
      });
      return response.data;
    },

    holiday: async (userId?: number) => {
      const response = await apiClient.get("/savings/type/holiday", {
        params: userId ? { user_id: userId } : undefined,
      });
      return response.data;
    },
  },

  // ✅ NEW: Export Excel functions
  export: {
    /**
     * Export all savings data to Excel
     * GET /savings/export/excel
     */
    all: async (): Promise<Blob> => {
      const response = await apiClient.get("/savings/export/excel", {
        responseType: "blob",
      });
      return response.data;
    },

    /**
     * Export savings by month
     * GET /savings/export/excel?month=1&year=2026
     */
    byMonth: async (month: number, year: number): Promise<Blob> => {
      const response = await apiClient.get("/savings/export/excel", {
        params: { month, year },
        responseType: "blob",
      });
      return response.data;
    },

    /**
     * Export savings by year
     * GET /savings/export/excel?year=2026
     */
    byYear: async (year: number): Promise<Blob> => {
      const response = await apiClient.get("/savings/export/excel", {
        params: { year },
        responseType: "blob",
      });
      return response.data;
    },

    /**
     * Export savings by type
     * GET /savings/export/excel?savings_type=mandatory
     */
    byType: async (
      savingsType: "principal" | "mandatory" | "voluntary" | "holiday"
    ): Promise<Blob> => {
      const response = await apiClient.get("/savings/export/excel", {
        params: { savings_type: savingsType },
        responseType: "blob",
      });
      return response.data;
    },

    /**
     * Export savings with custom filters
     * GET /savings/export/excel?month=1&year=2026&savings_type=mandatory&status=approved
     */
    custom: async (params: {
      month?: number;
      year?: number;
      savings_type?: string;
      status?: string;
      user_id?: number;
    }): Promise<Blob> => {
      const response = await apiClient.get("/savings/export/excel", {
        params,
        responseType: "blob",
      });
      return response.data;
    },
  },
};

export default savingsService;
