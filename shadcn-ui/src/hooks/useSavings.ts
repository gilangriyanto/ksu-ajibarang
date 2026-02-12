// src/hooks/useSavings.ts
// ✅ UPDATED: With saving types support

import { useState, useEffect, useCallback } from "react";
import savingsService, {
  type Saving,
  type SavingType,
  type SavingsSummary,
  type CreateSavingData,
  type UpdateSavingData,
} from "@/lib/api/savings.service";

/**
 * Hook for Admin/Manager - All Savings
 * ✅ UPDATED: Added loadSavingTypes
 */
export function useSavings(params?: {
  all?: boolean;
  user_id?: number;
  saving_type_id?: number;
  saving_type?: string;
}) {
  const [savings, setSavings] = useState<Saving[]>([]);
  const [savingTypes, setSavingTypes] = useState<SavingType[]>([]); // ✅ NEW
  const [loading, setLoading] = useState(true);
  const [loadingTypes, setLoadingTypes] = useState(false); // ✅ NEW
  const [error, setError] = useState<string | null>(null);

  const fetchSavings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await savingsService.getAll(params);

      // Handle nested data structure
      const savingsData = result.data?.data || result.data || [];
      setSavings(savingsData);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data simpanan");
      console.error("Fetch savings error:", err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  /**
   * ✅ NEW: Load saving types (master data)
   */
  const loadSavingTypes = useCallback(
    async (params?: { is_active?: boolean }) => {
      setLoadingTypes(true);
      try {
        console.log("🔄 Loading saving types...");

        const response = await savingsService.getSavingTypes({
          is_active: params?.is_active ?? true,
        });

        const typesData = response.data?.data || response.data || [];
        setSavingTypes(typesData);

        console.log(`✅ Loaded ${typesData.length} saving types`);
        return typesData;
      } catch (err: any) {
        console.error("❌ Error loading saving types:", err);
        // Don't throw, just return empty array
        return [];
      } finally {
        setLoadingTypes(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchSavings();
  }, [fetchSavings]);

  const refresh = () => {
    fetchSavings();
  };

  const createSaving = async (data: CreateSavingData): Promise<Saving> => {
    const result = await savingsService.create(data);
    await fetchSavings(); // Refresh list
    return result.data;
  };

  const updateSaving = async (
    id: number,
    data: UpdateSavingData,
  ): Promise<Saving> => {
    const result = await savingsService.update(id, data);
    await fetchSavings(); // Refresh list
    return result.data;
  };

  const deleteSaving = async (id: number): Promise<void> => {
    await savingsService.delete(id);
    await fetchSavings(); // Refresh list
  };

  const approveSaving = async (id: number): Promise<Saving> => {
    const result = await savingsService.approve(id);
    await fetchSavings(); // Refresh list
    return result.data;
  };

  const rejectSaving = async (id: number): Promise<Saving> => {
    const result = await savingsService.reject(id);
    await fetchSavings(); // Refresh list
    return result.data;
  };

  return {
    savings,
    savingTypes, // ✅ NEW
    loading,
    loadingTypes, // ✅ NEW
    error,
    refresh,
    loadSavingTypes, // ✅ NEW
    createSaving,
    updateSaving,
    deleteSaving,
    approveSaving,
    rejectSaving,
  };
}

/**
 * Hook for Saving Detail
 */
export function useSavingDetail(id: number | null) {
  const [saving, setSaving] = useState<Saving | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const result = await savingsService.getById(id);
      setSaving(result.data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat detail simpanan");
      console.error("Fetch saving detail error:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    saving,
    loading,
    error,
    refresh: fetchDetail,
  };
}

/**
 * Hook for Savings Summary
 */
export function useSavingsSummary(userId?: number) {
  const [summary, setSummary] = useState<SavingsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await savingsService.getSummary(userId);
      setSummary(result.data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat ringkasan simpanan");
      console.error("Fetch savings summary error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refresh: fetchSummary,
  };
}

/**
 * Hook for Savings by Type
 * ✅ UPDATED: Can use type ID or enum
 */
export function useSavingsByType(
  type: "principal" | "mandatory" | "voluntary" | "holiday" | number,
  userId?: number,
) {
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavingsByType = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let result;

      // ✅ NEW: If type is number, use type ID endpoint
      if (typeof type === "number") {
        result = await savingsService.getByTypeId(type, userId);
      } else {
        // OLD: Use enum endpoint
        switch (type) {
          case "principal":
            result = await savingsService.getByType.principal(userId);
            break;
          case "mandatory":
            result = await savingsService.getByType.mandatory(userId);
            break;
          case "voluntary":
            result = await savingsService.getByType.voluntary(userId);
            break;
          case "holiday":
            result = await savingsService.getByType.holiday(userId);
            break;
        }
      }

      const savingsData = result.data?.data || result.data || [];
      setSavings(savingsData);
    } catch (err: any) {
      setError(err.message || "Gagal memuat simpanan berdasarkan jenis");
      console.error("Fetch savings by type error:", err);
    } finally {
      setLoading(false);
    }
  }, [type, userId]);

  useEffect(() => {
    fetchSavingsByType();
  }, [fetchSavingsByType]);

  return {
    savings,
    loading,
    error,
    refresh: fetchSavingsByType,
  };
}

/**
 * Hook for Member's Own Savings
 */
export function useMemberSavings(userId: number) {
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberSavings = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await savingsService.getAll({ user_id: userId });

      const savingsData = result.data?.data || result.data || [];
      setSavings(savingsData);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data simpanan");
      console.error("Fetch member savings error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMemberSavings();
  }, [fetchMemberSavings]);

  return {
    savings,
    loading,
    error,
    refresh: fetchMemberSavings,
  };
}

/**
 * ✅ NEW: Hook specifically for Saving Types management
 */
export function useSavingTypes() {
  const [savingTypes, setSavingTypes] = useState<SavingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavingTypes = useCallback(
    async (params?: { is_active?: boolean }) => {
      try {
        setLoading(true);
        setError(null);
        const result = await savingsService.getSavingTypes(params);

        const typesData = result.data?.data || result.data || [];
        setSavingTypes(typesData);
      } catch (err: any) {
        setError(err.message || "Gagal memuat jenis simpanan");
        console.error("Fetch saving types error:", err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchSavingTypes({ is_active: true });
  }, [fetchSavingTypes]);

  const createSavingType = async (data: {
    name: string;
    code: string;
    description?: string;
    is_mandatory: boolean;
  }): Promise<SavingType> => {
    const result = await savingsService.createSavingType(data);
    await fetchSavingTypes(); // Refresh list
    return result.data;
  };

  const updateSavingType = async (
    id: number,
    data: {
      name?: string;
      code?: string;
      description?: string;
      is_mandatory?: boolean;
      is_active?: boolean;
    },
  ): Promise<SavingType> => {
    const result = await savingsService.updateSavingType(id, data);
    await fetchSavingTypes(); // Refresh list
    return result.data;
  };

  const deleteSavingType = async (id: number): Promise<void> => {
    await savingsService.deleteSavingType(id);
    await fetchSavingTypes(); // Refresh list
  };

  return {
    savingTypes,
    loading,
    error,
    refresh: fetchSavingTypes,
    createSavingType,
    updateSavingType,
    deleteSavingType,
  };
}
