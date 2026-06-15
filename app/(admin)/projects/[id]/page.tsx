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
} from "lucide-react"
import { toast } from "sonner"
import { projectsApi, productsApi, getCurrentUser } from "@/lib/api"
import { canViewPrices } from "@/lib/permissions"
import type { AppRole } from "@/lib/permissions"

// ─── Hierarchy types ──────────────────────────────────────────────────────────

type PartNode = {
  id: string
  name: string
  requiresLaserCutting: boolean
  steps: AssemblyStep[]
}

type AssemblyNode = {
  id: string
  name: string
  code: string
  steps: AssemblyStep[]
  parts: PartNode[]
}

type ProductNode = {
  productId: string
  productName: string
  productCode: string
  productSteps: AssemblyStep[]
  assemblies: AssemblyNode[]
  directParts: PartNode[]
}

function buildProductHierarchy(
  product: Product,
  safeAssemblies: Assembly[],
  safeParts: Part[],
): ProductNode {
  const productSteps: AssemblyStep[] = product.productionSteps ?? product.assemblySteps ?? []

  const assemblies: AssemblyNode[] = (product.assemblyIds ?? [])
    .map((id) => safeAssemblies.find((a) => a.id === id))
    .filter((a): a is Assembly => !!a)
    .map((asm): AssemblyNode => ({
      id: asm.id,
      name: asm.name,
      code: asm.code,
      steps: asm.productionSteps ?? [],
      parts: (asm.parts ?? [])
        .map((ap): PartNode | null => {
          const part = safeParts.find((p) => p.id === ap.partId)
          if (!part) return null
          return {
            id: part.id,
            name: part.name,
            requiresLaserCutting: part.requiresLaserCutting,
            steps: part.productionSteps ?? [],
          }
        })
        .filter((p): p is PartNode => p !== null),
    }))

  const directParts: PartNode[] = (product.partIds ?? [])
    .map((id) => safeParts.find((p) => p.id === id))
    .filter((p): p is Part => p !== undefined)
    .map((part): PartNode => ({
      id: part.id,
      name: part.name,
      requiresLaserCutting: part.requiresLaserCutting,
      steps: part.productionSteps ?? [],
    }))

  return {
    productId: product.id,
    productName: product.name,
    productCode: product.code,
    productSteps,
    assemblies,
    directParts,
  }
}

