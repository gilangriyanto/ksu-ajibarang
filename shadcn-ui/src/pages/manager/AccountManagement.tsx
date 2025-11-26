import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Download,
  Building,
  CreditCard,
  Wallet,
  TrendingUp,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  chartOfAccountsService,
  type ChartOfAccount,
  type CreateCOARequest,
} from "@/lib/api/chartOfAccounts.service";
import { toast } from "sonner";

// =====================================================
// MODAL: Add/Edit Account
// =====================================================
const AccountFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  account,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  account?: ChartOfAccount | null;
}) => {
  const [formData, setFormData] = useState<CreateCOARequest>({
    code: "",
    name: "",
    category: "assets",
    account_type: "",
    is_debit: true,
    is_active: true,
    description: "",
  });
  const [loading, setLoading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (account) {
      setFormData({
        code: account.code,
        name: account.name,
        category: account.category,
        account_type: account.account_type,
        is_debit: account.is_debit,
        is_active: account.is_active,
        description: account.description || "",
      });
    } else {
      setFormData({
        code: "",
        name: "",
        category: "assets",
        account_type: "",
        is_debit: true,
        is_active: true,
        description: "",
      });
    }
  }, [account]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (account) {
        // Update existing
        await chartOfAccountsService.update(account.id, formData);
        toast.success("Akun berhasil diupdate");
      } else {
        // Create new
        await chartOfAccountsService.create(formData);
        toast.success("Akun berhasil ditambahkan");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving account:", error);
      toast.error(error.message || "Gagal menyimpan akun");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {account ? "Edit Akun" : "Tambah Akun Baru"}
          </DialogTitle>
          <DialogDescription>
            {account
              ? "Update informasi akun"
              : "Masukkan informasi akun baru untuk chart of accounts"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account-code" className="text-right">
              Kode Akun *
            </Label>
            <Input
              id="account-code"
              className="col-span-3"
              placeholder="1-101"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account-name" className="text-right">
              Nama Akun *
            </Label>
            <Input
              id="account-name"
              className="col-span-3"
              placeholder="Kas Umum"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Kategori *
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value: any) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assets">Assets (Aktiva)</SelectItem>
                <SelectItem value="liabilities">
                  Liabilities (Kewajiban)
                </SelectItem>
                <SelectItem value="equity">Equity (Modal)</SelectItem>
                <SelectItem value="revenue">Revenue (Pendapatan)</SelectItem>
                <SelectItem value="expenses">Expenses (Beban)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account-type" className="text-right">
              Tipe Akun *
            </Label>
            <Input
              id="account-type"
              className="col-span-3"
              placeholder="Cash, Bank, Receivables, dll"
              value={formData.account_type}
              onChange={(e) =>
                setFormData({ ...formData, account_type: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="is-debit" className="text-right">
              Posisi Normal *
            </Label>
            <Select
              value={formData.is_debit.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, is_debit: value === "true" })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Debit</SelectItem>
                <SelectItem value="false">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="is-active" className="text-right">
              Status *
            </Label>
            <Select
              value={formData.is_active?.toString() || "true"}
              onValueChange={(value) =>
                setFormData({ ...formData, is_active: value === "true" })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Aktif</SelectItem>
                <SelectItem value="false">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Deskripsi
            </Label>
            <Textarea
              id="description"
              className="col-span-3"
              placeholder="Deskripsi akun (opsional)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              !formData.code ||
              !formData.name ||
              !formData.account_type
            }
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Menyimpan...
              </>
            ) : account ? (
              "Update Akun"
            ) : (
              "Tambah Akun"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// =====================================================
// MODAL: View Detail
// =====================================================
const ViewAccountModal = ({
  isOpen,
  onClose,
  account,
}: {
  isOpen: boolean;
  onClose: () => void;
  account: ChartOfAccount | null;
}) => {
  if (!account) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Detail Akun</DialogTitle>
          <DialogDescription>
            Informasi lengkap akun {account.code}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="font-medium text-gray-600">Kode:</Label>
              <p className="text-lg font-mono font-bold">{account.code}</p>
            </div>
            <div className="col-span-2">
              <Label className="font-medium text-gray-600">Nama:</Label>
              <p className="text-lg font-medium">{account.name}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium text-gray-600">Kategori:</Label>
              <p className="capitalize">{account.category}</p>
            </div>
            <div>
              <Label className="font-medium text-gray-600">Tipe:</Label>
              <p>{account.account_type}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium text-gray-600">
                Posisi Normal:
              </Label>
              <Badge
                className={
                  account.is_debit
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }
              >
                {account.is_debit ? "Debit" : "Credit"}
              </Badge>
            </div>
            <div>
              <Label className="font-medium text-gray-600">Status:</Label>
              <Badge
                className={
                  account.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {account.is_active ? "Aktif" : "Tidak Aktif"}
              </Badge>
            </div>
          </div>
          {account.description && (
            <div>
              <Label className="font-medium text-gray-600">Deskripsi:</Label>
              <p className="text-sm text-gray-700 mt-1">
                {account.description}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div>
              <Label className="font-medium">Created:</Label>
              <p>{new Date(account.created_at).toLocaleDateString("id-ID")}</p>
            </div>
            <div>
              <Label className="font-medium">Updated:</Label>
              <p>{new Date(account.updated_at).toLocaleDateString("id-ID")}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================
export default function AccountManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // For API search
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [formModal, setFormModal] = useState(false);
  const [viewAccountModal, setViewAccountModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | null>(
    null
  );
  const [editAccount, setEditAccount] = useState<ChartOfAccount | null>(null);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [summary, setSummary] = useState({
    assets: 0,
    liabilities: 0,
    equity: 0,
    revenue: 0,
    expenses: 0,
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch accounts with server-side filtering
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        per_page: perPage,
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedCategory !== "all") params.category = selectedCategory;

      const data = await chartOfAccountsService.getAll(params);
      setAccounts(data);

      // Note: Backend should return meta with total pages
      // For now, we'll assume it's in the response
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Gagal memuat data akun");
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const data = await chartOfAccountsService.getSummary();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [currentPage, searchQuery, selectedCategory]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const getAccountTypeLabel = (category: string) => {
    const labels: Record<string, string> = {
      assets: "Aktiva",
      liabilities: "Kewajiban",
      equity: "Modal",
      revenue: "Pendapatan",
      expenses: "Beban",
    };
    return labels[category] || category;
  };

  const getAccountTypeColor = (category: string) => {
    const colors: Record<string, string> = {
      assets: "bg-blue-100 text-blue-800",
      liabilities: "bg-red-100 text-red-800",
      equity: "bg-green-100 text-green-800",
      revenue: "bg-purple-100 text-purple-800",
      expenses: "bg-orange-100 text-orange-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const handleViewAccount = (account: ChartOfAccount) => {
    setSelectedAccount(account);
    setViewAccountModal(true);
  };

  const handleEditAccount = (account: ChartOfAccount) => {
    setEditAccount(account);
    setFormModal(true);
  };

  const handleAddNew = () => {
    setEditAccount(null);
    setFormModal(true);
  };

  const handleDeleteAccount = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus akun ini?")) return;

    try {
      await chartOfAccountsService.delete(id);
      toast.success("Akun berhasil dihapus");
      fetchAccounts();
      fetchSummary();
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(error.message || "Gagal menghapus akun");
    }
  };

  const handleDownloadReport = () => {
    const csvContent = `Kode,Nama,Kategori,Tipe,Posisi Normal,Status\n${accounts
      .map(
        (acc) =>
          `${acc.code},${acc.name},${acc.category},${acc.account_type},${
            acc.is_debit ? "Debit" : "Credit"
          },${acc.is_active ? "Aktif" : "Tidak Aktif"}`
      )
      .join("\n")}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `chart-of-accounts-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSuccess = () => {
    fetchAccounts();
    fetchSummary();
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Chart of Accounts
            </h1>
            <p className="text-gray-600 mt-1">Kelola bagan akun koperasi</p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleAddNew}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Akun
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Assets</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {summary.assets}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Liabilities
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {summary.liabilities}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Wallet className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Equity</p>
                  <p className="text-2xl font-bold text-green-600">
                    {summary.equity}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {summary.revenue}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Expenses</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {summary.expenses}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari kode, nama, atau tipe akun..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    <SelectItem value="assets">Assets</SelectItem>
                    <SelectItem value="liabilities">Liabilities</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="expenses">Expenses</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={handleDownloadReport}
                  disabled={accounts.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accounts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Akun</CardTitle>
            <CardDescription>
              Menampilkan {accounts.length} akun
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Memuat data...</span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Kode
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Nama Akun
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Kategori
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Tipe
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Posisi
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((account) => (
                        <tr
                          key={account.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-mono font-medium">
                            {account.code}
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-900">
                            {account.name}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={getAccountTypeColor(account.category)}
                            >
                              {getAccountTypeLabel(account.category)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {account.account_type}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                account.is_debit
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }
                            >
                              {account.is_debit ? "Debit" : "Credit"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                account.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {account.is_active ? "Aktif" : "Tidak Aktif"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewAccount(account)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditAccount(account)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteAccount(account.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {accounts.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Belum ada data
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchQuery || selectedCategory !== "all"
                          ? "Tidak ada akun yang sesuai dengan filter"
                          : "Belum ada akun yang terdaftar"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {accounts.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                      Halaman {currentPage} dari {totalPages || 1}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={accounts.length < perPage}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AccountFormModal
        isOpen={formModal}
        onClose={() => {
          setFormModal(false);
          setEditAccount(null);
        }}
        onSuccess={handleSuccess}
        account={editAccount}
      />
      <ViewAccountModal
        isOpen={viewAccountModal}
        onClose={() => setViewAccountModal(false)}
        account={selectedAccount}
      />
    </ManagerLayout>
  );
}
