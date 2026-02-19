// hooks/useSalaryDeductions.ts
// ✅ FIXED: No infinite re-render loop
// ✅ Stable function references - no circular useCallback dependencies
// ✅ Backward-compatible with SalaryDeductionManagement.tsx

import { useState, useEffect, useCallback, useRef } from "react";
import salaryDeductionService, {
  SalaryDeduction,
  ProcessDeductionData,
  BatchProcessData,
  SalaryDeductionListParams,
} from "@/lib/api/salary-deduction.service";

// ==================== For Admin/Manager pages ====================

export const useSalaryDeductions = () => {
  const [deductions, setDeductions] = useState<SalaryDeduction[]>([]);
  const [currentDeduction, setCurrentDeduction] =
    useState<SalaryDeduction | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const initialLoadDone = useRef(false);

  // ✅ fetchDeductions - page calls this manually with filter params
  const fetchDeductions = useCallback(
    async (overrideParams?: SalaryDeductionListParams) => {
      try {
        setLoading(true);
        setError(null);

        const response = await salaryDeductionService.getAll(
          overrideParams || {},
        );
        const raw = response.data || response;

        let items: SalaryDeduction[] = [];

        if (Array.isArray(raw)) {
          items = raw;
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalItems: raw.length,
          });
        } else if (raw?.data && Array.isArray(raw.data)) {
          items = raw.data;
          setPagination({
            currentPage: raw.current_page || 1,
            totalPages: raw.last_page || 1,
            totalItems: raw.total || raw.data.length,
          });
        } else {
          setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
        }

        setDeductions(items);

        // Auto-calculate statistics from loaded data
        if (items.length > 0) {
          setStatistics({
            total_members_processed: items.length,
            total_gross_salary: items.reduce(
              (s, d) => s + (Number(d.gross_salary) || 0),
              0,
            ),
            total_deductions: items.reduce(
              (s, d) =>
                s +
                (Number(d.total_deduction) || Number(d.total_deductions) || 0),
              0,
            ),
            total_net_salary: items.reduce(
              (s, d) => s + (Number(d.net_salary) || 0),
              0,
            ),
          });
        }
      } catch (err: any) {
        console.error("Error loading salary deductions:", err);
        setError(err.message || "Gagal memuat data potongan gaji");
        setDeductions([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ✅ fetchDeductionById
  const fetchDeductionById = useCallback(
    (id: number) => {
      const found = deductions.find((d) => d.id === id);
      setCurrentDeduction(found || null);
      return found || null;
    },
    [deductions],
  );

  // ✅ processDeduction
  const processDeduction = useCallback(async (data: ProcessDeductionData) => {
    const response = await salaryDeductionService.processSingle(data);
    return response;
  }, []);

  // ✅ batchProcess
  const batchProcess = useCallback(async (data: BatchProcessData) => {
    const response = await salaryDeductionService.processBatch(data);
    return response;
  }, []);

  // ✅ fetchStatistics - page calls as fetchStatistics(year, month)
  const fetchStatistics = useCallback(
    async (_year?: number, _month?: number) => {
      try {
        const response = await salaryDeductionService.getStatistics();
        const data = response?.data || response;

        if (data) {
          setStatistics({
            total_members_processed:
              data.total_members_processed ??
              data.total_members ??
              data.total ??
              0,
            total_gross_salary:
              data.total_gross_salary ?? data.total_gross ?? 0,
            total_deductions:
              data.total_deductions ?? data.total_deduction ?? 0,
            total_net_salary: data.total_net_salary ?? data.total_net ?? 0,
            ...data,
          });
        }
      } catch (err) {
        console.error("Error loading statistics:", err);
        // Statistics will fallback to calculated values from fetchDeductions
      }
    },
    [],
  );

  // Initial load - runs ONCE
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchDeductions();
      fetchStatistics();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    deductions,
    currentDeduction,
    statistics,
    pagination,
    loading,
    error,
    fetchDeductions,
    fetchDeductionById,
    processDeduction,
    batchProcess,
    fetchStatistics,
    refetch: fetchDeductions,
    processSingle: processDeduction,
  };
};

// ==================== For Member pages ====================

export const useMemberSalaryDeductions = (periodYear?: number) => {
  const [deductions, setDeductions] = useState<SalaryDeduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);
  const yearRef = useRef(periodYear);

  const loadDeductions = useCallback(async (year?: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await salaryDeductionService.getMyDeductions(year);
      const data = response.data || response;

      if (Array.isArray(data)) {
        setDeductions(data);
      } else if (data?.data && Array.isArray(data.data)) {
        setDeductions(data.data);
      } else {
        setDeductions([]);
      }
    } catch (err: any) {
      console.error("Error loading my salary deductions:", err);
      setError(err.message || "Gagal memuat data potongan gaji");
      setDeductions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loadedRef.current || yearRef.current !== periodYear) {
      loadedRef.current = true;
      yearRef.current = periodYear;
      loadDeductions(periodYear);
    }
  }, [periodYear, loadDeductions]);

  return {
    deductions,
    loading,
    error,
    refetch: () => loadDeductions(periodYear),
  };
};
