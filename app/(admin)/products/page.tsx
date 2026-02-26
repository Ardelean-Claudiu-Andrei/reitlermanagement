"use client"

import { useState } from "react"
import { useAppData } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { Product } from "@/lib/types"

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useAppData()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [formCode, setFormCode] = useState("")
  const [formName, setFormName] = useState("")
  const [formUnit, setFormUnit] = useState("")
  const [formPrice, setFormPrice] = useState("")
  const [formCategory, setFormCategory] = useState("")
  const [formNotes, setFormNotes] = useState("")

  const categories = [...new Set(products.map((p) => p.category))]

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  function openCreateDialog() {
    setEditingProduct(null)
    setFormCode("")
    setFormName("")
    setFormUnit("pcs")
    setFormPrice("")
    setFormCategory("")
    setFormNotes("")
    setDialogOpen(true)
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product)
    setFormCode(product.code)
    setFormName(product.name)
    setFormUnit(product.unit)
    setFormPrice(String(product.basePrice))
    setFormCategory(product.category)
    setFormNotes(product.notes)
    setDialogOpen(true)
  }

  function handleSave() {
    if (!formCode || !formName || !formPrice) {
      toast.error("Please fill in required fields")
      return
    }
    const product: Product = {
      id: editingProduct?.id ?? `p${Date.now()}`,
      code: formCode,
      name: formName,
      unit: formUnit,
      basePrice: parseFloat(formPrice),
      category: formCategory,
      notes: formNotes,
      updatedAt: new Date().toISOString().split("T")[0],
    }
    if (editingProduct) {
      updateProduct(product)
      toast.success("Product updated")
    } else {
      addProduct(product)
      toast.success("Product created")
    }
    setDialogOpen(false)
  }

  function handleDelete(id: string) {
    deleteProduct(id)
    toast.success("Product deleted")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Products</h2>
          <p className="text-sm text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter Products</CardTitle>
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Products</CardTitle>
            <p className="text-sm text-muted-foreground">{filtered.length} products found</p>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Base Price</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-xs">{product.code}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.unit}</TableCell>
                  <TableCell className="text-muted-foreground">{product.category}</TableCell>
                  <TableCell className="text-right font-mono">{product.basePrice.toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{product.updatedAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(product)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(product.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Update product details." : "Add a new product to the catalog."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input id="code" value={formCode} onChange={(e) => setFormCode(e.target.value)} placeholder="STL-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" value={formUnit} onChange={(e) => setFormUnit(e.target.value)} placeholder="pcs" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Product name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Base Price *</Label>
                <Input id="price" type="number" step="0.01" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} placeholder="e.g., Raw Materials" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Optional notes..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingProduct ? "Save Changes" : "Add Product"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
