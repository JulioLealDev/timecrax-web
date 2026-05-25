/**
 * Application route paths.
 * Use these constants instead of hardcoding paths throughout the app.
 */
export const ROUTES = {
  // Public routes
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  PRIVACY_POLICY: "/privacy-policy",
  ROADMAP: "/roadmap",

  // Protected routes
  PROFILE: "/profile",
  SETTINGS: "/settings",
  MY_THEMES: "/my-themes",
  CREATE_THEME: "/create-theme",
  THEMES_STORAGE: "/themes-storage",
  RANKING: "/ranking",
} as const;

/**
 * Routes that don't require authentication.
 */
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.PRIVACY_POLICY,
  ROUTES.ROADMAP,
] as const;

/**
 * Check if a path is a public route.
 */
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.includes(path as typeof PUBLIC_ROUTES[number]);
}
