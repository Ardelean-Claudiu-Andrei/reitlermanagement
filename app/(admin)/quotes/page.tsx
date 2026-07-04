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
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Copy, FolderPlus, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

export default function QuotesPage() {
  const { quotes, companies, deleteQuote, duplicateQuote, createProjectFromQuote } = useAppData()
  const { t } = useLocale()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

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

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteQuote(deleteId)
        toast.success(t("common.delete"))
      } catch {
        toast.error(t("common.errorOccurred"))
      }
      setDeleteId(null)
    }
  }

  const handleDuplicate = (id: string) => {
    duplicateQuote(id)
    toast.success(t("common.duplicate"))
  }

  const handleCreateProject = async (quoteId: string) => {
    const project = await createProjectFromQuote(quoteId)
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
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
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
                paginated.map((quote) => {
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
                      <TableCell>{quote.createdAt?.slice(0, 10)}</TableCell>
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
                            <DropdownMenuItem onClick={async () => await handleCreateProject(quote.id)}>
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

          {filtered.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t mt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
