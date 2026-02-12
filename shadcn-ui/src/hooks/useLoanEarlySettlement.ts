// hooks/useLoanEarlySettlement.ts
// ✅ FIXED: Service returns { data: EarlySettlementPreview }, not raw axios response
import { useState } from "react";
import loanEarlySettlementService, {
  EarlySettlementPreview,
  ProcessSettlementData,
  SettlementResult,
} from "../lib/api/loan-early-settlement.service";
import { toast } from "sonner";

interface UseLoanEarlySettlementReturn {
  preview: EarlySettlementPreview | null;
  result: SettlementResult | null;
  loading: boolean;
  error: string | null;

  fetchPreview: (loanId: number) => Promise<void>;
  processSettlement: (
    loanId: number,
    data: ProcessSettlementData,
  ) => Promise<boolean>;
  clearPreview: () => void;
  clearError: () => void;
}

export const useLoanEarlySettlement = (): UseLoanEarlySettlementReturn => {
  const [preview, setPreview] = useState<EarlySettlementPreview | null>(null);
  const [result, setResult] = useState<SettlementResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = async (loanId: number) => {
    console.log("🔄 Fetching early settlement preview for loan:", loanId);
    setLoading(true);
    setError(null);
    try {
      // Service returns: { data: EarlySettlementPreview }
      // But actual API response structure may be:
      //   axios.data = { success, message, data: { ...fields } }
      // After service: response = { data: { ...fields } } OR { success, message, data: { ...fields } }
      const response =
        await loanEarlySettlementService.getSettlementPreview(loanId);
      console.log("✅ Preview data received:", response);

      // ✅ Extract the actual data - handle various nesting levels
      // response could be: { data: { ...fields } } or the fields directly
      let rawData: any;
      if (
        response?.data &&
        typeof response.data === "object" &&
        "remaining_principal" in response.data
      ) {
        // { data: { remaining_principal, ... } }
        rawData = response.data;
      } else if (response && "remaining_principal" in response) {
        // Direct fields
        rawData = response;
      } else if (response?.data) {
        // Fallback
        rawData = response.data;
      } else {
        rawData = response;
      }

      console.log("🟡 Final preview data:", rawData);

      // ✅ Normalize to match EarlySettlementPreview type
      const normalized: EarlySettlementPreview = {
        loan_number: rawData.loan_number || "",
        original_principal: rawData.original_principal || 0,
        remaining_principal: rawData.remaining_principal || 0,
        settlement_amount: rawData.settlement_amount || 0,
        interest_saved: rawData.interest_saved || 0,
        message: rawData.message || "",

        // ✅ API: paid_installments (number)
        paid_installments:
          rawData.paid_installments ?? rawData.installments_paid ?? 0,

        // ✅ API: pending_installments (number)
        pending_installments:
          typeof rawData.pending_installments === "number"
            ? rawData.pending_installments
            : (rawData.remaining_installments ?? 0),

        // ✅ API: total_interest_paid (number)
        total_interest_paid:
          rawData.total_interest_paid ?? rawData.total_paid ?? 0,

        // Computed if not present
        total_installments:
          rawData.total_installments ??
          (rawData.paid_installments ?? 0) +
            (typeof rawData.pending_installments === "number"
              ? rawData.pending_installments
              : 0),

        // Optional detail array
        pending_installments_detail: Array.isArray(rawData.pending_installments)
          ? rawData.pending_installments
          : rawData.pending_installments_detail || undefined,

        // Optional savings summary
        savings_summary: rawData.savings_summary || undefined,
      };

      setPreview(normalized);
    } catch (err: any) {
      console.error("❌ Error fetching preview:", err);
      setError(err.message || "Gagal memuat data pelunasan");
      toast.error(err.message || "Gagal memuat data pelunasan");
    } finally {
      setLoading(false);
    }
  };

  const processSettlement = async (
    loanId: number,
    data: ProcessSettlementData,
  ): Promise<boolean> => {
    console.log("🔄 Processing settlement for loan:", loanId, data);
    setLoading(true);
    setError(null);
    try {
      const response = await loanEarlySettlementService.processSettlement(
        loanId,
        data,
      );
      console.log("✅ Settlement result:", response);

      // Same pattern: response.data or response directly
      const resultData = (response?.data || response) as SettlementResult;
      setResult(resultData);
      toast.success("Pelunasan berhasil diproses!");
      return true;
    } catch (err: any) {
      console.error("❌ Error processing settlement:", err);
      setError(err.message || "Gagal memproses pelunasan");
      toast.error(err.message || "Gagal memproses pelunasan");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    preview,
    result,
    loading,
    error,
    fetchPreview,
    processSettlement,
    clearPreview,
    clearError,
  };
};
