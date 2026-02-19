// hooks/useResignations.ts
// 🔧 UPDATED: Sesuai Postman Collection Member Resignation (UPDATED)
// ✅ Member view own history via GET /resignations?user_id=X (bukan /members/{id}/resignations)
// ✅ Status 'completed' ditambahkan
// ✅ Search & date range params

import { useState, useEffect, useCallback } from "react";
import resignationService, {
  Resignation,
  ResignationStatistics,
  MemberCreateResignationData,
  AdminCreateResignationData,
  ProcessResignationData,
  ResignationListParams,
} from "@/lib/api/resignation.service";

// ==================== useResignations Hook ====================

interface UseResignationsParams {
  status?: "pending" | "approved" | "rejected" | "completed";
  user_id?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  per_page?: number;
  autoLoad?: boolean;
}

export const useResignations = (params?: UseResignationsParams) => {
  const [resignations, setResignations] = useState<Resignation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract primitive values to avoid object reference issues
  const status = params?.status;
  const user_id = params?.user_id;
  const start_date = params?.start_date;
  const end_date = params?.end_date;
  const search = params?.search;
  const page = params?.page;
  const per_page = params?.per_page;
  const autoLoad = params?.autoLoad;

  const loadResignations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams: ResignationListParams = {};
      if (status) queryParams.status = status;
      if (user_id) queryParams.user_id = user_id;
      if (start_date) queryParams.start_date = start_date;
      if (end_date) queryParams.end_date = end_date;
      if (search) queryParams.search = search;
      if (page) queryParams.page = page;
      if (per_page) queryParams.per_page = per_page;

      console.log("🔍 Loading resignations with params:", queryParams);
      const response = await resignationService.getResignations(queryParams);
      console.log("📦 Raw resignation response:", response);

      // Handle multiple response structures:
      // 1. Direct array: [...]
      // 2. { data: [...] }
      // 3. { data: { data: [...], current_page, ... } } (Laravel paginate)
      // 4. { success: true, data: [...] }
      // 5. { success: true, data: { data: [...] } }
      let items: Resignation[] = [];

      if (Array.isArray(response)) {
        items = response;
      } else if (response?.data) {
        if (Array.isArray(response.data)) {
          items = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          // Laravel paginated nested
          items = response.data.data;
        } else if (typeof response.data === "object") {
          // Maybe the data itself is paginated at top level
          items = [];
        }
      }

      console.log("✅ Parsed resignations:", items.length, "items");
      setResignations(items);
    } catch (err: any) {
      console.error("Error loading resignations:", err);
      setError(err.message || "Gagal memuat data pengunduran diri");
      setResignations([]);
    } finally {
      setLoading(false);
    }
  }, [status, user_id, start_date, end_date, search, page, per_page]);

  useEffect(() => {
    if (autoLoad !== false) {
      loadResignations();
    }
  }, [loadResignations, autoLoad]);

  // ✅ Member submit (tanpa user_id)
  const memberSubmitResignation = async (
    reason: string,
    resignationDate?: string,
  ) => {
    try {
      const response = await resignationService.memberSubmitResignation(
        reason,
        resignationDate,
      );
      await loadResignations();
      return response;
    } catch (err) {
      console.error("Error creating resignation:", err);
      throw err;
    }
  };

  // ✅ Admin submit (dengan user_id)
  const adminSubmitResignation = async (
    userId: number,
    reason: string,
    resignationDate?: string,
  ) => {
    try {
      const response = await resignationService.adminSubmitResignation(
        userId,
        reason,
        resignationDate,
      );
      await loadResignations();
      return response;
    } catch (err) {
      console.error("Error creating resignation (admin):", err);
      throw err;
    }
  };

  const processResignation = async (
    id: number,
    data: ProcessResignationData,
  ) => {
    try {
      const response = await resignationService.processResignation(id, data);
      await loadResignations();
      return response;
    } catch (err) {
      console.error("Error processing resignation:", err);
      throw err;
    }
  };

  const approveResignation = async (id: number, admin_notes?: string) => {
    try {
      const response = await resignationService.approveResignation(
        id,
        admin_notes,
      );
      await loadResignations();
      return response;
    } catch (err) {
      console.error("Error approving resignation:", err);
      throw err;
    }
  };

  const rejectResignation = async (
    id: number,
    rejection_reason: string,
    admin_notes?: string,
  ) => {
    try {
      const response = await resignationService.rejectResignation(
        id,
        rejection_reason,
        admin_notes,
      );
      await loadResignations();
      return response;
    } catch (err) {
      console.error("Error rejecting resignation:", err);
      throw err;
    }
  };

  return {
    resignations,
    loading,
    error,
    refetch: loadResignations,
    memberSubmitResignation,
    adminSubmitResignation,
    processResignation,
    approveResignation,
    rejectResignation,
  };
};

// ==================== useResignationDetail Hook ====================

export const useResignationDetail = (id: number | null) => {
  const [resignation, setResignation] = useState<Resignation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadResignation = useCallback(async () => {
    if (!id) {
      setResignation(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await resignationService.getResignationById(id);
      setResignation(response.data || response);
    } catch (err: any) {
      console.error("Error loading resignation detail:", err);
      setError(err.message || "Gagal memuat detail pengunduran diri");
      setResignation(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadResignation();
  }, [loadResignation]);

  return {
    resignation,
    loading,
    error,
    refetch: loadResignation,
  };
};

// ==================== useResignationStatistics Hook ====================

export const useResignationStatistics = (year?: number) => {
  const [statistics, setStatistics] = useState<ResignationStatistics | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await resignationService.getStatistics(
        year ? { year } : undefined,
      );
      setStatistics(response.data || response);
    } catch (err: any) {
      console.error("Error loading statistics:", err);
      setError(err.message || "Gagal memuat statistik");
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  return {
    statistics,
    loading,
    error,
    refetch: loadStatistics,
  };
};

// ==================== useMemberResignations Hook ====================
// ✅ UPDATED: Member role - backend auto-filters by JWT token
// Don't send user_id param (causes issues), just GET /resignations

export const useMemberResignations = (userId: number | null) => {
  const { resignations, loading, error, refetch, memberSubmitResignation } =
    useResignations({
      // Don't send user_id - backend filters by JWT for member role
      // Sending user_id can cause empty results if backend doesn't support it
      autoLoad: true,
    });

  return {
    resignations,
    loading,
    error,
    refetch,
    memberSubmitResignation,
  };
};
