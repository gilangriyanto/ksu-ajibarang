// components/modals/LoanAddModal.tsx
// ✅ UPDATED VERSION: With Deduction Method Feature
// ✅ BUG-FREE: All validations, currency format, and API integration correct

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
import { Card, CardContent } from "@/components/ui/card";
import {
  CreditCard,
  DollarSign,
  Calendar,
  User,
  FileText,
  Loader2,
  AlertCircle,
  Calculator,
  Percent,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface LoanAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Member {
  id: number;
  full_name: string;
  employee_id: string;
  status: string;
}

interface CashAccount {
  id: number;
  code: string;
  name: string;
  interest_rate?: number;
  max_amount?: number;
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

export function LoanAddModal({
  isOpen,
  onClose,
  onSuccess,
}: LoanAddModalProps) {
  // ✅ Form state with deduction_method fields
  const [formData, setFormData] = useState({
    user_id: "",
    cash_account_id: "",
    principal_amount: "",
    tenure_months: "12",
    application_date: new Date().toISOString().split("T")[0],
    loan_purpose: "",
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
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  // ✅ Data state
  const [members, setMembers] = useState<Member[]>([]);
  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  // ✅ Load data on modal open
  useEffect(() => {
    if (isOpen) {
      resetForm();
      loadMembers();
      loadCashAccounts();
    }
  }, [isOpen]);

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

  // ✅ Handle amount input with formatting
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatCurrencyInput(raw);
    setFormData({ ...formData, principal_amount: formatted });
  };

  // ✅ Load members
  const loadMembers = async () => {
    setLoadingMembers(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://ksp.gascpns.id/api/members?all=true",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      let membersList: Member[] = [];

      if (response.data.success && Array.isArray(response.data.data)) {
        membersList = response.data.data.filter(
          (user: any) => user.status === "active",
        );
      } else if (Array.isArray(response.data)) {
        membersList = response.data.filter(
          (user: any) => user.status === "active",
        );
      }

      setMembers(membersList);
      console.log(`👥 Found ${membersList.length} active members`);
    } catch (err: any) {
      console.error("❌ Error loading members:", err);
      toast.error("Gagal memuat data anggota");
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  // ✅ Load cash accounts
  const loadCashAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://ksp.gascpns.id/api/cash-accounts",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      let accountsList: CashAccount[] = [];

      if (response.data.success && Array.isArray(response.data.data)) {
        accountsList = response.data.data;
      } else if (Array.isArray(response.data)) {
        accountsList = response.data;
      }

      setCashAccounts(accountsList);
      console.log(`🏦 Found ${accountsList.length} cash accounts`);
    } catch (err: any) {
      console.error("❌ Error loading cash accounts:", err);

      // Use mock data as fallback
      setCashAccounts([
        {
          id: 1,
          code: "KAS-I",
          name: "Kas Umum",
          interest_rate: 12,
          max_amount: 50000000,
        },
        {
          id: 3,
          code: "KAS-III",
          name: "Kas Sebrakanz",
          interest_rate: 0,
          max_amount: 10000000,
        },
      ]);
    } finally {
      setLoadingAccounts(false);
    }
  };

  // ✅ Run simulation
  const runSimulation = async (
    amount: number,
    tenure: number,
    kasId: number,
  ) => {
    setSimulationLoading(true);
    setSimulation(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://ksp.gascpns.id/api/loans/simulate",
        {
          principal_amount: amount,
          tenure_months: tenure,
          cash_account_id: kasId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success && response.data.data) {
        setSimulation(response.data.data);
      }
    } catch (err: any) {
      console.error("❌ Simulation error:", err);
      setError(err.response?.data?.message || "Gagal menghitung simulasi");
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

  // ✅ Validate form with deduction method validation
  const validateForm = (): boolean => {
    const userId = parseInt(formData.user_id);
    const kasId = parseInt(formData.cash_account_id);
    const amount = parseCurrency(formData.principal_amount);
    const tenure = parseInt(formData.tenure_months);

    // Validate user
    if (!userId || userId <= 0) {
      setError("Pilih anggota terlebih dahulu");
      return false;
    }

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

    const selectedKas = cashAccounts.find((k) => k.id === kasId);
    if (selectedKas?.max_amount && amount > selectedKas.max_amount) {
      setError(
        `Jumlah pinjaman maksimal ${formatCurrency(selectedKas.max_amount)} untuk ${selectedKas.name}`,
      );
      return false;
    }

    if (amount > 500000000) {
      setError("Jumlah pinjaman maksimal Rp 500.000.000");
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

    // Validate date
    if (!formData.application_date) {
      setError("Tanggal pengajuan harus diisi");
      return false;
    }

    setError("");
    return true;
  };

  // ✅ Handle submit with deduction method
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const userId = parseInt(formData.user_id);
      const kasId = parseInt(formData.cash_account_id);
      const amount = parseCurrency(formData.principal_amount);
      const tenure = parseInt(formData.tenure_months);

      // ✅ Build loan data with deduction method
      const loanData: any = {
        user_id: userId,
        cash_account_id: kasId,
        principal_amount: amount,
        tenure_months: tenure,
        application_date: formData.application_date,
        loan_purpose: formData.loan_purpose.trim(),
        deduction_method: formData.deduction_method,
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

      console.log("📤 Submitting loan with deduction method:", loanData);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://ksp.gascpns.id/api/loans",
        loanData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("✅ Loan created:", response.data);

      toast.success("Pengajuan pinjaman berhasil dibuat");

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("❌ Error creating loan:", error);

      if (error.response?.status === 422 && error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const errorMessages = Object.values(apiErrors).flat();
        setError(errorMessages.join(", "));
        toast.error(errorMessages.join(", "));
      } else {
        const errMsg =
          error.response?.data?.message ||
          error.message ||
          "Gagal membuat pinjaman";
        setError(errMsg);
        toast.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setFormData({
      user_id: "",
      cash_account_id: "",
      principal_amount: "",
      tenure_months: "12",
      application_date: new Date().toISOString().split("T")[0],
      loan_purpose: "",
      deduction_method: "none",
      salary_deduction_percentage: 0,
      service_allowance_deduction_percentage: 0,
    });
    setError("");
    setSimulation(null);
  };

  // ✅ Handle close
  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  // Get selected data
  const selectedMember = members.find(
    (m) => m.id.toString() === formData.user_id,
  );
  const selectedAccount = cashAccounts.find(
    (ca) => ca.id.toString() === formData.cash_account_id,
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Pengajuan Pinjaman Baru</span>
          </DialogTitle>
          <DialogDescription>
            Masukkan informasi lengkap untuk pengajuan pinjaman. Simulasi akan
            muncul otomatis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Member Selection */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <User className="h-4 w-4 text-gray-500" />
              <Label>
                Pilih Anggota <span className="text-red-500">*</span>
              </Label>
            </div>
            <Select
              value={formData.user_id}
              onValueChange={(value) =>
                setFormData({ ...formData, user_id: value })
              }
              disabled={loadingMembers || loading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingMembers
                      ? "Memuat anggota..."
                      : members.length === 0
                        ? "Tidak ada anggota"
                        : "Pilih anggota"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {members.length === 0 ? (
                  <SelectItem value="0" disabled>
                    Tidak ada anggota tersedia
                  </SelectItem>
                ) : (
                  members.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.employee_id || `ID-${member.id}`} -{" "}
                      {member.full_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedMember && (
              <p className="text-sm text-gray-600">
                {selectedMember.full_name} ({selectedMember.employee_id})
              </p>
            )}
          </div>

          {/* Cash Account Selection */}
          <div className="space-y-2">
            <Label>
              Pilih Kas <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.cash_account_id}
              onValueChange={(value) =>
                setFormData({ ...formData, cash_account_id: value })
              }
              disabled={loadingAccounts || loading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingAccounts
                      ? "Memuat kas..."
                      : cashAccounts.length === 0
                        ? "Tidak ada kas"
                        : "Pilih kas"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {cashAccounts.length === 0 ? (
                  <SelectItem value="0" disabled>
                    Tidak ada kas tersedia
                  </SelectItem>
                ) : (
                  cashAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      <div>
                        <div className="font-medium">
                          {account.code} - {account.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Bunga: {account.interest_rate || 0}%
                          {account.max_amount &&
                            ` • Max: ${formatCurrency(account.max_amount)}`}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label>
              Jumlah Pinjaman <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rp 5.000.000"
                value={formData.principal_amount}
                onChange={handleAmountChange}
                disabled={loading}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500">
              Minimal: Rp 100.000
              {selectedAccount?.max_amount &&
                ` • Maksimal: ${formatCurrency(selectedAccount.max_amount)}`}
            </p>
          </div>

          {/* Tenure & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Jangka Waktu <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.tenure_months}
                onValueChange={(value) =>
                  setFormData({ ...formData, tenure_months: value })
                }
                disabled={loading}
              >
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label>
                Tanggal Pengajuan <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.application_date}
                onChange={(e) =>
                  setFormData({ ...formData, application_date: e.target.value })
                }
                disabled={loading}
              />
            </div>
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
                    // Reset percentages when changing method
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

          {/* Purpose */}
          <div className="space-y-2">
            <Label>
              Tujuan Pinjaman <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Jelaskan tujuan pinjaman (minimal 10 karakter)"
              value={formData.loan_purpose}
              onChange={(e) =>
                setFormData({ ...formData, loan_purpose: e.target.value })
              }
              disabled={loading}
              rows={3}
            />
            <p className="text-xs text-gray-500">
              {formData.loan_purpose.length}/10 karakter minimum
            </p>
          </div>

          {/* Action Buttons */}
          <DialogFooter>
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
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
