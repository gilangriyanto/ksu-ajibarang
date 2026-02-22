import { useState, useCallback, useEffect } from "react";
import journalService, { GeneralLedgerAccount } from "@/lib/api/journal.service";
import { toast } from "sonner";

export function useGeneralLedger(
  startDate: string,
  endDate: string,
  accountId?: number
) {
  const [data, setData] = useState<GeneralLedgerAccount[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGeneralLedger = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await journalService.getGeneralLedger({
        start_date: startDate,
        end_date: endDate,
        chart_of_account_id: accountId,
      });
      setData(result);
    } catch (err: any) {
      console.error("Error fetching general ledger:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Gagal memuat Buku Besar";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, accountId]);

  useEffect(() => {
    fetchGeneralLedger();
  }, [fetchGeneralLedger]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchGeneralLedger,
  };
}
