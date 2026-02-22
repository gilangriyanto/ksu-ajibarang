import apiClient, { ApiResponse } from "./api-client";

export interface ActivityLogUser {
  id: number;
  full_name: string;
  employee_id: string;
  email?: string;
}

export interface ActivityLogCashAccount {
  id: number;
  code: string;
  name: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  kas_id: number | null;
  activity: string;
  activity_name: string;
  module: string;
  module_name: string;
  description: string;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user?: ActivityLogUser;
  cashAccount?: ActivityLogCashAccount;
}

export interface ActivityLogStats {
  total_activities: number;
  today: number;
  this_week: number;
  this_month: number;
  by_activity: {
    create: number;
    update: number;
    delete: number;
    login: number;
  };
  by_module: {
    savings: number;
    loans: number;
    installments: number;
    users: number;
    gifts: number;
  };
  most_active_users: Array<{
    user: ActivityLogUser;
    activity_count: number;
  }>;
}

export interface ActivityLogFilters {
  user_id?: string | number;
  module?: string;
  activity?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
  all?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

const activityLogService = {
  /**
   * Get all activity logs with optional filtering and pagination
   */
  getAll: async (params?: ActivityLogFilters): Promise<PaginatedResponse<ActivityLog> | ActivityLog[]> => {
    const response = await apiClient.get<ApiResponse<ActivityLog[]>>("/activity-logs", { params });
    
    // If the API response includes meta (pagination), wrap it appropriately
    if (response.data.meta) {
      return {
        data: response.data.data,
        meta: response.data.meta as any
      };
    }
    
    // Otherwise, just return the data array
    return response.data.data;
  },

  /**
   * Get specific activity log details
   */
  getById: async (id: string | number): Promise<ActivityLog> => {
    const response = await apiClient.get<ApiResponse<ActivityLog>>(`/activity-logs/${id}`);
    return response.data.data;
  },

  /**
   * Get activity history for a specific user
   */
  getUserHistory: async (userId: string | number): Promise<{ user: ActivityLogUser; logs: ActivityLog[] }> => {
    const response = await apiClient.get<ApiResponse<{ user: ActivityLogUser; logs: ActivityLog[] }>>(`/activity-logs/user/${userId}`);
    return response.data.data;
  },

  /**
   * Get overall activity statistics
   */
  getStatistics: async (): Promise<ActivityLogStats> => {
    const response = await apiClient.get<ApiResponse<ActivityLogStats>>("/activity-logs/statistics");
    return response.data.data;
  },
};

export default activityLogService;
