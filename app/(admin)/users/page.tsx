"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import type { UserWithInfo } from "@/lib/types"

export default function UsersPage() {
  const router = useRouter()
  const { usersWithInfo, deleteUser, addUser } = useAppData()
  const { t } = useLocale()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", password: "", role: "engineer" })

  const safeUsers = usersWithInfo ?? []

  const admins = safeUsers.filter((u) => u.additionalInformation.type === "admin")
  const engineers = safeUsers.filter((u) => u.additionalInformation.type === "engineer")
  const production = safeUsers.filter((u) => u.additionalInformation.type === "production" || u.additionalInformation.type === "employee")

  function handleDelete() {
    if (deleteTarget) {
      deleteUser(deleteTarget)
      toast.success(t("users.deleted"))
      setDeleteTarget(null)
    }
  }

  async function handleCreate() {
    if (!newUser.firstName.trim() || !newUser.lastName.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      toast.error("Toate câmpurile sunt obligatorii")
      return
    }
    setIsSaving(true)
    try {
      const draft = {
        user: {
          id: "",
          firstName: newUser.firstName.trim(),
          lastName: newUser.lastName.trim(),
          name: `${newUser.firstName.trim()} ${newUser.lastName.trim()}`,
          email: newUser.email.trim(),
          status: "active" as const,
        },
        additionalInformation: {
          userId: "",
          role: newUser.role as import("@/lib/permissions").AppRole,
          type: newUser.role as import("@/lib/permissions").AppRole,
        },
        password: newUser.password,
      }
      await addUser(draft)
      toast.success(t("common.savedSuccessfully"))
      setCreateOpen(false)
      setNewUser({ firstName: "", lastName: "", email: "", password: "", role: "employee" })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("common.errorOccurred"))
    } finally {
      setIsSaving(false)
    }
  }

  const roleBadgeClass: Record<string, string> = {
    admin:      "bg-foreground text-background hover:bg-foreground",
    engineer:   "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 border-blue-200 dark:border-blue-800",
    production: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 border-amber-200 dark:border-amber-800",
    employee:   "bg-muted text-muted-foreground hover:bg-muted",
  }

  const roleLabel: Record<string, string> = {
    admin:      "Admin",
    engineer:   "Inginer",
    production: "Producție",
    employee:   "Angajat",
  }

  function PaginatedUserTable({ data }: { data: UserWithInfo[] }) {
    const [pageSize, setPageSize] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const totalPages = Math.max(1, Math.ceil(data.length / pageSize))
    const safePage = Math.min(currentPage, totalPages)
    const paginated = data.slice((safePage - 1) * pageSize, safePage * pageSize)

    return (
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("common.email")}</TableHead>
              <TableHead>{t("users.role")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="w-[60px]">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((item) => (
              <TableRow key={item.user.id}>
                <TableCell className="font-medium">{item.user.name}</TableCell>
                <TableCell className="text-muted-foreground">{item.user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={roleBadgeClass[item.additionalInformation.role] ?? ""}>
                    {roleLabel[item.additionalInformation.role] ?? item.additionalInformation.role}
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
                        <span className="sr-only">{t("common.actions")}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/users/${item.user.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        {t("common.view")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/users/${item.user.id}/edit`)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {t("common.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(item.user.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("common.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {t("users.noUsersFound")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {data.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t mt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, data.length)} of {data.length}
              </span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1) }}>
                <SelectTrigger className="w-[80px] h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>per page</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={safePage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce<(number | "…")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…")
                  acc.push(p)
                  return acc
                }, [])
                .map((item, i) =>
                  item === "…" ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
                  ) : (
                    <Button
                      key={item}
                      variant={safePage === item ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8 text-sm"
                      onClick={() => setCurrentPage(item as number)}
                    >
                      {item}
                    </Button>
                  )
                )}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{t("nav.users")}</h2>
          <p className="text-sm text-muted-foreground">{t("users.subtitle")}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("users.addUser")}
        </Button>
      </div>

      <Tabs defaultValue="production">
        <TabsList>
          <TabsTrigger value="production">Producție ({production.length})</TabsTrigger>
          <TabsTrigger value="engineers">Ingineri ({engineers.length})</TabsTrigger>
          <TabsTrigger value="admins">{t("users.admins")} ({admins.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="production" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Producție</CardTitle>
                <p className="text-sm text-muted-foreground">{production.length} {t("users.usersCount")}</p>
              </div>
            </CardHeader>
            <CardContent>
              <PaginatedUserTable data={production} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="engineers" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Ingineri</CardTitle>
                <p className="text-sm text-muted-foreground">{engineers.length} {t("users.usersCount")}</p>
              </div>
            </CardHeader>
            <CardContent>
              <PaginatedUserTable data={engineers} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="admins" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t("users.adminsManagers")}</CardTitle>
                <p className="text-sm text-muted-foreground">{admins.length} {t("users.usersCount")}</p>
              </div>
            </CardHeader>
            <CardContent>
              <PaginatedUserTable data={admins} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("users.deleteUser")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("users.deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("users.addUser")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("settings.firstName")}</Label>
                <Input
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  placeholder="Ion"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("settings.lastName")}</Label>
                <Input
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  placeholder="Popescu"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("common.email")}</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="ion.popescu@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Parola</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("users.role")}</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineer">Inginer</SelectItem>
                  <SelectItem value="production">Producție</SelectItem>
                  <SelectItem value="admin">{t("users.admins")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleCreate} disabled={isSaving}>
              {isSaving ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
