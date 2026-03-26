import type {
  Company,
  Part,
  Assembly,
  Product,
  InventoryItem,
  Quote,
  Project,
  UserWithInfo,
} from "./types"

// ===========================================
// COMPANIES
// ===========================================

export const companies: Company[] = [
  {
    id: "comp1",
    name: "ABC Industries SRL",
    contactPerson: "Ion Popescu",
    phone: "+40 721 123 456",
    address: "Str. Industriei 15, Cluj-Napoca",
    createdAt: "2025-06-15",
    updatedAt: "2026-02-10",
  },
  {
    id: "comp2",
    name: "XYZ Manufacturing",
    contactPerson: "Maria Ionescu",
    phone: "+40 722 234 567",
    address: "Bd. Muncii 42, Timisoara",
    createdAt: "2025-08-20",
    updatedAt: "2026-02-15",
  },
  {
    id: "comp3",
    name: "Delta Tech KFT",
    contactPerson: "Kovács István",
    phone: "+36 30 123 4567",
    address: "Ipari út 8, Debrecen",
    createdAt: "2025-09-10",
    updatedAt: "2026-01-20",
  },
  {
    id: "comp4",
    name: "Gamma Solutions GmbH",
    contactPerson: "Hans Mueller",
    phone: "+49 170 123 4567",
    address: "Industriestr. 22, München",
    createdAt: "2025-11-05",
    updatedAt: "2026-02-18",
  },
]

// ===========================================
// PARTS
// ===========================================

export const parts: Part[] = [
  {
    id: "part1",
    name: "Steel Plate 10mm",
    description: { ro: "Placă de oțel 10mm", hu: "10mm acéllemez", de: "10mm Stahlplatte", en: "10mm Steel Plate" },
    fileName: "steel_plate_10mm.dxf",
    fileLocation: "/laser/plates/steel/",
    unit: "pcs",
    basePrice: 45.0,
    createdAt: "2025-01-10",
    updatedAt: "2026-02-10",
  },
  {
    id: "part2",
    name: "Steel Rod 8mm",
    description: { ro: "Bară de oțel 8mm", hu: "8mm acélrúd", de: "8mm Stahlstab", en: "8mm Steel Rod" },
    fileName: "steel_rod_8mm.dxf",
    fileLocation: "/laser/rods/",
    unit: "m",
    basePrice: 12.5,
    createdAt: "2025-01-12",
    updatedAt: "2026-02-08",
  },
  {
    id: "part3",
    name: "Aluminum Sheet 5mm",
    description: { ro: "Foaie de aluminiu 5mm", hu: "5mm alumínium lemez", de: "5mm Aluminiumblech", en: "5mm Aluminum Sheet" },
    fileName: "alu_sheet_5mm.dxf",
    fileLocation: "/laser/plates/aluminum/",
    unit: "pcs",
    basePrice: 32.0,
    createdAt: "2025-01-15",
    updatedAt: "2026-02-12",
  },
  {
    id: "part4",
    name: "M10 Bolt Set",
    description: { ro: "Set șuruburi M10", hu: "M10 csavarkészlet", de: "M10 Schraubensatz", en: "M10 Bolt Set" },
    fileName: "",
    fileLocation: "",
    unit: "set",
    basePrice: 3.5,
    createdAt: "2025-01-18",
    updatedAt: "2026-02-15",
  },
  {
    id: "part5",
    name: "M12 Bolt Set",
    description: { ro: "Set șuruburi M12", hu: "M12 csavarkészlet", de: "M12 Schraubensatz", en: "M12 Bolt Set" },
    fileName: "",
    fileLocation: "",
    unit: "set",
    basePrice: 4.2,
    createdAt: "2025-01-20",
    updatedAt: "2026-02-14",
  },
  {
    id: "part6",
    name: "Welding Wire 1.2mm",
    description: { ro: "Sârmă de sudură 1.2mm", hu: "1.2mm hegesztőhuzal", de: "1.2mm Schweißdraht", en: "1.2mm Welding Wire" },
    fileName: "",
    fileLocation: "",
    unit: "kg",
    basePrice: 8.0,
    createdAt: "2025-01-22",
    updatedAt: "2026-02-11",
  },
  {
    id: "part7",
    name: "Industrial Paint RAL 7035",
    description: { ro: "Vopsea industrială RAL 7035", hu: "Ipari festék RAL 7035", de: "Industrielack RAL 7035", en: "Industrial Paint RAL 7035" },
    fileName: "",
    fileLocation: "",
    unit: "L",
    basePrice: 22.0,
    createdAt: "2025-01-25",
    updatedAt: "2026-02-09",
  },
  {
    id: "part8",
    name: "Silo Wall Panel",
    description: { ro: "Panou perete siloz", hu: "Siló falpanel", de: "Silo-Wandpaneel", en: "Silo Wall Panel" },
    fileName: "silo_wall_panel.dxf",
    fileLocation: "/laser/silo/walls/",
    unit: "pcs",
    basePrice: 120.0,
    createdAt: "2025-02-01",
    updatedAt: "2026-02-16",
  },
  {
    id: "part9",
    name: "Silo Roof Segment",
    description: { ro: "Segment acoperiș siloz", hu: "Siló tetőszegmens", de: "Silo-Dachsegment", en: "Silo Roof Segment" },
    fileName: "silo_roof_segment.dxf",
    fileLocation: "/laser/silo/roof/",
    unit: "pcs",
    basePrice: 85.0,
    createdAt: "2025-02-05",
    updatedAt: "2026-02-17",
  },
  {
    id: "part10",
    name: "Control Panel Housing",
    description: { ro: "Carcasă panou control", hu: "Vezérlőpanel ház", de: "Schaltschrankgehäuse", en: "Control Panel Housing" },
    fileName: "control_panel_housing.dxf",
    fileLocation: "/laser/enclosures/",
    unit: "pcs",
    basePrice: 180.0,
    createdAt: "2025-02-10",
    updatedAt: "2026-02-18",
  },
]

