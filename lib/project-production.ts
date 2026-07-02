import type { Product, Assembly, Part, ProjectItem, AssemblyStep } from './types'

// ─── View-model types ─────────────────────────────────────────────────────────

export type UsageEntry = {
  parentId: string
  parentName: string
  parentCode: string
  quantity: number
}

export type DependencyVM = {
  type: 'assembly' | 'part'
  entityId: string
  name: string
  code: string
  quantity: number
  ownSteps: AssemblyStep[]
}

export type ProductionCardVM = {
  itemType: 'product' | 'assembly' | 'part'
  entityId: string
  name: string
  code: string
  quantity: number
  ownSteps: AssemblyStep[]
  dependencies: DependencyVM[]
  usages: UsageEntry[]
}

// ─── Step-key helpers (stable format — do not change) ─────────────────────────

export function ownStepKey(card: ProductionCardVM, step: AssemblyStep): string {
  if (card.itemType === 'product') return `${card.entityId}:product:${step.id}`
  if (card.itemType === 'assembly') return `asm:${card.entityId}:step:${step.id}`
  return `part:${card.entityId}:step:${step.id}`
}

export function depStepKey(dep: DependencyVM, step: AssemblyStep): string {
  if (dep.type === 'assembly') return `asm:${dep.entityId}:step:${step.id}`
  return `part:${dep.entityId}:step:${step.id}`
}

// ─── Internal accumulators ────────────────────────────────────────────────────

interface AsmGroup {
  obj: Assembly
  totalQty: number
  usages: UsageEntry[]
  insertOrder: number
}

interface PartGroup {
  obj: Part
  totalQty: number
  usages: UsageEntry[]
  insertOrder: number
}

function addToAsmGroup(
  groups: Map<string, AsmGroup>,
  asm: Assembly,
  qty: number,
  parentId: string,
  parentName: string,
  parentCode: string,
  order: { n: number },
): void {
  const existing = groups.get(asm.id)
  if (!existing) {
    groups.set(asm.id, {
      obj: asm,
      totalQty: qty,
      usages: [{ parentId, parentName, parentCode, quantity: qty }],
      insertOrder: order.n++,
    })
    return
  }
  existing.totalQty += qty
  const eu = existing.usages.find(u => u.parentId === parentId)
  if (eu) eu.quantity += qty
  else existing.usages.push({ parentId, parentName, parentCode, quantity: qty })
}

function addToPartGroup(
  groups: Map<string, PartGroup>,
  part: Part,
  qty: number,
  parentId: string,
  parentName: string,
  parentCode: string,
  order: { n: number },
): void {
  const existing = groups.get(part.id)
  if (!existing) {
    groups.set(part.id, {
      obj: part,
      totalQty: qty,
      usages: [{ parentId, parentName, parentCode, quantity: qty }],
      insertOrder: order.n++,
    })
    return
  }
  existing.totalQty += qty
  const eu = existing.usages.find(u => u.parentId === parentId)
  if (eu) eu.quantity += qty
  else existing.usages.push({ parentId, parentName, parentCode, quantity: qty })
}

// ─── Recursive assembly-tree collector ────────────────────────────────────────

function collectAsmTree(
  asmId: string,
  effectiveQty: number,
  parentId: string,
  parentName: string,
  parentCode: string,
  allAssemblies: Assembly[],
  allParts: Part[],
  asmGroups: Map<string, AsmGroup>,
  partGroups: Map<string, PartGroup>,
  asmOrder: { n: number },
  partOrder: { n: number },
  ancestorPath: ReadonlySet<string>,
): void {
  if (ancestorPath.has(asmId)) {
    console.warn(`[production] cycle detected at assembly ${asmId} — skipping`)
    return
  }

  const asm = allAssemblies.find(a => a.id === asmId)
  if (!asm) {
    console.warn(`[production] assembly not found: ${asmId}`)
    return
  }

  addToAsmGroup(asmGroups, asm, effectiveQty, parentId, parentName, parentCode, asmOrder)

  const nextPath = new Set([...ancestorPath, asmId])

  for (const ap of asm.parts ?? []) {
    const part = allParts.find(p => p.id === ap.partId)
    if (!part) {
      console.warn(`[production] part not found: ${ap.partId}`)
      continue
    }
    addToPartGroup(partGroups, part, (ap.quantity ?? 1) * effectiveQty, asm.id, asm.name, asm.code ?? '', partOrder)
  }

  for (const ca of asm.childAssemblies ?? []) {
    collectAsmTree(
      ca.assemblyId,
      (ca.quantity ?? 1) * effectiveQty,
      asm.id,
      asm.name,
      asm.code ?? '',
      allAssemblies,
      allParts,
      asmGroups,
      partGroups,
      asmOrder,
      partOrder,
      nextPath,
    )
  }
}

// ─── Public entry point ───────────────────────────────────────────────────────

