"use client"

import { useAppData } from "@/lib/app-context"
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
  const { productionOffers } = useAppData()

  const done = productionOffers.filter((o) => o.status === "done")
  const inProd = productionOffers.filter((o) => o.status === "in-production")
  const blocked = productionOffers.filter((o) => o.status === "cancelled")

  function handleExport() {
    toast.success("Export started - report will download shortly")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Weekly Reports</h2>
          <p className="text-sm text-muted-foreground">Production overview and progress summary</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Done</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{done.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Production</CardTitle>
            <Factory className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{inProd.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cancelled / Blocked</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{blocked.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Production Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Progress</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead className="w-[60px]">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productionOffers.map((offer) => {
                const d = offer.checklist.filter((c) => c.done).length
                const t = offer.checklist.length
                return (
                  <TableRow key={offer.id}>
                    <TableCell className="font-mono text-xs">{offer.code}</TableCell>
                    <TableCell className="font-medium">{offer.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={offer.status} />
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {t > 0 ? `${d}/${t}` : "--"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{offer.startDate}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/production-offers/${offer.id}`}>View</Link>
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
