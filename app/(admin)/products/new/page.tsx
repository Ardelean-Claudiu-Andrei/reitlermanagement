"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLocale } from "@/lib/locale-context"
import { useAppData } from "@/lib/app-context"
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
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Info, ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
  const { t } = useLocale()
  const { addProduct } = useAppData()
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "other",
    basePrice: "" as string | number,
    descriptionRo: "",
    descriptionHu: "",
    descriptionDe: "",
    descriptionEn: "",
    notes: "",
  })

  const [formRequiresPurchase, setFormRequiresPurchase] = useState(false)
  const [formPurchaseSupplier, setFormPurchaseSupplier] = useState("")
  const [formPurchasePrice, setFormPurchasePrice] = useState<number | null>(null)
  const [formPurchaseCurrency, setFormPurchaseCurrency] = useState("EUR")
  const [formPurchaseVatIncluded, setFormPurchaseVatIncluded] = useState(false)
  const [formPurchaseVatRate, setFormPurchaseVatRate] = useState(21)
  const [formPurchaseAgentContact, setFormPurchaseAgentContact] = useState("")
  const [formPurchaseDetails, setFormPurchaseDetails] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error(t("common.requiredFields"))
      return
    }

    setSaving(true)
    try {
      const created = await addProduct({
        code: formData.code.trim(),
        name: formData.name.trim(),
        category: formData.category,
        basePrice: typeof formData.basePrice === "string" ? parseFloat(formData.basePrice) || 0 : formData.basePrice,
        description: {
          ro: formData.descriptionRo,
          hu: formData.descriptionHu,
          de: formData.descriptionDe,
          en: formData.descriptionEn,
        },
        notes: formData.notes,
        assemblyIds: [],
        partIds: [],
        assemblySteps: [],
        productionSteps: [],
        unit: "buc",
        requiresPurchase: formRequiresPurchase,
        purchaseSupplier: formPurchaseSupplier,
        purchasePrice: formPurchasePrice,
        purchaseCurrency: formPurchaseCurrency,
        purchaseVatIncluded: formPurchaseVatIncluded,
        purchaseVatRate: formPurchaseVatRate,
        purchaseAgentContact: formPurchaseAgentContact,
        purchaseDetails: formPurchaseDetails,
      } as unknown as import("@/lib/types").Product)
      toast.success(t("common.savedSuccessfully"))
      router.push(`/products/${created.id}/edit`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("common.errorOccurred"))
    } finally {
      setSaving(false)
    }
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
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    placeholder="0.00"
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

          {/* Achiziție */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("products.purchase.tab")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center gap-2 flex-1">
                    <Checkbox
                      id="requiresPurchase"
                      checked={formRequiresPurchase}
                      onCheckedChange={(v) => setFormRequiresPurchase(!!v)}
                    />
                    <Label htmlFor="requiresPurchase" className="cursor-pointer font-medium">
                      {t("products.purchase.requiresPurchase")}
                    </Label>
                  </div>
                  {formRequiresPurchase && (
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                      {t("products.purchase.badge")}
                    </Badge>
                  )}
                </div>
              </div>
              {formRequiresPurchase && (
                <>
                  <div className="space-y-2">
                    <Label>{t("products.purchase.supplier")}</Label>
                    <Input
                      placeholder="Furnizor SRL..."
                      value={formPurchaseSupplier}
                      onChange={(e) => setFormPurchaseSupplier(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("products.purchase.price")}</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formPurchasePrice ?? ""}
                        onChange={(e) => setFormPurchasePrice(e.target.value === "" ? null : parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Monedă</Label>
                      <Select value={formPurchaseCurrency} onValueChange={setFormPurchaseCurrency}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="RON">RON</SelectItem>
                          <SelectItem value="HUF">HUF</SelectItem>
                          <SelectItem value="IRR">IRR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="vatIncluded"
                      checked={formPurchaseVatIncluded}
                      onCheckedChange={(v) => setFormPurchaseVatIncluded(!!v)}
                    />
                    <Label htmlFor="vatIncluded" className="cursor-pointer">Preț cu TVA inclus</Label>
                    {formPurchaseVatIncluded && (
                      <Select value={String(formPurchaseVatRate)} onValueChange={(v) => setFormPurchaseVatRate(Number(v))}>
                        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[5, 9, 11, 19, 21].map((r) => (
                            <SelectItem key={r} value={String(r)}>{r}%</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>{t("products.purchase.agentContact")}</Label>
                    <Input
                      placeholder="Nume agent, telefon..."
                      value={formPurchaseAgentContact}
                      onChange={(e) => setFormPurchaseAgentContact(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("products.purchase.details")}</Label>
                    <Textarea
                      placeholder="Detalii livrare, termene, condiții..."
                      value={formPurchaseDetails}
                      onChange={(e) => setFormPurchaseDetails(e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Files info */}
          <div className="flex items-center gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            <Info className="h-4 w-4 shrink-0" />
            Fișierele (DXF, PDF, JPG, PNG) pot fi încărcate imediat după salvare — vei fi redirecționat automat pe pagina de editare.
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/products")}>
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
