import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PiggyBank,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  X,
  Download,
  Loader2,
  User,
  Briefcase,
} from "lucide-react";
import savingsService from "@/lib/api/savings.service";
import { toast } from "sonner";

// ✅ NEW: Match backend response structure
interface SavingDetail {
  id: number;
  user_id: number;
  cash_account_id: number;
  savings_type: string;
  amount: string;
  interest_percentage: string;
  final_amount: string;
  transaction_date: string;
  status: string;
  notes: string | null;
  approved_by: {
    id: number;
    full_name: string;
  } | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user: {
    id: number;
    full_name: string;
    employee_id: string;
    email: string;
  };
  cash_account: {
    id: number;
    code: string;
    name: string;
  };
}

interface SavingsDetailViewModalProps {
  account: { id: number } | null; // ✅ Only need ID to fetch
  isOpen: boolean;
  onClose: () => void;
}

export function SavingsDetailViewModal({
  account,
  isOpen,
  onClose,
}: SavingsDetailViewModalProps) {
  const [savingDetail, setSavingDetail] = useState<SavingDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch detail when modal opens
  useEffect(() => {
    const fetchSavingDetail = async () => {
      if (!account?.id || !isOpen) return;

      try {
        setLoading(true);
        console.log("📥 Fetching saving detail for ID:", account.id);

        const response = await savingsService.getById(account.id);

        console.log("✅ Raw API response:", response);

        // ✅ Handle nested data structure from backend
        // Backend returns: { success: true, message: "...", data: {...} }
        let detail: SavingDetail;

        if (response.data) {
          // If response has nested 'data' property
          detail = response.data;
          console.log("✅ Extracted from response.data:", detail);
        } else {
          // If response is already the data
          detail = response as unknown as SavingDetail;
          console.log("✅ Using response directly:", detail);
        }

        console.log("✅ Final saving detail:", detail);
        console.log("✅ User data:", detail.user);
        console.log("✅ Cash account:", detail.cash_account);

        setSavingDetail(detail);
      } catch (error: any) {
        console.error("❌ Error fetching saving detail:", error);
        toast.error(error.message || "Gagal memuat detail simpanan");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchSavingDetail();
    } else {
      // Reset when modal closes
      setSavingDetail(null);
    }
  }, [account?.id, isOpen]);

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount || 0);
  };

  const getAccountTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      principal: "Simpanan Pokok",
      mandatory: "Simpanan Wajib",
      voluntary: "Simpanan Sukarela",
      holiday: "Simpanan Hari Raya",
    };
    return typeMap[type] || type;
  };

  const getAccountTypeBadge = (type: string) => {
    const badgeMap: Record<string, { color: string; text: string }> = {
      principal: {
        color: "bg-purple-100 text-purple-800",
        text: "Simpanan Pokok",
      },
      mandatory: { color: "bg-blue-100 text-blue-800", text: "Simpanan Wajib" },
      voluntary: {
        color: "bg-green-100 text-green-800",
        text: "Simpanan Sukarela",
      },
      holiday: {
        color: "bg-orange-100 text-orange-800",
        text: "Simpanan Hari Raya",
      },
    };

    const badge = badgeMap[type] || {
      color: "bg-gray-100 text-gray-800",
      text: type,
    };
    return <Badge className={badge.color}>{badge.text}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      approved: { color: "bg-green-100 text-green-800", text: "Disetujui" },
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      rejected: { color: "bg-red-100 text-red-800", text: "Ditolak" },
    };

    const badge = statusMap[status] || {
      color: "bg-gray-100 text-gray-800",
      text: status,
    };
    return <Badge className={badge.color}>{badge.text}</Badge>;
  };

  const calculateAccountAge = (createdDate: string) => {
    const openDateObj = new Date(createdDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - openDateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);

    if (years > 0) {
      return `${years} tahun ${months} bulan`;
    }
    return `${months} bulan`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Simpanan</DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang simpanan anggota
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">
              Memuat detail simpanan...
            </span>
          </div>
        ) : savingDetail ? (
          <>
            {/* Header Info */}
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <PiggyBank className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold">
                      Simpanan #{savingDetail.id}
                    </h3>
                    {getAccountTypeBadge(savingDetail.savings_type)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {savingDetail.user?.full_name || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="space-y-6 mt-6">
              {/* Account Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Jumlah Simpanan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(savingDetail.amount)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Pokok setoran</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Bunga ({savingDetail.interest_percentage}%)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        parseFloat(savingDetail.final_amount) -
                          parseFloat(savingDetail.amount)
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Bunga {savingDetail.interest_percentage}% per tahun
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Total Akhir
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(savingDetail.final_amount)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Pokok + Bunga</p>
                  </CardContent>
                </Card>
              </div>

              {/* Member Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Informasi Anggota</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Nama Lengkap</p>
                        <p className="font-medium text-lg">
                          {savingDetail.user?.full_name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">ID Karyawan</p>
                        <p className="font-medium">
                          {savingDetail.user?.employee_id || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">
                          {savingDetail.user?.email || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Akun Kas</p>
                        <p className="font-medium">
                          {savingDetail.cash_account?.code || "N/A"} -{" "}
                          {savingDetail.cash_account?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Saving Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5" />
                    <span>Informasi Simpanan</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Jenis Simpanan</p>
                        <div className="mt-1">
                          {getAccountTypeBadge(savingDetail.savings_type)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Tanggal Transaksi
                        </p>
                        <p className="font-medium">
                          {new Date(
                            savingDetail.transaction_date
                          ).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Usia Simpanan</p>
                        <p className="font-medium">
                          {calculateAccountAge(savingDetail.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <div className="mt-1">
                          {getStatusBadge(savingDetail.status)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Disetujui Oleh</p>
                        <p className="font-medium">
                          {savingDetail.approved_by?.full_name || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Dibuat Tanggal</p>
                        <p className="font-medium">
                          {new Date(savingDetail.created_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes Section */}
              {savingDetail.notes && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-900 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Catatan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-800">{savingDetail.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Calculation Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Rincian Perhitungan</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Jumlah Pokok Simpanan</p>
                        <p className="text-sm text-gray-500">
                          Setoran awal simpanan
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          {formatCurrency(savingDetail.amount)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">
                          Bunga ({savingDetail.interest_percentage}% per tahun)
                        </p>
                        <p className="text-sm text-gray-500">
                          Perhitungan bunga simpanan
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          +{" "}
                          {formatCurrency(
                            parseFloat(savingDetail.final_amount) -
                              parseFloat(savingDetail.amount)
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                      <div>
                        <p className="font-bold text-purple-900">Total Akhir</p>
                        <p className="text-sm text-purple-700">Pokok + Bunga</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">
                          {formatCurrency(savingDetail.final_amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Benefits */}
              <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-900">
                    Keuntungan {getAccountTypeName(savingDetail.savings_type)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-green-900 mb-2">
                        Manfaat:
                      </h4>
                      <ul className="space-y-1 text-green-700">
                        <li>
                          • Bunga kompetitif {savingDetail.interest_percentage}%
                          per tahun
                        </li>
                        <li>• Bebas biaya administrasi bulanan</li>
                        <li>• Dapat dijadikan jaminan pinjaman</li>
                        <li>• Perlindungan dana simpanan</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900 mb-2">
                        Fasilitas:
                      </h4>
                      <ul className="space-y-1 text-green-700">
                        <li>• Proses persetujuan cepat</li>
                        <li>• Transparansi perhitungan bunga</li>
                        <li>• Laporan simpanan berkala</li>
                        <li>• Layanan informasi 24/7</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="p-6 text-center">
            <PiggyBank className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada data simpanan</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SavingsDetailViewModal;
