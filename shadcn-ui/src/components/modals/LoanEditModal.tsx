import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  DollarSign,
  Calendar,
  User,
  FileText,
  Percent,
  Info,
} from "lucide-react";

// ✅ UPDATED: Loan interface with deduction method fields
interface Loan {
  id: string;
  memberNumber: string;
  memberName: string;
  amount: number;
  purpose: string;
  interestRate: number;
  termMonths: number;
  remainingAmount: number;
  monthlyPayment: number;
  status: string;
  approvalDate: string;
  nextPaymentDate: string;
  // ✅ NEW: Deduction Method fields
  deduction_method?: "none" | "salary" | "service_allowance" | "mixed";
  salary_deduction_percentage?: number;
  service_allowance_deduction_percentage?: number;
}

interface LoanEditModalProps {
  loan: Loan | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (loan: Loan) => void;
}

export function LoanEditModal({
  loan,
  isOpen,
  onClose,
  onSave,
}: LoanEditModalProps) {
  const [formData, setFormData] = useState<Partial<Loan>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (loan) {
      setFormData({
        ...loan,
        // ✅ Set default deduction method if not exist
        deduction_method: loan.deduction_method || "none",
        salary_deduction_percentage: loan.salary_deduction_percentage || 0,
        service_allowance_deduction_percentage:
          loan.service_allowance_deduction_percentage || 0,
      });
    }
  }, [loan]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Jumlah pinjaman harus lebih dari 0";
    }

    if (!formData.purpose?.trim()) {
      newErrors.purpose = "Tujuan pinjaman harus diisi";
    }

    if (!formData.interestRate || formData.interestRate <= 0) {
      newErrors.interestRate = "Suku bunga harus lebih dari 0";
    }

    if (!formData.termMonths || formData.termMonths <= 0) {
      newErrors.termMonths = "Jangka waktu harus lebih dari 0";
    }

    if (!formData.status) {
      newErrors.status = "Status harus dipilih";
    }

    // ✅ NEW: Validate deduction method
    if (!formData.deduction_method) {
      newErrors.deduction_method = "Metode potongan harus dipilih";
    }

    // ✅ NEW: Validate salary deduction percentage
    if (
      formData.deduction_method === "salary" ||
      formData.deduction_method === "mixed"
    ) {
      if (
        !formData.salary_deduction_percentage ||
        formData.salary_deduction_percentage <= 0 ||
        formData.salary_deduction_percentage > 100
      ) {
        newErrors.salary_deduction_percentage =
          "Persentase potongan gaji harus antara 1-100%";
      }
    }

    // ✅ NEW: Validate service allowance deduction percentage
    if (
      formData.deduction_method === "service_allowance" ||
      formData.deduction_method === "mixed"
    ) {
      if (
        !formData.service_allowance_deduction_percentage ||
        formData.service_allowance_deduction_percentage <= 0 ||
        formData.service_allowance_deduction_percentage > 100
      ) {
        newErrors.service_allowance_deduction_percentage =
          "Persentase potongan jasa pelayanan harus antara 1-100%";
      }
    }

    // ✅ NEW: Validate mixed deduction total
    if (formData.deduction_method === "mixed") {
      const total =
        (formData.salary_deduction_percentage || 0) +
        (formData.service_allowance_deduction_percentage || 0);
      if (total !== 100) {
        newErrors.mixed_total = `Total persentase harus 100% (Saat ini: ${total}%)`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !loan) {
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Recalculate monthly payment if amount, rate, or term changed
      const monthlyRate = (formData.interestRate || 0) / 100 / 12;
      const newMonthlyPayment =
        ((formData.amount || 0) *
          (monthlyRate * Math.pow(1 + monthlyRate, formData.termMonths || 0))) /
        (Math.pow(1 + monthlyRate, formData.termMonths || 0) - 1);

      const updatedLoan: Loan = {
        ...loan,
        ...(formData as Loan),
        monthlyPayment: newMonthlyPayment,
      };

      onSave(updatedLoan);
      onClose();
    } catch (error) {
      console.error("Error updating loan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Loan, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const calculateMonthlyPayment = () => {
    if (formData.amount && formData.interestRate && formData.termMonths) {
      const monthlyRate = formData.interestRate / 100 / 12;
      const payment =
        (formData.amount *
          (monthlyRate * Math.pow(1 + monthlyRate, formData.termMonths))) /
        (Math.pow(1 + monthlyRate, formData.termMonths) - 1);
      return payment;
    }
    return 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!loan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Edit Pinjaman</span>
          </DialogTitle>
          <DialogDescription>
            Ubah informasi pinjaman {loan.memberName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Member Info (Read Only) */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <User className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">
                Informasi Anggota
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nomor Anggota</Label>
                <Input
                  value={formData.memberNumber || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Nama Anggota</Label>
                <Input
                  value={formData.memberName || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Loan Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">
                Detail Pinjaman
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Jumlah Pinjaman *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount || ""}
                    onChange={(e) =>
                      handleInputChange("amount", parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="pl-10"
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <Label htmlFor="interestRate">Suku Bunga (% per tahun) *</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  value={formData.interestRate || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "interestRate",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  placeholder="12"
                />
                {errors.interestRate && (
                  <p className="text-sm text-red-600">{errors.interestRate}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Term */}
              <div className="space-y-2">
                <Label htmlFor="termMonths">Jangka Waktu (bulan) *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="termMonths"
                    type="number"
                    value={formData.termMonths || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "termMonths",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    placeholder="12"
                    className="pl-10"
                  />
                </div>
                {errors.termMonths && (
                  <p className="text-sm text-red-600">{errors.termMonths}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      Menunggu Persetujuan
                    </SelectItem>
                    <SelectItem value="approved">Disetujui</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-600">{errors.status}</p>
                )}
              </div>
            </div>

            {/* Remaining Amount */}
            <div className="space-y-2">
              <Label htmlFor="remainingAmount">Sisa Pinjaman</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="remainingAmount"
                  type="number"
                  value={formData.remainingAmount || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "remainingAmount",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  placeholder="0"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose">Tujuan Pinjaman *</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="purpose"
                  value={formData.purpose || ""}
                  onChange={(e) => handleInputChange("purpose", e.target.value)}
                  placeholder="Jelaskan tujuan penggunaan pinjaman"
                  rows={3}
                  className="pl-10"
                />
              </div>
              {errors.purpose && (
                <p className="text-sm text-red-600">{errors.purpose}</p>
              )}
            </div>
          </div>

          {/* ✅ NEW: Deduction Method Section */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Percent className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-medium text-gray-700">
                Metode Potongan Angsuran
              </h3>
            </div>

            {/* Deduction Method Selection */}
            <div className="space-y-2">
              <Label>Pilih Metode Potongan *</Label>
              <Select
                value={formData.deduction_method}
                onValueChange={(value: any) => {
                  setFormData({
                    ...formData,
                    deduction_method: value,
                    salary_deduction_percentage:
                      value === "none"
                        ? 0
                        : formData.salary_deduction_percentage,
                    service_allowance_deduction_percentage:
                      value === "none"
                        ? 0
                        : formData.service_allowance_deduction_percentage,
                  });
                  if (errors.deduction_method) {
                    setErrors((prev) => ({ ...prev, deduction_method: "" }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <div className="flex flex-col">
                      <span className="font-medium">Tidak Ada Potongan</span>
                      <span className="text-xs text-gray-500">
                        Bayar manual via kas/transfer
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="salary">
                    <div className="flex flex-col">
                      <span className="font-medium">Potongan Gaji</span>
                      <span className="text-xs text-gray-500">
                        Angsuran dipotong dari gaji bulanan
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="service_allowance">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        Potongan Jasa Pelayanan
                      </span>
                      <span className="text-xs text-gray-500">
                        Angsuran dipotong dari jasa pelayanan
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="mixed">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        Kombinasi (Gaji + Jasa Pelayanan)
                      </span>
                      <span className="text-xs text-gray-500">
                        Angsuran dipotong dari keduanya
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.deduction_method && (
                <p className="text-sm text-red-600">
                  {errors.deduction_method}
                </p>
              )}
            </div>

            {/* ✅ Conditional: Salary Deduction Percentage */}
            {(formData.deduction_method === "salary" ||
              formData.deduction_method === "mixed") && (
              <div className="space-y-2 bg-blue-50 p-4 rounded-lg">
                <Label className="flex items-center space-x-2">
                  <Percent className="h-4 w-4 text-blue-600" />
                  <span>Persentase Potongan Gaji (%) *</span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.salary_deduction_percentage || ""}
                  onChange={(e) => {
                    handleInputChange(
                      "salary_deduction_percentage",
                      parseInt(e.target.value) || 0,
                    );
                    if (errors.salary_deduction_percentage) {
                      setErrors((prev) => ({
                        ...prev,
                        salary_deduction_percentage: "",
                      }));
                    }
                  }}
                  placeholder="Contoh: 100 (untuk 100%)"
                />
                {errors.salary_deduction_percentage && (
                  <p className="text-sm text-red-600">
                    {errors.salary_deduction_percentage}
                  </p>
                )}
                <p className="text-xs text-blue-700">
                  💡 Angsuran akan dipotong{" "}
                  <strong>{formData.salary_deduction_percentage || 0}%</strong>{" "}
                  dari gaji bulanan
                </p>
              </div>
            )}

            {/* ✅ Conditional: Service Allowance Deduction Percentage */}
            {(formData.deduction_method === "service_allowance" ||
              formData.deduction_method === "mixed") && (
              <div className="space-y-2 bg-green-50 p-4 rounded-lg">
                <Label className="flex items-center space-x-2">
                  <Percent className="h-4 w-4 text-green-600" />
                  <span>Persentase Potongan Jasa Pelayanan (%) *</span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.service_allowance_deduction_percentage || ""}
                  onChange={(e) => {
                    handleInputChange(
                      "service_allowance_deduction_percentage",
                      parseInt(e.target.value) || 0,
                    );
                    if (errors.service_allowance_deduction_percentage) {
                      setErrors((prev) => ({
                        ...prev,
                        service_allowance_deduction_percentage: "",
                      }));
                    }
                  }}
                  placeholder="Contoh: 100 (untuk 100%)"
                />
                {errors.service_allowance_deduction_percentage && (
                  <p className="text-sm text-red-600">
                    {errors.service_allowance_deduction_percentage}
                  </p>
                )}
                <p className="text-xs text-green-700">
                  💡 Angsuran akan dipotong{" "}
                  <strong>
                    {formData.service_allowance_deduction_percentage || 0}%
                  </strong>{" "}
                  dari jasa pelayanan
                </p>
              </div>
            )}

            {/* ✅ Mixed Deduction Summary */}
            {formData.deduction_method === "mixed" && (
              <Alert
                className={
                  (formData.salary_deduction_percentage || 0) +
                    (formData.service_allowance_deduction_percentage || 0) ===
                  100
                    ? "bg-green-50 border-green-200"
                    : "bg-orange-50 border-orange-200"
                }
              >
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Total Persentase Potongan:</p>
                    <p className="text-sm">
                      Gaji: {formData.salary_deduction_percentage || 0}% + Jasa
                      Pelayanan:{" "}
                      {formData.service_allowance_deduction_percentage || 0}% =
                      <strong
                        className={
                          (formData.salary_deduction_percentage || 0) +
                            (formData.service_allowance_deduction_percentage ||
                              0) ===
                          100
                            ? "text-green-700 ml-1"
                            : "text-orange-700 ml-1"
                        }
                      >
                        {(formData.salary_deduction_percentage || 0) +
                          (formData.service_allowance_deduction_percentage ||
                            0)}
                        %
                      </strong>
                    </p>
                    {(formData.salary_deduction_percentage || 0) +
                      (formData.service_allowance_deduction_percentage || 0) !==
                      100 && (
                      <p className="text-xs text-orange-700 mt-2">
                        ⚠️ Total harus 100% untuk metode kombinasi
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
            {errors.mixed_total && (
              <p className="text-sm text-red-600">{errors.mixed_total}</p>
            )}
          </div>

          {/* Calculation Summary */}
          {(formData.amount || 0) > 0 &&
            (formData.interestRate || 0) > 0 &&
            (formData.termMonths || 0) > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Ringkasan Perhitungan
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Jumlah Pinjaman:</span>
                    <p className="font-medium">
                      {formatCurrency(formData.amount || 0)}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700">Angsuran per Bulan:</span>
                    <p className="font-medium">
                      {formatCurrency(calculateMonthlyPayment())}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700">Total Pembayaran:</span>
                    <p className="font-medium">
                      {formatCurrency(
                        calculateMonthlyPayment() * (formData.termMonths || 0),
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700">Total Bunga:</span>
                    <p className="font-medium">
                      {formatCurrency(
                        calculateMonthlyPayment() * (formData.termMonths || 0) -
                          (formData.amount || 0),
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Menyimpan...</span>
                </div>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
