// hooks/useWithdrawals.ts
// 💰 Custom hooks for Withdrawal

import { useState, useEffect, useCallback } from "react";
import withdrawalService, {
  Withdrawal,
  WithdrawalStatistics,
  CreateWithdrawalData,
} from "@/lib/api/withdrawal.service";

// ==================== useWithdrawals Hook ====================

interface UseWithdrawalsParams {
  payment_method?: "cash" | "transfer" | "check";
  user_id?: number;
  start_date?: string;
  end_date?: string;
  autoLoad?: boolean;
}

export const useWithdrawals = (params?: UseWithdrawalsParams) => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const payment_method = params?.payment_method;
  const user_id = params?.user_id;
  const start_date = params?.start_date;
  const end_date = params?.end_date;
  const autoLoad = params?.autoLoad;

  const loadWithdrawals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams: any = {};
      if (payment_method) queryParams.payment_method = payment_method;
      if (user_id) queryParams.user_id = user_id;
      if (start_date) queryParams.start_date = start_date;
      if (end_date) queryParams.end_date = end_date;

      const response = await withdrawalService.getWithdrawals(queryParams);
      const data = response.data || response;
      setWithdrawals(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error loading withdrawals:", err);
      setError(err.message || "Gagal memuat data pencairan");
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  }, [payment_method, user_id, start_date, end_date]);

  useEffect(() => {
    if (autoLoad !== false) {
      loadWithdrawals();
    }
  }, [loadWithdrawals, autoLoad]);

  const processWithdrawal = async (
    resignationId: number,
    data: CreateWithdrawalData,
  ) => {
    try {
      const response = await withdrawalService.processWithdrawal(
        resignationId,
        data,
      );
      await loadWithdrawals();
      return response;
    } catch (err) {
      console.error("Error processing withdrawal:", err);
      throw err;
    }
  };

  return {
    withdrawals,
    loading,
    error,
    refetch: loadWithdrawals,
    processWithdrawal,
  };
};

// ==================== useWithdrawalDetail Hook ====================

export const useWithdrawalDetail = (id: number | null) => {
  const [withdrawal, setWithdrawal] = useState<Withdrawal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWithdrawal = useCallback(async () => {
    if (!id) {
      setWithdrawal(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await withdrawalService.getWithdrawalById(id);
      setWithdrawal(response.data || response);
    } catch (err: any) {
      console.error("Error loading withdrawal detail:", err);
      setError(err.message || "Gagal memuat detail pencairan");
      setWithdrawal(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadWithdrawal();
  }, [loadWithdrawal]);

  return {
    withdrawal,
    loading,
    error,
    refetch: loadWithdrawal,
  };
};

// ==================== useWithdrawalStatistics Hook ====================

export const useWithdrawalStatistics = (year: number, month?: number) => {
  const [statistics, setStatistics] = useState<WithdrawalStatistics | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { year };
      if (month) params.month = month;

      const response = await withdrawalService.getStatistics(params);
      setStatistics(response.data || response);
    } catch (err: any) {
      console.error("Error loading statistics:", err);
      setError(err.message || "Gagal memuat statistik");
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

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
