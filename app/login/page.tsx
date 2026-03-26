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
import { Loader2, LogIn } from "lucide-react"
import { toast } from "sonner"

// Mock users for demo
const MOCK_USERS = [
  { email: "admin@smsreitler.com", password: "admin123", role: "admin", name: "Claudiu Ardelean" },
  { email: "employee@smsreitler.com", password: "emp123", role: "employee", name: "Maria Ionescu" },
]

export default function LoginPage() {
  const router = useRouter()
  const { t, locale, setLocale } = useLocale()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = MOCK_USERS.find((u) => u.email === email && u.password === password)

    if (user) {
      // Store user info in localStorage for demo purposes
      localStorage.setItem("currentUser", JSON.stringify(user))
      toast.success(t("login.success"))
      router.push("/dashboard")
    } else {
      toast.error(t("login.invalidCredentials"))
    }

    setIsLoading(false)
  }

  function handleDemoLogin(role: "admin" | "employee") {
    const user = MOCK_USERS.find((u) => u.role === role)
    if (user) {
      setEmail(user.email)
      setPassword(user.password)
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
                src="/branding/sms-reitler.png"
                alt="SMS Reitler"
                width={48}
                height={48}
                className="h-12 w-auto object-contain"
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
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
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

          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">{t("login.demoAccounts")}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDemoLogin("admin")}
                className="text-xs"
              >
                {t("login.loginAsAdmin")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDemoLogin("employee")}
                className="text-xs"
              >
                {t("login.loginAsEmployee")}
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {t("login.demoNote")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
