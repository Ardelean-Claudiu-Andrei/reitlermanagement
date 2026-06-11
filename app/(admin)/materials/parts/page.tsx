"use client"

import { useState } from "react"
import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Puzzle, AlertTriangle, X, Zap } from "lucide-react"
import { toast } from "sonner"
import type { Part, AssemblyStep } from "@/lib/types"
import { EntityFileUploads } from "@/components/entity-file-uploads"

const STEP_TYPES = ["laser-cutting", "plasma-cutting", "cnc", "welding", "assembly"] as const

function newStepId() { return `step-${Date.now()}-${Math.random().toString(36).slice(2)}` }

const EMPTY_PART: Omit<Part, "id" | "createdAt" | "updatedAt"> = {
  code: "",
  name: "",
  description: { ro: "", hu: "", de: "", en: "" },
  category: "",
  unit: "buc",
  basePrice: 0,
  minimumStock: 0,
  quantity: 0,
  requiredQuantity: 1,
  location: "",
  physicalLocation: "",
  drawingLocation: "",
  requiresLaserCutting: false,
  weldingDrawingLocation: "",
  bendingDrawingLocation: "",
  productionSteps: [],
  notes: "",
  fileName: "",
  fileLocation: "",
}

export default function PartsPage() {
  const { parts, addPart, updatePart, deletePart } = useAppData()
  const { t } = useLocale()
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPart, setEditingPart] = useState<Part | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [viewPart, setViewPart] = useState<Part | null>(null)

  // Form state
  const [form, setForm] = useState({ ...EMPTY_PART })
  const [formSteps, setFormSteps] = useState<AssemblyStep[]>([])

  const safeParts = parts ?? []
  const filteredParts = safeParts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.code || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.location || "").toLowerCase().includes(search.toLowerCase())
  )
  const lowStockCount = safeParts.filter((p) => p.minimumStock > 0 && p.quantity <= p.minimumStock).length
  const laserCount = safeParts.filter((p) => p.requiresLaserCutting).length

  function setField<K extends keyof typeof EMPTY_PART>(key: K, value: (typeof EMPTY_PART)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function openNewDialog() {
    setEditingPart(null)
    setForm({ ...EMPTY_PART })
    setFormSteps([])
    setDialogOpen(true)
  }

  function openEditDialog(part: Part) {
    setEditingPart(part)
    setForm({
      code: part.code || "",
      name: part.name,
      description: part.description,
      category: part.category || "",
      unit: part.unit || "buc",
      basePrice: part.basePrice || 0,
      minimumStock: part.minimumStock || 0,
      quantity: part.quantity || 0,
      requiredQuantity: part.requiredQuantity || 1,
      location: part.location || "",
      physicalLocation: part.physicalLocation || "",
      drawingLocation: part.drawingLocation || "",
      requiresLaserCutting: part.requiresLaserCutting || false,
      weldingDrawingLocation: part.weldingDrawingLocation || "",
      bendingDrawingLocation: part.bendingDrawingLocation || "",
      productionSteps: part.productionSteps || [],
      notes: part.notes || "",
      fileName: part.fileName || "",
      fileLocation: part.fileLocation || "",
    })
    setFormSteps([...(part.productionSteps || [])])
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error(t("parts.nameRequired"))
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, productionSteps: formSteps }
      if (editingPart) {
        await updatePart({ ...editingPart, ...payload })
        toast.success(t("common.savedSuccessfully"))
        setDialogOpen(false)
      } else {
        await addPart(payload as Part)
        toast.success("Piesă creată cu succes.")
        setDialogOpen(false)
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("common.errorOccurred"))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deletePart(deleteTarget)
      toast.success(t("common.deleted"))
    } catch {
      toast.error(t("common.errorOccurred"))
    } finally {
      setDeleteTarget(null)
    }
  }

  // ─── Production steps ─────────────────────────────────────────────────────

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
    setFormSteps((prev) => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 })))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{t("parts.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("parts.subtitle")}</p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t("parts.addPart")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("parts.totalParts")}</CardTitle>
            <Puzzle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{safeParts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("parts.totalQuantity")}</CardTitle>
            <Puzzle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {safeParts.reduce((sum, p) => sum + (p.quantity || 0), 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("parts.lowStock")}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{lowStockCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Debitare laser</CardTitle>
            <Zap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{laserCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("parts.title")}</CardTitle>
              <CardDescription>{filteredParts.length} {t("common.items")}</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("parts.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cod</TableHead>
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("common.category")}</TableHead>
                <TableHead className="text-right">{t("common.quantity")}</TableHead>
                <TableHead>Locație</TableHead>
                <TableHead className="text-center">Laser</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="w-[60px]">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts.map((part) => {
                const isLow = part.minimumStock > 0 && part.quantity <= part.minimumStock
                return (
                  <TableRow key={part.id} className={isLow ? "bg-amber-50/50 dark:bg-amber-950/20" : ""}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{part.code || "—"}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{part.name}</p>
                        {part.notes && (
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">{part.notes}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{part.category || "—"}</TableCell>
                    <TableCell className="text-right font-mono">{part.quantity ?? 0}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{part.physicalLocation || part.location || "—"}</TableCell>
                    <TableCell className="text-center">
                      {part.requiresLaserCutting && (
                        <Zap className="h-4 w-4 text-blue-500 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell>
                      {isLow ? (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          {t("parts.lowStock")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                          {t("parts.inStock")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewPart(part)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t("common.view")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(part)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(part.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredParts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    {t("parts.noParts")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPart ? t("common.edit") : t("parts.addPart")}
            </DialogTitle>
            <DialogDescription>{t("parts.formDesc")}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general">
            <TabsList className="mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="laser">Laser & Desene</TabsTrigger>
              <TabsTrigger value="steps">Pași producție</TabsTrigger>
              <TabsTrigger value="files">Fișiere</TabsTrigger>
            </TabsList>

            {/* General tab */}
            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cod piesă</Label>
                  <Input value={form.code} onChange={(e) => setField("code", e.target.value)} placeholder="ex: PSA-001" />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.name")} *</Label>
                  <Input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder={t("parts.namePlaceholder")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("common.category")}</Label>
                  <Input value={form.category} onChange={(e) => setField("category", e.target.value)} placeholder={t("parts.categoryPlaceholder")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("parts.unit")}</Label>
                  <Input value={form.unit} onChange={(e) => setField("unit", e.target.value)} placeholder="buc" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t("common.quantity")}</Label>
                  <Input type="number" min="0" value={form.quantity} onChange={(e) => setField("quantity", parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Cantitate necesară</Label>
                  <Input type="number" min="1" value={form.requiredQuantity} onChange={(e) => setField("requiredQuantity", parseInt(e.target.value) || 1)} />
                </div>
                <div className="space-y-2">
                  <Label>{t("parts.minimumStock")}</Label>
                  <Input type="number" min="0" value={form.minimumStock} onChange={(e) => setField("minimumStock", parseFloat(e.target.value) || 0)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Locație fizică</Label>
                  <Input value={form.physicalLocation} onChange={(e) => setField("physicalLocation", e.target.value)} placeholder="ex: Depozit B, Raft 2" />
                </div>
                <div className="space-y-2">
                  <Label>{t("parts.basePrice")}</Label>
                  <Input type="number" min="0" step="0.01" value={form.basePrice} onChange={(e) => setField("basePrice", parseFloat(e.target.value) || 0)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("common.notes")}</Label>
                <Textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} rows={2} />
              </div>
            </TabsContent>

            {/* Laser & Drawings tab */}
            <TabsContent value="laser" className="space-y-4">
              <div className="flex items-center gap-3 rounded-md border p-3">
                <Checkbox
                  id="requiresLaser"
                  checked={form.requiresLaserCutting}
                  onCheckedChange={(checked) => setField("requiresLaserCutting", !!checked)}
                />
                <label htmlFor="requiresLaser" className="text-sm font-medium cursor-pointer">
                  Necesită debitare laser
                </label>
                {form.requiresLaserCutting && (
                  <Badge className="ml-auto bg-blue-100 text-blue-800 border-blue-200">
                    <Zap className="mr-1 h-3 w-3" />
                    Laser
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <Label>Locație desen laser</Label>
                <Input
                  value={form.drawingLocation}
                  onChange={(e) => setField("drawingLocation", e.target.value)}
                  placeholder="ex: \\server\desene\laser\PSA-001.dxf"
                />
              </div>
              <div className="space-y-2">
                <Label>Locație desen sudură</Label>
                <Input
                  value={form.weldingDrawingLocation}
                  onChange={(e) => setField("weldingDrawingLocation", e.target.value)}
                  placeholder="ex: \\server\desene\sudura\PSA-001.pdf"
                />
              </div>
              <div className="space-y-2">
                <Label>Locație desen îndoire</Label>
                <Input
                  value={form.bendingDrawingLocation}
                  onChange={(e) => setField("bendingDrawingLocation", e.target.value)}
                  placeholder="ex: \\server\desene\indoire\PSA-001.pdf"
                />
              </div>
            </TabsContent>

            {/* Production steps tab */}
            <TabsContent value="steps" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Pași de producție</Label>
                <Button type="button" variant="outline" size="sm" onClick={addStep}>
                  <Plus className="mr-1 h-3 w-3" />
                  Adaugă pas
                </Button>
              </div>
              {formSteps.length === 0 ? (
                <p className="text-sm text-muted-foreground">Niciun pas adăugat.</p>
              ) : (
                <div className="space-y-3">
                  {formSteps.map((step, idx) => (
                    <div key={step.id} className="rounded-md border p-3 space-y-2">
                      <div className="flex items-center gap-2">
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
                        <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => removeStep(idx)}>
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Files tab */}
            <TabsContent value="files" className="space-y-4">
              <p className="text-sm text-muted-foreground">Fișiere atașate piesei</p>
              <EntityFileUploads
                entityType="part"
                entityId={editingPart?.id}
                disabledMessage="Salvează piesa înainte de a încărca fișiere."
                showDrawingUploads
              />
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Se salvează..." : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewPart} onOpenChange={() => setViewPart(null)}>
        <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewPart?.name}
              {viewPart?.code && (
                <Badge variant="outline" className="text-xs font-mono font-normal">{viewPart.code}</Badge>
              )}
              {viewPart?.requiresLaserCutting && (
                <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                  <Zap className="mr-1 h-3 w-3" />Laser
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>{viewPart?.category || "Piesă"}</DialogDescription>
          </DialogHeader>
          {viewPart && (
            <Tabs defaultValue="info">
              <TabsList className="mb-2">
                <TabsTrigger value="info">Informații</TabsTrigger>
                <TabsTrigger value="steps">
                  Pași {viewPart.productionSteps?.length > 0 && `(${viewPart.productionSteps.length})`}
                </TabsTrigger>
                <TabsTrigger value="files">Fișiere</TabsTrigger>
              </TabsList>

              {/* Info */}
              <TabsContent value="info" className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Cantitate stoc</p>
                    <p className="font-mono">{viewPart.quantity ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Cantitate necesară</p>
                    <p className="font-mono">{viewPart.requiredQuantity ?? 1}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Locație fizică</p>
                    <p style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{viewPart.physicalLocation || viewPart.location || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Locație desen</p>
                    <p style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{viewPart.drawingLocation || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Debitare laser</p>
                    <p>{viewPart.requiresLaserCutting ? "Da" : "Nu"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Categorie</p>
                    <p>{viewPart.category || "—"}</p>
                  </div>
                  {viewPart.weldingDrawingLocation && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-0.5">Locație desen sudură</p>
                      <p style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{viewPart.weldingDrawingLocation}</p>
                    </div>
                  )}
                  {viewPart.bendingDrawingLocation && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-0.5">Locație desen îndoire</p>
                      <p style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{viewPart.bendingDrawingLocation}</p>
                    </div>
                  )}
                </div>
                {viewPart.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Note</p>
                    <p>{viewPart.notes}</p>
                  </div>
                )}
              </TabsContent>

              {/* Steps */}
              <TabsContent value="steps">
                {!viewPart.productionSteps?.length ? (
                  <p className="text-sm text-muted-foreground">Niciun pas de producție.</p>
                ) : (
                  <div className="space-y-2">
                    {viewPart.productionSteps.map((step, idx) => (
                      <div key={step.id} className="rounded-md border px-3 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground w-5 shrink-0">{idx + 1}.</span>
                          <span className="font-medium flex-1">{step.name}</span>
                          <Badge variant="outline" className="text-xs">{step.type}</Badge>
                        </div>
                        {step.description && (
                          <p className="mt-1 ml-7 text-xs text-muted-foreground">{step.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Files */}
              <TabsContent value="files">
                <EntityFileUploads entityType="part" entityId={viewPart.id} readonly />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("parts.deletePart")}</AlertDialogTitle>
            <AlertDialogDescription>{t("parts.deleteConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
