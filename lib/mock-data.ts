import type {
  Product,
  OfferTemplate,
  ProductionOffer,
  UserWithInfo,
} from "./types"

export const products: Product[] = [
  { id: "p1", code: "STL-001", name: "Steel Plate 10mm", unit: "pcs", basePrice: 45.0, category: "Raw Materials", notes: "Standard grade", updatedAt: "2026-02-10" },
  { id: "p2", code: "STL-002", name: "Steel Rod 8mm", unit: "m", basePrice: 12.5, category: "Raw Materials", notes: "", updatedAt: "2026-02-08" },
  { id: "p3", code: "ALU-001", name: "Aluminum Sheet 5mm", unit: "pcs", basePrice: 32.0, category: "Raw Materials", notes: "Marine grade", updatedAt: "2026-02-12" },
  { id: "p4", code: "BLT-001", name: "M10 Bolt Set", unit: "set", basePrice: 3.5, category: "Fasteners", notes: "Stainless steel", updatedAt: "2026-02-15" },
  { id: "p5", code: "BLT-002", name: "M12 Bolt Set", unit: "set", basePrice: 4.2, category: "Fasteners", notes: "Zinc coated", updatedAt: "2026-02-14" },
  { id: "p6", code: "WLD-001", name: "Welding Wire 1.2mm", unit: "kg", basePrice: 8.0, category: "Consumables", notes: "MIG wire", updatedAt: "2026-02-11" },
  { id: "p7", code: "PNT-001", name: "Industrial Paint RAL 7035", unit: "L", basePrice: 22.0, category: "Consumables", notes: "Light gray", updatedAt: "2026-02-09" },
  { id: "p8", code: "GAS-001", name: "Argon Gas Cylinder", unit: "pcs", basePrice: 65.0, category: "Consumables", notes: "50L cylinder", updatedAt: "2026-02-13" },
  { id: "p9", code: "CMP-001", name: "Control Panel Assembly", unit: "pcs", basePrice: 280.0, category: "Components", notes: "Pre-wired", updatedAt: "2026-02-16" },
  { id: "p10", code: "CMP-002", name: "Hydraulic Pump Unit", unit: "pcs", basePrice: 520.0, category: "Components", notes: "15kW rated", updatedAt: "2026-02-17" },
]

export const offerTemplates: OfferTemplate[] = [
  {
    id: "t1",
    name: "Standard Steel Frame",
    description: "Basic steel frame assembly with standard fasteners and finishing",
    status: "active",
    category: "Structural",
    items: [
      { productId: "p1", unitPrice: 45.0, defaultQty: 20, notes: "Cut to spec" },
      { productId: "p2", unitPrice: 12.5, defaultQty: 50, notes: "" },
      { productId: "p4", unitPrice: 3.5, defaultQty: 100, notes: "" },
      { productId: "p6", unitPrice: 8.0, defaultQty: 5, notes: "" },
      { productId: "p7", unitPrice: 22.0, defaultQty: 10, notes: "2 coats" },
    ],
    createdAt: "2026-01-10",
    updatedAt: "2026-02-15",
  },
  {
    id: "t2",
    name: "Hydraulic Press Assembly",
    description: "Complete hydraulic press with control panel and structural components",
    status: "active",
    category: "Machinery",
    items: [
      { productId: "p1", unitPrice: 45.0, defaultQty: 10, notes: "Heavy gauge" },
      { productId: "p3", unitPrice: 32.0, defaultQty: 8, notes: "" },
      { productId: "p5", unitPrice: 4.2, defaultQty: 60, notes: "" },
      { productId: "p9", unitPrice: 280.0, defaultQty: 1, notes: "" },
      { productId: "p10", unitPrice: 520.0, defaultQty: 1, notes: "" },
      { productId: "p8", unitPrice: 65.0, defaultQty: 2, notes: "" },
    ],
    createdAt: "2026-01-20",
    updatedAt: "2026-02-18",
  },
  {
    id: "t3",
    name: "Aluminum Enclosure",
    description: "Lightweight aluminum enclosure with paint finish",
    status: "active",
    category: "Enclosures",
    items: [
      { productId: "p3", unitPrice: 32.0, defaultQty: 15, notes: "" },
      { productId: "p4", unitPrice: 3.5, defaultQty: 40, notes: "" },
      { productId: "p7", unitPrice: 22.0, defaultQty: 5, notes: "Powder coat" },
    ],
    createdAt: "2026-02-01",
    updatedAt: "2026-02-19",
  },
  {
    id: "t4",
    name: "Welding Station Kit",
    description: "Complete welding station setup kit with consumables",
    status: "inactive",
    category: "Equipment",
    items: [
      { productId: "p6", unitPrice: 8.0, defaultQty: 10, notes: "" },
      { productId: "p8", unitPrice: 65.0, defaultQty: 3, notes: "" },
      { productId: "p2", unitPrice: 12.5, defaultQty: 20, notes: "Practice rods" },
    ],
    createdAt: "2026-01-05",
    updatedAt: "2026-02-01",
  },
]

