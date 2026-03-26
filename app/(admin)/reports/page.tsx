"use client"

import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Download, CheckCircle2, Factory, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function ReportsPage() {
  const { projects } = useAppData()
  const { t } = useLocale()

  const safeProjects = projects ?? []

  const completed = safeProjects.filter((p) => p.status === "completed")
  const inProgress = safeProjects.filter((p) => p.status === "in-progress")
  const cancelled = safeProjects.filter((p) => p.status === "cancelled")

  function handleExport() {
    toast.success(t("reports.exportStarted"))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{t("reports.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("reports.subtitle")}</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          {t("reports.exportReport")}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("reports.completed")}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{completed.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("reports.inProgress")}</CardTitle>
            <Factory className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{inProgress.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("reports.cancelled")}</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{cancelled.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("reports.allProjects")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.code")}</TableHead>
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="text-center">{t("common.progress")}</TableHead>
                <TableHead>{t("common.startDate")}</TableHead>
                <TableHead className="w-[60px]">{t("common.view")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeProjects.map((project) => {
                const checklist = project.checklist ?? []
                const d = checklist.filter((c) => c.done).length
                const total = checklist.length
                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-mono text-xs">{project.code}</TableCell>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={project.status} />
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {total > 0 ? `${d}/${total}` : "--"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{project.startDate}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/projects/${project.id}`}>{t("common.view")}</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
