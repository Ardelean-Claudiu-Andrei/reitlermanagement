"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import type {
  Company,
  Part,
  Assembly,
  Product,
  InventoryItem,
  Quote,
  Project,
  UserWithInfo,
  ProjectStatus,
  QuoteStatus,
  ChecklistItem,
  ProjectIssue,
  CreateProjectPayload,
} from "./types"
import {
  companiesApi,
  partsApi,
  assembliesApi,
  productsApi,
  inventoryApi,
  quotesApi,
  projectsApi,
  usersApi,
} from "./api"

interface AppState {
  // Loading state
  isLoading: boolean

  // Data
  companies: Company[]
  parts: Part[]
  assemblies: Assembly[]
  products: Product[]
  inventory: InventoryItem[]
  quotes: Quote[]
  projects: Project[]
  usersWithInfo: UserWithInfo[]

  // Reload helpers
  reloadAll: () => Promise<void>

  // Company CRUD
  addCompany: (company: Company) => Promise<void>
  updateCompany: (company: Company) => Promise<void>
  deleteCompany: (id: string) => Promise<void>

  // Part CRUD
  addPart: (part: Part) => Promise<void>
  updatePart: (part: Part) => Promise<void>
  deletePart: (id: string) => Promise<void>

  // Assembly CRUD
  addAssembly: (assembly: Assembly) => Promise<void>
  updateAssembly: (assembly: Assembly) => Promise<void>
  deleteAssembly: (id: string) => Promise<void>

  // Product CRUD
  addProduct: (product: Product) => Promise<void>
  updateProduct: (product: Product) => Promise<void>
  deleteProduct: (id: string) => Promise<void>

  // Inventory CRUD
  addInventoryItem: (item: InventoryItem) => Promise<void>
  updateInventoryItem: (item: InventoryItem) => Promise<void>
  deleteInventoryItem: (id: string) => Promise<void>

  // Quote CRUD
  addQuote: (quote: Quote) => Promise<Quote>
  updateQuote: (quote: Quote) => Promise<void>
  deleteQuote: (id: string) => Promise<void>
  duplicateQuote: (id: string) => Promise<void>
  updateQuoteStatus: (id: string, status: QuoteStatus) => Promise<void>

  // Project CRUD
  addProject: (project: CreateProjectPayload) => Promise<Project>
  updateProject: (project: Project) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  updateProjectStatus: (id: string, status: ProjectStatus) => Promise<void>
  finishProject: (id: string) => Promise<void>
  toggleChecklistItem: (projectId: string, itemId: string) => Promise<void>
  addChecklistItem: (projectId: string, item: ChecklistItem) => Promise<void>
  addProjectIssue: (projectId: string, issue: ProjectIssue) => Promise<void>
  resolveProjectIssue: (projectId: string, issueId: string) => Promise<void>
  createProjectFromQuote: (quoteId: string) => Promise<Project | null>

