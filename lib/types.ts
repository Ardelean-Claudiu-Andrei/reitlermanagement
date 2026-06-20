// ===========================================
// COMPANIES & MANAGEMENT
// ===========================================

export interface Company {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  cui: string
  details: string
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

export type AssemblyCompositionType = "from_parts" | "from_assemblies" | "standalone"

export type FileCategory =
  | "dxf"
  | "dpd"
  | "pdf"
  | "image"
  | "welding_drawing"
  | "bending_drawing"

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

export interface UploadedFile {
  id: string
  entityType: "assembly" | "part" | "product"
  entityId: string
  fileCategory: FileCategory
  originalFilename: string
  storedPath: string
  url: string
  contentType: string | null
  uploadedAt: string
}

export interface Part {
  id: string
  code: string
  name: string
  description: MultiLangText
  category: string
  unit: string
  basePrice: number
  minimumStock: number
  quantity: number
  requiredQuantity: number
  location: string
  physicalLocation: string
  drawingLocation: string
  requiresLaserCutting: boolean
  weldingDrawingLocation: string
  bendingDrawingLocation: string
  cadLocation: string
  technicalDrawingLocation: string
  productionSteps: AssemblyStep[]
  notes: string
  fileName: string
  fileLocation: string
  createdAt: string
  updatedAt: string
}

export interface AssemblyPart {
  partId: string
  quantity: number
}

export interface AssemblyChildEntry {
  assemblyId: string
  quantity: number
}

export interface Assembly {
  id: string
  code: string
  name: string
  description: MultiLangText
  parts: AssemblyPart[]
  childAssemblies: AssemblyChildEntry[]
  compositionType: AssemblyCompositionType
  physicalLocation: string
  weldingDrawingLocation: string
  technicalDrawingLocation: string
  cadLocation: string
  productionSteps: AssemblyStep[]
  notes: string
  createdAt: string
  updatedAt: string
}

export interface ProductAssemblyEntry {
  assemblyId: string
  quantity: number
}

export interface ProductPartEntry {
  partId: string
  quantity: number
}

export interface Product {
  id: string
  code: string
  name: string
  description: MultiLangText
  category: ProductCategory
  unit: string
  basePrice: number
  assemblyIds: string[]
  partIds: string[]
  productAssemblies?: ProductAssemblyEntry[]  // [{assemblyId, quantity}]
  productParts?: ProductPartEntry[]            // [{partId, quantity}]
  assemblySteps: AssemblyStep[]   // product-level production steps (existing field)
  productionSteps: AssemblyStep[] // forward-compat alias
  notes: string
  hasLaserCutting?: boolean       // populated by GET /{id} endpoint
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

export type ProjectStatus = "draft" | "in-progress" | "in-installation" | "done" | "warranty" | "maintenance" | "cancelled"

export type CreateProjectPayload = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'activity'> & {
  activity: Array<{ id?: string; action: string; user: string; timestamp: string }>
  installationCost?: number
}

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
  installationCost?: number          // carried from quote, 0 if none
  finalPrice?: number | null         // manually editable project price
  paidAmount?: number
  items: ProjectItem[]
  checklist: ChecklistItem[]
  issues: ProjectIssue[]
  activity: ActivityEntry[]
  stepsCompleted: string[]
  stepsTotal: number
  createdAt: string
  updatedAt: string
}

// ===========================================
// USERS
// ===========================================

export interface User {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string
  status: "active" | "inactive"
  role?: import("@/lib/permissions").AppRole  // present on the login-response user object
}

export interface AdditionalInformation {
  userId: string
  role: import("@/lib/permissions").AppRole
  type: import("@/lib/permissions").AppRole
}

export interface UserWithInfo {
  user: User
  additionalInformation: AdditionalInformation
}
