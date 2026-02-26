export interface Product {
  id: string
  code: string
  name: string
  unit: string
  basePrice: number
  category: string
  notes: string
  updatedAt: string
}

export interface TemplateItem {
  productId: string
  unitPrice: number
  defaultQty: number
  notes: string
}

export interface OfferTemplate {
  id: string
  name: string
  description: string
  status: "active" | "inactive"
  category: string
  items: TemplateItem[]
  createdAt: string
  updatedAt: string
}

export interface ChecklistItem {
  id: string
  title: string
  done: boolean
  note: string
  doneAt: string | null
}

export interface ProductionItem {
  productId: string
  qty: number
  unitPrice: number
  notes: string
}

export interface ActivityEntry {
  id: string
  action: string
  user: string
  timestamp: string
}

export type ProductionStatus = "draft" | "in-production" | "done" | "cancelled"

export interface ProductionOffer {
  id: string
  code: string
  name: string
  templateId: string
  createdAt: string
  startDate: string
  deadline: string
  status: ProductionStatus
  selectedItems: ProductionItem[]
  checklist: ChecklistItem[]
  activity: ActivityEntry[]
}

export interface User {
  id: string
  name: string
  email: string
  status: "active" | "inactive"
}

// Mirrors future DB table "AdditionalInformation"
export interface AdditionalInformation {
  userId: string
  role: "admin" | "manager" | "viewer"
  type: "employee" | "admin"
}

export interface UserWithInfo {
  user: User
  additionalInformation: AdditionalInformation
}
