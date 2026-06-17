export type AppRole = "admin" | "engineer" | "production" | "employee"

/** Routes (path prefixes) each role may visit */
const ACCESS: Record<AppRole, string[]> = {
  admin:      [],              // empty = unrestricted
  engineer:   ["/dashboard", "/projects", "/materials", "/settings"],
  production: ["/projects"],
  employee:   ["/projects"],
}

export function canViewPrices(role: AppRole): boolean {
  return role === "admin"
}

export function canViewReports(role: AppRole): boolean {
  return role === "admin"
}

export function canEditProject(role: AppRole): boolean {
  return role === "admin" || role === "engineer"
}

export function canResolveIssues(role: AppRole): boolean {
  return role === "admin" || role === "engineer"
}

export function canAccess(role: AppRole, pathname: string): boolean {
  if (role === "admin") return true
  return ACCESS[role]?.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/")) ?? false
}

/** Redirect target when a role hits a forbidden page */
export function fallbackRoute(role: AppRole): string {
  if (role === "production") return "/projects"
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
