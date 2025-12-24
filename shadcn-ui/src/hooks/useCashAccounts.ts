import { useState, useEffect } from "react";
import cashAccountsService, {
  CashAccount,
  CashAccountSummary,
  InterestRatesData,
  CurrentRate,
  CreateCashAccountData,
  UpdateCashAccountData,
  AssignManagerData,
  CreateInterestRateData,
  UpdateInterestRateData,
} from "@/lib/api/cashAccounts.service";
import { toast } from "sonner";

interface UseCashAccountsOptions {
  autoLoad?: boolean;
  all?: boolean;
}

export default function useCashAccounts(options: UseCashAccountsOptions = {}) {
  const { autoLoad = true, all = false } = options;

  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);
  const [summary, setSummary] = useState<CashAccountSummary | null>(null);
  const [currentRates, setCurrentRates] = useState<CurrentRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    if (autoLoad) {
      loadCashAccounts();
      loadSummary();
      loadCurrentRates();
    }
  }, [autoLoad]);

  /**
   * Load all cash accounts
   */
  const loadCashAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cashAccountsService.getAll({ all });
      console.log("✅ Cash accounts loaded:", response);

      if (response.success && Array.isArray(response.data)) {
        setCashAccounts(response.data);
      } else {
        throw new Error(response.message || "Failed to load cash accounts");
      }
    } catch (err: any) {
      console.error("❌ Error loading cash accounts:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load cash accounts";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load cash accounts summary
   */
  const loadSummary = async () => {
    try {
      const response = await cashAccountsService.getSummary();
      console.log("✅ Summary loaded:", response);

      if (response.success && response.data) {
        setSummary(response.data);
      }
    } catch (err: any) {
      console.error("❌ Error loading summary:", err);
    }
  };

  /**
   * Load current rates for all accounts
   */
  const loadCurrentRates = async () => {
    try {
      const response = await cashAccountsService.getCurrentRates();
      console.log("✅ Current rates loaded:", response);

      if (response.success && Array.isArray(response.data)) {
        setCurrentRates(response.data);
      }
    } catch (err: any) {
      console.error("❌ Error loading current rates:", err);
    }
  };

  /**
   * Get cash account by ID
   */
  const getCashAccountById = async (id: number) => {
    try {
      const response = await cashAccountsService.getById(id);
      console.log("✅ Cash account loaded:", response);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to load cash account");
    } catch (err: any) {
      console.error("❌ Error loading cash account:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to load cash account"
      );
      throw err;
    }
  };

  /**
   * Create new cash account
   */
  const createCashAccount = async (data: CreateCashAccountData) => {
    try {
      const response = await cashAccountsService.create(data);
      console.log("✅ Cash account created:", response);

      if (response.success) {
        toast.success(response.message || "Cash account created successfully");
        await loadCashAccounts();
        await loadSummary();
        return response.data;
      }
      throw new Error(response.message || "Failed to create cash account");
    } catch (err: any) {
      console.error("❌ Error creating cash account:", err);

      if (err.response?.status === 422 && err.response?.data?.errors) {
        const apiErrors = err.response.data.errors;
        const errorMessages = Object.values(apiErrors).flat().join(", ");
        toast.error(errorMessages);
      } else {
        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Failed to create cash account"
        );
      }
      throw err;
    }
  };

  /**
   * Update cash account
   */
  const updateCashAccount = async (id: number, data: UpdateCashAccountData) => {
    try {
      const response = await cashAccountsService.update(id, data);
      console.log("✅ Cash account updated:", response);

      if (response.success) {
        toast.success(response.message || "Cash account updated successfully");
        await loadCashAccounts();
        await loadSummary();
        return response.data;
      }
      throw new Error(response.message || "Failed to update cash account");
    } catch (err: any) {
      console.error("❌ Error updating cash account:", err);

      if (err.response?.status === 422 && err.response?.data?.errors) {
        const apiErrors = err.response.data.errors;
        const errorMessages = Object.values(apiErrors).flat().join(", ");
        toast.error(errorMessages);
      } else {
        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Failed to update cash account"
        );
      }
      throw err;
    }
  };

  /**
   * Delete cash account
   */
  const deleteCashAccount = async (id: number) => {
    try {
      const response = await cashAccountsService.delete(id);
      console.log("✅ Cash account deleted:", response);

      if (response.success) {
        toast.success(response.message || "Cash account deleted successfully");
        await loadCashAccounts();
        await loadSummary();
        return true;
      }
      throw new Error(response.message || "Failed to delete cash account");
    } catch (err: any) {
      console.error("❌ Error deleting cash account:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete cash account"
      );
      throw err;
    }
  };

  /**
   * Get interest rates for cash account
   */
  const getInterestRates = async (
    cashAccountId: number
  ): Promise<InterestRatesData> => {
    try {
      const response = await cashAccountsService.getInterestRates(
        cashAccountId
      );
      console.log("✅ Interest rates loaded:", response);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to load interest rates");
    } catch (err: any) {
      console.error("❌ Error loading interest rates:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to load interest rates"
      );
      throw err;
    }
  };

  /**
   * Create interest rate
   */
  const createInterestRate = async (
    cashAccountId: number,
    data: CreateInterestRateData
  ) => {
    try {
      const response = await cashAccountsService.createInterestRate(
        cashAccountId,
        data
      );
      console.log("✅ Interest rate created:", response);

      if (response.success) {
        toast.success(response.message || "Interest rate created successfully");
        await loadCurrentRates();
        return response.data;
      }
      throw new Error(response.message || "Failed to create interest rate");
    } catch (err: any) {
      console.error("❌ Error creating interest rate:", err);

      if (err.response?.status === 422 && err.response?.data?.errors) {
        const apiErrors = err.response.data.errors;
        const errorMessages = Object.values(apiErrors).flat().join(", ");
        toast.error(errorMessages);
      } else {
        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Failed to create interest rate"
        );
      }
      throw err;
    }
  };

  /**
   * Update interest rate
   */
  const updateInterestRate = async (
    rateId: number,
    data: UpdateInterestRateData
  ) => {
    try {
      const response = await cashAccountsService.updateInterestRate(
        rateId,
        data
      );
      console.log("✅ Interest rate updated:", response);

      if (response.success) {
        toast.success(response.message || "Interest rate updated successfully");
        await loadCurrentRates();
        return response.data;
      }
      throw new Error(response.message || "Failed to update interest rate");
    } catch (err: any) {
      console.error("❌ Error updating interest rate:", err);

      if (err.response?.status === 422 && err.response?.data?.errors) {
        const apiErrors = err.response.data.errors;
        const errorMessages = Object.values(apiErrors).flat().join(", ");
        toast.error(errorMessages);
      } else {
        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Failed to update interest rate"
        );
      }
      throw err;
    }
  };

  /**
   * Delete interest rate
   */
  const deleteInterestRate = async (rateId: number) => {
    try {
      const response = await cashAccountsService.deleteInterestRate(rateId);
      console.log("✅ Interest rate deleted:", response);

      if (response.success) {
        toast.success(response.message || "Interest rate deleted successfully");
        await loadCurrentRates();
        return true;
      }
      throw new Error(response.message || "Failed to delete interest rate");
    } catch (err: any) {
      console.error("❌ Error deleting interest rate:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete interest rate"
      );
      throw err;
    }
  };

  /**
   * Assign manager to cash account
   */
  const assignManager = async (
    cashAccountId: number,
    data: AssignManagerData
  ) => {
    try {
      const response = await cashAccountsService.assignManager(
        cashAccountId,
        data
      );
      console.log("✅ Manager assigned:", response);

      if (response.success) {
        toast.success(response.message || "Manager assigned successfully");
        await loadCashAccounts();
        return response.data;
      }
      throw new Error(response.message || "Failed to assign manager");
    } catch (err: any) {
      console.error("❌ Error assigning manager:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to assign manager"
      );
      throw err;
    }
  };

  /**
   * Remove manager from cash account
   */
  const removeManager = async (cashAccountId: number, managerId: number) => {
    try {
      const response = await cashAccountsService.removeManager(
        cashAccountId,
        managerId
      );
      console.log("✅ Manager removed:", response);

      if (response.success) {
        toast.success(response.message || "Manager removed successfully");
        await loadCashAccounts();
        return true;
      }
      throw new Error(response.message || "Failed to remove manager");
    } catch (err: any) {
      console.error("❌ Error removing manager:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to remove manager"
      );
      throw err;
    }
  };

  /**
   * Refresh all data
   */
  const refresh = async () => {
    await loadCashAccounts();
    await loadSummary();
    await loadCurrentRates();
  };

  return {
    cashAccounts,
    summary,
    currentRates,
    loading,
    error,
    loadCashAccounts,
    getCashAccountById,
    createCashAccount,
    updateCashAccount,
    deleteCashAccount,
    getInterestRates,
    createInterestRate,
    updateInterestRate,
    deleteInterestRate,
    assignManager,
    removeManager,
    refresh,
  };
}
