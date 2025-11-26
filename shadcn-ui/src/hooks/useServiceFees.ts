// src/hooks/useServiceFees.ts
// Version: Using Service Layer (Recommended)

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { serviceAllowanceService, type ServiceAllowance } from "@/lib/api";

export const useServiceFees = () => {
  const [serviceFees, setServiceFees] = useState<ServiceAllowance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all service fees
   */
  const fetchServiceFees = useCallback(
    async (params?: {
      user_id?: number;
      month?: number;
      year?: number;
      status?: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const data = await serviceAllowanceService.getAll(params);
        setServiceFees(data);
        return data;
      } catch (err: any) {
        console.error("❌ Error fetching service fees:", err);
        setError(err.message || "Failed to fetch service fees");
        toast.error("Gagal memuat data jasa pelayanan");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Add service fee untuk single member
   */
  const addServiceFee = useCallback(
    async (data: {
      member_id: string | number;
      period: string; // "YYYY-MM" format
      gross_amount: number;
    }) => {
      setLoading(true);
      try {
        // Parse period to month/year
        const [year, month] = data.period.split("-").map(Number);

        const calculationData = {
          user_id:
            typeof data.member_id === "string"
              ? parseInt(data.member_id)
              : data.member_id,
          period_month: month,
          period_year: year,
          base_amount: data.gross_amount,
          savings_rate: 1.0,
          loan_rate: 10.0,
        };

        await serviceAllowanceService.calculate(calculationData);
        toast.success("Jasa pelayanan berhasil ditambahkan");
        await fetchServiceFees();
      } catch (err: any) {
        console.error("❌ Error adding service fee:", err);
        toast.error(err.message || "Gagal menambahkan jasa pelayanan");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchServiceFees]
  );

  /**
   * Import/Distribute service fees to all members
   */
  const importServiceFees = useCallback(
    async (
      importData: Array<{
        member_id: string;
        period: string;
        gross_amount: number;
      }>
    ) => {
      setLoading(true);
      try {
        if (importData.length === 0) {
          throw new Error("No data to import");
        }

        // Use first entry to get period and base amount
        const [year, month] = importData[0].period.split("-").map(Number);
        const baseAmount = importData[0].gross_amount;

        const distributeData = {
          period_month: month,
          period_year: year,
          base_amount: baseAmount,
          savings_rate: 1.0,
          loan_rate: 10.0,
        };

        const result = await serviceAllowanceService.distribute(distributeData);
        toast.success(
          `Berhasil mendistribusikan ke ${result.total_members || 0} anggota`
        );

        await fetchServiceFees();

        return {
          successful: result.total_members || importData.length,
          failed: 0,
        };
      } catch (err: any) {
        console.error("❌ Error importing service fees:", err);
        toast.error(err.message || "Gagal mengimpor data");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchServiceFees]
  );

  /**
   * Mark service fee as paid
   */
  const markAsPaid = useCallback(
    async (id: number | string, notes?: string) => {
      setLoading(true);
      try {
        const allowanceId = typeof id === "string" ? parseInt(id) : id;
        await serviceAllowanceService.markAsPaid(allowanceId, notes);
        toast.success("Status pembayaran berhasil diupdate");
        await fetchServiceFees();
      } catch (err: any) {
        console.error("❌ Error marking as paid:", err);
        toast.error(err.message || "Gagal mengupdate status");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchServiceFees]
  );

  /**
   * Get service fees by period (YYYY-MM format)
   */
  const getServiceFeesByPeriod = useCallback(
    (period: string) => {
      const [year, month] = period.split("-").map(Number);
      return serviceFees.filter(
        (fee) => fee.period_month === month && fee.period_year === year
      );
    },
    [serviceFees]
  );

  /**
   * Get period summary
   */
  const getPeriodSummary = useCallback(async (month: number, year: number) => {
    try {
      return await serviceAllowanceService.getPeriodSummary(month, year);
    } catch (err: any) {
      console.error("❌ Error fetching period summary:", err);
      throw err;
    }
  }, []);

  return {
    serviceFees,
    loading,
    error,
    fetchServiceFees,
    addServiceFee,
    importServiceFees,
    markAsPaid,
    getServiceFeesByPeriod,
    getPeriodSummary,
    refetch: fetchServiceFees,
  };
};
