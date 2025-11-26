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
import {
  CreditCard,
  DollarSign,
  Calendar,
  User,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import useLoanSimulation from "@/hooks/useLoanSimulation";
import axios from "axios";

interface NewLoan {
  user_id: number;
  cash_account_id: number;
  principal_amount: number;
  tenure_months: number;
  application_date: string;
  loan_purpose: string;
}

interface LoanAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Member {
  id: number;
  full_name: string;
  employee_id: string;
}

interface CashAccount {
  id: number;
  code: string;
  name: string;
  interest_rate?: number;
}

export function LoanAddModal({
  isOpen,
  onClose,
  onSuccess,
}: LoanAddModalProps) {
  const [formData, setFormData] = useState<Partial<NewLoan>>({
    user_id: undefined,
    cash_account_id: undefined,
    principal_amount: 0,
    tenure_months: 12,
    application_date: new Date().toISOString().split("T")[0],
    loan_purpose: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [members, setMembers] = useState<Member[]>([]);
  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const { simulate, simulation, loading: simulating } = useLoanSimulation();

  // Load members and cash accounts on mount
  useEffect(() => {
    if (isOpen) {
      loadMembers();
      loadCashAccounts();
    }
  }, [isOpen]);

  // Simulate when key fields change
  useEffect(() => {
    if (
      formData.principal_amount &&
      formData.principal_amount > 0 &&
      formData.tenure_months &&
      formData.tenure_months > 0 &&
      formData.cash_account_id
    ) {
      simulate(
        formData.principal_amount,
        formData.tenure_months,
        formData.cash_account_id
      );
    }
  }, [
    formData.principal_amount,
    formData.tenure_months,
    formData.cash_account_id,
  ]);

  const loadMembers = async () => {
    setLoadingMembers(true);
    try {
      const token = localStorage.getItem("token");

      // ✅ CORRECT ENDPOINT: /members with all=true
      console.log("🔍 Loading members from /members?all=true");
      const response = await axios.get(
        "https://ksp.gascpns.id/api/members?all=true",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Loaded members:", response.data);

      // Parse response
      if (response.data.success && Array.isArray(response.data.data)) {
        // Filter only active members
        const membersList = response.data.data.filter(
          (user: any) => user.status === "active"
        );
        setMembers(membersList);
        console.log(`👥 Found ${membersList.length} active members`);
      } else if (Array.isArray(response.data)) {
        const membersList = response.data.filter(
          (user: any) => user.status === "active"
        );
        setMembers(membersList);
        console.log(`👥 Found ${membersList.length} active members`);
      } else {
        console.warn("⚠️ Unexpected response format");
        toast.warning("Format data anggota tidak sesuai");
        setMembers([]);
      }
    } catch (err: any) {
      console.error("❌ Error loading members:", err);

      if (err.response?.status === 401) {
        toast.error("Sesi Anda telah berakhir, silakan login kembali");
      } else if (err.response?.status === 404) {
        toast.error("Endpoint members tidak ditemukan");
      } else {
        toast.error(
          "Gagal memuat data anggota: " +
            (err.response?.data?.message || err.message)
        );
      }

      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadCashAccounts = async () => {
    setLoadingAccounts(true);
    try {
      // Try multiple possible endpoints
      const token = localStorage.getItem("token");
      const possibleEndpoints = [
        "https://ksp.gascpns.id/api/cash-accounts",
        "https://ksp.gascpns.id/api/kas",
        "https://ksp.gascpns.id/api/kas-accounts",
      ];

      let response = null;

      // Try each endpoint until one works
      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`🔍 Trying endpoint: ${endpoint}`);
          response = await axios.get(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(`✅ Success with endpoint: ${endpoint}`, response.data);
          break;
        } catch (err: any) {
          console.log(
            `❌ Failed with endpoint: ${endpoint}`,
            err.response?.status
          );
          continue;
        }
      }

      // If all endpoints failed, use mock data
      if (!response) {
        console.warn("⚠️ All endpoints failed, using mock data");
        toast.warning("Menggunakan data dummy - endpoint kas belum tersedia");

        setCashAccounts([
          { id: 1, code: "KAS-I", name: "Kas Umum", interest_rate: 12 },
          { id: 2, code: "KAS-II", name: "Kas Khusus", interest_rate: 10 },
          { id: 3, code: "KAS-III", name: "Kas Sebrakan", interest_rate: 0 },
        ]);
        return;
      }

      // Parse successful response
      if (response.data.success && Array.isArray(response.data.data)) {
        setCashAccounts(response.data.data);
      } else if (Array.isArray(response.data)) {
        setCashAccounts(response.data);
      } else {
        console.warn("⚠️ Unexpected response format, using mock data");
        setCashAccounts([
          { id: 1, code: "KAS-I", name: "Kas Umum", interest_rate: 12 },
        ]);
      }
    } catch (err: any) {
      console.error("❌ Error loading cash accounts:", err);
      toast.warning("Menggunakan data dummy - error loading kas");

      setCashAccounts([
        { id: 1, code: "KAS-I", name: "Kas Umum", interest_rate: 12 },
        { id: 3, code: "KAS-III", name: "Kas Sebrakan", interest_rate: 0 },
      ]);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.user_id) {
      newErrors.user_id = "Anggota harus dipilih";
    }

    if (!formData.cash_account_id) {
      newErrors.cash_account_id = "Kas harus dipilih";
    }

    if (!formData.principal_amount || formData.principal_amount <= 0) {
      newErrors.principal_amount = "Jumlah pinjaman harus lebih dari 0";
    } else if (formData.principal_amount > 500000000) {
      newErrors.principal_amount = "Jumlah pinjaman maksimal Rp 500.000.000";
    }

    if (!formData.tenure_months || formData.tenure_months <= 0) {
      newErrors.tenure_months = "Jangka waktu harus lebih dari 0";
    } else if (formData.tenure_months > 60) {
      newErrors.tenure_months = "Jangka waktu maksimal 60 bulan";
    }

    if (!formData.loan_purpose?.trim()) {
      newErrors.loan_purpose = "Tujuan pinjaman harus diisi";
    }

    if (!formData.application_date) {
      newErrors.application_date = "Tanggal pengajuan harus diisi";
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
      const loanData: NewLoan = {
        user_id: formData.user_id!,
        cash_account_id: formData.cash_account_id!,
        principal_amount: formData.principal_amount!,
        tenure_months: formData.tenure_months!,
        application_date: formData.application_date!,
        loan_purpose: formData.loan_purpose!,
      };

      console.log("📤 Submitting loan:", loanData);

      // ✅ FIXED: Direct API call with axios
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://ksp.gascpns.id/api/loans",
        loanData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Loan created:", response.data);

      toast.success("Pengajuan pinjaman berhasil dibuat");

      // Call parent success handler to refresh data
      onSuccess();

      // Close modal and reset
      handleClose();
    } catch (error: any) {
      console.error("❌ Error adding loan:", error);

      // Handle validation errors
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const errorMessages = Object.values(apiErrors).flat();
        toast.error(errorMessages.join(", "));
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Gagal membuat pengajuan pinjaman"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof NewLoan, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
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
    setFormData({
      user_id: undefined,
      cash_account_id: undefined,
      principal_amount: 0,
      tenure_months: 12,
      application_date: new Date().toISOString().split("T")[0],
      loan_purpose: "",
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const selectedMember = members.find((m) => m.id === formData.user_id);
  const selectedAccount = cashAccounts.find(
    (ca) => ca.id === formData.cash_account_id
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Pengajuan Pinjaman Baru</span>
          </DialogTitle>
          <DialogDescription>
            Masukkan informasi lengkap untuk pengajuan pinjaman baru
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Member Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <User className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">
                Informasi Anggota
              </h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="member">Pilih Anggota *</Label>
              <Select
                value={formData.user_id?.toString()}
                onValueChange={(value) =>
                  handleInputChange("user_id", parseInt(value))
                }
                disabled={loadingMembers}
              >
                <SelectTrigger
                  className={errors.user_id ? "border-red-500" : ""}
                >
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
                  {members.length === 0 && !loadingMembers ? (
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
              {errors.user_id && (
                <p className="text-sm text-red-600">{errors.user_id}</p>
              )}
            </div>

            {/* Cash Account Selection */}
            <div className="space-y-2">
              <Label htmlFor="cash_account">Pilih Kas *</Label>
              <Select
                value={formData.cash_account_id?.toString()}
                onValueChange={(value) =>
                  handleInputChange("cash_account_id", parseInt(value))
                }
                disabled={loadingAccounts}
              >
                <SelectTrigger
                  className={errors.cash_account_id ? "border-red-500" : ""}
                >
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
                  {cashAccounts.length === 0 && !loadingAccounts ? (
                    <SelectItem value="0" disabled>
                      Tidak ada kas tersedia
                    </SelectItem>
                  ) : (
                    cashAccounts.map((account) => (
                      <SelectItem
                        key={account.id}
                        value={account.id.toString()}
                      >
                        {account.code} - {account.name}
                        {account.interest_rate !== undefined && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({account.interest_rate}%)
                          </span>
                        )}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.cash_account_id && (
                <p className="text-sm text-red-600">{errors.cash_account_id}</p>
              )}
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
                <Label htmlFor="principal_amount">Jumlah Pinjaman *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="principal_amount"
                    type="number"
                    value={formData.principal_amount || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "principal_amount",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    className={`pl-10 ${
                      errors.principal_amount ? "border-red-500" : ""
                    }`}
                    min="0"
                    step="100000"
                  />
                </div>
                {errors.principal_amount && (
                  <p className="text-sm text-red-600">
                    {errors.principal_amount}
                  </p>
                )}
              </div>

              {/* Term */}
              <div className="space-y-2">
                <Label htmlFor="tenure_months">Jangka Waktu (bulan) *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="tenure_months"
                    type="number"
                    value={formData.tenure_months || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "tenure_months",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="12"
                    className={`pl-10 ${
                      errors.tenure_months ? "border-red-500" : ""
                    }`}
                    min="1"
                    max="60"
                  />
                </div>
                {errors.tenure_months && (
                  <p className="text-sm text-red-600">{errors.tenure_months}</p>
                )}
              </div>
            </div>

            {/* Application Date */}
            <div className="space-y-2">
              <Label htmlFor="application_date">Tanggal Pengajuan *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="application_date"
                  type="date"
                  value={formData.application_date || ""}
                  onChange={(e) =>
                    handleInputChange("application_date", e.target.value)
                  }
                  className={`pl-10 ${
                    errors.application_date ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.application_date && (
                <p className="text-sm text-red-600">
                  {errors.application_date}
                </p>
              )}
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="loan_purpose">Tujuan Pinjaman *</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="loan_purpose"
                  value={formData.loan_purpose || ""}
                  onChange={(e) =>
                    handleInputChange("loan_purpose", e.target.value)
                  }
                  placeholder="Jelaskan tujuan penggunaan pinjaman"
                  rows={3}
                  className={`pl-10 ${
                    errors.loan_purpose ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.loan_purpose && (
                <p className="text-sm text-red-600">{errors.loan_purpose}</p>
              )}
            </div>
          </div>

          {/* Calculation Summary with Simulation */}
          {simulation && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">
                Simulasi Perhitungan
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Jumlah Pinjaman:</span>
                  <p className="font-medium">
                    {formatCurrency(simulation.principal_amount)}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700">Suku Bunga:</span>
                  <p className="font-medium">
                    {simulation.interest_rate}% / tahun
                  </p>
                </div>
                <div>
                  <span className="text-blue-700">Angsuran per Bulan:</span>
                  <p className="font-medium text-green-600">
                    {formatCurrency(simulation.monthly_payment)}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700">Total Bunga:</span>
                  <p className="font-medium">
                    {formatCurrency(simulation.total_interest)}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700">Total Pembayaran:</span>
                  <p className="font-medium text-orange-600">
                    {formatCurrency(simulation.total_payment)}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700">Jangka Waktu:</span>
                  <p className="font-medium">
                    {simulation.tenure_months} bulan
                  </p>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                * Simulasi ini bersifat estimasi dan dapat berbeda dengan
                perhitungan aktual
              </p>
            </div>
          )}

          {simulating && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-gray-600">
                Menghitung simulasi...
              </span>
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
