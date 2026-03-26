"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
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
} from "./types"
import {
  companies as initialCompanies,
  parts as initialParts,
  assemblies as initialAssemblies,
  products as initialProducts,
  inventoryItems as initialInventory,
  quotes as initialQuotes,
  projects as initialProjects,
  usersWithInfo as initialUsersWithInfo,
} from "./mock-data"

interface AppState {
  // Data
  companies: Company[]
  parts: Part[]
  assemblies: Assembly[]
  products: Product[]
  inventory: InventoryItem[]
  quotes: Quote[]
  projects: Project[]
  usersWithInfo: UserWithInfo[]

  // Company CRUD
  addCompany: (company: Company) => void
  updateCompany: (company: Company) => void
  deleteCompany: (id: string) => void

  // Part CRUD
  addPart: (part: Part) => void
  updatePart: (part: Part) => void
  deletePart: (id: string) => void

  // Assembly CRUD
  addAssembly: (assembly: Assembly) => void
  updateAssembly: (assembly: Assembly) => void
  deleteAssembly: (id: string) => void

  // Product CRUD
  addProduct: (product: Product) => void
  updateProduct: (product: Product) => void
  deleteProduct: (id: string) => void

  // Inventory CRUD
  addInventoryItem: (item: InventoryItem) => void
  updateInventoryItem: (item: InventoryItem) => void
  deleteInventoryItem: (id: string) => void

  // Quote CRUD
  addQuote: (quote: Quote) => void
  updateQuote: (quote: Quote) => void
  deleteQuote: (id: string) => void
  duplicateQuote: (id: string) => void
  updateQuoteStatus: (id: string, status: QuoteStatus) => void

  // Project CRUD
  addProject: (project: Project) => void
  updateProject: (project: Project) => void
  deleteProject: (id: string) => void
  updateProjectStatus: (id: string, status: ProjectStatus) => void
  finishProject: (id: string) => void
  toggleChecklistItem: (projectId: string, itemId: string) => void
  addChecklistItem: (projectId: string, item: ChecklistItem) => void
  addProjectIssue: (projectId: string, issue: ProjectIssue) => void
  resolveProjectIssue: (projectId: string, issueId: string) => void
  createProjectFromQuote: (quoteId: string) => Project | null

