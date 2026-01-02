// pages/manager/kas/[id].tsx
// Detail page with Manager Assignment feature
// Complete with 3 tabs: Info, Managers, Interest Rates

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ManagerLayout } from "@/components/layout/ManagerLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  UserPlus,
  UserMinus,
  Calendar,
  Mail,
  IdCard,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useCashAccounts } from "@/hooks/useCashAccounts";
import cashAccountsService, { CashAccount, Manager } from "@/lib/api/cash-accounts.service";
import { useAuth } from "@/contexts/AuthContext";

export default function CashAccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    getCashAccountById,
    getManagers,
    getAvailableManagers,
    assignManager,
    removeManager,
  } = useCashAccounts({ autoLoad: false });

  const [account, setAccount] = useState<CashAccount | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [availableManagers, setAvailableManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(null);
  const [removingManager, setRemovingManager] = useState<Manager | null>(null);

  // Form state for assign manager
  const [assignForm, setAssignForm] = useState({
    manager_id: "",
    assigned_at: new Date().toISOString().split("T")[0],
  });

  // Check if user is admin (from AuthContext)
  const isAdmin = user?.role === "admin";

  /**
   * Load cash account and managers
   */
  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Load account details
      const accountData = await getCashAccountById(parseInt(id));
      setAccount(accountData);

      // Load assigned managers
      const managersData = await getManagers(parseInt(id));
      setManagers(managersData);

    } catch (err: any) {
      console.error("Error loading data:", err);
      
      if (err.response?.status === 403) {
        setError("Anda tidak memiliki akses ke kas ini");
      } else if (err.response?.status === 404) {
        setError("Kas tidak ditemukan");
      } else {
        setError(err.message || "Gagal memuat data");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load available managers for assignment
   */
  const loadAvailableManagers = async () => {
    try {
      const data = await getAvailableManagers();
      setAvailableManagers(data);
    } catch (err: any) {
      console.error("Error loading available managers:", err);
      toast.error("Gagal memuat daftar manager");
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  /**
   * Open assign modal
   */
  const handleOpenAssignModal = async () => {
    await loadAvailableManagers();
    setAssignForm({
      manager_id: "",
      assigned_at: new Date().toISOString().split("T")[0],
    });
    setIsAssignModalOpen(true);
  };

  /**
   * Handle assign manager
   */
  const handleAssignManager = async () => {
    if (!assignForm.manager_id) {
      toast.error("Pilih manager terlebih dahulu");
      return;
    }

    if (!id) return;

    try {
      await assignManager(parseInt(id), {
        manager_id: parseInt(assignForm.manager_id),
        assigned_at: assignForm.assigned_at,
      });

      setIsAssignModalOpen(false);
      await loadData();
    } catch (err) {
      // Error already handled by hook
      console.error("Assign error:", err);
    }
  };

  /**
   * Open remove confirmation
   */
  const handleOpenRemoveDialog = (manager: Manager) => {
    setRemovingManager(manager);
    setIsRemoveDialogOpen(true);
  };

  /**
   * Confirm remove manager
   */
  const handleRemoveManager = async () => {
    if (!id || !removingManager) return;

    try {
      await removeManager(parseInt(id), removingManager.id);
      setIsRemoveDialogOpen(false);
      setRemovingManager(null);
      await loadData();
    } catch (err) {
      // Error already handled by hook
      console.error("Remove error:", err);
    }
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount: number | string) => {
    return cashAccountsService.formatCurrency(amount);
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  /**
   * Format datetime
   */
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Memuat data...</span>
        </div>
      </ManagerLayout>
    );
  }

  if (error) {
    return (
      <ManagerLayout>
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/manager/kas")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ManagerLayout>
    );
  }

  if (!account) {
    return (
      <ManagerLayout>
        <div className="text-center py-8">Data tidak ditemukan</div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/manager/kas")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {account.name}
              </h1>
              <p className="text-muted-foreground">
                Detail informasi kas
              </p>
            </div>
          </div>
          <Badge variant={account.is_active ? "default" : "secondary"}>
            {account.is_active ? "Aktif" : "Nonaktif"}
          </Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Saldo Pembukaan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(account.opening_balance)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Saldo Saat Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(account.current_balance)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Jumlah Pengelola
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {managers.length} Manager
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Informasi</TabsTrigger>
            <TabsTrigger value="managers">
              Pengelola ({managers.length})
            </TabsTrigger>
            <TabsTrigger value="rates">Suku Bunga</TabsTrigger>
          </TabsList>

          {/* TAB 1: INFO */}
          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Kas</CardTitle>
                <CardDescription>Detail lengkap akun kas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-600">Kode Kas</Label>
                    <p className="text-lg font-mono font-semibold">
                      {account.code}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Nama Kas</Label>
                    <p className="text-lg font-semibold">{account.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-600">Tipe Kas</Label>
                    <div className="mt-1">
                      <Badge variant={cashAccountsService.getTypeBadgeColor(account.type)}>
                        {cashAccountsService.getTypeName(account.type)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Status</Label>
                    <div className="mt-1">
                      <Badge variant={account.is_active ? "default" : "secondary"}>
                        {account.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {account.description && (
                  <div>
                    <Label className="text-gray-600">Deskripsi</Label>
                    <p className="text-gray-900 mt-1">{account.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                  <div>
                    <Label className="text-gray-600">Dibuat Pada</Label>
                    <p className="text-sm">{formatDateTime(account.created_at)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Terakhir Diupdate</Label>
                    <p className="text-sm">{formatDateTime(account.updated_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: MANAGERS (ASSIGNMENT FEATURE) ⭐⭐⭐ */}
          <TabsContent value="managers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pengelola Kas</CardTitle>
                    <CardDescription>
                      Manager yang ditugaskan mengelola kas ini
                    </CardDescription>
                  </div>
                  {isAdmin && (
                    <Button onClick={handleOpenAssignModal}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Tugaskan Manager
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {managers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Belum ada manager yang ditugaskan</p>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={handleOpenAssignModal}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Tugaskan Manager Pertama
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {managers.map((manager) => (
                      <div
                        key={manager.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {manager.full_name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {manager.full_name}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <IdCard className="h-3 w-3 mr-1" />
                                  {manager.employee_id}
                                </div>
                                {manager.email && (
                                  <div className="flex items-center">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {manager.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {manager.assigned_at && (
                            <div className="ml-13 mt-2 flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              Ditugaskan: {formatDate(manager.assigned_at)}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={manager.is_active ? "default" : "secondary"}>
                            {manager.is_active ? "Aktif" : "Nonaktif"}
                          </Badge>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleOpenRemoveDialog(manager)}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: INTEREST RATES */}
          <TabsContent value="rates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Suku Bunga</CardTitle>
                <CardDescription>
                  Informasi suku bunga simpanan dan pinjaman
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <Label className="text-gray-600">Bunga Simpanan</Label>
                    {account.current_savings_rate ? (
                      <div>
                        <p className="text-3xl font-bold text-green-600">
                          {account.current_savings_rate.rate_percentage}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Berlaku sejak:{" "}
                          {formatDate(account.current_savings_rate.effective_date)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 mt-2">Belum ditetapkan</p>
                    )}
                  </div>

                  <div className="p-4 border rounded-lg">
                    <Label className="text-gray-600">Bunga Pinjaman</Label>
                    {account.current_loan_rate ? (
                      <div>
                        <p className="text-3xl font-bold text-blue-600">
                          {account.current_loan_rate.rate_percentage}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Berlaku sejak:{" "}
                          {formatDate(account.current_loan_rate.effective_date)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 mt-2">Belum ditetapkan</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Assign Manager Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tugaskan Manager</DialogTitle>
            <DialogDescription>
              Pilih manager untuk mengelola kas ini
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="manager">
                Manager <span className="text-red-500">*</span>
              </Label>
              <Select
                value={assignForm.manager_id}
                onValueChange={(value) =>
                  setAssignForm({ ...assignForm, manager_id: value })
                }
              >
                <SelectTrigger id="manager">
                  <SelectValue placeholder="Pilih manager" />
                </SelectTrigger>
                <SelectContent>
                  {availableManagers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{manager.full_name}</span>
                        <span className="text-xs text-gray-500">
                          ({manager.employee_id})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assigned_at">Tanggal Penugasan</Label>
              <Input
                id="assigned_at"
                type="date"
                value={assignForm.assigned_at}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, assigned_at: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignModalOpen(false)}
            >
              Batal
            </Button>
            <Button onClick={handleAssignManager}>Tugaskan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Manager Confirmation */}
      <AlertDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Penugasan Manager?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus penugasan{" "}
              <strong>{removingManager?.full_name}</strong> dari kas ini?
              Manager tidak akan lagi bisa mengakses kas ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemovingManager(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveManager}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus Penugasan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ManagerLayout>
  );
}