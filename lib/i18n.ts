"use client"

// UI Languages: RO | HU | EN only
export type Locale = "ro" | "hu" | "en"

// Quote export languages include German
export type QuoteLocale = "ro" | "hu" | "de" | "en"

export const locales: Locale[] = ["ro", "hu", "en"]
export const quoteLocales: QuoteLocale[] = ["ro", "hu", "de", "en"]

export const localeNames: Record<Locale, string> = {
  ro: "RO",
  hu: "HU",
  en: "EN",
}

export const quoteLocaleNames: Record<QuoteLocale, string> = {
  ro: "Romana",
  hu: "Magyar",
  de: "Deutsch",
  en: "English",
}

type TranslationKeys = {
  // Simple Navigation Keys (used by sidebar)
  "dashboard": string
  "management": string
  "companies": string
  "projects": string
  "quotes": string
  "materials": string
  "products": string
  "assemblies": string
  "inventory": string
  "reports": string
  "users": string
  "settings": string

  // Navigation (prefixed)
  "nav.dashboard": string
  "nav.management": string
  "nav.projects": string
  "nav.quotes": string
  "nav.materials": string
  "nav.products": string
  "nav.settings": string
  "nav.assemblies": string
  "nav.inventory": string
  "nav.users": string
  "nav.reports": string
  "nav.companies": string

  // Common
  "common.add": string
  "common.edit": string
  "common.delete": string
  "common.save": string
  "common.saved": string
  "common.cancel": string
  "common.search": string
  "common.filter": string
  "common.view": string
  "common.viewDetails": string
  "common.actions": string
  "common.create": string
  "common.generate": string
  "common.export": string
  "common.duplicate": string
  "common.back": string
  "common.name": string
  "common.description": string
  "common.status": string
  "common.createdAt": string
  "common.updatedAt": string
  "common.category": string
  "common.price": string
  "common.quantity": string
  "common.total": string
  "common.notes": string
  "common.code": string
  "common.progress": string
  "common.email": string
  "common.phone": string
  "common.address": string
  "common.company": string
  "common.all": string
  "common.found": string
  "common.unknown": string
  "common.startDate": string
  "common.items": string
  "common.type": string
  "common.duplicated": string
  "common.deleted": string
  "common.savedSuccessfully": string

  // Login
  "login.title": string
  "login.subtitle": string
  "login.email": string
  "login.password": string
  "login.signIn": string
  "login.success": string
  "login.invalidCredentials": string
  "login.demoAccounts": string
  "login.loginAsAdmin": string
  "login.loginAsEmployee": string
  "login.demoNote": string

  // Status
  "status.active": string
  "status.inactive": string
  "status.draft": string
  "status.pending": string
  "status.approved": string
  "status.rejected": string
  "status.completed": string
  "status.cancelled": string
  "status.inProgress": string
  "status.done": string

  // Dashboard
  "dashboard.welcome": string
  "dashboard.totalQuotes": string
  "dashboard.totalCompanies": string
  "dashboard.activeProjects": string
  "dashboard.completedProjects": string
  "dashboard.projectsWithIssues": string
  "dashboard.recentActivity": string
  "dashboard.projectsOverview": string
  "dashboard.activity1": string
  "dashboard.activity2": string
  "dashboard.activity3": string
  "dashboard.activity4": string
  "dashboard.activity5": string
  "dashboard.daysAgo": string
  "dashboard.weekAgo": string

  // Settings
  "settings.description": string
  "settings.profile": string
  "settings.profileDescription": string
  "settings.preferences": string
  "settings.preferencesDescription": string
  "settings.theme": string
  "settings.themeHint": string
  "settings.language": string
  "settings.languageHint": string
  "settings.organization": string
  "settings.organizationDescription": string
  "settings.organizationPlaceholder": string

  // Theme
  "theme.light": string
  "theme.dark": string
  "theme.system": string

  // Companies
  "companies.title": string
  "companies.description": string
  "companies.addCompany": string
  "companies.contactPerson": string
  "companies.associatedProjects": string
  "companies.associatedQuotes": string

  // Quotes
  "quotes.title": string
  "quotes.description": string
  "quotes.addQuote": string
  "quotes.validity": string
  "quotes.deliveryTime": string
  "quotes.deliveryWeeks": string
  "quotes.generateQuote": string
  "quotes.installation": string
  "quotes.createProject": string
  "quotes.selectLanguage": string
  "quotes.items": string
  "quotes.quoteSummary": string
  "quotes.selectCompany": string
  "quotes.personal": string

  // Projects
  "projects.title": string
  "projects.description": string
  "projects.addProject": string
  "projects.generateProject": string
  "projects.startDate": string
  "projects.deadline": string
  "projects.finishDate": string
  "projects.warranty": string
  "projects.warrantyExpiration": string
  "projects.warrantyNote": string
  "projects.issues": string
  "projects.checklist": string
  "projects.activity": string
  "projects.noIssues": string
  "projects.openIssues": string
  "projects.activeIssues": string
  "projects.activeIssue": string
  "projects.noActiveIssue": string
  "projects.markSolved": string
  "projects.solve": string
  "projects.solved": string
  "projects.addIssue": string
  "projects.reportIssue": string
  "projects.issueReported": string
  "projects.issueResolved": string
  "projects.issuePlaceholder": string
  "projects.finishProject": string
  "projects.finishProjectDesc": string
  "projects.confirmFinish": string
  "projects.projectFinished": string
  "projects.fromQuote": string
  "projects.selectQuote": string
  "projects.selectQuotePlaceholder": string
  "projects.noQuote": string
  "projects.quoteOptionalNote": string
  "projects.selectProducts": string
  "projects.selectCompany": string
  "projects.selectCompanyPlaceholder": string
  "projects.personalProject": string
  "projects.personalProjectDesc": string
  "projects.personal": string
  "projects.companyProjects": string
  "projects.personalProjects": string
  "projects.projectType": string
  "projects.wizardStep": string
  "projects.createProject": string
  "projects.projectName": string
  "projects.projectNamePlaceholder": string
  "projects.summary": string
  "projects.inStock": string
  "projects.fromInventory": string
  "projects.needsProduction": string
  "projects.source": string
  "projects.noProjectsFound": string
  "projects.linkedQuote": string
  "projects.noProductsAdded": string
  "projects.noChecklistItems": string
  "projects.addChecklistItem": string
  "projects.itemTitle": string
  "projects.checklistPlaceholder": string
  "common.optional": string
  "common.next": string

  // Products
  "products.title": string
  "products.description": string
  "products.addProduct": string
  "products.product": string
  "products.productName": string
  "products.assemblySteps": string
  "products.assemblyStepsDesc": string
  "products.parts": string
  "products.unit": string
  "products.basePrice": string
  "products.subtitle": string
  "products.searchPlaceholder": string
  "products.category": string
  "products.steps": string
  "products.deleted": string
  "products.noProductsFound": string
  "products.notFound": string
  "products.subassemblies": string
  "products.totalParts": string
  "products.structure": string
  "products.generatedParts": string
  "products.generatedPartsTable": string
  "products.generatedPartsDesc": string
  "products.directPart": string
  "products.directParts": string
  "products.directPartsDesc": string
  "products.noSubassemblies": string
  "products.noParts": string
  "products.noSteps": string
  "products.viewParts": string
  "products.source": string
  "products.productionSteps": string
  "products.requiredParts": string

  // Categories
  "category.siloInterior": string
  "category.siloExterior": string
  "category.maia": string
  "category.dissolver": string
  "category.blower": string
  "category.cycloneDoser": string
  "category.controlPanel": string
  "category.other": string
  "category.all": string

  // Materials
  "materials.title": string
  "materials.description": string
  "materials.assemblies": string
  "materials.inventory": string
  "materials.addAssembly": string
  "materials.addPart": string
  "materials.addToInventory": string
  "materials.location": string
  "materials.partCount": string
  "materials.subtitle": string
  "materials.totalAssemblies": string
  "materials.inventoryItems": string
  "materials.searchAssemblies": string
  "materials.searchInventory": string
  "materials.addInventory": string
  "materials.partsCount": string
  "materials.part": string
  "materials.minStock": string
  "materials.lowStock": string
  "materials.inStock": string
  "materials.assemblyDeleted": string
  "materials.inventoryDeleted": string
  "materials.noAssembliesFound": string
  "materials.noInventoryFound": string
  "materials.assembliesSubtitle": string
  "materials.inventorySubtitle": string
  "materials.totalParts": string
  "materials.parts": string
  "materials.noPartsAdded": string
  "materials.assemblyFormDesc": string
  "materials.inventoryFormDesc": string
  "materials.totalItems": string
  "materials.partsInStock": string
  "materials.productsInStock": string
  "materials.fileName": string
  "materials.fileLocation": string

  // Users
  "users.title": string
  "users.description": string
  "users.employees": string
  "users.admins": string
  "users.addUser": string
  "users.role": string
  "users.subtitle": string
  "users.inviteUser": string
  "users.usersCount": string
  "users.adminsManagers": string
  "users.deleted": string
  "users.inviteSent": string
  "users.noUsersFound": string
  "users.deleteUser": string
  "users.deleteConfirm": string

  // Reports
  "reports.title": string
  "reports.description": string
  "reports.inProgress": string
  "reports.completed": string
  "reports.cancelled": string
  "reports.subtitle": string
  "reports.exportReport": string
  "reports.exportStarted": string
  "reports.allProjects": string
}

