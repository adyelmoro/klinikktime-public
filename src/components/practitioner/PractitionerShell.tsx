'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const PRIMARY = '#0d9463'
const PRIMARY_LIGHT = '#e6f5ee'

const NAV = [
  {
    href: '/min-klinikk',
    label: 'Dagsskjema',
    icon: (active: boolean) => (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={active ? PRIMARY : '#6B7280'} strokeWidth={2}>
        <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" />
        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/min-klinikk/appointments',
    label: 'Mine timer',
    icon: (active: boolean) => (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={active ? PRIMARY : '#6B7280'} strokeWidth={2}>
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/min-klinikk/analytics',
    label: 'Analyse',
    icon: (active: boolean) => (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={active ? PRIMARY : '#6B7280'} strokeWidth={2}>
        <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/min-klinikk/availability',
    label: 'Tilgjengelighet',
    icon: (active: boolean) => (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={active ? PRIMARY : '#6B7280'} strokeWidth={2}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

interface Props {
  children: React.ReactNode
  practitionerName: string
  practitionerSpecialty: string
}

const SPECIALTY_NO: Record<string, string> = {
  physio: 'Fysioterapi', psychology: 'Psykologi', sports_medicine: 'Idrettsmedisin',
  nutritionist: 'Ernæring', private_gp: 'Fastlege',
}

export function PractitionerShell({ children, practitionerName, practitionerSpecialty }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = practitionerName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/min-klinikk'
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/icons/logo-icon.svg" alt="Klinikktime" width={28} height={28} />
            <div>
              <p className="font-bold text-[#111827] text-sm leading-tight">Klinikktime</p>
              <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: PRIMARY }}>
                Behandler
              </span>
            </div>
          </div>
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="sm:hidden p-1 rounded-lg text-[#6B7280] hover:bg-[#F5F7FA]"
            aria-label="Lukk meny"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Practitioner identity */}
      <div className="px-4 py-3 border-b border-[#F3F4F6]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: PRIMARY }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#111827] truncate">{practitionerName}</p>
            <p className="text-[10px] text-[#9CA3AF] truncate">
              {SPECIALTY_NO[practitionerSpecialty] ?? practitionerSpecialty}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: active ? PRIMARY_LIGHT : undefined,
                color: active ? PRIMARY : '#6B7280',
              }}
            >
              {icon(active)}
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[#E5E7EB]">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#6B7280] hover:bg-[#F5F7FA] transition-colors mb-1"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth={2}>
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Tilbake til siden
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Logg ut
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen flex bg-[#F5F7FA]">

      {/* Mobile top bar */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-[#E5E7EB] h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src="/icons/logo-icon.svg" alt="Klinikktime" width={24} height={24} />
          <div>
            <span className="font-bold text-sm text-[#111827]">Klinikktime</span>
            <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: PRIMARY }}>
              Behandler
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
            style={{ backgroundColor: PRIMARY }}>
            {initials}
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-[#6B7280] hover:bg-[#F5F7FA] transition-colors"
            aria-label="Åpne meny"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="sm:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — drawer on mobile, fixed on desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 sm:w-56 bg-white border-r border-[#E5E7EB] flex flex-col
        transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        sm:translate-x-0
      `}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <main className="flex-1 sm:ml-56 min-h-screen pt-14 sm:pt-0">
        {children}
      </main>
    </div>
  )
}
