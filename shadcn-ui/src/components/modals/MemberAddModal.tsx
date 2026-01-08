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
  Wallet,
  MapPin,
  Calendar,
} from "lucide-react";
import { useMembers } from "@/hooks/useMembers";
import { memberService, cashAccountService } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";

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
    role: "member", // default role
    cash_account_id: null as number | null,
  });

  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);
  const [loadingCashAccounts, setLoadingCashAccounts] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { refetch } = useMembers();

  // Fetch cash accounts when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCashAccounts();
    }
  }, [isOpen]);

  const fetchCashAccounts = async () => {
    setLoadingCashAccounts(true);
    try {
      const response = await cashAccountService.getCashAccounts();
      console.log("📦 Cash accounts loaded:", response);

      if (response && Array.isArray(response.data)) {
        setCashAccounts(response.data);
      } else if (Array.isArray(response)) {
        setCashAccounts(response);
      }
    } catch (error) {
      console.error("❌ Error loading cash accounts:", error);
      // Not critical, modal can still open
    } finally {
      setLoadingCashAccounts(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Nama lengkap wajib diisi";
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = "Nomor telepon wajib diisi";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = "Format nomor telepon tidak valid";
    }

    // Validate address
    if (!formData.address.trim()) {
      newErrors.address = "Alamat wajib diisi";
    }

    // Validate date of birth
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Tanggal lahir wajib diisi";
    }

    // Validate join date
    if (!formData.join_date) {
      newErrors.join_date = "Tanggal bergabung wajib diisi";
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
    }

    // Validate password confirmation
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = "Konfirmasi password wajib diisi";
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Password tidak cocok";
    }

    // Validate role
    if (!formData.role) {
      newErrors.role = "Role wajib dipilih";
    }

    // Validate cash account for super_admin
    if (formData.role === "super_admin" && !formData.cash_account_id) {
      newErrors.cash_account_id = "Manager Kas wajib dipilih untuk Super Admin";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // Prepare data to submit
      const submitData: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        date_of_birth: formData.date_of_birth,
        join_date: formData.join_date,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: formData.role,
      };

      // Add cash_account_id only for super_admin
      if (formData.role === "super_admin" && formData.cash_account_id) {
        submitData.cash_account_id = formData.cash_account_id;
      }

      console.log("📤 Sending member data:", submitData);

      // Call API to create member
      await memberService.createMember(submitData);

      setSuccess(true);

      // Refetch members list
      await refetch();

      // Close modal after 1.5 seconds
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error: any) {
      console.error("Error adding member:", error);
      console.error("Error response:", error.response?.data);

      setErrorMsg(
        error.response?.data?.message ||
          error.message ||
          "Gagal menambahkan anggota"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Reset cash_account_id when role changes to member
    if (field === "role" && value === "member") {
      setFormData((prev) => ({ ...prev, cash_account_id: null }));
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      date_of_birth: "",
      join_date: new Date().toISOString().split("T")[0],
      password: "",
      password_confirmation: "",
      role: "member",
      cash_account_id: null,
    });
    setErrors({});
    setSuccess(false);
    setErrorMsg("");
    setIsSubmitting(false);
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
            Masukkan informasi lengkap untuk mendaftarkan anggota baru
          </DialogDescription>
        </DialogHeader>

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Anggota berhasil ditambahkan!
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {errorMsg}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data Pribadi Section */}
          <div className="space-y-4 pb-4 border-b">
            <h3 className="text-sm font-semibold text-gray-700">
              Data Pribadi
            </h3>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="pl-10"
                  disabled={isSubmitting || success}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@example.com"
                  className="pl-10"
                  disabled={isSubmitting || success}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                Nomor Telepon <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="pl-10"
                  disabled={isSubmitting || success}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">
                Alamat <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Masukkan alamat lengkap"
                  className="pl-10 min-h-[80px]"
                  disabled={isSubmitting || success}
                />
              </div>
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">
                Tanggal Lahir <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    handleInputChange("date_of_birth", e.target.value)
                  }
                  className="pl-10"
                  disabled={isSubmitting || success}
                />
              </div>
              {errors.date_of_birth && (
                <p className="text-sm text-red-600">{errors.date_of_birth}</p>
              )}
            </div>

            {/* Join Date */}
            <div className="space-y-2">
              <Label htmlFor="join_date">
                Tanggal Bergabung <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="join_date"
                  type="date"
                  value={formData.join_date}
                  onChange={(e) =>
                    handleInputChange("join_date", e.target.value)
                  }
                  className="pl-10"
                  disabled={isSubmitting || success}
                />
              </div>
              {errors.join_date && (
                <p className="text-sm text-red-600">{errors.join_date}</p>
              )}
            </div>
          </div>

          {/* Data Akun Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Data Akun</h3>

            {/* Role Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                  disabled={isSubmitting || success}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="super_admin">
                      Super Admin (Manager)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.role && (
                <p className="text-sm text-red-600">{errors.role}</p>
              )}
              <p className="text-xs text-gray-500">
                {formData.role === "member" &&
                  "✓ Member adalah anggota biasa koperasi"}
                {formData.role === "super_admin" &&
                  "✓ Super Admin dapat mengelola kas sebagai Manager"}
              </p>
            </div>

            {/* Cash Account - Only for Super Admin */}
            {formData.role === "super_admin" && (
              <div className="space-y-2">
                <Label htmlFor="cash_account_id">
                  Manager Kas <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                  {loadingCashAccounts ? (
                    <div className="pl-10 py-2 text-sm text-gray-500">
                      Memuat data kas...
                    </div>
                  ) : (
                    <Select
                      value={formData.cash_account_id?.toString() || ""}
                      onValueChange={(value) =>
                        handleInputChange(
                          "cash_account_id",
                          value ? parseInt(value) : null
                        )
                      }
                      disabled={isSubmitting || success}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Pilih Kas yang Dikelola" />
                      </SelectTrigger>
                      <SelectContent>
                        {cashAccounts.map((kas) => (
                          <SelectItem key={kas.id} value={kas.id.toString()}>
                            {kas.code} - {kas.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {errors.cash_account_id && (
                  <p className="text-sm text-red-600">
                    {errors.cash_account_id}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Super Admin akan bertanggung jawab sebagai manager untuk kas
                  yang dipilih
                </p>
              </div>
            )}

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Minimal 8 karakter"
                  className="pl-10"
                  disabled={isSubmitting || success}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Password Confirmation */}
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">
                Konfirmasi Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password_confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={(e) =>
                    handleInputChange("password_confirmation", e.target.value)
                  }
                  placeholder="Ulangi password"
                  className="pl-10"
                  disabled={isSubmitting || success}
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
            {!success && (
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
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
