import { useState, useCallback } from "react";
import loansService, {
  Installment,
  PayInstallmentData,
} from "@/lib/api/loans.service";
import { toast } from "sonner";

export const useInstallments = () => {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [schedule, setSchedule] = useState<Installment[]>([]);
  const [upcomingInstallments, setUpcomingInstallments] = useState<
    Installment[]
  >([]);
  const [overdueInstallments, setOverdueInstallments] = useState<Installment[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get installments for a specific loan
   */
  const getInstallments = useCallback(async (loanId: number) => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔄 Loading installments for loan:", loanId);

      const response = await loansService.getInstallments(loanId);
      console.log("📋 Installments response:", response);

      const installmentsData = response.data?.data || response.data || [];

      console.log("📋 Parsed installments:", installmentsData.length);

      setInstallments(installmentsData);

      return installmentsData;
    } catch (err: any) {
      console.error("❌ Error loading installments:", err);
      const errorMsg =
        err.data?.message || err.message || "Gagal memuat data angsuran";
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get installment schedule for a loan
   */
  const getSchedule = useCallback(async (loanId: number) => {
    setLoading(true);
    setError(null);
    try {
      console.log("📅 Loading schedule for loan:", loanId);

      const response = await loansService.getSchedule(loanId);
      console.log("📅 Schedule response:", response);

      // ✅ FIXED: Handle nested response structure
      let scheduleData = [];

      // Try different response structures
      if (response.data?.data?.schedule) {
        // Nested: { data: { data: { loan: {...}, schedule: [...] } } }
        console.log("✅ Found schedule in data.data.schedule");
        scheduleData = response.data.data.schedule;
      } else if (response.data?.schedule) {
        // Nested: { data: { schedule: [...] } }
        console.log("✅ Found schedule in data.schedule");
        scheduleData = response.data.schedule;
      } else if (response.data?.data) {
        // Standard: { data: { data: [...] } }
        console.log("✅ Found schedule in data.data");
        scheduleData = Array.isArray(response.data.data)
          ? response.data.data
          : [];
      } else if (response.data) {
        // Direct: { data: [...] }
        console.log("✅ Found schedule in data");
        scheduleData = Array.isArray(response.data) ? response.data : [];
      }

      console.log("📅 Parsed schedule:", scheduleData.length);

      setSchedule(scheduleData);

      return scheduleData;
    } catch (err: any) {
      console.error("❌ Error loading schedule:", err);
      const errorMsg =
        err.data?.message || err.message || "Gagal memuat jadwal angsuran";
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get single installment detail
   */
  const getInstallmentById = useCallback(async (installmentId: number) => {
    setLoading(true);
    try {
      console.log("🔍 Loading installment detail:", installmentId);

      const response = await loansService.getInstallmentById(installmentId);
      const installmentData = response.data?.data || response.data;

      console.log("✅ Installment detail loaded:", installmentData);

      return installmentData;
    } catch (err: any) {
      console.error("❌ Error loading installment detail:", err);
      toast.error("Gagal memuat detail angsuran");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Pay installment
   */
  const payInstallment = useCallback(
    async (
      installmentId: number,
      paymentMethod: "cash" | "transfer" | "service_allowance" | "deduction",
      notes?: string
    ) => {
      setLoading(true);
      try {
        console.log("💰 Paying installment:", installmentId);

        const data: PayInstallmentData = {
          payment_method: paymentMethod,
          notes: notes || "",
        };

        console.log("📤 Payment data:", data);

        const response = await loansService.payInstallment(installmentId, data);

        console.log("✅ Payment successful:", response);

        toast.success("Pembayaran angsuran berhasil");

        return response.data;
      } catch (err: any) {
        console.error("❌ Error paying installment:", err);

        const errorMsg =
          err.data?.message || err.message || "Gagal memproses pembayaran";
        toast.error(errorMsg);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Get upcoming installments (due within X days)
   */
  const getUpcomingInstallments = useCallback(async (days: number = 7) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`🔔 Loading upcoming installments (${days} days)`);

      const response = await loansService.getUpcomingInstallments(days);
      console.log("🔔 Upcoming response:", response);

      const upcomingData = response.data?.data || response.data || [];

      console.log("🔔 Parsed upcoming:", upcomingData.length);

      setUpcomingInstallments(upcomingData);

      return upcomingData;
    } catch (err: any) {
      console.error("❌ Error loading upcoming installments:", err);
      const errorMsg =
        err.data?.message || err.message || "Gagal memuat angsuran mendatang";
      setError(errorMsg);
      // Don't toast for upcoming - it's optional
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get overdue installments
   */
  const getOverdueInstallments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("⚠️ Loading overdue installments");

      const response = await loansService.getOverdueInstallments();
      console.log("⚠️ Overdue response:", response);

      const overdueData = response.data?.data || response.data || [];

      console.log("⚠️ Parsed overdue:", overdueData.length);

      setOverdueInstallments(overdueData);

      return overdueData;
    } catch (err: any) {
      console.error("❌ Error loading overdue installments:", err);
      const errorMsg =
        err.data?.message || err.message || "Gagal memuat angsuran tertunggak";
      setError(errorMsg);
      // Don't toast for overdue - it's optional
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Pay installment with auto method (service allowance)
   */
  const payWithServiceAllowance = useCallback(
    async (installmentId: number, notes?: string) => {
      return payInstallment(installmentId, "service_allowance", notes);
    },
    [payInstallment]
  );

  /**
   * Pay installment with manual method (transfer/cash)
   */
  const payManual = useCallback(
    async (
      installmentId: number,
      method: "cash" | "transfer",
      notes?: string
    ) => {
      return payInstallment(installmentId, method, notes);
    },
    [payInstallment]
  );

  return {
    // State
    installments,
    schedule,
    upcomingInstallments,
    overdueInstallments,
    loading,
    error,

    // Actions
    getInstallments,
    getSchedule,
    getInstallmentById,
    payInstallment,
    getUpcomingInstallments,
    getOverdueInstallments,

    // Convenient methods
    payWithServiceAllowance,
    payManual,
  };
};

export default useInstallments;
