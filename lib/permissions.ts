export type AppRole = "admin" | "engineer" | "production" | "employee"

/** Routes (path prefixes) each role may visit */
const ACCESS: Record<AppRole, string[]> = {
  admin:      [],              // empty = unrestricted
  engineer:   ["/dashboard", "/projects", "/materials", "/settings"],
  production: ["/dashboard", "/projects", "/settings"],
  employee:   ["/dashboard", "/projects", "/settings"],  // legacy fallback
}

export function canViewPrices(role: AppRole): boolean {
  return role === "admin"
}

export function canViewReports(role: AppRole): boolean {
  return role === "admin"
}

export function canAccess(role: AppRole, pathname: string): boolean {
  if (role === "admin") return true
  return ACCESS[role]?.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/")) ?? false
}

/** Redirect target when a role hits a forbidden page */
export function fallbackRoute(_role: AppRole): string {
  return "/projects"
}

export function getRoleLabel(role: AppRole): string {
  const labels: Record<AppRole, string> = {
    admin: "Admin",
    engineer: "Inginer",
    production: "Producție",
    employee: "Angajat",
  }
  return labels[role] ?? role
}
