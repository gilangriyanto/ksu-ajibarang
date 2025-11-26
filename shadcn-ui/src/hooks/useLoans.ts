import { useState, useEffect, useCallback } from "react";
import loansService, {
  Loan,
  LoanSummary,
  CreateLoanData,
  UpdateLoanData,
  ApproveLoanData,
} from "@/lib/api/loans.service";
import { toast } from "sonner";

interface UseLoansOptions {
  all?: boolean;
  user_id?: number;
  status?: string;
  cash_account_id?: number;
  autoLoad?: boolean; // Auto load on mount
}

export const useLoans = (options: UseLoansOptions = {}) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<LoanSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all loans with filters
   */
  const loadLoans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔄 Loading loans with options:", options);

      const response = await loansService.getAll({
        all: options.all,
        user_id: options.user_id,
        status: options.status,
        cash_account_id: options.cash_account_id,
      });

      console.log("📋 Loans API response:", response);

      // Handle nested response structure
      const loansData = response.data?.data || response.data || [];

      console.log("📋 Parsed loans:", loansData.length);

      setLoans(loansData);

      return loansData;
    } catch (err: any) {
      console.error("❌ Error loading loans:", err);
      const errorMsg =
        err.data?.message || err.message || "Gagal memuat data pinjaman";
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options.all, options.user_id, options.status, options.cash_account_id]);

  /**
   * Load loan summary/statistics
   */
  const loadSummary = useCallback(async () => {
    try {
      console.log("📊 Loading loan summary for user:", options.user_id);

      const response = await loansService.getSummary(options.user_id);
      console.log("📊 Summary response:", response);

      // Handle nested response
      const summaryData = response.data?.data || response.data;

      if (summaryData) {
        // Convert to numbers
        const cleanSummary: LoanSummary = {
          total_loans: Number(summaryData.total_loans || 0),
          active_loans: Number(summaryData.active_loans || 0),
          completed_loans: Number(summaryData.completed_loans || 0),
          total_principal: Number(summaryData.total_principal || 0),
          total_outstanding: Number(summaryData.total_outstanding || 0),
          total_paid: Number(summaryData.total_paid || 0),
          overdue_count: Number(summaryData.overdue_count || 0),
          overdue_amount: Number(summaryData.overdue_amount || 0),
        };

        console.log("📊 Cleaned summary:", cleanSummary);
        setSummary(cleanSummary);

        return cleanSummary;
      }
    } catch (err: any) {
      console.error("❌ Error loading summary:", err);
      // Summary is optional, don't throw
    }
  }, [options.user_id]);

  /**
   * Get single loan by ID
   */
  const getLoanById = useCallback(async (id: number) => {
    setLoading(true);
    try {
      console.log("🔍 Loading loan detail:", id);

      const response = await loansService.getById(id);
      const loanData = response.data?.data || response.data;

      console.log("✅ Loan detail loaded:", loanData);

      return loanData;
    } catch (err: any) {
      console.error("❌ Error loading loan detail:", err);
      toast.error("Gagal memuat detail pinjaman");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new loan application
   */
  const createLoan = useCallback(
    async (data: CreateLoanData) => {
      setLoading(true);
      try {
        console.log("📤 Creating loan:", data);

        const response = await loansService.create(data);

        console.log("✅ Loan created:", response);

        toast.success("Pengajuan pinjaman berhasil dibuat");

        // Reload loans
        await loadLoans();

        return response.data;
      } catch (err: any) {
        console.error("❌ Error creating loan:", err);

        const errorMsg =
          err.data?.message ||
          err.message ||
          "Gagal membuat pengajuan pinjaman";
        toast.error(errorMsg);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadLoans]
  );

  /**
   * Update loan application
   */
  const updateLoan = useCallback(
    async (id: number, data: UpdateLoanData) => {
      setLoading(true);
      try {
        console.log("📤 Updating loan:", id, data);

        const response = await loansService.update(id, data);

        console.log("✅ Loan updated:", response);

        toast.success("Data pinjaman berhasil diperbarui");

        // Reload loans
        await loadLoans();

        return response.data;
      } catch (err: any) {
        console.error("❌ Error updating loan:", err);

        const errorMsg =
          err.data?.message || err.message || "Gagal memperbarui pinjaman";
        toast.error(errorMsg);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadLoans]
  );

  /**
   * Delete loan application
   */
  const deleteLoan = useCallback(
    async (id: number) => {
      setLoading(true);
      try {
        console.log("🗑️ Deleting loan:", id);

        await loansService.delete(id);

        console.log("✅ Loan deleted");

        toast.success("Pengajuan pinjaman berhasil dihapus");

        // Reload loans
        await loadLoans();
      } catch (err: any) {
        console.error("❌ Error deleting loan:", err);

        const errorMsg =
          err.data?.message || err.message || "Gagal menghapus pinjaman";
        toast.error(errorMsg);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadLoans]
  );

  /**
   * Approve loan
   */
  const approveLoan = useCallback(
    async (id: number, disbursementDate: string, notes?: string) => {
      setLoading(true);
      try {
        console.log("✅ Approving loan:", id);

        const data: ApproveLoanData = {
          status: "approved",
          disbursement_date: disbursementDate,
        };

        await loansService.approve(id, data);

        console.log("✅ Loan approved");

        toast.success("Pinjaman berhasil disetujui");

        // Reload loans and summary
        await Promise.all([loadLoans(), loadSummary()]);
      } catch (err: any) {
        console.error("❌ Error approving loan:", err);

        const errorMsg =
          err.data?.message || err.message || "Gagal menyetujui pinjaman";
        toast.error(errorMsg);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadLoans, loadSummary]
  );

  /**
   * Reject loan
   */
  const rejectLoan = useCallback(
    async (id: number, rejectionReason: string) => {
      setLoading(true);
      try {
        console.log("❌ Rejecting loan:", id);

        const data: ApproveLoanData = {
          status: "rejected",
          rejection_reason: rejectionReason,
        };

        await loansService.approve(id, data);

        console.log("✅ Loan rejected");

        toast.success("Pinjaman berhasil ditolak");

        // Reload loans and summary
        await Promise.all([loadLoans(), loadSummary()]);
      } catch (err: any) {
        console.error("❌ Error rejecting loan:", err);

        const errorMsg =
          err.data?.message || err.message || "Gagal menolak pinjaman";
        toast.error(errorMsg);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadLoans, loadSummary]
  );

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    await Promise.all([loadLoans(), loadSummary()]);
  }, [loadLoans, loadSummary]);

  // Auto-load on mount if enabled
  useEffect(() => {
    if (options.autoLoad !== false) {
      loadLoans();
      loadSummary();
    }
  }, [options.autoLoad, loadLoans, loadSummary]);

  return {
    // State
    loans,
    summary,
    loading,
    error,

    // Actions
    loadLoans,
    loadSummary,
    getLoanById,
    createLoan,
    updateLoan,
    deleteLoan,
    approveLoan,
    rejectLoan,
    refresh,
  };
};

export default useLoans;
