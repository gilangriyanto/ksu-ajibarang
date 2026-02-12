// hooks/useCashTransfers.ts
import { useState, useEffect } from "react";
import cashTransferService, {
  CashTransfer,
  CreateCashTransferData,
  CashTransferListParams,
} from "../lib/api/cash-transfer.service";
import { toast } from "sonner";

interface UseCashTransfersReturn {
  transfers: CashTransfer[];
  currentTransfer: CashTransfer | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  statistics: {
    total_count: number;
    pending_count: number;
    completed_count: number;
    cancelled_count: number;
    total_amount: number;
    pending_amount: number;
    completed_amount: number;
  } | null;
  loading: boolean;
  error: string | null;

  fetchTransfers: (params?: CashTransferListParams) => Promise<void>;
  fetchTransferById: (id: number) => Promise<void>;
  createTransfer: (data: CreateCashTransferData) => Promise<boolean>;
  approveTransfer: (id: number) => Promise<boolean>;
  cancelTransfer: (id: number, reason: string) => Promise<boolean>;
  fetchStatistics: (year: number, month: number) => Promise<void>;
  clearError: () => void;
}

export const useCashTransfers = (): UseCashTransfersReturn => {
  const [transfers, setTransfers] = useState<CashTransfer[]>([]);
  const [currentTransfer, setCurrentTransfer] = useState<CashTransfer | null>(
    null,
  );
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransfers = async (params?: CashTransferListParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await cashTransferService.getCashTransfers(params);
      console.log("📋 Transfers list response:", response);

      // Handle nested response structure
      let transfersData = [];
      let paginationData = {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
      };

      // Try to extract data from various possible structures
      if (response.data?.data?.data) {
        // Super nested: {data: {data: {data: [...]}}}
        transfersData = response.data.data.data || [];
        paginationData = {
          currentPage: response.data.data.current_page || 1,
          totalPages: response.data.data.last_page || 1,
          totalItems: response.data.data.total || 0,
          itemsPerPage: response.data.data.per_page || 10,
        };
      } else if (response.data?.data) {
        // Nested: {data: {data: [...]}}
        transfersData = response.data.data || [];
        paginationData = {
          currentPage: response.data.current_page || 1,
          totalPages: response.data.last_page || 1,
          totalItems: response.data.total || 0,
          itemsPerPage: response.data.per_page || 10,
        };
      } else if (Array.isArray(response.data)) {
        // Direct array: {data: [...]}
        transfersData = response.data || [];
      } else {
        // Fallback
        transfersData = response || [];
      }

      console.log("📦 Extracted transfers:", transfersData.length, "items");
      setTransfers(transfersData);
      setPagination(paginationData);
    } catch (err: any) {
      const errorMsg = err.message || "Gagal memuat data transfer";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransferById = async (id: number) => {
    console.log("🔄 Fetching transfer by ID:", id);
    setLoading(true);
    setError(null);
    try {
      const response = await cashTransferService.getCashTransferById(id);
      console.log("✅ Transfer data received:", response);

      // Backend structure: response.data.data.transfer
      let transferData = null;

      if (response.data?.data?.transfer) {
        // Nested structure: {data: {data: {transfer: {...}}}}
        transferData = response.data.data.transfer;
        console.log("📦 Extracted from nested structure (data.data.transfer)");
      } else if (response.data?.transfer) {
        // Structure: {data: {transfer: {...}}}
        transferData = response.data.transfer;
        console.log("📦 Extracted from nested structure (data.transfer)");
      } else if (response.data) {
        // Direct structure: {data: {...}}
        transferData = response.data;
        console.log("📦 Extracted from direct structure (data)");
      } else {
        // Fallback
        transferData = response;
        console.log("📦 Using response directly");
      }

      console.log("📦 Final transfer data:", transferData);
      setCurrentTransfer(transferData);
    } catch (err: any) {
      const errorMsg = err.message || "Gagal memuat detail transfer";
      console.error("❌ Error fetching transfer:", err);
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const createTransfer = async (
    data: CreateCashTransferData,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await cashTransferService.createCashTransfer(data);
      toast.success("Transfer berhasil dibuat!");
      return true;
    } catch (err: any) {
      const errorMsg = err.message || "Gagal membuat transfer";
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const approveTransfer = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await cashTransferService.approveCashTransfer(id);
      toast.success("Transfer berhasil disetujui!");
      return true;
    } catch (err: any) {
      const errorMsg = err.message || "Gagal menyetujui transfer";
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelTransfer = async (
    id: number,
    reason: string,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await cashTransferService.cancelCashTransfer(id, { reason });
      toast.success("Transfer berhasil dibatalkan!");
      return true;
    } catch (err: any) {
      const errorMsg = err.message || "Gagal membatalkan transfer";
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async (year: number, month: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await cashTransferService.getStatistics({ year, month });
      setStatistics(response.data);
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
    transfers,
    currentTransfer,
    pagination,
    statistics,
    loading,
    error,
    fetchTransfers,
    fetchTransferById,
    createTransfer,
    approveTransfer,
    cancelTransfer,
    fetchStatistics,
    clearError,
  };
};
