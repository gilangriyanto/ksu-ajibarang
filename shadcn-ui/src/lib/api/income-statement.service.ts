// lib/api/income-statement.service.ts
// ✅ NEW: Dedicated service for income statement using /journals/income-statement
// ✅ No longer calculated from general ledger data
// ✅ Backend handles all revenue/expense categorization

import apiClient from "./api-client";

// ==================== INTERFACES ====================

export interface IncomeStatementAccount {
  account_id: number;
  code: string;
  name: string;
  amount: number;
}

export interface IncomeStatementData {
  revenue: IncomeStatementAccount[];
  total_revenue: number;
  expenses: IncomeStatementAccount[];
  total_expenses: number;
  summary: {
    total_revenue: number;
    total_expenses: number;
    net_income: number;
    operating_margin: number;
    is_profit: boolean;
  };
  // Only present when compare=true
  comparison?: {
    revenue: IncomeStatementAccount[];
    total_revenue: number;
    expenses: IncomeStatementAccount[];
    total_expenses: number;
    summary: {
      total_revenue: number;
      total_expenses: number;
      net_income: number;
      operating_margin: number;
      is_profit: boolean;
    };
  };
  variance?: {
    revenue_change: number;
    revenue_change_percentage: number;
    expenses_change: number;
    expenses_change_percentage: number;
    net_income_change: number;
    net_income_change_percentage: number;
    trend: "improving" | "declining" | "stable";
  };
}

export interface IncomeStatementResponse {
  success: boolean;
  message: string;
  data: IncomeStatementData;
}

// ==================== SERVICE ====================

class IncomeStatementService {
  /**
   * GET /journals/income-statement
   * ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&compare=true
   */
  async getIncomeStatement(
    startDate: string,
    endDate: string,
    compare: boolean = true,
  ): Promise<IncomeStatementResponse> {
    try {
      console.log("📤 GET /journals/income-statement", {
        startDate,
        endDate,
        compare,
      });
      const response = await apiClient.get<IncomeStatementResponse>(
        `/journals/income-statement`,
        {
          params: {
            start_date: startDate,
            end_date: endDate,
            compare: compare ? "true" : undefined,
          },
        },
      );
      console.log("✅ Income statement loaded:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching income statement:", error);
      throw this.handleError(error);
    }
  }

  // ==================== HELPERS ====================

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  calculateVariance(current: number, previous: number) {
    const amount = current - previous;
    const percentage =
      previous !== 0
        ? (amount / Math.abs(previous)) * 100
        : current !== 0
          ? 100
          : 0;
    return { amount, percentage };
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.message || error.message;
      return new Error(message);
    }
    return error;
  }
}

const incomeStatementService = new IncomeStatementService();
export default incomeStatementService;
