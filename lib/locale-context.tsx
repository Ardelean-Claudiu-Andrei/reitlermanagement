"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type Locale, locales, t, getTranslations } from "./i18n"

type LocaleContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: Parameters<typeof t>[0], params?: Record<string, string>) => string
  translations: ReturnType<typeof getTranslations>
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ro")

  useEffect(() => {
    const saved = localStorage.getItem("sms-reitler-locale") as Locale | null
    if (saved && locales.includes(saved)) {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("sms-reitler-locale", newLocale)
  }

  const value: LocaleContextType = {
    locale,
    setLocale,
    t: (key, params) => t(key, locale, params),
    translations: getTranslations(locale),
  }

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider")
  }
  return context
}
