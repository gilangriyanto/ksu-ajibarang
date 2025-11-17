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
