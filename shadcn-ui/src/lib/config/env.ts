// src/lib/config/env.ts

/**
 * Environment Configuration
 * Centralized config untuk environment variables
 */

export const ENV = {
  // API Configuration
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "https://ksp.gascpns.id/api",
  API_TIMEOUT: 30000,

  // App Configuration
  APP_NAME: "KSU Ceria Ajibarang",
  APP_VERSION: "1.0.0",

  // Token Configuration
  TOKEN_KEY: "token",
  USER_KEY: "user",

  // Development
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

export default ENV;
