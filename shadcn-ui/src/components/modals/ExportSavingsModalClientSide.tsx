import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Download,
  FileSpreadsheet,
  Calendar,
  Filter,
  Loader2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Saving } from "@/lib/api/savings.service";

interface ExportSavingsModalClientSideProps {
  isOpen: boolean;
  onClose: () => void;
  savings: Saving[]; // Pass all savings data from parent
}

type ExportType = "all" | "month" | "year" | "type" | "custom";

/**
 * CLIENT-SIDE EXPORT MODAL
 * This generates Excel/CSV from the savings data already loaded in memory
 * Use this if backend export endpoint is not available
 */
export function ExportSavingsModalClientSide({
  isOpen,
  onClose,
  savings,
}: ExportSavingsModalClientSideProps) {
  const [exportType, setExportType] = useState<ExportType>("all");
  const [exporting, setExporting] = useState(false);
  const [fileFormat, setFileFormat] = useState<"csv" | "xlsx">("csv");

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  ); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedSavingsType, setSelectedSavingsType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filterSavings = (): Saving[] => {
    let filtered = [...savings];

    switch (exportType) {
      case "month": {
        const [year, month] = selectedMonth.split("-").map(Number);
        filtered = filtered.filter((s) => {
          const date = new Date(s.transaction_date || s.created_at);
          return date.getMonth() + 1 === month && date.getFullYear() === year;
        });
        break;
      }

      case "year": {
        filtered = filtered.filter((s) => {
          const date = new Date(s.transaction_date || s.created_at);
          return date.getFullYear() === selectedYear;
        });
        break;
      }

      case "type": {
        if (selectedSavingsType !== "all") {
          filtered = filtered.filter(
            (s) => (s.savings_type || s.saving_type) === selectedSavingsType
          );
        }
        break;
      }

      case "custom": {
        const [customYear, customMonth] = selectedMonth.split("-").map(Number);

        if (customMonth && customYear) {
          filtered = filtered.filter((s) => {
            const date = new Date(s.transaction_date || s.created_at);
            return (
              date.getMonth() + 1 === customMonth &&
              date.getFullYear() === customYear
            );
          });
        }

        if (selectedSavingsType !== "all") {
          filtered = filtered.filter(
            (s) => (s.savings_type || s.saving_type) === selectedSavingsType
          );
        }

        if (selectedStatus !== "all") {
          filtered = filtered.filter((s) => s.status === selectedStatus);
        }
        break;
      }
    }

    return filtered;
  };

  const exportToCSV = (data: Saving[], filename: string) => {
    // CSV Headers
    const headers = [
      "ID",
      "Nama Anggota",
      "Employee ID",
      "Jenis Simpanan",
      "Jumlah",
      "Bunga %",
      "Saldo Akhir",
      "Tanggal Transaksi",
      "Status",
      "Catatan",
      "Tanggal Input",
    ];

    // CSV Rows
    const rows = data.map((s) => [
      s.id,
      s.user?.full_name || s.user_name || "-",
      s.user?.employee_id || s.user_code || "-",
      getSavingsTypeText(s.savings_type || s.saving_type || ""),
      parseFloat(s.amount?.toString() || "0"),
      s.interest_percentage || 0,
      parseFloat(s.final_amount?.toString() || s.balance?.toString() || "0"),
      s.transaction_date || "-",
      getStatusText(s.status),
      s.notes || "-",
      new Date(s.created_at).toLocaleDateString("id-ID"),
    ]);

    // Generate CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getSavingsTypeText = (type: string): string => {
    const types: Record<string, string> = {
      mandatory: "Simpanan Wajib",
      voluntary: "Simpanan Sukarela",
      principal: "Simpanan Pokok",
      holiday: "Simpanan Hari Raya",
    };
    return types[type] || type;
  };

  const getStatusText = (status: string): string => {
    const statuses: Record<string, string> = {
      approved: "Disetujui",
      pending: "Pending",
      rejected: "Ditolak",
    };
    return statuses[status] || status;
  };

  const handleExport = async () => {
    try {
      setExporting(true);

      if (exportType === "type" && selectedSavingsType === "all") {
        toast.error("Pilih jenis simpanan terlebih dahulu");
        setExporting(false);
        return;
      }

      const filteredData = filterSavings();

      if (filteredData.length === 0) {
        toast.error("Tidak ada data untuk diexport dengan filter yang dipilih");
        setExporting(false);
        return;
      }

      console.log(`📥 Exporting ${filteredData.length} savings records...`);

      let filename: string;

      switch (exportType) {
        case "all": {
          filename = `simpanan-semua-${new Date().toISOString().split("T")[0]}`;
          break;
        }
        case "month": {
          const [year, month] = selectedMonth.split("-");
          filename = `simpanan-${month}-${year}`;
          break;
        }
        case "year": {
          filename = `simpanan-tahun-${selectedYear}`;
          break;
        }
        case "type": {
          filename = `simpanan-${selectedSavingsType}-${
            new Date().toISOString().split("T")[0]
          }`;
          break;
        }
        case "custom": {
          filename = `simpanan-custom-${
            new Date().toISOString().split("T")[0]
          }`;
          break;
        }
        default: {
          filename = `simpanan-export-${
            new Date().toISOString().split("T")[0]
          }`;
        }
      }

      if (fileFormat === "csv") {
        exportToCSV(filteredData, filename);
      } else {
        // For XLSX, you would need a library like xlsx or exceljs
        toast.info(
          "Format XLSX memerlukan library tambahan. Menggunakan CSV..."
        );
        exportToCSV(filteredData, filename);
      }

      toast.success(
        `${
          filteredData.length
        } data berhasil diexport sebagai ${fileFormat.toUpperCase()}`
      );
      console.log("✅ Export completed:", filename);

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error("❌ Error exporting:", error);
      toast.error("Gagal export data. Silakan coba lagi.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            <span>Export Data Simpanan</span>
          </DialogTitle>
          <DialogDescription>
            Export data simpanan yang tersedia di halaman ini (Total:{" "}
            {savings.length} data)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Format Selection */}
          <div className="space-y-2">
            <Label>Format File</Label>
            <Select
              value={fileFormat}
              onValueChange={(v) => setFileFormat(v as "csv" | "xlsx")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Recommended)</SelectItem>
                <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Filter Data</Label>
            <RadioGroup
              value={exportType}
              onValueChange={(value) => setExportType(value as ExportType)}
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="all" id="export-all" />
                <Label htmlFor="export-all" className="flex-1 cursor-pointer">
                  <div className="font-medium">Export Semua Data</div>
                  <div className="text-sm text-gray-500">
                    {savings.length} data simpanan
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="month" id="export-month" />
                <Label htmlFor="export-month" className="flex-1 cursor-pointer">
                  <div className="font-medium">Export per Bulan</div>
                  <div className="text-sm text-gray-500">
                    Filter berdasarkan bulan tertentu
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="year" id="export-year" />
                <Label htmlFor="export-year" className="flex-1 cursor-pointer">
                  <div className="font-medium">Export per Tahun</div>
                  <div className="text-sm text-gray-500">
                    Filter berdasarkan tahun tertentu
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="type" id="export-type" />
                <Label htmlFor="export-type" className="flex-1 cursor-pointer">
                  <div className="font-medium">Export per Jenis Simpanan</div>
                  <div className="text-sm text-gray-500">
                    Filter berdasarkan jenis simpanan
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="custom" id="export-custom" />
                <Label
                  htmlFor="export-custom"
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium">Export Custom</div>
                  <div className="text-sm text-gray-500">
                    Kombinasi multiple filter
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Filter Options */}
          {exportType === "month" && (
            <div className="space-y-2">
              <Label htmlFor="month-filter">Pilih Bulan</Label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Input
                  id="month-filter"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          )}

          {exportType === "year" && (
            <div className="space-y-2">
              <Label htmlFor="year-filter">Pilih Tahun</Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger id="year-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: 5 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {exportType === "type" && (
            <div className="space-y-2">
              <Label htmlFor="type-filter">Pilih Jenis Simpanan</Label>
              <Select
                value={selectedSavingsType}
                onValueChange={setSelectedSavingsType}
              >
                <SelectTrigger id="type-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  <SelectItem value="mandatory">Simpanan Wajib</SelectItem>
                  <SelectItem value="voluntary">Simpanan Sukarela</SelectItem>
                  <SelectItem value="principal">Simpanan Pokok</SelectItem>
                  <SelectItem value="holiday">Simpanan Hari Raya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {exportType === "custom" && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center space-x-2 mb-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <Label className="font-medium">Filter Kustom</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-month">Periode (Opsional)</Label>
                <Input
                  id="custom-month"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-type">Jenis Simpanan</Label>
                <Select
                  value={selectedSavingsType}
                  onValueChange={setSelectedSavingsType}
                >
                  <SelectTrigger id="custom-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    <SelectItem value="mandatory">Simpanan Wajib</SelectItem>
                    <SelectItem value="voluntary">Simpanan Sukarela</SelectItem>
                    <SelectItem value="principal">Simpanan Pokok</SelectItem>
                    <SelectItem value="holiday">Simpanan Hari Raya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-status">Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger id="custom-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="approved">Disetujui</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900">
              Export menggunakan data yang sudah dimuat di halaman ini. File
              akan diunduh dalam format {fileFormat.toUpperCase()}.
            </AlertDescription>
          </Alert>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={exporting}>
            Batal
          </Button>
          <Button
            onClick={handleExport}
            disabled={
              exporting ||
              (exportType === "type" && selectedSavingsType === "all")
            }
            className="bg-green-600 hover:bg-green-700"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mengexport...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export {fileFormat.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
