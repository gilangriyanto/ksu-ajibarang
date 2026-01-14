import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import serviceAllowanceService, {
  ImportExcelResponse,
} from "@/lib/api/serviceAllowance.service";
import memberService from "@/lib/api/member.service";

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportExcelModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportExcelModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [activeMembers, setActiveMembers] = useState(0);
  const [importResult, setImportResult] = useState<ImportExcelResponse | null>(
    null
  );
  const [validationErrors, setValidationErrors] = useState<
    Array<{ row: number; messages: string[] }>
  >([]);

  // Fetch active members count
  useEffect(() => {
    const fetchActiveMembersCount = async () => {
      try {
        const members = await memberService.getMembers({
          all: true,
          status: "active",
        });
        setActiveMembers(Array.isArray(members) ? members.length : 0);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    if (isOpen) {
      fetchActiveMembersCount();
      // Reset states
      setSelectedFile(null);
      setImportResult(null);
      setValidationErrors([]);
    }
  }, [isOpen]);

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      console.log("📥 Downloading template...");

      const blob = await serviceAllowanceService.downloadTemplate();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `template-jasa-pelayanan-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Template berhasil diunduh");
      console.log("✅ Template downloaded successfully");
    } catch (error: any) {
      console.error("❌ Error downloading template:", error);
      toast.error(
        error.message || "Gagal mengunduh template. Silakan coba lagi."
      );
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-excel", // .xls
        "text/csv", // .csv
      ];

      if (!validTypes.includes(file.type)) {
        toast.error(
          "Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv"
        );
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("Ukuran file terlalu besar. Maksimal 5MB");
        return;
      }

      setSelectedFile(file);
      setImportResult(null); // Reset result when new file selected
      setValidationErrors([]); // Reset validation errors
      console.log("📄 File selected:", file.name);
    }
  };

  // ✅ FIXED: Improved error handling
  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Pilih file terlebih dahulu");
      return;
    }

    try {
      setUploading(true);
      setImportResult(null);
      setValidationErrors([]);

      console.log("📤 Uploading file:", selectedFile.name);

      const result = await serviceAllowanceService.importExcel(selectedFile);

      console.log("✅ Import result:", result);
      setImportResult(result);

      if (result.failed_count === 0) {
        toast.success(
          `Import berhasil! ${result.success_count} data berhasil diproses`
        );
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        toast.warning(
          `Import selesai dengan ${result.failed_count} error. Lihat detail di bawah.`
        );
      }
    } catch (error: any) {
      console.error("❌ Import error:", error);

      setImportResult(null);

      // ✅ FIX 1: Check for Network Errors first
      if (!error.data && !error.response) {
        console.log("🌐 Network error detected");
        toast.error(
          "Gagal mengunggah file. Periksa koneksi internet atau file sudah berubah."
        );
        setUploading(false);
        return;
      }

      // ✅ FIX 2: Get the actual response data
      const responseData = error.data;

      console.log("📋 Full error data:", responseData);

      // ✅ FIX 3: Handle Validation Errors (errors.errors structure)
      if (
        responseData?.errors?.errors &&
        Array.isArray(responseData.errors.errors)
      ) {
        console.log(
          "📋 Validation errors detected:",
          responseData.errors.errors
        );

        // Transform validation errors to match our state structure
        const transformedErrors = responseData.errors.errors.map(
          (err: any) => ({
            row: err.row,
            messages: err.messages || [],
          })
        );

        setValidationErrors(transformedErrors);
        toast.error(
          responseData.message ||
            "Validasi gagal. Perbaiki error pada file Excel."
        );
        setUploading(false);
        return;
      }

      // ✅ FIX 4: Handle Import Partial Success/Failure
      // Check if this is actually a partial success scenario
      if (responseData?.data?.results) {
        console.log("📋 Partial import result detected");
        setImportResult(responseData.data);

        if (responseData.data.failed_count > 0) {
          toast.warning(
            `Import selesai dengan ${responseData.data.failed_count} error. Lihat detail di bawah.`
          );
        }
        setUploading(false);
        return;
      }

      // ✅ FIX 5: Handle Generic Error Messages
      if (responseData?.message) {
        console.log("📋 Generic error message:", responseData.message);
        toast.error(responseData.message);
        setUploading(false);
        return;
      }

      // ✅ FIX 6: Fallback for Unknown Errors
      console.log("📋 Unknown error format, using fallback");
      toast.error(
        error.message ||
          "Gagal import data. Silakan coba lagi atau hubungi admin."
      );
    } finally {
      setUploading(false);
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Jasa Pelayanan dari Excel</DialogTitle>
          <DialogDescription>
            Upload file Excel untuk input jasa pelayanan secara massal (hanya
            anggota aktif)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Active Members Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Tersedia <strong>{activeMembers} anggota aktif</strong> untuk jasa
              pelayanan
            </AlertDescription>
          </Alert>

          {/* Template Section */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-start space-x-3">
              <FileSpreadsheet className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">Template Excel</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Unduh template Excel dengan data anggota aktif terkini
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  disabled={downloadingTemplate}
                >
                  {downloadingTemplate ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mengunduh...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Unduh Template
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-sm mb-3">Pilih File Excel</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="excel-file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="excel-file" className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <div className="flex items-center justify-center space-x-2">
                      <Upload className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {selectedFile
                          ? selectedFile.name
                          : "Klik untuk pilih file"}
                      </span>
                    </div>
                  </div>
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Format yang didukung: .xlsx, .xls, .csv (hanya anggota aktif
                akan diproses)
              </p>
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    Validasi gagal. Perbaiki error berikut:
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {validationErrors.map((error, index) => (
                      <div
                        key={index}
                        className="bg-red-50 rounded p-2 text-sm"
                      >
                        <p className="font-medium">Baris {error.row}:</p>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          {error.messages.map((msg, msgIndex) => (
                            <li key={msgIndex}>{msg}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Import Results */}
          {importResult && (
            <div className="space-y-3">
              {/* Success Summary */}
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <p className="font-medium text-green-900">
                    {importResult.success_count} dari{" "}
                    {importResult.total_processed} data berhasil diproses
                  </p>
                </AlertDescription>
              </Alert>

              {/* Success Details */}
              {importResult.results.success.length > 0 && (
                <div className="border rounded-lg p-4 bg-green-50 max-h-64 overflow-y-auto">
                  <h4 className="font-medium text-sm text-green-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Data Berhasil ({importResult.results.success.length})
                  </h4>
                  <div className="space-y-2">
                    {importResult.results.success.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white rounded p-2 text-sm border border-green-200"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              Baris {item.row}: {item.member}
                            </p>
                            <p className="text-gray-600">
                              Periode: {item.period} | Jumlah:{" "}
                              {formatCurrency(item.amount)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.summary}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failed Details */}
              {importResult.results.failed.length > 0 && (
                <div className="border rounded-lg p-4 bg-red-50 max-h-64 overflow-y-auto">
                  <h4 className="font-medium text-sm text-red-900 mb-2 flex items-center">
                    <XCircle className="h-4 w-4 mr-2" />
                    Data Gagal ({importResult.results.failed.length})
                  </h4>
                  <div className="space-y-2">
                    {importResult.results.failed.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white rounded p-2 text-sm border border-red-200"
                      >
                        <p className="font-medium text-gray-900">
                          Baris {item.row}
                          {item.user_id && ` (User ID: ${item.user_id})`}
                        </p>
                        <p className="text-red-600 text-xs mt-1">
                          {item.error}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            {importResult?.success_count > 0 && importResult?.failed_count === 0
              ? "Tutup"
              : "Batal"}
          </Button>
          <Button onClick={handleImport} disabled={!selectedFile || uploading}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mengimport...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
