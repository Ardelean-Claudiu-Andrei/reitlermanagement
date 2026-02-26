"use client"

import { useAppData } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { FileText, Package, Factory, CheckCircle2, Clock } from "lucide-react"
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
  const { templates, products, productionOffers } = useAppData()

  const activeProduction = productionOffers.filter((o) => o.status === "in-production")
  const doneThisWeek = productionOffers.filter((o) => o.status === "done")

  const recentActivity = [
    { text: "Production offer PO-2026-003 marked as Done", time: "2 days ago" },
    { text: "New template 'Aluminum Enclosure' created", time: "4 days ago" },
    { text: "Hydraulic Press production started", time: "5 days ago" },
    { text: "Steel Frame checklist updated (3/7)", time: "1 week ago" },
    { text: "New product 'Hydraulic Pump Unit' added", time: "1 week ago" },
  ]

  const topProduction = productionOffers
    .filter((o) => o.status !== "cancelled")
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Welcome to SMS Reitler - Offers & Production</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{templates.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{products.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Production</CardTitle>
            <Factory className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{activeProduction.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Done This Week</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{doneThisWeek.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
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
            <CardTitle className="text-base">Production Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProduction.map((offer) => {
                  const done = offer.checklist.filter((c) => c.done).length
                  const total = offer.checklist.length
                  return (
                    <TableRow key={offer.id}>
                      <TableCell className="font-mono text-xs">
                        <Link href={`/production-offers/${offer.id}`} className="text-foreground hover:underline">
                          {offer.code}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{offer.name}</TableCell>
                      <TableCell>
                        <StatusBadge status={offer.status} />
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
