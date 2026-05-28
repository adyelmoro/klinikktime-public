'use client'

import Link from 'next/link'
import Image from 'next/image'
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
        <Link href="/" className="flex items-center flex-shrink-0">
          <Image src="/icons/logo-wordmark.svg" alt="Klinikktime" width={165} height={36} priority />
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
