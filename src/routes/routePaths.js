/**
 * Route Paths Constants
 * Tập trung quản lý tất cả các đường dẫn route trong ứng dụng
 */

export const ROUTE_PATHS = {
  // Public routes
  HOME: "/",
  POLICY: "/policy",

  // User routes
  APP: "/app",
  APP_DASHBOARD: "/app",
  APP_SESSIONS: "/app/sessions",
  APP_PROFILE: "/profile",

  // Chat
  CHAT: "/chat",

  // Admin routes
  ADMIN: "/admin",

  // Error routes
  FORBIDDEN: "/403",
  NOT_FOUND: "*",
}

/**
 * Helper function để tạo route paths động
 */
export const createRoutePath = (basePath, ...segments) => {
  return [basePath, ...segments].join("/").replace(/\/+/g, "/")
}
