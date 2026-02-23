import React, { useState, useEffect } from "react";
import { MemberLayout } from "@/components/layout/MemberLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  UserX,
  Plus,
  Eye,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  FileText,
  RefreshCw,
} from "lucide-react";
import ResignationRequestModal from "@/components/modals/ResignationRequestModal";
import { ResignationDetailModal } from "@/components/modals/ResignationDetailModal";
import { useMemberResignations } from "@/hooks/useResignations";
import resignationService, { Resignation } from "@/lib/api/resignation.service";
import authService from "@/lib/api/auth.service";

export default function MemberResignation() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedResignation, setSelectedResignation] =
    useState<Resignation | null>(null);

  const { resignations, loading, error, refetch } = useMemberResignations(
    currentUser?.id || null,
  );

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error("Error loading user:", err);
      }
    };
    loadUser();
  }, []);

  // Check if has pending resignation
  const hasPendingResignation = resignations.some(
    (r) => r.status === "pending",
  );

  // Get latest resignation
  const latestResignation = resignations.length > 0 ? resignations[0] : null;

  const handleViewDetail = (resignation: Resignation) => {
    setSelectedResignation(resignation);
    setIsDetailModalOpen(true);
  };

  const formatCurrency = (amount: number) =>
    resignationService.formatCurrency(amount);
  const formatDate = (dateString: string) =>
    resignationService.formatDate(dateString);

  const getStatusBadge = (status: string) => {
    const color = resignationService.getStatusBadgeColor(status);
    const name = resignationService.getStatusDisplayName(status);
    return <Badge className={color}>{name}</Badge>;
  };

  if (loading && !currentUser) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Memuat data...</span>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UserX className="h-8 w-8 mr-3 text-red-600" />
              Pengunduran Diri
            </h1>
            <p className="text-gray-600 mt-1">
              Ajukan pengunduran diri dari koperasi
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refetch} disabled={loading}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            {!hasPendingResignation && (
              <Button
                onClick={() => setIsRequestModalOpen(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajukan Pengunduran Diri
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Pending Resignation Alert */}
        {hasPendingResignation && latestResignation && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Pengajuan Sedang Diproses</strong>
              <br />
              Pengajuan pengunduran diri Anda sedang menunggu persetujuan admin.
              Anda tidak dapat mengajukan pengunduran diri baru saat ini.
            </AlertDescription>
          </Alert>
        )}

        {/* Latest Status Card */}
        {latestResignation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Status Pengajuan Terbaru</span>
                {getStatusBadge(latestResignation.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Tanggal Pengajuan
                  </p>
                  <p className="font-semibold mt-1">
                    {formatDate(latestResignation.request_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Tanggal Efektif
                  </p>
                  <p className="font-semibold mt-1">
                    {formatDate(latestResignation.resignation_date)}
                  </p>
                </div>
                {latestResignation.withdrawal ? (
                  <div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Total Dicairkan
                    </p>
                    <div className="mt-1">
                      <p className="font-semibold text-lg text-green-600">
                        {formatCurrency(Number(latestResignation.withdrawal.total_withdrawal))}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        Cair: {formatDate(latestResignation.withdrawal.withdrawal_date)}
                      </p>
                    </div>
                  </div>
                ) : latestResignation.return_amount !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Estimasi Pengembalian
                    </p>
                    <p className="font-semibold text-lg text-green-600 mt-1">
                      {formatCurrency(latestResignation.return_amount)}
                    </p>
                  </div>
                )}
              </div>

              {/* Rejection reason if rejected */}
              {latestResignation.status === "rejected" &&
                latestResignation.rejection_reason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800">
                      Alasan Penolakan:
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      {latestResignation.rejection_reason}
                    </p>
                  </div>
                )}

              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => handleViewDetail(latestResignation)}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Lihat Detail Lengkap
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Menunggu</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {resignations.filter((r) => r.status === "pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Disetujui</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {resignations.filter((r) => r.status === "approved").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ditolak</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {resignations.filter((r) => r.status === "rejected").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Selesai</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      resignations.filter((r) => r.status === "completed")
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resignation History */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Pengajuan</CardTitle>
            <CardDescription>
              Semua pengajuan pengunduran diri Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2">Memuat riwayat...</span>
              </div>
            ) : resignations.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Anda belum pernah mengajukan pengunduran diri
                </p>
                <Button
                  onClick={() => setIsRequestModalOpen(true)}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajukan Sekarang
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {resignations.map((resignation) => (
                  <div
                    key={resignation.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-medium">
                            Pengajuan #{resignation.id}
                          </span>
                          {getStatusBadge(resignation.status)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            Diajukan: {formatDate(resignation.request_date)}
                          </p>
                          <p>
                            Efektif: {formatDate(resignation.resignation_date)}
                          </p>
                          <p className="text-gray-500 line-clamp-1">
                            Alasan: {resignation.reason}
                          </p>
                          {resignation.rejection_reason && (
                            <p className="text-red-600">
                              Ditolak: {resignation.rejection_reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(resignation)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {/* ✅ UPDATED: Props baru - tanpa userId dan settlementPreview */}
      <ResignationRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={refetch}
      />

      <ResignationDetailModal
        resignation={selectedResignation}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedResignation(null);
        }}
      />
    </MemberLayout>
  );
}
