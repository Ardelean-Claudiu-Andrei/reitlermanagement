"use client"

import { use, useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
import type { ProjectStatus, ProjectIssue, Assembly, AssemblyStep, Part, Product, Project, ActivityEntry, ProjectItem, PaginatedActivityResponse } from "@/lib/types"
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
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Trash2,
  ChevronsUpDown,
  Check,
  ShoppingCart,
  ExternalLink,
  Download,
} from "lucide-react"
import { toast } from "sonner"
import { projectsApi, productsApi, assembliesApi, partsApi, getCurrentUser } from "@/lib/api"
import { buildProductionCards, ownStepKey, depStepKey } from "@/lib/project-production"
import type { ProductionCardVM, DependencyVM, UsageEntry } from "@/lib/project-production"
import { consolidateProjectItems, getProjectItemKey, computeProjectTotal } from "@/lib/project-items"
import { canViewPrices, canEditProject, canResolveIssues } from "@/lib/permissions"
import type { AppRole } from "@/lib/permissions"
import { formatActivityTimestamp } from "@/lib/format-date"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { EntityFileUploads } from "@/components/entity-file-uploads"
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// ─── Production card helpers ──────────────────────────────────────────────────
// Types and step-key helpers are imported from @/lib/project-production

function depCompletedCount(dep: DependencyVM, stepsCompleted: Set<string>): number {
  return dep.ownSteps.filter((s) => stepsCompleted.has(depStepKey(dep, s))).length
}

type DepStatusCode = 'no-steps' | 'not-started' | 'done' | 'partial'