// ===========================================
// ASSEMBLIES
// ===========================================

export const assemblies: Assembly[] = [
  {
    id: "asm1",
    code: "ASM-001",
    name: "Frame Base Assembly",
    description: { ro: "Ansamblu bază cadru", hu: "Keret alap szerelvény", de: "Rahmen-Basis-Baugruppe", en: "Frame Base Assembly" },
    parts: [
      { partId: "part1", quantity: 4 },
      { partId: "part2", quantity: 8 },
      { partId: "part4", quantity: 16 },
    ],
    notes: "Standard frame for equipment mounting",
    createdAt: "2025-03-01",
    updatedAt: "2026-02-10",
  },
  {
    id: "asm2",
    code: "ASM-002",
    name: "Silo Wall Assembly",
    description: { ro: "Ansamblu perete siloz", hu: "Siló fal szerelvény", de: "Silo-Wand-Baugruppe", en: "Silo Wall Assembly" },
    parts: [
      { partId: "part8", quantity: 12 },
      { partId: "part4", quantity: 48 },
      { partId: "part5", quantity: 24 },
    ],
    notes: "Wall panels for silo construction",
    createdAt: "2025-03-05",
    updatedAt: "2026-02-12",
  },
  {
    id: "asm3",
    code: "ASM-003",
    name: "Silo Roof Assembly",
    description: { ro: "Ansamblu acoperiș siloz", hu: "Siló tető szerelvény", de: "Silo-Dach-Baugruppe", en: "Silo Roof Assembly" },
    parts: [
      { partId: "part9", quantity: 8 },
      { partId: "part4", quantity: 32 },
    ],
    notes: "Roof segments for silo top",
    createdAt: "2025-03-10",
    updatedAt: "2026-02-14",
  },
  {
    id: "asm4",
    code: "ASM-004",
    name: "Control Panel Assembly",
    description: { ro: "Ansamblu panou control", hu: "Vezérlőpanel szerelvény", de: "Schaltschrank-Baugruppe", en: "Control Panel Assembly" },
    parts: [
      { partId: "part10", quantity: 1 },
      { partId: "part4", quantity: 8 },
    ],
    notes: "Pre-assembled control panel enclosure",
    createdAt: "2025-03-15",
    updatedAt: "2026-02-16",
  },
]