  // User CRUD
  addUser: (userWithInfo: UserWithInfo) => Promise<void>
  updateUser: (userWithInfo: UserWithInfo) => Promise<void>
  deleteUser: (id: string) => Promise<void>
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [companies, setCompanies] = useState<Company[]>([])
  const [parts, setParts] = useState<Part[]>([])
  const [assemblies, setAssemblies] = useState<Assembly[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [usersWithInfo, setUsersWithInfo] = useState<UserWithInfo[]>([])

  const reloadAll = useCallback(async () => {
    setIsLoading(true)
    try {
      const [
        companiesData,
        partsData,
        assembliesData,
        productsData,
        inventoryData,
        quotesData,
        projectsData,
        usersData,
      ] = await Promise.all([
        companiesApi.list().catch(() => []),
        partsApi.list().catch(() => []),
        assembliesApi.list().catch(() => []),
        productsApi.list().catch(() => []),
        inventoryApi.list().catch(() => []),
        quotesApi.list().catch(() => []),
        projectsApi.list().catch(() => []),
        usersApi.list().catch(() => []),
      ])
      setCompanies(companiesData)
      setParts(partsData)
      setAssemblies(assembliesData)
      setProducts(productsData)
      setInventory(inventoryData)
      setQuotes(quotesData)
      setProjects(projectsData)
      setUsersWithInfo(usersData)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Only load from API if we have a token (user is logged in)
    if (typeof window !== 'undefined' && localStorage.getItem('access_token')) {
      reloadAll()
    } else {
      setIsLoading(false)
    }
  }, [reloadAll])

  // ─── Companies ──────────────────────────────────────────────────────────────

  const addCompany = useCallback(async (company: Company) => {
    const created = await companiesApi.create(company)
    setCompanies((prev) => [...prev, created])
  }, [])

  const updateCompany = useCallback(async (company: Company) => {
    const updated = await companiesApi.update(company.id, company)
    setCompanies((prev) => prev.map((c) => (c.id === company.id ? updated : c)))
  }, [])

  const deleteCompany = useCallback(async (id: string) => {
    await companiesApi.delete(id)
    setCompanies((prev) => prev.filter((c) => c.id !== id))
  }, [])

  // ─── Parts ──────────────────────────────────────────────────────────────────

  const addPart = useCallback(async (part: Part) => {
    const created = await partsApi.create(part)
    setParts((prev) => [...prev, created])
  }, [])

  const updatePart = useCallback(async (part: Part) => {
    const updated = await partsApi.update(part.id, part)
    setParts((prev) => prev.map((p) => (p.id === part.id ? updated : p)))
  }, [])

  const deletePart = useCallback(async (id: string) => {
    await partsApi.delete(id)
    setParts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  // ─── Assemblies ─────────────────────────────────────────────────────────────

  const addAssembly = useCallback(async (assembly: Assembly) => {
    const created = await assembliesApi.create(assembly)
    setAssemblies((prev) => [...prev, created])
  }, [])

  const updateAssembly = useCallback(async (assembly: Assembly) => {
    const updated = await assembliesApi.update(assembly.id, assembly)
    setAssemblies((prev) => prev.map((a) => (a.id === assembly.id ? updated : a)))
  }, [])

  const deleteAssembly = useCallback(async (id: string) => {
    await assembliesApi.delete(id)
    setAssemblies((prev) => prev.filter((a) => a.id !== id))
  }, [])

  // ─── Products ───────────────────────────────────────────────────────────────

  const addProduct = useCallback(async (product: Product) => {
    const created = await productsApi.create(product)
    setProducts((prev) => [...prev, created])
  }, [])

  const updateProduct = useCallback(async (product: Product) => {
    const updated = await productsApi.update(product.id, product)
    setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)))
  }, [])

  const deleteProduct = useCallback(async (id: string) => {
    await productsApi.delete(id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  // ─── Inventory ──────────────────────────────────────────────────────────────

  const addInventoryItem = useCallback(async (item: InventoryItem) => {
    const created = await inventoryApi.create(item)
    setInventory((prev) => [...prev, created])
  }, [])

  const updateInventoryItem = useCallback(async (item: InventoryItem) => {
    const updated = await inventoryApi.update(item.id, item)
    setInventory((prev) => prev.map((i) => (i.id === item.id ? updated : i)))
  }, [])

  const deleteInventoryItem = useCallback(async (id: string) => {
    await inventoryApi.delete(id)
    setInventory((prev) => prev.filter((i) => i.id !== id))
  }, [])

  // ─── Quotes ─────────────────────────────────────────────────────────────────

  const addQuote = useCallback(async (quote: Quote): Promise<Quote> => {
    const created = await quotesApi.create(quote)
    setQuotes((prev) => [...prev, created])
    return created
  }, [])

  const updateQuote = useCallback(async (quote: Quote) => {
    const updated = await quotesApi.update(quote.id, quote)
    setQuotes((prev) => prev.map((q) => (q.id === quote.id ? updated : q)))
  }, [])

  const deleteQuote = useCallback(async (id: string) => {
    await quotesApi.delete(id)
    setQuotes((prev) => prev.filter((q) => q.id !== id))
  }, [])

  const duplicateQuote = useCallback(async (id: string) => {
    const copy = await quotesApi.duplicate(id)
    setQuotes((prev) => [...prev, copy])
  }, [])

  const updateQuoteStatus = useCallback(async (id: string, status: QuoteStatus) => {
    const updated = await quotesApi.updateStatus(id, status)
    setQuotes((prev) => prev.map((q) => (q.id === id ? updated : q)))
  }, [])

  // ─── Projects ───────────────────────────────────────────────────────────────

  const addProject = useCallback(async (project: CreateProjectPayload): Promise<Project> => {
    const created = await projectsApi.create(project)
    setProjects((prev) => [...prev, created])
    return created
  }, [])

  const updateProject = useCallback(async (project: Project) => {
    const updated = await projectsApi.update(project.id, project)
    setProjects((prev) => prev.map((p) => (p.id === project.id ? updated : p)))
  }, [])

  const deleteProject = useCallback(async (id: string) => {
    await projectsApi.delete(id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const updateProjectStatus = useCallback(async (id: string, status: ProjectStatus) => {
    const updated = await projectsApi.updateStatus(id, status)
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)))
  }, [])

  const finishProject = useCallback(async (id: string) => {
    const updated = await projectsApi.finish(id)
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)))
  }, [])

  const toggleChecklistItem = useCallback(async (projectId: string, itemId: string) => {
    const updated = await projectsApi.toggleChecklistItem(projectId, itemId)
    setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)))
  }, [])

  const addChecklistItem = useCallback(async (projectId: string, item: ChecklistItem) => {
    const updated = await projectsApi.addChecklistItem(projectId, item)
    setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)))
  }, [])

  const addProjectIssue = useCallback(async (projectId: string, issue: ProjectIssue) => {
    const updated = await projectsApi.addIssue(projectId, issue)
    setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)))
  }, [])

  const resolveProjectIssue = useCallback(async (projectId: string, issueId: string) => {
    const updated = await projectsApi.resolveIssue(projectId, issueId)
    setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)))
  }, [])

  const createProjectFromQuote = useCallback(async (quoteId: string): Promise<Project | null> => {
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    const userName = user ? JSON.parse(user).name : 'System'
    const newProject = await projectsApi.createFromQuote(quoteId, userName)
    setProjects((prev) => [...prev, newProject])
    return newProject
  }, [])

  // ─── Users ──────────────────────────────────────────────────────────────────

  const addUser = useCallback(async (userWithInfo: UserWithInfo) => {
    // UserWithInfo from forms won't have password; handled separately
    // For now, accept the shape components pass and create via a cast
    const payload = userWithInfo as UserWithInfo & { password?: string }
    const created = await usersApi.create({
      firstName: payload.user.firstName || payload.user.name?.split(' ')[0] || '',
      lastName: payload.user.lastName || payload.user.name?.split(' ').slice(1).join(' ') || '',
      email: payload.user.email,
      password: (payload as { password?: string }).password || 'changeme',
      role: payload.additionalInformation.role,
    })
    setUsersWithInfo((prev) => [...prev, created])
  }, [])

  const updateUser = useCallback(async (userWithInfo: UserWithInfo) => {
    const payload = userWithInfo as UserWithInfo & { password?: string }
    const updated = await usersApi.update(payload.user.id, {
      firstName: payload.user.firstName,
      lastName: payload.user.lastName,
      email: payload.user.email,
      role: payload.additionalInformation.role,
      status: payload.user.status,
      ...(payload.password ? { password: payload.password } : {}),
    })
    setUsersWithInfo((prev) => prev.map((u) => (u.user.id === payload.user.id ? updated : u)))
  }, [])

  const deleteUser = useCallback(async (id: string) => {
    await usersApi.delete(id)
    setUsersWithInfo((prev) => prev.filter((u) => u.user.id !== id))
  }, [])

  return (
    <AppContext.Provider
      value={{
        isLoading,
        companies,
        parts,
        assemblies,
        products,
        inventory,
        quotes,
        projects,
        usersWithInfo,
        reloadAll,
        addCompany,
        updateCompany,
        deleteCompany,
        addPart,
        updatePart,
        deletePart,
        addAssembly,
        updateAssembly,
        deleteAssembly,
        addProduct,
        updateProduct,
        deleteProduct,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addQuote,
        updateQuote,
        deleteQuote,
        duplicateQuote,
        updateQuoteStatus,
        addProject,
        updateProject,
        deleteProject,
        updateProjectStatus,
        finishProject,
        toggleChecklistItem,
        addChecklistItem,
        addProjectIssue,
        resolveProjectIssue,
        createProjectFromQuote,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppData() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useAppData must be used within AppProvider")
  return ctx
}
