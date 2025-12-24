// src/pages/kas/Accounting.tsx
import React, { useState, useEffect } from "react";
import { KasLayout } from "@/components/layout/KasLayout";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  Plus,
  Eye,
  Edit,
  Lock,
  Trash2,
  Download,
  RefreshCw,
  AlertCircle,
  Calendar,
  Filter,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import journalService, { Journal } from "@/lib/api/journal.service";
import { JournalAddModal } from "@/components/modals/JournalAddModal";
import JournalDetailModal from "@/components/modals/JournalDetailModal";
import { toast } from "sonner";

export default function KasAccounting() {
  const { user } = useAuth();
  const kasId = user?.kas_id || 1;

  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(false);
  const [journalType, setJournalType] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);

  // ✅ Load journals on mount
  useEffect(() => {
    loadJournals();
  }, [journalType, dateRange]);

  /**
   * Load journals from API
   */
  const loadJournals = async () => {
    setLoading(true);
    try {
      console.log("📖 Loading journals...");

      const params: any = {};

      if (journalType && journalType !== "all") {
        params.journal_type = journalType;
      }

      if (dateRange.start) {
        params.start_date = dateRange.start;
      }

      if (dateRange.end) {
        params.end_date = dateRange.end;
      }

      const data = await journalService.getAll(params);
      console.log("✅ Journals loaded:", data.length);

      setJournals(data);
    } catch (err: any) {
      console.error("❌ Error loading journals:", err);
      toast.error("Gagal memuat jurnal");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh journals
   */
  const refresh = async () => {
    await loadJournals();
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount || 0);
  };

  /**
   * Get journal type badge
   */
  const getJournalTypeBadge = (type: string) => {
    const typeMap = {
      general: { color: "bg-blue-100 text-blue-800", text: "Jurnal Umum" },
      special: {
        color: "bg-purple-100 text-purple-800",
        text: "Jurnal Khusus",
      },
      adjusting: {
        color: "bg-orange-100 text-orange-800",
        text: "Jurnal Penyesuaian",
      },
      closing: { color: "bg-red-100 text-red-800", text: "Jurnal Penutup" },
      reversing: {
        color: "bg-green-100 text-green-800",
        text: "Jurnal Pembalik",
      },
    };

    const config = typeMap[type as keyof typeof typeMap] || {
      color: "bg-gray-100 text-gray-800",
      text: type,
    };
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  /**
   * Handle view journal detail
   */
  const handleViewJournal = async (journal: Journal) => {
    try {
      // Load full journal detail with entries
      const fullJournal = await journalService.getById(journal.id);
      setSelectedJournal(fullJournal);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      console.error("❌ Error loading journal detail:", err);
      toast.error("Gagal memuat detail jurnal");
    }
  };

  /**
   * Handle lock journal
   */
  const handleLockJournal = async (journalId: number) => {
    if (
      !confirm(
        "Yakin ingin mengunci jurnal ini? Jurnal yang terkunci tidak dapat diubah."
      )
    ) {
      return;
    }

    try {
      await journalService.lock(journalId);
      toast.success("Jurnal berhasil dikunci");
      refresh();
    } catch (err: any) {
      console.error("❌ Error locking journal:", err);
      toast.error("Gagal mengunci jurnal");
    }
  };

  /**
   * Handle delete journal
   */
  const handleDeleteJournal = async (journalId: number) => {
    if (!confirm("Yakin ingin menghapus jurnal ini?")) {
      return;
    }

    try {
      await journalService.delete(journalId);
      toast.success("Jurnal berhasil dihapus");
      refresh();
    } catch (err: any) {
      console.error("❌ Error deleting journal:", err);
      toast.error("Gagal menghapus jurnal");
    }
  };

  /**
   * Handle export journals
   */
  const handleExport = () => {
    toast.info(`Mengekspor jurnal Kas ${kasId}`);
  };

  /**
   * Calculate totals
   */
  const totalDebit = journals.reduce(
    (sum, j) => sum + parseFloat(j.total_debit),
    0
  );
  const totalCredit = journals.reduce(
    (sum, j) => sum + parseFloat(j.total_credit),
    0
  );
  const isBalanced = totalDebit === totalCredit;

  // ✅ Loading state
  if (loading && journals.length === 0) {
    return (
      <KasLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Memuat jurnal...</span>
        </div>
      </KasLayout>
    );
  }

  return (
    <KasLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Jurnal Akuntansi
            </h1>
            <p className="text-gray-600">
              Kelola jurnal dan transaksi keuangan Kas {kasId}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Buat Jurnal
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Debit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalDebit)}
              </div>
              <p className="text-xs text-gray-500">Sisi Debit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Kredit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalCredit)}
              </div>
              <p className="text-xs text-gray-500">Sisi Kredit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Status Saldo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  isBalanced ? "text-green-600" : "text-red-600"
                }`}
              >
                {isBalanced ? "Seimbang" : "Tidak Seimbang"}
              </div>
              <p className="text-xs text-gray-500">
                Selisih: {formatCurrency(Math.abs(totalDebit - totalCredit))}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Jurnal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Jenis Jurnal
                </label>
                <Select value={journalType} onValueChange={setJournalType}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    <SelectItem value="general">Jurnal Umum</SelectItem>
                    <SelectItem value="special">Jurnal Khusus</SelectItem>
                    <SelectItem value="adjusting">
                      Jurnal Penyesuaian
                    </SelectItem>
                    <SelectItem value="closing">Jurnal Penutup</SelectItem>
                    <SelectItem value="reversing">Jurnal Pembalik</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tanggal Mulai
                </label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tanggal Akhir
                </label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - Journals Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Daftar Jurnal</span>
                </CardTitle>
                <CardDescription>
                  Menampilkan {journals.length} jurnal
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={refresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Jurnal</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Kredit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {journals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Tidak ada jurnal yang ditemukan
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    journals.map((journal) => (
                      <TableRow key={journal.id}>
                        <TableCell className="font-medium">
                          {journal.journal_number}
                        </TableCell>
                        <TableCell>
                          {getJournalTypeBadge(journal.journal_type)}
                        </TableCell>
                        <TableCell>
                          {new Date(
                            journal.transaction_date
                          ).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {journal.description}
                        </TableCell>
                        <TableCell className="text-right font-medium text-blue-600">
                          {formatCurrency(journal.total_debit)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(journal.total_credit)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            {journal.is_balanced ? (
                              <Badge className="bg-green-100 text-green-800">
                                Seimbang
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                Tidak Seimbang
                              </Badge>
                            )}
                            {journal.is_locked && (
                              <Badge className="bg-gray-100 text-gray-800">
                                <Lock className="h-3 w-3 mr-1" />
                                Terkunci
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewJournal(journal)}
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>

                            {!journal.is_locked && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLockJournal(journal.id)}
                                  className="h-8 w-8 p-0 hover:bg-orange-50"
                                  title="Kunci Jurnal"
                                >
                                  <Lock className="h-4 w-4 text-orange-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteJournal(journal.id)
                                  }
                                  className="h-8 w-8 p-0 hover:bg-red-50"
                                  title="Hapus Jurnal"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
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

        {/* Info Note */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Info Jurnal Akuntansi
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Menampilkan semua jurnal akuntansi dalam sistem. Untuk data
                  spesifik Kas {kasId}, gunakan filter atau chart of accounts
                  yang relevan dengan kas Anda.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <JournalAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={refresh}
      />

      <JournalDetailModal
        journal={selectedJournal}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedJournal(null);
        }}
      />
    </KasLayout>
  );
}
