"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppData } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, Copy } from "lucide-react"
import { toast } from "sonner"
import type { UserWithInfo } from "@/lib/types"

export default function UsersPage() {
  const router = useRouter()
  const { usersWithInfo, deleteUser, duplicateUser } = useAppData()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const employees = usersWithInfo.filter((u) => u.additionalInformation.type === "employee")
  const admins = usersWithInfo.filter((u) => u.additionalInformation.type === "admin")

  function handleDelete() {
    if (deleteTarget) {
      deleteUser(deleteTarget)
      toast.success("User deleted")
      setDeleteTarget(null)
    }
  }

  function handleDuplicate(id: string) {
    duplicateUser(id)
    toast.success("User duplicated")
  }

  function handleInvite() {
    toast.success("Invite sent (mock)")
  }

  const roleBadgeClass: Record<string, string> = {
    admin: "bg-foreground text-background hover:bg-foreground",
    manager: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 border-blue-200 dark:border-blue-800",
    viewer: "bg-muted text-muted-foreground hover:bg-muted",
  }

  function UserTable({ data }: { data: UserWithInfo[] }) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[60px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.user.id}>
              <TableCell className="font-medium">{item.user.name}</TableCell>
              <TableCell className="text-muted-foreground">{item.user.email}</TableCell>
              <TableCell>
                <Badge variant="outline" className={roleBadgeClass[item.additionalInformation.role]}>
                  {item.additionalInformation.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    item.user.status === "active"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800"
                      : "bg-muted text-muted-foreground hover:bg-muted"
                  }
                >
                  {item.user.status}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/users/${item.user.id}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/users/${item.user.id}/edit`)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(item.user.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteTarget(item.user.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Users</h2>
          <p className="text-sm text-muted-foreground">Manage team members and roles</p>
        </div>
        <Button onClick={handleInvite}>
          <Plus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      <Tabs defaultValue="employees">
        <TabsList>
          <TabsTrigger value="employees">Employees ({employees.length})</TabsTrigger>
          <TabsTrigger value="admins">Admins ({admins.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="employees" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Employees</CardTitle>
                <p className="text-sm text-muted-foreground">{employees.length} users</p>
              </div>
            </CardHeader>
            <CardContent>
              <UserTable data={employees} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="admins" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Admins & Managers</CardTitle>
                <p className="text-sm text-muted-foreground">{admins.length} users</p>
              </div>
            </CardHeader>
            <CardContent>
              <UserTable data={admins} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
