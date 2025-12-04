import { useState, useEffect } from "react";
import profileService, {
  MemberProfile,
  UpdateProfileData,
  ChangePasswordData,
} from "@/lib/api/profile.service";
import { toast } from "sonner";

interface UseProfileOptions {
  autoLoad?: boolean;
}

export default function useProfile(options: UseProfileOptions = {}) {
  const { autoLoad = true } = options;

  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load profile on mount
  useEffect(() => {
    if (autoLoad) {
      loadProfile();
    }
  }, [autoLoad]);

  /**
   * Load profile data
   */
  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileService.getProfile();
      console.log("✅ Profile loaded:", response);

      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        throw new Error(response.message || "Failed to load profile");
      }
    } catch (err: any) {
      console.error("❌ Error loading profile:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to load profile";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update profile
   */
  const updateProfile = async (data: UpdateProfileData) => {
    if (!profile) {
      toast.error("Profile not loaded");
      return;
    }

    setUpdating(true);
    setError(null);
    try {
      console.log("📤 Updating profile:", data);
      const response = await profileService.updateProfile(profile.id, data);
      console.log("✅ Profile updated:", response);

      if (response.success) {
        toast.success(response.message || "Profile updated successfully");

        // ✅ FIXED: Refresh full profile to get all fields (membership_status, etc)
        await loadProfile();

        return response.data;
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (err: any) {
      console.error("❌ Error updating profile:", err);

      // Handle validation errors
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const apiErrors = err.response.data.errors;
        const errorMessages = Object.values(apiErrors).flat().join(", ");
        toast.error(errorMessages);
      } else {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to update profile";
        toast.error(errorMessage);
      }

      throw err;
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Change password
   */
  const changePassword = async (data: ChangePasswordData) => {
    if (!profile) {
      toast.error("Profile not loaded");
      return;
    }

    setChangingPassword(true);
    setError(null);
    try {
      console.log("🔐 Changing password for member:", profile.id);
      const response = await profileService.changePassword(profile.id, data);
      console.log("✅ Password changed:", response);

      if (response.success) {
        toast.success(response.message || "Password changed successfully");
        return true;
      } else {
        throw new Error(response.message || "Failed to change password");
      }
    } catch (err: any) {
      console.error("❌ Error changing password:", err);

      // Handle validation errors
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const apiErrors = err.response.data.errors;
        const errorMessages = Object.values(apiErrors).flat().join(", ");
        toast.error(errorMessages);
      } else if (err.response?.status === 401) {
        toast.error("Current password is incorrect");
      } else {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to change password";
        toast.error(errorMessage);
      }

      throw err;
    } finally {
      setChangingPassword(false);
    }
  };

  /**
   * Refresh profile data
   */
  const refresh = async () => {
    await loadProfile();
  };

  return {
    profile,
    loading,
    updating,
    changingPassword,
    error,
    loadProfile,
    updateProfile,
    changePassword,
    refresh,
  };
}
