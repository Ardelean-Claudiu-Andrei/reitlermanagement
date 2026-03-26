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
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"

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

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const { products, assemblies, parts, updateProduct } = useAppData()
  const { t } = useLocale()

  const safeProducts = products ?? []
  const safeAssemblies = assemblies ?? []
  const safeParts = parts ?? []
  const product = safeProducts.find((p) => p.id === params.id)

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "other",
    basePrice: 0,
    descriptionRo: "",
    descriptionHu: "",
    descriptionDe: "",
    descriptionEn: "",
    notes: "",
    assemblyIds: [] as string[],
    partIds: [] as string[],
  })

  useEffect(() => {
    if (product) {
      setFormData({
        code: product.code,
        name: product.name,
        category: product.category,
        basePrice: product.basePrice,
        descriptionRo: product.description?.ro || "",
        descriptionHu: product.description?.hu || "",
        descriptionDe: product.description?.de || "",
        descriptionEn: product.description?.en || "",
        notes: product.notes || "",
        assemblyIds: product.assemblyIds ?? [],
        partIds: product.partIds ?? [],
      })
    }
  }, [product])

  if (!product) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">{t("products.notFound")}</p>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error(t("common.requiredFields"))
      return
    }

    const updatedProduct = {
      ...product,
      code: formData.code.trim(),
      name: formData.name.trim(),
      category: formData.category,
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
      updatedAt: new Date().toISOString().split("T")[0],
    }

    updateProduct(updatedProduct)
    toast.success(t("common.savedSuccessfully"))
    router.push(`/products/${product.id}`)
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

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push(`/products/${product.id}`)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              {t("common.save")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