export function buildProductionCards(
  items: ProjectItem[],
  allProducts: Product[],
  allAssemblies: Assembly[],
  allParts: Part[],
): ProductionCardVM[] {
  // Products: grouped by productId (deduplicate duplicates in project.items)
  const productGroups = new Map<string, { obj: Product; totalQty: number; insertOrder: number }>()
  let productOrder = 0

  const asmGroups = new Map<string, AsmGroup>()
  const partGroups = new Map<string, PartGroup>()
  const asmOrder = { n: 0 }
  const partOrder = { n: 0 }

  for (const item of items) {
    const kind = item.type ?? (item.assemblyId ? 'assembly' : item.partId ? 'part' : 'product')
    const qty = item.quantity ?? 1

    if (kind === 'product') {
      const product = allProducts.find(p => p.id === item.productId)
      if (!product) {
        console.warn(`[production] product not found: ${item.productId}`)
        continue
      }

      const pg = productGroups.get(product.id)
      if (!pg) productGroups.set(product.id, { obj: product, totalQty: qty, insertOrder: productOrder++ })
      else pg.totalQty += qty

      const asmEntries =
        product.productAssemblies && product.productAssemblies.length > 0
          ? product.productAssemblies
          : (product.assemblyIds ?? []).map(id => ({ assemblyId: id, quantity: 1 }))

      const partEntries =
        product.productParts && product.productParts.length > 0
          ? product.productParts
          : (product.partIds ?? []).map(id => ({ partId: id, quantity: 1 }))

      for (const ae of asmEntries) {
        collectAsmTree(
          ae.assemblyId,
          (ae.quantity ?? 1) * qty,
          product.id,
          product.name,
          product.code ?? '',
          allAssemblies,
          allParts,
          asmGroups,
          partGroups,
          asmOrder,
          partOrder,
          new Set(),
        )
      }

      for (const pe of partEntries) {
        const part = allParts.find(p => p.id === pe.partId)
        if (!part) {
          console.warn(`[production] part not found: ${pe.partId}`)
          continue
        }
        addToPartGroup(partGroups, part, (pe.quantity ?? 1) * qty, product.id, product.name, product.code ?? '', partOrder)
      }
    } else if (kind === 'assembly') {
      collectAsmTree(
        item.assemblyId!,
        qty,
        '',
        'Proiect direct',
        '',
        allAssemblies,
        allParts,
        asmGroups,
        partGroups,
        asmOrder,
        partOrder,
        new Set(),
      )
    } else if (kind === 'part') {
      const part = allParts.find(p => p.id === item.partId)
      if (!part) {
        console.warn(`[production] part not found: ${item.partId}`)
        continue
      }
      addToPartGroup(partGroups, part, qty, '', 'Proiect direct', '', partOrder)
    }
  }

  const cards: ProductionCardVM[] = []

  // 1. Product cards in first-seen order
  const sortedProducts = [...productGroups.values()].sort((a, b) => a.insertOrder - b.insertOrder)
  for (const { obj: product, totalQty } of sortedProducts) {
    const ownSteps: AssemblyStep[] = product.productionSteps ?? product.assemblySteps ?? []

    const asmEntries =
      product.productAssemblies && product.productAssemblies.length > 0
        ? product.productAssemblies
        : (product.assemblyIds ?? []).map(id => ({ assemblyId: id, quantity: 1 }))

    const partEntries =
      product.productParts && product.productParts.length > 0
        ? product.productParts
        : (product.partIds ?? []).map(id => ({ partId: id, quantity: 1 }))

    const deps: DependencyVM[] = []

    for (const ae of asmEntries) {
      const asm = allAssemblies.find(a => a.id === ae.assemblyId)
      if (!asm) continue
      deps.push({
        type: 'assembly',
        entityId: asm.id,
        name: asm.name,
        code: asm.code ?? '',
        quantity: (ae.quantity ?? 1) * totalQty,
        ownSteps: asm.productionSteps ?? [],
      })
    }

    for (const pe of partEntries) {
      const part = allParts.find(p => p.id === pe.partId)
      if (!part) continue
      deps.push({
        type: 'part',
        entityId: part.id,
        name: part.name,
        code: part.code ?? '',
        quantity: (pe.quantity ?? 1) * totalQty,
        ownSteps: part.productionSteps ?? [],
      })
    }

    cards.push({ itemType: 'product', entityId: product.id, name: product.name, code: product.code ?? '', quantity: totalQty, ownSteps, dependencies: deps, usages: [] })
  }

  // 2. Assembly cards in first-seen traversal order
  const sortedAsms = [...asmGroups.values()].sort((a, b) => a.insertOrder - b.insertOrder)
  for (const { obj: asm, totalQty, usages } of sortedAsms) {
    const deps: DependencyVM[] = []

    for (const ca of asm.childAssemblies ?? []) {
      const child = allAssemblies.find(a => a.id === ca.assemblyId)
      if (!child) continue
      deps.push({
        type: 'assembly',
        entityId: child.id,
        name: child.name,
        code: child.code ?? '',
        quantity: (ca.quantity ?? 1) * totalQty,
        ownSteps: child.productionSteps ?? [],
      })
    }

    for (const ap of asm.parts ?? []) {
      const part = allParts.find(p => p.id === ap.partId)
      if (!part) continue
      deps.push({
        type: 'part',
        entityId: part.id,
        name: part.name,
        code: part.code ?? '',
        quantity: (ap.quantity ?? 1) * totalQty,
        ownSteps: part.productionSteps ?? [],
      })
    }

    cards.push({ itemType: 'assembly', entityId: asm.id, name: asm.name, code: asm.code ?? '', quantity: totalQty, ownSteps: asm.productionSteps ?? [], dependencies: deps, usages })
  }

  // 3. Part cards in first-seen order
  const sortedParts = [...partGroups.values()].sort((a, b) => a.insertOrder - b.insertOrder)
  for (const { obj: part, totalQty, usages } of sortedParts) {
    cards.push({ itemType: 'part', entityId: part.id, name: part.name, code: part.code ?? '', quantity: totalQty, ownSteps: part.productionSteps ?? [], dependencies: [], usages })
  }

  return cards
}
