// components/modals/EarlySettlementModal.tsx
// ✅ FIXED: Use correct field names from updated EarlySettlementPreview type
import { useState, useEffect } from "react";
import {
  X,
  AlertTriangle,
  CheckCircle,
  Calculator,
  TrendingDown,
} from "lucide-react";
import { useLoanEarlySettlement } from "../../hooks/useLoanEarlySettlement";
import loanEarlySettlementService from "../../lib/api/loan-early-settlement.service";

interface EarlySettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanId: number | null;
  loanNumber?: string;
  onSuccess?: () => void;
}

const EarlySettlementModal = ({
  isOpen,
  onClose,
  loanId,
  loanNumber,
  onSuccess,
}: EarlySettlementModalProps) => {
  const {
    preview,
    loading,
    error,
    fetchPreview,
    processSettlement,
    clearPreview,
  } = useLoanEarlySettlement();

  const [notes, setNotes] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [step, setStep] = useState<"preview" | "confirm" | "success">(
    "preview",
  );

  useEffect(() => {
    if (isOpen && loanId) {
      fetchPreview(loanId);
      setStep("preview");
      setNotes("");
      setConfirmChecked(false);
    } else if (!isOpen) {
      clearPreview();
    }
  }, [isOpen, loanId]);

  const handleProcess = async () => {
    if (!loanId || !confirmChecked) return;

    const success = await processSettlement(loanId, {
      settlement_notes: notes || undefined,
      confirm_amount: true,
    });

    if (success) {
      setStep("success");
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    }
  };

  // Helper: safely format currency
  const safeCurrency = (amount: any): string => {
    const num =
      typeof amount === "string" ? parseFloat(amount) : Number(amount);
    if (isNaN(num) || amount === undefined || amount === null) {
      return "Rp 0";
    }
    return loanEarlySettlementService.formatCurrency(num);
  };

  if (!isOpen) return null;

  // Loading State
  if (loading && !preview) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Memuat data pelunasan...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !preview) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success State
  if (step === "success") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Pelunasan Berhasil!
            </h3>
            <p className="text-gray-600">
              Pinjaman #{loanNumber} telah berhasil dilunasi
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ All fields now match EarlySettlementPreview type
  const paidCount = preview?.paid_installments ?? 0;
  const pendingCount = preview?.pending_installments ?? 0;
  const totalCount = preview?.total_installments ?? paidCount + pendingCount;
  const totalPaid = preview?.total_interest_paid ?? 0;
  const savingsSummary = preview?.savings_summary;
  const originalTotalPayment = savingsSummary?.original_total_payment ?? 0;
  const settlementPayment =
    savingsSummary?.settlement_payment ?? preview?.settlement_amount ?? 0;
  const totalSavings =
    savingsSummary?.total_savings ?? preview?.interest_saved ?? 0;

  // Main Content
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Pelunasan Dipercepat
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Pinjaman #{loanNumber || loanId}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-500 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {preview ? (
          <div className="p-6 space-y-6">
            {/* Info Alert */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Calculator className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">
                  Tentang Pelunasan Dipercepat:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Bayar sisa pokok pinjaman saja (TANPA bunga)</li>
                  <li>Hemat biaya bunga untuk cicilan yang tersisa</li>
                  <li>Pinjaman otomatis ditandai lunas</li>
                  <li>Cicilan pending akan dibatalkan</li>
                </ul>
              </div>
            </div>

            {/* Savings Highlight */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-bold text-green-900">
                    Penghematan Bunga
                  </h3>
                </div>
                {originalTotalPayment > 0 && (
                  <span className="text-sm text-green-700 font-medium">
                    {loanEarlySettlementService.formatPercentage(
                      loanEarlySettlementService.calculateSavingsPercentage(
                        preview.interest_saved,
                        originalTotalPayment,
                      ),
                    )}
                  </span>
                )}
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600 mb-2">
                  {safeCurrency(preview.interest_saved)}
                </p>
                <p className="text-sm text-green-700">
                  Hemat dari {pendingCount} cicilan tersisa
                </p>
              </div>
            </div>

            {/* Loan Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Pokok Pinjaman</p>
                <p className="text-lg font-bold text-gray-900">
                  {safeCurrency(preview.original_principal)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">
                  Total Sudah Dibayar
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {safeCurrency(totalPaid)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Cicilan Terbayar</p>
                <p className="text-lg font-bold text-gray-900">
                  {paidCount} / {totalCount}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Cicilan Tersisa</p>
                <p className="text-lg font-bold text-yellow-600">
                  {pendingCount}
                </p>
              </div>
            </div>

            {/* Settlement Calculation */}
            <div className="border-2 border-gray-200 rounded-lg p-6 bg-white">
              <h3 className="font-bold text-gray-900 mb-4">
                Rincian Pelunasan:
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Sisa Pokok Pinjaman</span>
                  <span className="font-medium text-gray-900">
                    {safeCurrency(preview.remaining_principal)}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Bunga yang Dihemat</span>
                  <span className="font-medium text-green-600">
                    - {safeCurrency(preview.interest_saved)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t-2">
                  <span className="text-lg font-bold text-gray-900">
                    Total Yang Harus Dibayar
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {safeCurrency(preview.settlement_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Comparison */}
            {(savingsSummary || preview.interest_saved > 0) && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Perbandingan:</h3>
                <div className="space-y-3">
                  {originalTotalPayment > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Jika cicilan normal sampai lunas
                      </span>
                      <span className="font-medium text-gray-900">
                        {safeCurrency(originalTotalPayment)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Jika pelunasan sekarang
                    </span>
                    <span className="font-medium text-gray-900">
                      {safeCurrency(settlementPayment)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="font-bold text-green-900">
                      Total Penghematan
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {safeCurrency(totalSavings)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Installments Detail */}
            {preview.pending_installments_detail &&
              preview.pending_installments_detail.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">
                    Cicilan yang Akan Dibatalkan (
                    {preview.pending_installments_detail.length}):
                  </h3>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {preview.pending_installments_detail.map((installment) => (
                      <div
                        key={installment.installment_number}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded border"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            Cicilan #{installment.installment_number}
                          </p>
                          <p className="text-sm text-gray-600">
                            Jatuh tempo:{" "}
                            {loanEarlySettlementService.formatDate(
                              installment.due_date,
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {safeCurrency(installment.total_amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Pokok: {safeCurrency(installment.principal_amount)}
                            {" | "}
                            Bunga: {safeCurrency(installment.interest_amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan (Opsional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tambahkan catatan pelunasan..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Confirmation Checkbox */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  className="mt-1"
                />
                <div className="text-sm">
                  <p className="font-medium text-yellow-900">
                    Saya memahami dan menyetujui:
                  </p>
                  <ul className="list-disc list-inside text-yellow-800 mt-1 space-y-1">
                    <li>Membayar {safeCurrency(preview.settlement_amount)}</li>
                    <li>Pinjaman akan ditandai lunas</li>
                    <li>Cicilan pending akan dibatalkan</li>
                    <li>Proses ini tidak dapat dibatalkan</li>
                  </ul>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleProcess}
                disabled={loading || !confirmChecked}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Memproses..." : "Proses Pelunasan"}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>Data preview tidak tersedia</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarlySettlementModal;
