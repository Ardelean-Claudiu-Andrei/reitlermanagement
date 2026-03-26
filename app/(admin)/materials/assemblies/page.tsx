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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Boxes, Copy } from "lucide-react"
import { toast } from "sonner"
import type { Assembly, AssemblyPart } from "@/lib/types"

export default function AssembliesPage() {
  const router = useRouter()
  const { assemblies, parts, addAssembly, updateAssembly, deleteAssembly } = useAppData()
  const { t, locale } = useLocale()
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAssembly, setEditingAssembly] = useState<Assembly | null>(null)
  const [viewAssembly, setViewAssembly] = useState<Assembly | null>(null)

  // Form state
  const [formCode, setFormCode] = useState("")
  const [formName, setFormName] = useState("")
  const [formNotes, setFormNotes] = useState("")
  const [formParts, setFormParts] = useState<AssemblyPart[]>([])

  const safeAssemblies = assemblies ?? []
  const safeParts = parts ?? []

  const filteredAssemblies = safeAssemblies.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.code.toLowerCase().includes(search.toLowerCase())
  )

  function openNewDialog() {
    setEditingAssembly(null)
    setFormCode(`ASM-${String(safeAssemblies.length + 1).padStart(3, "0")}`)
    setFormName("")
    setFormNotes("")
    setFormParts([])
    setDialogOpen(true)
  }

  function openEditDialog(assembly: Assembly) {
    setEditingAssembly(assembly)
    setFormCode(assembly.code)
    setFormName(assembly.name)
    setFormNotes(assembly.notes)
    setFormParts([...assembly.parts])
    setDialogOpen(true)
  }

  function handleSave() {
    const now = new Date().toISOString().split("T")[0]
    const assembly: Assembly = {
      id: editingAssembly?.id ?? `asm${Date.now()}`,
      code: formCode,
      name: formName,
      description: { en: formName, ro: formName, hu: formName, de: formName },
      parts: formParts,
      notes: formNotes,
      createdAt: editingAssembly?.createdAt ?? now,
      updatedAt: now,
    }

    if (editingAssembly) {
      updateAssembly(assembly)
      toast.success(t("common.savedSuccessfully"))
    } else {
      addAssembly(assembly)
      toast.success(t("common.savedSuccessfully"))
    }
    setDialogOpen(false)
  }

  function handleDelete(id: string) {
    deleteAssembly(id)
    toast.success(t("common.deleted"))
  }

  function handleDuplicate(assembly: Assembly) {
    const now = new Date().toISOString().split("T")[0]
    const newAssembly: Assembly = {
      ...assembly,
      id: `asm${Date.now()}`,
      code: `${assembly.code}-COPY`,
      name: `${assembly.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
    }
    addAssembly(newAssembly)
    toast.success(t("common.duplicated"))
  }

  function addPartToForm() {
    if (safeParts.length > 0) {
      setFormParts([...formParts, { partId: safeParts[0].id, quantity: 1 }])
    }
  }

  function updateFormPart(index: number, field: "partId" | "quantity", value: string | number) {
    const updated = [...formParts]
    if (field === "partId") {
      updated[index].partId = value as string
    } else {
      updated[index].quantity = value as number
    }
    setFormParts(updated)
  }

  function removeFormPart(index: number) {
    setFormParts(formParts.filter((_, i) => i !== index))
  }

  function getPartName(partId: string): string {
    return safeParts.find((p) => p.id === partId)?.name ?? t("common.unknown")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{t("assemblies")}</h2>
          <p className="text-sm text-muted-foreground">{t("materials.assembliesSubtitle")}</p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t("materials.addAssembly")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("materials.totalAssemblies")}</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{safeAssemblies.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("materials.totalParts")}</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{safeParts.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("assemblies")}</CardTitle>
              <CardDescription>{filteredAssemblies.length} {t("common.items")}</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("materials.searchAssemblies")}
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
                <TableHead>{t("common.code")}</TableHead>
                <TableHead>{t("common.name")}</TableHead>
                <TableHead className="text-center">{t("materials.partsCount")}</TableHead>
                <TableHead>{t("common.notes")}</TableHead>
                <TableHead className="w-[60px]">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssemblies.map((assembly) => (
                <TableRow key={assembly.id}>
                  <TableCell className="font-mono text-xs">{assembly.code}</TableCell>
                  <TableCell className="font-medium">{assembly.name}</TableCell>
                  <TableCell className="text-center">{assembly.parts?.length ?? 0}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {assembly.notes || "--"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewAssembly(assembly)}>
                          <Eye className="mr-2 h-4 w-4" />
                          {t("common.view")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(assembly)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t("common.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(assembly)}>
                          <Copy className="mr-2 h-4 w-4" />
                          {t("common.duplicate")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(assembly.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("common.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAssemblies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    {t("materials.noAssembliesFound")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAssembly ? t("common.edit") : t("materials.addAssembly")}
            </DialogTitle>
            <DialogDescription>
              {t("materials.assemblyFormDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.code")}</Label>
                <Input value={formCode} onChange={(e) => setFormCode(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("common.name")}</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("common.notes")}</Label>
              <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t("materials.parts")}</Label>
                <Button type="button" variant="outline" size="sm" onClick={addPartToForm}>
                  <Plus className="mr-1 h-3 w-3" />
                  {t("common.add")}
                </Button>
              </div>
              {formParts.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("materials.noPartsAdded")}</p>
              ) : (
                <div className="space-y-2">
                  {formParts.map((fp, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Select
                        value={fp.partId}
                        onValueChange={(v) => updateFormPart(idx, "partId", v)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {safeParts.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        value={fp.quantity}
                        onChange={(e) => updateFormPart(idx, "quantity", parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFormPart(idx)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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

      {/* View Dialog */}
      <Dialog open={!!viewAssembly} onOpenChange={() => setViewAssembly(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewAssembly?.name}</DialogTitle>
            <DialogDescription>{viewAssembly?.code}</DialogDescription>
          </DialogHeader>
          {viewAssembly && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">{t("common.notes")}</Label>
                <p className="text-sm">{viewAssembly.notes || "--"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("materials.parts")}</Label>
                <div className="mt-2 rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("materials.part")}</TableHead>
                        <TableHead className="text-right">{t("common.quantity")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewAssembly.parts.map((fp, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{getPartName(fp.partId)}</TableCell>
                          <TableCell className="text-right font-mono">{fp.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
