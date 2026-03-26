"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
import { quoteLocales, quoteLocaleNames, type QuoteLocale } from "@/lib/i18n"
import type { QuoteStatus } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Pencil, FileDown, FolderPlus, Calendar, Truck, Building2 } from "lucide-react"
import { toast } from "sonner"

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { quotes, companies, products, updateQuoteStatus, createProjectFromQuote } = useAppData()
  const { t, locale } = useLocale()
  const [generateOpen, setGenerateOpen] = useState(false)
  const [exportLang, setExportLang] = useState<QuoteLocale>("ro")

  const quote = quotes.find((q) => q.id === id)

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">{t("quotes.noQuotesFound")}</p>
        <Button variant="link" onClick={() => router.push("/quotes")}>
          {t("common.back")}
        </Button>
      </div>
    )
  }

  const company = quote.companyId ? companies.find((c) => c.id === quote.companyId) : null
  const total = quote.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const grandTotal = total + quote.installation

  const getProductName = (productId: string) => {
    return products.find((p) => p.id === productId)?.name || productId
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

  const handleGenerateQuote = () => {
    // Generate CSV export
    const rows: string[][] = [
      ["SMS REITLER - QUOTE"],
      [""],
      ["Quote Name:", quote.name],
      ["Company:", company?.name || "Personal / Internal"],
      ["Contact:", company?.contactPerson || "-"],
      ["Validity:", quote.validity],
      ["Delivery Time:", `${quote.deliveryTimeWeeks} weeks`],
      [""],
      ["PRODUCTS"],
      ["Product", "Quantity", "Unit Price", "Total", "Notes"],
    ]

    quote.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId)
      rows.push([
        product?.name || item.productId,
        item.quantity.toString(),
        item.unitPrice.toFixed(2),
        (item.quantity * item.unitPrice).toFixed(2),
        item.notes,
      ])
    })

    rows.push([""])
    rows.push(["Subtotal:", "", "", total.toFixed(2)])
    rows.push(["Installation/Labor:", "", "", quote.installation.toFixed(2)])
    rows.push(["GRAND TOTAL:", "", "", grandTotal.toFixed(2)])

    if (quote.notes) {
      rows.push([""])
      rows.push(["Notes:", quote.notes])
    }

    const csvContent = rows.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `quote_${quote.name.replace(/\s+/g, "_")}_${exportLang}.csv`
    link.click()
    URL.revokeObjectURL(url)

    setGenerateOpen(false)
    toast.success(`Quote exported in ${quoteLocaleNames[exportLang]}`)
  }

  const handleCreateProject = () => {
    const project = createProjectFromQuote(quote.id)
    if (project) {
      toast.success("Project created from quote")
      router.push(`/projects/${project.id}`)
    } else {
      toast.error("Could not create project")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/quotes")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{quote.name}</h1>
            <p className="text-sm text-muted-foreground">{quote.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setGenerateOpen(true)}>
            <FileDown className="mr-2 h-4 w-4" />
            {t("quotes.generateQuote")}
          </Button>
          <Button variant="outline" onClick={handleCreateProject}>
            <FolderPlus className="mr-2 h-4 w-4" />
            {t("quotes.createProject")}
          </Button>
          <Button asChild>
            <Link href={`/quotes/${quote.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              {t("common.edit")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Quote Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("common.company")}</p>
                <p className="font-medium">{company?.name || t("quotes.personal")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("quotes.validity")}</p>
                <p className="font-medium">{quote.validity}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("quotes.deliveryTime")}</p>
                <p className="font-medium">{quote.deliveryTimeWeeks} {t("quotes.deliveryWeeks")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-xs text-muted-foreground">{t("common.status")}</p>
              <div className="mt-1">{getStatusBadge(quote.status)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("products")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("products.productName")}</TableHead>
                <TableHead className="text-right">{t("common.quantity")}</TableHead>
                <TableHead className="text-right">{t("common.price")} (EUR)</TableHead>
                <TableHead className="text-right">{t("common.total")} (EUR)</TableHead>
                <TableHead>{t("common.notes")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{getProductName(item.productId)}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">{item.notes || "-"}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-medium">Subtotal:</TableCell>
                <TableCell className="text-right font-medium">{total.toFixed(2)}</TableCell>
                <TableCell />
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-medium">{t("quotes.installation")}:</TableCell>
                <TableCell className="text-right font-medium">{quote.installation.toFixed(2)}</TableCell>
                <TableCell />
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell colSpan={3} className="text-right font-bold">{t("common.total")}:</TableCell>
                <TableCell className="text-right font-bold text-lg">{grandTotal.toFixed(2)} EUR</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Notes */}
      {quote.notes && (
        <Card>
          <CardHeader>
            <CardTitle>{t("common.notes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{quote.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Generate Quote Dialog */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("quotes.generateQuote")}</DialogTitle>
            <DialogDescription>
              {t("quotes.quoteSummary")} - {quote.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border p-4 space-y-2">
              <p><strong>{t("common.company")}:</strong> {company?.name || t("quotes.personal")}</p>
              <p><strong>{t("common.total")}:</strong> {grandTotal.toFixed(2)} EUR</p>
              <p><strong>{t("quotes.deliveryTime")}:</strong> {quote.deliveryTimeWeeks} {t("quotes.deliveryWeeks")}</p>
            </div>
            <div className="space-y-2">
              <Label>{t("quotes.selectLanguage")}</Label>
              <Select value={exportLang} onValueChange={(v) => setExportLang(v as QuoteLocale)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {quoteLocales.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {quoteLocaleNames[loc]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleGenerateQuote}>
              <FileDown className="mr-2 h-4 w-4" />
              {t("common.export")} CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
