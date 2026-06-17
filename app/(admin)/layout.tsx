"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { AppProvider } from "@/lib/app-context"
import { Toaster } from "sonner"
import { getCurrentUser } from "@/lib/api"
import { canAccess, fallbackRoute } from "@/lib/permissions"
import type { AppRole } from "@/lib/permissions"

function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.replace("/login")
      return
    }
    const role = (user.role ?? "employee") as AppRole
    if (!canAccess(role, pathname)) {
      router.replace(fallbackRoute(role))
    }
  }, [pathname, router])

  return <>{children}</>
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">
            <RouteGuard>{children}</RouteGuard>
          </main>
        </div>
      </div>
      <Toaster position="top-right" />
    </AppProvider>
  )
}
