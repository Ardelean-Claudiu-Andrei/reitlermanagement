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
  Wrench,
  Settings,
  ChevronDown,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useLocale } from "@/lib/locale-context"

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useLocale()
  const [managementOpen, setManagementOpen] = useState(true)
  const [materialsOpen, setMaterialsOpen] = useState(true)

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    if (href === "/management/companies") return pathname.startsWith("/management")
    if (href === "/projects") return pathname === "/projects" || pathname.startsWith("/projects/")
    if (href === "/quotes") return pathname === "/quotes" || pathname.startsWith("/quotes/")
    if (href === "/products") return pathname === "/products" || pathname.startsWith("/products/")
    if (href === "/materials/assemblies") return pathname.startsWith("/materials/assemblies")
    if (href === "/materials/inventory") return pathname.startsWith("/materials/inventory")
    if (href === "/settings") return pathname === "/settings"
    return pathname === href || pathname.startsWith(href + "/")
  }

  const isManagementActive = pathname.startsWith("/management")
  const isMaterialsActive = pathname.startsWith("/materials")

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
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
            isActive("/dashboard")
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          {t("dashboard")}
        </Link>

        {/* Management Section (Dropdown) */}
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
              <Link
                href="/management"
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                  isActive("/management/companies")
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Users className="h-4 w-4" />
                {t("companies")}
              </Link>
            </div>
          )}
        </div>

        {/* Projects */}
        <Link
          href="/projects"
          className={cn(
            "mt-1 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
            isActive("/projects")
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <FolderKanban className="h-4 w-4" />
          {t("projects")}
        </Link>

        {/* Quotes */}
        <Link
          href="/quotes"
          className={cn(
            "mt-1 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
            isActive("/quotes")
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <FileText className="h-4 w-4" />
          {t("quotes")}
        </Link>

        {/* Products */}
        <Link
          href="/products"
          className={cn(
            "mt-1 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
            isActive("/products")
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <Package className="h-4 w-4" />
          {t("products")}
        </Link>

        {/* Materials Section (Dropdown with Assemblies + Inventory) */}
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
              <Link
                href="/materials/assemblies"
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                  isActive("/materials/assemblies")
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Boxes className="h-4 w-4" />
                {t("assemblies")}
              </Link>
              <Link
                href="/materials/inventory"
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                  isActive("/materials/inventory")
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Wrench className="h-4 w-4" />
                {t("inventory")}
              </Link>
            </div>
          )}
        </div>

        {/* Settings at bottom */}
        <div className="mt-4">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
              isActive("/settings")
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Settings className="h-4 w-4" />
            {t("settings")}
          </Link>
        </div>
      </nav>
    </aside>
  )
}
