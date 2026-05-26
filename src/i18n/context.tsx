'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { no } from './no'
import { en } from './en'
import type { Translations } from './no'

type Language = 'no' | 'en'

interface LanguageContextValue {
  language: Language
  t: Translations
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'no',
  t: no,
  setLanguage: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('no')

  useEffect(() => {
    const saved = document.cookie
      .split('; ')
      .find((row) => row.startsWith('lang='))
      ?.split('=')[1] as Language | undefined
    if (saved === 'no' || saved === 'en') {
      setLanguageState(saved)
    }
  }, [])

  function setLanguage(lang: Language) {
    setLanguageState(lang)
    document.cookie = `lang=${lang}; path=/; max-age=${60 * 60 * 24 * 365}`
  }

  return (
    <LanguageContext.Provider value={{ language, t: language === 'en' ? en : no, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
