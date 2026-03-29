"use client"

import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { User, Sun, Moon, Monitor, Settings, LogOut, Languages, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLocale } from "@/lib/locale-context"
import { locales, localeNames, type Locale } from "@/lib/i18n"
import { apiLogout, getCurrentUser } from "@/lib/api"

export function TopBar() {
  const { setTheme, theme } = useTheme()
  const router = useRouter()
  const { locale, setLocale, t } = useLocale()
  const [displayName, setDisplayName] = useState("")

  useEffect(() => {
    const raw = getCurrentUser()
    if (raw) {
      const first = raw.firstName || ""
      const last = raw.lastName || ""
      const full = `${first} ${last}`.trim()
      setDisplayName(full || raw.name || raw.email || "")
    }
  }, [])

  function handleLogout() {
    apiLogout()
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-sm font-semibold text-foreground">SMS REITLER</h1>
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary outline-none">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <span className="uppercase text-xs font-medium">{locale}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {locales.map((loc) => (
              <DropdownMenuItem
                key={loc}
                onClick={() => setLocale(loc as Locale)}
                className="flex items-center justify-between"
              >
                <span>{localeNames[loc as Locale]}</span>
                {locale === loc && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary outline-none">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{displayName || "..."}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              {t("settings")}
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {theme === "dark" ? (
                  <Moon className="mr-2 h-4 w-4" />
                ) : theme === "light" ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : (
                  <Monitor className="mr-2 h-4 w-4" />
                )}
                {t("theme")}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  {t("theme.light")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  {t("theme.dark")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="mr-2 h-4 w-4" />
                  {t("theme.system")}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
