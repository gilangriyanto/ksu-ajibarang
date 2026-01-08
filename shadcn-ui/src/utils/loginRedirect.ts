// src/utils/loginRedirect.ts

interface User {
  role: string;
  kas_id?: number | null;
}

/**
 * Smart redirect based on user role and kas_id
 *
 * Logic:
 * - Admin (no kas_id) -> /admin (uses KasLayout)
 * - Manager with kas_id -> /kas/{kasId} (uses KasLayout)
 * - Manager without kas_id -> /manager (uses ManagerLayout)
 * - Anggota -> /member (uses MemberLayout)
 */
export function getRedirectPath(user: User): string {
  const role = user.role?.toLowerCase();
  const kasId = user.kas_id;

  console.log("🔄 getRedirectPath called with:", { role, kas_id: kasId });

  // ✅ Admin without kas_id -> Admin dashboard with KasLayout
  if (role === "admin" && !kasId) {
    console.log("✅ Redirecting to: /admin (Admin without kas_id)");
    return "/admin";
  }

  // ✅ Admin with kas_id -> Specific kas dashboard
  if (role === "admin" && kasId) {
    console.log(`✅ Redirecting to: /kas/${kasId} (Admin with kas_id)`);
    return `/kas/${kasId}`;
  }

  // ✅ Manager with kas_id -> Specific kas dashboard
  if ((role === "manager" || role === "manajer") && kasId) {
    console.log(`✅ Redirecting to: /kas/${kasId} (Manager with kas_id)`);
    return `/kas/${kasId}`;
  }

  // ✅ Manager without kas_id -> Manager dashboard
  if (role === "manager" || role === "manager") {
    console.log("✅ Redirecting to: /manager (Manager without kas_id)");
    return "/manager";
  }

  // ✅ Member/Anggota -> Member dashboard
  if (role === "anggota" || role === "member") {
    console.log("✅ Redirecting to: /member (Anggota)");
    return "/member";
  }

  // ❌ Fallback
  console.warn("⚠️ Unknown role, redirecting to /member");
  return "/member";
}

/**
 * Check if user should use KasLayout
 */
export function shouldUseKasLayout(user: User): boolean {
  const role = user.role?.toLowerCase();
  const kasId = user.kas_id;

  // Admin without kas_id OR any user with kas_id uses KasLayout
  return (role === "admin" && !kasId) || !!kasId;
}

/**
 * Get kas name by ID
 */
export function getKasName(kasId: number): string {
  const kasNames: Record<number, string> = {
    1: "Kas 1 - Pembiayaan Umum",
    2: "Kas 2 - Barang & Logistik",
    3: "Kas 3 - Sebrakan",
    4: "Kas 4 - Kantin",
  };

  return kasNames[kasId] || `Kas ${kasId}`;
}
