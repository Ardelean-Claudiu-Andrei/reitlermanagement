import type { ProjectItem } from './types'

export function computeProjectTotal(project: {
  finalPrice?: number | null
  items?: Array<{ unitPrice: number; quantity: number }>
  installationCost?: number
}): number {
  if (project.finalPrice != null) return project.finalPrice
  const itemsTotal = (project.items ?? []).reduce(
    (sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0),
    0,
  )
  return itemsTotal + (Number(project.installationCost) || 0)
}

export function getProjectItemEntityId(item: ProjectItem): string | undefined {
  const type = item.type ?? 'product'
  if (type === 'assembly') return item.assemblyId
  if (type === 'part') return item.partId
  return item.productId
}

export function getProjectItemKey(item: ProjectItem): string {
  const type = item.type ?? 'product'
  const entityId = getProjectItemEntityId(item) ?? ''
  return JSON.stringify({
    type,
    entityId,
    unitPrice: Number(item.unitPrice) || 0,
    fromInventory: Boolean(item.fromInventory),
    notes: (item.notes ?? '').trim(),
  })
}

export function consolidateProjectItems(items: ProjectItem[]): ProjectItem[] {
  const seen = new Map<string, number>()
  const result: ProjectItem[] = []

  for (const item of items) {
    const key = getProjectItemKey(item)
    const quantity = Math.max(1, Number(item.quantity) || 1)
    const existingIdx = seen.get(key)
    if (existingIdx !== undefined) {
      result[existingIdx] = { ...result[existingIdx], quantity: result[existingIdx].quantity + quantity }
    } else {
      seen.set(key, result.length)
      result.push({ ...item, quantity })
    }
  }

  return result
}
