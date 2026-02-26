"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Package,
  Factory,
  BarChart3,
  Users,
  ChevronDown,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const managementLinks = [
  { href: "/templates", label: "Templates", icon: FileText },
  { href: "/products", label: "Products", icon: Package },
]

const productionLinks = [
  { href: "/production-offers", label: "Production Offers", icon: Factory },
]

const reportLinks = [
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/users", label: "Users", icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  const [managementOpen, setManagementOpen] = useState(true)
  const [productionOpen, setProductionOpen] = useState(true)
  const [reportsOpen, setReportsOpen] = useState(true)

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
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
            pathname === "/dashboard"
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        <div className="mt-5">
          <button
            onClick={() => setManagementOpen(!managementOpen)}
            className="flex w-full items-center justify-between px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Management
            <ChevronDown className={cn("h-3 w-3 transition-transform", !managementOpen && "-rotate-90")} />
          </button>
          {managementOpen && (
            <div className="mt-1 flex flex-col gap-0.5">
              {managementLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                    pathname.startsWith(link.href)
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5">
          <button
            onClick={() => setProductionOpen(!productionOpen)}
            className="flex w-full items-center justify-between px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Production
            <ChevronDown className={cn("h-3 w-3 transition-transform", !productionOpen && "-rotate-90")} />
          </button>
          {productionOpen && (
            <div className="mt-1 flex flex-col gap-0.5">
              {productionLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                    pathname.startsWith(link.href)
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5">
          <button
            onClick={() => setReportsOpen(!reportsOpen)}
            className="flex w-full items-center justify-between px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Reports
            <ChevronDown className={cn("h-3 w-3 transition-transform", !reportsOpen && "-rotate-90")} />
          </button>
          {reportsOpen && (
            <div className="mt-1 flex flex-col gap-0.5">
              {reportLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                    pathname.startsWith(link.href)
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
              pathname === "/settings"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </nav>
    </aside>
  )
}
