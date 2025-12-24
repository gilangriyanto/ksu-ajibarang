// src/components/modals/JournalDetailModal.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Calendar,
  DollarSign,
  FileText,
  Lock,
  X,
  AlertCircle,
} from "lucide-react";
import { Journal } from "@/lib/api/journal.service";

interface JournalDetailModalProps {
  journal: Journal | null;
  isOpen: boolean;
  onClose: () => void;
}

function JournalDetailModal({
  journal,
  isOpen,
  onClose,
}: JournalDetailModalProps) {
  if (!journal) return null;

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount || 0);
  };

  const getJournalTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      general: "Jurnal Umum",
      special: "Jurnal Khusus",
      adjusting: "Jurnal Penyesuaian",
      closing: "Jurnal Penutup",
      reversing: "Jurnal Pembalik",
    };
    return typeMap[type] || type;
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Detail Jurnal
                </DialogTitle>
                <DialogDescription className="flex items-center space-x-2">
                  <span>{journal.journal_number}</span>
                  {getJournalTypeBadge(journal.journal_type)}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {journal.is_locked && (
                <Badge className="bg-gray-100 text-gray-800">
                  <Lock className="h-3 w-3 mr-1" />
                  Terkunci
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Journal Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Total Debit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(journal.total_debit)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Total Kredit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(journal.total_credit)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Status Saldo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    journal.is_balanced ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {journal.is_balanced ? "Balanced" : "Not Balanced"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Journal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Informasi Jurnal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Nomor Jurnal</p>
                    <p className="font-medium">{journal.journal_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Jenis Jurnal</p>
                    <p className="font-medium">
                      {getJournalTypeName(journal.journal_type)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Transaksi</p>
                    <p className="font-medium">
                      {new Date(journal.transaction_date).toLocaleDateString(
                        "id-ID"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dibuat Oleh</p>
                    <p className="font-medium">
                      {journal.creator?.full_name || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Periode Akuntansi</p>
                    <p className="font-medium">
                      {journal.accounting_period?.period_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="flex space-x-2">
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
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Deskripsi</p>
                    <p className="font-medium">
                      {journal.description || "Tidak ada deskripsi"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Journal Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Entri Jurnal</span>
              </CardTitle>
              <CardDescription>
                {journal.details?.length || 0} entri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Kode Akun
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Nama Akun
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Deskripsi
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">
                        Debit
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">
                        Kredit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {journal.details && journal.details.length > 0 ? (
                      journal.details.map((detail) => (
                        <tr
                          key={detail.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-medium">
                            {detail.chart_of_account?.code || "N/A"}
                          </td>
                          <td className="py-3 px-4">
                            {detail.chart_of_account?.name || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {detail.description || "-"}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-blue-600">
                            {parseFloat(detail.debit) > 0
                              ? formatCurrency(detail.debit)
                              : "-"}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-green-600">
                            {parseFloat(detail.credit) > 0
                              ? formatCurrency(detail.credit)
                              : "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-8 text-gray-500"
                        >
                          Tidak ada entri jurnal
                        </td>
                      </tr>
                    )}
                    {/* Total Row */}
                    {journal.details && journal.details.length > 0 && (
                      <tr className="bg-gray-100 font-bold">
                        <td colSpan={3} className="py-3 px-4 text-right">
                          TOTAL
                        </td>
                        <td className="py-3 px-4 text-right text-blue-600">
                          {formatCurrency(journal.total_debit)}
                        </td>
                        <td className="py-3 px-4 text-right text-green-600">
                          {formatCurrency(journal.total_credit)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Balance Status */}
          <Card
            className={
              journal.is_balanced
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                {journal.is_balanced ? (
                  <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p
                    className={`text-sm font-medium ${
                      journal.is_balanced ? "text-green-900" : "text-red-900"
                    }`}
                  >
                    {journal.is_balanced
                      ? "Jurnal Balanced"
                      : "Jurnal Tidak Balanced"}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      journal.is_balanced ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {journal.is_balanced
                      ? "Total debit dan kredit sudah seimbang. Jurnal ini valid."
                      : `Selisih: ${formatCurrency(
                          Math.abs(
                            parseFloat(journal.total_debit) -
                              parseFloat(journal.total_credit)
                          )
                        )}. Periksa kembali entri jurnal.`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default JournalDetailModal;