// ===========================================
// PRODUCTS
// ===========================================

export const products: Product[] = [
  {
    id: "prod1",
    code: "SILO-INT-001",
    name: "Standard Interior Silo 50m³",
    description: {
      ro: "Siloz interior standard cu capacitate de 50m³",
      hu: "Szabványos beltéri siló 50m³ kapacitással",
      de: "Standard-Innensilo mit 50m³ Kapazität",
      en: "Standard interior silo with 50m³ capacity",
    },
    category: "silo-interior",
    unit: "pcs",
    basePrice: 8500.0,
    assemblyIds: ["asm2", "asm3"],
    partIds: ["part6", "part7"],
    assemblySteps: [
      { id: "s1", name: "Laser Cutting", type: "laser-cutting", description: "Cut wall and roof panels", order: 1 },
      { id: "s2", name: "CNC Bending", type: "cnc", description: "Bend panels to shape", order: 2 },
      { id: "s3", name: "Welding", type: "welding", description: "Weld panels together", order: 3 },
      { id: "s4", name: "Assembly", type: "assembly", description: "Final assembly", order: 4 },
    ],
    notes: "Standard model for indoor grain storage",
    createdAt: "2025-04-01",
    updatedAt: "2026-02-18",
  },
  {
    id: "prod2",
    code: "SILO-EXT-001",
    name: "Outdoor Silo 100m³",
    description: {
      ro: "Siloz exterior cu capacitate de 100m³",
      hu: "Kültéri siló 100m³ kapacitással",
      de: "Außensilo mit 100m³ Kapazität",
      en: "Outdoor silo with 100m³ capacity",
    },
    category: "silo-exterior",
    unit: "pcs",
    basePrice: 15000.0,
    assemblyIds: ["asm2", "asm3"],
    partIds: ["part6", "part7"],
    assemblySteps: [
      { id: "s1", name: "Plasma Cutting", type: "plasma-cutting", description: "Cut heavy gauge panels", order: 1 },
      { id: "s2", name: "Welding", type: "welding", description: "Heavy duty welding", order: 2 },
      { id: "s3", name: "Surface Treatment", type: "assembly", description: "Galvanizing and coating", order: 3 },
    ],
    notes: "Weather-resistant outdoor storage",
    createdAt: "2025-04-10",
    updatedAt: "2026-02-19",
  },
  {
    id: "prod3",
    code: "MAIA-001",
    name: "Maia Mixer Unit",
    description: {
      ro: "Unitate mixer Maia",
      hu: "Maia keverő egység",
      de: "Maia-Mischeinheit",
      en: "Maia mixer unit",
    },
    category: "maia",
    unit: "pcs",
    basePrice: 4200.0,
    assemblyIds: ["asm1"],
    partIds: ["part1", "part2", "part6"],
    assemblySteps: [
      { id: "s1", name: "Laser Cutting", type: "laser-cutting", description: "Cut frame parts", order: 1 },
      { id: "s2", name: "Welding", type: "welding", description: "Weld frame", order: 2 },
      { id: "s3", name: "Assembly", type: "assembly", description: "Mount motor and mixer", order: 3 },
    ],
    notes: "Industrial dough mixer",
    createdAt: "2025-05-01",
    updatedAt: "2026-02-17",
  },
  {
    id: "prod4",
    code: "CTRL-001",
    name: "Standard Control Panel",
    description: {
      ro: "Panou de control standard",
      hu: "Szabványos vezérlőpanel",
      de: "Standard-Schaltschrank",
      en: "Standard control panel",
    },
    category: "control-panel",
    unit: "pcs",
    basePrice: 2800.0,
    assemblyIds: ["asm4"],
    partIds: [],
    assemblySteps: [
      { id: "s1", name: "Laser Cutting", type: "laser-cutting", description: "Cut enclosure", order: 1 },
      { id: "s2", name: "CNC Punching", type: "cnc", description: "Punch mounting holes", order: 2 },
      { id: "s3", name: "Assembly", type: "assembly", description: "Wire and mount components", order: 3 },
    ],
    notes: "Pre-wired control panel",
    createdAt: "2025-05-15",
    updatedAt: "2026-02-16",
  },
  {
    id: "prod5",
    code: "BLOW-001",
    name: "Industrial Blower Unit",
    description: {
      ro: "Unitate suflantă industrială",
      hu: "Ipari fúvó egység",
      de: "Industriegebläse-Einheit",
      en: "Industrial blower unit",
    },
    category: "blower",
    unit: "pcs",
    basePrice: 3500.0,
    assemblyIds: ["asm1"],
    partIds: ["part3", "part4"],
    assemblySteps: [
      { id: "s1", name: "Laser Cutting", type: "laser-cutting", description: "Cut housing", order: 1 },
      { id: "s2", name: "Welding", type: "welding", description: "Weld housing", order: 2 },
      { id: "s3", name: "Assembly", type: "assembly", description: "Mount motor and impeller", order: 3 },
    ],
    notes: "High-pressure industrial blower",
    createdAt: "2025-06-01",
    updatedAt: "2026-02-15",
  },
]

