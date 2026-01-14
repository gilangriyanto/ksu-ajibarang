// src/lib/api/serviceAllowance.service.ts
import apiClient, { ApiResponse } from "./api-client";

// =====================================================
// TYPES
// =====================================================

export interface ServiceAllowance {
  id: number;
  user_id: number;
  period_month: number;
  period_year: number;
  received_amount: string;
  installment_paid: string;
  remaining_amount: string;
  status: "processed" | "pending";
  payment_date: string | null;
  distributed_by: number | null;
  notes: string | null;
  created_at: string;
  updated_at?: string;
  // Computed fields
  period_display?: string;
  status_name?: string;
  user?: {
    id: number;
    full_name: string;
    employee_id: string;
    email?: string;
  };
}

export interface CreateAllowanceRequest {
  user_id: number;
  period_month: number;
  period_year: number;
  received_amount: number;
  notes?: string;
}

export interface PreviewCalculation {
  member: {
    id: number;
    full_name: string;
    employee_id: string;
  };
  period: string;
  received_amount: number;
  installments: Array<{
    id: number;
    loan_number: string;
    installment_number: number;
    amount: number;
    due_date: string;
  }>;
  calculation: {
    total_installments_due: number;
    will_be_paid_from_allowance: number;
    remaining_for_member: number;
    member_must_pay: number;
    scenario: "sufficient" | "insufficient" | "exact";
    message: string;
  };
}

export interface PeriodSummary {
  period: string;
  total_members: number;
  total_received: number;
  total_paid_for_installments: number;
  total_remaining_for_members: number;
  processed_count: number;
  pending_count: number;
}

export interface MemberHistory {
  user: {
    id: number;
    full_name: string;
    employee_id: string;
  };
  year: number;
  total_received: number;
  total_remaining: number;
  allowances: Array<{
    id: number;
    period: string;
    received_amount: number;
    installment_paid: number;
    remaining_amount: number;
    status: string;
    status_name: string;
    payment_date: string | null;
  }>;
}

export interface AllowanceResponse {
  service_allowance: ServiceAllowance;
  summary: {
    received_from_hospital: number;
    used_for_installments: number;
    returned_to_member: number;
    remaining_installment_due: number;
    installments_paid_count: number;
    message: string;
  };
}

// ✅ NEW: Import Excel types
export interface ImportExcelResponse {
  total_processed: number;
  success_count: number;
  failed_count: number;
  results: {
    success: Array<{
      row: number;
      member: string;
      period: string;
      amount: number;
      summary: string;
    }>;
    failed: Array<{
      row: number;
      user_id?: number;
      error: string;
    }>;
  };
}

// =====================================================
// SERVICE
// =====================================================

const serviceAllowanceService = {
  /**
   * Create/Input service allowance for a member
   * POST /service-allowances
   */
  create: async (data: CreateAllowanceRequest): Promise<AllowanceResponse> => {
    const response = await apiClient.post<ApiResponse<AllowanceResponse>>(
      "/service-allowances",
      data
    );
    return response.data.data;
  },

  /**
   * Preview calculation before creating allowance
   * POST /service-allowances/preview
   */
  previewCalculation: async (data: {
    user_id: number;
    period_month: number;
    period_year: number;
    received_amount: number;
  }): Promise<PreviewCalculation> => {
    const response = await apiClient.post<ApiResponse<PreviewCalculation>>(
      "/service-allowances/preview",
      data
    );
    return response.data.data;
  },

  /**
   * Get all service allowances with filters
   * GET /service-allowances
   */
  getAll: async (params?: {
    user_id?: number;
    month?: number;
    year?: number;
    status?: string;
    per_page?: number;
    page?: number;
  }): Promise<ServiceAllowance[]> => {
    const response = await apiClient.get<ApiResponse<ServiceAllowance[]>>(
      "/service-allowances",
      { params }
    );
    return response.data.data;
  },

  /**
   * Get single allowance by ID
   * GET /service-allowances/{id}
   */
  getById: async (id: number): Promise<ServiceAllowance> => {
    const response = await apiClient.get<ApiResponse<ServiceAllowance>>(
      `/service-allowances/${id}`
    );
    return response.data.data;
  },

  /**
   * Get period summary
   * GET /service-allowances/period-summary
   */
  getPeriodSummary: async (
    month: number,
    year: number
  ): Promise<PeriodSummary> => {
    const response = await apiClient.get<ApiResponse<PeriodSummary>>(
      "/service-allowances/period-summary",
      { params: { month, year } }
    );
    return response.data.data;
  },

  /**
   * Get member history
   * GET /service-allowances/member/{user_id}/history
   */
  getMemberHistory: async (
    userId: number,
    year?: number
  ): Promise<MemberHistory> => {
    const params = year ? { year } : undefined;
    const response = await apiClient.get<ApiResponse<MemberHistory>>(
      `/service-allowances/member/${userId}/history`,
      { params }
    );
    return response.data.data;
  },

  /**
   * ✅ NEW: Import service allowances from Excel
   * POST /service-allowances/import/excel
   */
  importExcel: async (file: File): Promise<ImportExcelResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<ApiResponse<ImportExcelResponse>>(
      "/service-allowances/import/excel",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  /**
   * ✅ NEW: Download Excel template for import
   * GET /service-allowances/export/template
   */
  downloadTemplate: async (): Promise<Blob> => {
    const response = await apiClient.get(
      "/service-allowances/export/template",
      {
        responseType: "blob",
      }
    );
    return response.data;
  },
};

export default serviceAllowanceService;
