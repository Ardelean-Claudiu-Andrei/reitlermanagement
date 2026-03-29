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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Puzzle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import type { Part } from "@/lib/types"

export default function PartsPage() {
  const { parts, addPart, updatePart, deletePart } = useAppData()
  const { t } = useLocale()
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPart, setEditingPart] = useState<Part | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState("")
  const [formCategory, setFormCategory] = useState("")
  const [formUnit, setFormUnit] = useState("buc")
  const [formBasePrice, setFormBasePrice] = useState(0)
  const [formMinimumStock, setFormMinimumStock] = useState(0)
  const [formQuantity, setFormQuantity] = useState(0)
  const [formLocation, setFormLocation] = useState("")
  const [formNotes, setFormNotes] = useState("")

  const safeParts = parts ?? []

  const filteredParts = safeParts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.location || "").toLowerCase().includes(search.toLowerCase())
  )

  const lowStockCount = safeParts.filter((p) => p.quantity <= p.minimumStock && p.minimumStock > 0).length

  function openNewDialog() {
    setEditingPart(null)
    setFormName("")
    setFormCategory("")
    setFormUnit("buc")
    setFormBasePrice(0)
    setFormMinimumStock(0)
    setFormQuantity(0)
    setFormLocation("")
    setFormNotes("")
    setDialogOpen(true)
  }

  function openEditDialog(part: Part) {
    setEditingPart(part)
    setFormName(part.name)
    setFormCategory(part.category || "")
    setFormUnit(part.unit || "buc")
    setFormBasePrice(part.basePrice || 0)
    setFormMinimumStock(part.minimumStock || 0)
    setFormQuantity(part.quantity || 0)
    setFormLocation(part.location || "")
    setFormNotes(part.notes || "")
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!formName.trim()) {
      toast.error(t("parts.nameRequired"))
      return
    }
    const now = new Date().toISOString()
    const part: Part = {
      id: editingPart?.id ?? `part-${Date.now()}`,
      name: formName.trim(),
      description: editingPart?.description ?? { ro: "", hu: "", de: "", en: "" },
      category: formCategory,
      unit: formUnit,
      basePrice: formBasePrice,
      minimumStock: formMinimumStock,
      quantity: formQuantity,
      location: formLocation,
      notes: formNotes,
      fileName: editingPart?.fileName ?? "",
      fileLocation: editingPart?.fileLocation ?? "",
      createdAt: editingPart?.createdAt ?? now,
      updatedAt: now,
    }

    try {
      if (editingPart) {
        await updatePart(part)
        toast.success(t("common.savedSuccessfully"))
      } else {
        await addPart(part)
        toast.success(t("common.savedSuccessfully"))
      }
      setDialogOpen(false)
    } catch {
      toast.error(t("common.errorOccurred"))
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
      <div className="grid gap-4 md:grid-cols-3">
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
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("common.category")}</TableHead>
                <TableHead>{t("parts.unit")}</TableHead>
                <TableHead className="text-right">{t("common.quantity")}</TableHead>
                <TableHead className="text-right">{t("parts.minimumStock")}</TableHead>
                <TableHead>{t("parts.location")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="w-[60px]">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts.map((part) => {
                const isLow = part.minimumStock > 0 && part.quantity <= part.minimumStock
                return (
                  <TableRow key={part.id} className={isLow ? "bg-amber-50/50 dark:bg-amber-950/20" : ""}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{part.name}</p>
                        {part.notes && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{part.notes}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{part.category || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{part.unit}</TableCell>
                    <TableCell className="text-right font-mono">{part.quantity ?? 0}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">{part.minimumStock ?? 0}</TableCell>
                    <TableCell className="text-muted-foreground">{part.location || "—"}</TableCell>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPart ? t("common.edit") : t("parts.addPart")}
            </DialogTitle>
            <DialogDescription>
              {t("parts.formDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="partName">
                {t("common.name")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="partName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t("parts.namePlaceholder")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.category")}</Label>
                <Input
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder={t("parts.categoryPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("parts.unit")}</Label>
                <Input
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  placeholder="buc"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t("common.quantity")}</Label>
                <Input
                  type="number"
                  min="0"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("parts.minimumStock")}</Label>
                <Input
                  type="number"
                  min="0"
                  value={formMinimumStock}
                  onChange={(e) => setFormMinimumStock(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("parts.basePrice")}</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formBasePrice}
                  onChange={(e) => setFormBasePrice(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("parts.location")}</Label>
              <Input
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder={t("parts.locationPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("common.notes")}</Label>
              <Textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave}>{t("common.save")}</Button>
          </DialogFooter>
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
