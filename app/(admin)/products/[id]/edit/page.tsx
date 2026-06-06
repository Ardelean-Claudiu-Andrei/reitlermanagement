"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Plus, X, GripVertical } from "lucide-react"
import { toast } from "sonner"
import { EntityFileUploads } from "@/components/entity-file-uploads"
import { productsApi } from "@/lib/api"
import type { AssemblyStep, Product, ProductCategory } from "@/lib/types"

const STEP_TYPES = ["laser-cutting", "plasma-cutting", "cnc", "welding", "assembly"] as const

function newStepId() { return `step-${Date.now()}-${Math.random().toString(36).slice(2)}` }

const categories = [
  { value: "silo-interior", label: "Silo Interior" },
  { value: "silo-exterior", label: "Silo Exterior" },
  { value: "maia", label: "Maia" },
  { value: "dissolver", label: "Dissolver" },
  { value: "blower", label: "Blower" },
  { value: "cyclone-doser", label: "Cyclone Doser" },
  { value: "control-panel", label: "Control Panel" },
  { value: "other", label: "Other" },
]

function resolveCategory(raw: string | undefined): string {
  if (!raw) return "other"
  const match = categories.find(
    (c) => c.value === raw || c.label.toLowerCase() === raw.toLowerCase()
  )
  return match?.value ?? "other"
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const { products, assemblies, parts, updateProduct } = useAppData()
  const { t } = useLocale()

  const productId = params.id as string
  const safeProducts = products ?? []
  const safeAssemblies = assemblies ?? []
  const safeParts = parts ?? []

  const contextProduct = safeProducts.find((p) => p.id === productId)
  const [apiProduct, setApiProduct] = useState<Product | null>(null)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch from API if not in context (e.g. after direct create → redirect)
  useEffect(() => {
    if (!contextProduct && productId) {
      setFetchLoading(true)
      productsApi.get(productId)
        .then(setApiProduct)
        .catch(() => {})
        .finally(() => setFetchLoading(false))
    }
  }, [productId, contextProduct])

  const product = contextProduct ?? apiProduct

  const [formData, setFormData] = useState(() => ({
    code: product?.code ?? "",
    name: product?.name ?? "",
    category: resolveCategory(product?.category),
    basePrice: product?.basePrice ?? 0,
    descriptionRo: product?.description?.ro ?? "",
    descriptionHu: product?.description?.hu ?? "",
    descriptionDe: product?.description?.de ?? "",
    descriptionEn: product?.description?.en ?? "",
    notes: product?.notes ?? "",
    assemblyIds: product?.assemblyIds ?? [] as string[],
    partIds: product?.partIds ?? [] as string[],
  }))

  const [formSteps, setFormSteps] = useState<AssemblyStep[]>(() =>
    product?.productionSteps ?? []
  )

  // Re-sync when product loads (async context or API fetch)
  useEffect(() => {
    if (product && !formData.code) {
      setFormData({
        code: product.code,
        name: product.name,
        category: resolveCategory(product.category),
        basePrice: product.basePrice,
        descriptionRo: product.description?.ro ?? "",
        descriptionHu: product.description?.hu ?? "",
        descriptionDe: product.description?.de ?? "",
        descriptionEn: product.description?.en ?? "",
        notes: product.notes ?? "",
        assemblyIds: product.assemblyIds ?? [],
        partIds: product.partIds ?? [],
      })
      setFormSteps(product.productionSteps ?? [])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id])

  // ─── Step helpers ─────────────────────────────────────────────────────────

  function addStep() {
    setFormSteps((prev) => [
      ...prev,
      { id: newStepId(), name: "", type: "assembly", description: "", order: prev.length + 1 },
    ])
  }

  function updateStep(index: number, field: keyof AssemblyStep, value: string | number) {
    setFormSteps((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  function removeStep(index: number) {
    setFormSteps((prev) =>
      prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }))
    )
  }

  if (fetchLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Se încarcă...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">{t("products.notFound")}</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error(t("common.requiredFields"))
      return
    }

    const updatedProduct = {
      ...product,
      code: formData.code.trim(),
      name: formData.name.trim(),
      category: formData.category as ProductCategory,
      basePrice: formData.basePrice,
      description: {
        ro: formData.descriptionRo,
        hu: formData.descriptionHu,
        de: formData.descriptionDe,
        en: formData.descriptionEn,
      },
      notes: formData.notes,
      assemblyIds: formData.assemblyIds,
      partIds: formData.partIds,
      productionSteps: formSteps,
      updatedAt: new Date().toISOString().split("T")[0],
    }

    setSaving(true)
    try {
      await updateProduct(updatedProduct)
      toast.success(t("common.savedSuccessfully"))
      router.push(`/products/${product.id}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("common.errorOccurred"))
    } finally {
      setSaving(false)
    }
  }

  const toggleAssembly = (assemblyId: string) => {
    setFormData((prev) => ({
      ...prev,
      assemblyIds: prev.assemblyIds.includes(assemblyId)
        ? prev.assemblyIds.filter((id) => id !== assemblyId)
        : [...prev.assemblyIds, assemblyId],
    }))
  }

  const togglePart = (partId: string) => {
    setFormData((prev) => ({
      ...prev,
      partIds: prev.partIds.includes(partId)
        ? prev.partIds.filter((id) => id !== partId)
        : [...prev.partIds, partId],
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/products/${product.id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{t("common.edit")}: {product.name}</h2>
          <p className="text-sm text-muted-foreground font-mono">{product.code}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("common.basicInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="code">{t("common.code")} *</Label>
                  <Input
                    id="code"
                    placeholder="PROD-001"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">{t("common.name")} *</Label>
                  <Input
                    id="name"
                    placeholder={t("products.productName")}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">{t("products.category")}</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="basePrice">{t("products.basePrice")} (EUR)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Production Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pași de producție</CardTitle>
              <CardDescription>Operațiile de producție pentru acest produs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {formSteps.length === 0 ? "Niciun pas adăugat." : `${formSteps.length} pas(i)`}
                </p>
                <Button type="button" variant="outline" size="sm" onClick={addStep}>
                  <Plus className="mr-1 h-3 w-3" />
                  Adaugă pas
                </Button>
              </div>
              {formSteps.length > 0 && (
                <div className="space-y-3">
                  {formSteps.map((step, idx) => (
                    <div key={step.id} className="rounded-md border p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground w-5 shrink-0">{idx + 1}.</span>
                        <div className="flex-1 space-y-1.5">
                          <Input
                            value={step.name}
                            onChange={(e) => updateStep(idx, "name", e.target.value)}
                            placeholder="Denumire pas"
                          />
                          <Input
                            value={step.description}
                            onChange={(e) => updateStep(idx, "description", e.target.value)}
                            placeholder="Descriere (opțional)"
                            className="text-sm"
                          />
                        </div>
                        <Select value={step.type} onValueChange={(v) => updateStep(idx, "type", v)}>
                          <SelectTrigger className="w-40 shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STEP_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => removeStep(idx)}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assemblies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("products.subassemblies")}</CardTitle>
              <CardDescription>{t("products.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                {safeAssemblies.map((assembly) => (
                  <div key={assembly.id} className="flex items-center space-x-2 rounded-md border p-3">
                    <Checkbox
                      id={`asm-${assembly.id}`}
                      checked={formData.assemblyIds.includes(assembly.id)}
                      onCheckedChange={() => toggleAssembly(assembly.id)}
                    />
                    <Label htmlFor={`asm-${assembly.id}`} className="flex-1 cursor-pointer">
                      <span className="font-medium">{assembly.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground font-mono">{assembly.code}</span>
                    </Label>
                  </div>
                ))}
              </div>
              {safeAssemblies.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("materials.noAssembliesFound")}</p>
              )}
            </CardContent>
          </Card>

          {/* Direct Parts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("products.directParts")}</CardTitle>
              <CardDescription>{t("products.directPartsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 max-h-[300px] overflow-y-auto">
                {safeParts.map((part) => (
                  <div key={part.id} className="flex items-center space-x-2 rounded-md border p-3">
                    <Checkbox
                      id={`part-${part.id}`}
                      checked={formData.partIds.includes(part.id)}
                      onCheckedChange={() => togglePart(part.id)}
                    />
                    <Label htmlFor={`part-${part.id}`} className="flex-1 cursor-pointer">
                      <span className="font-medium">{part.name}</span>
                    </Label>
                  </div>
                ))}
              </div>
              {safeParts.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("materials.noPartsAdded")}</p>
              )}
            </CardContent>
          </Card>

          {/* Descriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("common.description")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="descRo">RO</Label>
                  <Textarea
                    id="descRo"
                    placeholder="Descriere in romana..."
                    value={formData.descriptionRo}
                    onChange={(e) => setFormData({ ...formData, descriptionRo: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descHu">HU</Label>
                  <Textarea
                    id="descHu"
                    placeholder="Leírás magyarul..."
                    value={formData.descriptionHu}
                    onChange={(e) => setFormData({ ...formData, descriptionHu: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descDe">DE</Label>
                  <Textarea
                    id="descDe"
                    placeholder="Beschreibung auf Deutsch..."
                    value={formData.descriptionDe}
                    onChange={(e) => setFormData({ ...formData, descriptionDe: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descEn">EN</Label>
                  <Textarea
                    id="descEn"
                    placeholder="Description in English..."
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("common.notes")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={t("common.notes")}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Files */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fișiere</CardTitle>
              <CardDescription>DXF, DPD, PDF atașate produsului</CardDescription>
            </CardHeader>
            <CardContent>
              <EntityFileUploads
                entityType="product"
                entityId={product.id}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push(`/products/${product.id}`)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Se salvează..." : t("common.save")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
