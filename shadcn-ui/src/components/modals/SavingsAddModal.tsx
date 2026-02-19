// components/modals/SavingsAddModal.tsx
// ✅ REWRITTEN: Payload matches Postman collection EXACTLY
// ✅ POST /savings body: { user_id, cash_account_id, saving_type_id|savings_type, amount, transaction_date, notes }

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
import { PiggyBank, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api/api-client";

// =====================================================
// Types
// =====================================================
interface Member {
  id: number;
  full_name: string;
  employee_id: string;
}

interface SavingTypeFromAPI {
  id: number;
  code: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

interface SavingsAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Fallback: when /saving-types returns empty
const FALLBACK_TYPES = [
  { code: "principal", name: "Simpanan Pokok" },
  { code: "mandatory", name: "Simpanan Wajib" },
  { code: "voluntary", name: "Simpanan Sukarela" },
  { code: "holiday", name: "Simpanan Hari Raya" },
];

export function SavingsAddModal({
  isOpen,
  onClose,
  onSuccess,
}: SavingsAddModalProps) {
  // =====================================================
  // State
  // =====================================================
  const [members, setMembers] = useState<Member[]>([]);
  const [savingTypes, setSavingTypes] = useState<SavingTypeFromAPI[]>([]);
  const [useFallback, setUseFallback] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingSavingTypes, setLoadingSavingTypes] = useState(false);

  // Form fields — stored as strings from Select, parsed to number on submit
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedTypeValue, setSelectedTypeValue] = useState(""); // saving_type_id (number as string) OR savings_type code (string)
  const [selectedCashAccountId, setSelectedCashAccountId] = useState("1");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [backendError, setBackendError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =====================================================
  // Load data
  // =====================================================
  useEffect(() => {
    if (isOpen) {
      loadMembers();
      loadSavingTypes();
      // Reset form
      setSelectedUserId("");
      setSelectedTypeValue("");
      setSelectedCashAccountId("1");
      setTransactionDate(new Date().toISOString().split("T")[0]);
      setAmount("");
      setNotes("");
      setErrors({});
      setBackendError("");
    }
  }, [isOpen]);

  const loadMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await apiClient.get("/members", {
        params: { status: "active" },
      });
      const data = response.data?.data || response.data || [];
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading members:", err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadSavingTypes = async () => {
    try {
      setLoadingSavingTypes(true);
      let typesData: SavingTypeFromAPI[] = [];

      try {
        const response = await apiClient.get("/saving-types");
        console.log("📦 /saving-types response:", response.data);
        const raw = response.data?.data || response.data;
        typesData = Array.isArray(raw) ? raw : [];
      } catch {
        typesData = [];
      }

      if (typesData.length === 0) {
        try {
          const response = await apiClient.get("/saving-types/defaults");
          const raw = response.data?.data || response.data;
          typesData = Array.isArray(raw) ? raw : [];
        } catch {
          /* ignore */
        }
      }

      console.log(`✅ Got ${typesData.length} saving types from API`);

      if (typesData.length > 0) {
        setSavingTypes(typesData);
        setUseFallback(false);
      } else {
        setSavingTypes([]);
        setUseFallback(true);
      }
    } catch {
      setUseFallback(true);
    } finally {
      setLoadingSavingTypes(false);
    }
  };

  // =====================================================
  // Validate
  // =====================================================
  const validateForm = (): boolean => {
    const e: Record<string, string> = {};
    if (!selectedUserId) e.user_id = "Anggota harus dipilih";
    if (!selectedTypeValue) e.type = "Jenis simpanan harus dipilih";
    if (!selectedCashAccountId) e.cash_account_id = "Kas harus dipilih";
    if (!transactionDate) e.transaction_date = "Tanggal harus diisi";
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt <= 0)
      e.amount = "Jumlah harus lebih dari 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // =====================================================
  // Submit — match Postman EXACTLY
  // =====================================================
  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setBackendError("");

    try {
      // ✅ Build payload matching Postman collection EXACTLY:
      //
      // NEW style (saving_type_id):
      //   { user_id: 5, cash_account_id: 1, saving_type_id: 1, amount: 500000, transaction_date: "2026-02-01", notes: "..." }
      //
      // OLD style (savings_type string):
      //   { user_id: 3, cash_account_id: 1, savings_type: "mandatory", amount: 100000, transaction_date: "2026-02-13", notes: "..." }

      const payload: Record<string, any> = {
        user_id: Number(selectedUserId),
        cash_account_id: Number(selectedCashAccountId),
        amount: Number(amount),
        transaction_date: transactionDate,
        notes: notes || "",
      };

      if (!useFallback) {
        // API mode — saving_type_id is a number
        payload.saving_type_id = Number(selectedTypeValue);
      } else {
        // Fallback mode — savings_type is a string code like "mandatory"
        payload.savings_type = selectedTypeValue;
      }

      // ✅ Log exact payload before sending
      console.log(
        "📤 POST /savings payload:",
        JSON.stringify(payload, null, 2),
      );
      console.log("📤 Types:", {
        user_id: typeof payload.user_id,
        cash_account_id: typeof payload.cash_account_id,
        saving_type_id: typeof payload.saving_type_id,
        savings_type: typeof payload.savings_type,
        amount: typeof payload.amount,
      });

      const response = await apiClient.post("/savings", payload);
      console.log("✅ Savings created:", response.data);

      toast.success("Simpanan berhasil ditambahkan");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("❌ Error creating savings:", error);

      // ✅ Extract and display FULL backend error for debugging
      const respData = error.response?.data;
      console.error("🔴 Backend response:", JSON.stringify(respData, null, 2));

      if (respData?.errors) {
        // Validation errors — show each field
        const apiErrors = respData.errors;
        const formErrors: Record<string, string> = {};
        const errorMessages: string[] = [];

        Object.entries(apiErrors).forEach(([key, val]: [string, any]) => {
          const msg = Array.isArray(val) ? val[0] : String(val);
          formErrors[key] = msg;
          errorMessages.push(`${key}: ${msg}`);
        });

        setErrors(formErrors);
        // ✅ Show ALL validation errors for debugging
        setBackendError(`Validation Error:\n${errorMessages.join("\n")}`);
        toast.error(errorMessages[0] || "Validasi gagal");
      } else {
        const msg =
          respData?.message || error.message || "Gagal menambahkan simpanan";
        setBackendError(msg);
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // Helpers
  // =====================================================
  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amt);

  const selectedMember = members.find((m) => m.id === Number(selectedUserId));
  const selectedTypeName = useFallback
    ? FALLBACK_TYPES.find((t) => t.code === selectedTypeValue)?.name
    : savingTypes.find((t) => String(t.id) === selectedTypeValue)?.name;

  // =====================================================
  // Render
  // =====================================================
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PiggyBank className="h-5 w-5" />
            <span>Tambah Simpanan</span>
          </DialogTitle>
          <DialogDescription>
            Tambahkan simpanan baru untuk anggota
          </DialogDescription>
        </DialogHeader>

        {/* ✅ Show backend error prominently for debugging */}
        {backendError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 whitespace-pre-wrap text-xs font-mono">
              {backendError}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ===== Anggota ===== */}
          <div className="space-y-2">
            <Label>
              Pilih Anggota <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              disabled={loadingMembers}
            >
              <SelectTrigger className={errors.user_id ? "border-red-500" : ""}>
                <SelectValue
                  placeholder={loadingMembers ? "Memuat..." : "Pilih anggota"}
                />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.employee_id} - {m.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.user_id && (
              <p className="text-sm text-red-600">{errors.user_id}</p>
            )}
          </div>

          {/* ===== Jenis Simpanan ===== */}
          <div className="space-y-2">
            <Label>
              Jenis Simpanan <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedTypeValue}
              onValueChange={setSelectedTypeValue}
              disabled={loadingSavingTypes}
            >
              <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                <SelectValue
                  placeholder={
                    loadingSavingTypes ? "Memuat..." : "Pilih jenis simpanan"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {useFallback
                  ? FALLBACK_TYPES.map((t) => (
                      <SelectItem key={t.code} value={t.code}>
                        {t.name}
                      </SelectItem>
                    ))
                  : savingTypes.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                        {t.description ? ` — ${t.description}` : ""}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type}</p>
            )}
            {errors.saving_type_id && (
              <p className="text-sm text-red-600">{errors.saving_type_id}</p>
            )}
            {errors.savings_type && (
              <p className="text-sm text-red-600">{errors.savings_type}</p>
            )}
          </div>

          {/* ===== Kas ===== */}
          <div className="space-y-2">
            <Label>
              Kas <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedCashAccountId}
              onValueChange={setSelectedCashAccountId}
            >
              <SelectTrigger
                className={errors.cash_account_id ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Pilih kas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Kas 1 - Kas Utama</SelectItem>
                <SelectItem value="2">Kas 2 - Kas Barang</SelectItem>
                <SelectItem value="3">Kas 3 - Kas Khusus</SelectItem>
                <SelectItem value="4">Kas 4 - Kas Kantin</SelectItem>
              </SelectContent>
            </Select>
            {errors.cash_account_id && (
              <p className="text-sm text-red-600">{errors.cash_account_id}</p>
            )}
          </div>

          {/* ===== Tanggal ===== */}
          <div className="space-y-2">
            <Label>
              Tanggal Transaksi <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className={errors.transaction_date ? "border-red-500" : ""}
            />
            {errors.transaction_date && (
              <p className="text-sm text-red-600">{errors.transaction_date}</p>
            )}
          </div>

          {/* ===== Jumlah ===== */}
          <div className="space-y-2">
            <Label>
              Jumlah Simpanan <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-sm text-gray-500 font-medium">
                Rp
              </span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className={`pl-10 ${errors.amount ? "border-red-500" : ""}`}
                min="0"
                step="1000"
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* ===== Notes ===== */}
          <div className="space-y-2">
            <Label>Keterangan</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Keterangan tambahan (opsional)"
              rows={3}
            />
          </div>

          {/* ===== Ringkasan ===== */}
          {Number(amount) > 0 && selectedMember && selectedTypeName && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">
                Ringkasan Simpanan
              </h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-blue-700">Anggota:</span>
                  <span className="font-medium">
                    {selectedMember.full_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Jenis:</span>
                  <span className="font-medium">{selectedTypeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Jumlah:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(Number(amount))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Tanggal:</span>
                  <span className="font-medium">
                    {new Date(transactionDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
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
              disabled={isSubmitting || loadingMembers || loadingSavingTypes}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <PiggyBank className="h-4 w-4 mr-2" />
                  Tambah Simpanan
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SavingsAddModal;