// ===========================================
// INVENTORY
// ===========================================

export const inventoryItems: InventoryItem[] = [
  { id: "inv1", type: "product", itemId: "prod1", partId: "prod1", quantity: 2, minStock: 1, location: "Warehouse A", updatedAt: "2026-02-18" },
  { id: "inv2", type: "product", itemId: "prod4", partId: "prod4", quantity: 5, minStock: 2, location: "Warehouse A", updatedAt: "2026-02-17" },
  { id: "inv3", type: "part", itemId: "part1", partId: "part1", quantity: 100, minStock: 50, location: "Warehouse B", updatedAt: "2026-02-16" },
  { id: "inv4", type: "part", itemId: "part2", partId: "part2", quantity: 250, minStock: 100, location: "Warehouse B", updatedAt: "2026-02-15" },
  { id: "inv5", type: "part", itemId: "part4", partId: "part4", quantity: 500, minStock: 200, location: "Warehouse B", updatedAt: "2026-02-14" },
  { id: "inv6", type: "part", itemId: "part8", partId: "part8", quantity: 20, minStock: 30, location: "Warehouse C", updatedAt: "2026-02-13" },
  { id: "inv7", type: "part", itemId: "part6", partId: "part6", quantity: 15, minStock: 10, location: "Warehouse B", updatedAt: "2026-02-12" },
  { id: "inv8", type: "part", itemId: "part7", partId: "part7", quantity: 50, minStock: 20, location: "Warehouse C", updatedAt: "2026-02-11" },
]

// ===========================================
// QUOTES (formerly Templates)
// ===========================================

