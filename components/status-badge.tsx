import { Badge } from "@/components/ui/badge"
import type { ProductionStatus } from "@/lib/types"

const statusConfig: Record<ProductionStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground hover:bg-muted" },
  "in-production": { label: "In Production", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 border-blue-200 dark:border-blue-800" },
  done: { label: "Done", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 border-red-200 dark:border-red-800" },
}

export function StatusBadge({ status }: { status: ProductionStatus }) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        active
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800"
          : "bg-muted text-muted-foreground hover:bg-muted"
      }
    >
      {active ? "Active" : "Inactive"}
    </Badge>
  )
}

export function OverdueBadge() {
  return (
    <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 border-amber-200 dark:border-amber-800">
      Overdue
    </Badge>
  )
}
