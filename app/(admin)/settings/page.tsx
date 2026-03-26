"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useLocale } from "@/lib/locale-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { t, locale, setLocale } = useLocale()
  const [mounted, setMounted] = useState(false)
  const [name] = useState("Claudiu Ardelean")
  const [email] = useState("claudiu.ardelean@codeindustry.net")

  useEffect(() => {
    setMounted(true)
  }, [])

  function handleSave() {
    toast.success(t("common.saved"))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">{t("nav.settings")}</h2>
        <p className="text-sm text-muted-foreground">{t("settings.description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.profile")}</CardTitle>
          <CardDescription>{t("settings.profileDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("common.name")}</Label>
              <Input value={name} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>{t("common.email")}</Label>
              <Input value={email} readOnly className="bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.preferences")}</CardTitle>
          <CardDescription>{t("settings.preferencesDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("settings.theme")}</Label>
            {mounted ? (
              <Select value={theme ?? "system"} onValueChange={setTheme}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t("theme.light")}</SelectItem>
                  <SelectItem value="dark">{t("theme.dark")}</SelectItem>
                  <SelectItem value="system">{t("theme.system")}</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="h-9 w-[200px] animate-pulse rounded-md bg-muted" />
            )}
            <p className="text-xs text-muted-foreground">{t("settings.themeHint")}</p>
          </div>
          <div className="space-y-2">
            <Label>{t("settings.language")}</Label>
            <Select value={locale} onValueChange={(v) => setLocale(v as "en" | "ro" | "hu" | "de")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ro">Romana</SelectItem>
                <SelectItem value="hu">Magyar</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t("settings.languageHint")}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.organization")}</CardTitle>
          <CardDescription>{t("settings.organizationDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("settings.organizationPlaceholder")}</p>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button onClick={handleSave}>{t("common.save")}</Button>
      </div>
    </div>
  )
}
