"use client"

// Dashboard page for SMS Reitler
import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { FileText, Building2, FolderKanban, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function DashboardPage() {
  const { quotes, projects, companies } = useAppData()
  const { t } = useLocale()

  const safeQuotes = quotes ?? []
  const safeProjects = projects ?? []
  const safeCompanies = companies ?? []

  const activeProjects = safeProjects.filter((p) => p.status === "in-progress")
  const doneProjects = safeProjects.filter((p) => p.status === "completed")
  const projectsWithIssues = safeProjects.filter((p) => p.issues?.some((i) => i.status === "open"))

  const recentActivity = [
    { text: t("dashboard.activity1"), time: t("dashboard.daysAgo", { days: "2" }) },
    { text: t("dashboard.activity2"), time: t("dashboard.daysAgo", { days: "4" }) },
    { text: t("dashboard.activity3"), time: t("dashboard.daysAgo", { days: "5" }) },
    { text: t("dashboard.activity4"), time: t("dashboard.weekAgo") },
    { text: t("dashboard.activity5"), time: t("dashboard.weekAgo") },
  ]

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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("dashboard.recentActivity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
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
                  const checklist = project.checklist ?? []
                  const done = checklist.filter((c) => c.done).length
                  const total = checklist.length
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
                        {total > 0 ? `${done}/${total}` : "--"}
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
