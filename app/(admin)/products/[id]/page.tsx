"use client"

import { useParams, useRouter } from "next/navigation"
import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
import { productsApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ArrowLeft, Pencil, ChevronDown, Boxes, Wrench, Package, Zap, FileDown, ShoppingCart } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import type { Assembly, AssemblyStep, Part, Product } from "@/lib/types"
import { EntityFileUploads } from "@/components/entity-file-uploads"

const categoryLabels: Record<string, string> = {
  "silo-interior": "Silo Interior",
  "silo-exterior": "Silo Exterior",
  "maia": "Maia",
  "dissolver": "Dissolver",
  "blower": "Blower",
  "cyclone-doser": "Cyclone Doser",
  "control-panel": "Control Panel",
  "other": "Other",
}

// ─── Hierarchy builder ─────────────────────────────────────────────────────

type PartNode = {
  id: string
  name: string
  code: string
  quantity: number
  requiresLaserCutting: boolean
  drawingLocation?: string
  steps: AssemblyStep[]
}

type AssemblyNode = {
  id: string
  name: string
  code: string
  steps: AssemblyStep[]
  parts: PartNode[]
}

type StepHierarchy = {
  productSteps: AssemblyStep[]
  assemblies: AssemblyNode[]
  directParts: PartNode[]
}

function buildHierarchy(
  product: Product,
  safeAssemblies: Assembly[],
  safeParts: Part[],
): StepHierarchy {
  const productSteps = product.productionSteps ?? product.assemblySteps ?? []

  const assemblies: AssemblyNode[] = (product.assemblyIds ?? [])
    .map((id) => safeAssemblies.find((a) => a.id === id))
    .filter((a): a is Assembly => !!a)
    .map((asm): AssemblyNode => ({
      id: asm.id,
      name: asm.name,
      code: asm.code,
      steps: asm.productionSteps ?? [],
      parts: (asm.parts ?? [])
        .map((ap): PartNode | null => {
          const part = safeParts.find((p) => p.id === ap.partId)
          if (!part) return null
          return {
            id: part.id,
            name: part.name,
            code: part.code,
            quantity: ap.quantity,
            requiresLaserCutting: part.requiresLaserCutting,
            drawingLocation: part.drawingLocation,
            steps: part.productionSteps ?? [],
          }
        })
        .filter((p): p is PartNode => p !== null),
    }))

  const directParts: PartNode[] = (product.partIds ?? [])
    .map((id) => safeParts.find((p) => p.id === id))
    .filter((p): p is Part => p !== undefined)
    .map((part): PartNode => ({
      id: part.id,
      name: part.name,
      code: part.code,
      quantity: part.requiredQuantity ?? 1,
      requiresLaserCutting: part.requiresLaserCutting,
      drawingLocation: part.drawingLocation,
      steps: part.productionSteps ?? [],
    }))

  return { productSteps, assemblies, directParts }
}

function countSteps(h: StepHierarchy): number {
  return (
    h.productSteps.length +
    h.assemblies.reduce((s, a) => s + a.steps.length + a.parts.reduce((sp, p) => sp + p.steps.length, 0), 0) +
    h.directParts.reduce((s, p) => s + p.steps.length, 0)
  )
}

// ─── Step row sub-components ────────────────────────────────────────────────

