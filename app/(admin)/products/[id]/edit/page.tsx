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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Plus, X, Search } from "lucide-react"
import { toast } from "sonner"
import { EntityFileUploads } from "@/components/entity-file-uploads"
import { productsApi } from "@/lib/api"
import type { AssemblyStep, Product, ProductCategory, ProductAssemblyEntry, ProductPartEntry } from "@/lib/types"
import { StepEditor } from "@/components/step-editor"

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
  const [fetchLoading, setFetchLoading] = useState(!contextProduct)
  const [saving, setSaving] = useState(false)
  const [assemblySearch, setAssemblySearch] = useState("")
  const [partSearch, setPartSearch] = useState("")

  // Fetch from API if not in context (e.g. right after create → redirect)
  useEffect(() => {
    if (!contextProduct && productId) {
      setFetchLoading(true)
      productsApi.get(productId)
        .then(setApiProduct)
        .catch(() => {})
        .finally(() => setFetchLoading(false))
    } else if (contextProduct) {
      setFetchLoading(false)
    }
  }, [productId, contextProduct])

  const product = contextProduct ?? apiProduct

  const [formData, setFormData] = useState(() => ({
    code: product?.code ?? "",
    name: product?.name ?? "",
    category: resolveCategory(product?.category),
    basePrice: product?.basePrice !== undefined ? String(product.basePrice) : "" as string,
    descriptionRo: product?.description?.ro ?? "",
    descriptionHu: product?.description?.hu ?? "",
    descriptionDe: product?.description?.de ?? "",
    descriptionEn: product?.description?.en ?? "",
    notes: product?.notes ?? "",
    productAssemblies: (product?.productAssemblies ?? product?.assemblyIds?.map(id => ({ assemblyId: id, quantity: 1 })) ?? []) as ProductAssemblyEntry[],
    productParts: (product?.productParts ?? product?.partIds?.map(id => ({ partId: id, quantity: 1 })) ?? []) as ProductPartEntry[],
  }))

  const [formSteps, setFormSteps] = useState<AssemblyStep[]>(() =>
    product?.productionSteps ?? []
  )

  // Re-sync when product first becomes available (async context or API fetch)
  useEffect(() => {
    if (!product) return
    setFormData({
      code: product.code,
      name: product.name,
      category: resolveCategory(product.category),
      basePrice: String(product.basePrice ?? ""),
      descriptionRo: product.description?.ro ?? "",
      descriptionHu: product.description?.hu ?? "",
      descriptionDe: product.description?.de ?? "",
      descriptionEn: product.description?.en ?? "",
      notes: product.notes ?? "",
      productAssemblies: product.productAssemblies ?? (product.assemblyIds ?? []).map(id => ({ assemblyId: id, quantity: 1 })),
      productParts: product.productParts ?? (product.partIds ?? []).map(id => ({ partId: id, quantity: 1 })),
    })
    setFormSteps(product.productionSteps ?? [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id])

  // ─── Assembly / Part toggle ────────────────────────────────────────────────

  const toggleAssembly = (assemblyId: string) => {
    setFormData((prev) => {
      const exists = prev.productAssemblies.some((a) => a.assemblyId === assemblyId)
      return {
        ...prev,
        productAssemblies: exists
          ? prev.productAssemblies.filter((a) => a.assemblyId !== assemblyId)
          : [...prev.productAssemblies, { assemblyId, quantity: 1 }],
      }
    })
  }

  const updateAssemblyQty = (assemblyId: string, quantity: number) => {
    setFormData((prev) => ({
      ...prev,
      productAssemblies: prev.productAssemblies.map((a) =>
        a.assemblyId === assemblyId ? { ...a, quantity: Math.max(1, quantity) } : a
      ),
    }))
  }

  const togglePart = (partId: string) => {
    setFormData((prev) => {
      const exists = prev.productParts.some((p) => p.partId === partId)
      return {
        ...prev,
        productParts: exists
          ? prev.productParts.filter((p) => p.partId !== partId)
          : [...prev.productParts, { partId, quantity: 1 }],
      }
    })
  }

  const updatePartQty = (partId: string, quantity: number) => {
    setFormData((prev) => ({
      ...prev,
      productParts: prev.productParts.map((p) =>
        p.partId === partId ? { ...p, quantity: Math.max(1, quantity) } : p
      ),
    }))
  }

  // ─── Search filter ─────────────────────────────────────────────────────────

  const filteredAssemblies = assemblySearch.trim()
    ? safeAssemblies.filter(
        (a) =>
          a.name.toLowerCase().includes(assemblySearch.toLowerCase()) ||
          a.code.toLowerCase().includes(assemblySearch.toLowerCase())
      )
    : safeAssemblies

  const filteredParts = partSearch.trim()
    ? safeParts.filter(
        (p) =>
          p.name.toLowerCase().includes(partSearch.toLowerCase()) ||
          (p.code ?? "").toLowerCase().includes(partSearch.toLowerCase())
      )
    : safeParts

  // ─── Loading / not found ───────────────────────────────────────────────────

  if (!product && fetchLoading) {
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

  // ─── Save ──────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!product) return

    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error(t("common.requiredFields"))
      return
    }

    const updatedProduct: Product = {
      ...product,
      code: formData.code.trim(),
      name: formData.name.trim(),
      category: formData.category as ProductCategory,
      basePrice: typeof formData.basePrice === "string" ? parseFloat(formData.basePrice) || 0 : formData.basePrice,
      description: {
        ro: formData.descriptionRo,
        hu: formData.descriptionHu,
        de: formData.descriptionDe,
        en: formData.descriptionEn,
      },
      notes: formData.notes,
      productAssemblies: formData.productAssemblies,
      productParts: formData.productParts,
      assemblyIds: formData.productAssemblies.map((a) => a.assemblyId),
      partIds: formData.productParts.map((p) => p.partId),
      productionSteps: formSteps,
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

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/products/${product.id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              {t("common.edit")}: {product.name}
            </h2>
            <p className="text-sm text-muted-foreground font-mono">{product.code}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Se salvează..." : t("common.save")}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Informații</TabsTrigger>
          <TabsTrigger value="assemblies">
            Ansambluri{formData.productAssemblies.length > 0 ? ` (${formData.productAssemblies.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="parts">
            Piese{formData.productParts.length > 0 ? ` (${formData.productParts.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="steps">
            Pași producție{formSteps.length > 0 ? ` (${formSteps.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="files">Fișiere</TabsTrigger>
        </TabsList>

        {/* ── Informații ──────────────────────────────────────────────────── */}
        <TabsContent value="info" className="mt-4 space-y-6">
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
                  <Label>{t("products.category")}</Label>
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
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("common.description")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>RO</Label>
                  <Textarea
                    placeholder="Descriere in romana..."
                    value={formData.descriptionRo}
                    onChange={(e) => setFormData({ ...formData, descriptionRo: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>HU</Label>
                  <Textarea
                    placeholder="Leírás magyarul..."
                    value={formData.descriptionHu}
                    onChange={(e) => setFormData({ ...formData, descriptionHu: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>DE</Label>
                  <Textarea
                    placeholder="Beschreibung auf Deutsch..."
                    value={formData.descriptionDe}
                    onChange={(e) => setFormData({ ...formData, descriptionDe: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>EN</Label>
                  <Textarea
                    placeholder="Description in English..."
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

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
        </TabsContent>

        {/* ── Ansambluri ──────────────────────────────────────────────────── */}
        <TabsContent value="assemblies" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("products.subassemblies")}</CardTitle>
              <CardDescription>
                {formData.productAssemblies.length === 0
                  ? "Niciun ansamblu selectat."
                  : `${formData.productAssemblies.length} ansamblu(ri) selectate`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Selected assemblies with quantity */}
              {formData.productAssemblies.length > 0 && (
                <div className="space-y-2 pb-3 border-b">
                  {formData.productAssemblies.map((entry) => {
                    const asm = safeAssemblies.find((a) => a.id === entry.assemblyId)
                    return asm ? (
                      <div key={entry.assemblyId} className="flex items-center gap-2 rounded-md border p-2 bg-muted/20">
                        <span className="flex-1 font-medium text-sm">{asm.name}
                          <span className="ml-2 text-xs text-muted-foreground font-mono">{asm.code}</span>
                        </span>
                        <span className="text-xs text-muted-foreground">×</span>
                        <Input
                          type="number"
                          min="1"
                          value={entry.quantity}
                          onChange={(e) => updateAssemblyQty(entry.assemblyId, parseInt(e.target.value) || 1)}
                          className="w-16 h-7 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => toggleAssembly(entry.assemblyId)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null
                  })}
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Caută ansamblu după nume sau cod..."
                  value={assemblySearch}
                  onChange={(e) => setAssemblySearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {safeAssemblies.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("materials.noAssembliesFound")}</p>
              ) : filteredAssemblies.length === 0 ? (
                <p className="text-sm text-muted-foreground">Niciun rezultat pentru &ldquo;{assemblySearch}&rdquo;.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 max-h-[420px] overflow-y-auto pr-1">
                  {filteredAssemblies.map((assembly) => {
                    const isSelected = formData.productAssemblies.some((a) => a.assemblyId === assembly.id)
                    return (
                      <div
                        key={assembly.id}
                        className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-muted/30"
                        onClick={() => toggleAssembly(assembly.id)}
                      >
                        <Checkbox
                          id={`asm-${assembly.id}`}
                          checked={isSelected}
                          onCheckedChange={() => toggleAssembly(assembly.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Label htmlFor={`asm-${assembly.id}`} className="flex-1 cursor-pointer">
                          <span className="font-medium">{assembly.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground font-mono">
                            {assembly.code}
                          </span>
                        </Label>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Piese ───────────────────────────────────────────────────────── */}
        <TabsContent value="parts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("products.directParts")}</CardTitle>
              <CardDescription>
                {formData.productParts.length === 0
                  ? "Nicio piesă directă selectată."
                  : `${formData.productParts.length} piesă(e) selectate`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Selected parts with quantity */}
              {formData.productParts.length > 0 && (
                <div className="space-y-2 pb-3 border-b">
                  {formData.productParts.map((entry) => {
                    const part = safeParts.find((p) => p.id === entry.partId)
                    return part ? (
                      <div key={entry.partId} className="flex items-center gap-2 rounded-md border p-2 bg-muted/20">
                        <span className="flex-1 font-medium text-sm">{part.name}
                          {part.code && <span className="ml-2 text-xs text-muted-foreground font-mono">{part.code}</span>}
                        </span>
                        <span className="text-xs text-muted-foreground">×</span>
                        <Input
                          type="number"
                          min="1"
                          value={entry.quantity}
                          onChange={(e) => updatePartQty(entry.partId, parseInt(e.target.value) || 1)}
                          className="w-16 h-7 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => togglePart(entry.partId)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null
                  })}
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Caută piesă după nume sau cod..."
                  value={partSearch}
                  onChange={(e) => setPartSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {safeParts.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("materials.noPartsAdded")}</p>
              ) : filteredParts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Niciun rezultat pentru &ldquo;{partSearch}&rdquo;.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 max-h-[420px] overflow-y-auto pr-1">
                  {filteredParts.map((part) => {
                    const isSelected = formData.productParts.some((p) => p.partId === part.id)
                    return (
                      <div
                        key={part.id}
                        className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-muted/30"
                        onClick={() => togglePart(part.id)}
                      >
                        <Checkbox
                          id={`part-${part.id}`}
                          checked={isSelected}
                          onCheckedChange={() => togglePart(part.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Label htmlFor={`part-${part.id}`} className="flex-1 cursor-pointer">
                          <span className="font-medium">{part.name}</span>
                          {part.code && (
                            <span className="ml-2 text-xs text-muted-foreground font-mono">
                              {part.code}
                            </span>
                          )}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Pași producție ───────────────────────────────────────────────── */}
        <TabsContent value="steps" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pași de producție</CardTitle>
              <CardDescription>Operațiile de producție la nivel de produs</CardDescription>
            </CardHeader>
            <CardContent>
              <StepEditor steps={formSteps} onChange={setFormSteps} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Fișiere ──────────────────────────────────────────────────────── */}
        <TabsContent value="files" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fișiere</CardTitle>
              <CardDescription>DXF, PDF, imagini atașate produsului — detectate automat după extensie</CardDescription>
            </CardHeader>
            <CardContent>
              <EntityFileUploads
                entityType="product"
                entityId={product.id}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
