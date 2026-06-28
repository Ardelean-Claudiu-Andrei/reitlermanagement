"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  FileText,
  Package,
  Boxes,
  Settings,
  ChevronDown,
  Users,
  Puzzle,
  Factory,
  ListChecks,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useLocale } from "@/lib/locale-context"
import { getCurrentUser } from "@/lib/api"
import { canAccess } from "@/lib/permissions"
import type { AppRole } from "@/lib/permissions"

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useLocale()
  const [managementOpen, setManagementOpen] = useState(true)
  const [productionOpen, setProductionOpen] = useState(true)
  const [materialsOpen, setMaterialsOpen] = useState(true)
  const [role] = useState<AppRole>(() => {
    if (typeof window === "undefined") return "employee"
    return ((getCurrentUser()?.role ?? "employee") as AppRole)
  })

  const isAdmin = role === "admin"
  const showDashboard = canAccess(role, "/dashboard")
  const showSettings = canAccess(role, "/settings")
  const showManagement = isAdmin || role === "engineer"
  const showMaterials = isAdmin || role === "engineer"
  const productionOnly = !showDashboard && !showSettings && !showManagement

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    if (href === "/settings") return pathname === "/settings"
    return pathname === href || pathname.startsWith(href + "/")
  }

  const isManagementActive =
    pathname.startsWith("/management") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/production") ||
    pathname.startsWith("/quotes") ||
    pathname.startsWith("/products")

  const isMaterialsActive = pathname.startsWith("/materials")

  const navLink = (href: string, icon: React.ReactNode, label: string) => (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
        isActive(href)
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </Link>
  )

  return (
    <aside className="flex h-full w-[220px] flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-4">
        <Image
          src="/branding/sms-reitler.png"
          alt="SMS Reitler logo"
          width={32}
          height={32}
          className="h-8 w-auto object-contain"
        />
        <div>
          <p className="text-sm font-bold text-foreground leading-tight">SMS REITLER</p>
          <p className="text-[10px] text-muted-foreground leading-tight tracking-widest uppercase">Offers & Production</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {productionOnly ? (
          /* Production-only view: just the Production section */
          <div>
            <button
              onClick={() => setProductionOpen(!productionOpen)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                isManagementActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-2.5">
                <Factory className="h-4 w-4" />
                {t("nav.production")}
              </span>
              <ChevronDown className={cn("h-3 w-3 transition-transform", !productionOpen && "-rotate-90")} />
            </button>
            {productionOpen && (
              <div className="mt-1 ml-4 flex flex-col gap-0.5 border-l border-border pl-3">
                {navLink("/projects", <FolderKanban className="h-4 w-4" />, t("nav.projects"))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Dashboard */}
            {showDashboard && navLink("/dashboard", <LayoutDashboard className="h-4 w-4" />, t("nav.dashboard"))}

            {/* Management Section — admin + engineer only */}
            {showManagement && (
              <div className="mt-4">
                <button
                  onClick={() => setManagementOpen(!managementOpen)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                    isManagementActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <Building2 className="h-4 w-4" />
                    {t("nav.management")}
                  </span>
                  <ChevronDown className={cn("h-3 w-3 transition-transform", !managementOpen && "-rotate-90")} />
                </button>
                {managementOpen && (
                  <div className="mt-1 ml-4 flex flex-col gap-0.5 border-l border-border pl-3">
                    {isAdmin && navLink("/management", <Building2 className="h-4 w-4" />, t("nav.companies"))}
                    {isAdmin && navLink("/users", <Users className="h-4 w-4" />, t("nav.users"))}
                    {isAdmin && navLink("/quotes", <FileText className="h-4 w-4" />, t("nav.quotes"))}
                    {(isAdmin || role === "engineer") && navLink("/products", <Package className="h-4 w-4" />, t("nav.products"))}
                  </div>
                )}
              </div>
            )}

            {/* Production Section */}
            <div className="mt-4">
              <button
                onClick={() => setProductionOpen(!productionOpen)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith("/projects") || pathname.startsWith("/production")
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-2.5">
                  <Factory className="h-4 w-4" />
                  {t("nav.production")}
                </span>
                <ChevronDown className={cn("h-3 w-3 transition-transform", !productionOpen && "-rotate-90")} />
              </button>
              {productionOpen && (
                <div className="mt-1 ml-4 flex flex-col gap-0.5 border-l border-border pl-3">
                  {navLink("/projects", <FolderKanban className="h-4 w-4" />, t("nav.projects"))}
                  {showMaterials && navLink("/production/step-definitions", <ListChecks className="h-4 w-4" />, "Pași producție")}
                </div>
              )}
            </div>

            {/* Materials Section — admin + engineer only */}
            {showMaterials && (
              <div className="mt-4">
                <button
                  onClick={() => setMaterialsOpen(!materialsOpen)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                    isMaterialsActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <Boxes className="h-4 w-4" />
                    {t("nav.materials")}
                  </span>
                  <ChevronDown className={cn("h-3 w-3 transition-transform", !materialsOpen && "-rotate-90")} />
                </button>
                {materialsOpen && (
                  <div className="mt-1 ml-4 flex flex-col gap-0.5 border-l border-border pl-3">
                    {navLink("/materials/assemblies", <Boxes className="h-4 w-4" />, t("nav.assemblies"))}
                    {navLink("/materials/parts", <Puzzle className="h-4 w-4" />, t("parts"))}
                  </div>
                )}
              </div>
            )}

            {/* Settings */}
            {showSettings && (
              <div className="mt-4">
                {navLink("/settings", <Settings className="h-4 w-4" />, t("nav.settings"))}
              </div>
            )}
          </>
        )}
      </nav>
    </aside>
  )
}
