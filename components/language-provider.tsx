'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Locale, MessageKey, defaultLocale, t } from '@/lib/i18n'

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  translate: (key: MessageKey, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale)

  useEffect(() => {
    const savedLocale = window.localStorage.getItem('mosque-finder-locale') as Locale | null
    if (savedLocale === 'bn' || savedLocale === 'en') {
      setLocale(savedLocale)
    }
  }, [])

  const handleSetLocale = (nextLocale: Locale) => {
    setLocale(nextLocale)
    window.localStorage.setItem('mosque-finder-locale', nextLocale)
  }

  const value = useMemo(
    () => ({
      locale,
      setLocale: handleSetLocale,
      translate: (key: MessageKey, vars?: Record<string, string | number>) => t(locale, key, vars),
    }),
    [locale]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}