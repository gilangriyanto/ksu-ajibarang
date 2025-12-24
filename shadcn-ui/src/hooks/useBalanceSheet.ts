// src/hooks/useBalanceSheet.ts
import { useState, useEffect } from "react";
import { trialBalanceService } from "@/lib/api/trialBalance.service";
import {
  transformToBalanceSheet,
  calculateNetIncome,
  BalanceSheetData,
  BalanceSheetItem,
} from "@/utils/balanceSheetTransformer";
import { useToast } from "@/hooks/use-toast";

interface UseBalanceSheetReturn {
  balanceSheetData: BalanceSheetData | null;
  netIncome: BalanceSheetItem | null;
  isLoading: boolean;
  error: string | null;
  totalCurrentAssets: number;
  totalNonCurrentAssets: number;
  totalAssets: number;
  totalCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  refetch: () => Promise<void>;
}

export const useBalanceSheet = (
  currentPeriodEnd: string,
  previousPeriodEnd: string
): UseBalanceSheetReturn => {
  const [balanceSheetData, setBalanceSheetData] =
    useState<BalanceSheetData | null>(null);
  const [netIncome, setNetIncome] = useState<BalanceSheetItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const calculateTotal = (items: BalanceSheetItem[]): number => {
    return items.reduce((sum, item) => sum + item.current, 0);
  };

  const fetchBalanceSheetData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { current, previous } =
        await trialBalanceService.getComparativeTrialBalance(
          currentPeriodEnd,
          previousPeriodEnd
        );

      // Transform trial balance to balance sheet format
      const transformedData = transformToBalanceSheet(
        current.data.trial_balance,
        previous.data.trial_balance
      );

      // Calculate net income for both periods
      const currentNetIncome = calculateNetIncome(current.data.trial_balance);
      const previousNetIncome = calculateNetIncome(previous.data.trial_balance);

      // Create net income item to add to equity
      const netIncomeItem: BalanceSheetItem = {
        code: "3-9999",
        name: "SHU Tahun Berjalan",
        current: currentNetIncome.current,
        previous: previousNetIncome.current,
      };

      // Add net income to equity if not zero
      if (netIncomeItem.current !== 0 || netIncomeItem.previous !== 0) {
        transformedData.equity.push(netIncomeItem);
      }

      setBalanceSheetData(transformedData);
      setNetIncome(netIncomeItem);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Gagal memuat data neraca";
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
    if (currentPeriodEnd && previousPeriodEnd) {
      fetchBalanceSheetData();
    }
  }, [currentPeriodEnd, previousPeriodEnd]);

  // Calculate totals
  const totalCurrentAssets = balanceSheetData
    ? calculateTotal(balanceSheetData.assets.currentAssets)
    : 0;
  const totalNonCurrentAssets = balanceSheetData
    ? calculateTotal(balanceSheetData.assets.nonCurrentAssets)
    : 0;
  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

  const totalCurrentLiabilities = balanceSheetData
    ? calculateTotal(balanceSheetData.liabilities.currentLiabilities)
    : 0;
  const totalNonCurrentLiabilities = balanceSheetData
    ? calculateTotal(balanceSheetData.liabilities.nonCurrentLiabilities)
    : 0;
  const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;

  const totalEquity = balanceSheetData
    ? calculateTotal(balanceSheetData.equity)
    : 0;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01; // Allow small rounding differences

  return {
    balanceSheetData,
    netIncome,
    isLoading,
    error,
    totalCurrentAssets,
    totalNonCurrentAssets,
    totalAssets,
    totalCurrentLiabilities,
    totalNonCurrentLiabilities,
    totalLiabilities,
    totalEquity,
    totalLiabilitiesAndEquity,
    isBalanced,
    refetch: fetchBalanceSheetData,
  };
};
