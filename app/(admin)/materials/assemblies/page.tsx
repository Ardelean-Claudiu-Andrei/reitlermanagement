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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Boxes, Copy, ChevronsUpDown, Check, ChevronLeft, ChevronRight } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { toast } from "sonner"
import type { Assembly, AssemblyPart, AssemblyChildEntry, AssemblyStep, AssemblyCompositionType } from "@/lib/types"
import { EntityFileUploads } from "@/components/entity-file-uploads"
import { StepEditor } from "@/components/step-editor"

export default function AssembliesPage() {
  const { assemblies, parts, addAssembly, updateAssembly, deleteAssembly } = useAppData()
  const { t } = useLocale()
  const [search, setSearch] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAssembly, setEditingAssembly] = useState<Assembly | null>(null)
  const [viewAssembly, setViewAssembly] = useState<Assembly | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formCode, setFormCode] = useState("")
  const [formName, setFormName] = useState("")
  const [formNotes, setFormNotes] = useState("")
  const [formParts, setFormParts] = useState<AssemblyPart[]>([])
  const [formCompositionType, setFormCompositionType] = useState<AssemblyCompositionType>("standalone")
  const [formPhysicalLocation, setFormPhysicalLocation] = useState("")
  const [formWeldingDrawingLocation, setFormWeldingDrawingLocation] = useState("")
  const [formTechnicalDrawingLocation, setFormTechnicalDrawingLocation] = useState("")
  const [formCadLocation, setFormCadLocation] = useState("")
  const [formSteps, setFormSteps] = useState<AssemblyStep[]>([])

  const safeAssemblies = assemblies ?? []
  const safeParts = parts ?? []

  const filteredAssemblies = safeAssemblies.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filteredAssemblies.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filteredAssemblies.slice((safePage - 1) * pageSize, safePage * pageSize)

  function openNewDialog() {
    setEditingAssembly(null)
    setFormCode(`ASM-${String(safeAssemblies.length + 1).padStart(3, "0")}`)
    setFormName("")
    setFormNotes("")
    setFormParts([])
    setFormChildAssemblies([])
    setFormCompositionType("standalone")
    setFormPhysicalLocation("")
    setFormWeldingDrawingLocation("")
    setFormTechnicalDrawingLocation("")
    setFormCadLocation("")
    setFormSteps([])
    setDialogOpen(true)
  }

  function openEditDialog(assembly: Assembly) {
    setEditingAssembly(assembly)
    setFormCode(assembly.code)
    setFormName(assembly.name)
    setFormNotes(assembly.notes)
    setFormParts([...assembly.parts])
    setFormChildAssemblies([...(assembly.childAssemblies || [])])
    setFormCompositionType(assembly.compositionType || "standalone")
    setFormPhysicalLocation(assembly.physicalLocation || "")
    setFormWeldingDrawingLocation(assembly.weldingDrawingLocation || "")
    setFormTechnicalDrawingLocation(assembly.technicalDrawingLocation || "")
    setFormCadLocation(assembly.cadLocation || "")
    setFormSteps([...(assembly.productionSteps || [])])
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!formCode.trim() || !formName.trim()) {
      toast.error("Codul și numele sunt obligatorii")
      return
    }
    setSaving(true)
    try {
      const payload: Omit<Assembly, "id" | "createdAt" | "updatedAt"> = {
        code: formCode.trim(),
        name: formName.trim(),
        description: editingAssembly?.description ?? { ro: "", hu: "", de: "", en: "" },
        parts: formParts,
        childAssemblies: formChildAssemblies,
        compositionType: formCompositionType,
        physicalLocation: formPhysicalLocation,
        weldingDrawingLocation: formWeldingDrawingLocation,
        technicalDrawingLocation: formTechnicalDrawingLocation,
        cadLocation: formCadLocation,
        productionSteps: formSteps,
        notes: formNotes,
      }
      if (editingAssembly) {
        await updateAssembly({ ...editingAssembly, ...payload })
        toast.success(t("common.savedSuccessfully"))
        setDialogOpen(false)
      } else {
        await addAssembly(payload as Assembly)
        toast.success("Ansamblu creat cu succes.")
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
      await deleteAssembly(deleteTarget)
      toast.success(t("common.deleted"))
    } catch {
      toast.error(t("common.errorOccurred"))
    } finally {
      setDeleteTarget(null)
    }
  }

  async function handleDuplicate(assembly: Assembly) {
    try {
      await addAssembly({
        ...assembly,
        code: `${assembly.code}-COPY`,
        name: `${assembly.name} (Copy)`,
      } as Assembly)
      toast.success(t("common.duplicated"))
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("common.errorOccurred"))
    }
  }

  const [openPartCombobox, setOpenPartCombobox] = useState<number | null>(null)
  const [openChildAssemblyCombobox, setOpenChildAssemblyCombobox] = useState<number | null>(null)
  const [formChildAssemblies, setFormChildAssemblies] = useState<AssemblyChildEntry[]>([])

  // ─── Parts within assembly ────────────────────────────────────────────────

  function addPartToForm() {
    setFormParts([...formParts, { partId: "", quantity: 1 }])
  }

  function updateFormPart(index: number, field: "partId" | "quantity", value: string | number) {
    const updated = [...formParts]
    if (field === "partId") updated[index].partId = value as string
    else updated[index].quantity = value as number
    setFormParts(updated)
  }

  function removeFormPart(index: number) {
    setFormParts(formParts.filter((_, i) => i !== index))
  }

  // ─── Child assemblies ─────────────────────────────────────────────────────

  function addChildAssemblyToForm() {
    setFormChildAssemblies([...formChildAssemblies, { assemblyId: "", quantity: 1 }])
  }

  function updateFormChildAssembly(index: number, field: "assemblyId" | "quantity", value: string | number) {
    const updated = [...formChildAssemblies]
    if (field === "assemblyId") updated[index].assemblyId = value as string
    else updated[index].quantity = value as number
    setFormChildAssemblies(updated)
  }

  function removeFormChildAssembly(index: number) {
    setFormChildAssemblies(formChildAssemblies.filter((_, i) => i !== index))
  }

  function getAssemblyName(assemblyId: string) {
    return safeAssemblies.find((a) => a.id === assemblyId)?.name ?? t("common.unknown")
  }

  function getPartName(partId: string) {
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
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
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
                <TableHead>Tip</TableHead>
                <TableHead>Locație fizică</TableHead>
                <TableHead className="text-center">{t("materials.partsCount")}</TableHead>
                <TableHead className="text-center">Pași</TableHead>
                <TableHead className="w-[60px]">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((assembly) => (
                <TableRow key={assembly.id}>
                  <TableCell className="font-mono text-xs">{assembly.code}</TableCell>
                  <TableCell className="font-medium">{assembly.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {assembly.compositionType === "from_parts"
                        ? "Din piese"
                        : assembly.compositionType === "from_assemblies"
                        ? "Din ansamble"
                        : "Independent"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{assembly.physicalLocation || "—"}</TableCell>
                  <TableCell className="text-center">{assembly.parts?.length ?? 0}</TableCell>
                  <TableCell className="text-center">{assembly.productionSteps?.length ?? 0}</TableCell>
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
                          onClick={() => setDeleteTarget(assembly.id)}
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
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    {t("materials.noAssembliesFound")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {filteredAssemblies.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t mt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filteredAssemblies.length)} of {filteredAssemblies.length}
                </span>
                <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1) }}>
                  <SelectTrigger className="w-[80px] h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span>per page</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .reduce<(number | "…")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…")
                    acc.push(p)
                    return acc
                  }, [])
                  .map((item, i) =>
                    item === "…" ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
                    ) : (
                      <Button
                        key={item}
                        variant={safePage === item ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8 text-sm"
                        onClick={() => setCurrentPage(item as number)}
                      >
                        {item}
                      </Button>
                    )
                  )}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={safePage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[1100px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAssembly ? t("common.edit") : t("materials.addAssembly")}
            </DialogTitle>
            <DialogDescription>{t("materials.assemblyFormDesc")}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general">
            <TabsList className="mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="drawings">Desene</TabsTrigger>
              <TabsTrigger value="parts">Piese</TabsTrigger>
              <TabsTrigger value="steps">Pași producție</TabsTrigger>
              <TabsTrigger value="files">Fișiere</TabsTrigger>
            </TabsList>

            {/* General tab */}
            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("common.code")} *</Label>
                  <Input value={formCode} onChange={(e) => setFormCode(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.name")} *</Label>
                  <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tip compoziție</Label>
                  <Select value={formCompositionType} onValueChange={(v) => setFormCompositionType(v as AssemblyCompositionType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standalone">Independent (fără piese)</SelectItem>
                      <SelectItem value="from_parts">Din piese</SelectItem>
                      <SelectItem value="from_assemblies">Din ansamble</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Locație fizică</Label>
                  <Input
                    value={formPhysicalLocation}
                    onChange={(e) => setFormPhysicalLocation(e.target.value)}
                    placeholder="ex: Depozit A, Raft 3"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("common.notes")}</Label>
                <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={3} />
              </div>
            </TabsContent>

            {/* Drawings tab */}
            <TabsContent value="drawings" className="space-y-4">
              <div className="space-y-2">
                <Label>Locație desen sudură</Label>
                <Input
                  value={formWeldingDrawingLocation}
                  onChange={(e) => setFormWeldingDrawingLocation(e.target.value)}
                  placeholder="ex: \\server\desene\sudura\ASM-001.pdf"
                />
              </div>
              <div className="space-y-2">
                <Label>Locație desen tehnic</Label>
                <Input
                  value={formTechnicalDrawingLocation}
                  onChange={(e) => setFormTechnicalDrawingLocation(e.target.value)}
                  placeholder="ex: \\server\desene\tehnice\ASM-001.pdf"
                />
              </div>
              <div className="space-y-2">
                <Label>Locație CAD</Label>
                <Input
                  value={formCadLocation}
                  onChange={(e) => setFormCadLocation(e.target.value)}
                  placeholder="ex: \\server\cad\ASM-001.step"
                />
              </div>
            </TabsContent>

            {/* Parts tab */}
            <TabsContent value="parts" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Piese componente</Label>
                <Button type="button" variant="outline" size="sm" onClick={addPartToForm} disabled={safeParts.length === 0}>
                  <Plus className="mr-1 h-3 w-3" />
                  Adaugă piesă
                </Button>
              </div>
              {formParts.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("materials.noPartsAdded")}</p>
              ) : (
                <div className="space-y-2">
                  {formParts.map((fp, idx) => {
                    const selectedPart = safeParts.find((p) => p.id === fp.partId)
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <Popover open={openPartCombobox === idx} onOpenChange={(open) => setOpenPartCombobox(open ? idx : null)}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              className="flex-1 justify-between font-normal"
                            >
                              {selectedPart
                                ? `${selectedPart.name}${selectedPart.code ? ` — ${selectedPart.code}` : ""}`
                                : "Caută piesă după nume sau cod..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[380px] p-0">
                            <Command>
                              <CommandInput placeholder="Caută piesă după nume sau cod..." />
                              <CommandList>
                                <CommandEmpty>Nicio piesă găsită.</CommandEmpty>
                                <CommandGroup>
                                  {safeParts.map((p) => (
                                    <CommandItem
                                      key={p.id}
                                      value={`${p.name} ${p.code ?? ""}`}
                                      onSelect={() => {
                                        updateFormPart(idx, "partId", p.id)
                                        setOpenPartCombobox(null)
                                      }}
                                    >
                                      <Check className={`mr-2 h-4 w-4 ${fp.partId === p.id ? "opacity-100" : "opacity-0"}`} />
                                      <span className="font-medium">{p.name}</span>
                                      {p.code && <span className="ml-2 text-xs text-muted-foreground font-mono">{p.code}</span>}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <Input
                          type="number"
                          min="1"
                          value={fp.quantity}
                          onChange={(e) => updateFormPart(idx, "quantity", parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeFormPart(idx)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between mb-2">
                  <Label>Sub-ansamble</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addChildAssemblyToForm}
                    disabled={safeAssemblies.filter((a) => a.id !== editingAssembly?.id).length === 0}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Adaugă sub-ansamblu
                  </Button>
                </div>
                {formChildAssemblies.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Niciun sub-ansamblu adăugat.</p>
                ) : (
                  <div className="space-y-2">
                    {formChildAssemblies.map((ca, idx) => {
                      const selectedChild = safeAssemblies.find((a) => a.id === ca.assemblyId)
                      const availableAssemblies = safeAssemblies.filter((a) => a.id !== editingAssembly?.id)
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <Popover
                            open={openChildAssemblyCombobox === idx}
                            onOpenChange={(open) => setOpenChildAssemblyCombobox(open ? idx : null)}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                role="combobox"
                                className="flex-1 justify-between font-normal"
                              >
                                {selectedChild
                                  ? `${selectedChild.name}${selectedChild.code ? ` — ${selectedChild.code}` : ""}`
                                  : "Caută ansamblu după nume sau cod..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[380px] p-0">
                              <Command>
                                <CommandInput placeholder="Caută ansamblu după nume sau cod..." />
                                <CommandList>
                                  <CommandEmpty>Niciun ansamblu găsit.</CommandEmpty>
                                  <CommandGroup>
                                    {availableAssemblies.map((a) => (
                                      <CommandItem
                                        key={a.id}
                                        value={`${a.name} ${a.code ?? ""}`}
                                        onSelect={() => {
                                          updateFormChildAssembly(idx, "assemblyId", a.id)
                                          setOpenChildAssemblyCombobox(null)
                                        }}
                                      >
                                        <Check className={`mr-2 h-4 w-4 ${ca.assemblyId === a.id ? "opacity-100" : "opacity-0"}`} />
                                        <span className="font-medium">{a.name}</span>
                                        {a.code && <span className="ml-2 text-xs text-muted-foreground font-mono">{a.code}</span>}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <Input
                            type="number"
                            min="1"
                            value={ca.quantity}
                            onChange={(e) => updateFormChildAssembly(idx, "quantity", parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeFormChildAssembly(idx)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Production steps tab */}
            <TabsContent value="steps" className="space-y-4">
              <StepEditor steps={formSteps} onChange={setFormSteps} />
            </TabsContent>

            {/* Files tab */}
            <TabsContent value="files" className="space-y-4">
              <p className="text-sm text-muted-foreground">Fișiere atașate ansamblului (DXF, PDF, imagini)</p>
              <EntityFileUploads
                entityType="assembly"
                entityId={editingAssembly?.id}
                disabledMessage="Salvează ansamblul înainte de a încărca fișiere."
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
      <Dialog open={!!viewAssembly} onOpenChange={() => setViewAssembly(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewAssembly?.name}
              <Badge variant="outline" className="text-xs font-mono font-normal">{viewAssembly?.code}</Badge>
            </DialogTitle>
            <DialogDescription>
              {viewAssembly?.compositionType === "from_parts"
                ? "Ansamblu din piese"
                : viewAssembly?.compositionType === "from_assemblies"
                ? "Ansamblu din sub-ansamble"
                : "Ansamblu independent"}
            </DialogDescription>
          </DialogHeader>
          {viewAssembly && (
            <Tabs defaultValue="info">
              <TabsList className="mb-2">
                <TabsTrigger value="info">Informații</TabsTrigger>
                <TabsTrigger value="parts">
                  Piese {viewAssembly.parts?.length > 0 && `(${viewAssembly.parts.length})`}
                </TabsTrigger>
                <TabsTrigger value="steps">
                  Pași {viewAssembly.productionSteps?.length > 0 && `(${viewAssembly.productionSteps.length})`}
                </TabsTrigger>
                <TabsTrigger value="files">Fișiere</TabsTrigger>
              </TabsList>

              {/* Info */}
              <TabsContent value="info" className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Tip compoziție</p>
                    <p>
                      {viewAssembly.compositionType === "from_parts"
                        ? "Din piese"
                        : viewAssembly.compositionType === "from_assemblies"
                        ? "Din ansamble"
                        : "Independent"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Locație fizică</p>
                    <p>{viewAssembly.physicalLocation || "—"}</p>
                  </div>
                  {viewAssembly.weldingDrawingLocation && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-0.5">Locație desen sudură</p>
                      <p style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{viewAssembly.weldingDrawingLocation}</p>
                    </div>
                  )}
                  {viewAssembly.technicalDrawingLocation && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-0.5">Locație desen tehnic</p>
                      <p style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{viewAssembly.technicalDrawingLocation}</p>
                    </div>
                  )}
                  {viewAssembly.cadLocation && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-0.5">Locație CAD</p>
                      <p style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{viewAssembly.cadLocation}</p>
                    </div>
                  )}
                </div>
                {viewAssembly.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Note</p>
                    <p className="text-sm">{viewAssembly.notes}</p>
                  </div>
                )}
              </TabsContent>

              {/* Parts */}
              <TabsContent value="parts" className="space-y-4">
                {viewAssembly.parts?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nicio piesă adăugată.</p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Piesă</TableHead>
                          <TableHead>Laser</TableHead>
                          <TableHead className="text-right">Cantitate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewAssembly.parts.map((fp, idx) => {
                          const part = safeParts.find((p) => p.id === fp.partId)
                          return (
                            <TableRow key={idx}>
                              <TableCell>
                                <p className="font-medium">{part?.name ?? fp.partId}</p>
                                {part?.code && <p className="text-xs text-muted-foreground font-mono">{part.code}</p>}
                              </TableCell>
                              <TableCell>
                                {part?.requiresLaserCutting && (
                                  <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">Laser</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-mono">{fp.quantity}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {(viewAssembly.childAssemblies?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Sub-ansamble</p>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ansamblu</TableHead>
                            <TableHead>Cod</TableHead>
                            <TableHead className="text-right">Cantitate</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {viewAssembly.childAssemblies.map((ca, idx) => {
                            const child = safeAssemblies.find((a) => a.id === ca.assemblyId)
                            return (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{child?.name ?? ca.assemblyId}</TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">{child?.code ?? "—"}</TableCell>
                                <TableCell className="text-right font-mono">{ca.quantity}</TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Steps */}
              <TabsContent value="steps">
                {viewAssembly.productionSteps?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Niciun pas de producție.</p>
                ) : (
                  <div className="space-y-2">
                    {viewAssembly.productionSteps.map((step, idx) => (
                      <div key={step.id} className="rounded-md border px-3 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground w-5 shrink-0">{idx + 1}.</span>
                          <span className="font-medium flex-1">{step.name}</span>
                          {step.type && <Badge variant="outline" className="text-xs">{step.type}</Badge>}
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
                <EntityFileUploads entityType="assembly" entityId={viewAssembly.id} readonly />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge ansamblu</AlertDialogTitle>
            <AlertDialogDescription>Această acțiune nu poate fi anulată.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
