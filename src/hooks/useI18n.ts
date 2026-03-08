/**
 * i18n hook — reads ?lang= URL param, returns a t(key) function.
 * Falls back to English when a Spanish translation is missing (empty string).
 */

import { createContext, useContext, useState, useCallback } from 'react'
import { en } from '../i18n/en.ts'
import { es } from '../i18n/es.ts'
import type { I18nKey } from '../i18n/en.ts'

export type Lang = 'en' | 'es'

const TRANSLATIONS: Record<Lang, Record<string, string>> = { en, es }

interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: I18nKey) => string
}

function detectLang(): Lang {
  const params = new URLSearchParams(window.location.search)
  const urlLang = params.get('lang')
  if (urlLang === 'es') return 'es'
  if (urlLang === 'en') return 'en'
  // Fall back to browser language
  if (navigator.language.startsWith('es')) return 'es'
  return 'en'
}

function updateUrlLang(lang: Lang) {
  const params = new URLSearchParams(window.location.search)
  if (lang === 'en') {
    params.delete('lang')
  } else {
    params.set('lang', lang)
  }
  const qs = params.toString()
  const newUrl = window.location.pathname + (qs ? '?' + qs : '')
  history.replaceState(null, '', newUrl)
}

export const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key: I18nKey) => en[key],
})

export function useI18nProvider(): I18nContextValue {
  const [lang, setLangState] = useState<Lang>(detectLang)

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang)
    updateUrlLang(newLang)
  }, [])

  const t = useCallback((key: I18nKey): string => {
    const table = TRANSLATIONS[lang]
    const val = table[key]
    // Fall back to English if translation is empty or missing
    if (!val) return en[key]
    return val
  }, [lang])

  return { lang, setLang, t }
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext)
}
