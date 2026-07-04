"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { ListChecks, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { stepDefinitionsApi } from "@/lib/api"
import type { StepDefinition } from "@/lib/types"

export default function StepDefinitionsPage() {
  const [definitions, setDefinitions] = useState<StepDefinition[]>([])
  const [loading, setLoading] = useState(true)

  // Create / edit dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDef, setEditingDef] = useState<StepDefinition | null>(null)
  const [formName, setFormName] = useState("")
  const [saving, setSaving] = useState(false)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<StepDefinition | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      setDefinitions(await stepDefinitionsApi.list())
    } catch {
      toast.error("Eroare la încărcarea pașilor")
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditingDef(null)
    setFormName("")
    setDialogOpen(true)
  }

  function openEdit(def: StepDefinition) {
    setEditingDef(def)
    setFormName(def.name)
    setDialogOpen(true)
  }

  async function handleSave() {
    const name = formName.trim()
    if (!name) { toast.error("Numele este obligatoriu"); return }
    setSaving(true)
    try {
      if (editingDef) {
        const updated = await stepDefinitionsApi.update(editingDef.id, name)
        setDefinitions((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
        toast.success("Pas actualizat")
      } else {
        const created = await stepDefinitionsApi.create(name)
        setDefinitions((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
        toast.success("Pas adăugat")
      }
      setDialogOpen(false)
    } catch {
      toast.error("Eroare la salvare")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await stepDefinitionsApi.delete(deleteTarget.id)
      setDefinitions((prev) => prev.filter((d) => d.id !== deleteTarget.id))
      toast.success("Pas eliminat")
    } catch {
      toast.error("Eroare la eliminare")
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Pași producție</h2>
          <p className="text-sm text-muted-foreground">
            Definiții reutilizabile de pași de producție
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Adaugă pas
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total definiții</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{definitions.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Definiții pași producție</CardTitle>
          <CardDescription>
            Acești pași apar în dropdown-ul de selectare la editarea pieselor, ansamblelor și produselor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Se încarcă...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Denumire</TableHead>
                  <TableHead className="w-[100px]">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {definitions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      Niciun pas definit. Apasă &ldquo;Adaugă pas&rdquo; pentru a începe.
                    </TableCell>
                  </TableRow>
                )}
                {definitions.map((def, idx) => (
                  <TableRow key={def.id}>
                    <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{def.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(def)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setDeleteTarget(def)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingDef ? "Editează pas" : "Adaugă pas nou"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Denumire *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="ex: Tăiere laser, Sudură, Vopsire..."
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Se salvează..." : "Salvează"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimină definiție pas</AlertDialogTitle>
            <AlertDialogDescription>
              Pasul &ldquo;{deleteTarget?.name}&rdquo; va fi dezactivat. Pașii de producție
              existenți care foloseau această definiție nu sunt afectați — numele lor rămâne
              salvat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Elimină
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
