import React, { useState } from "react";
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
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { ChangePasswordData } from "@/lib/api/profile.service";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangePassword: (data: ChangePasswordData) => Promise<any>;
  isChangingPassword: boolean;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onChangePassword,
  isChangingPassword,
}: ChangePasswordModalProps) {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.current_password) {
      newErrors.current_password = "Password lama harus diisi";
    }

    if (!formData.new_password) {
      newErrors.new_password = "Password baru harus diisi";
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = "Password baru minimal 8 karakter";
    }

    if (!formData.new_password_confirmation) {
      newErrors.new_password_confirmation = "Konfirmasi password harus diisi";
    } else if (formData.new_password !== formData.new_password_confirmation) {
      newErrors.new_password_confirmation = "Password tidak cocok";
    }

    if (
      formData.current_password &&
      formData.new_password &&
      formData.current_password === formData.new_password
    ) {
      newErrors.new_password =
        "Password baru tidak boleh sama dengan password lama";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onChangePassword(formData);
      handleClose();
    } catch (err) {
      // Error handled by hook
      console.error("Password change failed:", err);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleShowPassword = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleClose = () => {
    setFormData({
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    });
    setErrors({});
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>Ubah Password</span>
          </DialogTitle>
          <DialogDescription>
            Masukkan password lama dan password baru Anda
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="current_password">Password Lama *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="current_password"
                type={showPasswords.current ? "text" : "password"}
                value={formData.current_password}
                onChange={(e) =>
                  handleInputChange("current_password", e.target.value)
                }
                placeholder="Masukkan password lama"
                className={`pl-10 pr-10 ${
                  errors.current_password ? "border-red-500" : ""
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => toggleShowPassword("current")}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.current_password && (
              <p className="text-sm text-red-600">{errors.current_password}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new_password">Password Baru *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="new_password"
                type={showPasswords.new ? "text" : "password"}
                value={formData.new_password}
                onChange={(e) =>
                  handleInputChange("new_password", e.target.value)
                }
                placeholder="Masukkan password baru (min. 8 karakter)"
                className={`pl-10 pr-10 ${
                  errors.new_password ? "border-red-500" : ""
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => toggleShowPassword("new")}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.new_password && (
              <p className="text-sm text-red-600">{errors.new_password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="new_password_confirmation">
              Konfirmasi Password Baru *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="new_password_confirmation"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.new_password_confirmation}
                onChange={(e) =>
                  handleInputChange("new_password_confirmation", e.target.value)
                }
                placeholder="Ulangi password baru"
                className={`pl-10 pr-10 ${
                  errors.new_password_confirmation ? "border-red-500" : ""
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => toggleShowPassword("confirm")}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.new_password_confirmation && (
              <p className="text-sm text-red-600">
                {errors.new_password_confirmation}
              </p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Syarat Password:
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Minimal 8 karakter</li>
              <li>• Berbeda dengan password lama</li>
              <li>
                • Disarankan menggunakan kombinasi huruf, angka, dan simbol
              </li>
            </ul>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isChangingPassword}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengubah...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Ubah Password
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