export const productionOffers: ProductionOffer[] = [
  {
    id: "po1",
    code: "PO-2026-001",
    name: "Steel Frame - Order #4521",
    templateId: "t1",
    createdAt: "2026-02-01",
    startDate: "2026-02-03",
    deadline: "2026-02-20",
    status: "in-production",
    selectedItems: [
      { productId: "p1", qty: 25, unitPrice: 45.0, notes: "Custom cut 1200mm" },
      { productId: "p2", qty: 60, unitPrice: 12.5, notes: "" },
      { productId: "p4", qty: 120, unitPrice: 3.5, notes: "" },
      { productId: "p6", qty: 6, unitPrice: 8.0, notes: "" },
      { productId: "p7", qty: 12, unitPrice: 22.0, notes: "" },
    ],
    checklist: [
      { id: "c1", title: "Material procurement", done: true, note: "All received", doneAt: "2026-02-02" },
      { id: "c2", title: "Cutting & shaping", done: true, note: "", doneAt: "2026-02-05" },
      { id: "c3", title: "Welding assembly", done: true, note: "Section A complete", doneAt: "2026-02-08" },
      { id: "c4", title: "Quality inspection", done: false, note: "", doneAt: null },
      { id: "c5", title: "Surface treatment", done: false, note: "", doneAt: null },
      { id: "c6", title: "Paint finishing", done: false, note: "", doneAt: null },
      { id: "c7", title: "Final inspection & packaging", done: false, note: "", doneAt: null },
    ],
    activity: [
      { id: "a1", action: "Production offer created", user: "Claudiu Ardelean", timestamp: "2026-02-01 09:30" },
      { id: "a2", action: "Status changed to In Production", user: "Claudiu Ardelean", timestamp: "2026-02-03 08:00" },
      { id: "a3", action: "Material procurement completed", user: "Radu Muresan", timestamp: "2026-02-02 14:20" },
      { id: "a4", action: "Welding assembly completed", user: "Radu Muresan", timestamp: "2026-02-08 16:45" },
    ],
  },
  {
    id: "po2",
    code: "PO-2026-002",
    name: "Hydraulic Press - Client XYZ",
    templateId: "t2",
    createdAt: "2026-02-05",
    startDate: "2026-02-10",
    deadline: "2026-03-10",
    status: "in-production",
    selectedItems: [
      { productId: "p1", qty: 12, unitPrice: 45.0, notes: "" },
      { productId: "p3", qty: 10, unitPrice: 32.0, notes: "" },
      { productId: "p9", qty: 1, unitPrice: 280.0, notes: "Pre-configured" },
      { productId: "p10", qty: 1, unitPrice: 520.0, notes: "" },
    ],
    checklist: [
      { id: "c1", title: "Material procurement", done: true, note: "", doneAt: "2026-02-07" },
      { id: "c2", title: "Frame fabrication", done: true, note: "", doneAt: "2026-02-12" },
      { id: "c3", title: "Hydraulic system install", done: false, note: "", doneAt: null },
      { id: "c4", title: "Electrical wiring", done: false, note: "", doneAt: null },
      { id: "c5", title: "Testing & calibration", done: false, note: "", doneAt: null },
    ],
    activity: [
      { id: "a1", action: "Production offer created", user: "Claudiu Ardelean", timestamp: "2026-02-05 11:00" },
      { id: "a2", action: "Status changed to In Production", user: "Radu Muresan", timestamp: "2026-02-10 08:00" },
    ],
  },
  {
    id: "po3",
    code: "PO-2026-003",
    name: "Aluminum Enclosure Batch A",
    templateId: "t3",
    createdAt: "2026-02-10",
    startDate: "2026-02-12",
    deadline: "2026-02-18",
    status: "done",
    selectedItems: [
      { productId: "p3", qty: 20, unitPrice: 32.0, notes: "" },
      { productId: "p4", qty: 50, unitPrice: 3.5, notes: "" },
      { productId: "p7", qty: 8, unitPrice: 22.0, notes: "White powder coat" },
    ],
    checklist: [
      { id: "c1", title: "Material procurement", done: true, note: "", doneAt: "2026-02-11" },
      { id: "c2", title: "CNC cutting", done: true, note: "", doneAt: "2026-02-13" },
      { id: "c3", title: "Bending & forming", done: true, note: "", doneAt: "2026-02-14" },
      { id: "c4", title: "Powder coating", done: true, note: "", doneAt: "2026-02-16" },
      { id: "c5", title: "Assembly & QC", done: true, note: "", doneAt: "2026-02-17" },
    ],
    activity: [
      { id: "a1", action: "Production offer created", user: "Claudiu Ardelean", timestamp: "2026-02-10 10:00" },
      { id: "a2", action: "Status changed to Done", user: "Radu Muresan", timestamp: "2026-02-17 15:30" },
    ],
  },
  {
    id: "po4",
    code: "PO-2026-004",
    name: "Steel Frame - Order #4580",
    templateId: "t1",
    createdAt: "2026-02-15",
    startDate: "2026-02-17",
    deadline: "2026-03-05",
    status: "draft",
    selectedItems: [
      { productId: "p1", qty: 15, unitPrice: 45.0, notes: "" },
      { productId: "p2", qty: 40, unitPrice: 12.5, notes: "" },
      { productId: "p4", qty: 80, unitPrice: 3.5, notes: "" },
    ],
    checklist: [
      { id: "c1", title: "Material procurement", done: false, note: "", doneAt: null },
      { id: "c2", title: "Cutting & shaping", done: false, note: "", doneAt: null },
      { id: "c3", title: "Welding assembly", done: false, note: "", doneAt: null },
    ],
    activity: [
      { id: "a1", action: "Production offer created", user: "Claudiu Ardelean", timestamp: "2026-02-15 14:00" },
    ],
  },
  {
    id: "po5",
    code: "PO-2026-005",
    name: "Enclosure Batch B",
    templateId: "t3",
    createdAt: "2026-02-18",
    startDate: "2026-02-20",
    deadline: "2026-03-01",
    status: "draft",
    selectedItems: [
      { productId: "p3", qty: 10, unitPrice: 32.0, notes: "" },
      { productId: "p4", qty: 25, unitPrice: 3.5, notes: "" },
    ],
    checklist: [],
    activity: [
      { id: "a1", action: "Production offer created", user: "Claudiu Ardelean", timestamp: "2026-02-18 09:00" },
    ],
  },
  {
    id: "po6",
    code: "PO-2026-006",
    name: "Press Unit #2 - Client ABC",
    templateId: "t2",
    createdAt: "2026-02-19",
    startDate: "2026-02-22",
    deadline: "2026-03-15",
    status: "cancelled",
    selectedItems: [
      { productId: "p1", qty: 8, unitPrice: 45.0, notes: "" },
      { productId: "p10", qty: 1, unitPrice: 520.0, notes: "" },
    ],
    checklist: [
      { id: "c1", title: "Material procurement", done: false, note: "Cancelled before start", doneAt: null },
    ],
    activity: [
      { id: "a1", action: "Production offer created", user: "Radu Muresan", timestamp: "2026-02-19 11:00" },
      { id: "a2", action: "Status changed to Cancelled", user: "Claudiu Ardelean", timestamp: "2026-02-20 09:00" },
    ],
  },
]

