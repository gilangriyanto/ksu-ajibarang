import { useState, useCallback } from "react";
import loansService, { LoanSimulation } from "@/lib/api/loans.service";
import { toast } from "sonner";

export const useLoanSimulation = () => {
  const [simulation, setSimulation] = useState<LoanSimulation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Simulate loan calculation
   */
  const simulate = useCallback(
    async (
      principalAmount: number,
      tenureMonths: number,
      cashAccountId: number
    ) => {
      setLoading(true);
      setError(null);
      try {
        console.log("🧮 Simulating loan:", {
          principalAmount,
          tenureMonths,
          cashAccountId,
        });

        const response = await loansService.simulate({
          principal_amount: principalAmount,
          tenure_months: tenureMonths,
          cash_account_id: cashAccountId,
        });

        console.log("✅ Simulation response:", response);

        const simulationData = response.data?.data || response.data;

        if (simulationData) {
          // Clean and convert data types
          const cleanSimulation: LoanSimulation = {
            principal_amount: Number(
              simulationData.principal_amount || principalAmount
            ),
            tenure_months: Number(simulationData.tenure_months || tenureMonths),
            interest_rate: Number(simulationData.interest_rate || 0),
            monthly_payment: Number(simulationData.monthly_payment || 0),
            total_interest: Number(simulationData.total_interest || 0),
            total_payment: Number(simulationData.total_payment || 0),
            installments: simulationData.installments || [],
          };

          console.log("✅ Cleaned simulation:", cleanSimulation);

          setSimulation(cleanSimulation);
          return cleanSimulation;
        }

        throw new Error("Invalid simulation response");
      } catch (err: any) {
        console.error("❌ Error simulating loan:", err);

        const errorMsg =
          err.data?.message ||
          err.message ||
          "Gagal melakukan simulasi pinjaman";
        setError(errorMsg);
        toast.error(errorMsg);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Clear simulation
   */
  const clearSimulation = useCallback(() => {
    setSimulation(null);
    setError(null);
  }, []);

  /**
   * Format currency helper
   */
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }, []);

  /**
   * Calculate total interest
   */
  const calculateTotalInterest = useCallback(() => {
    if (!simulation) return 0;
    return simulation.total_interest;
  }, [simulation]);

  /**
   * Calculate total payment
   */
  const calculateTotalPayment = useCallback(() => {
    if (!simulation) return 0;
    return simulation.total_payment;
  }, [simulation]);

  /**
   * Get installment by month
   */
  const getInstallmentByMonth = useCallback(
    (month: number) => {
      if (!simulation) return null;
      return simulation.installments.find((inst) => inst.month === month);
    },
    [simulation]
  );

  return {
    // State
    simulation,
    loading,
    error,

    // Actions
    simulate,
    clearSimulation,

    // Helpers
    formatCurrency,
    calculateTotalInterest,
    calculateTotalPayment,
    getInstallmentByMonth,
  };
};

export default useLoanSimulation;
