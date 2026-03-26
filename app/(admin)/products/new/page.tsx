"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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

export default function NewProductPage() {
  const router = useRouter()
  const { addProduct } = useAppData()
  const { t } = useLocale()

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
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error(t("common.requiredFields"))
      return
    }

    const newProduct = {
      id: `prod-${Date.now()}`,
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
      assemblyIds: [],
      partIds: [],
      steps: [],
      assemblySteps: [],
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }

    addProduct(newProduct)
    toast.success(t("common.savedSuccessfully"))
    router.push("/products")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/products")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{t("products.addProduct")}</h2>
          <p className="text-sm text-muted-foreground">{t("products.description")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("common.basicInfo")}</CardTitle>
              <CardDescription>{t("products.description")}</CardDescription>
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

          {/* Descriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("common.description")}</CardTitle>
              <CardDescription>{t("products.description")}</CardDescription>
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
            <Button type="button" variant="outline" onClick={() => router.push("/products")}>
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
