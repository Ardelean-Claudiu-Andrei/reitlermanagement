import type {
  Company,
  Product,
  Part,
  Assembly,
  InventoryItem,
  Quote,
  QuoteStatus,
  Project,
  ProjectStatus,
  ChecklistItem,
  ProjectIssue,
  UserWithInfo,
  CreateProjectPayload,
  UploadedFile,
  FileCategory,
} from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function getUploadFileUrl(url?: string | null): string {
  if (!url) return "#"
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`
}

export async function apiFetch(endpoint: string, options?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
  }

  return res
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username: email, password }),
  })

  if (!res.ok) throw new Error('Credențiale incorecte')

  const data = await res.json()
  localStorage.setItem('access_token', data.access_token)
  localStorage.setItem('refresh_token', data.refresh_token)
  localStorage.setItem('user', JSON.stringify(data.user))
  return data
}

export function apiLogout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

// ─── Helper ───────────────────────────────────────────────────────────────────

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await apiFetch(endpoint, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// ─── Companies / Clients ──────────────────────────────────────────────────────

export const companiesApi = {
  list: (): Promise<Company[]> => request('/api/clients'),
  get: (id: string): Promise<Company> => request(`/api/clients/${id}`),
  create: (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> =>
    request('/api/clients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Company>): Promise<Company> =>
    request(`/api/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string): Promise<void> =>
    request(`/api/clients/${id}`, { method: 'DELETE' }),
}

// ─── Products ─────────────────────────────────────────────────────────────────

export const productsApi = {
  list: (): Promise<Product[]> => request('/api/products'),
  get: (id: string): Promise<Product> => request(`/api/products/${id}`),
  create: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> =>
    request('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Product>): Promise<Product> =>
    request(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string): Promise<void> =>
    request(`/api/products/${id}`, { method: 'DELETE' }),
  laserCuttingPdf: async (id: string): Promise<Blob> => {
    const res = await apiFetch(`/api/products/${id}/laser-cutting-pdf`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'PDF generation failed')
    }
    return res.blob()
  },
  exportProductionStepsPdf: async (id: string): Promise<Blob> => {
    const res = await apiFetch(`/api/products/${id}/export-production-steps`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'PDF generation failed')
    }
    return res.blob()
  },
}

// ─── Parts ────────────────────────────────────────────────────────────────────