export const usersWithInfo: UserWithInfo[] = [
  {
    user: { id: "u1", name: "Claudiu Ardelean", email: "claudiu.ardelean@codeindustry.net", status: "active" },
    additionalInformation: { userId: "u1", role: "admin", type: "admin" },
  },
  {
    user: { id: "u2", name: "Radu Muresan", email: "radu@codeindustry.net", status: "active" },
    additionalInformation: { userId: "u2", role: "manager", type: "admin" },
  },
  {
    user: { id: "u3", name: "Delia Muresan", email: "delia.muresan@gmail.com", status: "active" },
    additionalInformation: { userId: "u3", role: "viewer", type: "employee" },
  },
  {
    user: { id: "u4", name: "Test CodeIndustry", email: "test@codeindustry.com", status: "inactive" },
    additionalInformation: { userId: "u4", role: "viewer", type: "employee" },
  },
  {
    user: { id: "u5", name: "John Doe", email: "john.doe@company.com", status: "active" },
    additionalInformation: { userId: "u5", role: "manager", type: "employee" },
  },
  {
    user: { id: "u6", name: "Ana Popescu", email: "ana.popescu@company.com", status: "active" },
    additionalInformation: { userId: "u6", role: "viewer", type: "employee" },
  },
  {
    user: { id: "u7", name: "Maria Ionescu", email: "maria.ionescu@company.com", status: "active" },
    additionalInformation: { userId: "u7", role: "admin", type: "admin" },
  },
]