function getDepStatusCode(dep: DependencyVM, stepsCompleted: Set<string>): { code: DepStatusCode; done?: number; total?: number } {
  const total = dep.ownSteps.length
  if (total === 0) return { code: 'no-steps' }
  const done = depCompletedCount(dep, stepsCompleted)
  if (done === 0) return { code: 'not-started' }
  if (done === total) return { code: 'done' }
  return { code: 'partial', done, total }
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
  onViewDetails,
}: {
  card: ProductionCardVM
  stepsCompleted: Set<string>
  onToggle: StepToggle
  onViewDetails: (type: 'product' | 'assembly' | 'part', id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const { t } = useLocale()

  const ownDone = card.ownSteps.filter((s) => stepsCompleted.has(ownStepKey(card, s))).length
  const ownTotal = card.ownSteps.length

  const manualDoneKey = `manual:${card.itemType}:${card.entityId}`
  const isManuallyDone = ownTotal === 0 && stepsCompleted.has(manualDoneKey)
  const isDone = (ownTotal > 0 && ownDone === ownTotal) || isManuallyDone

  const TypeIcon = card.itemType === 'product' ? Package : card.itemType === 'assembly' ? Boxes : Wrench

  const progressLabel =
    ownTotal === 0
      ? isManuallyDone ? t('projects.prod.done') : null
      : ownDone === ownTotal
      ? t('projects.prod.done')
      : t('projects.prod.stepsProgress', { done: String(ownDone), total: String(ownTotal) })

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center">
        <button
          type="button"
          className="flex-1 flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors rounded-l-lg min-w-0"
          onClick={() => setExpanded((e) => !e)}
        >
          <TypeIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="font-semibold text-sm">{card.name}</span>
          {card.code && <span className="text-xs font-mono text-muted-foreground">{card.code}</span>}
          <Badge variant="secondary" className="text-xs">× {card.quantity}</Badge>
          {progressLabel && (
            <Badge
              variant={isDone ? 'default' : 'secondary'}
              className={`text-xs ml-auto ${isDone ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300' : ''}`}
            >
              {progressLabel}
            </Badge>
          )}
          {!progressLabel && <span className="ml-auto" />}
          <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        <button
          type="button"
          className="shrink-0 px-3 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors rounded-r-lg"
          title={t('projects.prod.viewDetails')}
          aria-label={`${t('projects.prod.viewDetails')} ${card.name}`}
          onClick={(e) => { e.stopPropagation(); onViewDetails(card.itemType, card.entityId) }}
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      {expanded && (
        <div className="border-t px-4 py-4 space-y-5">
          {/* Section 1: Own production steps */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              {t('projects.prod.ownSteps')}
            </p>
            {ownTotal === 0 ? (
              <div className="flex items-center gap-3 py-1">
                <Checkbox
                  id={manualDoneKey}
                  checked={isManuallyDone}
                  onCheckedChange={() => onToggle(manualDoneKey)}
                />
                <label
                  htmlFor={manualDoneKey}
                  className="text-sm cursor-pointer select-none text-muted-foreground"
                >
                  {t('projects.prod.markDone')}
                </label>
              </div>
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
                {t('projects.prod.dependencies')}
              </p>
              {card.dependencies.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  {t('projects.prod.noDependencies')}
                </p>
              ) : (
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b">
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">{t('projects.prod.colElement')}</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">{t('common.type')}</th>
                      <th className="text-center px-3 py-2 text-xs font-medium text-muted-foreground">{t('projects.purchase.colQty')}</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">{t('projects.prod.colStatus')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {card.dependencies.map((dep) => {
                      const { code: depCode, done: depDone, total: depTotal } = getDepStatusCode(dep, stepsCompleted)
                      const isReady = depCode === 'done'
                      const isNoSteps = depCode === 'no-steps'
                      const depStatusText =
                        depCode === 'no-steps' ? t('projects.prod.noSteps')
                        : depCode === 'not-started' ? t('projects.prod.notStarted')
                        : depCode === 'done' ? t('projects.prod.done')
                        : t('projects.prod.stepsProgress', { done: String(depDone), total: String(depTotal) })
                      return (
                        <tr key={dep.entityId} className="border-b last:border-0">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              {dep.type === 'assembly'
                                ? <Boxes className="h-3 w-3 shrink-0 text-muted-foreground" />
                                : <Wrench className="h-3 w-3 shrink-0 text-muted-foreground" />}
                              <span className="font-medium">{dep.name}</span>
                              {dep.code && <span className="font-mono text-xs text-muted-foreground">{dep.code}</span>}
                              <button
                                type="button"
                                className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
                                title={t('projects.prod.viewDetails')}
                                onClick={(e) => { e.stopPropagation(); onViewDetails(dep.type, dep.entityId) }}
                              >
                                <Eye className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <Badge variant="outline" className="text-xs">
                              {dep.type === 'assembly' ? t('projects.prod.typeAssembly') : t('projects.prod.typePart')}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-center text-muted-foreground">× {dep.quantity}</td>
                          <td className="px-3 py-2">
                            <Badge
                              variant={isReady ? 'default' : 'secondary'}
                              className={`text-xs ${isReady ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300' : ''} ${isNoSteps ? 'text-muted-foreground' : ''}`}
                            >
                              {depStatusText}
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

          {/* Section 3: Utilizat în (for assemblies and parts) */}
          {card.usages.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                {t('projects.prod.usedIn')}
              </p>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b">
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">{t('projects.prod.colParent')}</th>
                      <th className="text-center px-3 py-2 text-xs font-medium text-muted-foreground">{t('projects.purchase.colQty')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {card.usages.map((u: UsageEntry, i: number) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="px-3 py-2">
                          <span className="font-medium">{u.parentName}</span>
                          {u.parentCode && <span className="ml-2 font-mono text-xs text-muted-foreground">{u.parentCode}</span>}
                        </td>
                        <td className="px-3 py-2 text-center text-muted-foreground">× {u.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

  type ViewTarget = { type: 'product' | 'assembly' | 'part'; id: string } | null
  const [viewTarget, setViewTarget] = useState<ViewTarget>(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewedProduct, setViewedProduct] = useState<Product | null>(null)
  const [viewedAssembly, setViewedAssembly] = useState<Assembly | null>(null)
  const [viewedPart, setViewedPart] = useState<Part | null>(null)

  // Add item dialog
  const [addItemOpen, setAddItemOpen] = useState(false)
  const [addItemType, setAddItemType] = useState<'product' | 'assembly' | 'part'>('product')
  const [addItemEntityId, setAddItemEntityId] = useState('')
  const [addItemQty, setAddItemQty] = useState(1)
  const [addItemPrice, setAddItemPrice] = useState(0)
  const [addItemFromInventory, setAddItemFromInventory] = useState(false)
  const [addItemNotes, setAddItemNotes] = useState('')
  const [addItemSaving, setAddItemSaving] = useState(false)
  const [addItemComboOpen, setAddItemComboOpen] = useState(false)

  // Remove item
  const [removeItemIdx, setRemoveItemIdx] = useState<number | null>(null)
  const [removeSaving, setRemoveSaving] = useState(false)
  const [purchaseListOpen, setPurchaseListOpen] = useState(false)
  const [exportingPurchasePdf, setExportingPurchasePdf] = useState(false)
  const [doneCardsOpen, setDoneCardsOpen] = useState(false)

  // Activity log (server-side paginated)
  const [activityItems, setActivityItems] = useState<ActivityEntry[]>([])
  const [activityPage, setActivityPage] = useState(1)
  const [activityTotal, setActivityTotal] = useState(0)
  const [activityTotalPages, setActivityTotalPages] = useState(1)
  const [activityLoading, setActivityLoading] = useState(false)
  const [activityError, setActivityError] = useState<string | null>(null)
  const activityRequestRef = useRef(0)

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

  // Stable dependency keys — recompute when the set of direct assembly/part IDs changes.
  const directAsmIdsKey = useMemo(
    () => (project?.items ?? [])
      .filter(it => (it.type ?? (it.assemblyId ? 'assembly' : '')) === 'assembly' && it.assemblyId)
      .map(it => it.assemblyId!)
      .sort().join(','),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project?.items],
  )
  const directPartIdsKey = useMemo(
    () => (project?.items ?? [])
      .filter(it => (it.type ?? (it.partId ? 'part' : '')) === 'part' && it.partId)
      .map(it => it.partId!)
      .sort().join(','),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project?.items],
  )

  // Consolidated view: identical items (same entity + price + source + notes) are merged into one row.
  // Computed before early returns so hook call count is stable across renders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const consolidatedProjectItems = useMemo(
    () => consolidateProjectItems(project?.items ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project?.items],
  )

  // Fetch assembly/part data for direct project items so production cards work
  // even if the global context hasn't loaded yet or is missing these entities.
  // Re-runs whenever the set of direct assembly/part IDs changes (e.g. after add/remove).
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
          setDirectAssemblies(prev => {
            const merged = [...prev.filter(a => !allAsms.some(na => na.id === a.id)), ...allAsms]
            return merged
          })

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directAsmIdsKey, directPartIdsKey])

  if (!project && fetchLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">{t('projects.detail.loading')}</p>
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
  const installationCost = Number(project.installationCost) || 0
  const total = computeProjectTotal({ ...project, items: consolidatedProjectItems })
  const paidAmount = Number(project.paidAmount) || 0
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
      toast.error(t('projects.detail.nameRequired'))
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

  // Flatten the full recursive tree into one card per unique entity
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const productionCards: ProductionCardVM[] = useMemo(
    () => buildProductionCards(consolidatedProjectItems, products ?? [], mergedAssemblies, mergedParts),
    // Depend on the consolidated items so production cards reflect merged quantities.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project.id, consolidatedProjectItems, products, mergedAssemblies, mergedParts],
  )

  const purchaseParts = useMemo(
    () =>
      productionCards
        .filter((card) => card.itemType === 'part')
        .flatMap((card) => {
          const part = mergedParts.find((p) => p.id === card.entityId)
          if (!part?.requiresPurchase) return []
          return [{ id: card.entityId, name: card.name, code: card.code, quantity: card.quantity, part }]
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [productionCards, mergedParts],
  )

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
      toast.error(t('projects.detail.stepSaveError'))
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

  const handleStatusChange = async (status: ProjectStatus) => {
    if (status === "done") {
      setFinishDialogOpen(true)
    } else {
      await updateProjectStatus(project.id, status)
      toast.success(t("common.savedSuccessfully"))
      await refreshActivityFromFirstPage()
    }
  }

  const handleFinishProject = async () => {
    await finishProject(project.id)
    setFinishDialogOpen(false)
    toast.success(t("projects.projectFinished"))
    await refreshActivityFromFirstPage()
  }

  const handleAddIssue = async () => {
    if (!newIssueDescription.trim()) return
    const issue: ProjectIssue = {
      id: `i${Date.now()}`,
      description: newIssueDescription,
      solved: false,
      solvedAt: null,
      createdAt: new Date().toISOString().split("T")[0],
    }
    await addProjectIssue(project.id, issue)
    setNewIssueDescription("")
    setIssueDialogOpen(false)
    toast.success(t("projects.issueReported"))
    await refreshActivityFromFirstPage()
  }

  const handleResolveIssue = async (issueId: string) => {
    await resolveProjectIssue(project.id, issueId)
    toast.success(t("projects.issueResolved"))
    await refreshActivityFromFirstPage()
  }

  async function openEntityDetails(type: 'product' | 'assembly' | 'part', id: string) {
    setViewTarget({ type, id })
    setViewLoading(true)
    setViewedProduct(null)
    setViewedAssembly(null)
    setViewedPart(null)
    try {
      if (type === 'product') {
        const p = await productsApi.get(id)
        setViewedProduct(p)
      } else if (type === 'assembly') {
        const a = await assembliesApi.get(id)
        setViewedAssembly(a)
      } else {
        const p = await partsApi.get(id)
        setViewedPart(p)
      }
    } catch {
      toast.error(t('projects.detail.loadDetailsError'))
      setViewTarget(null)
    } finally {
      setViewLoading(false)
    }
  }

  function closeEntityDetails() {
    setViewTarget(null)
    setViewedProduct(null)
    setViewedAssembly(null)
    setViewedPart(null)
  }

  // ─── Activity log (server-side paginated) ─────────────────────────────────

  const loadActivity = useCallback(async (page: number) => {
    if (!project?.id) return
    const requestId = ++activityRequestRef.current
    setActivityLoading(true)
    setActivityError(null)
    try {
      const result: PaginatedActivityResponse = await projectsApi.getActivity(project.id, page)
      if (activityRequestRef.current !== requestId) return
      setActivityItems(result.items)
      setActivityTotal(result.total)
      setActivityTotalPages(result.totalPages)
      setActivityPage(result.page)
    } catch {
      if (activityRequestRef.current !== requestId) return
      setActivityError(t('projects.detail.activityLoadError'))
    } finally {
      if (activityRequestRef.current === requestId) setActivityLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id])

  const refreshActivityFromFirstPage = useCallback(async () => {
    setActivityPage(1)
    await loadActivity(1)
  }, [loadActivity])

  useEffect(() => {
    if (!project?.id) return
    loadActivity(activityPage)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, activityPage])

  // ─── Items: shared save helper ────────────────────────────────────────────

  async function saveItemsUpdate(nextItems: ProjectItem[], activityMsg: string): Promise<void> {
    if (!project) return
    const currentUser = getCurrentUser()
    const nextCards = buildProductionCards(nextItems, products ?? [], mergedAssemblies, mergedParts)
    const nextStepsTotal = nextCards.reduce((sum, c) => sum + c.ownSteps.length, 0)
    const validKeys = new Set(nextCards.flatMap(c => c.ownSteps.map(s => ownStepKey(c, s))))
    const nextStepsCompleted = (project.stepsCompleted ?? []).filter(k => validKeys.has(k))

    const activityEntry: ActivityEntry = {
      id: `a${Date.now()}`,
      action: activityMsg,
      user: currentUser?.name ?? 'Utilizator',
      timestamp: new Date().toISOString(),
    }

    const updated = await updateProject({
      ...project,
      items: nextItems,
      stepsCompleted: nextStepsCompleted,
      stepsTotal: nextStepsTotal,
      activity: [...(project.activity ?? []), activityEntry],
    })

    if (apiProject) setApiProject(updated)
    setStepsCompleted(new Set(nextStepsCompleted))
    await refreshActivityFromFirstPage()
  }

  // ─── Add item ─────────────────────────────────────────────────────────────

  function resetAddForm() {
    setAddItemType('product')
    setAddItemEntityId('')
    setAddItemQty(1)
    setAddItemPrice(0)
    setAddItemFromInventory(false)
    setAddItemNotes('')
    setAddItemComboOpen(false)
  }

  async function handleAddItem() {
    if (!project) return
    if (!addItemEntityId) { toast.error(t('projects.addItem.selectRequired')); return }
    if (addItemQty < 1) { toast.error(t('projects.addItem.qtyRequired')); return }

    const newItem: ProjectItem =
      addItemType === 'product'
        ? { type: 'product', productId: addItemEntityId, quantity: addItemQty, unitPrice: addItemPrice, notes: addItemNotes, fromInventory: addItemFromInventory }
        : addItemType === 'assembly'
        ? { type: 'assembly', assemblyId: addItemEntityId, quantity: addItemQty, unitPrice: addItemPrice, notes: addItemNotes, fromInventory: addItemFromInventory }
        : { type: 'part', partId: addItemEntityId, quantity: addItemQty, unitPrice: addItemPrice, notes: addItemNotes, fromInventory: addItemFromInventory }

    const entityName =
      addItemType === 'product' ? (products ?? []).find(p => p.id === addItemEntityId)?.name
      : addItemType === 'assembly' ? mergedAssemblies.find(a => a.id === addItemEntityId)?.name
      : mergedParts.find(p => p.id === addItemEntityId)?.name

    const newItemKey = getProjectItemKey(newItem)
    const existingItem = consolidatedProjectItems.find(i => getProjectItemKey(i) === newItemKey)

    let activityMsg: string
    if (existingItem) {
      const oldQty = existingItem.quantity
      const nextQty = oldQty + addItemQty
      const genLabel = addItemType === 'product' ? 'produsului' : addItemType === 'assembly' ? 'ansamblului' : 'piesei'
      activityMsg = `Cantitatea ${genLabel} „${entityName ?? addItemEntityId}" a fost actualizată de la ${oldQty} la ${nextQty}.`
    } else {
      const nomLabel = addItemType === 'product' ? 'Produsul' : addItemType === 'assembly' ? 'Ansamblul' : 'Piesa'
      activityMsg = `${nomLabel} „${entityName ?? addItemEntityId}" a fost adăugat${addItemType === 'part' ? 'ă' : ''} în proiect.`
    }

    const nextItems = consolidateProjectItems([...(project.items ?? []), newItem])

    setAddItemSaving(true)
    try {
      await saveItemsUpdate(nextItems, activityMsg)
      toast.success(t('projects.detail.addItemSuccess'))
      setAddItemOpen(false)
      resetAddForm()
    } catch {
      toast.error(t('projects.detail.addItemError'))
    } finally {
      setAddItemSaving(false)
    }
  }

  // ─── Remove item ──────────────────────────────────────────────────────────

  async function handleRemoveItem() {
    if (!project || removeItemIdx === null) return
    const item = consolidatedProjectItems[removeItemIdx]
    if (!item) return

    const kind = item.type ?? (item.assemblyId ? 'assembly' : item.partId ? 'part' : 'product')
    const entityName =
      kind === 'product' ? (products ?? []).find(p => p.id === item.productId)?.name
      : kind === 'assembly' ? mergedAssemblies.find(a => a.id === item.assemblyId)?.name
      : mergedParts.find(p => p.id === item.partId)?.name

    const qty = item.quantity
    const typeLabel = kind === 'product' ? 'Produsul' : kind === 'assembly' ? 'Ansamblul' : 'Piesa'
    const activityMsg = qty > 1
      ? `${typeLabel} „${entityName ?? 'element'}", în cantitate de ${qty} bucăți, a fost eliminat${kind === 'part' ? 'ă' : ''} din proiect.`
      : `${typeLabel} „${entityName ?? 'element'}" a fost eliminat${kind === 'part' ? 'ă' : ''} din proiect.`

    const key = getProjectItemKey(item)
    const nextItems = consolidateProjectItems(project.items.filter(i => getProjectItemKey(i) !== key))

    setRemoveSaving(true)
    try {
      await saveItemsUpdate(nextItems, activityMsg)
      toast.success(t('projects.detail.removeItemSuccess'))
      setRemoveItemIdx(null)
    } catch {
      toast.error(t('projects.detail.removeItemError'))
    } finally {
      setRemoveSaving(false)
    }
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
      toast.success(t('projects.detail.cardsPdfSuccess'))
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('projects.detail.pdfError'))
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
      toast.success(t('projects.detail.laserPdfSuccess'))
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('projects.detail.pdfError'))
    } finally {
      setExportingProjectLaser(false)
    }
  }

  async function handleExportPurchasePdf() {
    if (!project) return
    setExportingPurchasePdf(true)
    try {
      const blob = await projectsApi.exportPurchaseListPdf(project.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `achizitii-${project.code}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(t('projects.detail.purchasePdfSuccess'))
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('projects.detail.pdfError'))
    } finally {
      setExportingPurchasePdf(false)
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
                  <p className="text-xs text-muted-foreground">{t('projects.detail.projectPriceEur')}</p>
                  <p className="font-medium">{total.toLocaleString()} EUR</p>
                  {project.finalPrice == null && installationCost > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t('projects.detail.inclInstallation', { cost: installationCost.toLocaleString() })}
                    </p>
                  )}
                  {project.finalPrice == null && (
                    <p className="text-xs text-muted-foreground italic">{t('projects.detail.calculatedFromProducts')}</p>
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

      {/* Project Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>{t('projects.detail.projectItems')}</CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { resetAddForm(); setAddItemOpen(true) }}
              >
                <Plus className="mr-1 h-3 w-3" />
                {t('projects.detail.addItem')}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={handleExportProjectLaserPdf}
              disabled={exportingProjectLaser}
            >
              <Zap className="mr-1 h-3 w-3" />
              {exportingProjectLaser ? t('projects.detail.generating') : t('projects.detail.laserCut')}
            </Button>
            {purchaseParts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-700 hover:bg-orange-50 focus-visible:ring-0 focus-visible:ring-offset-0"
                onClick={() => setPurchaseListOpen(true)}
              >
                <ShoppingCart className="mr-1 h-3 w-3" />
                {t('projects.detail.purchases', { count: String(purchaseParts.length) })}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {consolidatedProjectItems.length === 0 ? (
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
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {consolidatedProjectItems.map((item, idx) => {
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
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {(kind === 'product' ? item.productId : kind === 'assembly' ? item.assemblyId : item.partId) && (
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-foreground transition-colors p-1"
                              title={t('projects.prod.viewDetails')}
                              onClick={() => {
                                const eid = kind === 'product' ? item.productId : kind === 'assembly' ? item.assemblyId : item.partId
                                if (eid) openEntityDetails(kind, eid)
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {canEdit && (
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-destructive transition-colors p-1"
                              title={t('projects.detail.removeFromProject')}
                              onClick={() => setRemoveItemIdx(idx)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </TableCell>
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
            {t('projects.detail.productionSteps')}{totalStepCount > 0 && ` (${totalStepCount})`}
          </CardTitle>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCardsPdf}
              disabled={exportingCards}
            >
              <FileDown className="mr-1 h-3 w-3" />
              {exportingCards ? t('projects.detail.generating') : t('projects.detail.exportCards')}
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
          {(() => {
            const isCardDone = (card: ProductionCardVM) => {
              if (card.ownSteps.length > 0) {
                return card.ownSteps.every((s) => stepsCompleted.has(ownStepKey(card, s)))
              }
              return stepsCompleted.has(`manual:${card.itemType}:${card.entityId}`)
            }
            const activeCards = productionCards.filter((c) => !isCardDone(c))
            const doneCards = productionCards.filter((c) => isCardDone(c))

            if (productionCards.length === 0) {
              return (
                <p className="text-center text-muted-foreground py-4">
                  {t('projects.detail.noProdItems')}
                </p>
              )
            }

            return (
              <>
                {activeCards.map((card) => (
                  <ProductionCardComponent
                    key={`${card.itemType}:${card.entityId}`}
                    card={card}
                    stepsCompleted={stepsCompleted}
                    onToggle={toggleStep}
                    onViewDetails={openEntityDetails}
                  />
                ))}
                {activeCards.length === 0 && doneCards.length > 0 && (
                  <p className="text-center text-muted-foreground py-2 text-sm">
                    {t('projects.detail.allDone')}
                  </p>
                )}
                {doneCards.length > 0 && (
                  <Collapsible open={doneCardsOpen} onOpenChange={setDoneCardsOpen}>
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md border border-dashed px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
                      >
                        <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${doneCardsOpen ? 'rotate-90' : ''}`} />
                        <span className="font-medium">{t('projects.detail.doneItems', { count: String(doneCards.length) })}</span>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 mt-3">
                      {doneCards.map((card) => (
                        <ProductionCardComponent
                          key={`${card.itemType}:${card.entityId}`}
                          card={card}
                          stepsCompleted={stepsCompleted}
                          onToggle={toggleStep}
                          onViewDetails={openEntityDetails}
                        />
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </>
            )
          })()}
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
          {activityError ? (
            <div className="flex flex-col items-center gap-2 py-6 text-sm text-muted-foreground">
              <p>{activityError}</p>
              <Button variant="outline" size="sm" onClick={() => loadActivity(activityPage)}>
                {t('projects.detail.retryActivity')}
              </Button>
            </div>
          ) : activityLoading && activityItems.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('projects.detail.loadingActivity')}
            </div>
          ) : activityItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">
              {t('projects.detail.noActivity')}
            </p>
          ) : (
            <>
              <div className={`space-y-3 ${activityLoading ? 'opacity-60 pointer-events-none' : ''}`}>
                {activityItems.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <p>{entry.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.user} - {formatActivityTimestamp(entry.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t gap-4">
                <p className="text-sm text-muted-foreground shrink-0">
                  {activityTotal === 0 ? '0' : `${(activityPage - 1) * 10 + 1}–${Math.min(activityPage * 10, activityTotal)}`} {t('projects.detail.paginationOf')} {activityTotal}
                </p>
                {activityTotalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={activityPage === 1 || activityLoading}
                      onClick={() => setActivityPage(p => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: activityTotalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === activityTotalPages || Math.abs(p - activityPage) <= 1)
                      .reduce<(number | '…')[]>((acc, p, i, arr) => {
                        if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('…')
                        acc.push(p)
                        return acc
                      }, [])
                      .map((item, i) =>
                        item === '…' ? (
                          <span key={`ell-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
                        ) : (
                          <Button
                            key={item}
                            variant={activityPage === item ? 'default' : 'outline'}
                            size="icon"
                            className="h-8 w-8 text-sm"
                            disabled={activityLoading}
                            onClick={() => setActivityPage(item as number)}
                          >
                            {item}
                          </Button>
                        )
                      )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={activityPage === activityTotalPages || activityLoading}
                      onClick={() => setActivityPage(p => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("common.edit")}: {project.name}</DialogTitle>
            <DialogDescription>{t('projects.detail.editDesc')}</DialogDescription>
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
              <Label htmlFor="edit-finish">{t('projects.detail.finishDateLabel')}</Label>
              <Input
                id="edit-finish"
                type="date"
                value={editForm.finishDate}
                onChange={(e) => setEditForm({ ...editForm, finishDate: e.target.value })}
              />
            </div>
            {showPrices && (
              <div className="space-y-2">
                <Label htmlFor="edit-final-price">{t('projects.detail.projectPriceEur')}</Label>
                <Input
                  id="edit-final-price"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder={t('projects.detail.projectPricePlaceholder')}
                  value={editForm.finalPrice}
                  onChange={(e) => setEditForm({ ...editForm, finalPrice: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">{t('projects.detail.projectPriceHint')}</p>
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

      {/* Add Item Dialog */}
      <Dialog open={addItemOpen} onOpenChange={(open) => { if (!open) { setAddItemOpen(false); resetAddForm() } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('projects.addItem.title')}</DialogTitle>
            <DialogDescription>{t('projects.addItem.desc')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Entity type */}
            <div className="space-y-2">
              <Label>{t('projects.addItem.itemType')}</Label>
              <div className="flex gap-2">
                {(['product', 'assembly', 'part'] as const).map(itemKind => (
                  <button
                    key={itemKind}
                    type="button"
                    onClick={() => { setAddItemType(itemKind); setAddItemEntityId(''); setAddItemPrice(0) }}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors
                      ${addItemType === itemKind
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted border-border text-foreground'}`}
                  >
                    {itemKind === 'product' ? <Package className="h-3.5 w-3.5" /> : itemKind === 'assembly' ? <Boxes className="h-3.5 w-3.5" /> : <Wrench className="h-3.5 w-3.5" />}
                    {itemKind === 'product' ? t('projects.addItem.typeProduct') : itemKind === 'assembly' ? t('projects.addItem.typeAssembly') : t('projects.addItem.typePart')}
                  </button>
                ))}
              </div>
            </div>

            {/* Entity picker */}
            <div className="space-y-2">
              <Label>
                {addItemType === 'product' ? t('projects.addItem.typeProduct') : addItemType === 'assembly' ? t('projects.addItem.typeAssembly') : t('projects.addItem.typePart')} *
              </Label>
              <Popover open={addItemComboOpen} onOpenChange={setAddItemComboOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                    {addItemEntityId
                      ? (() => {
                          const e = addItemType === 'product'
                            ? (products ?? []).find(p => p.id === addItemEntityId)
                            : addItemType === 'assembly'
                            ? mergedAssemblies.find(a => a.id === addItemEntityId)
                            : mergedParts.find(p => p.id === addItemEntityId)
                          return e ? `${e.name}${e.code ? ` — ${e.code}` : ''}` : addItemEntityId
                        })()
                      : addItemType === 'product' ? t('projects.addItem.selectProduct') : addItemType === 'assembly' ? t('projects.addItem.selectAssembly') : t('projects.addItem.selectPart')}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder={t('projects.addItem.searchPlaceholder')} />
                    <CommandList>
                      <CommandEmpty>{t('projects.addItem.noResults')}</CommandEmpty>
                      <CommandGroup>
                        {(addItemType === 'product'
                          ? (products ?? []).map(p => ({ id: p.id, name: p.name, code: p.code, price: p.basePrice ?? 0 }))
                          : addItemType === 'assembly'
                          ? mergedAssemblies.map(a => ({ id: a.id, name: a.name, code: a.code, price: 0 }))
                          : mergedParts.map(p => ({ id: p.id, name: p.name, code: p.code, price: p.basePrice ?? 0 }))
                        ).map(e => (
                          <CommandItem
                            key={e.id}
                            value={`${e.name} ${e.code ?? ''}`}
                            onSelect={() => {
                              setAddItemEntityId(e.id)
                              if (showPrices) setAddItemPrice(e.price)
                              else setAddItemPrice(e.price)
                              setAddItemComboOpen(false)
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${addItemEntityId === e.id ? 'opacity-100' : 'opacity-0'}`} />
                            <span>{e.name}</span>
                            {e.code && <span className="ml-2 text-xs text-muted-foreground font-mono">{e.code}</span>}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Quantity + price row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-qty">{t('projects.addItem.qty')}</Label>
                <Input
                  id="add-qty"
                  type="number"
                  min={1}
                  value={addItemQty}
                  onChange={e => setAddItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
              {showPrices && (
                <div className="space-y-2">
                  <Label htmlFor="add-price">{t('projects.addItem.unitPrice')}</Label>
                  <Input
                    id="add-price"
                    type="number"
                    min={0}
                    step={0.01}
                    value={addItemPrice}
                    onChange={e => setAddItemPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>

            {/* From inventory */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="add-inventory"
                checked={addItemFromInventory}
                onCheckedChange={v => setAddItemFromInventory(!!v)}
              />
              <Label htmlFor="add-inventory" className="font-normal cursor-pointer">
                {t("projects.fromInventory")}
              </Label>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="add-notes">{t("common.notes")} ({t("common.optional")})</Label>
              <Textarea
                id="add-notes"
                value={addItemNotes}
                onChange={e => setAddItemNotes(e.target.value)}
                rows={2}
                placeholder={t('projects.addItem.notesPlaceholder')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddItemOpen(false); resetAddForm() }}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleAddItem} disabled={addItemSaving}>
              {addItemSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              {t('projects.addItem.add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase Parts Dialog */}
      <Dialog open={purchaseListOpen} onOpenChange={setPurchaseListOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-orange-600" />
              {t('projects.purchase.title')}
            </DialogTitle>
            <DialogDescription>
              {purchaseParts.length === 0
                ? t('projects.purchase.descNone')
                : t('projects.purchase.desc', { count: String(purchaseParts.length) })}
            </DialogDescription>
          </DialogHeader>
          {purchaseParts.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('projects.purchase.colPart')}</TableHead>
                  <TableHead className="text-right">{t('projects.purchase.colQty')}</TableHead>
                  <TableHead>{t('projects.purchase.colSupplier')}</TableHead>
                  <TableHead>{t('projects.purchase.colPrice')}</TableHead>
                  <TableHead>{t('projects.purchase.colContact')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseParts.map(({ id, name, code, quantity, part }) => (
                  <TableRow key={id}>
                    <TableCell>
                      <a
                        href={`/materials/parts?view=${id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 group"
                        title={t('projects.purchase.openPart')}
                      >
                        <span className="font-medium group-hover:underline">{name}</span>
                        <ExternalLink className="h-3 w-3 text-blue-500 shrink-0 opacity-60 group-hover:opacity-100" />
                      </a>
                      {code && <div className="text-xs font-mono text-muted-foreground mt-0.5">{code}</div>}
                    </TableCell>
                    <TableCell className="text-right">{quantity}</TableCell>
                    <TableCell className="text-muted-foreground">{part.purchaseSupplier || '—'}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {part.purchasePrice != null
                        ? `${part.purchasePrice} ${part.purchaseCurrency}${part.purchaseVatIncluded ? ` cu TVA ${part.purchaseVatRate}%` : ' fără TVA'}`
                        : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{part.purchaseAgentContact || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={handleExportPurchasePdf}
              disabled={purchaseParts.length === 0 || exportingPurchasePdf}
            >
              <Download className="mr-2 h-4 w-4" />
              {exportingPurchasePdf ? t('projects.purchase.exporting') : t('projects.purchase.exportPdf')}
            </Button>
            <Button variant="outline" onClick={() => setPurchaseListOpen(false)}>
              {t('projects.purchase.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Item AlertDialog */}
      <AlertDialog open={removeItemIdx !== null} onOpenChange={open => { if (!open) setRemoveItemIdx(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('projects.removeItem.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {removeItemIdx !== null && (() => {
                const item = consolidatedProjectItems[removeItemIdx]
                if (!item) return null
                const kind = item.type ?? (item.assemblyId ? 'assembly' : item.partId ? 'part' : 'product')
                const name =
                  kind === 'product' ? (products ?? []).find(p => p.id === item.productId)?.name
                  : kind === 'assembly' ? mergedAssemblies.find(a => a.id === item.assemblyId)?.name
                  : mergedParts.find(p => p.id === item.partId)?.name
                return (
                  <>
                    {t('projects.removeItem.confirmSingular', { name: name ?? 'elementul' })}
                    <br /><br />
                    {t('projects.removeItem.note')}
                  </>
                )
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeSaving}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveItem}
              disabled={removeSaving}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {removeSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('projects.removeItem.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Entity Details Dialog */}
      <Dialog open={viewTarget !== null} onOpenChange={(open) => !open && closeEntityDetails()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewLoading ? (
            <>
              <DialogHeader>
                <DialogTitle>{t('projects.detail.loading')}</DialogTitle>
              </DialogHeader>
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            </>
          ) : viewTarget?.type === 'product' && viewedProduct ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {viewedProduct.name}
                  {viewedProduct.code && (
                    <Badge variant="outline" className="text-xs font-mono font-normal">{viewedProduct.code}</Badge>
                  )}
                </DialogTitle>
                <DialogDescription>{viewedProduct.category || t('projects.entity.productFallback')}</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="info">
                <TabsList className="mb-2">
                  <TabsTrigger value="info">{t('projects.entity.infoTab')}</TabsTrigger>
                  <TabsTrigger value="structure">
                    {t('projects.entity.structureTab')}{((viewedProduct.productAssemblies?.length ?? viewedProduct.assemblyIds?.length ?? 0) + (viewedProduct.productParts?.length ?? viewedProduct.partIds?.length ?? 0)) > 0 && ` (${(viewedProduct.productAssemblies?.length ?? viewedProduct.assemblyIds?.length ?? 0) + (viewedProduct.productParts?.length ?? viewedProduct.partIds?.length ?? 0)})`}
                  </TabsTrigger>
                  <TabsTrigger value="steps">
                    {t('projects.entity.stepsTab')}{(viewedProduct.productionSteps?.length ?? viewedProduct.assemblySteps?.length ?? 0) > 0 && ` (${viewedProduct.productionSteps?.length ?? viewedProduct.assemblySteps?.length ?? 0})`}
                  </TabsTrigger>
                  <TabsTrigger value="files">{t('projects.entity.filesTab')}</TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{t('projects.entity.category')}</p>
                      <p>{viewedProduct.category || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{t('projects.entity.basePrice')}</p>
                      <p className="font-mono">{viewedProduct.basePrice?.toFixed(2) ?? "—"} EUR</p>
                    </div>
                  </div>
                  {viewedProduct.notes && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{t('common.notes')}</p>
                      <p>{viewedProduct.notes}</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="structure" className="space-y-4">
                  {(() => {
                    const asmEntries = viewedProduct.productAssemblies?.length
                      ? viewedProduct.productAssemblies
                      : (viewedProduct.assemblyIds ?? []).map(aid => ({ assemblyId: aid, quantity: 1 }))
                    const partEntries = viewedProduct.productParts?.length
                      ? viewedProduct.productParts
                      : (viewedProduct.partIds ?? []).map(pid => ({ partId: pid, quantity: 1 }))
                    return (
                      <>
                        {asmEntries.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">{t('projects.entity.assemblies')}</p>
                            <div className="rounded-md border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>{t('projects.entity.colAssembly')}</TableHead>
                                    <TableHead className="text-right">{t('projects.entity.colQty')}</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {asmEntries.map((ae, idx) => {
                                    const asm = mergedAssemblies.find(a => a.id === ae.assemblyId)
                                    return (
                                      <TableRow key={idx}>
                                        <TableCell>
                                          <p className="font-medium">{asm?.name ?? ae.assemblyId}</p>
                                          {asm?.code && <p className="text-xs text-muted-foreground font-mono">{asm.code}</p>}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{ae.quantity}</TableCell>
                                      </TableRow>
                                    )
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                        {partEntries.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">{t('projects.entity.directParts')}</p>
                            <div className="rounded-md border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>{t('projects.entity.colPart')}</TableHead>
                                    <TableHead className="text-right">{t('projects.entity.colQty')}</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {partEntries.map((pe, idx) => {
                                    const prt = mergedParts.find(p => p.id === pe.partId)
                                    return (
                                      <TableRow key={idx}>
                                        <TableCell>
                                          <p className="font-medium">{prt?.name ?? pe.partId}</p>
                                          {prt?.code && <p className="text-xs text-muted-foreground font-mono">{prt.code}</p>}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{pe.quantity}</TableCell>
                                      </TableRow>
                                    )
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                        {asmEntries.length === 0 && partEntries.length === 0 && (
                          <p className="text-sm text-muted-foreground">{t('projects.entity.noComponents')}</p>
                        )}
                      </>
                    )
                  })()}
                </TabsContent>
                <TabsContent value="steps">
                  {!(viewedProduct.productionSteps?.length ?? viewedProduct.assemblySteps?.length) ? (
                    <p className="text-sm text-muted-foreground">{t('projects.entity.noProductionSteps')}</p>
                  ) : (
                    <div className="space-y-2">
                      {(viewedProduct.productionSteps ?? viewedProduct.assemblySteps ?? []).map((step, idx) => (
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
                <TabsContent value="files">
                  <EntityFileUploads entityType="product" entityId={viewedProduct.id} readonly />
                </TabsContent>
              </Tabs>
            </>
          ) : viewTarget?.type === 'assembly' && viewedAssembly ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  {viewedAssembly.name}
                  <Badge variant="outline" className="text-xs font-mono font-normal">{viewedAssembly.code}</Badge>
                </DialogTitle>
                <DialogDescription>
                  {viewedAssembly.compositionType === "from_parts"
                    ? t('projects.entity.asmFromParts')
                    : viewedAssembly.compositionType === "from_assemblies"
                    ? t('projects.entity.asmFromSubasms')
                    : t('projects.entity.asmIndependent')}
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="info">
                <TabsList className="mb-2">
                  <TabsTrigger value="info">{t('projects.entity.infoTab')}</TabsTrigger>
                  <TabsTrigger value="parts">
                    {t('projects.entity.colPart')}{viewedAssembly.parts?.length > 0 && ` (${viewedAssembly.parts.length})`}
                  </TabsTrigger>
                  <TabsTrigger value="steps">
                    {t('projects.entity.stepsTab')}{viewedAssembly.productionSteps?.length > 0 && ` (${viewedAssembly.productionSteps.length})`}
                  </TabsTrigger>
                  <TabsTrigger value="files">{t('projects.entity.filesTab')}</TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{t('projects.entity.compositionType')}</p>
                      <p>
                        {viewedAssembly.compositionType === "from_parts"
                          ? t('projects.entity.compoFromParts')
                          : viewedAssembly.compositionType === "from_assemblies"
                          ? t('projects.entity.compoFromAssemblies')
                          : t('projects.entity.compoIndependent')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{t('projects.entity.physicalLocation')}</p>
                      <p>{viewedAssembly.physicalLocation || "—"}</p>
                    </div>
                    {viewedAssembly.weldingDrawingLocation && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-0.5">{t('projects.entity.weldingDrawing')}</p>
                        <p style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{viewedAssembly.weldingDrawingLocation}</p>
                      </div>
                    )}
                    {viewedAssembly.technicalDrawingLocation && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-0.5">{t('projects.entity.technicalDrawing')}</p>
                        <p style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{viewedAssembly.technicalDrawingLocation}</p>
                      </div>
                    )}
                    {viewedAssembly.cadLocation && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-0.5">{t('projects.entity.cadLocation')}</p>
                        <p style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{viewedAssembly.cadLocation}</p>
                      </div>
                    )}
                  </div>
                  {viewedAssembly.notes && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{t('common.notes')}</p>
                      <p className="text-sm">{viewedAssembly.notes}</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="parts" className="space-y-4">
                  {viewedAssembly.parts?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t('projects.entity.noParts')}</p>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('projects.entity.colPart')}</TableHead>
                            <TableHead>{t('projects.entity.colLaser')}</TableHead>
                            <TableHead className="text-right">{t('projects.entity.colQty')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {viewedAssembly.parts.map((fp, idx) => {
                            const prt = mergedParts.find(p => p.id === fp.partId)
                            return (
                              <TableRow key={idx}>
                                <TableCell>
                                  <p className="font-medium">{prt?.name ?? fp.partId}</p>
                                  {prt?.code && <p className="text-xs text-muted-foreground font-mono">{prt.code}</p>}
                                </TableCell>
                                <TableCell>
                                  {prt?.requiresLaserCutting && (
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
                  {(viewedAssembly.childAssemblies?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">{t('projects.entity.subAssemblies')}</p>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('projects.entity.colAssembly')}</TableHead>
                              <TableHead>{t('common.code')}</TableHead>
                              <TableHead className="text-right">{t('projects.entity.colQty')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {viewedAssembly.childAssemblies.map((ca, idx) => {
                              const child = mergedAssemblies.find(a => a.id === ca.assemblyId)
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
                <TabsContent value="steps">
                  {viewedAssembly.productionSteps?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t('projects.entity.noProductionSteps')}</p>
                  ) : (
                    <div className="space-y-2">
                      {viewedAssembly.productionSteps.map((step, idx) => (
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
                <TabsContent value="files">
                  <EntityFileUploads entityType="assembly" entityId={viewedAssembly.id} readonly />
                </TabsContent>
              </Tabs>
            </>
          ) : viewTarget?.type === 'part' && viewedPart ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  {viewedPart.name}
                  {viewedPart.code && (
                    <Badge variant="outline" className="text-xs font-mono font-normal">{viewedPart.code}</Badge>
                  )}
                  {viewedPart.requiresLaserCutting && (
                    <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                      <Zap className="mr-1 h-3 w-3" />Laser
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>{viewedPart.category || t('projects.entity.partFallback')}</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="info">
                <TabsList className="mb-2">
                  <TabsTrigger value="info">{t('projects.entity.infoTab')}</TabsTrigger>
                  <TabsTrigger value="steps">
                    {t('projects.entity.stepsTab')}{viewedPart.productionSteps?.length > 0 && ` (${viewedPart.productionSteps.length})`}
                  </TabsTrigger>
                  <TabsTrigger value="files">{t('projects.entity.filesTab')}</TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{t('projects.entity.stockQty')}</p>
                      <p className="font-mono">{viewedPart.quantity ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{t('projects.entity.minStock')}</p>
                      <p className="font-mono">{viewedPart.minimumStock ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{t('projects.entity.physicalLocation')}</p>
                      <p style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{viewedPart.physicalLocation || viewedPart.location || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{t('projects.entity.drawingLocation')}</p>
                      <p style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{viewedPart.drawingLocation || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{t('projects.entity.laserCut')}</p>
                      <p>{viewedPart.requiresLaserCutting ? t('projects.entity.yes') : t('projects.entity.no')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{t('projects.entity.category')}</p>
                      <p>{viewedPart.category || "—"}</p>
                    </div>
                    {viewedPart.weldingDrawingLocation && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-0.5">{t('projects.entity.weldingDrawing')}</p>
                        <p style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{viewedPart.weldingDrawingLocation}</p>
                      </div>
                    )}
                    {viewedPart.bendingDrawingLocation && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-0.5">{t('projects.entity.bendingDrawing')}</p>
                        <p style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{viewedPart.bendingDrawingLocation}</p>
                      </div>
                    )}
                    {viewedPart.cadLocation && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-0.5">{t('projects.entity.cadLocation')}</p>
                        <p style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{viewedPart.cadLocation}</p>
                      </div>
                    )}
                    {viewedPart.technicalDrawingLocation && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-0.5">{t('projects.entity.technicalDrawing')}</p>
                        <p style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{viewedPart.technicalDrawingLocation}</p>
                      </div>
                    )}
                  </div>
                  {viewedPart.notes && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{t('common.notes')}</p>
                      <p>{viewedPart.notes}</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="steps">
                  {!viewedPart.productionSteps?.length ? (
                    <p className="text-sm text-muted-foreground">{t('projects.entity.noProductionSteps')}</p>
                  ) : (
                    <div className="space-y-2">
                      {viewedPart.productionSteps.map((step, idx) => (
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
                <TabsContent value="files">
                  <EntityFileUploads entityType="part" entityId={viewedPart.id} readonly />
                </TabsContent>
              </Tabs>
            </>
          ) : null}
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
