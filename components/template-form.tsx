"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAppData } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import type { OfferTemplate, TemplateItem } from "@/lib/types"

interface TemplateFormProps {
  templateId?: string
}

export function TemplateForm({ templateId }: TemplateFormProps) {
  const router = useRouter()
  const { templates, products, addTemplate, updateTemplate } = useAppData()

  const existing = templateId ? templates.find((t) => t.id === templateId) : null

  const [name, setName] = useState(existing?.name ?? "")
  const [description, setDescription] = useState(existing?.description ?? "")
  const [status, setStatus] = useState<"active" | "inactive">(existing?.status ?? "active")
  const [category, setCategory] = useState(existing?.category ?? "")
  const [items, setItems] = useState<TemplateItem[]>(existing?.items ?? [])

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.defaultQty, 0),
    [items]
  )

  function addRow() {
    setItems((prev) => [
      ...prev,
      { productId: "", unitPrice: 0, defaultQty: 1, notes: "" },
    ])
  }

  function removeRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function updateItem(index: number, partial: Partial<TemplateItem>) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...partial } : item))
    )
  }

  function handleProductSelect(index: number, productId: string) {
    const product = products.find((p) => p.id === productId)
    updateItem(index, {
      productId,
      unitPrice: product?.basePrice ?? 0,
    })
  }

  function handleSave() {
    if (!name) {
      toast.error("Template name is required")
      return
    }
    const validItems = items.filter((i) => i.productId)
    const template: OfferTemplate = {
      id: existing?.id ?? `t${Date.now()}`,
      name,
      description,
      status,
      category,
      items: validItems,
      createdAt: existing?.createdAt ?? new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }

    if (existing) {
      updateTemplate(template)
      toast.success("Template updated")
    } else {
      addTemplate(template)
      toast.success("Template created")
    }
    router.push("/templates")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/templates">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to templates</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            {existing ? "Edit Template" : "Create Template"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {existing ? "Update template details and products" : "Define a new offer template"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Standard Steel Frame"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the template..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as "active" | "inactive")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="cat">Category</Label>
              <Input
                id="cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Structural, Machinery"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Products in Template</CardTitle>
            <Button variant="outline" size="sm" onClick={addRow}>
              <Plus className="mr-2 h-4 w-4" />
              Add Row
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {"No products added yet. Click \"Add Row\" to start."}
            </p>
          ) : (
            <div className="space-y-3">
              <div className="hidden grid-cols-[2fr_1fr_1fr_1.5fr_40px] gap-3 text-xs font-medium text-muted-foreground sm:grid">
                <span>Product</span>
                <span>Unit Price</span>
                <span>Default Qty</span>
                <span>Notes</span>
                <span></span>
              </div>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr_1.5fr_40px]">
                  <Select
                    value={item.productId || undefined}
                    onValueChange={(v) => handleProductSelect(i, v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.code} - {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(i, { unitPrice: parseFloat(e.target.value) || 0 })}
                  />
                  <Input
                    type="number"
                    value={item.defaultQty}
                    onChange={(e) => updateItem(i, { defaultQty: parseInt(e.target.value) || 0 })}
                  />
                  <Input
                    value={item.notes}
                    onChange={(e) => updateItem(i, { notes: e.target.value })}
                    placeholder="Optional notes"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(i)}
                    className="h-9 w-9 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove row</span>
                  </Button>
                </div>
              ))}
              <div className="flex justify-end border-t border-border pt-3">
                <p className="text-sm font-medium text-foreground">
                  Subtotal: <span className="font-mono">{subtotal.toFixed(2)}</span>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" asChild>
          <Link href="/templates">Cancel</Link>
        </Button>
        <Button onClick={handleSave}>
          {existing ? "Save Changes" : "Create Template"}
        </Button>
      </div>
    </div>
  )
}
