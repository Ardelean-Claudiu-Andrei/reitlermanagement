"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppData } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { usersWithInfo, updateUser } = useAppData()
  const entry = usersWithInfo.find((u) => u.user.id === id)

  const [name, setName] = useState(entry?.user.name ?? "")
  const [email, setEmail] = useState(entry?.user.email ?? "")
  const [status, setStatus] = useState(entry?.user.status ?? "active")
  const [role, setRole] = useState(entry?.additionalInformation.role ?? "viewer")
  const [type, setType] = useState(entry?.additionalInformation.type ?? "employee")

  if (!entry) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">User not found.</p>
      </div>
    )
  }

  function handleSave() {
    updateUser({
      user: { id, name, email, status: status as "active" | "inactive" },
      additionalInformation: {
        userId: id,
        role: role as "admin" | "manager" | "viewer",
        type: type as "employee" | "admin",
      },
    })
    toast.success("User updated")
    router.push(`/users/${id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="mt-1" asChild>
          <Link href={`/users/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Edit User</h2>
          <p className="text-sm text-muted-foreground">{entry.user.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role (AdditionalInformation)</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type (Employee / Admin)</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" asChild>
              <Link href={`/users/${id}`}>Cancel</Link>
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
