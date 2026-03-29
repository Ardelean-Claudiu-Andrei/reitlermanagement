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
import { usersApi, getCurrentUser } from "@/lib/api"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { t, locale, setLocale } = useLocale()
  const [mounted, setMounted] = useState(false)

  // Profile form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load from localStorage first (fast)
    const cached = getCurrentUser()
    if (cached) {
      setFirstName(cached.firstName || "")
      setLastName(cached.lastName || "")
      setEmail(cached.email || "")
    }
    // Then fetch fresh from API
    usersApi.getProfile().then((data) => {
      setFirstName(data.user.firstName || "")
      setLastName(data.user.lastName || "")
      setEmail(data.user.email || "")
    }).catch(() => {/* not logged in or error */})
  }, [])

  async function handleSaveProfile() {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error(t("settings.nameRequired"))
      return
    }
    setIsSaving(true)
    try {
      const payload: Parameters<typeof usersApi.updateProfile>[0] = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      }
      if (newPassword) {
        payload.currentPassword = currentPassword
        payload.newPassword = newPassword
      }
      const updated = await usersApi.updateProfile(payload)
      // Update localStorage
      const raw = getCurrentUser()
      if (raw) {
        localStorage.setItem('user', JSON.stringify({
          ...raw,
          firstName: updated.user.firstName,
          lastName: updated.user.lastName,
          name: updated.user.name,
          email: updated.user.email,
        }))
      }
      setCurrentPassword("")
      setNewPassword("")
      toast.success(t("common.savedSuccessfully"))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      toast.error(message || t("common.errorOccurred"))
    } finally {
      setIsSaving(false)
    }
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
              <Label htmlFor="firstName">{t("settings.firstName")}</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t("settings.firstNamePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t("settings.lastName")}</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t("settings.lastNamePlaceholder")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("common.email")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Separator />
          <p className="text-sm font-medium text-foreground">{t("settings.changePassword")}</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t("settings.currentPassword")}</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("settings.newPassword")}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? t("common.saving") : t("common.save")}
            </Button>
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
            <Select value={locale} onValueChange={(v) => setLocale(v as "en" | "ro" | "hu")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ro">Română</SelectItem>
                <SelectItem value="hu">Magyar</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t("settings.languageHint")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