export const quotes: Quote[] = [
  {
    id: "q1",
    name: "Silo Installation Package - ABC Industries",
    description: "Complete silo installation with control panel",
    companyId: "comp1",
    status: "approved",
    validity: "2026-04-15",
    deliveryTimeWeeks: 8,
    items: [
      { productId: "prod1", unitPrice: 8500.0, quantity: 2, notes: "Standard configuration" },
      { productId: "prod4", unitPrice: 2800.0, quantity: 1, notes: "Pre-wired" },
    ],
    installation: 2500.0,
    notes: "Installation includes transport and setup",
    createdAt: "2026-01-10",
    updatedAt: "2026-02-15",
  },
  {
    id: "q2",
    name: "Outdoor Storage Solution - XYZ Manufacturing",
    description: "Large outdoor silo for grain storage",
    companyId: "comp2",
    status: "pending",
    validity: "2026-05-01",
    deliveryTimeWeeks: 12,
    items: [
      { productId: "prod2", unitPrice: 15000.0, quantity: 1, notes: "" },
      { productId: "prod5", unitPrice: 3500.0, quantity: 2, notes: "" },
    ],
    installation: 4000.0,
    notes: "Requires foundation preparation by client",
    createdAt: "2026-02-01",
    updatedAt: "2026-02-18",
  },
  {
    id: "q3",
    name: "Bakery Equipment - Delta Tech",
    description: "Maia mixer and control system",
    companyId: "comp3",
    status: "draft",
    validity: "2026-03-30",
    deliveryTimeWeeks: 6,
    items: [
      { productId: "prod3", unitPrice: 4200.0, quantity: 3, notes: "" },
      { productId: "prod4", unitPrice: 2800.0, quantity: 1, notes: "" },
    ],
    installation: 1500.0,
    notes: "",
    createdAt: "2026-02-10",
    updatedAt: "2026-02-19",
  },
  {
    id: "q4",
    name: "Internal Project - Workshop Upgrade",
    description: "Internal equipment upgrade",
    companyId: null,
    status: "approved",
    validity: "2026-06-30",
    deliveryTimeWeeks: 4,
    items: [
      { productId: "prod5", unitPrice: 3500.0, quantity: 1, notes: "" },
    ],
    installation: 0,
    notes: "Internal use only",
    createdAt: "2026-02-15",
    updatedAt: "2026-02-15",
  },
]

// ===========================================
// PROJECTS (formerly Production Offers)
// ===========================================

