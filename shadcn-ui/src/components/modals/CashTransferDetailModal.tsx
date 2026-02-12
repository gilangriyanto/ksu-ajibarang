// components/modals/CashTransferDetailModal.tsx
import { useEffect } from "react";
import {
  X,
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { CashTransfer } from "../../lib/api/cash-transfer.service";
import cashTransferService from "../../lib/api/cash-transfer.service";

interface CashTransferDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transferId: number | null;
  transfer: CashTransfer | null;
  loading?: boolean;
}

const CashTransferDetailModal = ({
  isOpen,
  onClose,
  transferId,
  transfer,
  loading = false,
}: CashTransferDetailModalProps) => {
  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log("🔍 Detail Modal Opened");
      console.log("Transfer ID:", transferId);
      console.log("Transfer Data:", transfer);
      console.log("Loading:", loading);
    }
  }, [isOpen, transferId, transfer, loading]);

  if (!isOpen) return null;

  // Show loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Memuat data transfer...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no transfer data
  if (!transfer) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Detail Transfer Kas
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-8 text-center">
            <p className="text-red-600 mb-4">
              ❌ Data transfer tidak ditemukan
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Transfer ID: {transferId || "N/A"}
            </p>
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Detail Transfer Kas
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">ID Transfer</p>
              <p className="text-lg font-semibold">#{transfer.id || "N/A"}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${cashTransferService.getStatusBadgeColor(
                transfer.status || "pending",
              )}`}
            >
              {cashTransferService.getStatusDisplayName(
                transfer.status || "pending",
              )}
            </span>
          </div>

          {/* Transfer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Dari Kas</p>
              <p className="font-medium">
                {transfer.from_cash_account?.name || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Ke Kas</p>
              <p className="font-medium">
                {transfer.to_cash_account?.name || "-"}
              </p>
            </div>
          </div>

          {/* Amount */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Nominal Transfer</p>
            <p className="text-2xl font-bold text-blue-600">
              {transfer.amount
                ? cashTransferService.formatCurrency(transfer.amount)
                : "Rp 0"}
            </p>
          </div>

          {/* Transfer Date */}
          {transfer.transfer_date && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-700">
                  Tanggal Transfer
                </p>
              </div>
              <p className="text-gray-600 bg-gray-50 p-3 rounded">
                {cashTransferService.formatDate(transfer.transfer_date)}
              </p>
            </div>
          )}

          {/* Purpose */}
          {transfer.purpose && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-700">
                  Tujuan Transfer
                </p>
              </div>
              <p className="text-gray-600 bg-gray-50 p-3 rounded">
                {transfer.purpose}
              </p>
            </div>
          )}

          {/* Notes (if exists) */}
          {transfer.notes && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Catatan</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                {transfer.notes}
              </p>
            </div>
          )}

          {/* Requester */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-500" />
              <p className="text-sm font-medium text-gray-700">Dibuat Oleh</p>
            </div>
            <p className="text-gray-600">{transfer.requester?.name || "-"}</p>
            {transfer.created_at && (
              <p className="text-sm text-gray-500">
                {cashTransferService.formatDate(transfer.created_at)}
              </p>
            )}
          </div>

          {/* Approval Info */}
          {transfer.status === "completed" && transfer.approved_by && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <p className="text-sm font-medium text-gray-700">
                  Disetujui Oleh
                </p>
              </div>
              <p className="text-gray-600">{transfer.approved_by.name}</p>
              {transfer.approved_at && (
                <p className="text-sm text-gray-500">
                  {cashTransferService.formatDate(transfer.approved_at)}
                </p>
              )}
            </div>
          )}

          {/* Cancellation Info */}
          {transfer.status === "cancelled" && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm font-medium text-gray-700">
                  Alasan Pembatalan
                </p>
              </div>
              <p className="text-gray-600 bg-red-50 p-3 rounded">
                {transfer.reason || "Tidak ada alasan"}
              </p>
              {transfer.cancelled_at && (
                <p className="text-sm text-gray-500 mt-2">
                  Dibatalkan pada{" "}
                  {cashTransferService.formatDate(transfer.cancelled_at)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashTransferDetailModal;
