"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import type {
  Product,
  OfferTemplate,
  ProductionOffer,
  UserWithInfo,
  ProductionStatus,
  ChecklistItem,
} from "./types"
import {
  products as initialProducts,
  offerTemplates as initialTemplates,
  productionOffers as initialProductionOffers,
  usersWithInfo as initialUsersWithInfo,
} from "./mock-data"

interface AppState {
  products: Product[]
  templates: OfferTemplate[]
  productionOffers: ProductionOffer[]
  usersWithInfo: UserWithInfo[]
  addProduct: (product: Product) => void
  updateProduct: (product: Product) => void
  deleteProduct: (id: string) => void
  addTemplate: (template: OfferTemplate) => void
  updateTemplate: (template: OfferTemplate) => void
  duplicateTemplate: (id: string) => void
  addProductionOffer: (offer: ProductionOffer) => void
  updateProductionOfferStatus: (id: string, status: ProductionStatus) => void
  toggleChecklistItem: (offerId: string, itemId: string) => void
  addChecklistItem: (offerId: string, item: ChecklistItem) => void
  addUser: (userWithInfo: UserWithInfo) => void
  updateUser: (userWithInfo: UserWithInfo) => void
  deleteUser: (id: string) => void
  duplicateUser: (id: string) => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [templates, setTemplates] = useState<OfferTemplate[]>(initialTemplates)
  const [productionOffers, setProductionOffers] = useState<ProductionOffer[]>(initialProductionOffers)
  const [usersWithInfo, setUsersWithInfo] = useState<UserWithInfo[]>(initialUsersWithInfo)

  const addProduct = useCallback((product: Product) => {
    setProducts((prev) => [...prev, product])
  }, [])

  const updateProduct = useCallback((product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)))
  }, [])

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const addTemplate = useCallback((template: OfferTemplate) => {
    setTemplates((prev) => [...prev, template])
  }, [])

  const updateTemplate = useCallback((template: OfferTemplate) => {
    setTemplates((prev) => prev.map((t) => (t.id === template.id ? template : t)))
  }, [])

  const duplicateTemplate = useCallback((id: string) => {
    setTemplates((prev) => {
      const original = prev.find((t) => t.id === id)
      if (!original) return prev
      const copy: OfferTemplate = {
        ...original,
        id: `t${Date.now()}`,
        name: `${original.name} (Copy)`,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      }
      return [...prev, copy]
    })
  }, [])

  const addProductionOffer = useCallback((offer: ProductionOffer) => {
    setProductionOffers((prev) => [...prev, offer])
  }, [])

  const updateProductionOfferStatus = useCallback((id: string, status: ProductionStatus) => {
    setProductionOffers((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status,
              activity: [
                ...o.activity,
                {
                  id: `a${Date.now()}`,
                  action: `Status changed to ${status.replace("-", " ")}`,
                  user: "Claudiu Ardelean",
                  timestamp: new Date().toLocaleString(),
                },
              ],
            }
          : o
      )
    )
  }, [])

  const toggleChecklistItem = useCallback((offerId: string, itemId: string) => {
    setProductionOffers((prev) =>
      prev.map((o) =>
        o.id === offerId
          ? {
              ...o,
              checklist: o.checklist.map((c) =>
                c.id === itemId
                  ? { ...c, done: !c.done, doneAt: !c.done ? new Date().toISOString().split("T")[0] : null }
                  : c
              ),
            }
          : o
      )
    )
  }, [])

  const addChecklistItem = useCallback((offerId: string, item: ChecklistItem) => {
    setProductionOffers((prev) =>
      prev.map((o) =>
        o.id === offerId
          ? { ...o, checklist: [...o.checklist, item] }
          : o
      )
    )
  }, [])

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

  const duplicateUser = useCallback((id: string) => {
    setUsersWithInfo((prev) => {
      const original = prev.find((u) => u.user.id === id)
      if (!original) return prev
      const newId = `u${Date.now()}`
      const copy: UserWithInfo = {
        user: {
          ...original.user,
          id: newId,
          name: `${original.user.name} (Copy)`,
          email: `copy-${original.user.email}`,
        },
        additionalInformation: {
          ...original.additionalInformation,
          userId: newId,
        },
      }
      return [...prev, copy]
    })
  }, [])

  return (
    <AppContext.Provider
      value={{
        products,
        templates,
        productionOffers,
        usersWithInfo,
        addProduct,
        updateProduct,
        deleteProduct,
        addTemplate,
        updateTemplate,
        duplicateTemplate,
        addProductionOffer,
        updateProductionOfferStatus,
        toggleChecklistItem,
        addChecklistItem,
        addUser,
        updateUser,
        deleteUser,
        duplicateUser,
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