export const projects: Project[] = [
  {
    id: "proj1",
    code: "PRJ-2026-001",
    name: "ABC Industries Silo Installation",
    companyId: "comp1",
    quoteId: "q1",
    status: "in-progress",
    startDate: "2026-02-01",
    deadline: "2026-04-01",
    finishDate: null,
    warrantyExpiration: null,
    items: [
      { productId: "prod1", quantity: 2, unitPrice: 8500.0, notes: "", fromInventory: false },
      { productId: "prod4", quantity: 1, unitPrice: 2800.0, notes: "", fromInventory: true },
    ],
    checklist: [
      { id: "c1", title: "Material procurement", done: true, note: "All materials received", doneAt: "2026-02-05" },
      { id: "c2", title: "Panel fabrication", done: true, note: "", doneAt: "2026-02-12" },
      { id: "c3", title: "Welding assembly", done: true, note: "", doneAt: "2026-02-20" },
      { id: "c4", title: "Surface treatment", done: false, note: "", doneAt: null },
      { id: "c5", title: "Quality inspection", done: false, note: "", doneAt: null },
      { id: "c6", title: "Delivery & installation", done: false, note: "", doneAt: null },
    ],
    issues: [],
    activity: [
      { id: "a1", action: "Project created", user: "Claudiu Ardelean", timestamp: "2026-02-01 09:00" },
      { id: "a2", action: "Status changed to In Progress", user: "Claudiu Ardelean", timestamp: "2026-02-01 09:30" },
      { id: "a3", action: "Material procurement completed", user: "Radu Muresan", timestamp: "2026-02-05 14:00" },
    ],
    createdAt: "2026-02-01",
    updatedAt: "2026-02-20",
  },
  {
    id: "proj2",
    code: "PRJ-2026-002",
    name: "Workshop Blower Installation",
    companyId: null,
    quoteId: "q4",
    status: "done",
    startDate: "2026-01-15",
    deadline: "2026-02-15",
    finishDate: "2026-02-10",
    warrantyExpiration: "2028-02-10",
    items: [
      { productId: "prod5", quantity: 1, unitPrice: 3500.0, notes: "", fromInventory: false },
    ],
    checklist: [
      { id: "c1", title: "Fabrication", done: true, note: "", doneAt: "2026-01-25" },
      { id: "c2", title: "Installation", done: true, note: "", doneAt: "2026-02-08" },
      { id: "c3", title: "Testing", done: true, note: "", doneAt: "2026-02-10" },
    ],
    issues: [],
    activity: [
      { id: "a1", action: "Project created", user: "Claudiu Ardelean", timestamp: "2026-01-15 10:00" },
      { id: "a2", action: "Project completed", user: "Radu Muresan", timestamp: "2026-02-10 16:00" },
    ],
    createdAt: "2026-01-15",
    updatedAt: "2026-02-10",
  },
  {
    id: "proj3",
    code: "PRJ-2026-003",
    name: "Delta Tech Bakery Equipment",
    companyId: "comp3",
    quoteId: "q3",
    status: "draft",
    startDate: "2026-03-01",
    deadline: "2026-04-15",
    finishDate: null,
    warrantyExpiration: null,
    items: [
      { productId: "prod3", quantity: 3, unitPrice: 4200.0, notes: "", fromInventory: false },
      { productId: "prod4", quantity: 1, unitPrice: 2800.0, notes: "", fromInventory: true },
    ],
    checklist: [],
    issues: [],
    activity: [
      { id: "a1", action: "Project created from quote", user: "Claudiu Ardelean", timestamp: "2026-02-19 11:00" },
    ],
    createdAt: "2026-02-19",
    updatedAt: "2026-02-19",
  },
  {
    id: "proj4",
    code: "PRJ-2026-004",
    name: "Gamma Solutions Control Panel",
    companyId: "comp4",
    quoteId: null,
    status: "in-progress",
    startDate: "2026-02-10",
    deadline: "2026-02-28",
    finishDate: null,
    warrantyExpiration: null,
    items: [
      { productId: "prod4", quantity: 2, unitPrice: 2800.0, notes: "Custom configuration", fromInventory: false },
    ],
    checklist: [
      { id: "c1", title: "Enclosure fabrication", done: true, note: "", doneAt: "2026-02-15" },
      { id: "c2", title: "Wiring", done: false, note: "", doneAt: null },
      { id: "c3", title: "Testing", done: false, note: "", doneAt: null },
    ],
    issues: [
      { id: "i1", description: "Missing PLC module - waiting for delivery", solved: false, solvedAt: null, createdAt: "2026-02-18" },
    ],
    activity: [
      { id: "a1", action: "Project created", user: "Claudiu Ardelean", timestamp: "2026-02-10 08:00" },
      { id: "a2", action: "Issue reported: Missing PLC module", user: "Radu Muresan", timestamp: "2026-02-18 11:30" },
    ],
    createdAt: "2026-02-10",
    updatedAt: "2026-02-18",
  },
]

// ===========================================
// USERS
// ===========================================

export const usersWithInfo: UserWithInfo[] = [
  {
    user: { id: "u1", name: "Claudiu Ardelean", email: "claudiu.ardelean@smsreitler.com", status: "active" },
    additionalInformation: { userId: "u1", role: "admin", type: "admin" },
  },
  {
    user: { id: "u2", name: "Radu Muresan", email: "radu.muresan@smsreitler.com", status: "active" },
    additionalInformation: { userId: "u2", role: "admin", type: "admin" },
  },
  {
    user: { id: "u3", name: "Maria Ionescu", email: "maria.ionescu@smsreitler.com", status: "active" },
    additionalInformation: { userId: "u3", role: "employee", type: "employee" },
  },
  {
    user: { id: "u4", name: "Ion Popescu", email: "ion.popescu@smsreitler.com", status: "active" },
    additionalInformation: { userId: "u4", role: "employee", type: "employee" },
  },
  {
    user: { id: "u5", name: "Ana Dobre", email: "ana.dobre@smsreitler.com", status: "inactive" },
    additionalInformation: { userId: "u5", role: "employee", type: "employee" },
  },
]
