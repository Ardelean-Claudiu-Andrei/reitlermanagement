"use client"

import { useParams, useRouter } from "next/navigation"
import { useAppData } from "@/lib/app-context"
import { useLocale } from "@/lib/locale-context"
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
import { ArrowLeft, Pencil, ChevronDown, Boxes, Wrench, Package } from "lucide-react"
import { useState } from "react"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { products, parts, assemblies } = useAppData()
  const { t, locale } = useLocale()

  const safeProducts = products ?? []
  const safeParts = parts ?? []
  const safeAssemblies = assemblies ?? []
  const product = safeProducts.find((p) => p.id === params.id)

  if (!product) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">{t("products.notFound")}</p>
      </div>
    )
  }

  // Get all assemblies used in this product
  const productAssemblies = (product.assemblyIds ?? []).map((id) =>
    safeAssemblies.find((a) => a.id === id)
  ).filter(Boolean)

  // Get direct parts (not in assemblies)
  const directParts = (product.partIds ?? []).map((id) =>
    safeParts.find((p) => p.id === id)
  ).filter(Boolean)

  // Calculate all required parts recursively (from assemblies + direct parts)
  const getAllRequiredParts = () => {
    const partMap = new Map<string, { part: typeof safeParts[0]; quantity: number; source: string }>()

    // Add parts from assemblies
    productAssemblies.forEach((assembly) => {
      if (!assembly) return
      assembly.parts.forEach((ap) => {
        const part = safeParts.find((p) => p.id === ap.partId)
        if (part) {
          const existing = partMap.get(part.id)
          if (existing) {
            existing.quantity += ap.quantity
          } else {
            partMap.set(part.id, { part, quantity: ap.quantity, source: assembly.name })
          }
        }
      })
    })

    // Add direct parts
    directParts.forEach((part) => {
      if (!part) return
      const existing = partMap.get(part.id)
      if (existing) {
        existing.quantity += 1
      } else {
        partMap.set(part.id, { part, quantity: 1, source: t("products.directPart") })
      }
    })

    return Array.from(partMap.values())
  }

  const allRequiredParts = getAllRequiredParts()
  const totalPartsCount = allRequiredParts.reduce((sum, p) => sum + p.quantity, 0)

  // Assembly steps
  const assemblySteps = product.assemblySteps ?? []

  // Category labels
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold text-foreground">{product.name}</h2>
              <Badge variant="outline">{categoryLabels[product.category] || product.category}</Badge>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("products.assemblySteps")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{assemblySteps.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Description in multiple languages */}
      {product.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("common.description")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Badge variant="outline" className="mb-1">RO</Badge>
                <p className="text-sm text-muted-foreground">{product.description.ro || "-"}</p>
              </div>
              <div>
                <Badge variant="outline" className="mb-1">HU</Badge>
                <p className="text-sm text-muted-foreground">{product.description.hu || "-"}</p>
              </div>
              <div>
                <Badge variant="outline" className="mb-1">DE</Badge>
                <p className="text-sm text-muted-foreground">{product.description.de || "-"}</p>
              </div>
              <div>
                <Badge variant="outline" className="mb-1">EN</Badge>
                <p className="text-sm text-muted-foreground">{product.description.en || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different views */}
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
            {t("products.assemblySteps")} ({assemblySteps.length})
          </TabsTrigger>
        </TabsList>

        {/* Structure Tab - Shows Subassemblies and their Parts */}
        <TabsContent value="structure" className="mt-4 space-y-4">
          {productAssemblies.length > 0 ? (
            productAssemblies.map((assembly) => (
              <AssemblyCard key={assembly?.id} assembly={assembly} parts={safeParts} t={t} locale={locale} />
            ))
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
                      <TableHead>{t("materials.fileName")}</TableHead>
                      <TableHead>{t("materials.fileLocation")}</TableHead>
                      <TableHead>{t("products.unit")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {directParts.map((part) => (
                      <TableRow key={part?.id}>
                        <TableCell className="font-medium">{part?.name}</TableCell>
                        <TableCell className="font-mono text-xs">{part?.fileName || "-"}</TableCell>
                        <TableCell className="font-mono text-xs">{part?.fileLocation || "-"}</TableCell>
                        <TableCell>{part?.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Generated Parts Table - All parts recursively */}
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
                      <TableHead>{t("products.unit")}</TableHead>
                      <TableHead>{t("materials.fileName")}</TableHead>
                      <TableHead>{t("materials.fileLocation")}</TableHead>
                      <TableHead>{t("products.source")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allRequiredParts.map(({ part, quantity, source }) => (
                      <TableRow key={part.id}>
                        <TableCell className="font-medium">{part.name}</TableCell>
                        <TableCell className="text-right font-mono">{quantity}</TableCell>
                        <TableCell>{part.unit}</TableCell>
                        <TableCell className="font-mono text-xs">{part.fileName || "-"}</TableCell>
                        <TableCell className="font-mono text-xs">{part.fileLocation || "-"}</TableCell>
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

        {/* Assembly Steps Tab */}
        <TabsContent value="steps" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("products.assemblySteps")}</CardTitle>
              <CardDescription>{t("products.assemblyStepsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {assemblySteps.length > 0 ? (
                <div className="space-y-3">
                  {assemblySteps.sort((a, b) => a.order - b.order).map((step, index) => (
                    <div key={step.id} className="flex items-start gap-4 rounded-lg border p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{step.name}</p>
                          <Badge variant="secondary">{step.type}</Badge>
                        </div>
                        {step.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">{t("products.noSteps")}</p>
              )}
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

// Assembly Card Component with collapsible parts
function AssemblyCard({ assembly, parts, t, locale }: { 
  assembly: any; 
  parts: any[]; 
  t: (key: string) => string;
  locale: string;
}) {
  const [open, setOpen] = useState(false)

  if (!assembly) return null

  const assemblyParts = assembly.parts.map((ap: { partId: string; quantity: number }) => {
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
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
                {t("products.viewParts")} ({assemblyParts.length})
              </Button>
            </CollapsibleTrigger>
          </div>
          {assembly.description?.[locale] && (
            <p className="text-sm text-muted-foreground mt-2">{assembly.description[locale]}</p>
          )}
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead className="text-right">{t("common.quantity")}</TableHead>
                  <TableHead>{t("products.unit")}</TableHead>
                  <TableHead>{t("materials.fileName")}</TableHead>
                  <TableHead>{t("materials.fileLocation")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assemblyParts.map((ap: any) => (
                  <TableRow key={ap.partId}>
                    <TableCell className="font-medium">{ap.part?.name || t("common.unknown")}</TableCell>
                    <TableCell className="text-right font-mono">{ap.quantity}</TableCell>
                    <TableCell>{ap.part?.unit || "-"}</TableCell>
                    <TableCell className="font-mono text-xs">{ap.part?.fileName || "-"}</TableCell>
                    <TableCell className="font-mono text-xs">{ap.part?.fileLocation || "-"}</TableCell>
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
