"use client"

import { use, useState } from "react"
import { useAppData } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { StatusBadge, OverdueBadge } from "@/components/status-badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Download, Plus, Clock } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import type { ProductionStatus } from "@/lib/types"

function isOverdue(deadline: string, status: string): boolean {
  if (status === "done" || status === "cancelled") return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dl = new Date(deadline)
  return dl < today
}

export default function ProductionOfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const {
    productionOffers,
    templates,
    products,
    updateProductionOfferStatus,
    toggleChecklistItem,
    addChecklistItem,
  } = useAppData()

  const offer = productionOffers.find((o) => o.id === id)
  const [addItemOpen, setAddItemOpen] = useState(false)
  const [newItemTitle, setNewItemTitle] = useState("")

  if (!offer) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Production offer not found.</p>
      </div>
    )
  }

  const template = templates.find((t) => t.id === offer.templateId)
  const doneCount = offer.checklist.filter((c) => c.done).length
  const totalCount = offer.checklist.length
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0
  const total = offer.selectedItems.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  const overdue = isOverdue(offer.deadline, offer.status)

  function handleStatusChange(status: ProductionStatus) {
    updateProductionOfferStatus(offer!.id, status)
    toast.success(`Status updated to ${status}`)
  }

  function handleAddChecklistItem() {
    if (!newItemTitle.trim()) return
    addChecklistItem(offer!.id, {
      id: `c${Date.now()}`,
      title: newItemTitle,
      done: false,
      note: "",
      doneAt: null,
    })
    setNewItemTitle("")
    setAddItemOpen(false)
    toast.success("Checklist item added")
  }

  function handleExport() {
    toast.success("Export started - file will download shortly")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" className="mt-1" asChild>
            <Link href="/production-offers">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-foreground">{offer.name}</h2>
              <StatusBadge status={offer.status} />
              {overdue && <OverdueBadge />}
            </div>
            <p className="text-sm font-mono text-muted-foreground">{offer.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={offer.status} onValueChange={(v) => handleStatusChange(v as ProductionStatus)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in-production">In Production</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Template</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-foreground">{template?.name ?? "--"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-foreground">{offer.createdAt}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Start Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-foreground">{offer.startDate}</p>
          </CardContent>
        </Card>
        <Card className={overdue ? "border-amber-300 dark:border-amber-700" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Deadline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-sm font-medium ${overdue ? "text-amber-700 dark:text-amber-400" : "text-foreground"}`}>
              {offer.deadline}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm font-medium text-foreground">{doneCount}/{totalCount} steps</p>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offer.selectedItems.map((item) => {
                    const product = products.find((p) => p.id === item.productId)
                    return (
                      <TableRow key={item.productId}>
                        <TableCell className="font-mono text-xs">{product?.code}</TableCell>
                        <TableCell className="font-medium">{product?.name}</TableCell>
                        <TableCell className="text-right">{item.qty}</TableCell>
                        <TableCell className="text-right font-mono">{item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono">{(item.qty * item.unitPrice).toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.notes || "--"}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end border-t border-border pt-4">
                <p className="text-base font-semibold text-foreground">
                  Total: <span className="font-mono">{total.toFixed(2)}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">Checklist</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {doneCount} of {totalCount} steps completed
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setAddItemOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
              <Progress value={progress} className="mt-2 h-2" />
            </CardHeader>
            <CardContent>
              {offer.checklist.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No checklist items yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {offer.checklist.map((item) => (
                    <label
                      key={item.id}
                      className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 transition-colors hover:bg-secondary"
                    >
                      <Checkbox
                        checked={item.done}
                        onCheckedChange={() => toggleChecklistItem(offer.id, item.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${item.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {item.title}
                        </p>
                        {item.note && (
                          <p className="text-xs text-muted-foreground">{item.note}</p>
                        )}
                      </div>
                      {item.doneAt && (
                        <span className="text-xs text-muted-foreground">{item.doneAt}</span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              {offer.activity.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                <div className="space-y-4">
                  {offer.activity.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{entry.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.user} - {entry.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Checklist Item</DialogTitle>
          </DialogHeader>
          <Input
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            placeholder="Step title..."
            onKeyDown={(e) => e.key === "Enter" && handleAddChecklistItem()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemOpen(false)}>Cancel</Button>
            <Button onClick={handleAddChecklistItem}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
