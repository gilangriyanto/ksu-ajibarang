// src/hooks/useDashboard.ts
import { useState, useEffect } from "react";
import dashboardService, {
  type AdminDashboardData,
  type MemberDashboardData,
  type AdminQuickStats,
  type MemberQuickStats,
} from "@/lib/api/dashboard.service";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook for Admin Dashboard
 */
export function useAdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await dashboardService.getAdminDashboard();
      setData(dashboardData);
    } catch (err: any) {
      setError(err.message || "Gagal memuat dashboard");
      console.error("Admin dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const refresh = () => {
    fetchDashboard();
  };

  return {
    data,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook for Member Dashboard
 */
export function useMemberDashboard() {
  const [data, setData] = useState<MemberDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await dashboardService.getMemberDashboard();
      setData(dashboardData);
    } catch (err: any) {
      setError(err.message || "Gagal memuat dashboard");
      console.error("Member dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const refresh = () => {
    fetchDashboard();
  };

  return {
    data,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook for Quick Stats Widget
 * Auto-detects user role and returns appropriate stats
 */
export function useQuickStats() {
  const { user } = useAuth();
  const [data, setData] = useState<AdminQuickStats | MemberQuickStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await dashboardService.getQuickStats();
      setData(stats);
    } catch (err: any) {
      setError(err.message || "Gagal memuat statistik");
      console.error("Quick stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const refresh = () => {
    fetchStats();
  };

  return {
    data,
    loading,
    error,
    refresh,
    isAdmin: user?.role === "admin" || user?.role === "manager",
    isMember: user?.role === "anggota",
  };
}
