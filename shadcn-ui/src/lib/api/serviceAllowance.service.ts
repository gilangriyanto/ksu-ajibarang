// src/lib/api/serviceAllowance.service.ts
// Standalone service - no external dependencies

const BASE_URL = "https://ksp.gascpns.id/api";

// =====================================================
// TYPES
// =====================================================

export interface ServiceAllowance {
  id: number;
  user_id: number;
  period_month: number;
  period_year: number;
  base_amount: string;
  savings_bonus: string;
  loan_bonus: string;
  total_amount: string;
  status: "paid" | "pending";
  payment_date: string | null;
  notes: string | null;
  distributed_by: {
    id: number;
    full_name: string;
  };
  created_at: string;
  updated_at: string;
  period_display: string;
  status_name: string;
  user: {
    id: number;
    full_name: string;
    employee_id: string;
    email?: string;
  };
}

export interface DistributeRequest {
  period_month: number;
  period_year: number;
  base_amount: number;
  savings_rate: number;
  loan_rate: number;
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

export const serviceAllowanceService = {
  /**
   * Get all service allowances
   */
  getAll: async (params?: {
    user_id?: number;
    month?: number;
    year?: number;
    status?: string;
  }): Promise<ServiceAllowance[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append("all", "true");

    if (params?.user_id)
      queryParams.append("user_id", params.user_id.toString());
    if (params?.month) queryParams.append("month", params.month.toString());
    if (params?.year) queryParams.append("year", params.year.toString());
    if (params?.status) queryParams.append("status", params.status);

    const response = await fetch(
      `${BASE_URL}/service-allowances?${queryParams}`,
      { headers: getHeaders() }
    );

    return handleResponse(response);
  },

  /**
   * Get single allowance by ID
   */
  getById: async (id: number): Promise<ServiceAllowance> => {
    const response = await fetch(`${BASE_URL}/service-allowances/${id}`, {
      headers: getHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * Distribute allowance to all active members
   */
  distribute: async (data: DistributeRequest): Promise<any> => {
    const response = await fetch(`${BASE_URL}/service-allowances/distribute`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  /**
   * Mark allowance as paid
   */
  markAsPaid: async (id: number, notes?: string): Promise<ServiceAllowance> => {
    const response = await fetch(
      `${BASE_URL}/service-allowances/${id}/mark-as-paid`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ notes: notes || "" }),
      }
    );

    return handleResponse(response);
  },

  /**
   * Get period summary
   */
  getPeriodSummary: async (month: number, year: number): Promise<any> => {
    const response = await fetch(
      `${BASE_URL}/service-allowances/period-summary?month=${month}&year=${year}`,
      { headers: getHeaders() }
    );

    return handleResponse(response);
  },
};

export default serviceAllowanceService;
