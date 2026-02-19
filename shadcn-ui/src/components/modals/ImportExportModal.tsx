// components/modals/ImportExportModal.tsx
// ✅ Uses backend endpoints:
//    POST /savings/import (formdata: file)
//    POST /loans/import (formdata: file)
//    GET  /savings/import/template (download xlsx)
//    GET  /loans/import/template (download xlsx)
//    GET  /savings/export?filters (download xlsx)
//    GET  /loans/export?filters (download xlsx)

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
  AlertCircle,
} from "lucide-react";
import apiClient from "@/lib/api/api-client";

// ==================== TYPES ====================

export interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** "savings" or "loans" */
  type: "savings" | "loans";
  onSuccess?: () => void;
}

interface ImportResult {
  success: boolean;
  message: string;
  imported_count?: number;
  failed_count?: number;
  errors?: Array<{ row: number; errors: string[] }>;
  data?: any;
}

// ==================== COMPONENT ====================

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  type,
  onSuccess,
}) => {
  const [step, setStep] = useState<"upload" | "importing" | "done">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>("");
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoans = type === "loans";
  const label = isLoans ? "Pinjaman" : "Simpanan";
  const basePath = isLoans ? "/loans" : "/savings";

  // ==================== RESET ====================

  const resetState = () => {
    setStep("upload");
    setFile(null);
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // ==================== DOWNLOAD TEMPLATE ====================

  const handleDownloadTemplate = async () => {
    try {
      setDownloading(true);
      setError("");

      const response = await apiClient.get(`${basePath}/import/template`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Template_Import_${label}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Error downloading template:", err);
      setError("Gagal download template. Pastikan endpoint tersedia.");
    } finally {
      setDownloading(false);
    }
  };

  // ==================== FILE SELECT ====================

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setError("");

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    const ext = selected.name.split(".").pop()?.toLowerCase();
    if (
      !validTypes.includes(selected.type) &&
      !["xlsx", "xls", "csv"].includes(ext || "")
    ) {
      setError("Format file tidak valid. Gunakan .xlsx, .xls, atau .csv");
      return;
    }

    // Validate file size (max 5MB)
    if (selected.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      return;
    }

    setFile(selected);
  };

  // ==================== UPLOAD / IMPORT ====================

  const handleImport = async () => {
    if (!file) return;

    setStep("importing");
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log(`📤 POST ${basePath}/import`, {
        fileName: file.name,
        size: file.size,
      });

      const response = await apiClient.post(`${basePath}/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Import response:", response.data);

      const data = response.data?.data || response.data;
      setResult({
        success: true,
        message: data?.message || response.data?.message || "Import berhasil",
        imported_count:
          data?.imported_count ??
          data?.success_count ??
          data?.total_imported ??
          0,
        failed_count: data?.failed_count ?? data?.error_count ?? 0,
        errors: data?.errors || data?.failed_rows || [],
        data,
      });

      setStep("done");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("❌ Import error:", err);

      const errData = err.response?.data || err.data;
      const errMsg = errData?.message || err.message || "Import gagal";
      const errors = errData?.errors || errData?.data?.errors || [];

      setResult({
        success: false,
        message: errMsg,
        imported_count: errData?.data?.imported_count || 0,
        failed_count: errData?.data?.failed_count || errors.length || 0,
        errors: Array.isArray(errors) ? errors : [],
      });

      setStep("done");
    }
  };

  // ==================== RENDER ====================

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Import Data {label}
          </DialogTitle>
          <DialogDescription>
            Upload file Excel untuk import data {label.toLowerCase()} secara
            massal
          </DialogDescription>
        </DialogHeader>

        {/* ==================== STEP: UPLOAD ==================== */}
        {step === "upload" && (
          <div className="space-y-4">
            {/* Step 1: Download Template */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    Langkah 1: Download Template
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Download template Excel dari server, isi data sesuai format
                    yang disediakan, lalu upload kembali.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                    onClick={handleDownloadTemplate}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {downloading ? "Mengunduh..." : "Download Template Excel"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Validation Info */}
            <div className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-600">
              <p className="font-medium text-gray-700 mb-1">
                Validasi otomatis:
              </p>
              {isLoans ? (
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>Anggota harus terdaftar dan aktif</li>
                  <li>Akun kas harus KAS-I atau KAS-III</li>
                  <li>Jumlah pinjaman minimal Rp 100.000</li>
                  <li>Tenor: 6-60 bulan</li>
                  <li>Format tanggal valid (YYYY-MM-DD)</li>
                </ul>
              ) : (
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>Anggota harus terdaftar dan aktif</li>
                  <li>Akun kas harus KAS-II</li>
                  <li>Jenis: principal, mandatory, voluntary, holiday</li>
                  <li>Jumlah minimal Rp 10.000</li>
                  <li>Otomatis approved & jurnal dibuat</li>
                </ul>
              )}
            </div>

            {/* Step 2: Upload File */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                file
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-green-700">
                      {file.name}
                    </p>
                    <p className="text-xs text-green-600">
                      {(file.size / 1024).toFixed(1)} KB — Siap diimport
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="ml-2"
                  >
                    <XCircle className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    Klik untuk upload file Excel
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Format: .xlsx, .xls, .csv (Maks 5MB)
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Actions */}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose}>
                Batal
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleImport}
                disabled={!file}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ==================== STEP: IMPORTING ==================== */}
        {step === "importing" && (
          <div className="py-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="font-medium text-gray-900">Mengimport data...</p>
            <p className="text-sm text-gray-500 mt-1">
              Mengirim file ke server untuk diproses
            </p>
          </div>
        )}

        {/* ==================== STEP: DONE ==================== */}
        {step === "done" && result && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="text-center py-4">
              {result.success && (result.failed_count || 0) === 0 ? (
                <>
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-lg font-semibold text-green-700">
                    Import Berhasil!
                  </p>
                </>
              ) : result.success ? (
                <>
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                  <p className="text-lg font-semibold text-yellow-700">
                    Import Selesai (Sebagian)
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                  <p className="text-lg font-semibold text-red-700">
                    Import Gagal
                  </p>
                </>
              )}

              <p className="text-sm text-gray-600 mt-1">{result.message}</p>

              <div className="flex justify-center gap-6 mt-4">
                {(result.imported_count ?? 0) > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {result.imported_count}
                    </p>
                    <p className="text-xs text-gray-500">Berhasil</p>
                  </div>
                )}
                {(result.failed_count ?? 0) > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {result.failed_count}
                    </p>
                    <p className="text-xs text-gray-500">Gagal</p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Details */}
            {result.errors && result.errors.length > 0 && (
              <div className="border border-red-200 rounded-lg max-h-[200px] overflow-y-auto">
                <div className="bg-red-50 px-3 py-2 text-xs font-medium text-red-700 sticky top-0">
                  Detail Error:
                </div>
                {result.errors.map((err: any, idx: number) => (
                  <div
                    key={idx}
                    className="px-3 py-2 text-xs border-t border-red-100"
                  >
                    <span className="font-medium text-red-600">
                      Baris {err.row || idx + 1}:
                    </span>{" "}
                    <span className="text-red-700">
                      {Array.isArray(err.errors)
                        ? err.errors.join(", ")
                        : String(err.errors || err.message || err)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Selesai
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ==================== EXPORT HELPER ====================

export const handleExportFromBackend = async (
  type: "savings" | "loans",
  filters?: Record<string, string>,
  label?: string,
) => {
  const basePath = type === "loans" ? "/loans" : "/savings";
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") params.append(key, value);
    });
  }

  const queryString = params.toString();
  const url = `${basePath}/export${queryString ? `?${queryString}` : ""}`;

  console.log(`📤 GET ${url}`);

  try {
    const response = await apiClient.get(url, {
      responseType: "blob",
      headers: {
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/json",
      },
    });

    // Check if response is actually an error (JSON) disguised as blob
    const contentType = response.headers?.["content-type"] || "";
    if (contentType.includes("application/json")) {
      // Server returned JSON error instead of file
      const text = await response.data.text();
      const json = JSON.parse(text);
      throw new Error(json.message || "Server mengembalikan error");
    }

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;

    const date = new Date().toISOString().split("T")[0];
    link.download = `Export_${label || (type === "loans" ? "Pinjaman" : "Simpanan")}_${date}.xlsx`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return true;
  } catch (err: any) {
    console.error("Export error:", err);

    // When responseType is 'blob', error response data is also a Blob
    // We need to read it as text to get the actual error message
    let errorMessage =
      "Gagal export data. Kemungkinan fitur export belum tersedia di server.";

    if (err.response?.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        const json = JSON.parse(text);
        errorMessage = json.message || json.error || errorMessage;
        console.error("Server error detail:", json);
      } catch {
        // Blob is not JSON, use default message
      }
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.message && !err.message.includes("status code")) {
      errorMessage = err.message;
    }

    throw new Error(errorMessage);
  }
};

export default ImportModal;
