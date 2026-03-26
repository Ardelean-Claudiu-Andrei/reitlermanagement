"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
import type { Project, ProjectItem, ProjectStatus } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import { toast } from "sonner"

export default function NewProjectPage() {
  const router = useRouter()
  const { companies, products, addProject, projects } = useAppData()
  const { t } = useLocale()

  const [formData, setFormData] = useState({
    name: "",
    companyId: "" as string | null,
    startDate: new Date().toISOString().split("T")[0],
    deadline: "",
  })

  const [items, setItems] = useState<ProjectItem[]>([])

  // Default deadline 30 days from now
  useState(() => {
    const deadlineDate = new Date()
    deadlineDate.setDate(deadlineDate.getDate() + 30)
    setFormData((prev) => ({ ...prev, deadline: deadlineDate.toISOString().split("T")[0] }))
  })

  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1, unitPrice: 0, notes: "", fromInventory: false }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof ProjectItem, value: string | number | boolean) => {
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

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Project name is required")
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
    const projectCount = projects.length + 1

    const newProject: Project = {
      id: `proj${Date.now()}`,
      code: `PRJ-2026-${String(projectCount).padStart(3, "0")}`,
      name: formData.name,
      companyId: formData.companyId || null,
      quoteId: null,
      status: "draft",
      startDate: formData.startDate,
      deadline: formData.deadline,
      finishDate: null,
      warrantyExpiration: null,
      items,
      checklist: [],
      issues: [],
      activity: [
        {
          id: `a${Date.now()}`,
          action: "Project created",
          user: "Claudiu Ardelean",
          timestamp: new Date().toLocaleString(),
        },
      ],
      createdAt: today,
      updatedAt: today,
    }

    addProject(newProject)
    toast.success(t("savedSuccessfully"))
    router.push(`/projects/${newProject.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/projects")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("newProject")}</h1>
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
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("projectName")} *</Label>
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t("startDate")}</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">{t("deadline")}</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
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
                <TableHead className="w-[200px]">{t("productName")}</TableHead>
                <TableHead className="w-[100px]">{t("quantity")}</TableHead>
                <TableHead className="w-[120px]">{t("price")} (EUR)</TableHead>
                <TableHead className="w-[120px]">{t("total")} (EUR)</TableHead>
                <TableHead className="w-[100px]">{t("inventory")}</TableHead>
                <TableHead>{t("notes")}</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
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
                      <Checkbox
                        checked={item.fromInventory}
                        onCheckedChange={(checked) => updateItem(idx, "fromInventory", checked === true)}
                      />
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
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={3} className="text-right font-bold">{t("total")}:</TableCell>
                  <TableCell className="font-bold text-lg">{total.toFixed(2)} EUR</TableCell>
                  <TableCell colSpan={3} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
