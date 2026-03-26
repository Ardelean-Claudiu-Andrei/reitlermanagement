"use client"

import { useState } from "react"
import Link from "next/link"
import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
import type { Company } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Label } from "@/components/ui/label"
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function ManagementPage() {
  const { companies, quotes, projects, addCompany, updateCompany, deleteCompany } = useAppData()
  const { t } = useLocale()
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    address: "",
  })

  const safeCompanies = companies ?? []
  const safeProjects = projects ?? []
  const safeQuotes = quotes ?? []

  const filtered = safeCompanies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase())
  )

  const getCompanyStats = (companyId: string) => {
    const companyProjects = safeProjects.filter((p) => p.companyId === companyId)
    const companyQuotes = safeQuotes.filter((q) => q.companyId === companyId)
    return { projects: companyProjects.length, quotes: companyQuotes.length }
  }

  const openNewDialog = () => {
    setEditingCompany(null)
    setFormData({ name: "", contactPerson: "", phone: "", address: "" })
    setDialogOpen(true)
  }

  const openEditDialog = (company: Company) => {
    setEditingCompany(company)
    setFormData({
      name: company.name,
      contactPerson: company.contactPerson,
      phone: company.phone,
      address: company.address,
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Company name is required")
      return
    }

    const today = new Date().toISOString().split("T")[0]

    if (editingCompany) {
      updateCompany({
        ...editingCompany,
        ...formData,
        updatedAt: today,
      })
      toast.success(t("common.saved"))
    } else {
      const newCompany: Company = {
        id: `comp${Date.now()}`,
        ...formData,
        createdAt: today,
        updatedAt: today,
      }
      addCompany(newCompany)
      toast.success(t("common.saved"))
    }

    setDialogOpen(false)
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteCompany(deleteId)
      toast.success(t("common.delete"))
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("companies.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("companies.description")}</p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t("companies.addCompany")}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`${t("common.search")}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("companies.contactPerson")}</TableHead>
                <TableHead>{t("common.phone")}</TableHead>
                <TableHead>{t("common.address")}</TableHead>
                <TableHead>{t("nav.projects")}</TableHead>
                <TableHead>{t("nav.quotes")}</TableHead>
                <TableHead>{t("common.updatedAt")}</TableHead>
                <TableHead className="w-[80px]">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No companies found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((company) => {
                  const stats = getCompanyStats(company.id)
                  return (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.contactPerson}</TableCell>
                      <TableCell>{company.phone}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{company.address}</TableCell>
                      <TableCell>{stats.projects}</TableCell>
                      <TableCell>{stats.quotes}</TableCell>
                      <TableCell>{company.updatedAt}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/management/${company.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                {t("common.viewDetails")}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(company)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              {t("common.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteId(company.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("common.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCompany ? t("common.edit") : t("common.add")} {t("common.company")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("common.name")} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPerson">{t("companies.contactPerson")}</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("common.phone")}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{t("common.address")}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete")}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
