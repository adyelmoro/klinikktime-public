'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const NAV = [
  {
    href: '/admin',
    label: 'Dagsskjema',
    icon: (active: boolean) => (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={active ? '#1A6BCC' : '#6B7280'} strokeWidth={2}>
        <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" />
        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/admin/appointments',
    label: 'Alle timer',
    icon: (active: boolean) => (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={active ? '#1A6BCC' : '#6B7280'} strokeWidth={2}>
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/admin/analytics',
    label: 'Analyse',
    icon: (active: boolean) => (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={active ? '#1A6BCC' : '#6B7280'} strokeWidth={2}>
        <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/admin/availability',
    label: 'Tilgjengelighet',
    icon: (active: boolean) => (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={active ? '#1A6BCC' : '#6B7280'} strokeWidth={2}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="min-h-screen flex bg-[#F5F7FA]">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-[#E5E7EB] flex flex-col fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <Image src="/icons/logo.svg" alt="Klinikktime" width={28} height={28} />
            <div>
              <p className="font-bold text-[#111827] text-sm leading-tight">Klinikktime</p>
              <span className="text-[10px] font-semibold text-[#1A6BCC] uppercase tracking-wide">Admin</span>
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#EBF3FD] text-[#1A6BCC]'
                    : 'text-[#6B7280] hover:bg-[#F5F7FA] hover:text-[#374151]'
                }`}
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
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 min-h-screen">
        {children}
      </main>
    </div>
  )
}