const translations: Record<Locale, TranslationKeys> = {
  en: {
    // Simple Navigation Keys
    "dashboard": "Dashboard",
    "management": "Management",
    "companies": "Companies",
    "projects": "Projects",
    "quotes": "Quotes",
    "materials": "Materials",
    "products": "Products",
    "assemblies": "Assemblies",
    "inventory": "Inventory",
    "reports": "Reports",
    "users": "Users",
    "settings": "Settings",

    // Navigation (prefixed)
    "nav.dashboard": "Dashboard",
    "nav.management": "Management",
    "nav.projects": "Projects",
    "nav.quotes": "Quotes",
    "nav.materials": "Materials",
    "nav.products": "Products",
    "nav.settings": "Settings",
    "nav.assemblies": "Assemblies",
    "nav.inventory": "Inventory",
    "nav.users": "Users",
    "nav.reports": "Reports",
    "nav.companies": "Companies",

    // Common
    "common.add": "Add",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.save": "Save",
    "common.saved": "Saved",
    "common.cancel": "Cancel",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.view": "View",
    "common.viewDetails": "View Details",
    "common.actions": "Actions",
    "common.create": "Create",
    "common.generate": "Generate",
    "common.export": "Export",
    "common.duplicate": "Duplicate",
    "common.back": "Back",
    "common.name": "Name",
    "common.description": "Description",
    "common.status": "Status",
    "common.createdAt": "Created At",
    "common.updatedAt": "Updated At",
    "common.category": "Category",
    "common.price": "Price",
    "common.quantity": "Quantity",
    "common.total": "Total",
    "common.notes": "Notes",
    "common.code": "Code",
    "common.progress": "Progress",
    "common.email": "Email",
    "common.phone": "Phone",
    "common.address": "Address",
    "common.company": "Company",
    "common.all": "All",
    "common.found": "found",
    "common.unknown": "Unknown",
    "common.startDate": "Start Date",
    "common.items": "items",
    "common.type": "Type",
    "common.duplicated": "Duplicated successfully",
    "common.deleted": "Deleted successfully",
    "common.savedSuccessfully": "Saved successfully",

    // Login
    "login.title": "Sign In",
    "login.subtitle": "Enter your credentials to access your account",
    "login.email": "Email",
    "login.password": "Password",
    "login.signIn": "Sign In",
    "login.success": "Welcome back!",
    "login.invalidCredentials": "Invalid email or password",
    "login.demoAccounts": "Demo Accounts",
    "login.loginAsAdmin": "Login as Admin",
    "login.loginAsEmployee": "Login as Employee",
    "login.demoNote": "Use demo accounts to explore all features",

    // Status
    "status.active": "Active",
    "status.inactive": "Inactive",
    "status.draft": "Draft",
    "status.pending": "Pending",
    "status.approved": "Approved",
    "status.rejected": "Rejected",
    "status.completed": "Completed",
    "status.cancelled": "Cancelled",
    "status.inProgress": "In Progress",
    "status.done": "Done",

    // Dashboard
    "dashboard.welcome": "Welcome to SMS Reitler - Offers & Production",
    "dashboard.totalQuotes": "Total Quotes",
    "dashboard.totalCompanies": "Total Companies",
    "dashboard.activeProjects": "Active Projects",
    "dashboard.completedProjects": "Completed Projects",
    "dashboard.projectsWithIssues": "Projects with Open Issues",
    "dashboard.recentActivity": "Recent Activity",
    "dashboard.projectsOverview": "Projects Overview",
    "dashboard.activity1": "New quote created for TechCorp",
    "dashboard.activity2": "Project PRJ-001 marked as completed",
    "dashboard.activity3": "Issue resolved in PRJ-002",
    "dashboard.activity4": "New company added: IndustrialParts Ltd",
    "dashboard.activity5": "Inventory updated for assemblies",
    "dashboard.daysAgo": "{days} days ago",
    "dashboard.weekAgo": "1 week ago",

    // Settings
    "settings.description": "Manage your account preferences",
    "settings.profile": "Profile",
    "settings.profileDescription": "Your account information (read-only)",
    "settings.preferences": "Preferences",
    "settings.preferencesDescription": "Customize your experience",
    "settings.theme": "Theme",
    "settings.themeHint": "Choose how the app appears to you",
    "settings.language": "Language",
    "settings.languageHint": "Select your preferred language",
    "settings.organization": "Organization",
    "settings.organizationDescription": "Organization settings",
    "settings.organizationPlaceholder": "Organization settings will be available in a future update.",

    // Theme
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.system": "System",

    // Companies
    "companies.title": "Companies",
    "companies.description": "Manage your company contacts",
    "companies.addCompany": "Add Company",
    "companies.contactPerson": "Contact Person",
    "companies.associatedProjects": "Associated Projects",
    "companies.associatedQuotes": "Associated Quotes",

    // Quotes
    "quotes.title": "Quotes",
    "quotes.description": "Manage price quotes and offers",
    "quotes.addQuote": "Add Quote",
    "quotes.validity": "Validity",
    "quotes.deliveryTime": "Delivery Time",
    "quotes.deliveryWeeks": "weeks",
    "quotes.generateQuote": "Generate Quote",
    "quotes.installation": "Installation",
    "quotes.createProject": "Create Project",
    "quotes.selectLanguage": "Select Language",
    "quotes.items": "Items",
    "quotes.quoteSummary": "Quote Summary",
    "quotes.selectCompany": "Select Company",
    "quotes.personal": "Personal / Internal",

    // Projects
    "projects.title": "Projects",
    "projects.description": "Manage production projects",
    "projects.addProject": "Add Project",
    "projects.generateProject": "Generate Project",
    "projects.startDate": "Start Date",
    "projects.deadline": "Deadline",
    "projects.finishDate": "Finish Date",
    "projects.warranty": "Warranty Expiration",
    "projects.warrantyExpiration": "Warranty Until",
    "projects.warrantyNote": "2 years warranty from finish date",
    "projects.issues": "Issues",
    "projects.checklist": "Checklist",
    "projects.activity": "Activity",
    "projects.noIssues": "No Issues",
    "projects.openIssues": "Open Issues",
    "projects.activeIssues": "Active Issues",
    "projects.activeIssue": "Active Issue",
    "projects.noActiveIssue": "None",
    "projects.markSolved": "Mark Solved",
    "projects.solve": "Solved",
    "projects.solved": "Solved",
    "projects.addIssue": "Add Issue",
    "projects.reportIssue": "Report Issue",
    "projects.issueReported": "Issue reported",
    "projects.issueResolved": "Issue resolved",
    "projects.issuePlaceholder": "Describe the issue...",
    "projects.finishProject": "Finish Project",
    "projects.finishProjectDesc": "Mark project as completed. This will set the finish date and warranty expiration.",
    "projects.confirmFinish": "Confirm Finish",
    "projects.projectFinished": "Project finished successfully",
    "projects.fromQuote": "From Quote",
    "projects.selectQuote": "Select Quote",
    "projects.selectQuotePlaceholder": "Select a quote...",
    "projects.noQuote": "No Quote",
    "projects.quoteOptionalNote": "Quotes are optional. Personal projects can work without quotes.",
    "projects.selectProducts": "Select Products",
    "projects.selectCompany": "Select Company",
    "projects.selectCompanyPlaceholder": "Select a company...",
    "projects.personalProject": "Personal Project",
    "projects.personalProjectDesc": "Projects without company assignment",
    "projects.personal": "Personal",
    "projects.companyProjects": "Company Projects",
    "projects.personalProjects": "Personal Projects",
    "projects.projectType": "Project Type",
    "projects.wizardStep": "Step",
    "projects.createProject": "Create Project",
    "projects.projectName": "Project Name",
    "projects.projectNamePlaceholder": "Enter project name...",
    "projects.summary": "Summary",
    "projects.inStock": "In Stock",
    "projects.fromInventory": "From Inventory",
    "projects.needsProduction": "Needs Production",
    "projects.source": "Source",
    "projects.noProjectsFound": "No projects found",
    "projects.linkedQuote": "Linked Quote",
    "projects.noProductsAdded": "No products added",
    "projects.noChecklistItems": "No checklist items",
    "projects.addChecklistItem": "Add Checklist Item",
    "projects.itemTitle": "Item Title",
    "projects.checklistPlaceholder": "Enter checklist item...",
    "common.optional": "optional",
    "common.next": "Next",

    // Products
    "products.title": "Products",
    "products.description": "Manage product catalog",
    "products.addProduct": "Add Product",
    "products.product": "Product",
    "products.productName": "Product Name",
    "products.assemblySteps": "Assembly Steps",
    "products.assemblyStepsDesc": "Steps required to assemble this product",
    "products.parts": "Parts",
    "products.unit": "Unit",
    "products.basePrice": "Base Price",
    "products.subtitle": "Manage your product catalog",
    "products.searchPlaceholder": "Search products...",
    "products.category": "Category",
    "products.steps": "Steps",
    "products.deleted": "Product deleted",
    "products.noProductsFound": "No products found",
    "products.notFound": "Product not found",
    "products.subassemblies": "Subassemblies",
    "products.totalParts": "Total Parts",
    "products.structure": "Structure",
    "products.generatedParts": "Generated Parts",
    "products.generatedPartsTable": "Generated Parts Table",
    "products.generatedPartsDesc": "All parts required for this product, calculated recursively from assemblies",
    "products.directPart": "Direct Part",
    "products.directParts": "Direct Parts",
    "products.directPartsDesc": "Parts directly assigned to this product (not in assemblies)",
    "products.noSubassemblies": "No subassemblies defined",
    "products.noParts": "No parts required",
    "products.noSteps": "No assembly steps defined",
    "products.viewParts": "View Parts",
    "products.source": "Source",
    "products.productionSteps": "Production Steps",
    "products.requiredParts": "Required Parts",

    // Categories
    "category.siloInterior": "Silo Interior",
    "category.siloExterior": "Silo Exterior",
    "category.maia": "Maia",
    "category.dissolver": "Dissolver",
    "category.blower": "Blower",
    "category.cycloneDoser": "Cyclone Doser",
    "category.controlPanel": "Control Panel",
    "category.other": "Other",
    "category.all": "All",

    // Materials
    "materials.title": "Materials",
    "materials.description": "Manage assemblies and inventory",
    "materials.assemblies": "Assemblies",
    "materials.inventory": "Inventory",
    "materials.addAssembly": "Add Assembly",
    "materials.addPart": "Add Part",
    "materials.addToInventory": "Add to Inventory",
    "materials.location": "Location",
    "materials.partCount": "Parts",
    "materials.subtitle": "Manage assemblies and inventory",
    "materials.totalAssemblies": "Total Assemblies",
    "materials.inventoryItems": "Inventory Items",
    "materials.searchAssemblies": "Search assemblies...",
    "materials.searchInventory": "Search inventory...",
    "materials.addInventory": "Add Inventory",
    "materials.partsCount": "Parts",
    "materials.part": "Part",
    "materials.minStock": "Min Stock",
    "materials.lowStock": "Low Stock",
    "materials.inStock": "In Stock",
    "materials.assemblyDeleted": "Assembly deleted",
    "materials.inventoryDeleted": "Inventory item deleted",
    "materials.noAssembliesFound": "No assemblies found",
    "materials.noInventoryFound": "No inventory items found",
    "materials.assembliesSubtitle": "Manage assemblies that make up products",
    "materials.inventorySubtitle": "Track parts and products in stock",
    "materials.totalParts": "Total Parts",
    "materials.parts": "Parts",
    "materials.noPartsAdded": "No parts added yet",
    "materials.assemblyFormDesc": "Define the parts that make up this assembly",
    "materials.inventoryFormDesc": "Add or update inventory item",
    "materials.totalItems": "Total Items",
    "materials.partsInStock": "Parts in Stock",
    "materials.productsInStock": "Products in Stock",
    "materials.fileName": "File Name",
    "materials.fileLocation": "File Location",

    // Users
    "users.title": "Users",
    "users.description": "Manage team members",
    "users.employees": "Employees",
    "users.admins": "Admins",
    "users.addUser": "Add User",
    "users.role": "Role",
    "users.subtitle": "Manage team members",
    "users.inviteUser": "Invite User",
    "users.usersCount": "users",
    "users.adminsManagers": "Admins & Managers",
    "users.deleted": "User deleted",
    "users.inviteSent": "Invitation sent",
    "users.noUsersFound": "No users found",
    "users.deleteUser": "Delete User",
    "users.deleteConfirm": "Are you sure you want to delete this user? This action cannot be undone.",

    // Reports
    "reports.title": "Reports",
    "reports.description": "View project statistics",
    "reports.inProgress": "In Progress",
    "reports.completed": "Completed",
    "reports.cancelled": "Cancelled",
    "reports.subtitle": "View project statistics and reports",
    "reports.exportReport": "Export Report",
    "reports.exportStarted": "Export started",
    "reports.allProjects": "All Projects",
  },
  ro: {
    // Simple Navigation Keys
    "dashboard": "Panou de control",
    "management": "Management",
    "companies": "Companii",
    "projects": "Proiecte",
    "quotes": "Oferte",
    "materials": "Materiale",
    "products": "Produse",
    "assemblies": "Ansambluri",
    "inventory": "Inventar",
    "reports": "Rapoarte",
    "users": "Utilizatori",
    "settings": "Setari",

    // Navigation (prefixed)
    "nav.dashboard": "Panou de control",
    "nav.management": "Management",
    "nav.projects": "Proiecte",
    "nav.quotes": "Oferte",
    "nav.materials": "Materiale",
    "nav.products": "Produse",
    "nav.settings": "Setari",
    "nav.assemblies": "Ansambluri",
    "nav.inventory": "Inventar",
    "nav.users": "Utilizatori",
    "nav.reports": "Rapoarte",
    "nav.companies": "Companii",

    // Common
    "common.add": "Adauga",
    "common.edit": "Editeaza",
    "common.delete": "Sterge",
    "common.save": "Salveaza",
    "common.saved": "Salvat",
    "common.cancel": "Anuleaza",
    "common.search": "Cauta",
    "common.filter": "Filtreaza",
    "common.view": "Vizualizeaza",
    "common.viewDetails": "Vezi detalii",
    "common.actions": "Actiuni",
    "common.create": "Creeaza",
    "common.generate": "Genereaza",
    "common.export": "Exporta",
    "common.duplicate": "Duplica",
    "common.back": "Inapoi",
    "common.name": "Nume",
    "common.description": "Descriere",
    "common.status": "Status",
    "common.createdAt": "Creat la",
    "common.updatedAt": "Actualizat la",
    "common.category": "Categorie",
    "common.price": "Pret",
    "common.quantity": "Cantitate",
    "common.total": "Total",
    "common.notes": "Note",
    "common.code": "Cod",
    "common.progress": "Progres",
    "common.email": "Email",
    "common.phone": "Telefon",
    "common.address": "Adresa",
    "common.company": "Companie",
    "common.all": "Toate",
    "common.found": "gasite",
    "common.unknown": "Necunoscut",
    "common.startDate": "Data Inceput",
    "common.items": "articole",
    "common.type": "Tip",
    "common.duplicated": "Duplicat cu succes",
    "common.deleted": "Sters cu succes",
    "common.savedSuccessfully": "Salvat cu succes",

    // Login
    "login.title": "Autentificare",
    "login.subtitle": "Introduceti datele pentru a accesa contul",
    "login.email": "Email",
    "login.password": "Parola",
    "login.signIn": "Autentificare",
    "login.success": "Bun venit!",
    "login.invalidCredentials": "Email sau parola invalida",
    "login.demoAccounts": "Conturi Demo",
    "login.loginAsAdmin": "Autentificare Admin",
    "login.loginAsEmployee": "Autentificare Angajat",
    "login.demoNote": "Folositi conturile demo pentru a explora functiile",

    // Status
    "status.active": "Activ",
    "status.inactive": "Inactiv",
    "status.draft": "Ciorna",
    "status.pending": "In asteptare",
    "status.approved": "Aprobat",
    "status.rejected": "Respins",
    "status.completed": "Finalizat",
    "status.cancelled": "Anulat",
    "status.inProgress": "In lucru",
    "status.done": "Terminat",

    // Dashboard
    "dashboard.welcome": "Bun venit la SMS Reitler - Oferte & Productie",
    "dashboard.totalQuotes": "Total Oferte",
    "dashboard.totalCompanies": "Total Companii",
    "dashboard.activeProjects": "Proiecte Active",
    "dashboard.completedProjects": "Proiecte Finalizate",
    "dashboard.projectsWithIssues": "Proiecte cu Probleme",
    "dashboard.recentActivity": "Activitate Recenta",
    "dashboard.projectsOverview": "Sumar Proiecte",
    "dashboard.activity1": "Oferta noua creata pentru TechCorp",
    "dashboard.activity2": "Proiect PRJ-001 marcat ca finalizat",
    "dashboard.activity3": "Problema rezolvata in PRJ-002",
    "dashboard.activity4": "Companie noua adaugata: IndustrialParts Ltd",
    "dashboard.activity5": "Inventar actualizat pentru ansambluri",
    "dashboard.daysAgo": "acum {days} zile",
    "dashboard.weekAgo": "acum 1 saptamana",

    // Settings
    "settings.description": "Gestioneaza preferintele contului",
    "settings.profile": "Profil",
    "settings.profileDescription": "Informatiile contului (doar citire)",
    "settings.preferences": "Preferinte",
    "settings.preferencesDescription": "Personalizeaza experienta",
    "settings.theme": "Tema",
    "settings.themeHint": "Alege cum arata aplicatia",
    "settings.language": "Limba",
    "settings.languageHint": "Selecteaza limba preferata",
    "settings.organization": "Organizatie",
    "settings.organizationDescription": "Setari organizatie",
    "settings.organizationPlaceholder": "Setarile organizatiei vor fi disponibile intr-o actualizare viitoare.",

    // Theme
    "theme.light": "Luminos",
    "theme.dark": "Intunecat",
    "theme.system": "Sistem",

    // Companies
    "companies.title": "Companii",
    "companies.description": "Gestioneaza contactele companiilor",
    "companies.addCompany": "Adauga Companie",
    "companies.contactPerson": "Persoana de contact",
    "companies.associatedProjects": "Proiecte Asociate",
    "companies.associatedQuotes": "Oferte Asociate",

    // Quotes
    "quotes.title": "Oferte",
    "quotes.description": "Gestioneaza ofertele de pret",
    "quotes.addQuote": "Adauga Oferta",
    "quotes.validity": "Valabilitate",
    "quotes.deliveryTime": "Timp de livrare",
    "quotes.deliveryWeeks": "saptamani",
    "quotes.generateQuote": "Genereaza Oferta",
    "quotes.installation": "Instalare",
    "quotes.createProject": "Creeaza Proiect",
    "quotes.selectLanguage": "Selecteaza Limba",
    "quotes.items": "Articole",
    "quotes.quoteSummary": "Sumar Oferta",
    "quotes.selectCompany": "Selecteaza Companie",
    "quotes.personal": "Personal / Intern",

    // Projects
    "projects.title": "Proiecte",
    "projects.description": "Gestioneaza proiectele de productie",
    "projects.addProject": "Adauga Proiect",
    "projects.startDate": "Data Start",
    "projects.deadline": "Termen Limita",
    "projects.finishDate": "Data Finalizare",
    "projects.warranty": "Expirare Garantie",
    "projects.issues": "Probleme",
    "projects.checklist": "Lista de verificare",
    "projects.activity": "Activitate",
    "projects.noIssues": "Fara Probleme",
    "projects.openIssues": "Probleme Deschise",
    "projects.markSolved": "Marcheaza Rezolvat",
    "projects.addIssue": "Adauga Problema",
    "projects.finishProject": "Finalizeaza Proiect",
    "projects.fromQuote": "Din Oferta",
    "projects.selectQuote": "Selecteaza Oferta",
    "projects.selectProducts": "Selecteaza Produse",

    // Products
    "products.title": "Produse",
    "products.description": "Gestioneaza catalogul de produse",
    "products.addProduct": "Adauga Produs",
    "products.product": "Produs",
    "products.assemblySteps": "Pasi Asamblare",
    "products.parts": "Piese",
    "products.unit": "Unitate",
    "products.basePrice": "Pret de baza",
    "products.subtitle": "Gestioneaza catalogul de produse",
    "products.searchPlaceholder": "Cauta produse...",
    "products.category": "Categorie",
    "products.steps": "Pasi",
    "products.deleted": "Produs sters",
    "products.noProductsFound": "Niciun produs gasit",

    // Categories
    "category.siloInterior": "Siloz Interior",
    "category.siloExterior": "Siloz Exterior",
    "category.maia": "Maia",
    "category.dissolver": "Dizolvant",
    "category.blower": "Suflanta",
    "category.cycloneDoser": "Dozator Ciclon",
    "category.controlPanel": "Panou Control",
    "category.other": "Altele",
    "category.all": "Toate",

    // Materials
    "materials.title": "Materiale",
    "materials.description": "Gestioneaza ansambluri si inventar",
    "materials.assemblies": "Ansambluri",
    "materials.inventory": "Inventar",
    "materials.addAssembly": "Adauga Ansamblu",
    "materials.addPart": "Adauga Piesa",
    "materials.addToInventory": "Adauga in Inventar",
    "materials.location": "Locatie",
    "materials.partCount": "Piese",
    "materials.subtitle": "Gestioneaza ansambluri si inventar",
    "materials.totalAssemblies": "Total Ansambluri",
    "materials.inventoryItems": "Articole Inventar",
    "materials.searchAssemblies": "Cauta ansambluri...",
    "materials.searchInventory": "Cauta inventar...",
    "materials.addInventory": "Adauga Inventar",
    "materials.partsCount": "Piese",
    "materials.part": "Piesa",
    "materials.minStock": "Stoc Minim",
    "materials.lowStock": "Stoc Redus",
    "materials.inStock": "In Stoc",
    "materials.assemblyDeleted": "Ansamblu sters",
    "materials.inventoryDeleted": "Articol inventar sters",
    "materials.noAssembliesFound": "Niciun ansamblu gasit",
    "materials.noInventoryFound": "Niciun articol inventar gasit",
    "materials.assembliesSubtitle": "Gestioneaza ansamblurile care compun produsele",
    "materials.inventorySubtitle": "Urmareste piesele si produsele din stoc",
    "materials.totalParts": "Total Piese",
    "materials.parts": "Piese",
    "materials.noPartsAdded": "Nicio piesa adaugata",
    "materials.assemblyFormDesc": "Defineste piesele care compun acest ansamblu",
    "materials.inventoryFormDesc": "Adauga sau actualizeaza articol inventar",
    "materials.totalItems": "Total Articole",
    "materials.partsInStock": "Piese in Stoc",
    "materials.productsInStock": "Produse in Stoc",

    // Users
    "users.title": "Utilizatori",
    "users.description": "Gestioneaza membrii echipei",
    "users.employees": "Angajati",
    "users.admins": "Administratori",
    "users.addUser": "Adauga Utilizator",
    "users.role": "Rol",
    "users.subtitle": "Gestioneaza membrii echipei",
    "users.inviteUser": "Invita Utilizator",
    "users.usersCount": "utilizatori",
    "users.adminsManagers": "Administratori & Manageri",
    "users.deleted": "Utilizator sters",
    "users.inviteSent": "Invitatie trimisa",
    "users.noUsersFound": "Niciun utilizator gasit",
    "users.deleteUser": "Sterge Utilizator",
    "users.deleteConfirm": "Esti sigur ca vrei sa stergi acest utilizator? Aceasta actiune nu poate fi anulata.",

    // Reports
    "reports.title": "Rapoarte",
    "reports.description": "Vizualizeaza statistici proiecte",
    "reports.inProgress": "In Lucru",
    "reports.completed": "Finalizate",
    "reports.cancelled": "Anulate",
    "reports.subtitle": "Vizualizeaza statistici si rapoarte proiecte",
    "reports.exportReport": "Exporta Raport",
    "reports.exportStarted": "Export inceput",
    "reports.allProjects": "Toate Proiectele",
  },
  hu: {
    // Simple Navigation Keys
    "dashboard": "Iranyitopult",
    "management": "Menedzsment",
    "companies": "Cegek",
    "projects": "Projektek",
    "quotes": "Arajanlatok",
    "materials": "Anyagok",
    "products": "Termekek",
    "assemblies": "Szerelvenyek",
    "inventory": "Keszlet",
    "reports": "Jelentesek",
    "users": "Felhasznalok",
    "settings": "Beallitasok",

    // Navigation (prefixed)
    "nav.dashboard": "Iranyitopult",
    "nav.management": "Menedzsment",
    "nav.projects": "Projektek",
    "nav.quotes": "Arajanlatok",
    "nav.materials": "Anyagok",
    "nav.products": "Termekek",
    "nav.settings": "Beallitasok",
    "nav.assemblies": "Szerelvenyek",
    "nav.inventory": "Keszlet",
    "nav.users": "Felhasznalok",
    "nav.reports": "Jelentesek",
    "nav.companies": "Cegek",

    // Common
    "common.add": "Hozzaadas",
    "common.edit": "Szerkesztes",
    "common.delete": "Torles",
    "common.save": "Mentes",
    "common.saved": "Mentve",
    "common.cancel": "Megse",
    "common.search": "Kereses",
    "common.filter": "Szures",
    "common.view": "Megtekintes",
    "common.viewDetails": "Reszletek",
    "common.actions": "Muveletek",
    "common.create": "Letrehozas",
    "common.generate": "Generalas",
    "common.export": "Exportalas",
    "common.duplicate": "Masolat",
    "common.back": "Vissza",
    "common.name": "Nev",
    "common.description": "Leiras",
    "common.status": "Allapot",
    "common.createdAt": "Letrehozva",
    "common.updatedAt": "Frissitve",
    "common.category": "Kategoria",
    "common.price": "Ar",
    "common.quantity": "Mennyiseg",
    "common.total": "Osszesen",
    "common.notes": "Megjegyzesek",
    "common.code": "Kod",
    "common.progress": "Haladas",
    "common.email": "Email",
    "common.phone": "Telefon",
    "common.address": "Cim",
    "common.company": "Ceg",
    "common.all": "Mind",
    "common.found": "talalat",
    "common.unknown": "Ismeretlen",
    "common.startDate": "Kezdes Datum",
    "common.items": "tetel",
    "common.type": "Tipus",
    "common.duplicated": "Sikeresen duplikalt",
    "common.deleted": "Sikeresen torolve",
    "common.savedSuccessfully": "Sikeresen mentve",

    // Login
    "login.title": "Bejelentkezes",
    "login.subtitle": "Adja meg adatait a fiokhoz valo hozzafereshez",
    "login.email": "Email",
    "login.password": "Jelszo",
    "login.signIn": "Bejelentkezes",
    "login.success": "Udvozoljuk!",
    "login.invalidCredentials": "Ervenytelen email vagy jelszo",
    "login.demoAccounts": "Demo Fiokok",
    "login.loginAsAdmin": "Admin bejelentkezes",
    "login.loginAsEmployee": "Alkalmazott bejelentkezes",
    "login.demoNote": "Hasznaljon demo fiokokat a funkciok felfedezesehez",

    // Status
    "status.active": "Aktiv",
    "status.inactive": "Inaktiv",
    "status.draft": "Vazlat",
    "status.pending": "Fuggoben",
    "status.approved": "Elfogadva",
    "status.rejected": "Elutasitva",
    "status.completed": "Befejezve",
    "status.cancelled": "Torolve",
    "status.inProgress": "Folyamatban",
    "status.done": "Kesz",

    // Dashboard
    "dashboard.welcome": "Udvozoljuk az SMS Reitler - Arajanlatok & Termeles alkalmazasban",
    "dashboard.totalQuotes": "Osszes Arajanlat",
    "dashboard.totalCompanies": "Osszes Ceg",
    "dashboard.activeProjects": "Aktiv Projektek",
    "dashboard.completedProjects": "Befejezett Projektek",
    "dashboard.projectsWithIssues": "Problemas Projektek",
    "dashboard.recentActivity": "Legutobb Tevekenyseg",
    "dashboard.projectsOverview": "Projektek Attekintese",
    "dashboard.activity1": "Uj arajanlat letrehozva a TechCorp szamara",
    "dashboard.activity2": "PRJ-001 projekt befejezve",
    "dashboard.activity3": "Problema megoldva a PRJ-002 projektben",
    "dashboard.activity4": "Uj ceg hozzaadva: IndustrialParts Ltd",
    "dashboard.activity5": "Keszlet frissitve a szerelvenyekhez",
    "dashboard.daysAgo": "{days} napja",
    "dashboard.weekAgo": "1 hete",

    // Settings
    "settings.description": "Fiok beallitasok kezelese",
    "settings.profile": "Profil",
    "settings.profileDescription": "Fiok informaciok (csak olvasas)",
    "settings.preferences": "Preferencia",
    "settings.preferencesDescription": "Szemelyre szabas",
    "settings.theme": "Tema",
    "settings.themeHint": "Valaszd ki az alkalmazas megjeleniteset",
    "settings.language": "Nyelv",
    "settings.languageHint": "Valaszd ki a preferalt nyelvet",
    "settings.organization": "Szervezet",
    "settings.organizationDescription": "Szervezeti beallitasok",
    "settings.organizationPlaceholder": "Szervezeti beallitasok egy jovobeni frissitesben lesznek elerhetok.",

    // Theme
    "theme.light": "Vilagos",
    "theme.dark": "Sotet",
    "theme.system": "Rendszer",

    // Companies
    "companies.title": "Cegek",
    "companies.description": "Cegkapcsolatok kezelese",
    "companies.addCompany": "Ceg Hozzaadasa",
    "companies.contactPerson": "Kapcsolattarto",
    "companies.associatedProjects": "Kapcsolodo Projektek",
    "companies.associatedQuotes": "Kapcsolodo Arajanlatok",

    // Quotes
    "quotes.title": "Arajanlatok",
    "quotes.description": "Arajanlatok kezelese",
    "quotes.addQuote": "Arajanlat Hozzaadasa",
    "quotes.validity": "Ervenesseg",
    "quotes.deliveryTime": "Szallitas Ido",
    "quotes.deliveryWeeks": "het",
    "quotes.generateQuote": "Arajanlat Generalasa",
    "quotes.installation": "Telepites",
    "quotes.createProject": "Projekt Letrehozasa",
    "quotes.selectLanguage": "Nyelv Kivalasztasa",
    "quotes.items": "Tetelek",
    "quotes.quoteSummary": "Arajanlat Osszefoglalo",
    "quotes.selectCompany": "Ceg Kivalasztasa",
    "quotes.personal": "Szemelyes / Belso",

    // Projects
    "projects.title": "Projektek",
    "projects.description": "Termelesi projektek kezelese",
    "projects.addProject": "Projekt Hozzaadasa",
    "projects.startDate": "Kezdes Datum",
    "projects.deadline": "Hatarido",
    "projects.finishDate": "Befejezes Datum",
    "projects.warranty": "Garancia Lejarat",
    "projects.issues": "Problemak",
    "projects.checklist": "Ellenorzo Lista",
    "projects.activity": "Tevekenyseg",
    "projects.noIssues": "Nincs Problema",
    "projects.openIssues": "Nyitott Problemak",
    "projects.markSolved": "Megoldottnak Jeloles",
    "projects.addIssue": "Problema Hozzaadasa",
    "projects.finishProject": "Projekt Befejezese",
    "projects.fromQuote": "Arajanlat Alapjan",
    "projects.selectQuote": "Arajanlat Kivalasztasa",
    "projects.selectProducts": "Termekek Kivalasztasa",

    // Products
    "products.title": "Termekek",
    "products.description": "Termekkatalogus kezelese",
    "products.addProduct": "Termek Hozzaadasa",
    "products.product": "Termek",
    "products.assemblySteps": "Osszerakasi Lepesek",
    "products.parts": "Alkatreszek",
    "products.unit": "Egyseg",
    "products.basePrice": "Alapar",
    "products.subtitle": "Termekkatalogus kezelese",
    "products.searchPlaceholder": "Termekek keresese...",
    "products.category": "Kategoria",
    "products.steps": "Lepesek",
    "products.deleted": "Termek torolve",
    "products.noProductsFound": "Nem talalhato termek",

    // Categories
    "category.siloInterior": "Silo Belso",
    "category.siloExterior": "Silo Kulso",
    "category.maia": "Maia",
    "category.dissolver": "Oldoszer",
    "category.blower": "Fuvo",
    "category.cycloneDoser": "Ciklon Adagolo",
    "category.controlPanel": "Vezerlopult",
    "category.other": "Egyeb",
    "category.all": "Mind",

    // Materials
    "materials.title": "Anyagok",
    "materials.description": "Szerelvenyek es keszlet kezelese",
    "materials.assemblies": "Szerelvenyek",
    "materials.inventory": "Keszlet",
    "materials.addAssembly": "Szerelveny Hozzaadasa",
    "materials.addPart": "Alkatresz Hozzaadasa",
    "materials.addToInventory": "Keszlethez Adas",
    "materials.location": "Helyszin",
    "materials.partCount": "Alkatreszek",
    "materials.subtitle": "Szerelvenyek es keszlet kezelese",
    "materials.totalAssemblies": "Osszes Szerelveny",
    "materials.inventoryItems": "Keszlet Tetelek",
    "materials.searchAssemblies": "Szerelvenyek keresese...",
    "materials.searchInventory": "Keszlet keresese...",
    "materials.addInventory": "Keszlet Hozzaadasa",
    "materials.partsCount": "Alkatreszek",
    "materials.part": "Alkatresz",
    "materials.minStock": "Min Keszlet",
    "materials.lowStock": "Alacsony Keszlet",
    "materials.inStock": "Keszleten",
    "materials.assemblyDeleted": "Szerelveny torolve",
    "materials.inventoryDeleted": "Keszlet tetel torolve",
    "materials.noAssembliesFound": "Nem talalhato szerelveny",
    "materials.noInventoryFound": "Nem talalhato keszlet tetel",
    "materials.assembliesSubtitle": "A termekeket alkoto szerelvenyek kezelese",
    "materials.inventorySubtitle": "Alkatreszek es termekek nyomon kovetese keszleten",
    "materials.totalParts": "Osszes Alkatresz",
    "materials.parts": "Alkatreszek",
    "materials.noPartsAdded": "Meg nem adtak hozza alkatreszt",
    "materials.assemblyFormDesc": "Hatarozza meg a szerelvenyt alkoto alkatreszeket",
    "materials.inventoryFormDesc": "Keszlet tetel hozzaadasa vagy frissitese",
    "materials.totalItems": "Osszes Tetel",
    "materials.partsInStock": "Alkatreszek Keszleten",
    "materials.productsInStock": "Termekek Keszleten",

    // Users
    "users.title": "Felhasznalok",
    "users.description": "Csapattagok kezelese",
    "users.employees": "Alkalmazottak",
    "users.admins": "Adminok",
    "users.addUser": "Felhasznalo Hozzaadasa",
    "users.role": "Szerepkor",
    "users.subtitle": "Csapattagok kezelese",
    "users.inviteUser": "Felhasznalo Meghivasa",
    "users.usersCount": "felhasznalo",
    "users.adminsManagers": "Adminok & Menedzserek",
    "users.deleted": "Felhasznalo torolve",
    "users.inviteSent": "Meghivo elkuldve",
    "users.noUsersFound": "Nem talalhato felhasznalo",
    "users.deleteUser": "Felhasznalo Torlese",
    "users.deleteConfirm": "Biztosan torolni szeretned ezt a felhasznalot? Ez a muvelet nem vonhato vissza.",

    // Reports
    "reports.title": "Jelentesek",
    "reports.description": "Projekt statisztikak megtekintese",
    "reports.inProgress": "Folyamatban",
    "reports.completed": "Befejezett",
    "reports.cancelled": "Torolt",
    "reports.subtitle": "Projekt statisztikak es jelentesek megtekintese",
    "reports.exportReport": "Jelentes Exportalasa",
    "reports.exportStarted": "Export elkezdodott",
    "reports.allProjects": "Osszes Projekt",
  },
  de: {
    // Simple Navigation Keys
    "dashboard": "Dashboard",
    "management": "Verwaltung",
    "companies": "Unternehmen",
    "projects": "Projekte",
    "quotes": "Angebote",
    "materials": "Materialien",
    "products": "Produkte",
    "assemblies": "Baugruppen",
    "inventory": "Inventar",
    "reports": "Berichte",
    "users": "Benutzer",
    "settings": "Einstellungen",

    // Navigation (prefixed)
    "nav.dashboard": "Dashboard",
    "nav.management": "Verwaltung",
    "nav.projects": "Projekte",
    "nav.quotes": "Angebote",
    "nav.materials": "Materialien",
    "nav.products": "Produkte",
    "nav.settings": "Einstellungen",
    "nav.assemblies": "Baugruppen",
    "nav.inventory": "Inventar",
    "nav.users": "Benutzer",
    "nav.reports": "Berichte",
    "nav.companies": "Unternehmen",

    // Common
    "common.add": "Hinzufugen",
    "common.edit": "Bearbeiten",
    "common.delete": "Loschen",
    "common.save": "Speichern",
    "common.saved": "Gespeichert",
    "common.cancel": "Abbrechen",
    "common.search": "Suchen",
    "common.filter": "Filtern",
    "common.view": "Ansehen",
    "common.viewDetails": "Details Ansehen",
    "common.actions": "Aktionen",
    "common.create": "Erstellen",
    "common.generate": "Generieren",
    "common.export": "Exportieren",
    "common.duplicate": "Duplizieren",
    "common.back": "Zuruck",
    "common.name": "Name",
    "common.description": "Beschreibung",
    "common.status": "Status",
    "common.createdAt": "Erstellt Am",
    "common.updatedAt": "Aktualisiert Am",
    "common.category": "Kategorie",
    "common.price": "Preis",
    "common.quantity": "Menge",
    "common.total": "Gesamt",
    "common.notes": "Notizen",
    "common.code": "Code",
    "common.progress": "Fortschritt",
    "common.email": "E-Mail",
    "common.phone": "Telefon",
    "common.address": "Adresse",
    "common.company": "Unternehmen",
    "common.all": "Alle",
    "common.found": "gefunden",
    "common.unknown": "Unbekannt",
    "common.startDate": "Startdatum",
    "common.items": "Elemente",
    "common.type": "Typ",
    "common.duplicated": "Erfolgreich dupliziert",
    "common.deleted": "Erfolgreich geloscht",
    "common.savedSuccessfully": "Erfolgreich gespeichert",

    // Login
    "login.title": "Anmelden",
    "login.subtitle": "Geben Sie Ihre Anmeldedaten ein",
    "login.email": "E-Mail",
    "login.password": "Passwort",
    "login.signIn": "Anmelden",
    "login.success": "Willkommen zuruck!",
    "login.invalidCredentials": "Ungultige E-Mail oder Passwort",
    "login.demoAccounts": "Demo-Konten",
    "login.loginAsAdmin": "Als Admin anmelden",
    "login.loginAsEmployee": "Als Mitarbeiter anmelden",
    "login.demoNote": "Verwenden Sie Demo-Konten zum Erkunden",

    // Status
    "status.active": "Aktiv",
    "status.inactive": "Inaktiv",
    "status.draft": "Entwurf",
    "status.pending": "Ausstehend",
    "status.approved": "Genehmigt",
    "status.rejected": "Abgelehnt",
    "status.completed": "Abgeschlossen",
    "status.cancelled": "Storniert",
    "status.inProgress": "In Bearbeitung",
    "status.done": "Fertig",

    // Dashboard
    "dashboard.welcome": "Willkommen bei SMS Reitler - Angebote & Produktion",
    "dashboard.totalQuotes": "Angebote Gesamt",
    "dashboard.totalCompanies": "Unternehmen Gesamt",
    "dashboard.activeProjects": "Aktive Projekte",
    "dashboard.completedProjects": "Abgeschlossene Projekte",
    "dashboard.projectsWithIssues": "Projekte mit Problemen",
    "dashboard.recentActivity": "Letzte Aktivitat",
    "dashboard.projectsOverview": "Projektubersicht",
    "dashboard.activity1": "Neues Angebot fur TechCorp erstellt",
    "dashboard.activity2": "Projekt PRJ-001 als abgeschlossen markiert",
    "dashboard.activity3": "Problem in PRJ-002 gelost",
    "dashboard.activity4": "Neues Unternehmen hinzugefugt: IndustrialParts Ltd",
    "dashboard.activity5": "Inventar fur Baugruppen aktualisiert",
    "dashboard.daysAgo": "vor {days} Tagen",
    "dashboard.weekAgo": "vor 1 Woche",

    // Settings
    "settings.description": "Kontoeinstellungen verwalten",
    "settings.profile": "Profil",
    "settings.profileDescription": "Kontoinformationen (schreibgeschutzt)",
    "settings.preferences": "Einstellungen",
    "settings.preferencesDescription": "Erfahrung anpassen",
    "settings.theme": "Design",
    "settings.themeHint": "Wahlen Sie das Erscheinungsbild der App",
    "settings.language": "Sprache",
    "settings.languageHint": "Wahlen Sie Ihre bevorzugte Sprache",
    "settings.organization": "Organisation",
    "settings.organizationDescription": "Organisationseinstellungen",
    "settings.organizationPlaceholder": "Organisationseinstellungen werden in einem zukunftigen Update verfugbar sein.",

    // Theme
    "theme.light": "Hell",
    "theme.dark": "Dunkel",
    "theme.system": "System",

    // Companies
    "companies.title": "Unternehmen",
    "companies.description": "Unternehmenskontakte verwalten",
    "companies.addCompany": "Unternehmen Hinzufugen",
    "companies.contactPerson": "Kontaktperson",
    "companies.associatedProjects": "Zugehorige Projekte",
    "companies.associatedQuotes": "Zugehorige Angebote",

    // Quotes
    "quotes.title": "Angebote",
    "quotes.description": "Preisangebote verwalten",
    "quotes.addQuote": "Angebot Hinzufugen",
    "quotes.validity": "Gultigkeit",
    "quotes.deliveryTime": "Lieferzeit",
    "quotes.deliveryWeeks": "Wochen",
    "quotes.generateQuote": "Angebot Generieren",
    "quotes.installation": "Installation",
    "quotes.createProject": "Projekt Erstellen",
    "quotes.selectLanguage": "Sprache Wahlen",
    "quotes.items": "Positionen",
    "quotes.quoteSummary": "Angebotszusammenfassung",
    "quotes.selectCompany": "Unternehmen Wahlen",
    "quotes.personal": "Personlich / Intern",

    // Projects
    "projects.title": "Projekte",
    "projects.description": "Produktionsprojekte verwalten",
    "projects.addProject": "Projekt Hinzufugen",
    "projects.startDate": "Startdatum",
    "projects.deadline": "Frist",
    "projects.finishDate": "Enddatum",
    "projects.warranty": "Garantieablauf",
    "projects.issues": "Probleme",
    "projects.checklist": "Checkliste",
    "projects.activity": "Aktivitat",
    "projects.noIssues": "Keine Probleme",
    "projects.openIssues": "Offene Probleme",
    "projects.markSolved": "Als Gelost Markieren",
    "projects.addIssue": "Problem Hinzufugen",
    "projects.finishProject": "Projekt Abschliessen",
    "projects.fromQuote": "Aus Angebot",
    "projects.selectQuote": "Angebot Wahlen",
    "projects.selectProducts": "Produkte Wahlen",

    // Products
    "products.title": "Produkte",
    "products.description": "Produktkatalog verwalten",
    "products.addProduct": "Produkt Hinzufugen",
    "products.product": "Produkt",
    "products.assemblySteps": "Montageschritte",
    "products.parts": "Teile",
    "products.unit": "Einheit",
    "products.basePrice": "Grundpreis",
    "products.subtitle": "Produktkatalog verwalten",
    "products.searchPlaceholder": "Produkte suchen...",
    "products.category": "Kategorie",
    "products.steps": "Schritte",
    "products.deleted": "Produkt geloscht",
    "products.noProductsFound": "Keine Produkte gefunden",

    // Categories
    "category.siloInterior": "Silo Innenraum",
    "category.siloExterior": "Silo Aussenbereich",
    "category.maia": "Maia",
    "category.dissolver": "Auflser",
    "category.blower": "Geblse",
    "category.cycloneDoser": "Zyklon-Dosierer",
    "category.controlPanel": "Schaltschrank",
    "category.other": "Sonstiges",
    "category.all": "Alle",

    // Materials
    "materials.title": "Materialien",
    "materials.description": "Baugruppen und Inventar verwalten",
    "materials.assemblies": "Baugruppen",
    "materials.inventory": "Inventar",
    "materials.addAssembly": "Baugruppe Hinzufugen",
    "materials.addPart": "Teil Hinzufugen",
    "materials.addToInventory": "Zum Inventar Hinzufugen",
    "materials.location": "Standort",
    "materials.partCount": "Teile",
    "materials.subtitle": "Baugruppen und Inventar verwalten",
    "materials.totalAssemblies": "Baugruppen Gesamt",
    "materials.inventoryItems": "Inventarposten",
    "materials.searchAssemblies": "Baugruppen suchen...",
    "materials.searchInventory": "Inventar suchen...",
    "materials.addInventory": "Inventar Hinzufugen",
    "materials.partsCount": "Teile",
    "materials.part": "Teil",
    "materials.minStock": "Min. Bestand",
    "materials.lowStock": "Niedriger Bestand",
    "materials.inStock": "Auf Lager",
    "materials.assemblyDeleted": "Baugruppe geloscht",
    "materials.inventoryDeleted": "Inventarposten geloscht",
    "materials.noAssembliesFound": "Keine Baugruppen gefunden",
    "materials.noInventoryFound": "Keine Inventarposten gefunden",
    "materials.assembliesSubtitle": "Baugruppen verwalten, aus denen Produkte bestehen",
    "materials.inventorySubtitle": "Teile und Produkte auf Lager verfolgen",
    "materials.totalParts": "Teile Gesamt",
    "materials.parts": "Teile",
    "materials.noPartsAdded": "Noch keine Teile hinzugefugt",
    "materials.assemblyFormDesc": "Definieren Sie die Teile dieser Baugruppe",
    "materials.inventoryFormDesc": "Inventarposten hinzufugen oder aktualisieren",
    "materials.totalItems": "Elemente Gesamt",
    "materials.partsInStock": "Teile auf Lager",
    "materials.productsInStock": "Produkte auf Lager",

    // Users
    "users.title": "Benutzer",
    "users.description": "Teammitglieder verwalten",
    "users.employees": "Mitarbeiter",
    "users.admins": "Administratoren",
    "users.addUser": "Benutzer Hinzufugen",
    "users.role": "Rolle",
    "users.subtitle": "Teammitglieder verwalten",
    "users.inviteUser": "Benutzer Einladen",
    "users.usersCount": "Benutzer",
    "users.adminsManagers": "Admins & Manager",
    "users.deleted": "Benutzer geloscht",
    "users.inviteSent": "Einladung gesendet",
    "users.noUsersFound": "Keine Benutzer gefunden",
    "users.deleteUser": "Benutzer Loschen",
    "users.deleteConfirm": "Sind Sie sicher, dass Sie diesen Benutzer loschen mochten? Diese Aktion kann nicht ruckgangig gemacht werden.",

    // Reports
    "reports.title": "Berichte",
    "reports.description": "Projektstatistiken ansehen",
    "reports.inProgress": "In Bearbeitung",
    "reports.completed": "Abgeschlossen",
    "reports.cancelled": "Storniert",
    "reports.subtitle": "Projektstatistiken und Berichte ansehen",
    "reports.exportReport": "Bericht Exportieren",
    "reports.exportStarted": "Export gestartet",
    "reports.allProjects": "Alle Projekte",
  },
}

export function t(key: keyof TranslationKeys, locale: Locale, params?: Record<string, string>): string {
  let text = translations[locale]?.[key] || translations.en[key] || key
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v)
    })
  }
  return text
}

export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale] || translations.en
}