  // User CRUD
  addUser: (userWithInfo: UserWithInfo) => void
  updateUser: (userWithInfo: UserWithInfo) => void
  deleteUser: (id: string) => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)
  const [parts, setParts] = useState<Part[]>(initialParts)
  const [assemblies, setAssemblies] = useState<Assembly[]>(initialAssemblies)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory)
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes)
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [usersWithInfo, setUsersWithInfo] = useState<UserWithInfo[]>(initialUsersWithInfo)

  // Company CRUD
  const addCompany = useCallback((company: Company) => {
    setCompanies((prev) => [...prev, company])
  }, [])

  const updateCompany = useCallback((company: Company) => {
    setCompanies((prev) => prev.map((c) => (c.id === company.id ? company : c)))
  }, [])

  const deleteCompany = useCallback((id: string) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id))
  }, [])

  // Part CRUD
  const addPart = useCallback((part: Part) => {
    setParts((prev) => [...prev, part])
  }, [])

  const updatePart = useCallback((part: Part) => {
    setParts((prev) => prev.map((p) => (p.id === part.id ? part : p)))
  }, [])

  const deletePart = useCallback((id: string) => {
    setParts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  // Assembly CRUD
  const addAssembly = useCallback((assembly: Assembly) => {
    setAssemblies((prev) => [...prev, assembly])
  }, [])

  const updateAssembly = useCallback((assembly: Assembly) => {
    setAssemblies((prev) => prev.map((a) => (a.id === assembly.id ? assembly : a)))
  }, [])

  const deleteAssembly = useCallback((id: string) => {
    setAssemblies((prev) => prev.filter((a) => a.id !== id))
  }, [])

  // Product CRUD
  const addProduct = useCallback((product: Product) => {
    setProducts((prev) => [...prev, product])
  }, [])

  const updateProduct = useCallback((product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)))
  }, [])

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  // Inventory CRUD
  const addInventoryItem = useCallback((item: InventoryItem) => {
    setInventory((prev) => [...prev, item])
  }, [])

  const updateInventoryItem = useCallback((item: InventoryItem) => {
    setInventory((prev) => prev.map((i) => (i.id === item.id ? item : i)))
  }, [])

  const deleteInventoryItem = useCallback((id: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== id))
  }, [])

  // Quote CRUD
  const addQuote = useCallback((quote: Quote) => {
    setQuotes((prev) => [...prev, quote])
  }, [])

  const updateQuote = useCallback((quote: Quote) => {
    setQuotes((prev) => prev.map((q) => (q.id === quote.id ? quote : q)))
  }, [])

  const deleteQuote = useCallback((id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id))
  }, [])

  const duplicateQuote = useCallback((id: string) => {
    setQuotes((prev) => {
      const original = prev.find((q) => q.id === id)
      if (!original) return prev
      const copy: Quote = {
        ...original,
        id: `q${Date.now()}`,
        name: `${original.name} (Copy)`,
        status: "draft",
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      }
      return [...prev, copy]
    })
  }, [])

  const updateQuoteStatus = useCallback((id: string, status: QuoteStatus) => {
    setQuotes((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, status, updatedAt: new Date().toISOString().split("T")[0] }
          : q
      )
    )
  }, [])

  // Project CRUD
  const addProject = useCallback((project: Project) => {
    setProjects((prev) => [...prev, project])
  }, [])

  const updateProject = useCallback((project: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === project.id ? project : p)))
  }, [])

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const updateProjectStatus = useCallback((id: string, status: ProjectStatus) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              updatedAt: new Date().toISOString().split("T")[0],
              activity: [
                ...p.activity,
                {
                  id: `a${Date.now()}`,
                  action: `Status changed to ${status.replace("-", " ")}`,
                  user: "Claudiu Ardelean",
                  timestamp: new Date().toLocaleString(),
                },
              ],
            }
          : p
      )
    )
  }, [])

  const finishProject = useCallback((id: string) => {
    const today = new Date().toISOString().split("T")[0]
    const warrantyDate = new Date()
    warrantyDate.setFullYear(warrantyDate.getFullYear() + 2)
    const warranty = warrantyDate.toISOString().split("T")[0]

    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "done" as ProjectStatus,
              finishDate: today,
              warrantyExpiration: warranty,
              updatedAt: today,
              activity: [
                ...p.activity,
                {
                  id: `a${Date.now()}`,
                  action: "Project finished",
                  user: "Claudiu Ardelean",
                  timestamp: new Date().toLocaleString(),
                },
              ],
            }
          : p
      )
    )
  }, [])

  const toggleChecklistItem = useCallback((projectId: string, itemId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              checklist: p.checklist.map((c) =>
                c.id === itemId
                  ? { ...c, done: !c.done, doneAt: !c.done ? new Date().toISOString().split("T")[0] : null }
                  : c
              ),
            }
          : p
      )
    )
  }, [])

  const addChecklistItem = useCallback((projectId: string, item: ChecklistItem) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, checklist: [...p.checklist, item] }
          : p
      )
    )
  }, [])

  const addProjectIssue = useCallback((projectId: string, issue: ProjectIssue) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              issues: [...p.issues, issue],
              activity: [
                ...p.activity,
                {
                  id: `a${Date.now()}`,
                  action: `Issue reported: ${issue.description.substring(0, 50)}...`,
                  user: "Claudiu Ardelean",
                  timestamp: new Date().toLocaleString(),
                },
              ],
            }
          : p
      )
    )
  }, [])

  const resolveProjectIssue = useCallback((projectId: string, issueId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              issues: p.issues.map((i) =>
                i.id === issueId
                  ? { ...i, solved: true, solvedAt: new Date().toISOString().split("T")[0] }
                  : i
              ),
              activity: [
                ...p.activity,
                {
                  id: `a${Date.now()}`,
                  action: "Issue resolved",
                  user: "Claudiu Ardelean",
                  timestamp: new Date().toLocaleString(),
                },
              ],
            }
          : p
      )
    )
  }, [])

  const createProjectFromQuote = useCallback((quoteId: string): Project | null => {
    const quote = quotes.find((q) => q.id === quoteId)
    if (!quote) return null

    const projectCount = projects.length + 1
    const today = new Date().toISOString().split("T")[0]
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + quote.deliveryTimeWeeks * 7)

    const newProject: Project = {
      id: `proj${Date.now()}`,
      code: `PRJ-2026-${String(projectCount).padStart(3, "0")}`,
      name: quote.name,
      companyId: quote.companyId,
      quoteId: quote.id,
      status: "draft",
      startDate: today,
      deadline: deadline.toISOString().split("T")[0],
      finishDate: null,
      warrantyExpiration: null,
      items: quote.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        notes: item.notes,
        fromInventory: false,
      })),
      checklist: [],
      issues: [],
      activity: [
        {
          id: `a${Date.now()}`,
          action: "Project created from quote",
          user: "Claudiu Ardelean",
          timestamp: new Date().toLocaleString(),
        },
      ],
      createdAt: today,
      updatedAt: today,
    }

    setProjects((prev) => [...prev, newProject])
    return newProject
  }, [quotes, projects])

  // User CRUD
  const addUser = useCallback((userWithInfo: UserWithInfo) => {
    setUsersWithInfo((prev) => [...prev, userWithInfo])
  }, [])

  const updateUser = useCallback((userWithInfo: UserWithInfo) => {
    setUsersWithInfo((prev) =>
      prev.map((u) => (u.user.id === userWithInfo.user.id ? userWithInfo : u))
    )
  }, [])

  const deleteUser = useCallback((id: string) => {
    setUsersWithInfo((prev) => prev.filter((u) => u.user.id !== id))
  }, [])

  return (
    <AppContext.Provider
      value={{
        companies,
        parts,
        assemblies,
        products,
        inventory,
        quotes,
        projects,
        usersWithInfo,
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
