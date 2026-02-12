// components/modals/CashTransferCancellationModal.tsx
import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { CashTransfer } from "../../lib/api/cash-transfer.service";

interface CashTransferCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: CashTransfer | null;
  onCancel: (id: number, reason: string) => Promise<boolean>;
  loading?: boolean;
}

const CashTransferCancellationModal = ({
  isOpen,
  onClose,
  transfer,
  onCancel,
  loading = false,
}: CashTransferCancellationModalProps) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setReason("");
      setError("");
    }
  }, [isOpen]);

  const handleCancel = async () => {
    if (!transfer) return;

    if (!reason.trim()) {
      setError("Alasan pembatalan harus diisi");
      return;
    }

    const success = await onCancel(transfer.id, reason);
    if (success) {
      onClose();
    }
  };

  if (!isOpen || !transfer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Batalkan Transfer
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 bg-red-50 p-4 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">Peringatan</p>
              <p>
                Transfer ID #{transfer.id} akan dibatalkan dan tidak dapat
                dikembalikan.
              </p>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alasan Pembatalan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              disabled={loading}
              rows={4}
              placeholder="Masukkan alasan pembatalan transfer"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 resize-none"
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Kembali
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Membatalkan..." : "Batalkan Transfer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashTransferCancellationModal;
