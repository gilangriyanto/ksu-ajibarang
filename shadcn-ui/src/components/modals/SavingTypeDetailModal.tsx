// components/modals/SavingTypeDetailModal.tsx
// 🆕 NEW FEATURE: View saving type details

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
import {
  PiggyBank,
  CheckCircle,
  XCircle,
  DollarSign,
  Percent,
  Eye,
  Edit,
} from "lucide-react";
import { SavingType } from "@/lib/api/savings.service";

interface SavingTypeDetailModalProps {
  savingType: SavingType | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (savingType: SavingType) => void;
}

export function SavingTypeDetailModal({
  savingType,
  isOpen,
  onClose,
  onEdit,
}: SavingTypeDetailModalProps) {
  if (!savingType) return null;

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
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PiggyBank className="h-5 w-5" />
            <span>Detail Jenis Simpanan</span>
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap {savingType.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Informasi Dasar
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Kode</p>
                <p className="font-medium text-gray-900">{savingType.code}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Nama</p>
                <p className="font-medium text-gray-900">{savingType.name}</p>
              </div>
              {savingType.description && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Deskripsi</p>
                  <p className="text-sm text-gray-700">
                    {savingType.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700">Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Simpanan Wajib:</span>
                {savingType.is_mandatory ? (
                  <Badge className="bg-red-100 text-red-800">Ya</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">Tidak</Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Dapat Ditarik:</span>
                {savingType.is_withdrawable ? (
                  <Badge className="bg-green-100 text-green-800">Ya</Badge>
                ) : (
                  <Badge className="bg-orange-100 text-orange-800">Tidak</Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Status Aktif:</span>
                {savingType.is_active ? (
                  <Badge className="bg-blue-100 text-blue-800 flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Aktif</span>
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800 flex items-center space-x-1">
                    <XCircle className="h-3 w-3" />
                    <span>Nonaktif</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Interest */}
          {savingType.has_interest && (
            <div className="space-y-4 border-t pt-4 bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 flex items-center">
                <Percent className="h-4 w-4 mr-2" />
                Bunga
              </h3>
              <div>
                <p className="text-xs text-blue-700 mb-1">Bunga Default</p>
                <p className="text-2xl font-bold text-blue-900">
                  {savingType.default_interest_rate || 0}%
                  <span className="text-sm font-normal text-blue-700 ml-2">
                    per tahun
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Amount Limits */}
          {(savingType.minimum_amount || savingType.maximum_amount) && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Batasan Jumlah
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {savingType.minimum_amount && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Minimal</p>
                    <p className="font-medium text-gray-900">
                      {formatCurrency(savingType.minimum_amount)}
                    </p>
                  </div>
                )}
                {savingType.maximum_amount && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Maksimal</p>
                    <p className="font-medium text-gray-900">
                      {formatCurrency(savingType.maximum_amount)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Display Order */}
          {savingType.display_order !== undefined && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Urutan Tampilan:</span>
                <span className="font-medium text-gray-900">
                  {savingType.display_order || "Otomatis"}
                </span>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="space-y-2 border-t pt-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Dibuat:</span>
              <span className="text-gray-700">
                {formatDate(savingType.created_at)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Terakhir Diubah:</span>
              <span className="text-gray-700">
                {formatDate(savingType.updated_at)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
          {onEdit && (
            <Button onClick={() => onEdit(savingType)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SavingTypeDetailModal;
