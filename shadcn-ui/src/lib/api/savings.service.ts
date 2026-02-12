import apiClient from "@/lib/api/api-client";

// ==================== TYPES ====================

// ✅ NEW: Saving Type (Master Data)
export interface SavingType {
  id: number;
  code: string;
  name: string;
  description?: string;

  // Flags
  is_mandatory: boolean;
  is_withdrawable: boolean; // ✅ ADD
  has_interest: boolean; // ✅ ADD
  is_active: boolean;

  // Amounts
  minimum_amount?: number; // ✅ ADD
  maximum_amount?: number; // ✅ ADD
  default_interest_rate?: number; // ✅ ADD
  display_order?: number; // ✅ ADD

  // Timestamps
  created_at: string;
  updated_at: string;

  // Optional: Statistics
  total_savings?: number;
  total_members?: number;
  total_amount?: number;
}

// ✅ UPDATED: Saving interface with saving_type_id support
export interface Saving {
  id: number;
  user_id: number;
  cash_account_id: number;

  // ✅ NEW: Use saving_type_id (FK to saving_types table)
  saving_type_id?: number;
  saving_type?: SavingType; // Nested object from API

  // ✅ OLD: Keep for backward compatibility
  savings_type?: "principal" | "mandatory" | "voluntary" | "holiday";

  amount: string | number; // Backend returns string
  interest_percentage: string | number;
  final_amount: string | number; // Backend returns string
  transaction_date: string;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
  description?: string; // Alias for notes
  approved_by?: {
    id: number;
    full_name: string;
  } | null;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user?: {
    id: number;
    full_name: string;
    employee_id: string;
    email?: string;
  };
  cash_account?: {
    id: number;
    code: string;
    name: string;
  };

  // Legacy fields for backward compatibility
  user_name?: string;
  user_code?: string;
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

// ✅ UPDATED: CreateSavingData with saving_type_id
export interface CreateSavingData {
  user_id: number;
  cash_account_id: number;
  transaction_date: string;
  amount: number;

  // ✅ NEW: Optional saving_type_id (prefer this)
  saving_type_id?: number;

  // ✅ OLD: Optional savings_type (backward compatible)
  savings_type?: "principal" | "mandatory" | "voluntary" | "holiday";

  description?: string;
  notes?: string;
}

// ✅ UPDATED: UpdateSavingData
export interface UpdateSavingData {
  user_id?: number;
  cash_account_id?: number;
  amount?: number;
  transaction_date?: string;

  // ✅ NEW: Optional saving_type_id
  saving_type_id?: number;

  // ✅ OLD: Optional savings_type (backward compatible)
  savings_type?: "principal" | "mandatory" | "voluntary" | "holiday";