export const partsApi = {
  list: (): Promise<Part[]> => request('/api/parts'),
  get: (id: string): Promise<Part> => request(`/api/parts/${id}`),
  create: (data: Omit<Part, 'id' | 'createdAt' | 'updatedAt'>): Promise<Part> =>
    request('/api/parts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Part>): Promise<Part> =>
    request(`/api/parts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string): Promise<void> =>
    request(`/api/parts/${id}`, { method: 'DELETE' }),
}

// ─── Assemblies ───────────────────────────────────────────────────────────────

export const assembliesApi = {
  list: (): Promise<Assembly[]> => request('/api/assemblies'),
  get: (id: string): Promise<Assembly> => request(`/api/assemblies/${id}`),
  create: (data: Omit<Assembly, 'id' | 'createdAt' | 'updatedAt'>): Promise<Assembly> =>
    request('/api/assemblies', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Assembly>): Promise<Assembly> =>
    request(`/api/assemblies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string): Promise<void> =>
    request(`/api/assemblies/${id}`, { method: 'DELETE' }),
}

// ─── Uploads ─────────────────────────────────────────────────────────────────

export const uploadsApi = {
  list: (entityType: string, entityId: string): Promise<UploadedFile[]> =>
    request(`/api/uploads/${entityType}/${entityId}`),

  upload: async (
    entityType: string,
    entityId: string,
    fileCategory: FileCategory,
    file: File,
  ): Promise<UploadedFile> => {
    const form = new FormData()
    form.append('file', file)
    form.append('file_category', fileCategory)
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    const res = await fetch(`${API_URL}/api/uploads/${entityType}/${entityId}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Upload failed')
    }
    return res.json()
  },

  delete: (fileId: string): Promise<void> =>
    request(`/api/uploads/${fileId}`, { method: 'DELETE' }),
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export const inventoryApi = {
  list: (): Promise<InventoryItem[]> => request('/api/inventory'),
  get: (id: string): Promise<InventoryItem> => request(`/api/inventory/${id}`),
  create: (data: Omit<InventoryItem, 'id' | 'updatedAt'>): Promise<InventoryItem> =>
    request('/api/inventory', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<InventoryItem>): Promise<InventoryItem> =>
    request(`/api/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string): Promise<void> =>
    request(`/api/inventory/${id}`, { method: 'DELETE' }),
}

// ─── Quotes ───────────────────────────────────────────────────────────────────

export const quotesApi = {
  list: (): Promise<Quote[]> => request('/api/quotes'),
  get: (id: string): Promise<Quote> => request(`/api/quotes/${id}`),
  create: (data: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quote> =>
    request('/api/quotes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Quote>): Promise<Quote> =>
    request(`/api/quotes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: QuoteStatus): Promise<Quote> =>
    request(`/api/quotes/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  duplicate: (id: string): Promise<Quote> =>
    request(`/api/quotes/${id}/duplicate`, { method: 'POST' }),
  delete: (id: string): Promise<void> =>
    request(`/api/quotes/${id}`, { method: 'DELETE' }),
  generatePdf: async (id: string, lang: string): Promise<Blob> => {
    const res = await apiFetch(`/api/quotes/${id}/generate-pdf?lang=${lang}`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'PDF generation failed')
    }
    return res.blob()
  },
  generateExcel: async (id: string, lang: string): Promise<Blob> => {
    const res = await apiFetch(`/api/quotes/${id}/generate-excel?lang=${lang}`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Excel generation failed')
    }
    return res.blob()
  },
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projectsApi = {
  list: (): Promise<Project[]> => request('/api/projects'),
  get: (id: string): Promise<Project> => request(`/api/projects/${id}`),
  create: (data: CreateProjectPayload): Promise<Project> =>
    request('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Project>): Promise<Project> =>
    request(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: ProjectStatus): Promise<Project> =>
    request(`/api/projects/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  finish: (id: string): Promise<Project> =>
    request(`/api/projects/${id}/finish`, { method: 'POST' }),
  addChecklistItem: (id: string, item: ChecklistItem): Promise<Project> =>
    request(`/api/projects/${id}/checklist`, { method: 'POST', body: JSON.stringify(item) }),
  toggleChecklistItem: (projectId: string, itemId: string): Promise<Project> =>
    request(`/api/projects/${projectId}/checklist/${itemId}/toggle`, { method: 'PATCH' }),
  addIssue: (id: string, issue: ProjectIssue): Promise<Project> =>
    request(`/api/projects/${id}/issues`, { method: 'POST', body: JSON.stringify(issue) }),
  resolveIssue: (projectId: string, issueId: string): Promise<Project> =>
    request(`/api/projects/${projectId}/issues/${issueId}/resolve`, { method: 'PATCH' }),
  createFromQuote: (quoteId: string, userName: string): Promise<Project> =>
    request('/api/projects/from-quote', { method: 'POST', body: JSON.stringify({ quoteId, userName }) }),
  delete: (id: string): Promise<void> =>
    request(`/api/projects/${id}`, { method: 'DELETE' }),
  exportProductionStepsPdf: async (id: string): Promise<Blob> => {
    const res = await apiFetch(`/api/projects/${id}/export-production-steps`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'PDF generation failed')
    }
    return res.blob()
  },
  exportProductionCardsPdf: async (id: string): Promise<Blob> => {
    const res = await apiFetch(`/api/projects/${id}/export-production-cards`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'PDF generation failed')
    }
    return res.blob()
  },
  exportLaserCuttingPdf: async (id: string): Promise<Blob> => {
    const res = await apiFetch(`/api/projects/${id}/export-laser-cutting`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'PDF generation failed')
    }
    return res.blob()
  },
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  list: (): Promise<UserWithInfo[]> => request('/api/users'),
  get: (id: string): Promise<UserWithInfo> => request(`/api/users/${id}`),
  getProfile: (): Promise<UserWithInfo> => request('/api/users/profile'),
  updateProfile: (data: {
    firstName?: string
    lastName?: string
    email?: string
    currentPassword?: string
    newPassword?: string
  }): Promise<UserWithInfo> =>
    request('/api/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  create: (data: { firstName: string; lastName: string; email: string; password: string; role: string }): Promise<UserWithInfo> =>
    request('/api/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { firstName?: string; lastName?: string; email?: string; password?: string; role?: string; status?: string }): Promise<UserWithInfo> =>
    request(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string): Promise<void> =>
    request(`/api/users/${id}`, { method: 'DELETE' }),
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export const statsApi = {
  get: (): Promise<{
    totalProducts: number
    totalClients: number
    totalQuotes: number
    totalProjects: number
    activeProjects: number
    approvedQuotes: number
    draftQuotes: number
    doneProjects: number
  }> => request('/api/stats'),
}

// ─── Weekly Reports ────────────────────────────────────────────────────────────

export interface WeeklyReportSummary {
  weekStart: string
  weekEnd: string
  availableAt: string
  progressedCount: number
  finalizedCount: number
}

export interface WeeklyReportItem {
  id: string
  code: string
  name: string
  status: string
  companyName: string
  progressPct?: number
  lastAction?: string
  lastActionAt?: string
  change?: string
  changedAt?: string
  startDate?: string
}

export interface WeeklyReport {
  weekStart: string
  weekEnd: string
  generatedAt: string
  progressedProjects: WeeklyReportItem[]
  finalizedProjects: WeeklyReportItem[]
  inProgressProjects: WeeklyReportItem[]
  startingNextWeekProjects: WeeklyReportItem[]
}

export const reportsApi = {
  listWeekly: (): Promise<{ weeks: WeeklyReportSummary[] }> => request('/api/reports/weekly'),

  getWeekly: (weekStart: string): Promise<WeeklyReport> => request(`/api/reports/weekly/${weekStart}`),

  exportWeeklyPdf: async (weekStart: string): Promise<Blob> => {
    const res = await apiFetch(`/api/reports/weekly/${weekStart}/export`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'PDF generation failed')
    }
    return res.blob()
  },
}

// ─── Settings / Branding ─────────────────────────────────────────────────────

export const settingsApi = {
  getBranding: (): Promise<{ headerUrl: string | null; signatureUrl: string | null }> =>
    request('/api/settings/branding'),

  uploadHeader: async (file: File): Promise<{ url: string }> => {
    const form = new FormData()
    form.append('file', file)
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    const res = await fetch(`${API_URL}/api/settings/branding/header`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },

  uploadSignature: async (file: File): Promise<{ url: string }> => {
    const form = new FormData()
    form.append('file', file)
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    const res = await fetch(`${API_URL}/api/settings/branding/signature`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },

  deleteHeader: (): Promise<{ ok: boolean }> =>
    request('/api/settings/branding/header', { method: 'DELETE' }),

  deleteSignature: (): Promise<{ ok: boolean }> =>
    request('/api/settings/branding/signature', { method: 'DELETE' }),
}
