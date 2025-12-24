// src/hooks/useIncomeStatement.ts
import { useState, useEffect } from "react";
import { generalLedgerService } from "@/lib/api/generalLedger.service";
import {
  transformToIncomeStatement,
  calculateIncomeStatementTotals,
  IncomeStatementData,
} from "@/utils/incomeStatementTransformer";
import { useToast } from "@/hooks/use-toast";

interface UseIncomeStatementReturn {
  incomeStatementData: IncomeStatementData | null;
  totals: ReturnType<typeof calculateIncomeStatementTotals> | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing income statement data
 * @param currentStart - Current period start date (YYYY-MM-DD)
 * @param currentEnd - Current period end date (YYYY-MM-DD)
 * @param previousStart - Previous period start date (YYYY-MM-DD)
 * @param previousEnd - Previous period end date (YYYY-MM-DD)
 */
export const useIncomeStatement = (
  currentStart: string,
  currentEnd: string,
  previousStart: string,
  previousEnd: string
): UseIncomeStatementReturn => {
  const [incomeStatementData, setIncomeStatementData] =
    useState<IncomeStatementData | null>(null);
  const [totals, setTotals] = useState<ReturnType<
    typeof calculateIncomeStatementTotals
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchIncomeStatementData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch general ledger data for both periods
      const { current, previous } =
        await generalLedgerService.getComparativeGeneralLedger(
          currentStart,
          currentEnd,
          previousStart,
          previousEnd
        );

      // Transform to income statement format
      const transformedData = transformToIncomeStatement(
        current.data,
        previous.data
      );

      // Calculate totals
      const calculatedTotals = calculateIncomeStatementTotals(transformedData);

      setIncomeStatementData(transformedData);
      setTotals(calculatedTotals);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Gagal memuat data laporan laba rugi";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentStart && currentEnd && previousStart && previousEnd) {
      fetchIncomeStatementData();
    }
  }, [currentStart, currentEnd, previousStart, previousEnd]);

  return {
    incomeStatementData,
    totals,
    isLoading,
    error,
    refetch: fetchIncomeStatementData,
  };
};
