// src/lib/api/trialBalance.service.ts
import apiClient from "./api-client";

export interface TrialBalanceAccount {
  account_code: string;
  account_name: string;
  account_type: string;
  debit: number;
  credit: number;
}

export interface TrialBalanceData {
  trial_balance: TrialBalanceAccount[];
  total_debit: number;
  total_credit: number;
  is_balanced: boolean;
  end_date: string;
}

export interface TrialBalanceResponse {
  success: boolean;
  message: string;
  data: TrialBalanceData;
}

export const trialBalanceService = {
  /**
   * Get trial balance for a specific period
   * @param endDate - End date in YYYY-MM-DD format
   */
  getTrialBalance: async (endDate: string): Promise<TrialBalanceResponse> => {
    const response = await apiClient.get<TrialBalanceResponse>(
      `/journals/trial-balance?end_date=${endDate}`
    );
    return response.data;
  },

  /**
   * Get trial balance for comparison between two periods
   */
  getComparativeTrialBalance: async (
    currentPeriodEnd: string,
    previousPeriodEnd: string
  ) => {
    const [current, previous] = await Promise.all([
      trialBalanceService.getTrialBalance(currentPeriodEnd),
      trialBalanceService.getTrialBalance(previousPeriodEnd),
    ]);

    return {
      current,
      previous,
    };
  },
};
