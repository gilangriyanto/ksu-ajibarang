// components/modals/ResignationDetailModal.tsx
// 🔧 UPDATED: Tambah status 'completed'

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Eye,
  User,
  Calendar,
  FileText,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Resignation } from "@/lib/api/resignation.service";
import resignationService from "@/lib/api/resignation.service";

interface ResignationDetailModalProps {
  resignation: Resignation | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (resignation: Resignation) => void;
  onReject?: (resignation: Resignation) => void;
  showActions?: boolean;
}

export function ResignationDetailModal({
  resignation,
  isOpen,
  onClose,
  onApprove,
  onReject,
  showActions = false,
}: ResignationDetailModalProps) {
  if (!resignation) return null;

  const formatCurrency = (amount: number) =>
    resignationService.formatCurrency(amount);
  const formatDate = (dateString: string) =>
    resignationService.formatDate(dateString);

  const getStatusBadge = (status: string) => {
    const color = resignationService.getStatusBadgeColor(status);
    const name = resignationService.getStatusDisplayName(status);
    return <Badge className={color}>{name}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Detail Pengunduran Diri</span>
          </DialogTitle>
          <DialogDescription>ID Pengajuan: #{resignation.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Member Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Informasi Anggota
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-gray-600">Nama:</Label>
                <p className="font-medium">{resignation.user?.full_name}</p>
              </div>
              <div>
                <Label className="text-gray-600">ID Anggota:</Label>
                <p className="font-medium font-mono">
                  {resignation.user?.employee_id}
                </p>
              </div>
              {resignation.user?.email && (
                <div>
                  <Label className="text-gray-600">Email:</Label>
                  <p className="font-medium">{resignation.user.email}</p>
                </div>
              )}
              {resignation.user?.phone_number && (
                <div>
                  <Label className="text-gray-600">Telepon:</Label>
                  <p className="font-medium">{resignation.user.phone_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Resignation Info */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Informasi Pengajuan
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-gray-600">Status:</Label>
                <div className="mt-1">{getStatusBadge(resignation.status)}</div>
              </div>
              <div>
                <Label className="text-gray-600">Tanggal Pengajuan:</Label>
                <p className="font-medium flex items-center">
                  <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                  {formatDate(resignation.request_date || resignation.created_at)}
                </p>
              </div>
              <div className="col-span-2">
                <Label className="text-gray-600">Tanggal Efektif:</Label>
                <p className="font-medium flex items-center">
                  <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                  {formatDate(resignation.resignation_date)}
                </p>
              </div>
            </div>

            <div>
              <Label className="text-gray-600">Alasan:</Label>
              <p className="mt-1 text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                {resignation.reason}
              </p>
            </div>
          </div>

          {/* Settlement Calculation */}
          {(resignation.total_savings !== undefined ||
            resignation.total_loans !== undefined ||
            resignation.return_amount !== undefined) && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Perhitungan Pengembalian Dana
              </h3>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                {resignation.total_savings !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Total Simpanan:</span>
                    <span className="font-medium">
                      {formatCurrency(resignation.total_savings)}
                    </span>
                  </div>
                )}

                {resignation.settlement_details?.savings_breakdown && (
                  <div className="ml-4 space-y-1 text-xs text-blue-600">
                    <div className="flex justify-between">
                      <span>• Simpanan Pokok:</span>
                      <span>
                        {formatCurrency(
                          resignation.settlement_details.savings_breakdown
                            .principal,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Simpanan Wajib:</span>
                      <span>
                        {formatCurrency(
                          resignation.settlement_details.savings_breakdown
                            .mandatory,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Simpanan Sukarela:</span>
                      <span>
                        {formatCurrency(
                          resignation.settlement_details.savings_breakdown
                            .voluntary,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Simpanan Hari Raya:</span>
                      <span>
                        {formatCurrency(
                          resignation.settlement_details.savings_breakdown
                            .holiday,
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {resignation.total_loans !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Sisa Pinjaman:</span>
                    <span className="font-medium text-red-600">
                      - {formatCurrency(resignation.total_loans)}
                    </span>
                  </div>
                )}

                {resignation.deduction_amount !== undefined &&
                  resignation.deduction_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Potongan Lain:</span>
                      <span className="font-medium text-red-600">
                        - {formatCurrency(resignation.deduction_amount)}
                      </span>
                    </div>
                  )}

                {resignation.return_amount !== undefined && (
                  <div className="border-t border-blue-300 pt-3 flex justify-between">
                    <span className="text-blue-900 font-semibold">
                      Total Pengembalian:
                    </span>
                    <span className="font-bold text-xl text-blue-900">
                      {formatCurrency(resignation.return_amount)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Admin Process Info */}
          {(resignation.status === "approved" ||
            resignation.status === "rejected" ||
            resignation.status === "completed") && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                {resignation.status === "approved" ? (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                ) : resignation.status === "rejected" ? (
                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                )}
                Informasi Proses
              </h3>

              <div className="space-y-3 text-sm">
                {resignation.processed_by_user && (
                  <div>
                    <Label className="text-gray-600">Diproses Oleh:</Label>
                    <p className="font-medium">
                      {resignation.processed_by_user.full_name} (
                      {resignation.processed_by_user.employee_id})
                    </p>
                  </div>
                )}

                {resignation.processed_at && (
                  <div>
                    <Label className="text-gray-600">Tanggal Proses:</Label>
                    <p className="font-medium">
                      {formatDate(resignation.processed_at)}
                    </p>
                  </div>
                )}

                {resignation.rejection_reason && (
                  <div>
                    <Label className="text-gray-600">Alasan Penolakan:</Label>
                    <p className="mt-1 bg-red-50 p-3 rounded-lg text-red-800">
                      {resignation.rejection_reason}
                    </p>
                  </div>
                )}

                {resignation.admin_notes && (
                  <div>
                    <Label className="text-gray-600">Catatan Admin:</Label>
                    <p className="mt-1 bg-gray-50 p-3 rounded-lg">
                      {resignation.admin_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {showActions &&
          resignation.status === "pending" &&
          onApprove &&
          onReject ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Tutup
              </Button>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onReject(resignation)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Tolak
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onApprove(resignation)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Setujui
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>Tutup</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ResignationDetailModal;
