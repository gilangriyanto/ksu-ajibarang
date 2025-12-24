// src/lib/api/generalLedger.service.ts
import apiClient from "./api-client";

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

export interface GeneralLedgerResponse {
  success: boolean;
  message: string;
  data: GeneralLedgerAccount[];
}

export const generalLedgerService = {
  /**
   * Get general ledger for a specific period
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   */
  getGeneralLedger: async (
    startDate: string,
    endDate: string
  ): Promise<GeneralLedgerResponse> => {
    const response = await apiClient.get<GeneralLedgerResponse>(
      `/journals/general-ledger?start_date=${startDate}&end_date=${endDate}`
    );
    return response.data;
  },

  /**
   * Get general ledger for comparison between two periods
   */
  getComparativeGeneralLedger: async (
    currentStart: string,
    currentEnd: string,
    previousStart: string,
    previousEnd: string
  ) => {
    const [current, previous] = await Promise.all([
      generalLedgerService.getGeneralLedger(currentStart, currentEnd),
      generalLedgerService.getGeneralLedger(previousStart, previousEnd),
    ]);

    return {
      current,
      previous,
    };
  },
};
