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
import { DollarSign, Calculator, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface KasOption {
  id: number;
  name: string;
  description?: string;
  interest_rate: number;
  max_amount: number;
}

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  userId: number;
  availableKas?: KasOption[];
}

export function LoanApplicationModal({
  isOpen,
  onClose,
  onSubmit,
  userId,
  availableKas = [],
}: LoanApplicationModalProps) {
  const [selectedKas, setSelectedKas] = useState<string>("");
  const [principalAmount, setPrincipalAmount] = useState<string>("");
  const [tenureMonths, setTenureMonths] = useState<string>("");
  const [loanPurpose, setLoanPurpose] = useState<string>("");
  const [applicationDate, setApplicationDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedKas("");
      setPrincipalAmount("");
      setTenureMonths("");
      setLoanPurpose("");
      setApplicationDate(new Date().toISOString().split("T")[0]);
      setErrors({});
      setMonthlyPayment(0);
    }
  }, [isOpen]);

  // Calculate monthly payment when values change
  useEffect(() => {
    if (principalAmount && tenureMonths && selectedKas) {
      const kas = availableKas.find((k) => k.id.toString() === selectedKas);
      if (kas) {
        const principal = parseFloat(principalAmount);
        const months = parseInt(tenureMonths);
        const annualRate = kas.interest_rate;

        if (principal > 0 && months > 0) {
          // Calculate monthly payment with flat interest
          const totalInterest = (principal * annualRate * months) / (12 * 100);
          const totalAmount = principal + totalInterest;
          const monthly = totalAmount / months;

          setMonthlyPayment(monthly);
        }
      }
    } else {
      setMonthlyPayment(0);
    }
  }, [principalAmount, tenureMonths, selectedKas, availableKas]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedKas) {
      newErrors.selectedKas = "Pilih kas terlebih dahulu";
    }

    const principal = parseFloat(principalAmount);
    if (!principalAmount || isNaN(principal) || principal <= 0) {
      newErrors.principalAmount = "Jumlah pinjaman harus lebih dari 0";
    }

    // Check max amount
    const kas = availableKas.find((k) => k.id.toString() === selectedKas);
    if (kas && principal > kas.max_amount) {
      newErrors.principalAmount = `Maksimal pinjaman dari ${
        kas.name
      } adalah ${formatCurrency(kas.max_amount)}`;
    }

    const months = parseInt(tenureMonths);
    if (!tenureMonths || isNaN(months) || months <= 0) {
      newErrors.tenureMonths = "Jangka waktu harus lebih dari 0";
    } else if (months > 60) {
      newErrors.tenureMonths = "Jangka waktu maksimal 60 bulan";
    }

    if (!loanPurpose || loanPurpose.trim().length < 10) {
      newErrors.loanPurpose = "Tujuan pinjaman minimal 10 karakter";
    }

    if (!applicationDate) {
      newErrors.applicationDate = "Tanggal pengajuan harus diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Periksa kembali form Anda");
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ FIXED: Match backend API structure
      const loanData = {
        user_id: userId,
        cash_account_id: parseInt(selectedKas),
        principal_amount: parseFloat(principalAmount),
        tenure_months: parseInt(tenureMonths),
        application_date: applicationDate,
        loan_purpose: loanPurpose.trim(),
      };

      console.log("📤 Submitting loan application:", loanData);

      // Call API directly
      const token = localStorage.getItem("token");
      const response = await fetch("https://ksp.gascpns.id/api/loans", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loanData),
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        // Handle error response
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ API Error:", errorData);

        // Show validation errors if available
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat();
          toast.error(errorMessages.join(", "));
        } else {
          toast.error(errorData.message || "Gagal mengajukan pinjaman");
        }
        return;
      }

      const result = await response.json();
      console.log("✅ Loan created:", result);

      toast.success("Pengajuan pinjaman berhasil!");

      // Call parent onSubmit to refresh data
      await onSubmit(loanData);

      handleClose();
    } catch (error: any) {
      console.error("❌ Error submitting loan:", error);
      toast.error(
        error.message || "Terjadi kesalahan saat mengajukan pinjaman"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleClose = () => {
    setSelectedKas("");
    setPrincipalAmount("");
    setTenureMonths("");
    setLoanPurpose("");
    setApplicationDate(new Date().toISOString().split("T")[0]);
    setErrors({});
    setMonthlyPayment(0);
    setIsSubmitting(false);
    onClose();
  };

  const selectedKasData = availableKas.find(
    (k) => k.id.toString() === selectedKas
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Ajukan Pinjaman Baru</span>
          </DialogTitle>
          <DialogDescription>
            Lengkapi form di bawah untuk mengajukan pinjaman
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kas Selection */}
          <div className="space-y-2">
            <Label htmlFor="kas">Pilih Kas *</Label>
            <Select value={selectedKas} onValueChange={setSelectedKas}>
              <SelectTrigger
                className={errors.selectedKas ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Pilih jenis kas" />
              </SelectTrigger>
              <SelectContent>
                {availableKas.map((kas) => (
                  <SelectItem key={kas.id} value={kas.id.toString()}>
                    <div>
                      <p className="font-medium">{kas.name}</p>
                      <p className="text-xs text-gray-500">
                        Bunga: {kas.interest_rate}% | Max:{" "}
                        {formatCurrency(kas.max_amount)}
                      </p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.selectedKas && (
              <p className="text-sm text-red-600">{errors.selectedKas}</p>
            )}
            {selectedKasData && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <p className="text-blue-900 font-medium">
                  {selectedKasData.name}
                </p>
                <p className="text-blue-700 text-xs mt-1">
                  {selectedKasData.description}
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div>
                    <span className="text-blue-700">Bunga: </span>
                    <span className="font-medium">
                      {selectedKasData.interest_rate}% / tahun
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Maksimal: </span>
                    <span className="font-medium">
                      {formatCurrency(selectedKasData.max_amount)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Principal Amount */}
          <div className="space-y-2">
            <Label htmlFor="principalAmount">Jumlah Pinjaman *</Label>
            <Input
              id="principalAmount"
              type="number"
              value={principalAmount}
              onChange={(e) => setPrincipalAmount(e.target.value)}
              placeholder="Contoh: 10000000"
              className={errors.principalAmount ? "border-red-500" : ""}
            />
            {errors.principalAmount && (
              <p className="text-sm text-red-600">{errors.principalAmount}</p>
            )}
          </div>

          {/* Tenure */}
          <div className="space-y-2">
            <Label htmlFor="tenureMonths">Jangka Waktu (Bulan) *</Label>
            <Input
              id="tenureMonths"
              type="number"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(e.target.value)}
              placeholder="Contoh: 12"
              className={errors.tenureMonths ? "border-red-500" : ""}
            />
            {errors.tenureMonths && (
              <p className="text-sm text-red-600">{errors.tenureMonths}</p>
            )}
          </div>

          {/* Application Date */}
          <div className="space-y-2">
            <Label htmlFor="applicationDate">Tanggal Pengajuan *</Label>
            <Input
              id="applicationDate"
              type="date"
              value={applicationDate}
              onChange={(e) => setApplicationDate(e.target.value)}
              className={errors.applicationDate ? "border-red-500" : ""}
            />
            {errors.applicationDate && (
              <p className="text-sm text-red-600">{errors.applicationDate}</p>
            )}
          </div>

          {/* Loan Purpose */}
          <div className="space-y-2">
            <Label htmlFor="loanPurpose">Tujuan Pinjaman *</Label>
            <Textarea
              id="loanPurpose"
              value={loanPurpose}
              onChange={(e) => setLoanPurpose(e.target.value)}
              placeholder="Jelaskan tujuan pinjaman Anda (minimal 10 karakter)"
              rows={3}
              className={errors.loanPurpose ? "border-red-500" : ""}
            />
            {errors.loanPurpose && (
              <p className="text-sm text-red-600">{errors.loanPurpose}</p>
            )}
          </div>

          {/* Calculation Preview */}
          {monthlyPayment > 0 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-3">
                <Calculator className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-900">
                  Estimasi Pembayaran
                </h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Jumlah Pinjaman:</span>
                  <span className="font-medium">
                    {formatCurrency(parseFloat(principalAmount))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Jangka Waktu:</span>
                  <span className="font-medium">{tenureMonths} bulan</span>
                </div>
                {selectedKasData && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Bunga:</span>
                    <span className="font-medium">
                      {selectedKasData.interest_rate}% / tahun
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-green-300 pt-2">
                  <span className="text-green-700 font-medium">
                    Angsuran per Bulan:
                  </span>
                  <span className="font-bold text-green-900">
                    {formatCurrency(monthlyPayment)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Ajukan Pinjaman
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
