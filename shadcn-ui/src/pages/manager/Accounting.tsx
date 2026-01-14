import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Download,
  BookOpen,
  Lock,
  TrendingUp,
  Calculator,
  Loader2,
  FileText,
  ArrowLeft,
  Zap,
} from "lucide-react";
import journalService from "@/lib/api/journal.service";
import chartOfAccountsService from "@/lib/api/chartOfAccounts.service";
import { toast } from "sonner";

// Import types separately
import type { Journal, JournalDetail } from "@/lib/api/journal.service";
import type { ChartOfAccount } from "@/lib/api/chartOfAccounts.service";

// =====================================================
// MODAL: Add/Edit Journal (KEEP SAME)
// =====================================================
const JournalFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  journal,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  journal?: Journal | null;
}) => {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [formData, setFormData] = useState({
    journal_type: "general" as Journal["journal_type"],
    description: "",
    transaction_date: "",
    accounting_period_id: undefined as number | undefined,
  });
  const [entries, setEntries] = useState<
    Array<{
      chart_of_account_id: number;
      debit: string;
      credit: string;
      description: string;
    }>
  >([
    { chart_of_account_id: 0, debit: "0", credit: "0", description: "" },
    { chart_of_account_id: 0, debit: "0", credit: "0", description: "" },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
    }

    if (journal) {
      setFormData({
        journal_type: journal.journal_type,
        description: journal.description,
        transaction_date: journal.transaction_date.split("T")[0],
        accounting_period_id: journal.accounting_period_id || undefined,
      });

      setEntries(
        journal.details.map((detail) => ({
          chart_of_account_id: detail.chart_of_account_id,
          debit: detail.debit,
          credit: detail.credit,
          description: detail.description || "",
        }))
      );
    } else {
      setFormData({
        journal_type: "general",
        description: "",
        transaction_date: "",
        accounting_period_id: undefined,
      });
      setEntries([
        { chart_of_account_id: 0, debit: "0", credit: "0", description: "" },
        { chart_of_account_id: 0, debit: "0", credit: "0", description: "" },
      ]);
    }
  }, [journal, isOpen]);

  const fetchAccounts = async () => {
    try {
      const data = await chartOfAccountsService.getAll({
        all: true,
        is_active: true,
      });
      setAccounts(data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Gagal memuat chart of accounts");
    }
  };

  const addEntry = () => {
    setEntries([
      ...entries,
      { chart_of_account_id: 0, debit: "0", credit: "0", description: "" },
    ]);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 2) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const updateEntry = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newEntries = [...entries];
    (newEntries[index] as any)[field] = value;
    setEntries(newEntries);
  };

  const totalDebit = entries.reduce(
    (sum, entry) => sum + parseFloat(entry.debit || "0"),
    0
  );
  const totalCredit = entries.reduce(
    (sum, entry) => sum + parseFloat(entry.credit || "0"),
    0
  );
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleSubmit = async () => {
    if (
      !formData.description ||
      !formData.transaction_date ||
      !isBalanced ||
      totalDebit === 0
    ) {
      toast.error("Lengkapi form dan pastikan jurnal balance");
      return;
    }

    if (entries.some((e) => e.chart_of_account_id === 0)) {
      toast.error("Pilih akun untuk semua entry");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        journal_type: formData.journal_type,
        description: formData.description,
        transaction_date: formData.transaction_date,
        accounting_period_id: formData.accounting_period_id,
        details: entries.map((entry) => ({
          chart_of_account_id: entry.chart_of_account_id,
          debit: parseFloat(entry.debit || "0"),
          credit: parseFloat(entry.credit || "0"),
          description: entry.description || undefined,
        })),
      };

      if (journal) {
        await journalService.update(journal.id, payload);
        toast.success("Jurnal berhasil diperbarui");
      } else {
        await journalService.create(payload);
        toast.success("Jurnal berhasil dibuat");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving journal:", error);
      toast.error(error.message || "Gagal menyimpan jurnal");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {journal ? "Edit Jurnal" : "Tambah Jurnal Manual"}
          </DialogTitle>
          <DialogDescription>
            {journal
              ? "Perbarui jurnal entry"
              : "Buat jurnal entry manual untuk transaksi khusus"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="journal-type" className="text-right">
              Jenis Jurnal
            </Label>
            <Select
              value={formData.journal_type}
              onValueChange={(value: Journal["journal_type"]) =>
                setFormData({ ...formData, journal_type: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Jurnal Umum</SelectItem>
                <SelectItem value="special">Jurnal Khusus</SelectItem>
                <SelectItem value="adjusting">Jurnal Penyesuaian</SelectItem>
                <SelectItem value="closing">Jurnal Penutup</SelectItem>
                <SelectItem value="reversing">Jurnal Pembalik</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="transaction-date" className="text-right">
              Tanggal <span className="text-red-500">*</span>
            </Label>
            <Input
              id="transaction-date"
              type="date"
              className="col-span-3"
              value={formData.transaction_date}
              onChange={(e) =>
                setFormData({ ...formData, transaction_date: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Deskripsi <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              className="col-span-3"
              placeholder="Deskripsi transaksi..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <Label className="font-medium">Detail Jurnal Entries:</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEntry}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Baris
              </Button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600 mb-2">
                <div className="col-span-4">Akun</div>
                <div className="col-span-2">Debit</div>
                <div className="col-span-2">Kredit</div>
                <div className="col-span-3">Keterangan</div>
                <div className="col-span-1">Aksi</div>
              </div>

              {entries.map((entry, index) => (
                <div key={index} className="grid grid-cols-12 gap-2">
                  <Select
                    value={entry.chart_of_account_id.toString()}
                    onValueChange={(value) =>
                      updateEntry(index, "chart_of_account_id", parseInt(value))
                    }
                  >
                    <SelectTrigger className="col-span-4">
                      <SelectValue placeholder="Pilih akun" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id.toString()}>
                          {acc.code} - {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    placeholder="0"
                    className="col-span-2"
                    value={entry.debit}
                    onChange={(e) =>
                      updateEntry(index, "debit", e.target.value)
                    }
                  />

                  <Input
                    type="number"
                    placeholder="0"
                    className="col-span-2"
                    value={entry.credit}
                    onChange={(e) =>
                      updateEntry(index, "credit", e.target.value)
                    }
                  />

                  <Input
                    placeholder="Keterangan..."
                    className="col-span-3"
                    value={entry.description}
                    onChange={(e) =>
                      updateEntry(index, "description", e.target.value)
                    }
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="col-span-1"
                    onClick={() => removeEntry(index)}
                    disabled={entries.length <= 2}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-gray-600">Total Debit: </span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(totalDebit)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Total Kredit: </span>
                  <span className="font-medium text-purple-600">
                    {formatCurrency(totalCredit)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Selisih: </span>
                  <span
                    className={`font-medium ${
                      isBalanced ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(Math.abs(totalDebit - totalCredit))}
                  </span>
                </div>
                <div>
                  {isBalanced ? (
                    <Badge className="bg-green-100 text-green-800">
                      ✓ Balance
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">
                      ✗ Tidak Balance
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !isBalanced}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Menyimpan...
              </>
            ) : journal ? (
              "Perbarui Jurnal"
            ) : (
              "Simpan Jurnal"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// =====================================================
// MODAL: View Journal Detail (KEEP SAME)
// =====================================================
const ViewJournalModal = ({
  isOpen,
  onClose,
  journal,
}: {
  isOpen: boolean;
  onClose: () => void;
  journal: Journal | null;
}) => {
  if (!journal) return null;

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount);
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Jurnal - {journal.journal_number}</DialogTitle>
          <DialogDescription>
            Rincian jurnal entry dan posting
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="font-medium text-gray-600">Nomor Jurnal:</Label>
              <p className="text-lg font-semibold">{journal.journal_number}</p>
            </div>
            <div>
              <Label className="font-medium text-gray-600">Jenis:</Label>
              <p className="text-lg">{journal.type_name}</p>
            </div>
            <div>
              <Label className="font-medium text-gray-600">Tanggal:</Label>
              <p>{formatDate(journal.transaction_date)}</p>
            </div>
            <div>
              <Label className="font-medium text-gray-600">Dibuat oleh:</Label>
              <p>{journal.creator.full_name}</p>
            </div>
          </div>

          <div>
            <Label className="font-medium">Deskripsi:</Label>
            <p className="mt-1 text-gray-700">{journal.description}</p>
          </div>

          <div>
            <Label className="font-medium text-lg mb-3 block">
              Detail Entries:
            </Label>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium">
                      Kode Akun
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium">
                      Nama Akun
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium">
                      Debit
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium">
                      Kredit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {journal.details.map((detail, index) => (
                    <tr key={index} className="border-t">
                      <td className="py-3 px-4 font-mono">
                        {detail.chart_of_account.code}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">
                            {detail.chart_of_account.name}
                          </p>
                          {detail.description && (
                            <p className="text-sm text-gray-500">
                              {detail.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-green-600">
                        {parseFloat(detail.debit) > 0
                          ? formatCurrency(detail.debit)
                          : "-"}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-purple-600">
                        {parseFloat(detail.credit) > 0
                          ? formatCurrency(detail.credit)
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td colSpan={2} className="py-3 px-4 font-medium">
                      Total
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-green-600">
                      {formatCurrency(journal.total_debit)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-purple-600">
                      {formatCurrency(journal.total_credit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="font-medium">Status:</Label>
              <div className="mt-1">
                {journal.is_locked ? (
                  <Badge className="bg-red-100 text-red-800">
                    <Lock className="w-3 h-3 mr-1" />
                    Locked
                  </Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800">
                    Unlocked
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <Label className="font-medium">Balance:</Label>
              <div className="mt-1">
                {journal.is_balanced ? (
                  <Badge className="bg-green-100 text-green-800">
                    ✓ Balanced
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">
                    ✗ Not Balanced
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// =====================================================
// MAIN COMPONENT - NEW UI
// =====================================================
export default function Accounting() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(false);
  const [formModal, setFormModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);

  useEffect(() => {
    fetchJournals();
  }, [selectedType]);

  const fetchJournals = async () => {
    try {
      setLoading(true);
      const data = await journalService.getAll({
        journal_type: selectedType === "all" ? undefined : selectedType,
      });
      setJournals(data);
    } catch (error) {
      console.error("Error fetching journals:", error);
      toast.error("Gagal memuat data jurnal");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (journal: Journal) => {
    if (journal.is_locked) {
      toast.error("Jurnal ini sudah di-lock dan tidak bisa diedit");
      return;
    }
    setSelectedJournal(journal);
    setFormModal(true);
  };

  const handleView = (journal: Journal) => {
    setSelectedJournal(journal);
    setViewModal(true);
  };

  const handleDelete = async (journal: Journal) => {
    if (journal.is_locked) {
      toast.error("Jurnal yang sudah di-lock tidak bisa dihapus");
      return;
    }

    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus jurnal "${journal.journal_number}"?`
      )
    ) {
      return;
    }

    try {
      await journalService.delete(journal.id);
      toast.success("Jurnal berhasil dihapus");
      fetchJournals();
    } catch (error: any) {
      console.error("Error deleting journal:", error);
      toast.error(error.message || "Gagal menghapus jurnal");
    }
  };

  const handleLock = async (journal: Journal) => {
    if (journal.is_locked) {
      toast.error("Jurnal sudah dalam status locked");
      return;
    }

    if (
      !confirm(
        `Lock jurnal "${journal.journal_number}"? Jurnal yang sudah di-lock tidak bisa diedit atau dihapus.`
      )
    ) {
      return;
    }

    try {
      await journalService.lock(journal.id);
      toast.success("Jurnal berhasil di-lock");
      fetchJournals();
    } catch (error: any) {
      console.error("Error locking journal:", error);
      toast.error(error.message || "Gagal lock jurnal");
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getJournalTypeColor = (type: string) => {
    const colors = {
      general: "bg-blue-100 text-blue-800",
      special: "bg-green-100 text-green-800",
      adjusting: "bg-purple-100 text-purple-800",
      closing: "bg-red-100 text-red-800",
      reversing: "bg-orange-100 text-orange-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleDownloadReport = () => {
    const csvContent = `Laporan Jurnal\nTanggal: ${new Date().toLocaleDateString(
      "id-ID"
    )}\n\nNo Jurnal,Tanggal,Jenis,Deskripsi,Debit,Kredit\n${journals
      .map(
        (j) =>
          `${j.journal_number},${formatDate(j.transaction_date)},${
            j.type_name
          },${j.description},${j.total_debit},${j.total_credit}`
      )
      .join("\n")}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `laporan-jurnal-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredJournals = journals.filter(
    (journal) =>
      journal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journal.journal_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Summary by type
  const summaryByType = {
    all: journals.length,
    general: journals.filter((j) => j.journal_type === "general").length,
    special: journals.filter((j) => j.journal_type === "special").length,
    adjusting: journals.filter((j) => j.journal_type === "adjusting").length,
    closing: journals.filter((j) => j.journal_type === "closing").length,
    reversing: journals.filter((j) => j.journal_type === "reversing").length,
  };

  const summary = {
    totalJournals: journals.length,
    totalDebit: journals.reduce((sum, j) => sum + parseFloat(j.total_debit), 0),
    totalCredit: journals.reduce(
      (sum, j) => sum + parseFloat(j.total_credit),
      0
    ),
    otomatis: journals.filter((j) => j.journal_type !== "general").length,
    manual: journals.filter((j) => j.journal_type === "general").length,
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/manager")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
        </div>

        {/* Title and Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sistem Jurnal</h1>
            <p className="text-gray-600 text-sm mt-1">
              Kelola semua jenis jurnal akuntansi dengan otomatisasi
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Zap className="w-4 h-4" />
              Generate Auto Jurnal
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadReport}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              className="bg-gray-900 hover:bg-gray-800 gap-2"
              onClick={() => {
                setSelectedJournal(null);
                setFormModal(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Jurnal Manual
            </Button>
          </div>
        </div>

        {/* Summary Cards - Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Total Jurnal</p>
              <p className="text-3xl font-bold text-gray-900">
                {summary.totalJournals}
              </p>
              <p className="text-xs text-gray-500 mt-1">Entries</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Total Debit</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalDebit).replace("Rp", "Rp ")}
              </p>
              <p className="text-xs text-gray-500 mt-1">Sisi debit</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Total Kredit</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(summary.totalCredit).replace("Rp", "Rp ")}
              </p>
              <p className="text-xs text-gray-500 mt-1">Sisi kredit</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Jurnal Otomatis</p>
              <p className="text-3xl font-bold text-orange-600">
                {summary.otomatis}
              </p>
              <p className="text-xs text-gray-500 mt-1">System generated</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Jurnal Manual</p>
              <p className="text-3xl font-bold text-red-600">
                {summary.manual}
              </p>
              <p className="text-xs text-gray-500 mt-1">Manual entries</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs
          value={selectedType}
          onValueChange={setSelectedType}
          className="w-full"
        >
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0">
            <TabsTrigger
              value="all"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
            >
              Semua Jurnal
            </TabsTrigger>
            <TabsTrigger
              value="general"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
            >
              Jurnal Umum
            </TabsTrigger>
            <TabsTrigger
              value="special"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
            >
              Jurnal Khusus
            </TabsTrigger>
            <TabsTrigger
              value="adjusting"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
            >
              Jurnal Penyesuaian
            </TabsTrigger>
            <TabsTrigger
              value="closing"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
            >
              Jurnal Penutup
            </TabsTrigger>
            <TabsTrigger
              value="reversing"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
            >
              Jurnal Pembalik
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedType} className="mt-6">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <CardTitle>Daftar Jurnal</CardTitle>
                  </div>
                  <p className="text-sm text-gray-500">
                    Semua jurnal yang dibuat secara otomatis dan manual
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Search */}
                <div className="mb-6">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cari jurnal..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Table */}
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-600">Memuat data...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                            Tanggal
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                            Referensi
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                            Deskripsi
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                            Jenis
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                            Sumber
                          </th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">
                            Debit
                          </th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">
                            Kredit
                          </th>
                          <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">
                            Status
                          </th>
                          <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredJournals.map((journal) => (
                          <tr
                            key={journal.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="py-4 px-4 text-sm">
                              {formatDate(journal.transaction_date)}
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-mono text-sm font-medium">
                                {journal.journal_number}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium text-sm">
                                  {journal.description}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {journal.details.length} akun terlibat
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge
                                className={getJournalTypeColor(
                                  journal.journal_type
                                )}
                              >
                                {journal.type_name}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <Badge
                                className={
                                  journal.journal_type === "general"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }
                              >
                                {journal.journal_type === "general"
                                  ? "Manual"
                                  : "Simpanan"}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-right font-medium text-green-600 text-sm">
                              {formatCurrency(journal.total_debit).replace(
                                "Rp",
                                "Rp "
                              )}
                            </td>
                            <td className="py-4 px-4 text-right font-medium text-purple-600 text-sm">
                              {formatCurrency(journal.total_credit).replace(
                                "Rp",
                                "Rp "
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <Badge className="bg-green-100 text-green-800">
                                Posted
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex justify-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleView(journal)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {!journal.is_locked && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEdit(journal)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleLock(journal)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Lock className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDelete(journal)}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {filteredJournals.length === 0 && !loading && (
                      <div className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          Belum ada data
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Belum ada jurnal yang terdaftar
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <JournalFormModal
        isOpen={formModal}
        onClose={() => {
          setFormModal(false);
          setSelectedJournal(null);
        }}
        onSuccess={fetchJournals}
        journal={selectedJournal}
      />
      <ViewJournalModal
        isOpen={viewModal}
        onClose={() => {
          setViewModal(false);
          setSelectedJournal(null);
        }}
        journal={selectedJournal}
      />
    </ManagerLayout>
  );
}
