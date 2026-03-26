"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
import type { ProjectStatus, Project, ProjectItem } from "@/lib/types"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Search, MoreHorizontal, Eye, AlertCircle, User } from "lucide-react"
import { toast } from "sonner"

export default function ProjectsPage() {
  const router = useRouter()
  const { projects, companies, quotes, products, inventory, addProject } = useAppData()
  const { t } = useLocale()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>("all")

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [isPersonal, setIsPersonal] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>("")
  const [selectedProducts, setSelectedProducts] = useState<{ productId: string; fromInventory: boolean; quantity: number }[]>([])
  const [projectName, setProjectName] = useState("")
  const [projectDeadline, setProjectDeadline] = useState("")

  const safeProjects = projects ?? []
  const safeCompanies = companies ?? []
  const safeQuotes = quotes ?? []
  const safeProducts = products ?? []
  const safeInventory = inventory ?? []

  // Filter projects
  const filtered = safeProjects.filter((p) => {
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

  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return null
    return safeCompanies.find((c) => c.id === companyId)?.name || companyId
  }

  const getStatusBadge = (status: ProjectStatus) => {
    const config: Record<ProjectStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: "secondary", label: t("status.draft") },
      "in-progress": { variant: "default", label: t("status.inProgress") },
      done: { variant: "outline", label: t("status.done") },
      cancelled: { variant: "destructive", label: t("status.cancelled") },
    }
    const c = config[status] || { variant: "secondary", label: status }
    return <Badge variant={c.variant}>{c.label}</Badge>
  }

  const getProgress = (project: typeof safeProjects[0]) => {
    if (!project.checklist || project.checklist.length === 0) return 0
    const done = project.checklist.filter((c) => c.done).length
    return Math.round((done / project.checklist.length) * 100)
  }

  const getOpenIssuesCount = (project: typeof safeProjects[0]) => {
    if (!project.issues) return 0
    return project.issues.filter((i) => !i.solved).length
  }

  const getTotal = (project: typeof safeProjects[0]) => {
    if (!project.items) return 0
    return project.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
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

  // Handle product selection toggle
  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.productId === productId)
      if (exists) {
        return prev.filter((p) => p.productId !== productId)
      }
      return [...prev, { productId, fromInventory: false, quantity: 1 }]
    })
  }

  // Update product settings
  const updateProductSelection = (productId: string, field: "fromInventory" | "quantity", value: boolean | number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.productId === productId ? { ...p, [field]: value } : p))
    )
  }

  // Reset wizard
  const resetWizard = () => {
    setWizardStep(1)
    setIsPersonal(false)
    setSelectedCompanyId("")
    setSelectedQuoteId("")
    setSelectedProducts([])
    setProjectName("")
    setProjectDeadline("")
  }

  // Create project
  const handleCreateProject = () => {
    const selectedQuote = safeQuotes.find((q) => q.id === selectedQuoteId)
    const today = new Date().toISOString().split("T")[0]

    const projectItems: ProjectItem[] = selectedProducts.map((sp) => {
      const product = safeProducts.find((p) => p.id === sp.productId)
      return {
        productId: sp.productId,
        quantity: sp.quantity,
        unitPrice: product?.basePrice || 0,
        notes: "",
        fromInventory: sp.fromInventory,
      }
    })

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      code: `PRJ-${String(safeProjects.length + 1).padStart(3, "0")}`,
      name: projectName || (selectedQuote?.name ? `Project: ${selectedQuote.name}` : `Project ${safeProjects.length + 1}`),
      companyId: isPersonal ? null : selectedCompanyId || null,
      quoteId: selectedQuoteId || null,
      status: "draft",
      startDate: today,
      deadline: projectDeadline || today,
      finishDate: null,
      warrantyExpiration: null,
      items: projectItems,
      checklist: [],
      issues: [],
      activity: [
        {
          id: `act-${Date.now()}`,
          action: "Project created",
          user: "Admin",
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: today,
      updatedAt: today,
    }

    addProject(newProject)
    toast.success(t("common.savedSuccessfully"))
    setWizardOpen(false)
    resetWizard()
    router.push(`/projects/${newProject.id}`)
  }

  // Check if can proceed to next step
  const canProceed = () => {
    if (wizardStep === 1) return isPersonal || selectedCompanyId !== ""
    if (wizardStep === 2) return true // Quote is optional
    if (wizardStep === 3) return selectedProducts.length > 0
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
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("common.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="draft">{t("status.draft")}</SelectItem>
                <SelectItem value="in-progress">{t("status.inProgress")}</SelectItem>
                <SelectItem value="done">{t("status.done")}</SelectItem>
                <SelectItem value="cancelled">{t("status.cancelled")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={projectTypeFilter} onValueChange={setProjectTypeFilter}>
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
                <TableHead>{t("projects.deadline")}</TableHead>
                <TableHead>{t("common.total")}</TableHead>
                <TableHead className="w-[80px]">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    {t("projects.noProjectsFound")}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((project) => {
                  const progress = getProgress(project)
                  const openIssues = getOpenIssuesCount(project)
                  const total = getTotal(project)
                  const companyName = getCompanyName(project.companyId)
                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-mono text-sm">{project.code}</TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/projects/${project.id}`} className="hover:underline">
                          {project.name}
                        </Link>
                      </TableCell>
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
                      <TableCell>{project.deadline}</TableCell>
                      <TableCell className="font-medium">{total.toLocaleString()} EUR</TableCell>
                      <TableCell>
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
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
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
                  <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("projects.selectCompanyPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {safeCompanies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Quote (optional) */}
          {wizardStep === 2 && (
            <div className="space-y-4 py-4">
              <Label>{t("projects.selectQuote")} ({t("common.optional")})</Label>
              <Select value={selectedQuoteId} onValueChange={setSelectedQuoteId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("projects.selectQuotePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("projects.noQuote")}</SelectItem>
                  {availableQuotes.map((quote) => (
                    <SelectItem key={quote.id} value={quote.id}>
                      {quote.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">{t("projects.quoteOptionalNote")}</p>
            </div>
          )}

          {/* Step 3: Select Products */}
          {wizardStep === 3 && (
            <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
              <Label>{t("projects.selectProducts")}</Label>
              <div className="space-y-3">
                {safeProducts.map((product) => {
                  const isSelected = selectedProducts.some((p) => p.productId === product.id)
                  const selection = selectedProducts.find((p) => p.productId === product.id)
                  const invQty = getInventoryQty(product.id)
                  return (
                    <div key={product.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleProduct(product.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.code} - {product.basePrice.toLocaleString()} EUR</p>
                        </div>
                        {invQty > 0 && (
                          <Badge variant="outline">{t("projects.inStock")}: {invQty}</Badge>
                        )}
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-4 pl-7">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">{t("common.quantity")}:</Label>
                            <Input
                              type="number"
                              min={1}
                              value={selection?.quantity || 1}
                              onChange={(e) => updateProductSelection(product.id, "quantity", parseInt(e.target.value) || 1)}
                              className="w-20 h-8"
                            />
                          </div>
                          {invQty > 0 && (
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`inv-${product.id}`}
                                checked={selection?.fromInventory || false}
                                onCheckedChange={(checked) => updateProductSelection(product.id, "fromInventory", !!checked)}
                              />
                              <Label htmlFor={`inv-${product.id}`} className="text-sm">{t("projects.fromInventory")}</Label>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

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
              <div className="space-y-2">
                <Label>{t("projects.deadline")}</Label>
                <Input
                  type="date"
                  value={projectDeadline}
                  onChange={(e) => setProjectDeadline(e.target.value)}
                />
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
                  {t("products")}: {selectedProducts.length} {t("common.items")}
                </p>
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
              <Button onClick={() => setWizardStep((s) => s + 1)} disabled={!canProceed()}>
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
