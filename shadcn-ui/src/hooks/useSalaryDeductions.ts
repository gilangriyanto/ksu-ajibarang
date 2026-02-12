// hooks/useSalaryDeductions.ts
import { useState } from "react";
import salaryDeductionService, {
  SalaryDeduction,
  CreateSalaryDeductionData,
  BatchProcessData,
  SalaryDeductionListParams,
  AnnualSummary,
  Statistics,
} from "../lib/api/salary-deduction.service";
import { toast } from "sonner";

interface UseSalaryDeductionsReturn {
  deductions: SalaryDeduction[];
  currentDeduction: SalaryDeduction | null;
  annualSummary: AnnualSummary | null;
  statistics: Statistics | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  loading: boolean;
  error: string | null;

  fetchDeductions: (params?: SalaryDeductionListParams) => Promise<void>;
  fetchDeductionById: (id: number) => Promise<void>;
  processDeduction: (data: CreateSalaryDeductionData) => Promise<boolean>;
  batchProcess: (data: BatchProcessData) => Promise<boolean>;
  fetchByPeriod: (year: number, month: number) => Promise<void>;
  fetchAnnualSummary: (userId: number, year: number) => Promise<void>;
  fetchStatistics: (year: number, month?: number) => Promise<void>;
  clearError: () => void;
}

export const useSalaryDeductions = (): UseSalaryDeductionsReturn => {
  const [deductions, setDeductions] = useState<SalaryDeduction[]>([]);
  const [currentDeduction, setCurrentDeduction] =
    useState<SalaryDeduction | null>(null);
  const [annualSummary, setAnnualSummary] = useState<AnnualSummary | null>(
    null,
  );
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeductions = async (params?: SalaryDeductionListParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await salaryDeductionService.getSalaryDeductions(params);
      console.log("📋 Deductions response:", response);

      // Handle nested response
      let deductionsData = [];
      if (response.data?.data?.data) {
        deductionsData = response.data.data.data || [];
      } else if (response.data?.data) {
        deductionsData = response.data.data || [];
      } else if (Array.isArray(response.data)) {
        deductionsData = response.data;
      }

      setDeductions(deductionsData);

      // Set pagination if available
      if (response.data?.current_page) {
        setPagination({
          currentPage: response.data.current_page || 1,
          totalPages: response.data.last_page || 1,
          totalItems: response.data.total || 0,
          itemsPerPage: response.data.per_page || 10,
        });
      }
    } catch (err: any) {
      const errorMsg = err.message || "Gagal memuat data potongan gaji";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeductionById = async (id: number) => {
    console.log("🔄 Fetching deduction by ID:", id);
    setLoading(true);
    setError(null);
    try {
      const response = await salaryDeductionService.getDeductionById(id);
      console.log("✅ Deduction data received:", response);

      // Handle nested response
      let deductionData = null;
      if (response.data?.data?.deduction) {
        deductionData = response.data.data.deduction;
      } else if (response.data?.deduction) {
        deductionData = response.data.deduction;
      } else if (response.data) {
        deductionData = response.data;
      } else {
        deductionData = response;
      }

      console.log("📦 Final deduction data:", deductionData);
      setCurrentDeduction(deductionData);
    } catch (err: any) {
      const errorMsg = err.message || "Gagal memuat detail potongan gaji";
      console.error("❌ Error:", err);
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const processDeduction = async (
    data: CreateSalaryDeductionData,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await salaryDeductionService.processSalaryDeduction(data);
      toast.success("Potongan gaji berhasil diproses!");
      return true;
    } catch (err: any) {
      const errorMsg = err.message || "Gagal memproses potongan gaji";
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const batchProcess = async (data: BatchProcessData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response =
        await salaryDeductionService.batchProcessDeductions(data);

      // Check if there are any failures
      const result = response.data || response;
      if (result.failed && result.failed.length > 0) {
        toast.warning(
          `Berhasil: ${result.successful?.length || 0}, Gagal: ${result.failed.length}`,
        );
      } else {
        toast.success(
          `Batch berhasil diproses! Total: ${result.successful?.length || 0} anggota`,
        );
      }

      return true;
    } catch (err: any) {
      const errorMsg = err.message || "Gagal memproses batch potongan gaji";
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchByPeriod = async (year: number, month: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await salaryDeductionService.getDeductionsByPeriod(
        year,
        month,
      );

      // Handle nested response
      let deductionsData = [];
      if (response.data?.data) {
        deductionsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        deductionsData = response.data;
      }

      setDeductions(deductionsData);
    } catch (err: any) {
      const errorMsg = err.message || "Gagal memuat data periode";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnualSummary = async (userId: number, year: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await salaryDeductionService.getMemberAnnualSummary(
        userId,
        year,
      );

      // Handle nested response
      const summaryData = response.data?.data || response.data || response;
      setAnnualSummary(summaryData);
    } catch (err: any) {
      const errorMsg = err.message || "Gagal memuat ringkasan tahunan";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async (year: number, month?: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await salaryDeductionService.getStatistics({
        year,
        month,
      });

      // Handle nested response
      const statsData = response.data?.data || response.data || response;
      setStatistics(statsData);
    } catch (err: any) {
      const errorMsg = err.message || "Gagal memuat statistik";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    deductions,
    currentDeduction,
    annualSummary,
    statistics,
    pagination,
    loading,
    error,
    fetchDeductions,
    fetchDeductionById,
    processDeduction,
    batchProcess,
    fetchByPeriod,
    fetchAnnualSummary,
    fetchStatistics,
    clearError,
  };
};
