"use client"

import { useState } from "react"
import { useAppData } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge, OverdueBadge } from "@/components/status-badge"
import { ProductionOfferWizard } from "@/components/production-offer-wizard"
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
import { Plus, Search, Eye } from "lucide-react"
import Link from "next/link"

function isOverdue(deadline: string, status: string): boolean {
  if (status === "done" || status === "cancelled") return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dl = new Date(deadline)
  return dl < today
}

export default function ProductionOffersPage() {
  const { productionOffers, templates } = useAppData()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [wizardOpen, setWizardOpen] = useState(false)

  const filtered = productionOffers.filter((o) => {
    const matchesSearch =
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.code.toLowerCase().includes(search.toLowerCase())
    if (statusFilter === "overdue") {
      return matchesSearch && isOverdue(o.deadline, o.status)
    }
    const matchesStatus = statusFilter === "all" || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Production Offers</h2>
          <p className="text-sm text-muted-foreground">Track and manage production orders</p>
        </div>
        <Button onClick={() => setWizardOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Generate From Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in-production">In Production</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Offers</CardTitle>
            <p className="text-sm text-muted-foreground">{filtered.length} offers found</p>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Checklist</TableHead>
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((offer) => {
                const template = templates.find((t) => t.id === offer.templateId)
                const done = offer.checklist.filter((c) => c.done).length
                const total = offer.checklist.length
                const overdue = isOverdue(offer.deadline, offer.status)
                return (
                  <TableRow key={offer.id} className={overdue ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}>
                    <TableCell className="font-mono text-xs">{offer.code}</TableCell>
                    <TableCell className="font-medium">{offer.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{template?.name ?? "--"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{offer.createdAt}</TableCell>
                    <TableCell className="text-sm">
                      <span className={overdue ? "text-amber-700 dark:text-amber-400 font-medium" : "text-muted-foreground"}>
                        {offer.deadline}
                      </span>
                      {overdue && <span className="ml-2"><OverdueBadge /></span>}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={offer.status} />
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {total > 0 ? `${done}/${total}` : "--"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/production-offers/${offer.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No production offers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProductionOfferWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  )
}
