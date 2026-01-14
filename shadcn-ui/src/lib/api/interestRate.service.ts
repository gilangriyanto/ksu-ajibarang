import apiClient, { ApiResponse } from "./api-client";

// =====================================================
// TYPES
// =====================================================

export interface InterestRate {
  id: number;
  cash_account_id: number;
  transaction_type: "savings" | "loans";
  rate_percentage: string;
  effective_date: string;
  updated_by: {
    id: number;
    full_name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CashAccount {
  id: number;
  code: string;
  name: string;
}

export interface InterestRatesResponse {
  cash_account: CashAccount;
  rates: InterestRate[];
  current_savings_rate: InterestRate | {};
  current_loan_rate: InterestRate | {};
}

export interface CreateInterestRateRequest {
  transaction_type: "savings" | "loans";
  rate_percentage: number;
  effective_date: string; // YYYY-MM-DD
}

export interface UpdateInterestRateRequest {
  transaction_type?: "savings" | "loans";
  rate_percentage?: number;
  effective_date?: string;
}

export interface CreateInterestRateResponse {
  rate: InterestRate;
  cash_account: CashAccount;
}

// =====================================================
// SERVICE
// =====================================================

const interestRateService = {
  /**
   * Get all interest rates for a cash account
   * GET /cash-accounts/{cash_account_id}/interest-rates
   */
  getInterestRates: async (
    cashAccountId: number
  ): Promise<InterestRatesResponse> => {
    const response = await apiClient.get<ApiResponse<InterestRatesResponse>>(
      `/cash-accounts/${cashAccountId}/interest-rates`
    );
    return response.data.data;
  },

  /**
   * Create new interest rate
   * POST /cash-accounts/{cash_account_id}/interest-rates
   */
  createInterestRate: async (
    cashAccountId: number,
    data: CreateInterestRateRequest
  ): Promise<CreateInterestRateResponse> => {
    const response = await apiClient.post<
      ApiResponse<CreateInterestRateResponse>
    >(`/cash-accounts/${cashAccountId}/interest-rates`, data);
    return response.data.data;
  },

  /**
   * Update interest rate
   * PUT /interest-rates/{id}
   */
  updateInterestRate: async (
    id: number,
    data: UpdateInterestRateRequest
  ): Promise<InterestRate> => {
    const response = await apiClient.put<ApiResponse<{ rate: InterestRate }>>(
      `/interest-rates/${id}`,
      data
    );
    return response.data.data.rate;
  },

  /**
   * Delete interest rate
   * DELETE /interest-rates/{id}
   */
  deleteInterestRate: async (id: number): Promise<void> => {
    await apiClient.delete(`/interest-rates/${id}`);
  },
};

export default interestRateService;
