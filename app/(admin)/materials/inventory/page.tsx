"use client"

import { useState } from "react"
import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Package, AlertTriangle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import type { InventoryItem } from "@/lib/types"

export default function InventoryPage() {
  const { inventory, parts, products, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useAppData()
  const { t, locale } = useLocale()
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [activeTab, setActiveTab] = useState<"all" | "parts" | "products">("all")

  // Form state
  const [formType, setFormType] = useState<"part" | "product">("part")
  const [formItemId, setFormItemId] = useState("")
  const [formQuantity, setFormQuantity] = useState(0)
  const [formMinStock, setFormMinStock] = useState(0)
  const [formLocation, setFormLocation] = useState("")

  const safeInventory = inventory ?? []
  const safeParts = parts ?? []
  const safeProducts = products ?? []

  // Filter by type
  const filteredInventory = safeInventory.filter((item) => {
    const matchesTab = activeTab === "all" || item.type === activeTab.slice(0, -1) as "part" | "product"
    const itemName = item.type === "part"
      ? safeParts.find((p) => p.id === item.itemId)?.name ?? ""
      : safeProducts.find((p) => p.id === item.itemId)?.name ?? ""
    const matchesSearch = itemName.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  const lowStockCount = safeInventory.filter((i) => i.quantity <= i.minStock).length
  const partsCount = safeInventory.filter((i) => i.type === "part").length
  const productsCount = safeInventory.filter((i) => i.type === "product").length

  function openNewDialog() {
    setEditingItem(null)
    setFormType("part")
    setFormItemId(safeParts[0]?.id ?? "")
    setFormQuantity(0)
    setFormMinStock(10)
    setFormLocation("Warehouse A")
    setDialogOpen(true)
  }

  function openEditDialog(item: InventoryItem) {
    setEditingItem(item)
    setFormType(item.type)
    setFormItemId(item.itemId)
    setFormQuantity(item.quantity)
    setFormMinStock(item.minStock)
    setFormLocation(item.location)
    setDialogOpen(true)
  }

  function handleSave() {
    const now = new Date().toISOString().split("T")[0]
    const item: InventoryItem = {
      id: editingItem?.id ?? `inv${Date.now()}`,
      type: formType,
      itemId: formItemId,
      partId: formItemId,
      quantity: formQuantity,
      minStock: formMinStock,
      location: formLocation,
      updatedAt: now,
    }

    if (editingItem) {
      updateInventoryItem(item)
      toast.success(t("common.savedSuccessfully"))
    } else {
      addInventoryItem(item)
      toast.success(t("common.savedSuccessfully"))
    }
    setDialogOpen(false)
  }

  function handleDelete(id: string) {
    deleteInventoryItem(id)
    toast.success(t("common.deleted"))
  }

  function getItemName(item: InventoryItem): string {
    if (item.type === "part") {
      return safeParts.find((p) => p.id === item.itemId)?.name ?? t("common.unknown")
    }
    return safeProducts.find((p) => p.id === item.itemId)?.name ?? t("common.unknown")
  }

  function getItemCode(item: InventoryItem): string {
    if (item.type === "part") {
      return safeParts.find((p) => p.id === item.itemId)?.id ?? "--"
    }
    return safeProducts.find((p) => p.id === item.itemId)?.code ?? "--"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{t("inventory")}</h2>
          <p className="text-sm text-muted-foreground">{t("materials.inventorySubtitle")}</p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t("materials.addInventory")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("materials.totalItems")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{safeInventory.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("materials.partsInStock")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{partsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("materials.productsInStock")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{productsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("materials.lowStock")}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{lowStockCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{t("inventory")}</CardTitle>
              <CardDescription>{filteredInventory.length} {t("common.items")}</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList>
                  <TabsTrigger value="all">{t("common.all")}</TabsTrigger>
                  <TabsTrigger value="parts">{t("materials.parts")}</TabsTrigger>
                  <TabsTrigger value="products">{t("products")}</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("materials.searchInventory")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.type")}</TableHead>
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("materials.location")}</TableHead>
                <TableHead className="text-right">{t("common.quantity")}</TableHead>
                <TableHead className="text-right">{t("materials.minStock")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="w-[60px]">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => {
                const isLow = item.quantity <= item.minStock
                return (
                  <TableRow key={item.id} className={isLow ? "bg-amber-50/50 dark:bg-amber-950/20" : ""}>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {item.type === "part" ? t("materials.part") : t("products.product")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{getItemName(item)}</p>
                        <p className="font-mono text-xs text-muted-foreground">{getItemCode(item)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.location}</TableCell>
                    <TableCell className="text-right font-mono">{item.quantity}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">{item.minStock}</TableCell>
                    <TableCell>
                      {isLow ? (
                        <Badge
                          variant="outline"
                          className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                        >
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          {t("materials.lowStock")}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          {t("materials.inStock")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(item)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(item.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredInventory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    {t("materials.noInventoryFound")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? t("common.edit") : t("materials.addInventory")}
            </DialogTitle>
            <DialogDescription>
              {t("materials.inventoryFormDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("common.type")}</Label>
              <Select
                value={formType}
                onValueChange={(v) => {
                  setFormType(v as "part" | "product")
                  setFormItemId(v === "part" ? safeParts[0]?.id ?? "" : safeProducts[0]?.id ?? "")
                }}
                disabled={!!editingItem}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="part">{t("materials.part")}</SelectItem>
                  <SelectItem value="product">{t("products.product")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{formType === "part" ? t("materials.part") : t("products.product")}</Label>
              <Select value={formItemId} onValueChange={setFormItemId} disabled={!!editingItem}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formType === "part"
                    ? safeParts.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))
                    : safeProducts.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.quantity")}</Label>
                <Input
                  type="number"
                  min="0"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("materials.minStock")}</Label>
                <Input
                  type="number"
                  min="0"
                  value={formMinStock}
                  onChange={(e) => setFormMinStock(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("materials.location")}</Label>
              <Input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
