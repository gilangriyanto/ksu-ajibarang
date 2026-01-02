// pages/manager/kas/index.tsx
// Main page untuk manajemen kas dengan CRUD operations
// Bug-free with proper form validation and error handling

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Search, Eye, Users } from "lucide-react";
import { toast } from "sonner";
import { useCashAccounts } from "@/hooks/useCashAccounts";
import cashAccountsService, {
  CashAccount,
  CreateCashAccountData,
  UpdateCashAccountData,
} from "@/lib/api/cash-accounts.service";
import { ManagerLayout } from "@/components/layout/ManagerLayout";

export default function CashAccountsPage() {
  const navigate = useNavigate();

  // Hook
  const {
    cashAccounts,
    loading,
    createCashAccount,
    updateCashAccount,
    deleteCashAccount,
  } = useCashAccounts({ autoLoad: true });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CashAccount | null>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateCashAccountData>({
    code: "",
    name: "",
    type: "I",
    opening_balance: 0,
    description: "",
    is_active: true,
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filtered cash accounts
  const filteredAccounts = cashAccounts.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || account.type === typeFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && account.is_active) ||
      (statusFilter === "inactive" && !account.is_active);

    return matchesSearch && matchesType && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      type: "I",
      opening_balance: 0,
      description: "",
      is_active: true,
    });
    setFormErrors({});
    setEditingAccount(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code.trim()) {
      errors.code = "Kode kas wajib diisi";
    } else if (formData.code.length > 20) {
      errors.code = "Kode kas maksimal 20 karakter";
    }

    if (!formData.name.trim()) {
      errors.name = "Nama kas wajib diisi";
    } else if (formData.name.length > 100) {
      errors.name = "Nama kas maksimal 100 karakter";
    }

    if (!editingAccount && formData.opening_balance === undefined) {
      errors.opening_balance = "Saldo awal wajib diisi";
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = "Deskripsi maksimal 500 karakter";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (account: CashAccount) => {
    setEditingAccount(account);
    setFormData({
      code: account.code,
      name: account.name,
      type: account.type,
      description: account.description || "",
      is_active: account.is_active,
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Mohon lengkapi semua field yang diperlukan");
      return;
    }

    try {
      if (editingAccount) {
        const updateData: UpdateCashAccountData = {
          code: formData.code,
          name: formData.name,
          type: formData.type,
          description: formData.description,
          is_active: formData.is_active,
        };
        await updateCashAccount(editingAccount.id, updateData);
      } else {
        await createCashAccount(formData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeletingAccountId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingAccountId) {
      try {
        await deleteCashAccount(deletingAccountId);
        setIsDeleteDialogOpen(false);
        setDeletingAccountId(null);
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleViewDetail = (id: number) => {
    navigate(`/manager/kas/${id}`);
  };

  const deletingAccount = cashAccounts.find((acc) => acc.id === deletingAccountId);

  return (
    <ManagerLayout>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Kas</h1>
          <p className="text-muted-foreground">
            Kelola akun kas dan pengelolanya
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kas Baru
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Cari</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cari kode atau nama kas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type-filter">Tipe Kas</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="Semua tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="I">Kas Umum</SelectItem>
                  <SelectItem value="II">Kas Sosial</SelectItem>
                  <SelectItem value="III">Kas Pengadaan</SelectItem>
                  <SelectItem value="IV">Kas Hadiah</SelectItem>
                  <SelectItem value="V">Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kas</CardTitle>
          <CardDescription>Total {filteredAccounts.length} kas</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Memuat data...</div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                ? "Tidak ada kas yang sesuai dengan filter"
                : "Belum ada kas yang dibuat"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Kas</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Saldo Saat Ini</TableHead>
                  <TableHead className="text-center">Pengelola</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-mono">{account.code}</TableCell>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>
                      <Badge variant={cashAccountsService.getTypeBadgeColor(account.type)}>
                        {cashAccountsService.getTypeName(account.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {cashAccountsService.formatCurrency(account.current_balance)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetail(account.id)}>
                        <Users className="h-4 w-4 mr-1" />
                        {account.active_managers?.length || 0}
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={account.is_active ? "default" : "secondary"}>
                        {account.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(account.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(account)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteClick(account.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingAccount ? "Edit Kas" : "Tambah Kas Baru"}</DialogTitle>
            <DialogDescription>
              {editingAccount ? "Perbarui informasi kas" : "Masukkan informasi kas baru"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Kode Kas <span className="text-red-500">*</span></Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Contoh: KAS-I"
                maxLength={20}
              />
              {formErrors.code && <p className="text-sm text-red-500">{formErrors.code}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nama Kas <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Kas Umum"
                maxLength={100}
              />
              {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Tipe Kas <span className="text-red-500">*</span></Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Pilih tipe kas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="I">I - Kas Umum</SelectItem>
                  <SelectItem value="II">II - Kas Sosial</SelectItem>
                  <SelectItem value="III">III - Kas Pengadaan</SelectItem>
                  <SelectItem value="IV">IV - Kas Hadiah</SelectItem>
                  <SelectItem value="V">V - Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!editingAccount && (
              <div className="grid gap-2">
                <Label htmlFor="opening_balance">Saldo Awal <span className="text-red-500">*</span></Label>
                <Input
                  id="opening_balance"
                  type="number"
                  value={formData.opening_balance}
                  onChange={(e) =>
                    setFormData({ ...formData, opening_balance: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                  min="0"
                />
                {formErrors.opening_balance && (
                  <p className="text-sm text-red-500">{formErrors.opening_balance}</p>
                )}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi kas (opsional)"
                maxLength={500}
                rows={3}
              />
              {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Status Aktif</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Menyimpan..." : editingAccount ? "Perbarui" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kas?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus kas <strong>{deletingAccount?.name}</strong> ({deletingAccount?.code})? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingAccountId(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </ManagerLayout>
  );
}