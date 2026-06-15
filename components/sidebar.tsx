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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useLocale } from "@/lib/locale-context"
import { getCurrentUser } from "@/lib/api"
import type { AppRole } from "@/lib/permissions"

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useLocale()
  const [managementOpen, setManagementOpen] = useState(true)
  const [materialsOpen, setMaterialsOpen] = useState(true)
  const [role, setRole] = useState<AppRole>("employee")

  useEffect(() => {
    const user = getCurrentUser()
    if (user?.role) setRole(user.role as AppRole)
  }, [])

  const isAdmin = role === "admin"
  const showMaterials = role === "admin" || role === "engineer"

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    if (href === "/settings") return pathname === "/settings"
    return pathname === href || pathname.startsWith(href + "/")
  }

  const isManagementActive =
    pathname.startsWith("/management") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/projects") ||
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
        {/* Dashboard */}
        {navLink("/dashboard", <LayoutDashboard className="h-4 w-4" />, t("dashboard"))}

        {/* Management Section */}
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
              {t("management")}
            </span>
            <ChevronDown className={cn("h-3 w-3 transition-transform", !managementOpen && "-rotate-90")} />
          </button>
          {managementOpen && (
            <div className="mt-1 ml-4 flex flex-col gap-0.5 border-l border-border pl-3">
              {isAdmin && navLink("/management", <Building2 className="h-4 w-4" />, t("companies"))}
              {isAdmin && navLink("/users", <Users className="h-4 w-4" />, t("users"))}
              {navLink("/projects", <FolderKanban className="h-4 w-4" />, t("projects"))}
              {isAdmin && navLink("/quotes", <FileText className="h-4 w-4" />, t("quotes"))}
              {isAdmin && navLink("/products", <Package className="h-4 w-4" />, t("products"))}
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
                {t("materials")}
              </span>
              <ChevronDown className={cn("h-3 w-3 transition-transform", !materialsOpen && "-rotate-90")} />
            </button>
            {materialsOpen && (
              <div className="mt-1 ml-4 flex flex-col gap-0.5 border-l border-border pl-3">
                {navLink("/materials/assemblies", <Boxes className="h-4 w-4" />, t("assemblies"))}
                {navLink("/materials/parts", <Puzzle className="h-4 w-4" />, t("parts"))}
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        <div className="mt-4">
          {navLink("/settings", <Settings className="h-4 w-4" />, t("settings"))}
        </div>
      </nav>
    </aside>
  )
}
