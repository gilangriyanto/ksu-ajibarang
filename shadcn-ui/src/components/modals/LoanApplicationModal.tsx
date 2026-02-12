// components/modals/LoanApplicationModal.tsx
// ✅ UPDATED: Added Deduction Method Feature
// ✅ Member can now select deduction method when applying for loan

import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  AlertCircle,
  Calculator,
  DollarSign,
  Percent,
  Info,
} from "lucide-react";

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  userId: number;
  availableKas: Array<{
    id: number;
    name: string;
    description: string;
    interest_rate: number;
    max_amount: number;
  }>;
}

interface SimulationResult {
  principal_amount: number;
  interest_percentage: number;
  tenure_months: number;
  monthly_installment: number;
  total_amount: number;
  total_interest: number;
  effective_rate: number;
}

export const LoanApplicationModal = ({
  isOpen,
  onClose,
  onSubmit,
  userId,
  availableKas,
}: LoanApplicationModalProps) => {
  // ✅ Form state WITH deduction method fields
  const [formData, setFormData] = useState({
    cash_account_id: "",
    principal_amount: "",
    tenure_months: "12",
    loan_purpose: "",
    // ✅ NEW: Deduction Method fields
    deduction_method: "none" as
      | "none"
      | "salary"
      | "service_allowance"
      | "mixed",
    salary_deduction_percentage: 0,
    service_allowance_deduction_percentage: 0,
  });

  // ✅ UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  // ✅ Format currency for display
  const formatCurrency = (value: number | string): string => {
    const num =
      typeof value === "string" ? parseFloat(value.replace(/\D/g, "")) : value;
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // ✅ Format input with Rp prefix
  const formatCurrencyInput = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "";
    const formatted = new Intl.NumberFormat("id-ID").format(parseInt(numbers));
    return `Rp ${formatted}`;
  };

  // ✅ Parse currency to plain number
  const parseCurrency = (value: string): number => {
    const numbers = value.replace(/\D/g, "");
    return numbers ? parseInt(numbers) : 0;
  };

  // ✅ Handle amount input
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatCurrencyInput(raw);
    setFormData({ ...formData, principal_amount: formatted });
    // Clear field error when user types
    if (fieldErrors.principal_amount) {
      const newErrors = { ...fieldErrors };
      delete newErrors.principal_amount;
      setFieldErrors(newErrors);
    }
  };

  // ✅ Call simulation API
  const runSimulation = async (
    amount: number,
    tenure: number,
    kasId: number,
  ) => {
    setSimulationLoading(true);
    setSimulation(null);

    try {
      console.log("🧮 Running simulation with:", {
        principal_amount: amount,
        tenure_months: tenure,
        cash_account_id: kasId,
      });

      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://ksp.gascpns.id/api/loans/simulate",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            principal_amount: amount,
            tenure_months: tenure,
            cash_account_id: kasId,
          }),
        },
      );

      console.log("📡 Simulation response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Simulation error:", errorData);
        throw new Error(errorData.message || "Simulasi gagal");
      }

      const result = await response.json();
      console.log("✅ Simulation result:", result);

      if (result.success && result.data) {
        setSimulation(result.data);
      } else {
        throw new Error("Invalid simulation response");
      }
    } catch (err: any) {
      console.error("❌ Simulation error:", err);
      setError(err.message || "Gagal menghitung simulasi");
      setSimulation(null);
    } finally {
      setSimulationLoading(false);
    }
  };

  // ✅ Auto-simulate when inputs change
  useEffect(() => {
    const amount = parseCurrency(formData.principal_amount);
    const tenure = parseInt(formData.tenure_months);
    const kasId = parseInt(formData.cash_account_id);

    if (amount >= 100000 && tenure >= 6 && kasId > 0) {
      const timer = setTimeout(() => {
        runSimulation(amount, tenure, kasId);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setSimulation(null);
    }
  }, [
    formData.principal_amount,
    formData.tenure_months,
    formData.cash_account_id,
  ]);

  // ✅ Validate form before submit
  const validateForm = (): boolean => {
    const amount = parseCurrency(formData.principal_amount);
    const tenure = parseInt(formData.tenure_months);
    const kasId = parseInt(formData.cash_account_id);

    // Clear previous errors
    setError("");
    setFieldErrors({});

    // Validate kas
    if (!kasId || kasId <= 0) {
      setError("Pilih Kas terlebih dahulu");
      return false;
    }

    // Validate amount
    if (!amount || amount < 100000) {
      setError("Jumlah pinjaman minimal Rp 100.000");
      return false;
    }

    const selectedKas = availableKas.find((k) => k.id === kasId);
    if (selectedKas && amount > selectedKas.max_amount) {
      setError(
        `Jumlah pinjaman maksimal ${formatCurrency(selectedKas.max_amount)} untuk ${selectedKas.name}`,
      );
      return false;
    }

    // Validate tenure
    if (!tenure || tenure < 6) {
      setError("Jangka waktu minimal 6 bulan");
      return false;
    }
    if (tenure > 60) {
      setError("Jangka waktu maksimal 60 bulan");
      return false;
    }

    // ✅ NEW: Validate deduction method
    if (!formData.deduction_method) {
      setError("Pilih metode potongan angsuran");
      return false;
    }

    // ✅ NEW: Validate salary deduction percentage
    if (
      formData.deduction_method === "salary" ||
      formData.deduction_method === "mixed"
    ) {
      if (
        formData.salary_deduction_percentage <= 0 ||
        formData.salary_deduction_percentage > 100
      ) {
        setError("Persentase potongan gaji harus antara 1-100%");
        return false;
      }
    }

    // ✅ NEW: Validate service allowance deduction percentage
    if (
      formData.deduction_method === "service_allowance" ||
      formData.deduction_method === "mixed"
    ) {
      if (
        formData.service_allowance_deduction_percentage <= 0 ||
        formData.service_allowance_deduction_percentage > 100
      ) {
        setError("Persentase potongan jasa pelayanan harus antara 1-100%");
        return false;
      }
    }

    // ✅ NEW: Validate mixed deduction total
    if (formData.deduction_method === "mixed") {
      const total =
        formData.salary_deduction_percentage +
        formData.service_allowance_deduction_percentage;
      if (total !== 100) {
        setError(`Total persentase potongan harus 100% (Saat ini: ${total}%)`);
        return false;
      }
    }

    // Validate purpose
    if (
      !formData.loan_purpose.trim() ||
      formData.loan_purpose.trim().length < 10
    ) {
      setError("Tujuan pinjaman minimal 10 karakter");
      return false;
    }

    return true;
  };

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submit
    if (loading) {
      console.warn("⚠️ Already submitting, ignoring...");
      return;
    }

    // Validate
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setFieldErrors({});

      const amount = parseCurrency(formData.principal_amount);
      const tenure = parseInt(formData.tenure_months);
      const kasId = parseInt(formData.cash_account_id);

      // ✅ Build loan data with deduction method
      const loanData: any = {
        user_id: userId,
        cash_account_id: kasId,
        principal_amount: amount,
        tenure_months: tenure,
        loan_purpose: formData.loan_purpose.trim(),
        deduction_method: formData.deduction_method, // ✅ NEW
      };

      // ✅ Add percentage fields based on deduction method
      if (
        formData.deduction_method === "salary" ||
        formData.deduction_method === "mixed"
      ) {
        loanData.salary_deduction_percentage =
          formData.salary_deduction_percentage;
      }

      if (
        formData.deduction_method === "service_allowance" ||
        formData.deduction_method === "mixed"
      ) {
        loanData.service_allowance_deduction_percentage =
          formData.service_allowance_deduction_percentage;
      }

      console.log(
        "📤 Submitting loan application with deduction method:",
        loanData,
      );

      await onSubmit(loanData);

      console.log("✅ Loan application submitted successfully");

      // Reset form
      resetForm();

      // Close modal
      onClose();
    } catch (err: any) {
      console.error("❌ Submit error:", err);

      // ✅ Handle API validation errors
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        console.log("📋 Validation errors from API:", errors);

        setFieldErrors(errors);

        // Create a summary error message
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => {
            const fieldName =
              field === "cash_account_id"
                ? "Kas"
                : field === "principal_amount"
                  ? "Jumlah Pinjaman"
                  : field === "tenure_months"
                    ? "Jangka Waktu"
                    : field === "loan_purpose"
                      ? "Tujuan Pinjaman"
                      : field === "deduction_method"
                        ? "Metode Potongan"
                        : field === "salary_deduction_percentage"
                          ? "Potongan Gaji"
                          : field === "service_allowance_deduction_percentage"
                            ? "Potongan Jasa Pelayanan"
                            : field;
            return `${fieldName}: ${(messages as string[]).join(", ")}`;
          })
          .join("\n");

        setError(errorMessages);
      } else {
        // Generic error
        setError(err.message || "Gagal mengajukan pinjaman");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setFormData({
      cash_account_id: "",
      principal_amount: "",
      tenure_months: "12",
      loan_purpose: "",
      deduction_method: "none",
      salary_deduction_percentage: 0,
      service_allowance_deduction_percentage: 0,
    });
    setError("");
    setFieldErrors({});
    setSimulation(null);
  };

  // ✅ Handle modal close
  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  // ✅ Reset on modal open
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Get selected kas info
  const selectedKas = availableKas.find(
    (k) => k.id.toString() === formData.cash_account_id,
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajukan Pinjaman Baru</DialogTitle>
          <DialogDescription>
            Isi formulir di bawah. Simulasi akan muncul otomatis saat Anda
            mengisi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="whitespace-pre-line">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Kas Selection */}
          <div className="space-y-2">
            <Label htmlFor="kas">
              Pilih Kas <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.cash_account_id}
              onValueChange={(value) => {
                console.log("🏦 Kas selected:", value);
                setFormData({ ...formData, cash_account_id: value });
                if (fieldErrors.cash_account_id) {
                  const newErrors = { ...fieldErrors };
                  delete newErrors.cash_account_id;
                  setFieldErrors(newErrors);
                }
              }}
              disabled={loading}
            >
              <SelectTrigger
                className={fieldErrors.cash_account_id ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Pilih Kas" />
              </SelectTrigger>
              <SelectContent>
                {availableKas.map((kas) => (
                  <SelectItem key={kas.id} value={kas.id.toString()}>
                    <div>
                      <div className="font-medium">{kas.name}</div>
                      <div className="text-xs text-gray-500">
                        Bunga: {kas.interest_rate}% • Max:{" "}
                        {formatCurrency(kas.max_amount)}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedKas && (
              <p className="text-sm text-gray-600">{selectedKas.description}</p>
            )}
            {fieldErrors.cash_account_id && (
              <p className="text-sm text-red-600">
                {fieldErrors.cash_account_id[0]}
              </p>
            )}
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Jumlah Pinjaman <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                type="text"
                placeholder="Rp 5.000.000"
                value={formData.principal_amount}
                onChange={handleAmountChange}
                disabled={loading}
                className={`pl-10 ${fieldErrors.principal_amount ? "border-red-500" : ""}`}
              />
            </div>
            <p className="text-xs text-gray-500">
              Minimal: Rp 100.000
              {selectedKas &&
                ` • Maksimal: ${formatCurrency(selectedKas.max_amount)}`}
            </p>
            {fieldErrors.principal_amount && (
              <p className="text-sm text-red-600">
                {fieldErrors.principal_amount[0]}
              </p>
            )}
          </div>

          {/* Tenure Selection */}
          <div className="space-y-2">
            <Label htmlFor="tenure">
              Jangka Waktu <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.tenure_months}
              onValueChange={(value) => {
                console.log("📅 Tenure selected:", value);
                setFormData({ ...formData, tenure_months: value });
                if (fieldErrors.tenure_months) {
                  const newErrors = { ...fieldErrors };
                  delete newErrors.tenure_months;
                  setFieldErrors(newErrors);
                }
              }}
              disabled={loading}
            >
              <SelectTrigger
                className={fieldErrors.tenure_months ? "border-red-500" : ""}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 Bulan</SelectItem>
                <SelectItem value="12">12 Bulan</SelectItem>
                <SelectItem value="18">18 Bulan</SelectItem>
                <SelectItem value="24">24 Bulan</SelectItem>
                <SelectItem value="36">36 Bulan</SelectItem>
                <SelectItem value="48">48 Bulan</SelectItem>
                <SelectItem value="60">60 Bulan</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.tenure_months && (
              <p className="text-sm text-red-600">
                {fieldErrors.tenure_months[0]}
              </p>
            )}
          </div>

          {/* ✅ NEW: Deduction Method Section */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Percent className="h-4 w-4 text-purple-600" />
              <Label className="text-base font-semibold">
                Metode Potongan Angsuran
              </Label>
            </div>

            {/* Deduction Method Selection */}
            <div className="space-y-2">
              <Label>
                Pilih Metode Potongan <span className="text-red-500">*</span>
              </Label>
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
                }}
                disabled={loading}
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
            </div>

            {/* ✅ Conditional: Salary Deduction Percentage */}
            {(formData.deduction_method === "salary" ||
              formData.deduction_method === "mixed") && (
              <div className="space-y-2 bg-blue-50 p-4 rounded-lg">
                <Label className="flex items-center space-x-2">
                  <Percent className="h-4 w-4 text-blue-600" />
                  <span>
                    Persentase Potongan Gaji (%){" "}
                    <span className="text-red-500">*</span>
                  </span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.salary_deduction_percentage || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salary_deduction_percentage:
                        parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Contoh: 100 (untuk 100%)"
                  disabled={loading}
                />
                <p className="text-xs text-blue-700">
                  💡 Angsuran akan dipotong{" "}
                  <strong>{formData.salary_deduction_percentage}%</strong> dari
                  gaji bulanan
                </p>
              </div>
            )}

            {/* ✅ Conditional: Service Allowance Deduction Percentage */}
            {(formData.deduction_method === "service_allowance" ||
              formData.deduction_method === "mixed") && (
              <div className="space-y-2 bg-green-50 p-4 rounded-lg">
                <Label className="flex items-center space-x-2">
                  <Percent className="h-4 w-4 text-green-600" />
                  <span>
                    Persentase Potongan Jasa Pelayanan (%){" "}
                    <span className="text-red-500">*</span>
                  </span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.service_allowance_deduction_percentage || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      service_allowance_deduction_percentage:
                        parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Contoh: 100 (untuk 100%)"
                  disabled={loading}
                />
                <p className="text-xs text-green-700">
                  💡 Angsuran akan dipotong{" "}
                  <strong>
                    {formData.service_allowance_deduction_percentage}%
                  </strong>{" "}
                  dari jasa pelayanan
                </p>
              </div>
            )}

            {/* ✅ Mixed Deduction Summary */}
            {formData.deduction_method === "mixed" && (
              <Alert
                className={
                  formData.salary_deduction_percentage +
                    formData.service_allowance_deduction_percentage ===
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
                      Gaji: {formData.salary_deduction_percentage}% + Jasa
                      Pelayanan:{" "}
                      {formData.service_allowance_deduction_percentage}% =
                      <strong
                        className={
                          formData.salary_deduction_percentage +
                            formData.service_allowance_deduction_percentage ===
                          100
                            ? "text-green-700 ml-1"
                            : "text-orange-700 ml-1"
                        }
                      >
                        {formData.salary_deduction_percentage +
                          formData.service_allowance_deduction_percentage}
                        %
                      </strong>
                    </p>
                    {formData.salary_deduction_percentage +
                      formData.service_allowance_deduction_percentage !==
                      100 && (
                      <p className="text-xs text-orange-700 mt-2">
                        ⚠️ Total harus 100% untuk metode kombinasi
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Simulation Card */}
          {simulationLoading && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="text-blue-900">Menghitung simulasi...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {!simulationLoading && simulation && (
            <Card className="border-2 border-blue-500 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">
                    Simulasi Pinjaman
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Angsuran per Bulan</p>
                    <p className="text-lg font-bold text-blue-900">
                      {formatCurrency(simulation.monthly_installment)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Pembayaran</p>
                    <p className="text-lg font-bold text-blue-900">
                      {formatCurrency(simulation.total_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Bunga</p>
                    <p className="text-sm font-medium text-orange-600">
                      {formatCurrency(simulation.total_interest)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bunga per Tahun</p>
                    <p className="text-sm font-medium">
                      {simulation.interest_percentage}%
                    </p>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-white rounded">
                  <p className="text-xs text-gray-600">
                    💡 Effective Rate:{" "}
                    <strong>{simulation.effective_rate}%</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loan Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">
              Tujuan Pinjaman <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="purpose"
              placeholder="Contoh: Renovasi rumah, biaya pendidikan, modal usaha, dll (minimal 10 karakter)"
              value={formData.loan_purpose}
              onChange={(e) => {
                setFormData({ ...formData, loan_purpose: e.target.value });
                if (fieldErrors.loan_purpose) {
                  const newErrors = { ...fieldErrors };
                  delete newErrors.loan_purpose;
                  setFieldErrors(newErrors);
                }
              }}
              disabled={loading}
              rows={3}
              className={fieldErrors.loan_purpose ? "border-red-500" : ""}
            />
            <p className="text-xs text-gray-500">
              {formData.loan_purpose.length}/10 karakter minimum
            </p>
            {fieldErrors.loan_purpose && (
              <p className="text-sm text-red-600">
                {fieldErrors.loan_purpose[0]}
              </p>
            )}
          </div>

          {/* Important Note */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Catatan:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Pengajuan akan direview oleh admin</li>
                <li>Proses persetujuan 1-3 hari kerja</li>
                <li>Anda akan dihubungi jika perlu dokumen tambahan</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading || simulationLoading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Ajukan Pinjaman
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
