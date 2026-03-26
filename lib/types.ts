// ===========================================
// COMPANIES & MANAGEMENT
// ===========================================

export interface Company {
  id: string
  name: string
  contactPerson: string
  phone: string
  address: string
  createdAt: string
  updatedAt: string
}

// ===========================================
// PRODUCTS & MATERIALS
// ===========================================

export type ProductCategory =
  | "silo-interior"
  | "silo-exterior"
  | "maia"
  | "dissolver"
  | "blower"
  | "cyclone-doser"
  | "control-panel"
  | "other"

export type AssemblyStepType =
  | "laser-cutting"
  | "plasma-cutting"
  | "cnc"
  | "welding"
  | "assembly"

export interface MultiLangText {
  ro: string
  hu: string
  de: string
  en: string
}

export interface AssemblyStep {
  id: string
  name: string
  type: AssemblyStepType
  description: string
  order: number
}

export interface Part {
  id: string
  name: string
  description: MultiLangText
  fileName: string
  fileLocation: string
  unit: string
  basePrice: number
  createdAt: string
  updatedAt: string
}

export interface AssemblyPart {
  partId: string
  quantity: number
}

export interface Assembly {
  id: string
  code: string
  name: string
  description: MultiLangText
  parts: AssemblyPart[] // Parts that make up this assembly with quantities
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  code: string
  name: string
  description: MultiLangText
  category: ProductCategory
  unit: string
  basePrice: number
  assemblyIds: string[] // Assemblies used in this product
  partIds: string[] // Direct parts (not in assemblies)
  assemblySteps: AssemblyStep[]
  notes: string
  createdAt: string
  updatedAt: string
}

// ===========================================
// INVENTORY
// ===========================================

export interface InventoryItem {
  id: string
  type: "product" | "part"
  itemId: string // References Product.id or Part.id
  partId?: string // For backwards compatibility
  quantity: number
  minStock: number
  location: string
  updatedAt: string
}

// ===========================================
// QUOTES (formerly Templates)
// ===========================================

export interface QuoteItem {
  productId: string
  unitPrice: number
  quantity: number
  notes: string
}

export type QuoteStatus = "draft" | "pending" | "approved" | "rejected"

export interface Quote {
  id: string
  name: string
  description: string
  companyId: string | null // null for personal/internal quotes
  status: QuoteStatus
  validity: string // ISO date
  deliveryTimeWeeks: number
  items: QuoteItem[]
  installation: number // Labor/installation cost
  notes: string
  createdAt: string
  updatedAt: string
}

// ===========================================
// PROJECTS (formerly Production Offers)
// ===========================================

export interface ProjectIssue {
  id: string
  description: string
  solved: boolean
  solvedAt: string | null
  createdAt: string
}

export interface ChecklistItem {
  id: string
  title: string
  done: boolean
  note: string
  doneAt: string | null
}

export interface ProjectItem {
  productId: string
  quantity: number
  unitPrice: number
  notes: string
  fromInventory: boolean // true if from inventory, false if needs production
}

export interface ActivityEntry {
  id: string
  action: string
  user: string
  timestamp: string
}

export type ProjectStatus = "draft" | "in-progress" | "done" | "cancelled"

export interface Project {
  id: string
  code: string
  name: string
  companyId: string | null // null for personal projects
  quoteId: string | null
  status: ProjectStatus
  startDate: string
  deadline: string
  finishDate: string | null
  warrantyExpiration: string | null // finishDate + 2 years
  items: ProjectItem[]
  checklist: ChecklistItem[]
  issues: ProjectIssue[]
  activity: ActivityEntry[]
  createdAt: string
  updatedAt: string
}

// ===========================================
// USERS
// ===========================================

export interface User {
  id: string
  name: string
  email: string
  status: "active" | "inactive"
}

export interface AdditionalInformation {
  userId: string
  role: "admin" | "employee"
  type: "admin" | "employee"
}

export interface UserWithInfo {
  user: User
  additionalInformation: AdditionalInformation
}
