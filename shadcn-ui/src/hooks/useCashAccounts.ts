// hooks/useCashAccounts.ts
// FINAL VERSION - Merged best features from both versions
// Complete with interest rates, managers, and proper error handling

import { useState, useEffect, useCallback } from "react";
import cashAccountsService, {
  CashAccount,
  CashAccountSummary,
  Manager,
  CreateCashAccountData,
  UpdateCashAccountData,
  AssignManagerData,
} from "@/lib/api/cash-accounts.service";
import { toast } from "sonner";

interface UseCashAccountsOptions {
  type?: string;
  is_active?: boolean;
  autoLoad?: boolean;
  all?: boolean;
}

export const useCashAccounts = (options: UseCashAccountsOptions = {}) => {
  const { autoLoad = true, all = false } = options;

  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);
  const [summary, setSummary] = useState<CashAccountSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all cash accounts with filters
   */
  const loadCashAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔄 Loading cash accounts with options:", options);

      const response = await cashAccountsService.getAll({
        type: options.type,
        is_active: options.is_active,
        all,
      });

      console.log("📋 Cash Accounts API response:", response);

      // Handle both response structures
      let accountsData: CashAccount[] = [];
      
      if (response.success && Array.isArray(response.data)) {
        accountsData = response.data;
      } else if (Array.isArray(response.data)) {
        accountsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        accountsData = response.data.data;
      }

      console.log("📋 Parsed cash accounts:", accountsData.length);

      setCashAccounts(accountsData);

      return accountsData;
    } catch (err: any) {
      console.error("❌ Error loading cash accounts:", err);
      
      // Handle 403 specially (no access)
      if (err.response?.status === 403) {
        const errorMsg = "Anda tidak memiliki akses ke data kas";
        setError(errorMsg);
        toast.error(errorMsg);
        setCashAccounts([]);
        return [];
      }
      
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Gagal memuat data kas";
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options.type, options.is_active, all]);

  /**
   * Load cash accounts summary
   */
  const loadSummary = useCallback(async () => {
    try {
      console.log("📊 Loading cash accounts summary");

      const response = await cashAccountsService.getSummary();
      console.log("📊 Summary response:", response);

      const summaryData = response.success ? response.data : response.data;

      if (summaryData) {
        setSummary(summaryData);
        return summaryData;
      }
    } catch (err: any) {
      console.error("❌ Error loading summary:", err);
      // Summary is optional, don't throw
    }
  }, []);

  /**
   * Get single cash account by ID
   */
  const getCashAccountById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔍 Loading cash account detail:", id);

      const response = await cashAccountsService.getById(id);
      const accountData = response.success ? response.data : response.data;

      console.log("✅ Cash account detail loaded:", accountData);

      return accountData;
    } catch (err: any) {
      console.error("❌ Error loading cash account detail:", err);
      
      if (err.response?.status === 403) {
        toast.error("Anda tidak memiliki akses ke kas ini");
      } else if (err.response?.status === 404) {
        toast.error("Kas tidak ditemukan");
      } else {
        toast.error("Gagal memuat detail kas");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new cash account
   */
  const createCashAccount = useCallback(
    async (data: CreateCashAccountData) => {
      setLoading(true);
      try {
        console.log("📤 Creating cash account:", data);

        const response = await cashAccountsService.create(data);

        console.log("✅ Cash account created:", response);

        toast.success(
          response.message || "Kas berhasil dibuat"
        );

        // Reload cash accounts
        await loadCashAccounts();
        if (summary) await loadSummary();

        return response.success ? response.data : response.data;
      } catch (err: any) {
        console.error("❌ Error creating cash account:", err);

        // Handle validation errors (422)
        if (err.response?.status === 422 && err.response?.data?.errors) {
          const apiErrors = err.response.data.errors;
          const errorMessages = Object.values(apiErrors).flat().join(", ");
          toast.error(errorMessages);
        } else {
          const errorMsg =
            err.response?.data?.message ||
            err.message ||
            "Gagal membuat kas";
          toast.error(errorMsg);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadCashAccounts, loadSummary, summary]
  );

  /**
   * Update cash account
   */
  const updateCashAccount = useCallback(
    async (id: number, data: UpdateCashAccountData) => {
      setLoading(true);
      try {
        console.log("📤 Updating cash account:", id, data);

        const response = await cashAccountsService.update(id, data);

        console.log("✅ Cash account updated:", response);

        toast.success(
          response.message || "Kas berhasil diperbarui"
        );

        // Reload cash accounts
        await loadCashAccounts();
        if (summary) await loadSummary();

        return response.success ? response.data : response.data;
      } catch (err: any) {
        console.error("❌ Error updating cash account:", err);

        // Handle validation errors (422)
        if (err.response?.status === 422 && err.response?.data?.errors) {
          const apiErrors = err.response.data.errors;
          const errorMessages = Object.values(apiErrors).flat().join(", ");
          toast.error(errorMessages);
        } else {
          const errorMsg =
            err.response?.data?.message ||
            err.message ||
            "Gagal memperbarui kas";
          toast.error(errorMsg);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadCashAccounts, loadSummary, summary]
  );

  /**
   * Delete cash account
   */
  const deleteCashAccount = useCallback(
    async (id: number) => {
      setLoading(true);
      try {
        console.log("🗑️ Deleting cash account:", id);

        const response = await cashAccountsService.delete(id);

        console.log("✅ Cash account deleted");

        toast.success(
          response.message || "Kas berhasil dihapus"
        );

        // Reload cash accounts
        await loadCashAccounts();
        if (summary) await loadSummary();

        return true;
      } catch (err: any) {
        console.error("❌ Error deleting cash account:", err);

        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Gagal menghapus kas";
        toast.error(errorMsg);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadCashAccounts, loadSummary, summary]
  );

  /**
   * Get managers for specific cash account
   */
  const getManagers = useCallback(async (cashAccountId: number) => {
    try {
      console.log("👥 Loading managers for cash account:", cashAccountId);

      const response = await cashAccountsService.getManagers(cashAccountId);
      const managersData = response.success 
        ? response.data 
        : response.data || [];

      console.log("✅ Managers loaded:", managersData.length);

      return managersData;
    } catch (err: any) {
      console.error("❌ Error loading managers:", err);
      toast.error("Gagal memuat data pengelola");
      throw err;
    }
  }, []);

  /**
   * Get available managers (for assignment)
   */
  const getAvailableManagers = useCallback(async () => {
    try {
      console.log("👥 Loading available managers");

      const response = await cashAccountsService.getAvailableManagers();
      const managersData = response.success 
        ? response.data 
        : response.data || [];

      console.log("✅ Available managers loaded:", managersData.length);

      return managersData;
    } catch (err: any) {
      console.error("❌ Error loading available managers:", err);
      toast.error("Gagal memuat daftar manager");
      throw err;
    }
  }, []);

  /**
   * Assign manager to cash account
   */
  const assignManager = useCallback(
    async (cashAccountId: number, data: AssignManagerData) => {
      setLoading(true);
      try {
        console.log("📤 Assigning manager:", cashAccountId, data);

        const response = await cashAccountsService.assignManager(
          cashAccountId,
          data
        );

        console.log("✅ Manager assigned:", response);

        toast.success(
          response.message || "Manager berhasil ditugaskan"
        );

        await loadCashAccounts();

        return response.success ? response.data : response.data;
      } catch (err: any) {
        console.error("❌ Error assigning manager:", err);

        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Gagal menugaskan manager";
        toast.error(errorMsg);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadCashAccounts]
  );

  /**
   * Remove manager from cash account
   */
  const removeManager = useCallback(
    async (cashAccountId: number, managerId: number) => {
      setLoading(true);
      try {
        console.log("🗑️ Removing manager:", cashAccountId, managerId);

        const response = await cashAccountsService.removeManager(
          cashAccountId,
          managerId
        );

        console.log("✅ Manager removed");

        toast.success(
          response.message || "Manager berhasil dihapus"
        );

        await loadCashAccounts();

        return true;
      } catch (err: any) {
        console.error("❌ Error removing manager:", err);

        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Gagal menghapus manager";
        toast.error(errorMsg);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadCashAccounts]
  );

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    await Promise.all([loadCashAccounts(), loadSummary()]);
  }, [loadCashAccounts, loadSummary]);

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadCashAccounts();
      loadSummary();
    }
  }, [autoLoad, loadCashAccounts, loadSummary]);

  return {
    // State
    cashAccounts,
    summary,
    loading,
    error,

    // Actions - Cash Accounts
    loadCashAccounts,
    getCashAccountById,
    createCashAccount,
    updateCashAccount,
    deleteCashAccount,

    // Actions - Managers
    getManagers,
    getAvailableManagers,
    assignManager,
    removeManager,

    // Utility
    refresh,
  };
};

export default useCashAccounts;