function countNodeSteps(node: ProductNode): number {
  return (
    node.productSteps.length +
    node.assemblies.reduce(
      (s, a) => s + a.steps.length + a.parts.reduce((sp, p) => sp + p.steps.length, 0),
      0,
    ) +
    node.directParts.reduce((s, p) => s + p.steps.length, 0)
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type StepToggle = (stepId: string) => void

function StepRow({ step, index, completed, onToggle }: { step: AssemblyStep; index: number; completed: boolean; onToggle: StepToggle }) {
  return (
    <div className={`flex items-start gap-3 py-2 border-b last:border-0 ${completed ? "opacity-60" : ""}`}>
      <Checkbox
        checked={completed}
        onCheckedChange={() => onToggle(step.id)}
        className="mt-0.5 shrink-0"
      />
      <span className="text-xs text-muted-foreground font-mono w-5 shrink-0 mt-0.5">{index + 1}.</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-medium ${completed ? "line-through" : ""}`}>{step.name}</span>
          <Badge variant="secondary" className="text-xs">{step.type}</Badge>
        </div>
        {step.description && <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>}
      </div>
    </div>
  )
}

function ProductStepsBlock({ node, stepsCompleted, onToggle }: { node: ProductNode; stepsCompleted: Set<string>; onToggle: StepToggle }) {
  const hasAnySteps = countNodeSteps(node) > 0
  if (!hasAnySteps) return null

  return (
    <div className="rounded-lg border">
      {/* Product header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-t-lg border-b">
        <Package className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-bold">{node.productName}</span>
        <span className="text-xs font-mono text-muted-foreground">{node.productCode}</span>
        <Badge variant="secondary" className="text-xs ml-auto">{countNodeSteps(node)} pași</Badge>
      </div>

      <div className="px-4 space-y-1 py-2">
        {/* Product-level steps */}
        {node.productSteps.length > 0 && (
          <div className="py-1">
            {node.productSteps.map((step, idx) => (
              <StepRow key={step.id} step={step} index={idx} completed={stepsCompleted.has(step.id)} onToggle={onToggle} />
            ))}
          </div>
        )}

        {/* Assemblies */}
        {node.assemblies.map((asmNode) => {
          const asmHasSteps = asmNode.steps.length > 0 || asmNode.parts.some((p) => p.steps.length > 0)
          if (!asmHasSteps) return null
          return (
            <div key={asmNode.id} className="ml-2 rounded-md border my-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-t-md border-b">
                <Boxes className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-semibold">{asmNode.name}</span>
                <span className="text-xs font-mono text-muted-foreground">{asmNode.code}</span>
              </div>
              <div className="px-3">
                {asmNode.steps.length > 0 && (
                  <div className="py-1">
                    {asmNode.steps.map((step, idx) => (
                      <StepRow key={step.id} step={step} index={idx} completed={stepsCompleted.has(step.id)} onToggle={onToggle} />
                    ))}
                  </div>
                )}
                {asmNode.parts.filter((p) => p.steps.length > 0).map((pNode) => (
                  <div key={pNode.id} className="ml-2 rounded border my-1">
                    <div className="flex items-center gap-2 px-2 py-1 bg-muted/20 rounded-t border-b">
                      <Wrench className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">{pNode.name}</span>
                      {pNode.requiresLaserCutting && <Zap className="h-3 w-3 text-blue-500" />}
                    </div>
                    <div className="px-2 py-1">
                      {pNode.steps.map((step, idx) => (
                        <StepRow key={step.id} step={step} index={idx} completed={stepsCompleted.has(step.id)} onToggle={onToggle} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Direct parts */}
        {node.directParts.filter((p) => p.steps.length > 0).map((pNode) => (
          <div key={pNode.id} className="ml-2 rounded-md border my-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-t-md border-b">
              <Wrench className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-semibold">{pNode.name}</span>
              <Badge variant="outline" className="text-xs">Piesă directă</Badge>
              {pNode.requiresLaserCutting && <Zap className="h-3 w-3 text-blue-500" />}
            </div>
            <div className="px-3 py-1">
              {pNode.steps.map((step, idx) => (
                <StepRow key={step.id} step={step} index={idx} completed={stepsCompleted.has(step.id)} onToggle={onToggle} />
              ))}
            </div>
          </div>
        ))}
      </div>
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

  const showPrices = canViewPrices((getCurrentUser()?.role ?? "employee") as AppRole)

  const [issueDialogOpen, setIssueDialogOpen] = useState(false)
  const [finishDialogOpen, setFinishDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", companyId: "" as string | null, startDate: "", deadline: "", finishDate: "" })
  const [newIssueDescription, setNewIssueDescription] = useState("")
  const [exportingSteps, setExportingSteps] = useState(false)
  const [exportingLaserFor, setExportingLaserFor] = useState<string | null>(null)
  const [paidAmountInput, setPaidAmountInput] = useState<string>("")
  const [stepsCompleted, setStepsCompleted] = useState<Set<string>>(new Set())

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
  const total = subtotal + installationCost
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
    await updateProject({ ...project, ...editForm, warrantyExpiration })
    toast.success(t("common.savedSuccessfully"))
    setEditDialogOpen(false)
  }
  const openIssues = project.issues.filter((i) => !i.solved)
  const isPersonal = project.companyId === null

  // Build hierarchical production steps for all products in this project
  const productNodes: ProductNode[] = project.items
    .map((item) => products?.find((p) => p.id === item.productId))
    .filter((p): p is Product => !!p)
    .map((product) => buildProductHierarchy(product, assemblies ?? [], parts ?? []))

  const totalStepCount = productNodes.reduce((s, n) => s + countNodeSteps(n), 0)
  const completedStepCount = stepsCompleted.size
  const progressPct = totalStepCount === 0 ? 0 : Math.round((completedStepCount / totalStepCount) * 100)

  const toggleStep = async (stepId: string) => {
    const next = new Set(stepsCompleted)
    if (next.has(stepId)) next.delete(stepId)
    else next.add(stepId)
    setStepsCompleted(next)
    await updateProject({
      ...project,
      stepsCompleted: Array.from(next),
      stepsTotal: totalStepCount,
    })
  }

  const getProductName = (productId: string) =>
    products.find((p) => p.id === productId)?.name || productId

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

  async function handleExportStepsPdf() {
    if (!project) return
    setExportingSteps(true)
    try {
      const blob = await projectsApi.exportProductionStepsPdf(project.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `pasi-productie-${project.code}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("PDF generat cu succes")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Eroare la generare PDF")
    } finally {
      setExportingSteps(false)
    }
  }

  async function handleExportLaserPdf(productId: string, productCode: string) {
    setExportingLaserFor(productId)
    try {
      const blob = await productsApi.laserCuttingPdf(productId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `laser-print-${productCode}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("PDF laser generat cu succes")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Eroare la generare PDF")
    } finally {
      setExportingLaserFor(null)
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
          <Button variant="outline" onClick={handleOpenEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            {t("common.edit")}
          </Button>
          {!["done", "warranty", "maintenance", "cancelled"].includes(project.status) && (
            <Button variant="default" onClick={() => setFinishDialogOpen(true)}>
              <Flag className="mr-2 h-4 w-4" />
              {t("projects.finishProject")}
            </Button>
          )}
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
                  <p className="text-xs text-muted-foreground">{t("common.total")}</p>
                  <p className="font-medium">{total.toLocaleString()} EUR</p>
                  {installationCost > 0 && (
                    <p className="text-xs text-muted-foreground">
                      incl. instalare {installationCost.toLocaleString()} EUR
                    </p>
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
                  {!issue.solved && (
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
        <CardHeader>
          <CardTitle>{t("products")}</CardTitle>
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
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.items.map((item, idx) => {
                  const prod = products?.find((p) => p.id === item.productId)
                  return (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{prod?.name || item.productId}</TableCell>
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
                        {prod?.hasLaserCutting && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            disabled={exportingLaserFor === item.productId}
                            onClick={() => handleExportLaserPdf(item.productId, prod.code)}
                          >
                            <Zap className="mr-1 h-3 w-3" />
                            {exportingLaserFor === item.productId ? "..." : "Export Print"}
                          </Button>
                        )}
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
            Pași de producție{totalStepCount > 0 && ` (${totalStepCount})`}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={handleExportStepsPdf}
            disabled={exportingSteps}
          >
            <FileDown className="mr-1 h-3 w-3" />
            {exportingSteps ? "Se generează..." : "Export lista de steps"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {totalStepCount > 0 && (
            <div className="flex items-center gap-3 pb-2 border-b">
              <Progress value={progressPct} className="flex-1 h-2" />
              <span className="text-sm font-medium shrink-0">{completedStepCount}/{totalStepCount} ({progressPct}%)</span>
            </div>
          )}
          {totalStepCount === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nu există pași de producție configurați pentru produsele din acest proiect.
            </p>
          ) : (
            productNodes.map((node) => (
              <ProductStepsBlock key={node.productId} node={node} stepsCompleted={stepsCompleted} onToggle={toggleStep} />
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
