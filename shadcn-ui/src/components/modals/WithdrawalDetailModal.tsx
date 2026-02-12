// components/modals/WithdrawalDetailModal.tsx
// 💰 View Withdrawal Detail

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  User,
  DollarSign,
  CreditCard,
  Calendar,
  FileText,
} from "lucide-react";
import withdrawalService, { Withdrawal } from "@/lib/api/withdrawal.service";

interface WithdrawalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawal: Withdrawal | null;
  loading?: boolean;
}

export function WithdrawalDetailModal({
  isOpen,
  onClose,
  withdrawal,
  loading = false,
}: WithdrawalDetailModalProps) {
  if (loading || !withdrawal) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const paymentMethodColor = withdrawalService.getPaymentMethodBadgeColor(
    withdrawal.payment_method,
  );
  const paymentMethodName = withdrawalService.getPaymentMethodDisplayName(
    withdrawal.payment_method,
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Pencairan Dana</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Member Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-5 w-5 text-gray-600" />
              <span className="font-semibold text-gray-900">
                Informasi Anggota
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nama:</span>
                <span className="font-medium">
                  {withdrawal.user?.full_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">NIP:</span>
                <span className="font-medium">
                  {withdrawal.user?.employee_id}
                </span>
              </div>
              {withdrawal.user?.email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{withdrawal.user.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">
                Jumlah Pencairan
              </span>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(withdrawal.withdrawal_amount)}
              </div>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-600" />
              <span className="font-semibold text-gray-900">
                Metode Pembayaran
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Metode:</p>
                <Badge className={paymentMethodColor}>
                  {paymentMethodName}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Akun Kas:</p>
                <p className="font-medium">{withdrawal.cash_account?.name}</p>
                {withdrawal.cash_account?.account_number && (
                  <p className="text-sm text-gray-500">
                    {withdrawal.cash_account.account_number}
                  </p>
                )}
              </div>
            </div>

            {/* Transfer Details */}
            {withdrawal.payment_method === "transfer" && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="font-medium text-sm text-gray-900">
                  Detail Transfer:
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank:</span>
                    <span className="font-medium">{withdrawal.bank_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">No. Rekening:</span>
                    <span className="font-medium">
                      {withdrawal.account_number}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nama Pemegang:</span>
                    <span className="font-medium">
                      {withdrawal.account_holder_name}
                    </span>
                  </div>
                  {withdrawal.transfer_reference && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Referensi:</span>
                      <span className="font-medium">
                        {withdrawal.transfer_reference}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Check Details */}
            {withdrawal.payment_method === "check" && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="font-medium text-sm text-gray-900">Detail Cek:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nomor Cek:</span>
                    <span className="font-medium">
                      {withdrawal.check_number}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tanggal Cek:</span>
                    <span className="font-medium">
                      {withdrawal.check_date &&
                        formatDate(withdrawal.check_date)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {withdrawal.notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <span className="font-semibold text-gray-900">Catatan</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">{withdrawal.notes}</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Processing Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <span className="font-semibold text-gray-900">
                Informasi Pemrosesan
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Diproses oleh:</span>
                <span className="font-medium">
                  {withdrawal.processed_by_user?.full_name || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tanggal Pemrosesan:</span>
                <span className="font-medium">
                  {formatDate(withdrawal.processed_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ID Pencairan:</span>
                <span className="font-medium">#{withdrawal.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ID Resignation:</span>
                <span className="font-medium">
                  #{withdrawal.resignation_id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
