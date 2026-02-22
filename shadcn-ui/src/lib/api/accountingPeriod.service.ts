import apiClient from "./api-client";

export interface AccountingPeriod {
  id: number;
  period_name: string;
  start_date: string;
  end_date: string;
  is_closed: boolean;
  closed_by: number | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  closed_by_user?: {
    id: number;
    full_name: string;
    email: string;
  };
  is_active?: boolean;
  has_journals?: boolean;
  journal_count?: number;
  period_type?: string;
}

export interface AccountingPeriodParams {
  page?: number;
  per_page?: number;
  is_closed?: boolean;
  year?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  all?: boolean;
}

class AccountingPeriodService {
  /**
   * Get list of accounting periods
   */
  async getPeriods(params?: AccountingPeriodParams) {
    const response = await apiClient.get('/accounting-periods', { params });
    return response.data;
  }

  /**
   * Get accounting period by ID
   */
  async getPeriod(id: number) {
    const response = await apiClient.get(`/accounting-periods/${id}`);
    return response.data;
  }

  /**
   * Get active accounting period
   */
  async getActivePeriod() {
    const response = await apiClient.get('/accounting-periods/active');
    return response.data.data;
  }

  /**
   * Get period summary by year
   */
  async getSummary(year?: number) {
    const response = await apiClient.get('/accounting-periods/summary', {
      params: { year }
    });
    return response.data.data;
  }

  /**
   * Create new accounting period
   */
  async createPeriod(data: Partial<AccountingPeriod>) {
    const response = await apiClient.post('/accounting-periods', data);
    return response.data;
  }

  /**
   * Update existing period
   */
  async updatePeriod(id: number, data: Partial<AccountingPeriod>) {
    const response = await apiClient.put(`/accounting-periods/${id}`, data);
    return response.data;
  }

  /**
   * Delete a period
   */
  async deletePeriod(id: number) {
    const response = await apiClient.delete(`/accounting-periods/${id}`);
    return response.data;
  }

  /**
   * Close a period
   */
  async closePeriod(id: number) {
    const response = await apiClient.post(`/accounting-periods/${id}/close`);
    return response.data;
  }

  /**
   * Reopen a closed period
   */
  async reopenPeriod(id: number) {
    const response = await apiClient.post(`/accounting-periods/${id}/reopen`);
    return response.data;
  }
}

export const accountingPeriodService = new AccountingPeriodService();
export default accountingPeriodService;
