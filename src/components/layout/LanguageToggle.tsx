'use client'

import { useLanguage } from '@/i18n/context'

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <button
        onClick={() => setLanguage('no')}
        className={`px-2 py-1 rounded transition-colors ${
          language === 'no'
            ? 'text-[#1A6BCC] font-semibold'
            : 'text-[#6B7280] hover:text-[#111827]'
        }`}
      >
        NO
      </button>
      <span className="text-[#E5E7EB]">|</span>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded transition-colors ${
          language === 'en'
            ? 'text-[#1A6BCC] font-semibold'
            : 'text-[#6B7280] hover:text-[#111827]'
        }`}
      >
        EN
      </button>
    </div>
  )
}