  description?: string;
  notes?: string;
  status?: "pending" | "approved" | "rejected";
}

// ==================== API SERVICE ====================

const savingsService = {
  // ==================== SAVING TYPES (MASTER DATA) ====================

  /**
   * ✅ NEW: Get all saving types
   */
  getSavingTypes: async (params?: {
    is_active?: boolean;
    with_stats?: boolean;
  }) => {
    const response = await apiClient.get("/saving-types", { params });
    return response.data;
  },

  /**
   * ✅ NEW: Get default saving types
   */
  getDefaultSavingTypes: async () => {
    const response = await apiClient.get("/saving-types/defaults");
    return response.data;
  },

  /**
   * ✅ NEW: Get mandatory saving types
   */
  getMandatorySavingTypes: async () => {
    const response = await apiClient.get("/saving-types/mandatory");
    return response.data;
  },

  /**
   * ✅ NEW: Get optional saving types
   */
  getOptionalSavingTypes: async () => {
    const response = await apiClient.get("/saving-types/optional");
    return response.data;
  },

  /**
   * ✅ NEW: Get saving type by ID
   */
  getSavingTypeById: async (id: number) => {
    const response = await apiClient.get(`/saving-types/${id}`);
    return response.data;
  },

  /**
   * ✅ NEW: Create saving type (Admin only)
   */
  createSavingType: async (data: {
    name: string;
    code: string;
    description?: string;
    is_mandatory: boolean;
  }) => {
    const response = await apiClient.post("/saving-types", data);
    return response.data;
  },

  /**
   * ✅ NEW: Update saving type (Admin only)
   */
  updateSavingType: async (
    id: number,
    data: {
      name?: string;
      code?: string;
      description?: string;
      is_mandatory?: boolean;
      is_active?: boolean;
    },
  ) => {
    const response = await apiClient.put(`/saving-types/${id}`, data);
    return response.data;
  },

  /**
   * ✅ NEW: Delete saving type (Admin only)
   */
  deleteSavingType: async (id: number) => {
    const response = await apiClient.delete(`/saving-types/${id}`);
    return response.data;
  },

  // ==================== SAVINGS CRUD ====================

  /**
   * Get all savings with optional filters
   * ✅ UPDATED: Can filter by saving_type_id
   */
  getAll: async (params?: {
    all?: boolean;
    user_id?: number;
    status?: string;
    cash_account_id?: number;
    saving_type_id?: number; // ✅ NEW filter
    savings_type?: string; // ✅ OLD filter (backward compatible)
    _t?: number; // Cache buster
  }) => {
    const response = await apiClient.get("/savings", { params });
    return response.data;
  },

  /**
   * Get saving by ID
   */
  getById: async (id: number) => {
    const response = await apiClient.get(`/savings/${id}`);
    return response.data;
  },

  /**
   * Create new saving
   * ✅ UPDATED: Now accepts saving_type_id
   */
  create: async (data: CreateSavingData) => {
    const response = await apiClient.post("/savings", data);
    return response.data;
  },

  /**
   * Update saving
   * ✅ UPDATED: Now accepts saving_type_id
   */
  update: async (id: number, data: UpdateSavingData) => {
    const response = await apiClient.put(`/savings/${id}`, data);
    return response.data;
  },

  /**
   * Delete saving
   */
  delete: async (id: number) => {
    const response = await apiClient.delete(`/savings/${id}`);
    return response.data;
  },

  // ==================== APPROVAL ====================

  /**
   * Approve saving
   */
  approve: async (id: number, notes?: string) => {
    const response = await apiClient.post(`/savings/${id}/approve`, {
      status: "approved",
      notes: notes || "Disetujui oleh manager",
    });
    return response.data;
  },

  /**
   * Reject saving
   */
  reject: async (id: number, notes?: string) => {
    const response = await apiClient.post(`/savings/${id}/approve`, {
      status: "rejected",
      notes: notes || "Ditolak oleh manager",
    });
    return response.data;
  },

  // ==================== REPORTS & SUMMARY ====================

  /**
   * Get savings summary
   */
  getSummary: async (userId?: number) => {
    const response = await apiClient.get("/savings/summary", {
      params: userId ? { user_id: userId } : undefined,
    });
    return response.data;
  },

  /**
   * ✅ UPDATED: Get savings by type - now accepts type ID
   * Backward compatible with old enum
   */
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

  /**
   * ✅ NEW: Get savings by type ID (more flexible)
   */
  getByTypeId: async (typeId: number, userId?: number) => {
    const response = await apiClient.get("/savings", {
      params: {
        saving_type_id: typeId,
        user_id: userId,
        all: true,
      },
    });
    return response.data;
  },

  // ==================== EXPORT ====================

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
      savingsType: "principal" | "mandatory" | "voluntary" | "holiday",
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
      saving_type_id?: number;
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

  // ==================== HELPER METHODS ====================

  /**
   * Format currency to IDR
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
   * Get status badge color
   */
  getStatusColor: (
    status: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    const colors: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      pending: "outline",
      approved: "default",
      rejected: "destructive",
    };
    return colors[status] || "default";
  },

  /**
   * Get status label in Indonesian
   */
  getStatusLabel: (status: string): string => {
    const labels: Record<string, string> = {
      pending: "Menunggu Persetujuan",
      approved: "Disetujui",
      rejected: "Ditolak",
    };
    return labels[status] || status;
  },

  /**
   * ✅ NEW: Get saving type display name
   * Works with both new (object) and old (enum) format
   */
  getSavingTypeName: (saving: Saving): string => {
    // NEW: If saving_type object exists, use its name
    if (saving.saving_type?.name) {
      return saving.saving_type.name;
    }

    // OLD: Fallback to enum mapping
    const enumLabels: Record<string, string> = {
      principal: "Simpanan Pokok",
      mandatory: "Simpanan Wajib",
      voluntary: "Simpanan Sukarela",
      holiday: "Simpanan Hari Raya",
    };

    return saving.savings_type
      ? enumLabels[saving.savings_type] || saving.savings_type
      : "Tidak Diketahui";
  },

  /**
   * ✅ NEW: Get saving type badge color
   */
  getSavingTypeBadgeColor: (saving: Saving): string => {
    // Get code from either new or old format
    const code = saving.saving_type?.code || saving.savings_type;

    const colors: Record<string, string> = {
      principal: "bg-blue-100 text-blue-800",
      mandatory: "bg-green-100 text-green-800",
      voluntary: "bg-purple-100 text-purple-800",
      holiday: "bg-orange-100 text-orange-800",
    };

    return code
      ? colors[code] || "bg-gray-100 text-gray-800"
      : "bg-gray-100 text-gray-800";
  },

  /**
   * ✅ NEW: Get saving type code (from either new or old format)
   */
  getSavingTypeCode: (saving: Saving): string => {
    return saving.saving_type?.code || saving.savings_type || "";
  },

  /**
   * Parse numeric value
   */
  parseAmount: (amount: string | number): number => {
    return typeof amount === "string" ? parseFloat(amount) : amount;
  },
};

export default savingsService;
