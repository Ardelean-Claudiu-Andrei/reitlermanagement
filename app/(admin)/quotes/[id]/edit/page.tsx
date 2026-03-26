"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
import type { Quote, QuoteItem, QuoteStatus } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import { toast } from "sonner"

export default function QuoteEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { quotes, companies, products, updateQuote, addQuote } = useAppData()
  const { t } = useLocale()

  const isNew = id === "new"
  const existingQuote = quotes.find((q) => q.id === id)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    companyId: "" as string | null,
    status: "draft" as QuoteStatus,
    validity: "",
    deliveryTimeWeeks: 8,
    installation: 0,
    notes: "",
  })

  const [items, setItems] = useState<QuoteItem[]>([])

  useEffect(() => {
    if (!isNew && existingQuote) {
      setFormData({
        name: existingQuote.name,
        description: existingQuote.description,
        companyId: existingQuote.companyId,
        status: existingQuote.status,
        validity: existingQuote.validity,
        deliveryTimeWeeks: existingQuote.deliveryTimeWeeks,
        installation: existingQuote.installation,
        notes: existingQuote.notes,
      })
      setItems(existingQuote.items)
    } else {
      // Default validity 30 days from now
      const validityDate = new Date()
      validityDate.setDate(validityDate.getDate() + 30)
      setFormData((prev) => ({ ...prev, validity: validityDate.toISOString().split("T")[0] }))
    }
  }, [isNew, existingQuote])

  if (!isNew && !existingQuote) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">{t("noResults")}</p>
        <Button variant="link" onClick={() => router.push("/quotes")}>
          {t("back")}
        </Button>
      </div>
    )
  }

  const addItem = () => {
    setItems([...items, { productId: "", unitPrice: 0, quantity: 1, notes: "" }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    setItems(
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    )
  }

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId)
    setItems(
      items.map((item, i) =>
        i === index
          ? { ...item, productId, unitPrice: product?.basePrice || 0 }
          : item
      )
    )
  }

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const grandTotal = total + formData.installation

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Quote name is required")
      return
    }
    if (items.length === 0) {
      toast.error("Add at least one product")
      return
    }
    if (items.some((item) => !item.productId)) {
      toast.error("All items must have a product selected")
      return
    }

    const today = new Date().toISOString().split("T")[0]

    if (isNew) {
      const newQuote: Quote = {
        id: `q${Date.now()}`,
        ...formData,
        companyId: formData.companyId || null,
        items,
        createdAt: today,
        updatedAt: today,
      }
      addQuote(newQuote)
      toast.success(t("savedSuccessfully"))
      router.push(`/quotes/${newQuote.id}`)
    } else {
      const updated: Quote = {
        ...existingQuote!,
        ...formData,
        companyId: formData.companyId || null,
        items,
        updatedAt: today,
      }
      updateQuote(updated)
      toast.success(t("savedSuccessfully"))
      router.push(`/quotes/${updated.id}`)
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
            <h1 className="text-2xl font-bold text-foreground">
              {isNew ? t("addQuote") : `${t("edit")}: ${existingQuote?.name}`}
            </h1>
          </div>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          {t("save")}
        </Button>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("quoteName")} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">{t("company")}</Label>
              <Select
                value={formData.companyId || "personal"}
                onValueChange={(v) => setFormData({ ...formData, companyId: v === "personal" ? null : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectCompany")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal / Internal</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t("description")}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="status">{t("status")}</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v as QuoteStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t("draft")}</SelectItem>
                  <SelectItem value="pending">{t("pending")}</SelectItem>
                  <SelectItem value="approved">{t("approved")}</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="validity">{t("validity")}</Label>
              <Input
                id="validity"
                type="date"
                value={formData.validity}
                onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery">{t("deliveryTimeWeeks")}</Label>
              <Input
                id="delivery"
                type="number"
                min={1}
                value={formData.deliveryTimeWeeks}
                onChange={(e) => setFormData({ ...formData, deliveryTimeWeeks: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="installation">{t("installation")} (EUR)</Label>
              <Input
                id="installation"
                type="number"
                min={0}
                value={formData.installation}
                onChange={(e) => setFormData({ ...formData, installation: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("products")}</CardTitle>
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addProduct")}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">{t("productName")}</TableHead>
                <TableHead className="w-[100px]">{t("quantity")}</TableHead>
                <TableHead className="w-[120px]">{t("price")} (EUR)</TableHead>
                <TableHead className="w-[120px]">{t("total")} (EUR)</TableHead>
                <TableHead>{t("notes")}</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No products added. Click "Add Product" to start.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Select
                        value={item.productId || ""}
                        onValueChange={(v) => handleProductChange(idx, v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectProduct")} />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 1)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {(item.quantity * item.unitPrice).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.notes}
                        onChange={(e) => updateItem(idx, "notes", e.target.value)}
                        placeholder="Notes..."
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(idx)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {items.length > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">Subtotal:</TableCell>
                    <TableCell className="font-medium">{total.toFixed(2)}</TableCell>
                    <TableCell colSpan={2} />
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">{t("installation")}:</TableCell>
                    <TableCell className="font-medium">{formData.installation.toFixed(2)}</TableCell>
                    <TableCell colSpan={2} />
                  </TableRow>
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={3} className="text-right font-bold">{t("total")}:</TableCell>
                    <TableCell className="font-bold text-lg">{grandTotal.toFixed(2)} EUR</TableCell>
                    <TableCell colSpan={2} />
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>{t("notes")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="Additional notes..."
          />
        </CardContent>
      </Card>
    </div>
  )
}
