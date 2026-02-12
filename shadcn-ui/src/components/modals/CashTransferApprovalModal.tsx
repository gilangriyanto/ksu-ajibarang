// components/modals/CashTransferApprovalModal.tsx
import { X, AlertTriangle } from "lucide-react";
import { CashTransfer } from "../../lib/api/cash-transfer.service";
import cashTransferService from "../../lib/api/cash-transfer.service";

interface CashTransferApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: CashTransfer | null;
  onApprove: (id: number) => Promise<boolean>;
  loading?: boolean;
}

const CashTransferApprovalModal = ({
  isOpen,
  onClose,
  transfer,
  onApprove,
  loading = false,
}: CashTransferApprovalModalProps) => {
  const handleApprove = async () => {
    if (!transfer) return;
    const success = await onApprove(transfer.id);
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
            Setujui Transfer
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
          <div className="flex items-start gap-3 bg-yellow-50 p-4 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Konfirmasi Persetujuan</p>
              <p>Dana akan segera ditransfer dari kas sumber ke kas tujuan.</p>
            </div>
          </div>

          {/* Transfer Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Dari</span>
              <span className="text-sm font-medium">
                {transfer.from_cash_account?.name || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Ke</span>
              <span className="text-sm font-medium">
                {transfer.to_cash_account?.name || "-"}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-sm text-gray-600">Nominal</span>
              <span className="text-lg font-bold text-blue-600">
                {cashTransferService.formatCurrency(transfer.amount)}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Tujuan Transfer
            </p>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              {transfer.purpose}
            </p>
          </div>

          {transfer.notes && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Catatan</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                {transfer.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleApprove}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Setujui Transfer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashTransferApprovalModal;
