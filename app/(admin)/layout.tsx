"use client"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { AppProvider } from "@/lib/app-context"
import { Toaster } from "sonner"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
      <Toaster position="top-right" />
    </AppProvider>
  )
}
