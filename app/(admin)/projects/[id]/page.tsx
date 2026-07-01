"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
import type { ProjectStatus, ProjectIssue, Assembly, AssemblyStep, Part, Product, Project } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Building2,
  Boxes,
  Calendar,
  CalendarCheck,
  CalendarClock,
  AlertCircle,
  Pencil,
  Plus,
  Shield,
  Package,
  User,
  Flag,
  Wrench,
  Zap,
  FileDown,
  ChevronDown,
} from "lucide-react"
import { toast } from "sonner"
import { projectsApi, assembliesApi, partsApi, getCurrentUser } from "@/lib/api"
import { canViewPrices, canEditProject, canResolveIssues } from "@/lib/permissions"
import type { AppRole } from "@/lib/permissions"

// ─── Production card view model ───────────────────────────────────────────────

type DependencyVM = {
  type: 'assembly' | 'part'
  entityId: string
  name: string
  code: string
  quantity: number
  ownSteps: AssemblyStep[]
}

type ProductionCardVM = {
  itemType: 'product' | 'assembly' | 'part'
  entityId: string
  name: string
  code: string
  quantity: number
  ownSteps: AssemblyStep[]
  dependencies: DependencyVM[]
}

function buildProductionCard(
  item: import("@/lib/types").ProjectItem,
  safeProducts: Product[],
  safeAssemblies: Assembly[],
  safeParts: Part[],
): ProductionCardVM | null {
  // Detect kind from type field; if absent, infer from which ID field is present
  const kind = (item.type ?? (item.assemblyId ? 'assembly' : item.partId ? 'part' : 'product')) as 'product' | 'assembly' | 'part'

  if (kind === 'product') {
    const product = safeProducts.find((p) => p.id === item.productId)
    if (!product) return null

    const ownSteps: AssemblyStep[] = product.productionSteps ?? product.assemblySteps ?? []

    const asmEntries =
      product.productAssemblies && product.productAssemblies.length > 0
        ? product.productAssemblies
        : (product.assemblyIds ?? []).map((id) => ({ assemblyId: id, quantity: 1 }))

    const partEntries =
      product.productParts && product.productParts.length > 0
        ? product.productParts
        : (product.partIds ?? []).map((id) => ({ partId: id, quantity: 1 }))

    const dependencies: DependencyVM[] = []

    for (const entry of asmEntries) {
      const asm = safeAssemblies.find((a) => a.id === entry.assemblyId)
      if (!asm) continue
      dependencies.push({
        type: 'assembly',
        entityId: asm.id,
        name: asm.name,
        code: asm.code,
        quantity: (entry.quantity ?? 1) * item.quantity,
        ownSteps: asm.productionSteps ?? [],
      })
    }

    for (const entry of partEntries) {
      const part = safeParts.find((p) => p.id === entry.partId)
      if (!part) continue
      dependencies.push({
        type: 'part',
        entityId: part.id,
        name: part.name,
        code: part.code ?? '',
        quantity: (entry.quantity ?? 1) * item.quantity,
        ownSteps: part.productionSteps ?? [],
      })
    }

    return { itemType: 'product', entityId: product.id, name: product.name, code: product.code, quantity: item.quantity, ownSteps, dependencies }
  }

  if (kind === 'assembly') {
    const asm = safeAssemblies.find((a) => a.id === item.assemblyId)
    if (!asm) return null

    const ownSteps: AssemblyStep[] = asm.productionSteps ?? []
    const dependencies: DependencyVM[] = []

    for (const entry of asm.childAssemblies ?? []) {
      const child = safeAssemblies.find((a) => a.id === entry.assemblyId)
      if (!child) continue
      dependencies.push({
        type: 'assembly',
        entityId: child.id,
        name: child.name,
        code: child.code,
        quantity: (entry.quantity ?? 1) * item.quantity,
        ownSteps: child.productionSteps ?? [],
      })
    }

    for (const entry of asm.parts ?? []) {
      const part = safeParts.find((p) => p.id === entry.partId)
      if (!part) continue
      dependencies.push({
        type: 'part',
        entityId: part.id,
        name: part.name,
        code: part.code ?? '',
        quantity: (entry.quantity ?? 1) * item.quantity,
        ownSteps: part.productionSteps ?? [],
      })
    }

    return { itemType: 'assembly', entityId: asm.id, name: asm.name, code: asm.code, quantity: item.quantity, ownSteps, dependencies }
  }

  // part
  const part = safeParts.find((p) => p.id === item.partId)
  if (!part) return null

  return {
    itemType: 'part',
    entityId: part.id,
    name: part.name,
    code: part.code ?? '',
    quantity: item.quantity,
    ownSteps: part.productionSteps ?? [],
    dependencies: [],
  }
}

