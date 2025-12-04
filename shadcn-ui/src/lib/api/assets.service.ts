// src/lib/api/assets.service.ts
import apiClient, { ApiResponse } from "./api-client";

// =====================================================
// TYPES
// =====================================================

export interface Asset {
  id: number;
  asset_code: string;
  asset_name: string;
  category: "land" | "building" | "vehicle" | "equipment" | "inventory";
  acquisition_cost: string;
  acquisition_date: string;
  useful_life_months: number;
  residual_value: string;
  depreciation_per_month: string;
  accumulated_depreciation: string;
  book_value: string;
  last_depreciation_date: string | null;
  location: string;
  status: "active" | "inactive" | "disposed";
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  category_name: string;
  status_name: string;
}

export interface CreateAssetRequest {
  asset_name: string;
  category: "land" | "building" | "vehicle" | "equipment" | "inventory";
  acquisition_cost: number;
  acquisition_date: string; // YYYY-MM-DD
  useful_life_months: number;
  residual_value: number;
  location: string;
  status: "active" | "inactive";
  notes?: string;
}

export interface UpdateAssetRequest {
  asset_name?: string;
  category?: "land" | "building" | "vehicle" | "equipment" | "inventory";
  acquisition_cost?: number;
  acquisition_date?: string;
  useful_life_months?: number;
  residual_value?: number;
  location?: string;
  status?: "active" | "inactive" | "disposed";
  notes?: string;
}

export interface DepreciationSchedule {
  month: number;
  date: string;
  depreciation: string;
  accumulated: number;
  book_value: number;
}

export interface DepreciationScheduleResponse {
  asset: {
    acquisition_cost: string;
    asset_code: string;
    asset_name: string;
    useful_life_months: number;
  };
  schedule: DepreciationSchedule[];
}

export interface AssetSummary {
  total_assets: number;
  active_assets: number;
  total_acquisition_cost: string;
  total_accumulated_depreciation: string;
  total_book_value: string;
  by_category: {
    land: string | number;
    building: string | number;
    vehicle: string | number;
    equipment: string | number;
    inventory: string | number;
  };
}

export interface CalculateDepreciationResponse {
  asset_code: string;
  asset_name: string;
  depreciation_amount: number;
  new_book_value: string;
  accumulated_depreciation: string;
  last_depreciation_date: string;
}

export interface CalculateAllDepreciationResponse {
  assets_processed: number;
  total_depreciation: number;
  details: Array<{
    asset_code: string;
    asset_name: string;
    depreciation_amount: number;
    new_book_value: string;
  }>;
}

// =====================================================
// SERVICE
// =====================================================

const assetsService = {
  /**
   * Get all assets with filters
   * GET /assets
   */
  getAll: async (params?: {
    category?: string;
    status?: string;
    per_page?: number;
    page?: number;
  }): Promise<Asset[]> => {
    const response = await apiClient.get<ApiResponse<Asset[]>>("/assets", {
      params,
    });
    return response.data.data;
  },

  /**
   * Get single asset by ID
   * GET /assets/{id}
   */
  getById: async (id: number): Promise<Asset> => {
    const response = await apiClient.get<ApiResponse<Asset>>(`/assets/${id}`);
    return response.data.data;
  },

  /**
   * Create new asset
   * POST /assets
   */
  create: async (data: CreateAssetRequest): Promise<Asset> => {
    const response = await apiClient.post<ApiResponse<Asset>>("/assets", data);
    return response.data.data;
  },

  /**
   * Update asset
   * PUT /assets/{id}
   */
  update: async (id: number, data: UpdateAssetRequest): Promise<Asset> => {
    const response = await apiClient.put<ApiResponse<Asset>>(
      `/assets/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete asset
   * DELETE /assets/{id}
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/assets/${id}`);
  },

  /**
   * Calculate depreciation for single asset
   * POST /assets/{id}/calculate-depreciation
   */
  calculateDepreciation: async (
    id: number
  ): Promise<CalculateDepreciationResponse> => {
    const response = await apiClient.post<
      ApiResponse<CalculateDepreciationResponse>
    >(`/assets/${id}/calculate-depreciation`);
    return response.data.data;
  },

  /**
   * Calculate depreciation for all assets
   * POST /assets/calculate-all-depreciation
   */
  calculateAllDepreciation:
    async (): Promise<CalculateAllDepreciationResponse> => {
      const response = await apiClient.post<
        ApiResponse<CalculateAllDepreciationResponse>
      >("/assets/calculate-all-depreciation");
      return response.data.data;
    },

  /**
   * Get depreciation schedule for asset
   * GET /assets/{id}/depreciation-schedule
   */
  getDepreciationSchedule: async (
    id: number
  ): Promise<DepreciationScheduleResponse> => {
    const response = await apiClient.get<
      ApiResponse<DepreciationScheduleResponse>
    >(`/assets/${id}/depreciation-schedule`);
    return response.data.data;
  },

  /**
   * Get assets summary
   * GET /assets/summary
   */
  getSummary: async (): Promise<AssetSummary> => {
    const response = await apiClient.get<ApiResponse<AssetSummary>>(
      "/assets/summary"
    );
    return response.data.data;
  },
};

export default assetsService;
