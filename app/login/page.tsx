"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLocale } from "@/lib/locale-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react"
import { toast } from "sonner"
import { apiLogin } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const { t, locale, setLocale } = useLocale()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      await apiLogin(email, password)
      toast.success(t("login.success"))
      router.push("/dashboard")
    } catch {
      toast.error(t("login.invalidCredentials"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <Select value={locale} onValueChange={(v) => setLocale(v as typeof locale)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ro">Romana</SelectItem>
            <SelectItem value="hu">Magyar</SelectItem>
            <SelectItem value="de">Deutsch</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="flex items-center gap-3">
              <Image
                src="/branding/logo-black-text.jpg"
                alt="SMS Reitler"
                width={48}
                height={48}
                className="h-12 w-auto object-contain dark:hidden"
              />
              <Image
                src="/branding/sms-reitler.png"
                alt="SMS Reitler"
                width={48}
                height={48}
                className="h-12 w-auto object-contain hidden dark:block"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">SMS REITLER</h1>
                <p className="text-xs text-muted-foreground tracking-widest uppercase">Offers & Production</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl">{t("login.title")}</CardTitle>
            <CardDescription>{t("login.subtitle")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("login.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              {t("login.signIn")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
