import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  PiggyBank,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  Edit,
  X,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Saving } from "@/lib/api/savings.service";

interface SavingsDetailModalProps {
  savings: Saving | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (savings: Saving) => void;
}

export function SavingsDetailModal({
  savings,
  isOpen,
  onClose,
  onEdit,
}: SavingsDetailModalProps) {
  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount || 0);
  };

  const getSavingsTypeBadge = (type: string) => {
    switch (type) {
      case "mandatory":
        return (
          <Badge className="bg-blue-100 text-blue-800">Simpanan Wajib</Badge>
        );
      case "voluntary":
        return (
          <Badge className="bg-green-100 text-green-800">
            Simpanan Sukarela
          </Badge>
        );
      case "principal":
        return (
          <Badge className="bg-purple-100 text-purple-800">
            Simpanan Pokok
          </Badge>
        );
      case "holiday":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            Simpanan Hari Raya
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Disetujui
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Ditolak
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSavingTypeName = (type: string) => {
    switch (type) {
      case "mandatory":
        return "Simpanan Wajib";
      case "voluntary":
        return "Simpanan Sukarela";
      case "principal":
        return "Simpanan Pokok";
      case "holiday":
        return "Simpanan Hari Raya";
      default:
        return type;
    }
  };

  if (!savings) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="p-6 text-center">
            <p className="text-gray-500">Tidak ada data simpanan</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Handle both old and new field names
  const userName = savings.user?.full_name || savings.user_name || "-";
  const userCode = savings.user?.employee_id || savings.user_code || "-";
  const savingType = savings.savings_type || savings.saving_type || "mandatory";
  const amount = savings.amount || 0;
  const balance = savings.final_amount || savings.balance || 0;
  const description = savings.description || savings.notes || "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <PiggyBank className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Detail Simpanan
                </DialogTitle>
                <DialogDescription className="flex items-center space-x-2">
                  <span>
                    {userCode} - {userName}
                  </span>
                  {getSavingsTypeBadge(savingType)}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onEdit && savings.status === "pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(savings)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Member Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informasi Anggota</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Nama Anggota</p>
                  <p className="font-medium">{userName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Kode Anggota</p>
                  <p className="font-medium">{userCode}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Tanggal Dibuat</p>
                  <p className="font-medium">
                    {new Date(savings.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(savings.status)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Savings Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PiggyBank className="h-5 w-5" />
                <span>Informasi Simpanan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <PiggyBank className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Jenis Simpanan</p>
                  <p className="font-medium">{getSavingTypeName(savingType)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Jumlah</p>
                  <p className="font-medium text-green-600">
                    {formatCurrency(amount)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Saldo Akhir</p>
                  <p className="font-medium text-blue-600">
                    {formatCurrency(balance)}
                  </p>
                </div>
              </div>

              {description && (
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Keterangan</p>
                    <p className="font-medium">{description}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Balance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Saldo Akhir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(balance)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total dengan bunga</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Jumlah Simpanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(amount)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(savings.created_at).toLocaleDateString("id-ID")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Terakhir Update
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-purple-600">
                {new Date(savings.updated_at).toLocaleDateString("id-ID")}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(savings.updated_at).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Approval Info */}
        {savings.approved_by && (
          <Card className="mt-6 bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-900">
                <CheckCircle className="h-5 w-5" />
                <span>Informasi Persetujuan</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-700">Disetujui Oleh:</p>
                  <p className="font-medium text-green-900">
                    {typeof savings.approved_by === "object"
                      ? savings.approved_by.full_name
                      : `Admin ID: ${savings.approved_by}`}
                  </p>
                </div>
                <div>
                  <p className="text-green-700">Tanggal Persetujuan:</p>
                  <p className="font-medium text-green-900">
                    {savings.approved_at
                      ? new Date(savings.approved_at).toLocaleDateString(
                          "id-ID"
                        )
                      : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SavingsDetailModal;
