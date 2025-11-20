// src/lib/api/index.ts
export { default as apiClient } from "./api-client";
export type { ApiResponse } from "./api-client";

export { default as authService } from "./auth.service";
export type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "./auth.service";

export { default as memberService } from "./member.service";
export type {
  Member,
  MemberProfile,
  MemberDetails,
  MemberActivity,
  MemberStatistics,
  MemberListParams,
  UpdateMemberRequest,
  ChangePasswordRequest,
  UpdateStatusRequest,
  PaginatedResponse,
} from "./member.service";

export { default as dashboardService } from "./dashboard.service";
export type {
  AdminDashboardData,
  MemberDashboardData,
  AdminQuickStats,
  MemberQuickStats,
} from "./dashboard.service";