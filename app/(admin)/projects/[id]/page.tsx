"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
import type { ProjectStatus, ProjectIssue, ChecklistItem } from "@/lib/types"
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
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Building2,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Shield,
  Package,
  User,
  Flag,
} from "lucide-react"
import { toast } from "sonner"

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const {
    projects,
    companies,
    products,
    quotes,
    updateProjectStatus,
    finishProject,
    toggleChecklistItem,
    addChecklistItem,
    addProjectIssue,
    resolveProjectIssue,
  } = useAppData()
  const { t } = useLocale()

  const [checklistDialogOpen, setChecklistDialogOpen] = useState(false)
  const [issueDialogOpen, setIssueDialogOpen] = useState(false)
  const [finishDialogOpen, setFinishDialogOpen] = useState(false)
  const [newChecklistTitle, setNewChecklistTitle] = useState("")
  const [newIssueDescription, setNewIssueDescription] = useState("")

  const project = projects.find((p) => p.id === id)

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
  const total = project.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const progress = project.checklist.length > 0
    ? Math.round((project.checklist.filter((c) => c.done).length / project.checklist.length) * 100)
    : 0
  const openIssues = project.issues.filter((i) => !i.solved)
  const isPersonal = project.companyId === null

  const getProductName = (productId: string) => {
    return products.find((p) => p.id === productId)?.name || productId
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

  const handleAddChecklistItem = () => {
    if (!newChecklistTitle.trim()) return
    const item: ChecklistItem = {
      id: `c${Date.now()}`,
      title: newChecklistTitle,
      done: false,
      note: "",
      doneAt: null,
    }
    addChecklistItem(project.id, item)
    setNewChecklistTitle("")
    setChecklistDialogOpen(false)
    toast.success(t("common.savedSuccessfully"))
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
          {project.status !== "done" && (
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
              <SelectItem value="done">{t("status.done")}</SelectItem>
              <SelectItem value="cancelled">{t("status.cancelled")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("common.progress")}</p>
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="w-16 h-2" />
                  <span className="font-medium">{progress}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("common.total")}</p>
                <p className="font-medium">{total.toLocaleString()} EUR</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                  <TableHead className="text-right">{t("common.price")} (EUR)</TableHead>
                  <TableHead className="text-right">{t("common.total")} (EUR)</TableHead>
                  <TableHead>{t("projects.source")}</TableHead>
                  <TableHead>{t("common.notes")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{getProductName(item.productId)}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={item.fromInventory ? "secondary" : "outline"}>
                        {item.fromInventory ? t("projects.fromInventory") : t("projects.needsProduction")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.notes || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("projects.checklist")}</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setChecklistDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("common.add")}
          </Button>
        </CardHeader>
        <CardContent>
          {project.checklist.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">{t("projects.noChecklistItems")}</p>
          ) : (
            <div className="space-y-2">
              {project.checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={item.done}
                      onCheckedChange={() => toggleChecklistItem(project.id, item.id)}
                    />
                    <span className={item.done ? "line-through text-muted-foreground" : ""}>
                      {item.title}
                    </span>
                  </div>
                  {item.doneAt && (
                    <span className="text-xs text-muted-foreground">{item.doneAt}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* Add Checklist Dialog */}
      <Dialog open={checklistDialogOpen} onOpenChange={setChecklistDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("projects.addChecklistItem")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("projects.itemTitle")} *</Label>
              <Input
                id="title"
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                placeholder={t("projects.checklistPlaceholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChecklistDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleAddChecklistItem}>{t("common.add")}</Button>
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
