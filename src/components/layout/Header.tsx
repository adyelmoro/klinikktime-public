'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/i18n/context'
import { LanguageToggle } from './LanguageToggle'

export function Header() {
  const { t } = useLanguage()
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-[#1A6BCC] rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
                fill="currentColor" />
              <path d="M11 6h2v2h-2zM11 10h2v8h-2z" fill="white" />
              <rect x="7" y="11" width="10" height="2" rx="1" fill="white"/>
              <rect x="11" y="7" width="2" height="10" rx="1" fill="white"/>
            </svg>
          </div>
          <span className="font-bold text-lg text-[#111827] tracking-tight">Klinikktime</span>
        </Link>

        {/* Nav */}
        {!isAdmin && (
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors ${pathname === '/' ? 'text-[#1A6BCC]' : 'text-[#6B7280] hover:text-[#111827]'}`}
            >
              {t.nav.home}
            </Link>
            <Link
              href="/practitioners"
              className={`transition-colors ${pathname.startsWith('/practitioners') ? 'text-[#1A6BCC]' : 'text-[#6B7280] hover:text-[#111827]'}`}
            >
              {t.nav.practitioners}
            </Link>
            <Link
              href="/min-side"
              className={`transition-colors ${pathname === '/min-side' ? 'text-[#1A6BCC]' : 'text-[#6B7280] hover:text-[#111827]'}`}
            >
              {t.nav.myAppointments}
            </Link>
          </nav>
        )}

        {isAdmin && (
          <span className="text-sm font-medium text-[#6B7280]">Admin Panel</span>
        )}

        <div className="flex items-center gap-3">
          <LanguageToggle />
        </div>
      </div>
    </header>
  )
}
