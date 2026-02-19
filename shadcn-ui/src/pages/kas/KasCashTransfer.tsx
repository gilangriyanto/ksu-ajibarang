// src/pages/kas/KasCashTransfer.tsx
// ✅ Cash Transfer page for Manager Kas role
// ✅ Uses KasLayout (NOT ManagerLayout)
// ✅ Endpoints: GET/POST /cash-transfers, POST /cash-transfers/{id}/approve|cancel

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeftRight,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import cashTransferService, {
  CashTransfer,
  CashTransferStatistics,
  CreateCashTransferData,
} from "@/lib/api/cash-transfer.service";

// ==================== KAS ACCOUNTS ====================
const KAS_ACCOUNTS = [
  { id: 1, name: "Kas 1 - Pembiayaan Umum", code: "KAS-I" },
  { id: 2, name: "Kas 2 - Barang & Logistik", code: "KAS-II" },
  { id: 3, name: "Kas 3 - Sebrakan", code: "KAS-III" },
  { id: 4, name: "Kas 4 - Kantin", code: "KAS-IV" },
];

export default function KasCashTransfer() {
  const { user } = useAuth();
  const kasId = user?.kas_id || 1;

  // Data states
  const [transfers, setTransfers] = useState<CashTransfer[]>([]);
  const [statistics, setStatistics] = useState<CashTransferStatistics | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<CashTransfer | null>(
    null,
  );

  // Create form
  const [formData, setFormData] = useState<CreateCashTransferData>({
    from_cash_account_id: kasId,
    to_cash_account_id: 0,
    amount: 0,
    transfer_date: new Date().toISOString().split("T")[0],
    purpose: "",
  });
  const [creating, setCreating] = useState(false);
  const [processing, setProcessing] = useState(false);

  // ==================== LOAD DATA ====================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [transfersRes, statsRes] = await Promise.all([
        cashTransferService.getAll().catch(() => null),
        cashTransferService.getStatistics().catch(() => null),
      ]);

      // Parse transfers
      let transfersData: CashTransfer[] = [];
      if (transfersRes) {
        const raw =
          transfersRes.data?.data || transfersRes.data || transfersRes;
        transfersData = Array.isArray(raw) ? raw : [];
      }

      // Filter transfers related to this kas
      const kasTransfers = transfersData.filter(
        (t) =>
          t.from_cash_account_id === kasId || t.to_cash_account_id === kasId,
      );
      setTransfers(kasTransfers);

      // Parse statistics
      if (statsRes) {
        const raw = statsRes.data?.data || statsRes.data || statsRes;
        setStatistics(raw);
      }
    } catch (err) {
      console.error("Error loading transfers:", err);
      toast.error("Gagal memuat data transfer");
    } finally {
      setLoading(false);
    }
  }, [kasId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success("Data diperbarui");
  };

  // ==================== CREATE TRANSFER ====================

  const handleCreate = async () => {
    if (!formData.to_cash_account_id || formData.to_cash_account_id === 0) {
      toast.error("Pilih kas tujuan");
      return;
    }
    if (formData.from_cash_account_id === formData.to_cash_account_id) {
      toast.error("Kas asal dan tujuan tidak boleh sama");
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      toast.error("Jumlah transfer harus lebih dari 0");
      return;
    }
    if (!formData.purpose.trim()) {
      toast.error("Tujuan transfer harus diisi");
      return;
    }

    try {
      setCreating(true);
      await cashTransferService.create(formData);
      toast.success("Transfer kas berhasil dibuat");
      setShowCreateModal(false);
      resetForm();
      await loadData();
    } catch (err: any) {
      const msg = err.data?.message || err.message || "Gagal membuat transfer";
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      from_cash_account_id: kasId,
      to_cash_account_id: 0,
      amount: 0,
      transfer_date: new Date().toISOString().split("T")[0],
      purpose: "",
    });
  };

  // ==================== APPROVE / CANCEL ====================

  const handleApprove = async (id: number) => {
    if (!confirm("Yakin ingin menyetujui transfer ini?")) return;
    try {
      setProcessing(true);
      await cashTransferService.approve(id);
      toast.success("Transfer berhasil disetujui");
      await loadData();
    } catch (err: any) {
      toast.error(
        err.data?.message || err.message || "Gagal menyetujui transfer",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Yakin ingin membatalkan transfer ini?")) return;
    try {
      setProcessing(true);
      await cashTransferService.cancel(id);
      toast.success("Transfer berhasil dibatalkan");
      await loadData();
    } catch (err: any) {
      toast.error(
        err.data?.message || err.message || "Gagal membatalkan transfer",
      );
    } finally {
      setProcessing(false);
    }
  };

  // ==================== HELPERS ====================

  const formatCurrency = (amount: number | string) => {
    const n = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n || 0);
  };

  const getKasName = (id: number) => {
    const kas = KAS_ACCOUNTS.find((k) => k.id === id);
    return kas?.name || `Kas ${id}`;
  };

  const getKasCode = (id: number) => {
    const kas = KAS_ACCOUNTS.find((k) => k.id === id);
    return kas?.code || `KAS-${id}`;
  };

  const getStatusBadge = (status: string) => {
    const m: Record<string, { color: string; text: string }> = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      approved: { color: "bg-green-100 text-green-800", text: "Disetujui" },
      cancelled: { color: "bg-red-100 text-red-800", text: "Dibatalkan" },
    };
    const c = m[status] || { color: "bg-gray-100 text-gray-800", text: status };
    return <Badge className={c.color}>{c.text}</Badge>;
  };

  const pendingTransfers = transfers.filter((t) => t.status === "pending");
  const approvedTransfers = transfers.filter((t) => t.status === "approved");

  // ==================== LOADING ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Memuat data transfer...</span>
      </div>
    );
  }

  // ==================== RENDER ====================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transfer Kas</h1>
          <p className="text-gray-600">
            Kelola transfer antar kas — {getKasName(kasId)}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Transfer Baru
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Transfer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {transfers.length}
            </div>
            <p className="text-xs text-gray-500">Terkait {getKasCode(kasId)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingTransfers.length}
            </div>
            <p className="text-xs text-gray-500">Menunggu persetujuan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Disetujui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvedTransfers.length}
            </div>
            <p className="text-xs text-gray-500">Transfer selesai</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Nominal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(
                approvedTransfers.reduce(
                  (s, t) => s + (parseFloat(t.amount?.toString()) || 0),
                  0,
                ),
              )}
            </div>
            <p className="text-xs text-gray-500">Transfer disetujui</p>
          </CardContent>
        </Card>
      </div>

      {/* Transfer List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Daftar Transfer
          </CardTitle>
          <CardDescription>
            Transfer kas yang terkait dengan {getKasName(kasId)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Transfer</TableHead>
                  <TableHead>Dari</TableHead>
                  <TableHead></TableHead>
                  <TableHead>Ke</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tujuan</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <ArrowLeftRight className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Belum ada transfer kas</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  transfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell className="font-mono text-sm">
                        {transfer.transfer_number || `#${transfer.id}`}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            transfer.from_cash_account_id === kasId
                              ? "border-purple-300 text-purple-700 bg-purple-50"
                              : ""
                          }
                        >
                          {transfer.from_cash_account?.name ||
                            getKasCode(transfer.from_cash_account_id)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            transfer.to_cash_account_id === kasId
                              ? "border-purple-300 text-purple-700 bg-purple-50"
                              : ""
                          }
                        >
                          {transfer.to_cash_account?.name ||
                            getKasCode(transfer.to_cash_account_id)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transfer.amount)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(transfer.transfer_date).toLocaleDateString(
                          "id-ID",
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-[200px] truncate">
                        {transfer.purpose}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedTransfer(transfer);
                              setShowDetailModal(true);
                            }}
                            title="Detail"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          {transfer.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-green-50"
                                onClick={() => handleApprove(transfer.id)}
                                disabled={processing}
                                title="Setujui"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-red-50"
                                onClick={() => handleCancel(transfer.id)}
                                disabled={processing}
                                title="Batalkan"
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ==================== CREATE MODAL ==================== */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              Transfer Kas Baru
            </DialogTitle>
            <DialogDescription>
              Buat transfer antar kas koperasi
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* From */}
            <div className="space-y-2">
              <Label>
                Dari Kas <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.from_cash_account_id.toString()}
                onValueChange={(v) =>
                  setFormData((p) => ({
                    ...p,
                    from_cash_account_id: parseInt(v),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KAS_ACCOUNTS.map((kas) => (
                    <SelectItem key={kas.id} value={kas.id.toString()}>
                      {kas.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* To */}
            <div className="space-y-2">
              <Label>
                Ke Kas <span className="text-red-500">*</span>
              </Label>
              <Select
                value={
                  formData.to_cash_account_id > 0
                    ? formData.to_cash_account_id.toString()
                    : ""
                }
                onValueChange={(v) =>
                  setFormData((p) => ({
                    ...p,
                    to_cash_account_id: parseInt(v),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kas tujuan" />
                </SelectTrigger>
                <SelectContent>
                  {KAS_ACCOUNTS.filter(
                    (k) => k.id !== formData.from_cash_account_id,
                  ).map((kas) => (
                    <SelectItem key={kas.id} value={kas.id.toString()}>
                      {kas.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>
                Jumlah Transfer <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-sm text-gray-500 font-medium">
                  Rp
                </span>
                <Input
                  type="number"
                  value={formData.amount || ""}
                  className="pl-10"
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      amount: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                  min="0"
                  step="10000"
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>
                Tanggal Transfer <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.transfer_date}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, transfer_date: e.target.value }))
                }
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label>
                Tujuan / Keterangan <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={formData.purpose}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, purpose: e.target.value }))
                }
                placeholder="Contoh: Transfer dana operasional"
                rows={3}
              />
            </div>

            {/* Preview */}
            {formData.amount > 0 && formData.to_cash_account_id > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm font-medium text-purple-900 mb-2">
                  Ringkasan Transfer
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {getKasCode(formData.from_cash_account_id)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">
                    {getKasCode(formData.to_cash_account_id)}
                  </span>
                </div>
                <p className="text-lg font-bold text-purple-700 mt-1">
                  {formatCurrency(formData.amount)}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Batal
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  Buat Transfer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== DETAIL MODAL ==================== */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Detail Transfer</DialogTitle>
          </DialogHeader>
          {selectedTransfer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">No. Transfer</p>
                  <p className="font-medium">
                    {selectedTransfer.transfer_number ||
                      `#${selectedTransfer.id}`}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <div className="mt-0.5">
                    {getStatusBadge(selectedTransfer.status)}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500">Dari Kas</p>
                  <p className="font-medium">
                    {selectedTransfer.from_cash_account?.name ||
                      getKasName(selectedTransfer.from_cash_account_id)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Ke Kas</p>
                  <p className="font-medium">
                    {selectedTransfer.to_cash_account?.name ||
                      getKasName(selectedTransfer.to_cash_account_id)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Jumlah</p>
                  <p className="font-bold text-purple-700">
                    {formatCurrency(selectedTransfer.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Tanggal</p>
                  <p className="font-medium">
                    {new Date(
                      selectedTransfer.transfer_date,
                    ).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tujuan</p>
                <p className="text-sm font-medium">
                  {selectedTransfer.purpose}
                </p>
              </div>
              {selectedTransfer.approved_by_user && (
                <div>
                  <p className="text-sm text-gray-500">Disetujui oleh</p>
                  <p className="text-sm font-medium">
                    {selectedTransfer.approved_by_user.full_name}
                  </p>
                </div>
              )}
              {selectedTransfer.created_by_user && (
                <div>
                  <p className="text-sm text-gray-500">Dibuat oleh</p>
                  <p className="text-sm font-medium">
                    {selectedTransfer.created_by_user.full_name}
                  </p>
                </div>
              )}

              {selectedTransfer.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleApprove(selectedTransfer.id);
                      setShowDetailModal(false);
                    }}
                    disabled={processing}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Setujui
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      handleCancel(selectedTransfer.id);
                      setShowDetailModal(false);
                    }}
                    disabled={processing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Batalkan
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
