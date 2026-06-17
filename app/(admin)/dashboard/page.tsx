"use client"

// Dashboard page for SMS Reitler
import { useRef, useEffect, useState } from "react"
import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/status-badge"
import { FileText, Building2, FolderKanban, CheckCircle2, Clock, AlertTriangle, ShieldAlert, FileDown, BarChart3 } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getCurrentUser, reportsApi, type WeeklyReportSummary } from "@/lib/api"
import { canViewReports } from "@/lib/permissions"
import type { AppRole } from "@/lib/permissions"
import { toast } from "sonner"

export default function DashboardPage() {
  const { quotes, projects, companies, updateProject } = useAppData()
  const { t } = useLocale()

  const isAdmin = canViewReports((getCurrentUser()?.role ?? "employee") as AppRole)
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReportSummary[]>([])
  const [exportingWeek, setExportingWeek] = useState<string | null>(null)
  const [reportsPage, setReportsPage] = useState(1)
  const [reportsSearch, setReportsSearch] = useState("")
  const REPORTS_PER_PAGE = 5

  useEffect(() => {
    if (!isAdmin) return
    reportsApi.listWeekly().then((res) => setWeeklyReports(res.weeks)).catch(console.error)
  }, [isAdmin])

  async function handleExportWeeklyReport(weekStart: string) {
    setExportingWeek(weekStart)
    try {
      const blob = await reportsApi.exportWeeklyPdf(weekStart)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `raport-saptamanal-${weekStart}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Raport generat cu succes")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Eroare la generare raport")
    } finally {
      setExportingWeek(null)
    }
  }

  const safeQuotes = quotes ?? []
  const safeProjects = projects ?? []
  const safeCompanies = companies ?? []

  const autoChecked = useRef(false)

  useEffect(() => {
    if (!projects || projects.length === 0 || autoChecked.current) return
    autoChecked.current = true

    const AUTO_MARKER = "[AUTO-WARRANTY]"
    const now = new Date()

    projects.forEach((p) => {
      const expiry = p.warrantyExpiration
        ? new Date(p.warrantyExpiration)
        : p.finishDate
          ? (() => { const fd = new Date(p.finishDate!); return new Date(fd.getFullYear() + 2, fd.getMonth(), fd.getDate()) })()
          : null

      if (!expiry || expiry > now) return
      if (p.status === "maintenance" || p.status === "cancelled") return

      const hadMaintenance = (p.activity ?? []).some((a) => a.action?.toLowerCase().includes("maintenance"))
      if (p.status === "done" && hadMaintenance) return

      // Already auto-handled — don't create a duplicate issue
      if ((p.issues ?? []).some((i) => i.description?.includes(AUTO_MARKER))) return

      const newIssue = {
        id: `auto-warranty-${p.id}`,
        description: `${AUTO_MARKER} Nicio acțiune nu a fost luată privind garanția sau mentenanța proiectului. Proiectul a fost mutat automat la finalizat.`,
        solved: false,
        solvedAt: null,
        createdAt: now.toISOString(),
      }

      updateProject({
        ...p,
        status: "done",
        issues: [...(p.issues ?? []), newIssue],
      }).catch(console.error)
    })
  }, [projects])

  const activeProjects = safeProjects.filter((p) => p.status === "in-progress")
  const doneProjects = safeProjects.filter((p) => p.status === "done")
  const projectsWithIssues = safeProjects.filter((p) => p.issues?.some((i) => !i.solved))

  const now = new Date()

  function effectiveWarrantyExpiry(p: typeof safeProjects[0]): Date | null {
    if (p.warrantyExpiration) return new Date(p.warrantyExpiration)
    if (p.finishDate) {
      const fd = new Date(p.finishDate)
      return new Date(fd.getFullYear() + 2, fd.getMonth(), fd.getDate())
    }
    return null
  }

  const warrantyAlerts = safeProjects
    .flatMap((p) => {
      const expiry = effectiveWarrantyExpiry(p)
      if (!expiry) return []
      const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / 86400000)
      if (daysUntil > 7) return []

      // Hide while maintenance is actively in progress
      if (p.status === "maintenance") return []
      if (p.status === "cancelled") return []

      // Hide if project already completed a done → maintenance → done cycle
      // (warranty service was already provided)
      const maintenanceWasCompleted =
        p.status === "done" &&
        (p.activity ?? []).some((a) => a.action?.toLowerCase().includes("maintenance"))
      if (maintenanceWasCompleted) return []

      const company = safeCompanies.find((c) => c.id === p.companyId)
      return [{ project: p, expiry, daysUntil, company }]
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)

  function getRelativeTime(isoDate: string): string {
    const diffDays = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86400000)
    if (diffDays <= 0) return t("dashboard.today")
    if (diffDays === 1) return t("dashboard.yesterday")
    if (diffDays < 7) return t("dashboard.daysAgo", { days: String(diffDays) })
    const weeks = Math.floor(diffDays / 7)
    if (weeks === 1) return t("dashboard.weekAgo")
    return t("dashboard.weeksAgo", { weeks: String(weeks) })
  }

  const recentActivity = [
    ...safeProjects.map((p) => ({ text: `[${p.code}] ${p.activity?.[0]?.action ?? "Project created"}`, sortDate: p.createdAt })),
    ...safeQuotes.map((q) => ({ text: `Quote "${q.name}" created`, sortDate: q.createdAt })),
    ...safeCompanies.map((c) => ({ text: `Company "${c.name}" added`, sortDate: c.createdAt })),
    ...safeProjects.flatMap((p) =>
      (p.activity ?? [])
        .filter((a) => a.timestamp?.includes("T"))
        .map((a) => ({ text: `[${p.code}] ${a.action}`, sortDate: a.timestamp }))
    ),
  ]
    .filter((e) => !!e.sortDate)
    .sort((a, b) => b.sortDate.localeCompare(a.sortDate))
    .slice(0, 5)
    .map((e) => ({ text: e.text, time: getRelativeTime(e.sortDate) }))

  const topProjects = safeProjects
    .filter((p) => p.status !== "cancelled")
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">{t("nav.dashboard")}</h2>
        <p className="text-sm text-muted-foreground">{t("dashboard.welcome")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.totalQuotes")}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{safeQuotes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.totalCompanies")}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{safeCompanies.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.activeProjects")}</CardTitle>
            <FolderKanban className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{activeProjects.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.completedProjects")}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{doneProjects.length}</p>
          </CardContent>
        </Card>
      </div>

      {projectsWithIssues.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4" />
              {t("dashboard.projectsWithIssues")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {projectsWithIssues.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="rounded-md bg-amber-100 px-2 py-1 text-sm text-amber-800 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-200 dark:hover:bg-amber-900"
                >
                  {p.code}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {warrantyAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-red-800 dark:text-red-200">
              <ShieldAlert className="h-4 w-4" />
              Garanție în expirare ({warrantyAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {warrantyAlerts.map(({ project: p, expiry, daysUntil, company }) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center justify-between rounded-md bg-red-100 px-3 py-2 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">
                      {p.code} — {p.name}
                    </p>
                    {company && (
                      <p className="text-xs text-red-700 dark:text-red-300">{company.name}</p>
                    )}
                  </div>
                  <div className="ml-4 shrink-0 text-right">
                    <p className="text-xs font-mono text-red-800 dark:text-red-200">
                      {expiry.toLocaleDateString("ro-RO")}
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300">
                      {daysUntil < 0
                        ? `Expirat acum ${Math.abs(daysUntil)} zile`
                        : daysUntil === 0
                        ? "Expiră azi"
                        : `Expiră în ${daysUntil} zile`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isAdmin && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Rapoarte săptămânale
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyReports.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">—</p>
            ) : (() => {
              const filtered = reportsSearch.trim()
                ? weeklyReports.filter((w) => w.weekStart.includes(reportsSearch) || w.weekEnd.includes(reportsSearch))
                : weeklyReports
              const totalPages = Math.ceil(filtered.length / REPORTS_PER_PAGE)
              const pageItems = filtered.slice((reportsPage - 1) * REPORTS_PER_PAGE, reportsPage * REPORTS_PER_PAGE)
              return (
                <>
                  <div className="mb-3">
                    <Input
                      placeholder="Caută săptămână (ex: 2026-06)..."
                      value={reportsSearch}
                      onChange={(e) => { setReportsSearch(e.target.value); setReportsPage(1) }}
                      className="h-8 text-sm"
                    />
                  </div>
                  {filtered.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Niciun rezultat.</p>
                  ) : null}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Săptămâna</TableHead>
                        <TableHead>Progres</TableHead>
                        <TableHead>Finalizate</TableHead>
                        <TableHead className="text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pageItems.map((w) => (
                        <TableRow key={w.weekStart}>
                          <TableCell className="font-medium text-sm">
                            {w.weekStart} — {w.weekEnd}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{w.progressedCount}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{w.finalizedCount}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={exportingWeek === w.weekStart}
                              onClick={() => handleExportWeeklyReport(w.weekStart)}
                            >
                              <FileDown className="mr-1 h-3 w-3" />
                              {exportingWeek === w.weekStart ? "..." : "Descarcă PDF"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-3">
                      <p className="text-xs text-muted-foreground">
                        {(reportsPage - 1) * REPORTS_PER_PAGE + 1}–{Math.min(reportsPage * REPORTS_PER_PAGE, filtered.length)} din {filtered.length}
                      </p>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" disabled={reportsPage === 1} onClick={() => setReportsPage(p => p - 1)}>‹</Button>
                        <Button variant="outline" size="sm" disabled={reportsPage === totalPages} onClick={() => setReportsPage(p => p + 1)}>›</Button>
                      </div>
                    </div>
                  )}
                </>
              )
            })()}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("dashboard.recentActivity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">—</p>
              ) : (
                recentActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{item.text}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("dashboard.projectsOverview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.code")}</TableHead>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="text-right">{t("common.progress")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProjects.map((project) => {
                  const completedSteps = project.stepsCompleted?.length ?? 0
                  const totalSteps = project.stepsTotal ?? 0
                  const progressLabel = totalSteps > 0 ? `${completedSteps}/${totalSteps}` : "--"
                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-mono text-xs">
                        <Link href={`/projects/${project.id}`} className="text-foreground hover:underline">
                          {project.code}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{project.name}</TableCell>
                      <TableCell>
                        <StatusBadge status={project.status} />
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {progressLabel}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
