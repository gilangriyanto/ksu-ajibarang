// src/utils/loginRedirect.ts
// FIXED: Correct role mapping sesuai backend

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "manager" | "member";
  cash_account_id?: number | null;
}

/**
 * Get redirect path after successful login based on user role
 *
 * CORRECT MAPPING (Backend Standard):
 * - "admin" = Super Admin → Manager Layout (/manager)
 * - "manager" = Admin Kas → Kas Layout (/kas/:kasId)
 * - "member" = Member biasa → Member Layout (/member)
 */
export const getRedirectPath = (user: User): string => {
  switch (user.role) {
    case "admin":
      // admin = Super Admin → Full access Manager Layout
      return "/manager";

    case "manager":
      // manager = Admin Kas → Manage specific kas
      if (!user.cash_account_id) {
        console.error("Manager role requires cash_account_id");
        return "/login"; // Redirect back to login if no kas assigned
      }
      return `/kas/${user.cash_account_id}`;

    case "member":
      // member = Member biasa → Limited access
      return "/member";

    default:
      console.error("Unknown role:", user.role);
      return "/login";
  }
};

/**
 * Get role display name
 */
export const getRoleName = (role: string): string => {
  switch (role) {
    case "admin":
      return "Super Admin";
    case "manager":
      return "Admin Kas";
    case "member":
      return "Member";
    default:
      return "Unknown";
  }
};

/**
 * Get role description
 */
export const getRoleDescription = (role: string): string => {
  switch (role) {
    case "admin":
      return "Akses penuh ke seluruh sistem";
    case "manager":
      return "Mengelola kas tertentu sebagai manager";
    case "member":
      return "Anggota biasa koperasi";
    default:
      return "";
  }
};

/**
 * Check if user can access a specific route
 */
export const canAccessRoute = (
  userRole: string,
  requiredRole: string | string[],
  userKasId?: number | null,
  routeKasId?: number
): boolean => {
  // Check if role matches
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  if (!roles.includes(userRole)) {
    return false;
  }

  // For manager role, check kas_id match
  if (userRole === "manager" && routeKasId !== undefined) {
    return userKasId === routeKasId;
  }

  return true;
};

export default {
  getRedirectPath,
  getRoleName,
  getRoleDescription,
  canAccessRoute,
};
