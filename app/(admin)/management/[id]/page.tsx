"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Building2, Phone, MapPin, User, FolderKanban, FileText } from "lucide-react"

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { companies, projects, quotes, products } = useAppData()
  const { t } = useLocale()

  const company = companies.find((c) => c.id === id)

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">{t("noResults")}</p>
        <Button variant="link" onClick={() => router.push("/management")}>
          {t("back")}
        </Button>
      </div>
    )
  }

  const companyProjects = projects.filter((p) => p.companyId === company.id)
  const companyQuotes = quotes.filter((q) => q.companyId === company.id)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      pending: "outline",
      approved: "default",
      rejected: "destructive",
      "in-progress": "default",
      done: "secondary",
      cancelled: "destructive",
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/management")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
          <p className="text-sm text-muted-foreground">{t("viewDetails")}</p>
        </div>
      </div>

      {/* Company Info */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("companyName")}</p>
                <p className="font-medium">{company.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("contactPerson")}</p>
                <p className="font-medium">{company.contactPerson || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("phone")}</p>
                <p className="font-medium">{company.phone || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("address")}</p>
                <p className="font-medium text-sm">{company.address || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Associated Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            {t("associatedProjects")} ({companyProjects.length})
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/projects">{t("view")} {t("projects")}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {companyProjects.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">{t("noResults")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("startDate")}</TableHead>
                  <TableHead>{t("deadline")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-mono text-sm">{project.code}</TableCell>
                    <TableCell>
                      <Link href={`/projects/${project.id}`} className="hover:underline font-medium">
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell>{project.startDate}</TableCell>
                    <TableCell>{project.deadline}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Associated Quotes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("associatedQuotes")} ({companyQuotes.length})
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/quotes">{t("view")} {t("quotes")}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {companyQuotes.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">{t("noResults")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("validity")}</TableHead>
                  <TableHead>{t("deliveryTimeWeeks")}</TableHead>
                  <TableHead>{t("total")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyQuotes.map((quote) => {
                  const total = quote.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) + quote.installation
                  return (
                    <TableRow key={quote.id}>
                      <TableCell>
                        <Link href={`/quotes/${quote.id}`} className="hover:underline font-medium">
                          {quote.name}
                        </Link>
                      </TableCell>
                      <TableCell>{getStatusBadge(quote.status)}</TableCell>
                      <TableCell>{quote.validity}</TableCell>
                      <TableCell>{quote.deliveryTimeWeeks} {t("weeks")}</TableCell>
                      <TableCell className="font-medium">{total.toLocaleString()} EUR</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
