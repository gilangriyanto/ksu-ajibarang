// components/modals/AddMemberModal.tsx
// ✅ UPDATED: Shows auto-generated employee_id (nomor anggota) after creation
// ✅ Backend auto-generates employee_id — no manual input needed

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  Mail,
  Phone,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle,
  Lock,
  Shield,
  MapPin,
  Calendar,
  Copy,
  Hash,
} from "lucide-react";
import { useMembers } from "@/hooks/useMembers";
import { memberService } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api/api-client";
import { toast } from "sonner";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CashAccount {
  id: number;
  name: string;
  code: string;
}

export function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    date_of_birth: "",
    join_date: new Date().toISOString().split("T")[0],
    password: "",
    password_confirmation: "",
    role: "anggota",
    cash_account_ids: [] as number[],
  });

  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);
  const [loadingCashAccounts, setLoadingCashAccounts] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ NEW: Store the created member data (with auto-generated employee_id)
  const [createdMember, setCreatedMember] = useState<{
    employee_id: string;
    full_name: string;
    id: number;
  } | null>(null);

  const { refetch } = useMembers();

  useEffect(() => {
    if (isOpen) {
      fetchCashAccounts();
    }
  }, [isOpen]);

  const fetchCashAccounts = async () => {
    setLoadingCashAccounts(true);
    try {
      const response = await api.get("/cash-accounts");
      if (response.data && Array.isArray(response.data.data)) {
        setCashAccounts(response.data.data);
      } else if (Array.isArray(response.data)) {
        setCashAccounts(response.data);
      }
    } catch (error) {
      console.error("Error loading cash accounts:", error);
    } finally {
      setLoadingCashAccounts(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Nama lengkap wajib diisi";
    if (!formData.email.trim()) newErrors.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Format email tidak valid";
    if (!formData.phone.trim()) newErrors.phone = "Nomor telepon wajib diisi";
    else if (!/^[0-9+\-\s()]+$/.test(formData.phone))
      newErrors.phone = "Format nomor telepon tidak valid";
    if (!formData.address.trim()) newErrors.address = "Alamat wajib diisi";
    if (!formData.date_of_birth)
      newErrors.date_of_birth = "Tanggal lahir wajib diisi";
    if (!formData.join_date)
      newErrors.join_date = "Tanggal bergabung wajib diisi";
    if (!formData.password) newErrors.password = "Password wajib diisi";
    else if (formData.password.length < 8)
      newErrors.password = "Password minimal 8 karakter";
    if (!formData.password_confirmation)
      newErrors.password_confirmation = "Konfirmasi password wajib diisi";
    else if (formData.password !== formData.password_confirmation)
      newErrors.password_confirmation = "Password tidak cocok";
    if (!formData.role) newErrors.role = "Role wajib dipilih";
    if (formData.role === "manager" && formData.cash_account_ids.length === 0) {
      newErrors.cash_account_ids = "Manager harus mengelola minimal 1 kas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const submitData: any = {
        full_name: formData.name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone.trim(),
        address: formData.address.trim(),
        date_of_birth: formData.date_of_birth,
        join_date: formData.join_date,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: formData.role,
      };

      // ✅ NOTE: employee_id is NOT sent — backend auto-generates it
      // Do NOT include employee_id in submitData

      if (formData.role === "manager" && formData.cash_account_ids.length > 0) {
        submitData.cash_account_ids = formData.cash_account_ids;
      }

      console.log(
        "📤 Creating member (employee_id auto-generated by backend):",
        submitData,
      );

      const response: any = await memberService.createMember(submitData);

      // ✅ Extract auto-generated employee_id from response
      // Handle both: direct Member object OR nested { data: { data: Member } }
      const memberData = response?.data?.data || response?.data || response;
      console.log("✅ Member created response:", response);
      console.log("✅ Parsed member data:", memberData);

      const generatedId =
        memberData?.employee_id || memberData?.user?.employee_id || null;
      const generatedName =
        memberData?.full_name || memberData?.user?.full_name || formData.name;
      const memberId = memberData?.id || memberData?.user?.id || 0;

      setCreatedMember({
        employee_id: generatedId || "—",
        full_name: generatedName,
        id: memberId || 0,
      });

      setSuccess(true);
      await refetch();

      // ✅ Show toast with the generated ID
      if (generatedId) {
        toast.success(
          `Anggota berhasil ditambahkan! Nomor Anggota: ${generatedId}`,
        );
      } else {
        toast.success("Anggota berhasil ditambahkan!");
      }
    } catch (error: any) {
      console.error("Error adding member:", error);
      console.error("Error response:", error.response?.data);

      // ✅ Handle validation errors from backend
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const formErrors: Record<string, string> = {};
        Object.keys(apiErrors).forEach((key) => {
          const fieldMap: Record<string, string> = {
            full_name: "name",
            phone_number: "phone",
            employee_id: "employee_id",
          };
          const formKey = fieldMap[key] || key;
          formErrors[formKey] = Array.isArray(apiErrors[key])
            ? apiErrors[key][0]
            : apiErrors[key];
        });
        setErrors(formErrors);
      }

      setErrorMsg(
        error.response?.data?.message ||
          error.message ||
          "Gagal menambahkan anggota",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number[] | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    if (field === "role" && value !== "manager") {
      setFormData((prev) => ({ ...prev, cash_account_ids: [] }));
    }
  };

  const handleCashAccountToggle = (kasId: number) => {
    setFormData((prev) => {
      const newIds = prev.cash_account_ids.includes(kasId)
        ? prev.cash_account_ids.filter((id) => id !== kasId)
        : [...prev.cash_account_ids, kasId];
      return { ...prev, cash_account_ids: newIds };
    });
    if (errors.cash_account_ids)
      setErrors((prev) => {
        const n = { ...prev };
        delete n.cash_account_ids;
        return n;
      });
  };

  // ✅ Copy employee_id to clipboard
  const handleCopyId = () => {
    if (createdMember?.employee_id) {
      navigator.clipboard.writeText(createdMember.employee_id);
      toast.success("Nomor anggota berhasil disalin!");
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      date_of_birth: "",
      join_date: new Date().toISOString().split("T")[0],
      password: "",
      password_confirmation: "",
      role: "anggota",
      cash_account_ids: [],
    });
    setErrors({});
    setSuccess(false);
    setErrorMsg("");
    setIsSubmitting(false);
    setCreatedMember(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Tambah Anggota Baru</span>
          </DialogTitle>
          <DialogDescription>
            Masukkan informasi lengkap untuk mendaftarkan anggota baru. Nomor
            anggota akan dibuat otomatis oleh sistem.
          </DialogDescription>
        </DialogHeader>

        {/* ✅ SUCCESS: Show auto-generated employee_id prominently */}
        {success && createdMember && (
          <div className="space-y-3">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Anggota <strong>{createdMember.full_name}</strong> berhasil
                ditambahkan!
              </AlertDescription>
            </Alert>

            {/* ✅ Auto-generated ID card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Nomor Anggota (Auto-Generated)
                  </p>
                  <p className="text-2xl font-bold font-mono text-blue-900 mt-1">
                    {createdMember.employee_id}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    {createdMember.full_name}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyId}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Copy className="h-4 w-4 mr-1" /> Salin
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleClose}>Tutup</Button>
            </div>
          </div>
        )}

        {/* FORM - hide when success */}
        {!success && (
          <>
            {errorMsg && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {errorMsg}
                </AlertDescription>
              </Alert>
            )}

            {/* ✅ Info: Employee ID is auto-generated */}
            <Alert className="border-blue-200 bg-blue-50">
              <Hash className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                Nomor anggota akan <strong>dibuat otomatis</strong> oleh sistem
                saat pendaftaran berhasil.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ===== Personal Data ===== */}
              <div className="space-y-4 pb-4 border-b">
                <h3 className="text-sm font-semibold text-gray-700">
                  Data Pribadi
                </h3>

                <div className="space-y-2">
                  <Label>
                    Nama Lengkap <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Masukkan nama lengkap"
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="email@example.com"
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Nomor Telepon <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="08xxxxxxxxxx"
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Alamat <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="Masukkan alamat lengkap"
                      className="pl-10 min-h-[80px]"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-sm text-red-600">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Tanggal Lahir <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) =>
                          handleInputChange("date_of_birth", e.target.value)
                        }
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.date_of_birth && (
                      <p className="text-sm text-red-600">
                        {errors.date_of_birth}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Tanggal Bergabung <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="date"
                        value={formData.join_date}
                        onChange={(e) =>
                          handleInputChange("join_date", e.target.value)
                        }
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.join_date && (
                      <p className="text-sm text-red-600">{errors.join_date}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ===== Account Data ===== */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  Data Akun
                </h3>

                <div className="space-y-2">
                  <Label>
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                    <Select
                      value={formData.role}
                      onValueChange={(v) => handleInputChange("role", v)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anggota">
                          Member (Anggota)
                        </SelectItem>
                        <SelectItem value="manager">
                          Manager (Admin Kas)
                        </SelectItem>
                        <SelectItem value="admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.role && (
                    <p className="text-sm text-red-600">{errors.role}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {formData.role === "anggota" &&
                      "✓ Member adalah anggota biasa koperasi"}
                    {formData.role === "manager" &&
                      "✓ Manager mengelola satu atau lebih kas"}
                    {formData.role === "admin" &&
                      "✓ Super Admin memiliki akses penuh ke seluruh sistem"}
                  </p>
                </div>

                {/* Cash Accounts for Manager */}
                {formData.role === "manager" && (
                  <div className="space-y-2">
                    <Label>
                      Kas yang Dikelola <span className="text-red-500">*</span>
                    </Label>
                    {loadingCashAccounts ? (
                      <div className="py-4 text-center text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                        Memuat data kas...
                      </div>
                    ) : (
                      <div className="border rounded-md p-4 space-y-3 max-h-48 overflow-y-auto">
                        {cashAccounts.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-2">
                            Tidak ada kas tersedia
                          </p>
                        ) : (
                          cashAccounts.map((kas) => (
                            <div
                              key={kas.id}
                              className="flex items-center space-x-3"
                            >
                              <Checkbox
                                id={`kas-${kas.id}`}
                                checked={formData.cash_account_ids.includes(
                                  kas.id,
                                )}
                                onCheckedChange={() =>
                                  handleCashAccountToggle(kas.id)
                                }
                                disabled={isSubmitting}
                              />
                              <label
                                htmlFor={`kas-${kas.id}`}
                                className="text-sm font-medium leading-none cursor-pointer flex-1"
                              >
                                <span className="font-semibold">
                                  {kas.code}
                                </span>{" "}
                                - {kas.name}
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    {errors.cash_account_ids && (
                      <p className="text-sm text-red-600">
                        {errors.cash_account_ids}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formData.cash_account_ids.length === 0
                        ? "Pilih minimal 1 kas"
                        : `✓ ${formData.cash_account_ids.length} kas dipilih`}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Minimal 8 karakter"
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Konfirmasi Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      value={formData.password_confirmation}
                      onChange={(e) =>
                        handleInputChange(
                          "password_confirmation",
                          e.target.value,
                        )
                      }
                      placeholder="Ulangi password"
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.password_confirmation && (
                    <p className="text-sm text-red-600">
                      {errors.password_confirmation}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-6">
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
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menambahkan...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Tambah Anggota
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