function ownStepKey(card: ProductionCardVM, step: AssemblyStep): string {
  if (card.itemType === 'product') return `${card.entityId}:product:${step.id}`
  if (card.itemType === 'assembly') return `asm:${card.entityId}:step:${step.id}`
  return `part:${card.entityId}:step:${step.id}`
}

function depStepKey(dep: DependencyVM, step: AssemblyStep): string {
  if (dep.type === 'assembly') return `asm:${dep.entityId}:step:${step.id}`
  return `part:${dep.entityId}:step:${step.id}`
}

function depCompletedCount(dep: DependencyVM, stepsCompleted: Set<string>): number {
  return dep.ownSteps.filter((s) => stepsCompleted.has(depStepKey(dep, s))).length
}

function depStatus(dep: DependencyVM, stepsCompleted: Set<string>): string {
  const total = dep.ownSteps.length
  if (total === 0) return 'Fără pași'
  const done = depCompletedCount(dep, stepsCompleted)
  if (done === 0) return 'Neînceput'
  if (done === total) return 'Gata'
  return `${done}/${total} pași`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type StepToggle = (stepKey: string) => void

function StepRow({ step, stepKey, index, completed, onToggle }: { step: AssemblyStep; stepKey: string; index: number; completed: boolean; onToggle: StepToggle }) {
  return (
    <div className={`flex items-start gap-3 py-2 border-b last:border-0 ${completed ? "opacity-60" : ""}`}>
      <Checkbox
        checked={completed}
        onCheckedChange={() => onToggle(stepKey)}
        className="mt-0.5 shrink-0"
      />
      <span className="text-xs text-muted-foreground font-mono w-5 shrink-0 mt-0.5">{index + 1}.</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-medium ${completed ? "line-through" : ""}`}>{step.name}</span>
          {step.type && <Badge variant="secondary" className="text-xs">{step.type}</Badge>}
        </div>
        {step.description && <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>}
      </div>
    </div>
  )
}

function ProductionCardComponent({
  card,
  stepsCompleted,
  onToggle,
}: {
  card: ProductionCardVM
  stepsCompleted: Set<string>
  onToggle: StepToggle
}) {
  const [expanded, setExpanded] = useState(false)

  const ownDone = card.ownSteps.filter((s) => stepsCompleted.has(ownStepKey(card, s))).length
  const ownTotal = card.ownSteps.length

  const TypeIcon = card.itemType === 'product' ? Package : card.itemType === 'assembly' ? Boxes : Wrench

  const progressLabel =
    ownTotal === 0
      ? null
      : ownDone === ownTotal
      ? 'Gata'
      : `${ownDone}/${ownTotal} pași`

  return (
    <div className="rounded-lg border bg-card">
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors rounded-lg"
        onClick={() => setExpanded((e) => !e)}
      >
        <TypeIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="font-semibold text-sm">{card.name}</span>
        {card.code && <span className="text-xs font-mono text-muted-foreground">{card.code}</span>}
        <Badge variant="secondary" className="text-xs">× {card.quantity}</Badge>
        {progressLabel && (
          <Badge
            variant={ownDone === ownTotal && ownTotal > 0 ? 'default' : 'secondary'}
            className={`text-xs ml-auto mr-2 ${ownDone === ownTotal && ownTotal > 0 ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300' : ''}`}
          >
            {progressLabel}
          </Badge>
        )}
        {!progressLabel && <span className="ml-auto mr-2" />}
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t px-4 py-4 space-y-5">
          {/* Section 1: Own production steps */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Pași proprii
            </p>
            {ownTotal === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Nu există pași de producție definiți pentru acest element.
              </p>
            ) : (
              <div>
                {card.ownSteps.map((step, idx) => {
                  const key = ownStepKey(card, step)
                  return (
                    <StepRow
                      key={key}
                      step={step}
                      stepKey={key}
                      index={idx}
                      completed={stepsCompleted.has(key)}
                      onToggle={onToggle}
                    />
                  )
                })}
              </div>
            )}
          </div>

          {/* Section 2: Dependencies */}
          {(card.dependencies.length > 0 || card.itemType !== 'product') && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Dependențe
              </p>
              {card.dependencies.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Nicio dependență definită pentru acest element.
                </p>
              ) : (
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b">
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Element</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Tip</th>
                      <th className="text-center px-3 py-2 text-xs font-medium text-muted-foreground">Cant.</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {card.dependencies.map((dep) => {
                      const status = depStatus(dep, stepsCompleted)
                      const isReady = status === 'Gata'
                      const isNoSteps = status === 'Fără pași'
                      return (
                        <tr key={dep.entityId} className="border-b last:border-0">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              {dep.type === 'assembly'
                                ? <Boxes className="h-3 w-3 shrink-0 text-muted-foreground" />
                                : <Wrench className="h-3 w-3 shrink-0 text-muted-foreground" />}
                              <span className="font-medium">{dep.name}</span>
                              {dep.code && <span className="font-mono text-xs text-muted-foreground">{dep.code}</span>}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <Badge variant="outline" className="text-xs">
                              {dep.type === 'assembly' ? 'Ansamblu' : 'Piesă'}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-center text-muted-foreground">× {dep.quantity}</td>
                          <td className="px-3 py-2">
                            <Badge
                              variant={isReady ? 'default' : 'secondary'}
                              className={`text-xs ${isReady ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300' : ''} ${isNoSteps ? 'text-muted-foreground' : ''}`}
                            >
                              {status}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const {
    projects,
    companies,
    products,
    parts,
    assemblies,
    quotes,
    updateProject,
    updateProjectStatus,
    finishProject,
    addProjectIssue,
    resolveProjectIssue,
  } = useAppData()
  const { t } = useLocale()

  const currentRole = (getCurrentUser()?.role ?? "employee") as AppRole
  const showPrices = canViewPrices(currentRole)
  const canEdit = canEditProject(currentRole)
  const canResolve = canResolveIssues(currentRole)

  const [issueDialogOpen, setIssueDialogOpen] = useState(false)
  const [finishDialogOpen, setFinishDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", companyId: "" as string | null, startDate: "", deadline: "", finishDate: "", finalPrice: "" })
  const [newIssueDescription, setNewIssueDescription] = useState("")
  const [exportingCards, setExportingCards] = useState(false)
  const [exportingProjectLaser, setExportingProjectLaser] = useState(false)
  const [paidAmountInput, setPaidAmountInput] = useState<string>("")
  const [stepsCompleted, setStepsCompleted] = useState<Set<string>>(new Set())
  // Direct assembly/part items fetched on-demand so production cards don't depend
  // on the global context being pre-populated when the page first renders.
  const [directAssemblies, setDirectAssemblies] = useState<Assembly[]>([])
  const [directParts, setDirectParts] = useState<Part[]>([])

  const contextProject = projects?.find((p) => p.id === id) ?? null
  const [apiProject, setApiProject] = useState<Project | null>(null)
  const [fetchLoading, setFetchLoading] = useState(!contextProject)

  useEffect(() => {
    if (!contextProject && id) {
      setFetchLoading(true)
      projectsApi.get(id)
        .then(setApiProject)
        .catch(() => {})
        .finally(() => setFetchLoading(false))
    } else if (contextProject) {
      setFetchLoading(false)
    }
  }, [id, contextProject])

  const project = contextProject ?? apiProject

  useEffect(() => {
    if (project) {
      setPaidAmountInput(String(project.paidAmount ?? 0))
      setStepsCompleted(new Set(project.stepsCompleted ?? []))
    }
  }, [project?.id])

  // Fetch assembly/part data for direct project items so production cards work
  // even if the global context hasn't loaded yet or is missing these entities.
  useEffect(() => {
    if (!project) return
    const items = project.items ?? []

    const asmIds = [...new Set(
      items
        .filter(it => (it.type ?? (it.assemblyId ? 'assembly' : '')) === 'assembly' && it.assemblyId)
        .map(it => it.assemblyId!)
    )]
    const partIds = [...new Set(
      items
        .filter(it => (it.type ?? (it.partId ? 'part' : '')) === 'part' && it.partId)
        .map(it => it.partId!)
    )]

    if (asmIds.length > 0) {
      Promise.all(asmIds.map(aid => assembliesApi.get(aid).catch(() => null)))
        .then(async (results) => {
          const topLevel = results.filter(Boolean) as Assembly[]

          // Also fetch the child assemblies referenced by these direct items so
          // assembly cards can show their dependencies before the global context loads.
          const childAsmIds = [...new Set(
            topLevel.flatMap(a => (a.childAssemblies ?? []).map(c => c.assemblyId))
          )].filter(cid => cid && !asmIds.includes(cid))

          const children = childAsmIds.length > 0
            ? (await Promise.all(childAsmIds.map(cid => assembliesApi.get(cid).catch(() => null)))).filter(Boolean) as Assembly[]
            : []

          const allAsms = [...topLevel, ...children]
          setDirectAssemblies(allAsms)

          // Fetch the parts referenced by these assemblies for the same reason.
          const refPartIds = [...new Set(allAsms.flatMap(a => (a.parts ?? []).map(p => p.partId)))]
            .filter(pid => pid && !partIds.includes(pid))
          if (refPartIds.length > 0) {
            const refParts = (await Promise.all(refPartIds.map(pid => partsApi.get(pid).catch(() => null)))).filter(Boolean) as Part[]
            setDirectParts(prev => [...prev, ...refParts.filter(p => !prev.some(ep => ep.id === p.id))])
          }
        })
    }
    if (partIds.length > 0) {
      Promise.all(partIds.map(pid => partsApi.get(pid).catch(() => null)))
        .then(results => setDirectParts(prev => {
          const fetched = results.filter(Boolean) as Part[]
          return [...prev.filter(p => !fetched.some(fp => fp.id === p.id)), ...fetched]
        }))
    }
  }, [project?.id])

  if (!project && fetchLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Se încarcă...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">{t("projects.noProjectsFound")}</p>
        <Button variant="link" onClick={() => router.push("/projects")}>
          {t("common.back")}
        </Button>
      </div>
    )
  }

  const company = project.companyId ? companies.find((c) => c.id === project.companyId) : null
  const quote = project.quoteId ? quotes.find((q) => q.id === project.quoteId) : null
  const subtotal = project.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const installationCost = project.installationCost || 0
  const computedTotal = subtotal + installationCost
  const total = project.finalPrice != null ? project.finalPrice : computedTotal
  const paidAmount = project.paidAmount ?? 0
  const remaining = Math.max(0, total - paidAmount)

  const handleSavePaidAmount = async () => {
    const parsed = parseFloat(paidAmountInput)
    const value = isNaN(parsed) || parsed < 0 ? 0 : parsed
    await updateProject({ ...project, paidAmount: value })
    toast.success(t("common.savedSuccessfully"))
  }

  const handleOpenEdit = () => {
    setEditForm({
      name: project.name,
      companyId: project.companyId,
      startDate: project.startDate || "",
      deadline: project.deadline || "",
      finishDate: project.finishDate || "",
      finalPrice: project.finalPrice != null ? String(project.finalPrice) : "",
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      toast.error("Project name is required")
      return
    }
    let warrantyExpiration = project.warrantyExpiration
    if (editForm.finishDate) {
      const fd = new Date(editForm.finishDate)
      warrantyExpiration = new Date(fd.getFullYear() + 2, fd.getMonth(), fd.getDate()).toISOString().slice(0, 10)
    }
    const parsedFinalPrice = editForm.finalPrice !== "" ? parseFloat(editForm.finalPrice) : null
    const finalPrice = parsedFinalPrice != null && !isNaN(parsedFinalPrice) ? parsedFinalPrice : null
    const { finalPrice: _fp, ...restForm } = editForm
    await updateProject({ ...project, ...restForm, warrantyExpiration, finalPrice })
    toast.success(t("common.savedSuccessfully"))
    setEditDialogOpen(false)
  }
  const openIssues = project.issues.filter((i) => !i.solved)
  const isPersonal = project.companyId === null

  // Merge global context with directly-fetched entities so cards resolve even when
  // context hasn't loaded yet. Directly-fetched data takes precedence on collision.
  const mergedAssemblies: Assembly[] = [...(assemblies ?? []), ...directAssemblies.filter(a => !(assemblies ?? []).some(ca => ca.id === a.id))]
  const mergedParts: Part[] = [...(parts ?? []), ...directParts.filter(p => !(parts ?? []).some(cp => cp.id === p.id))]

  // Build card view models for all project items (products, assemblies, parts)
  const productionCards: ProductionCardVM[] = project.items
    .map((item) => buildProductionCard(item, products ?? [], mergedAssemblies, mergedParts))
    .filter((c): c is ProductionCardVM => c !== null)

  const totalStepCount = productionCards.reduce((s, c) => s + c.ownSteps.length, 0)
  const completedStepCount = productionCards.reduce(
    (s, c) => s + c.ownSteps.filter((step) => stepsCompleted.has(ownStepKey(c, step))).length,
    0,
  )
  const progressPct = totalStepCount === 0 ? 0 : Math.round((completedStepCount / totalStepCount) * 100)

  const toggleStep = async (stepKey: string) => {
    const next = new Set(stepsCompleted)
    if (next.has(stepKey)) next.delete(stepKey)
    else next.add(stepKey)
    setStepsCompleted(next)
    try {
      await projectsApi.toggleStep(project.id, stepKey, totalStepCount)
    } catch {
      setStepsCompleted(stepsCompleted)
      toast.error("Eroare la salvarea progresului")
    }
  }

  const getStatusBadge = (status: ProjectStatus) => {
    const config: Record<ProjectStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className?: string }> = {
      draft: { variant: "secondary", label: t("status.draft") },
      "in-progress": { variant: "default", label: t("status.inProgress") },
      "in-installation": { variant: "default", label: t("status.inInstallation"), className: "bg-blue-600 hover:bg-blue-600 text-white border-blue-600" },
      done: { variant: "outline", label: t("status.done") },
      warranty: { variant: "outline", label: t("status.warranty"), className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800" },
      maintenance: { variant: "outline", label: t("status.maintenance"), className: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800" },
      cancelled: { variant: "destructive", label: t("status.cancelled") },
    }
    const c = config[status] || { variant: "secondary" as const, label: status }
    return <Badge variant={c.variant} className={c.className}>{c.label}</Badge>
  }

  const handleStatusChange = (status: ProjectStatus) => {
    if (status === "done") {
      setFinishDialogOpen(true)
    } else {
      updateProjectStatus(project.id, status)
      toast.success(t("common.savedSuccessfully"))
    }
  }

  const handleFinishProject = () => {
    finishProject(project.id)
    setFinishDialogOpen(false)
    toast.success(t("projects.projectFinished"))
  }

  const handleAddIssue = () => {
    if (!newIssueDescription.trim()) return
    const issue: ProjectIssue = {
      id: `i${Date.now()}`,
      description: newIssueDescription,
      solved: false,
      solvedAt: null,
      createdAt: new Date().toISOString().split("T")[0],
    }
    addProjectIssue(project.id, issue)
    setNewIssueDescription("")
    setIssueDialogOpen(false)
    toast.success(t("projects.issueReported"))
  }

  const handleResolveIssue = (issueId: string) => {
    resolveProjectIssue(project.id, issueId)
    toast.success(t("projects.issueResolved"))
  }

  async function handleExportCardsPdf() {
    if (!project) return
    setExportingCards(true)
    try {
      const blob = await projectsApi.exportProductionCardsPdf(project.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `fise-productie-${project.code}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Fișe de producție generate cu succes")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Eroare la generare PDF")
    } finally {
      setExportingCards(false)
    }
  }

  async function handleExportProjectLaserPdf() {
    if (!project) return
    setExportingProjectLaser(true)
    try {
      const blob = await projectsApi.exportLaserCuttingPdf(project.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `taiere-laser-${project.code}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Listă tăiere laser generată cu succes")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Eroare la generare PDF")
    } finally {
      setExportingProjectLaser(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/projects")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">{project.code}</span>
              {getStatusBadge(project.status)}
              {isPersonal && (
                <Badge variant="outline" className="gap-1">
                  <User className="h-3 w-3" />
                  {t("projects.personal")}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button variant="outline" onClick={handleOpenEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              {t("common.edit")}
            </Button>
          )}
          {canEdit && !["done", "warranty", "maintenance", "cancelled"].includes(project.status) && (
            <Button variant="default" onClick={() => setFinishDialogOpen(true)}>
              <Flag className="mr-2 h-4 w-4" />
              {t("projects.finishProject")}
            </Button>
          )}
          {canEdit && (
            <Select value={project.status} onValueChange={(v) => handleStatusChange(v as ProjectStatus)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">{t("status.draft")}</SelectItem>
                <SelectItem value="in-progress">{t("status.inProgress")}</SelectItem>
                <SelectItem value="in-installation">{t("status.inInstallation")}</SelectItem>
                <SelectItem value="done">{t("status.done")}</SelectItem>
                <SelectItem value="warranty">{t("status.warranty")}</SelectItem>
                <SelectItem value="maintenance">{t("status.maintenance")}</SelectItem>
                <SelectItem value="cancelled">{t("status.cancelled")}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className={`grid gap-4 md:grid-cols-3 ${showPrices ? "lg:grid-cols-7" : "lg:grid-cols-4"}`}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("common.company")}</p>
                <p className="font-medium">{company?.name || t("projects.personal")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("common.startDate")}</p>
                <p className="font-medium">{project.startDate || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CalendarClock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("projects.deadline")}</p>
                <p className="font-medium">{project.deadline || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CalendarCheck className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("projects.finishDate")}</p>
                <p className="font-medium">{project.finishDate || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {showPrices && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Preț proiect (EUR)</p>
                  <p className="font-medium">{total.toLocaleString()} EUR</p>
                  {project.finalPrice == null && installationCost > 0 && (
                    <p className="text-xs text-muted-foreground">
                      incl. instalare {installationCost.toLocaleString()} EUR
                    </p>
                  )}
                  {project.finalPrice == null && (
                    <p className="text-xs text-muted-foreground italic">calculat din produse</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {showPrices && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">{t("projects.paidAmount")} (EUR)</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={0}
                    value={paidAmountInput}
                    onFocus={() => { if (paidAmountInput === "0") setPaidAmountInput("") }}
                    onChange={(e) => setPaidAmountInput(e.target.value)}
                    onBlur={handleSavePaidAmount}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {showPrices && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{t("projects.remaining")}</p>
                  <p className={`font-medium ${remaining === 0 ? "text-green-600" : ""}`}>
                    {remaining.toLocaleString()} EUR
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Warranty + Quote info */}
      {(project.warrantyExpiration || quote) && (
        <div className="grid gap-4 md:grid-cols-2">
          {project.warrantyExpiration && (
            <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("projects.warrantyExpiration")}</p>
                    <p className="font-medium">{project.warrantyExpiration}</p>
                    <p className="text-xs text-muted-foreground">{t("projects.warrantyNote")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {quote && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t("projects.linkedQuote")}</p>
                      <p className="font-medium">{quote.name}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/quotes/${quote.id}`)}>
                    {t("common.view")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Issues Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {t("projects.issues")}
            {openIssues.length > 0 && (
              <Badge variant="destructive">{t("projects.activeIssue")}</Badge>
            )}
            {openIssues.length === 0 && project.issues.length > 0 && (
              <Badge variant="outline">{t("projects.noActiveIssue")}</Badge>
            )}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIssueDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("projects.reportIssue")}
          </Button>
        </CardHeader>
        <CardContent>
          {project.issues.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">{t("projects.noIssues")}</p>
          ) : (
            <div className="space-y-2">
              {project.issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`flex items-center justify-between rounded-md border p-3 ${
                    issue.solved ? "bg-muted/30" : ""
                  }`}
                >
                  <div>
                    <span className={issue.solved ? "line-through text-muted-foreground" : ""}>
                      {issue.description}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {t("common.createdAt")}: {issue.createdAt}
                      {issue.solvedAt && ` | ${t("projects.solved")}: ${issue.solvedAt}`}
                    </p>
                  </div>
                  {!issue.solved && canResolve && (
                    <Button size="sm" variant="outline" onClick={() => handleResolveIssue(issue.id)}>
                      {t("projects.solve")}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>{t("products")}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-blue-300 text-blue-700 hover:bg-blue-50"
            onClick={handleExportProjectLaserPdf}
            disabled={exportingProjectLaser}
          >
            <Zap className="mr-1 h-3 w-3" />
            {exportingProjectLaser ? "Se generează..." : "Tăiere Laser"}
          </Button>
        </CardHeader>
        <CardContent>
          {project.items.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">{t("projects.noProductsAdded")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("products.productName")}</TableHead>
                  <TableHead className="text-right">{t("common.quantity")}</TableHead>
                  {showPrices && <TableHead className="text-right">{t("common.price")} (EUR)</TableHead>}
                  {showPrices && <TableHead className="text-right">{t("common.total")} (EUR)</TableHead>}
                  <TableHead>{t("projects.source")}</TableHead>
                  <TableHead>{t("common.notes")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.items.map((item, idx) => {
                  const kind = item.type ?? (item.assemblyId ? 'assembly' : item.partId ? 'part' : 'product')
                  const prod = kind === 'product' ? products?.find((p) => p.id === item.productId) : undefined
                  const asm = kind === 'assembly' ? mergedAssemblies.find((a) => a.id === item.assemblyId) : undefined
                  const prt = kind === 'part' ? mergedParts.find((p) => p.id === item.partId) : undefined
                  const displayName = prod?.name ?? asm?.name ?? prt?.name ?? item.productId ?? item.assemblyId ?? item.partId ?? '—'
                  const displayCode = prod?.code ?? asm?.code ?? prt?.code
                  return (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {kind === 'assembly' && <Boxes className="h-3 w-3 text-muted-foreground shrink-0" />}
                          {kind === 'part' && <Wrench className="h-3 w-3 text-muted-foreground shrink-0" />}
                          {kind === 'product' && <Package className="h-3 w-3 text-muted-foreground shrink-0" />}
                          <span>{displayName}</span>
                          {displayCode && <span className="text-xs font-mono text-muted-foreground">{displayCode}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      {showPrices && <TableCell className="text-right">{item.unitPrice.toFixed(2)}</TableCell>}
                      {showPrices && <TableCell className="text-right">{(item.quantity * item.unitPrice).toFixed(2)}</TableCell>}
                      <TableCell>
                        <Badge variant={item.fromInventory ? "secondary" : "outline"}>
                          {item.fromInventory ? t("projects.fromInventory") : t("projects.needsProduction")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.notes || "-"}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Production Steps */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Boxes className="h-5 w-5" />
            Pași de producție{totalStepCount > 0 && ` (${totalStepCount})`}
          </CardTitle>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCardsPdf}
              disabled={exportingCards}
            >
              <FileDown className="mr-1 h-3 w-3" />
              {exportingCards ? "Se generează..." : "Fișe de producție"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {totalStepCount > 0 && (
            <div className="flex items-center gap-3 pb-2 border-b">
              <Progress value={progressPct} className="flex-1 h-2" />
              <span className="text-sm font-medium shrink-0">{completedStepCount}/{totalStepCount} ({progressPct}%)</span>
            </div>
          )}
          {productionCards.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nu există elemente de producție configurate în acest proiect.
            </p>
          ) : (
            productionCards.map((card) => (
              <ProductionCardComponent
                key={`${card.itemType}:${card.entityId}`}
                card={card}
                stepsCompleted={stepsCompleted}
                onToggle={toggleStep}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Issues Alert */}
      {openIssues.length > 0 && (
        <Card className="border-destructive">
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              {t("projects.activeIssues")} ({openIssues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {openIssues.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between rounded-md bg-destructive/10 p-3">
                  <span>{issue.description}</span>
                  <Button size="sm" variant="outline" onClick={() => handleResolveIssue(issue.id)}>
                    {t("projects.solve")}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>{t("projects.activity")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {project.activity.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                <div>
                  <p>{entry.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.user} - {entry.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("common.edit")}: {project.name}</DialogTitle>
            <DialogDescription>Actualizează detaliile proiectului</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t("common.name")} *</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("common.company")}</Label>
              <Select
                value={editForm.companyId || "personal"}
                onValueChange={(v) => setEditForm({ ...editForm, companyId: v === "personal" ? null : v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">{t("projects.personal")}</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start">{t("common.startDate")}</Label>
                <Input
                  id="edit-start"
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-deadline">{t("projects.deadline")}</Label>
                <Input
                  id="edit-deadline"
                  type="date"
                  value={editForm.deadline}
                  onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-finish">Data Finalizare</Label>
              <Input
                id="edit-finish"
                type="date"
                value={editForm.finishDate}
                onChange={(e) => setEditForm({ ...editForm, finishDate: e.target.value })}
              />
            </div>
            {showPrices && (
              <div className="space-y-2">
                <Label htmlFor="edit-final-price">Preț proiect (EUR)</Label>
                <Input
                  id="edit-final-price"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Introduceți prețul proiectului"
                  value={editForm.finalPrice}
                  onChange={(e) => setEditForm({ ...editForm, finalPrice: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Lăsați gol pentru a calcula automat din produse.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleSaveEdit}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Issue Dialog */}
      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("projects.reportIssue")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">{t("common.description")} *</Label>
              <Textarea
                id="description"
                value={newIssueDescription}
                onChange={(e) => setNewIssueDescription(e.target.value)}
                placeholder={t("projects.issuePlaceholder")}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleAddIssue}>{t("projects.reportIssue")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finish Project Dialog */}
      <Dialog open={finishDialogOpen} onOpenChange={setFinishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("projects.finishProject")}</DialogTitle>
            <DialogDescription>{t("projects.finishProjectDesc")}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <p className="text-sm"><strong>{t("projects.finishDate")}:</strong> {new Date().toISOString().split("T")[0]}</p>
            <p className="text-sm"><strong>{t("projects.warrantyExpiration")}:</strong> {new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}</p>
            <p className="text-sm text-muted-foreground">{t("projects.warrantyNote")}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFinishDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleFinishProject}>{t("projects.confirmFinish")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
