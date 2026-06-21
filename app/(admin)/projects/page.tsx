"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
import type { ProjectStatus, ProjectItem, Assembly, Part } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Search, MoreHorizontal, Eye, AlertCircle, User, ChevronsUpDown, Check, ChevronLeft, ChevronRight, X, Package, Boxes, Wrench, Trash2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { toast } from "sonner"
import { getCurrentUser } from "@/lib/api"
import { canViewPrices, canEditProject } from "@/lib/permissions"
import type { AppRole } from "@/lib/permissions"

export default function ProjectsPage() {
  const router = useRouter()
  const { projects, companies, quotes, products, assemblies, parts, inventory, addProject, deleteProject, reloadProjects } = useAppData()
  const { t } = useLocale()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>("all")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showPrices, setShowPrices] = useState(true)
  const [canEdit, setCanEdit] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    const role = (user?.role ?? "employee") as AppRole
    setShowPrices(canViewPrices(role))
    setCanEdit(canEditProject(role))
  }, [])

  // Auto-refresh: on mount, on window focus, and every 60 s
  useEffect(() => {
    reloadProjects()
    const onFocus = () => reloadProjects()
    window.addEventListener("focus", onFocus)
    const interval = setInterval(() => reloadProjects(), 60_000)
    return () => {
      window.removeEventListener("focus", onFocus)
      clearInterval(interval)
    }
  }, [reloadProjects])

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [isPersonal, setIsPersonal] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>("")
  type WizardItem =
    | { type: "product";  productId: string;  quantity: number; fromInventory: boolean }
    | { type: "assembly"; assemblyId: string; quantity: number }
    | { type: "part";     partId: string;     quantity: number }

  const [selectedItems, setSelectedItems] = useState<WizardItem[]>([])
  const [entityTab, setEntityTab] = useState<"product" | "assembly" | "part">("product")
  const [entitySearch, setEntitySearch] = useState("")
  const [projectName, setProjectName] = useState("")
  const [projectStartDate, setProjectStartDate] = useState(new Date().toISOString().split("T")[0])
  const [projectDeadline, setProjectDeadline] = useState("")
  const [companyComboOpen, setCompanyComboOpen] = useState(false)
  const [quoteComboOpen, setQuoteComboOpen] = useState(false)

  const safeProjects = projects ?? []
  const safeCompanies = companies ?? []
  const safeQuotes = quotes ?? []
  const safeProducts = products ?? []
  const safeAssemblies = assemblies ?? []
  const safeParts = parts ?? []
  const safeInventory = inventory ?? []

  // Filter projects — newest first
  const filtered = safeProjects
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || p.status === statusFilter
      const matchesType =
        projectTypeFilter === "all" ||
        (projectTypeFilter === "personal" && p.companyId === null) ||
        (projectTypeFilter === "company" && p.companyId !== null)
      return matchesSearch && matchesStatus && matchesType
    })
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return null
    return safeCompanies.find((c) => c.id === companyId)?.name || companyId
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

  const getProgress = (project: typeof safeProjects[0]) => {
    if (project.stepsTotal && project.stepsTotal > 0) {
      return Math.round(((project.stepsCompleted?.length ?? 0) / project.stepsTotal) * 100)
    }
    if (!project.checklist || project.checklist.length === 0) return 0
    return Math.round((project.checklist.filter((c) => c.done).length / project.checklist.length) * 100)
  }

  const getOpenIssuesCount = (project: typeof safeProjects[0]) => {
    if (!project.issues) return 0
    return project.issues.filter((i) => !i.solved).length
  }

  const getTotal = (project: typeof safeProjects[0]) => {
    const itemsTotal = (project.items || []).reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    return itemsTotal + (project.installationCost || 0)
  }

  // Get available quotes for wizard (filter by selected company or all for personal)
  const availableQuotes = isPersonal
    ? safeQuotes.filter((q) => q.companyId === null)
    : safeQuotes.filter((q) => q.companyId === selectedCompanyId)

  // Check if product is in inventory
  const getInventoryQty = (productId: string) => {
    const inv = safeInventory.find((i) => i.type === "product" && i.itemId === productId)
    return inv?.quantity || 0
  }

  // ── Entity item helpers ────────────────────────────────────────────────────

  const isItemSelected = (type: "product" | "assembly" | "part", id: string) =>
    selectedItems.some((it) =>
      it.type === type &&
      (type === "product" ? (it as { type: "product"; productId: string }).productId === id :
       type === "assembly" ? (it as { type: "assembly"; assemblyId: string }).assemblyId === id :
       (it as { type: "part"; partId: string }).partId === id)
    )

  const toggleItem = (type: "product" | "assembly" | "part", id: string) => {
    setSelectedItems((prev) => {
      const already = isItemSelected(type, id)
      if (already) {
        return prev.filter((it) => !(
          it.type === type &&
          (type === "product" ? (it as { type: "product"; productId: string }).productId === id :
           type === "assembly" ? (it as { type: "assembly"; assemblyId: string }).assemblyId === id :
           (it as { type: "part"; partId: string }).partId === id)
        ))
      }
      if (type === "product")  return [...prev, { type: "product",  productId: id,  quantity: 1, fromInventory: false }]
      if (type === "assembly") return [...prev, { type: "assembly", assemblyId: id, quantity: 1 }]
      return [...prev, { type: "part", partId: id, quantity: 1 }]
    })
  }

  const updateItemQty = (type: "product" | "assembly" | "part", id: string, quantity: number) => {
    setSelectedItems((prev) =>
      prev.map((it) => {
        if (it.type !== type) return it
        if (type === "product" && (it as { type: "product"; productId: string }).productId === id) return { ...it, quantity }
        if (type === "assembly" && (it as { type: "assembly"; assemblyId: string }).assemblyId === id) return { ...it, quantity }
        if (type === "part" && (it as { type: "part"; partId: string }).partId === id) return { ...it, quantity }
        return it
      })
    )
  }

  const updateItemFromInventory = (productId: string, fromInventory: boolean) => {
    setSelectedItems((prev) =>
      prev.map((it) =>
        it.type === "product" && (it as { type: "product"; productId: string }).productId === productId
          ? { ...it, fromInventory }
          : it
      )
    )
  }

  const removeItem = (type: "product" | "assembly" | "part", id: string) => toggleItem(type, id)

  const getItemQty = (type: "product" | "assembly" | "part", id: string): number => {
    const found = selectedItems.find((it) =>
      it.type === type &&
      (type === "product" ? (it as { type: "product"; productId: string }).productId === id :
       type === "assembly" ? (it as { type: "assembly"; assemblyId: string }).assemblyId === id :
       (it as { type: "part"; partId: string }).partId === id)
    )
    return found?.quantity ?? 1
  }

  // ── Delete handler ─────────────────────────────────────────────────────────

  const handleDeleteProject = async () => {
    if (!projectToDelete) return
    try {
      await deleteProject(projectToDelete.id)
      await reloadProjects()
      toast.success(`Proiectul „${projectToDelete.name}" a fost șters`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Eroare la ștergere")
    } finally {
      setProjectToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  // ── Wizard helpers ─────────────────────────────────────────────────────────

  const resetWizard = () => {
    setWizardStep(1)
    setIsPersonal(false)
    setSelectedCompanyId("")
    setSelectedQuoteId("")
    setSelectedItems([])
    setEntityTab("product")
    setEntitySearch("")
    setProjectName("")
    setProjectStartDate(new Date().toISOString().split("T")[0])
    setProjectDeadline("")
    setCompanyComboOpen(false)
    setQuoteComboOpen(false)
  }

  const handleNextStep = () => {
    if (wizardStep === 2) {
      const quote = safeQuotes.find((q) => q.id === selectedQuoteId)
      if (quote && selectedQuoteId !== "none" && quote.items?.length > 0) {
        setSelectedItems(
          quote.items.map((item) => ({
            type: "product" as const,
            productId: item.productId,
            fromInventory: false,
            quantity: item.quantity || 1,
          }))
        )
      }
    }
    setWizardStep((s) => s + 1)
  }

  const handleCreateProject = async () => {
    try {
      const selectedQuote = safeQuotes.find((q) => q.id === selectedQuoteId)
      const today = new Date().toISOString().split("T")[0]

      const projectItems = selectedItems.map((si) => {
        if (si.type === "assembly") {
          return { type: "assembly", assemblyId: si.assemblyId, quantity: si.quantity, unitPrice: 0, notes: "", fromInventory: false }
        }
        if (si.type === "part") {
          return { type: "part", partId: si.partId, quantity: si.quantity, unitPrice: 0, notes: "", fromInventory: false }
        }
        const product = safeProducts.find((p) => p.id === si.productId)
        const quoteItem = selectedQuote?.items?.find((item) => item.productId === si.productId)
        return {
          type: "product",
          productId: si.productId,
          quantity: si.quantity,
          unitPrice: quoteItem?.unitPrice ?? product?.basePrice ?? 0,
          notes: quoteItem?.notes ?? "",
          fromInventory: si.fromInventory,
        }
      })

      const projectPayload = {
        code: `PRJ-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
        name: projectName || (selectedQuote?.name ? `Project: ${selectedQuote.name}` : `Project ${safeProjects.length + 1}`),
        companyId: isPersonal ? null : selectedCompanyId || null,
        quoteId: selectedQuoteId && selectedQuoteId !== "none" ? selectedQuoteId : null,
        status: "draft" as const,
        startDate: projectStartDate || today,
        deadline: projectDeadline || today,
        finishDate: null,
        warrantyExpiration: null,
        installationCost: (selectedQuoteId && selectedQuoteId !== "none") ? (selectedQuote?.installation || 0) : 0,
        items: projectItems as ProjectItem[],
        checklist: [],
        issues: [],
        stepsCompleted: [],
        stepsTotal: 0,
        activity: [{ id: `a${Date.now()}`, action: "Project created", user: "Admin", timestamp: new Date().toISOString() }],
      }

      const createdProject = await addProject(projectPayload)
      toast.success(t("common.savedSuccessfully"))
      setWizardOpen(false)
      resetWizard()
      router.push(`/projects/${createdProject.id}`)
    } catch (error) {
      console.error(error)
      toast.error("Project could not be created")
    }
  }

  const canProceed = () => {
    if (wizardStep === 1) return isPersonal || selectedCompanyId !== ""
    if (wizardStep === 2) return true
    if (wizardStep === 3) return selectedItems.length > 0
    if (wizardStep === 4) return projectName.trim() !== "" && projectDeadline !== ""
    return false
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("projects.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("projects.description")}</p>
        </div>
        <Button onClick={() => setWizardOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("projects.generateProject")}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`${t("common.search")}...`}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("common.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="draft">{t("status.draft")}</SelectItem>
                <SelectItem value="in-progress">{t("status.inProgress")}</SelectItem>
                <SelectItem value="in-installation">{t("status.inInstallation")}</SelectItem>
                <SelectItem value="done">{t("status.done")}</SelectItem>
                <SelectItem value="warranty">{t("status.warranty")}</SelectItem>
                <SelectItem value="maintenance">{t("status.maintenance")}</SelectItem>
                <SelectItem value="cancelled">{t("status.cancelled")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={projectTypeFilter} onValueChange={(v) => { setProjectTypeFilter(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder={t("projects.projectType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="company">{t("projects.companyProjects")}</SelectItem>
                <SelectItem value="personal">{t("projects.personalProjects")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.code")}</TableHead>
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("common.company")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("common.progress")}</TableHead>
                <TableHead>{t("projects.issues")}</TableHead>
                <TableHead>{t("projects.startDate")}</TableHead>
                <TableHead>{t("projects.deadline")}</TableHead>
                {showPrices && <TableHead>{t("projects.remaining")}</TableHead>}
                <TableHead className="w-[80px]">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    {t("projects.noProjectsFound")}
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((project) => {
                  const progress = getProgress(project)
                  const openIssues = getOpenIssuesCount(project)
                  const total = getTotal(project)
                  const remaining = Math.max(0, total - (project.paidAmount || 0))
                  const companyName = getCompanyName(project.companyId)
                  return (
                    <TableRow key={project.id} className="cursor-pointer" onClick={() => router.push(`/projects/${project.id}`)}>
                      <TableCell className="font-mono text-sm">{project.code}</TableCell>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>
                        {companyName ? (
                          companyName
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <User className="h-3 w-3" />
                            {t("projects.personal")}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(project.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="w-20 h-2" />
                          <span className="text-xs text-muted-foreground">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {openIssues > 0 ? (
                          <div className="flex items-center gap-1 text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            <span>{openIssues}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{project.startDate || "-"}</TableCell>
                      <TableCell>{project.deadline || "-"}</TableCell>
                      {showPrices && <TableCell className="font-medium">{remaining.toLocaleString()} EUR</TableCell>}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/projects/${project.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                {t("common.viewDetails")}
                              </Link>
                            </DropdownMenuItem>
                            {canEdit && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => {
                                    setProjectToDelete({ id: project.id, name: project.name })
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Șterge proiect
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t mt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
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

      {/* Generate Project Wizard */}
      <Dialog open={wizardOpen} onOpenChange={(open) => { setWizardOpen(open); if (!open) resetWizard() }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("projects.generateProject")}</DialogTitle>
            <DialogDescription>
              {t("projects.wizardStep")} {wizardStep} / 4
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Select Company or Personal */}
          {wizardStep === 1 && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base">{t("projects.personalProject")}</Label>
                  <p className="text-sm text-muted-foreground">{t("projects.personalProjectDesc")}</p>
                </div>
                <Switch checked={isPersonal} onCheckedChange={(checked) => { setIsPersonal(checked); if (checked) setSelectedCompanyId("") }} />
              </div>

              {!isPersonal && (
                <div className="space-y-2">
                  <Label>{t("projects.selectCompany")}</Label>
                  <Popover open={companyComboOpen} onOpenChange={setCompanyComboOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                        {selectedCompanyId
                          ? safeCompanies.find((c) => c.id === selectedCompanyId)?.name
                          : "Caută client după nume..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Caută client după nume..." />
                        <CommandList>
                          <CommandEmpty>Niciun client găsit.</CommandEmpty>
                          <CommandGroup>
                            {safeCompanies.map((company) => (
                              <CommandItem
                                key={company.id}
                                value={company.name}
                                onSelect={() => {
                                  setSelectedCompanyId(company.id)
                                  setCompanyComboOpen(false)
                                }}
                              >
                                <Check className={`mr-2 h-4 w-4 ${selectedCompanyId === company.id ? "opacity-100" : "opacity-0"}`} />
                                {company.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Quote (optional) */}
          {wizardStep === 2 && (
            <div className="space-y-4 py-4">
              <Label>{t("projects.selectQuote")} ({t("common.optional")})</Label>
              <Popover open={quoteComboOpen} onOpenChange={setQuoteComboOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                    {selectedQuoteId === "none"
                      ? t("projects.noQuote")
                      : selectedQuoteId
                        ? (() => {
                            const q = safeQuotes.find((q) => q.id === selectedQuoteId)
                            if (!q) return t("projects.selectQuotePlaceholder")
                            const company = q.companyId ? safeCompanies.find((c) => c.id === q.companyId)?.name : null
                            return company ? `${company} — ${q.name}` : q.name
                          })()
                        : t("projects.selectQuotePlaceholder")}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[480px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Caută după ofertă sau client..." />
                    <CommandList>
                      <CommandEmpty>Nicio ofertă găsită.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="none"
                          onSelect={() => { setSelectedQuoteId("none"); setQuoteComboOpen(false) }}
                        >
                          <Check className={`mr-2 h-4 w-4 ${selectedQuoteId === "none" ? "opacity-100" : "opacity-0"}`} />
                          {t("projects.noQuote")}
                        </CommandItem>
                        {availableQuotes.map((quote) => {
                          const company = quote.companyId ? safeCompanies.find((c) => c.id === quote.companyId)?.name : null
                          const label = company ? `${company} — ${quote.name}` : quote.name
                          return (
                            <CommandItem
                              key={quote.id}
                              value={label}
                              onSelect={() => { setSelectedQuoteId(quote.id); setQuoteComboOpen(false) }}
                            >
                              <Check className={`mr-2 h-4 w-4 ${selectedQuoteId === quote.id ? "opacity-100" : "opacity-0"}`} />
                              {label}
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-sm text-muted-foreground">{t("projects.quoteOptionalNote")}</p>
            </div>
          )}

          {/* Step 3: Select Products / Assemblies / Parts */}
          {wizardStep === 3 && (() => {
            const selectedQuote = selectedQuoteId && selectedQuoteId !== "none"
              ? safeQuotes.find((q) => q.id === selectedQuoteId)
              : null

            const q = entitySearch.toLowerCase()
            const productsToShow = (selectedQuote
              ? safeProducts.filter((p) => selectedQuote.items.some((item) => item.productId === p.id))
              : safeProducts
            ).filter((p) => !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
            const assembliesToShow = safeAssemblies.filter((a) => !q || a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q))
            const partsToShow = safeParts.filter((p) => !q || p.name.toLowerCase().includes(q) || (p.code ?? "").toLowerCase().includes(q))

            const TAB_CFG = [
              { key: "product"  as const, label: "Produse",    Icon: Package, count: selectedItems.filter((i) => i.type === "product").length },
              { key: "assembly" as const, label: "Ansambluri", Icon: Boxes,   count: selectedItems.filter((i) => i.type === "assembly").length },
              { key: "part"     as const, label: "Piese",      Icon: Wrench,  count: selectedItems.filter((i) => i.type === "part").length },
            ]

            return (
              <div className="flex flex-col gap-0 py-2" style={{ maxHeight: 480 }}>

                {/* ── Sticky segmented control ── */}
                <div className="sticky top-0 z-10 bg-background pb-2 border-b">
                  <div className="flex gap-1 p-1 bg-muted rounded-lg">
                    {TAB_CFG.map(({ key, label, Icon, count }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setEntityTab(key); setEntitySearch("") }}
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors
                          ${entityTab === key
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                        {count > 0 && (
                          <span className="ml-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 leading-none">
                            {count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2">
                    <Input
                      placeholder="Caută..."
                      value={entitySearch}
                      onChange={(e) => setEntitySearch(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {/* ── Entity list ── */}
                <div className="overflow-y-auto flex-1 space-y-1.5 pt-2 pr-1" style={{ minHeight: 0 }}>
                  {entityTab === "product" && (
                    productsToShow.length === 0
                      ? <p className="text-sm text-muted-foreground py-4 text-center">Niciun produs găsit.</p>
                      : productsToShow.map((product) => {
                          const sel = isItemSelected("product", product.id)
                          const invQty = getInventoryQty(product.id)
                          const quoteItem = selectedQuote?.items.find((i) => i.productId === product.id)
                          return (
                            <div key={product.id} className="border rounded-lg p-3 space-y-2">
                              <div className="flex items-center gap-3">
                                <Checkbox checked={sel} onCheckedChange={() => toggleItem("product", product.id)} />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{product.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {product.code}{showPrices && ` — ${(quoteItem?.unitPrice ?? product.basePrice).toLocaleString()} EUR`}
                                  </p>
                                </div>
                                {invQty > 0 && <Badge variant="outline" className="text-xs shrink-0">{t("projects.inStock")}: {invQty}</Badge>}
                              </div>
                              {sel && (
                                <div className="flex items-center gap-4 pl-7">
                                  <div className="flex items-center gap-2">
                                    <Label className="text-xs">{t("common.quantity")}:</Label>
                                    <Input type="number" min={1} value={getItemQty("product", product.id)}
                                      onChange={(e) => updateItemQty("product", product.id, parseInt(e.target.value) || 1)}
                                      className="w-20 h-7 text-sm" />
                                  </div>
                                  {invQty > 0 && (
                                    <div className="flex items-center gap-1.5">
                                      <Checkbox id={`inv-${product.id}`}
                                        checked={(selectedItems.find((it) => it.type === "product" && (it as { type: "product"; productId: string; fromInventory: boolean }).productId === product.id) as { type: "product"; productId: string; fromInventory: boolean } | undefined)?.fromInventory ?? false}
                                        onCheckedChange={(v) => updateItemFromInventory(product.id, !!v)} />
                                      <Label htmlFor={`inv-${product.id}`} className="text-xs">{t("projects.fromInventory")}</Label>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })
                  )}

                  {entityTab === "assembly" && (
                    assembliesToShow.length === 0
                      ? <p className="text-sm text-muted-foreground py-4 text-center">Niciun ansamblu găsit.</p>
                      : assembliesToShow.map((asm) => {
                          const sel = isItemSelected("assembly", asm.id)
                          return (
                            <div key={asm.id} className="border rounded-lg p-3 space-y-2">
                              <div className="flex items-center gap-3">
                                <Checkbox checked={sel} onCheckedChange={() => toggleItem("assembly", asm.id)} />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{asm.name}</p>
                                  <p className="text-xs text-muted-foreground font-mono">{asm.code}</p>
                                </div>
                              </div>
                              {sel && (
                                <div className="flex items-center gap-2 pl-7">
                                  <Label className="text-xs">{t("common.quantity")}:</Label>
                                  <Input type="number" min={1} value={getItemQty("assembly", asm.id)}
                                    onChange={(e) => updateItemQty("assembly", asm.id, parseInt(e.target.value) || 1)}
                                    className="w-20 h-7 text-sm" />
                                </div>
                              )}
                            </div>
                          )
                        })
                  )}

                  {entityTab === "part" && (
                    partsToShow.length === 0
                      ? <p className="text-sm text-muted-foreground py-4 text-center">Nicio piesă găsită.</p>
                      : partsToShow.map((part) => {
                          const sel = isItemSelected("part", part.id)
                          return (
                            <div key={part.id} className="border rounded-lg p-3 space-y-2">
                              <div className="flex items-center gap-3">
                                <Checkbox checked={sel} onCheckedChange={() => toggleItem("part", part.id)} />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{part.name}</p>
                                  <p className="text-xs text-muted-foreground font-mono">{part.code}</p>
                                </div>
                              </div>
                              {sel && (
                                <div className="flex items-center gap-2 pl-7">
                                  <Label className="text-xs">{t("common.quantity")}:</Label>
                                  <Input type="number" min={1} value={getItemQty("part", part.id)}
                                    onChange={(e) => updateItemQty("part", part.id, parseInt(e.target.value) || 1)}
                                    className="w-20 h-7 text-sm" />
                                </div>
                              )}
                            </div>
                          )
                        })
                  )}
                </div>

                {/* ── Selected summary ── */}
                {selectedItems.length > 0 && (
                  <div className="border-t pt-2 mt-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                      Selectate ({selectedItems.length}):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedItems.map((it, idx) => {
                        let label = ""
                        let badgeClass = ""
                        let type: "product" | "assembly" | "part" = it.type
                        let id = ""
                        if (it.type === "product") {
                          label = safeProducts.find((p) => p.id === it.productId)?.name ?? it.productId
                          badgeClass = "bg-blue-100 text-blue-800 border-blue-200"
                          id = it.productId
                        } else if (it.type === "assembly") {
                          label = safeAssemblies.find((a) => a.id === it.assemblyId)?.name ?? it.assemblyId
                          badgeClass = "bg-purple-100 text-purple-800 border-purple-200"
                          id = it.assemblyId
                        } else {
                          label = safeParts.find((p) => p.id === it.partId)?.name ?? it.partId
                          badgeClass = "bg-orange-100 text-orange-800 border-orange-200"
                          id = it.partId
                        }
                        return (
                          <span key={idx} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${badgeClass}`}>
                            {label} ×{it.quantity}
                            <button type="button" onClick={() => removeItem(type, id)} className="ml-0.5 hover:opacity-70">
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          {/* Step 4: Confirm */}
          {wizardStep === 4 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("projects.projectName")}</Label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder={t("projects.projectNamePlaceholder")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("projects.startDate")}</Label>
                  <Input
                    type="date"
                    value={projectStartDate}
                    onChange={(e) => setProjectStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("projects.deadline")}</Label>
                  <Input
                    type="date"
                    value={projectDeadline}
                    onChange={(e) => setProjectDeadline(e.target.value)}
                  />
                </div>
              </div>
              <div className="border rounded-lg p-4 space-y-2 bg-muted/50">
                <p className="font-medium">{t("projects.summary")}</p>
                <p className="text-sm">
                  {t("common.type")}: {isPersonal ? t("projects.personal") : getCompanyName(selectedCompanyId)}
                </p>
                <p className="text-sm">
                  {t("quotes.title")}: {selectedQuoteId && selectedQuoteId !== "none" ? safeQuotes.find((q) => q.id === selectedQuoteId)?.name : "-"}
                </p>
                <p className="text-sm">
                  Iteme: {selectedItems.length} ({selectedItems.filter((i) => i.type === "product").length} produse, {selectedItems.filter((i) => i.type === "assembly").length} ansambluri, {selectedItems.filter((i) => i.type === "part").length} piese)
                </p>
                {showPrices && selectedQuoteId && selectedQuoteId !== "none" && (() => {
                  const q = safeQuotes.find((q) => q.id === selectedQuoteId)
                  return q?.installation ? (
                    <p className="text-sm">Instalare: {q.installation.toLocaleString()} EUR</p>
                  ) : null
                })()}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {wizardStep > 1 && (
              <Button variant="outline" onClick={() => setWizardStep((s) => s - 1)}>
                {t("common.back")}
              </Button>
            )}
            {wizardStep < 4 ? (
              <Button onClick={handleNextStep} disabled={!canProceed()}>
                {t("common.next")}
              </Button>
            ) : (
              <Button onClick={handleCreateProject} disabled={!canProceed()}>
                {t("projects.createProject")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
