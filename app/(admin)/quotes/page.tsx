"use client"

import { useState } from "react"
import Link from "next/link"
import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
import type { QuoteStatus } from "@/lib/types"
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
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Copy, FolderPlus } from "lucide-react"
import { toast } from "sonner"

export default function QuotesPage() {
  const { quotes, companies, deleteQuote, duplicateQuote, createProjectFromQuote } = useAppData()
  const { t } = useLocale()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const safeQuotes = quotes ?? []
  const safeCompanies = companies ?? []

  const filtered = safeQuotes.filter((q) => {
    const matchesSearch =
      q.name.toLowerCase().includes(search.toLowerCase()) ||
      q.description.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || q.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return t("quotes.personal")
    return safeCompanies.find((c) => c.id === companyId)?.name || companyId
  }

  const getStatusBadge = (status: QuoteStatus) => {
    const config: Record<QuoteStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: "secondary", label: t("status.draft") },
      pending: { variant: "outline", label: t("status.pending") },
      approved: { variant: "default", label: t("status.approved") },
      rejected: { variant: "destructive", label: t("status.rejected") },
    }
    const c = config[status]
    return <Badge variant={c.variant}>{c.label}</Badge>
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteQuote(deleteId)
      toast.success(t("common.delete"))
      setDeleteId(null)
    }
  }

  const handleDuplicate = (id: string) => {
    duplicateQuote(id)
    toast.success(t("common.duplicate"))
  }

  const handleCreateProject = (quoteId: string) => {
    const project = createProjectFromQuote(quoteId)
    if (project) {
      toast.success(t("quotes.createProject"))
    } else {
      toast.error("Could not create project")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("quotes.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("quotes.description")}</p>
        </div>
        <Button asChild>
          <Link href="/quotes/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("quotes.addQuote")}
          </Link>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("common.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("category.all")}</SelectItem>
                <SelectItem value="draft">{t("status.draft")}</SelectItem>
                <SelectItem value="pending">{t("status.pending")}</SelectItem>
                <SelectItem value="approved">{t("status.approved")}</SelectItem>
                <SelectItem value="rejected">{t("status.rejected")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("common.company")}</TableHead>
                <TableHead>{t("quotes.validity")}</TableHead>
                <TableHead>{t("quotes.deliveryTime")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("common.total")}</TableHead>
                <TableHead>{t("common.createdAt")}</TableHead>
                <TableHead className="w-[80px]">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No quotes found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((quote) => {
                  const total = quote.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) + quote.installation
                  return (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">
                        <Link href={`/quotes/${quote.id}`} className="hover:underline">
                          {quote.name}
                        </Link>
                      </TableCell>
                      <TableCell>{getCompanyName(quote.companyId)}</TableCell>
                      <TableCell>{quote.validity}</TableCell>
                      <TableCell>{quote.deliveryTimeWeeks} {t("quotes.deliveryWeeks")}</TableCell>
                      <TableCell>{getStatusBadge(quote.status)}</TableCell>
                      <TableCell className="font-medium">{total.toLocaleString()} EUR</TableCell>
                      <TableCell>{quote.createdAt}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/quotes/${quote.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                {t("common.viewDetails")}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/quotes/${quote.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                {t("common.edit")}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(quote.id)}>
                              <Copy className="mr-2 h-4 w-4" />
                              {t("common.duplicate")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleCreateProject(quote.id)}>
                              <FolderPlus className="mr-2 h-4 w-4" />
                              {t("quotes.createProject")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteId(quote.id)}
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
