// src/utils/loginRedirect.ts

/**
 * Determine redirect path based on user role and kas_id
 */
export function getRedirectPath(user: any): string {
  // Member role
  if (user.role === "anggota" || user.role === "member") {
    return "/member";
  }

  // Admin Kas (has kas_id)
  if (user.kas_id && (user.role === "manager" || user.role === "admin")) {
    return `/kas/${user.kas_id}`;
  }

  // Main Manager (no kas_id)
  if (!user.kas_id && (user.role === "manager" || user.role === "admin")) {
    return "/manager";
  }

  // Default fallback
  return "/login";
}