function StepRow({ step, index }: { step: AssemblyStep; index: number }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b last:border-0">
      <span className="text-xs text-muted-foreground font-mono w-5 shrink-0 mt-0.5">{index + 1}.</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{step.name}</span>
          {step.type && <Badge variant="secondary" className="text-xs">{step.type}</Badge>}
        </div>
        {step.description && <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>}
      </div>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { products, parts, assemblies } = useAppData()
  const { t } = useLocale()

  const productId = params.id as string
  const safeProducts = products ?? []
  const safeParts = parts ?? []
  const safeAssemblies = assemblies ?? []
  const contextProduct = safeProducts.find((p) => p.id === productId)

  const [hasLaserCutting, setHasLaserCutting] = useState(false)
  const [exportingLaser, setExportingLaser] = useState(false)
  const [exportingSteps, setExportingSteps] = useState(false)
  const [apiProduct, setApiProduct] = useState<Product | null>(null)
  const [fetchLoading, setFetchLoading] = useState(!contextProduct)

  // Fallback: fetch from API if not in context (e.g. right after create)
  useEffect(() => {
    if (!contextProduct && productId) {
      setFetchLoading(true)
      productsApi.get(productId)
        .then((p) => {
          setApiProduct(p)
          setHasLaserCutting(!!p.hasLaserCutting)
        })
        .catch(() => {})
        .finally(() => setFetchLoading(false))
    } else if (contextProduct) {
      productsApi.get(productId)
        .then((detail) => setHasLaserCutting(!!detail.hasLaserCutting))
        .catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const product = contextProduct ?? apiProduct

  if (!product && fetchLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Se încarcă...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">{t("products.notFound")}</p>
      </div>
    )
  }

  const hierarchy = buildHierarchy(product, safeAssemblies, safeParts)
  const totalSteps = countSteps(hierarchy)

  const productAssemblies = hierarchy.assemblies
  const directParts = hierarchy.directParts

  const getAllRequiredParts = () => {
    const partMap = new Map<string, { part: Part; quantity: number; source: string; requiresLaserCutting: boolean }>()
    productAssemblies.forEach((asmNode) => {
      const asm = safeAssemblies.find((a) => a.id === asmNode.id)
      if (!asm) return
      asmNode.parts.forEach((pNode) => {
        const part = safeParts.find((p) => p.id === pNode.id)
        if (!part) return
        const existing = partMap.get(part.id)
        if (existing) existing.quantity += pNode.quantity
        else partMap.set(part.id, { part, quantity: pNode.quantity, source: asm.name, requiresLaserCutting: part.requiresLaserCutting })
      })
    })
    directParts.forEach((pNode) => {
      const part = safeParts.find((p) => p.id === pNode.id)
      if (!part) return
      const existing = partMap.get(part.id)
      if (existing) existing.quantity += pNode.quantity
      else partMap.set(part.id, { part, quantity: pNode.quantity, source: t("products.directPart"), requiresLaserCutting: part.requiresLaserCutting })
    })
    return Array.from(partMap.values())
  }

  const allRequiredParts = getAllRequiredParts()
  const totalPartsCount = allRequiredParts.reduce((sum, p) => sum + p.quantity, 0)

  async function handleExportLaserPdf() {
    setExportingLaser(true)
    try {
      const blob = await productsApi.laserCuttingPdf(product!.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `laser-print-${product!.code}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("PDF generat cu succes")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Eroare la generare PDF")
    } finally {
      setExportingLaser(false)
    }
  }

  async function handleExportStepsPdf() {
    setExportingSteps(true)
    try {
      const blob = await productsApi.exportProductionStepsPdf(product!.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `pasi-productie-${product!.code}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("PDF generat cu succes")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Eroare la generare PDF")
    } finally {
      setExportingSteps(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-semibold text-foreground">{product.name}</h2>
              <Badge variant="outline">{categoryLabels[product.category] || product.category}</Badge>
              {hasLaserCutting && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  <Zap className="mr-1 h-3 w-3" />
                  Laser
                </Badge>
              )}
              {product.requiresPurchase && (
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  <ShoppingCart className="mr-1 h-3 w-3" />
                  {t("products.purchase.badge")}
                </Badge>
              )}
            </div>
            <p className="font-mono text-sm text-muted-foreground">{product.code}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push(`/products/${product.id}/edit`)}>
          <Pencil className="mr-2 h-4 w-4" />
          {t("common.edit")}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("products.category")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-sm">{categoryLabels[product.category] || product.category}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("products.basePrice")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{product.basePrice.toFixed(2)} EUR</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("products.subassemblies")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{productAssemblies.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("products.totalParts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{totalPartsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pași producție</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{totalSteps}</p>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {product.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("common.description")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(["ro", "hu", "de", "en"] as const).map((lang) => (
                <div key={lang}>
                  <Badge variant="outline" className="mb-1">{lang.toUpperCase()}</Badge>
                  <p className="text-sm text-muted-foreground">{product.description[lang] || "-"}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="structure">
        <TabsList>
          <TabsTrigger value="structure" className="gap-1">
            <Package className="h-4 w-4" />
            {t("products.structure")}
          </TabsTrigger>
          <TabsTrigger value="parts" className="gap-1">
            <Wrench className="h-4 w-4" />
            {t("products.generatedParts")} ({allRequiredParts.length})
          </TabsTrigger>
          <TabsTrigger value="steps" className="gap-1">
            <Boxes className="h-4 w-4" />
            Pași producție ({totalSteps})
          </TabsTrigger>
          {product.requiresPurchase && (
            <TabsTrigger value="purchase" className="gap-1 text-orange-600">
              <ShoppingCart className="h-4 w-4" />
              {t("products.purchase.tab")}
            </TabsTrigger>
          )}
          <TabsTrigger value="files" className="gap-1">
            Fișiere
          </TabsTrigger>
        </TabsList>

        {/* Structure */}
        <TabsContent value="structure" className="mt-4 space-y-4">
          {productAssemblies.length > 0 ? (
            productAssemblies.map((asmNode) => {
              const asm = safeAssemblies.find((a) => a.id === asmNode.id)
              return asm ? (
                <AssemblyCard key={asm.id} assembly={asm} parts={safeParts} />
              ) : null
            })
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {t("products.noSubassemblies")}
              </CardContent>
            </Card>
          )}

          {directParts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  {t("products.directParts")}
                </CardTitle>
                <CardDescription>{t("products.directPartsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.name")}</TableHead>
                      <TableHead>Cantitate</TableHead>
                      <TableHead>Laser</TableHead>
                      <TableHead>Locație desen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {directParts.map((pNode) => (
                      <TableRow key={pNode.id}>
                        <TableCell className="font-medium">{pNode.name}</TableCell>
                        <TableCell>{pNode.quantity}</TableCell>
                        <TableCell>
                          {pNode.requiresLaserCutting && <Zap className="h-4 w-4 text-blue-500" />}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{pNode.drawingLocation || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* All Parts */}
        <TabsContent value="parts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("products.generatedPartsTable")}</CardTitle>
              <CardDescription>{t("products.generatedPartsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {allRequiredParts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.name")}</TableHead>
                      <TableHead className="text-right">{t("common.quantity")}</TableHead>
                      <TableHead className="text-center">Laser</TableHead>
                      <TableHead>Locație desen</TableHead>
                      <TableHead>{t("products.source")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allRequiredParts.map(({ part, quantity, source, requiresLaserCutting }) => (
                      <TableRow key={part.id}>
                        <TableCell className="font-medium">{part.name}</TableCell>
                        <TableCell className="text-right font-mono">{quantity}</TableCell>
                        <TableCell className="text-center">
                          {requiresLaserCutting && <Zap className="h-4 w-4 text-blue-500 mx-auto" />}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{part.drawingLocation || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{source}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="py-8 text-center text-muted-foreground">{t("products.noParts")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hierarchical Production Steps */}
        <TabsContent value="steps" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base">Pași de producție</CardTitle>
                <CardDescription>Structurați pe produs, ansambluri și piese</CardDescription>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportStepsPdf}
                  disabled={exportingSteps || totalSteps === 0}
                >
                  <FileDown className="mr-1 h-3 w-3" />
                  {exportingSteps ? "Se generează..." : "Export lista de steps"}
                </Button>
                {hasLaserCutting && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportLaserPdf}
                    disabled={exportingLaser}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Zap className="mr-1 h-3 w-3" />
                    {exportingLaser ? "Se generează..." : "Export Print"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {totalSteps === 0 ? (
                <p className="py-8 text-center text-muted-foreground">{t("products.noSteps")}</p>
              ) : (
                <div className="space-y-4">
                  {/* Product-level steps */}
                  {hierarchy.productSteps.length > 0 && (
                    <div className="rounded-lg border">
                      <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 rounded-t-lg border-b">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">{product.name}</span>
                        <Badge variant="secondary" className="text-xs ml-auto">{hierarchy.productSteps.length} pași</Badge>
                      </div>
                      <div className="px-4 py-2">
                        {hierarchy.productSteps.map((step, idx) => (
                          <StepRow key={step.id} step={step} index={idx} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assembly nodes */}
                  {hierarchy.assemblies.map((asmNode) => (
                    <div key={asmNode.id} className="rounded-lg border">
                      <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 rounded-t-lg border-b">
                        <Boxes className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">{asmNode.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{asmNode.code}</span>
                        {asmNode.steps.length > 0 && (
                          <Badge variant="secondary" className="text-xs ml-auto">{asmNode.steps.length} pași</Badge>
                        )}
                      </div>
                      <div className="px-4">
                        {asmNode.steps.length > 0 && (
                          <div className="py-2 border-b last:border-0">
                            {asmNode.steps.map((step, idx) => (
                              <StepRow key={step.id} step={step} index={idx} />
                            ))}
                          </div>
                        )}
                        {/* Parts inside assembly */}
                        {asmNode.parts.map((pNode) => (
                          pNode.steps.length > 0 && (
                            <div key={pNode.id} className="ml-4 my-2 rounded-md border">
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/20 rounded-t-md border-b">
                                <Wrench className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs font-medium">{pNode.name}</span>
                                {pNode.requiresLaserCutting && <Zap className="h-3 w-3 text-blue-500" />}
                                <Badge variant="outline" className="text-xs ml-auto">{pNode.steps.length} pași</Badge>
                              </div>
                              <div className="px-3 py-1">
                                {pNode.steps.map((step, idx) => (
                                  <StepRow key={step.id} step={step} index={idx} />
                                ))}
                              </div>
                            </div>
                          )
                        ))}
                        {asmNode.steps.length === 0 && asmNode.parts.every((p) => p.steps.length === 0) && (
                          <p className="py-3 text-xs text-muted-foreground">Niciun pas pentru acest ansamblu.</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Direct parts */}
                  {hierarchy.directParts.filter((p) => p.steps.length > 0).map((pNode) => (
                    <div key={pNode.id} className="rounded-lg border">
                      <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 rounded-t-lg border-b">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">{pNode.name}</span>
                        <Badge variant="outline" className="text-xs">Piesă directă</Badge>
                        {pNode.requiresLaserCutting && <Zap className="h-4 w-4 text-blue-500" />}
                        <Badge variant="secondary" className="text-xs ml-auto">{pNode.steps.length} pași</Badge>
                      </div>
                      <div className="px-4 py-2">
                        {pNode.steps.map((step, idx) => (
                          <StepRow key={step.id} step={step} index={idx} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase */}
        <TabsContent value="purchase" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-orange-500" />
                {t("products.purchase.tab")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">{t("products.purchase.supplier")}</p>
                  <p className="font-medium">{product.purchaseSupplier || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">{t("products.purchase.price")}</p>
                  <p className="font-medium">
                    {product.purchasePrice != null
                      ? `${product.purchasePrice} ${product.purchaseCurrency || "EUR"}${product.purchaseVatIncluded ? ` (TVA ${product.purchaseVatRate}%)` : " (fără TVA)"}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">{t("products.purchase.agentContact")}</p>
                  <p className="font-medium">{product.purchaseAgentContact || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">{t("products.purchase.details")}</p>
                  <p className="font-medium">{product.purchaseDetails || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Files */}
        <TabsContent value="files" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-base">Fișiere atașate produsului</CardTitle>
                <CardDescription>DXF, PDF, imagini — vizualizare. Pentru a gestiona fișierele, folosește pagina de editare.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push(`/products/${product.id}/edit`)}>
                <Pencil className="mr-1 h-3 w-3" />
                Editează fișiere
              </Button>
            </CardHeader>
            <CardContent>
              <EntityFileUploads
                entityType="product"
                entityId={product.id}
                readonly
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notes */}
      {product.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("common.notes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{product.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AssemblyCard({ assembly, parts }: {
  assembly: Assembly
  parts: Part[]
}) {
  const [open, setOpen] = useState(false)
  const { t, locale } = useLocale()

  const assemblyParts = (assembly.parts ?? []).map((ap: { partId: string; quantity: number }) => {
    const part = parts.find((p) => p.id === ap.partId)
    return { ...ap, part }
  })

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Boxes className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">{assembly.name}</CardTitle>
                <CardDescription className="font-mono text-xs">{assembly.code}</CardDescription>
              </div>
              {assembly.physicalLocation && (
                <Badge variant="outline" className="text-xs">{assembly.physicalLocation}</Badge>
              )}
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
                {t("products.viewParts")} ({assemblyParts.length})
              </Button>
            </CollapsibleTrigger>
          </div>
          {assembly.description?.[locale as "ro" | "hu" | "de" | "en"] && (
            <p className="text-sm text-muted-foreground mt-2">{assembly.description[locale as "ro"]}</p>
          )}
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead className="text-right">{t("common.quantity")}</TableHead>
                  <TableHead className="text-center">Laser</TableHead>
                  <TableHead>Locație desen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assemblyParts.map((ap) => (
                  <TableRow key={ap.partId}>
                    <TableCell className="font-medium">{ap.part?.name || t("common.unknown")}</TableCell>
                    <TableCell className="text-right font-mono">{ap.quantity}</TableCell>
                    <TableCell className="text-center">
                      {ap.part?.requiresLaserCutting && <Zap className="h-4 w-4 text-blue-500 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{ap.part?.drawingLocation || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
