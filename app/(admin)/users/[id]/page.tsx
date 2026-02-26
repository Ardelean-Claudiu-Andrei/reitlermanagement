"use client"

import { use } from "react"
import { useAppData } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Pencil, Clock } from "lucide-react"
import Link from "next/link"

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { usersWithInfo } = useAppData()
  const entry = usersWithInfo.find((u) => u.user.id === id)

  if (!entry) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">User not found.</p>
      </div>
    )
  }

  const { user, additionalInformation } = entry

  const roleBadgeClass: Record<string, string> = {
    admin: "bg-foreground text-background hover:bg-foreground",
    manager: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 border-blue-200 dark:border-blue-800",
    viewer: "bg-muted text-muted-foreground hover:bg-muted",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" className="mt-1" asChild>
            <Link href="/users">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/users/${user.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit User
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant="outline"
              className={
                user.status === "active"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800"
                  : "bg-muted text-muted-foreground hover:bg-muted"
              }
            >
              {user.status}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Role</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className={roleBadgeClass[additionalInformation.role]}>
              {additionalInformation.role}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Type</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-foreground capitalize">{additionalInformation.type}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">User ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-mono text-muted-foreground">{user.id}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm text-foreground">Account created</p>
                <p className="text-xs text-muted-foreground">System - initial setup</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm text-foreground">Last login</p>
                <p className="text-xs text-muted-foreground">Activity tracking placeholder</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
