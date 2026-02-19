// hooks/useIncomeStatement.ts
// ✅ REWRITTEN: Uses /journals/income-statement endpoint directly
// ✅ No longer transforms general ledger data
// ✅ Backend provides all categorization and totals

import { useState, useEffect, useCallback } from "react";
import incomeStatementService, {
  IncomeStatementData,
  IncomeStatementAccount,
} from "@/lib/api/income-statement.service";

interface UseIncomeStatementReturn {
  data: IncomeStatementData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useIncomeStatement = (
  startDate: string,
  endDate: string,
  compare: boolean = true,
): UseIncomeStatementReturn => {
  const [data, setData] = useState<IncomeStatementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await incomeStatementService.getIncomeStatement(
        startDate,
        endDate,
        compare,
      );

      // Handle nested response
      const incomeData = response?.data || response;
      console.log("🟡 Income statement data:", incomeData);
      setData(incomeData as IncomeStatementData);
    } catch (err: any) {
      console.error("❌ Error loading income statement:", err);
      setError(err.message || "Gagal memuat laporan laba rugi");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, compare]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
};
