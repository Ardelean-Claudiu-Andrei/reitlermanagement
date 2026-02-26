"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAppData } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import type { ProductionOffer, ProductionItem, ProductionStatus } from "@/lib/types"

interface WizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductionOfferWizard({ open, onOpenChange }: WizardProps) {
  const router = useRouter()
  const { templates, products, addProductionOffer } = useAppData()
  const [step, setStep] = useState(1)
  const [templateId, setTemplateId] = useState("")
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [itemOverrides, setItemOverrides] = useState<Record<string, { qty: number; price: number; notes: string }>>({})
  const [startDate, setStartDate] = useState("")
  const [deadline, setDeadline] = useState("")
  const [initialStatus, setInitialStatus] = useState<ProductionStatus>("draft")

  const activeTemplates = templates.filter((t) => t.status === "active")
  const selectedTemplate = templates.find((t) => t.id === templateId)

  const templateProducts = useMemo(() => {
    if (!selectedTemplate) return []
    return selectedTemplate.items.map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.productId),
    }))
  }, [selectedTemplate, products])

  function toggleProduct(productId: string) {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  function handleTemplateSelect(id: string) {
    setTemplateId(id)
    const tpl = templates.find((t) => t.id === id)
    if (tpl) {
      const ids = tpl.items.map((i) => i.productId)
      setSelectedProductIds(ids)
      const overrides: Record<string, { qty: number; price: number; notes: string }> = {}
      tpl.items.forEach((item) => {
        overrides[item.productId] = {
          qty: item.defaultQty,
          price: item.unitPrice,
          notes: item.notes,
        }
      })
      setItemOverrides(overrides)
    }
  }

  function updateOverride(productId: string, field: string, value: number | string) {
    setItemOverrides((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }))
  }

  function handleCreate() {
    if (!templateId || selectedProductIds.length === 0 || !startDate || !deadline) {
      toast.error("Please complete all required fields")
      return
    }

    const selectedItems: ProductionItem[] = selectedProductIds.map((pid) => ({
      productId: pid,
      qty: itemOverrides[pid]?.qty ?? 1,
      unitPrice: itemOverrides[pid]?.price ?? 0,
      notes: itemOverrides[pid]?.notes ?? "",
    }))

    const offerNum = String(Date.now()).slice(-3)
    const offer: ProductionOffer = {
      id: `po${Date.now()}`,
      code: `PO-2026-${offerNum}`,
      name: `${selectedTemplate?.name} - #${offerNum}`,
      templateId,
      createdAt: new Date().toISOString().split("T")[0],
      startDate,
      deadline,
      status: initialStatus,
      selectedItems,
      checklist: [],
      activity: [
        {
          id: `a${Date.now()}`,
          action: "Production offer created",
          user: "Claudiu Ardelean",
          timestamp: new Date().toLocaleString(),
        },
      ],
    }

    addProductionOffer(offer)
    toast.success("Production offer created")
    onOpenChange(false)
    resetForm()
    router.push(`/production-offers/${offer.id}`)
  }

  function resetForm() {
    setStep(1)
    setTemplateId("")
    setSelectedProductIds([])
    setItemOverrides({})
    setStartDate("")
    setDeadline("")
    setInitialStatus("draft")
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm() }}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Production Offer</DialogTitle>
          <DialogDescription>
            Step {step} of 4 - {step === 1 ? "Select Template" : step === 2 ? "Select Products" : step === 3 ? "Configure Items" : "Finalize"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Template *</Label>
              <Select value={templateId || undefined} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {activeTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedTemplate && (
              <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">Select products to include in this offer:</p>
            {templateProducts.map(({ productId, product }) => (
              <label
                key={productId}
                className="flex items-center gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-secondary transition-colors"
              >
                <Checkbox
                  checked={selectedProductIds.includes(productId)}
                  onCheckedChange={() => toggleProduct(productId)}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {product?.code} - {product?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {product?.unit} | Base: {product?.basePrice.toFixed(2)}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">Adjust quantities, prices, and notes:</p>
            {selectedProductIds.map((pid) => {
              const product = products.find((p) => p.id === pid)
              const override = itemOverrides[pid] || { qty: 1, price: 0, notes: "" }
              return (
                <div key={pid} className="rounded-md border border-border p-3 space-y-2">
                  <p className="text-sm font-medium text-foreground">{product?.code} - {product?.name}</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        value={override.qty}
                        onChange={(e) => updateOverride(pid, "qty", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={override.price}
                        onChange={(e) => updateOverride(pid, "price", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Notes</Label>
                      <Input
                        value={override.notes}
                        onChange={(e) => updateOverride(pid, "notes", e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Deadline *</Label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Initial Status</Label>
              <Select value={initialStatus} onValueChange={(v) => setInitialStatus(v as ProductionStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in-production">In Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="text-sm font-medium text-foreground">Summary</p>
              <p className="text-sm text-muted-foreground">
                Template: {selectedTemplate?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Products: {selectedProductIds.length} items
              </p>
              <p className="text-sm text-muted-foreground">
                Total: {selectedProductIds.reduce((s, pid) => {
                  const o = itemOverrides[pid]
                  return s + (o ? o.qty * o.price : 0)
                }, 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && !templateId) || (step === 2 && selectedProductIds.length === 0)}
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleCreate}>Create Production Offer</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
