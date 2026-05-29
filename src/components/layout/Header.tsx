'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/i18n/context'
import { LanguageToggle } from './LanguageToggle'

export function Header() {
  const { t } = useLanguage()
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/practitioners', label: t.nav.practitioners },
    { href: '/min-side', label: t.nav.myAppointments },
  ]

  return (
    <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0" onClick={() => setMobileOpen(false)}>
          <img src="/icons/logo-wordmark.svg" alt="Klinikktime" width={165} height={36} />
        </Link>

        {/* Desktop nav */}
        {!isAdmin && (
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`transition-colors ${
                  (href === '/' ? pathname === '/' : pathname.startsWith(href))
                    ? 'text-[#1A6BCC]'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}

        {isAdmin && (
          <span className="text-sm font-medium text-[#6B7280]">Admin Panel</span>
        )}

        <div className="flex items-center gap-3">
          <LanguageToggle />

          {/* Mobile hamburger — only on public pages */}
          {!isAdmin && (
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="sm:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
              aria-label="Meny"
            >
              <span className={`block w-5 h-0.5 bg-[#374151] transition-all duration-200 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-[#374151] transition-all duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-[#374151] transition-all duration-200 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {!isAdmin && mobileOpen && (
        <div className="sm:hidden bg-white border-t border-[#E5E7EB] px-4 py-3 space-y-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                (href === '/' ? pathname === '/' : pathname.startsWith(href))
                  ? 'bg-[#EBF3FD] text-[#1A6BCC]'
                  : 'text-[#374151] hover:bg-[#F5F7FA]'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
