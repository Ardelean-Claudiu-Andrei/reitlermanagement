"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  FileText,
  Package,
  Boxes,
  Settings,
  Users,
  Puzzle,
  ListChecks,
  MoreHorizontal,
  Sun,
  Moon,
  Monitor,
  LogOut,
  Languages,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLocale } from "@/lib/locale-context"
import { locales, localeNames, type Locale } from "@/lib/i18n"
import { apiLogout, getCurrentUser } from "@/lib/api"
import { canAccess } from "@/lib/permissions"
import type { AppRole } from "@/lib/permissions"

type NavItem = { href: string; icon: React.ElementType; label: string; show?: boolean }
type NavSection = { label?: string; items: NavItem[] }

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { setTheme, theme } = useTheme()
  const { locale, setLocale, t } = useLocale()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string; role: AppRole }>({
    name: "",
    email: "",
    role: "employee",
  })

  useEffect(() => {
    setMounted(true)
    const raw = getCurrentUser()
    if (raw) {
      const full = `${raw.firstName || ""} ${raw.lastName || ""}`.trim()
      setUser({
        name: full || raw.name || raw.email || "",
        email: raw.email || "",
        role: (raw.role ?? "employee") as AppRole,
      })
    }
  }, [])

  const role = user.role
  const isAdmin = role === "admin"
  const isEngineer = role === "engineer"
  const showDashboard = canAccess(role, "/dashboard")
  const showSettings = canAccess(role, "/settings")

  const sections: NavSection[] = [
    {
      items: [{ href: "/dashboard", icon: LayoutDashboard, label: t("nav.dashboard"), show: showDashboard }],
    },
    {
      label: t("nav.management"),
      items: [
        { href: "/management", icon: Building2, label: t("nav.companies"), show: isAdmin },
        { href: "/users", icon: Users, label: t("nav.users"), show: isAdmin },
        { href: "/quotes", icon: FileText, label: t("nav.quotes"), show: isAdmin },
        { href: "/products", icon: Package, label: t("nav.products"), show: isAdmin || isEngineer },
      ],
    },
    {
      label: t("nav.production"),
      items: [
        { href: "/projects", icon: FolderKanban, label: t("nav.projects") },
        { href: "/production/step-definitions", icon: ListChecks, label: "Pași producție", show: isAdmin || isEngineer },
      ],
    },
    {
      label: t("nav.materials"),
      items: [
        { href: "/materials/assemblies", icon: Boxes, label: t("nav.assemblies"), show: isAdmin || isEngineer },
        { href: "/materials/parts", icon: Puzzle, label: t("parts"), show: isAdmin || isEngineer },
      ],
    },
    {
      items: [{ href: "/settings", icon: Settings, label: t("nav.settings"), show: showSettings }],
    },
  ]

  const isActive = (href: string) => {
    if (href === "/dashboard" || href === "/settings") return pathname === href
    return pathname === href || pathname.startsWith(href + "/")
  }

  const initials =
    user.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      {/* Brand */}
      <div className="flex flex-col items-center gap-1.5 border-b border-border px-4 py-5">
        <Image
          src="/branding/logo-black-text.jpg"
          alt="SMS Reitler logo"
          width={120}
          height={87}
          priority
          className="h-14 w-auto object-contain dark:hidden"
        />
        <Image
          src="/branding/sms-reitler.png"
          alt="SMS Reitler logo"
          width={120}
          height={87}
          priority
          className="hidden h-14 w-auto object-contain dark:block"
        />
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Offers &amp; Production
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section, i) => {
          const items = section.items.filter((item) => item.show !== false)
          if (items.length === 0) return null
          return (
            <div key={i} className={cn(i > 0 && "mt-4")}>
              {section.label && (
                <p className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  {section.label}
                </p>
              )}
              <div className="flex flex-col gap-1">
                {items.map(({ href, icon: Icon, label }) => {
                  const active = isActive(href)
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-secondary text-foreground shadow-sm ring-1 ring-border/60"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="flex items-center gap-3 border-t border-border px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-muted-foreground">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{user.name || "..."}</p>
          {user.email && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-md p-1.5 text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-52">
            {showSettings && (
              <>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  {t("settings")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Languages className="mr-2 h-4 w-4" />
                {t("settings.language")}
                <span className="ml-auto text-xs uppercase text-muted-foreground">{locale}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {locales.map((loc) => (
                  <DropdownMenuCheckboxItem
                    key={loc}
                    checked={locale === loc}
                    onCheckedChange={() => setLocale(loc as Locale)}
                  >
                    {localeNames[loc as Locale]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="px-2 py-1 text-xs text-muted-foreground">{t("theme")}</DropdownMenuLabel>
            <DropdownMenuCheckboxItem checked={mounted && theme === "light"} onCheckedChange={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              {t("theme.light")}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={mounted && theme === "dark"} onCheckedChange={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              {t("theme.dark")}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={mounted && theme === "system"} onCheckedChange={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" />
              {t("theme.system")}
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => apiLogout()}>
              <LogOut className="mr-2 h-4 w-4" />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
