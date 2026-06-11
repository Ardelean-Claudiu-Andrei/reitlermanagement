"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
import type { ProjectStatus, ProjectItem } from "@/lib/types"
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
import { Plus, Search, MoreHorizontal, Eye, AlertCircle, User, ChevronsUpDown, Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
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
  const [companyComboOpen, setCompanyComboOpen] = useState(false)
  const [quoteComboOpen, setQuoteComboOpen] = useState(false)

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
    setCompanyComboOpen(false)
    setQuoteComboOpen(false)
  }

  // Advance wizard step, pre-filling products from quote on step 2→3
  const handleNextStep = () => {
    if (wizardStep === 2) {
      const quote = safeQuotes.find((q) => q.id === selectedQuoteId)
      if (quote && selectedQuoteId !== "none" && quote.items?.length > 0) {
        setSelectedProducts(
          quote.items.map((item) => ({
            productId: item.productId,
            fromInventory: false,
            quantity: item.quantity || 1,
          }))
        )
      }
    }
    setWizardStep((s) => s + 1)
  }

  
  // Create project
  const handleCreateProject = async () => {
  try {
    const selectedQuote = safeQuotes.find((q) => q.id === selectedQuoteId)
    const today = new Date().toISOString().split("T")[0]

    const projectItems: ProjectItem[] = selectedProducts.map((sp) => {
      const product = safeProducts.find((p) => p.id === sp.productId)
      const quoteItem = selectedQuote?.items?.find((item) => item.productId === sp.productId)
      return {
        productId: sp.productId,
        quantity: sp.quantity,
        unitPrice: quoteItem?.unitPrice ?? product?.basePrice ?? 0,
        notes: quoteItem?.notes ?? "",
        fromInventory: sp.fromInventory,
      }
    })

    const projectPayload = {
      code: `PRJ-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
      name: projectName || (selectedQuote?.name ? `Project: ${selectedQuote.name}` : `Project ${safeProjects.length + 1}`),
      companyId: isPersonal ? null : selectedCompanyId || null,
      quoteId: selectedQuoteId && selectedQuoteId !== "none" ? selectedQuoteId : null,
      status: "draft" as const,
      startDate: today,
      deadline: projectDeadline || today,
      finishDate: null,
      warrantyExpiration: null,
      installationCost: (selectedQuoteId && selectedQuoteId !== "none") ? (selectedQuote?.installation || 0) : 0,
      items: projectItems,
      checklist: [],
      issues: [],
      activity: [
        {
          id: `a${Date.now()}`,
          action: "Project created",
          user: "Admin",
          timestamp: new Date().toISOString(),
        },
      ],
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

          {/* Step 3: Select Products */}
          {wizardStep === 3 && (() => {
            const selectedQuote = selectedQuoteId && selectedQuoteId !== "none"
              ? safeQuotes.find((q) => q.id === selectedQuoteId)
              : null
            // If quote selected, show only quote products; otherwise all products
            const productsToShow = selectedQuote
              ? safeProducts.filter((p) => selectedQuote.items.some((item) => item.productId === p.id))
              : safeProducts
            return (
              <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <Label>{t("projects.selectProducts")}</Label>
                  {selectedQuote && (
                    <Badge variant="outline" className="text-xs">
                      Din oferta: {selectedQuote.name}
                    </Badge>
                  )}
                </div>
                <div className="space-y-3">
                  {productsToShow.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Niciun produs disponibil.</p>
                  ) : productsToShow.map((product) => {
                    const isSelected = selectedProducts.some((p) => p.productId === product.id)
                    const selection = selectedProducts.find((p) => p.productId === product.id)
                    const invQty = getInventoryQty(product.id)
                    const quoteItem = selectedQuote?.items.find((item) => item.productId === product.id)
                    return (
                      <div key={product.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleProduct(product.id)}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.code} — {(quoteItem?.unitPrice ?? product.basePrice).toLocaleString()} EUR
                            </p>
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
                {selectedQuoteId && selectedQuoteId !== "none" && (() => {
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
