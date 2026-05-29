'use client'

import Link from 'next/link'
import { useLanguage } from '@/i18n/context'

export function Footer() {
  const { language } = useLanguage()

  return (
    <footer className="bg-white border-t border-[#E5E7EB] mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-[#111827]">Klinikktime Demo Klinikk</p>
            <p className="text-sm text-[#6B7280]">Storgata 1, 0155 Oslo</p>
            <p className="text-sm text-[#6B7280]">+47 22 00 00 00</p>
          </div>
          <div className="text-sm text-[#6B7280] text-left sm:text-right space-y-1">
            <p>© {new Date().getFullYear()} Klinikktime</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 sm:justify-end">
              <Link href="/admin" className="hover:text-[#1A6BCC] transition-colors">
                {language === 'no' ? 'Adminpanel' : 'Admin panel'}
              </Link>
              <Link href="/min-klinikk" className="hover:text-[#0d9463] transition-colors">
                {language === 'no' ? 'Behandlerportal' : 'Practitioner portal'}
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs text-[#6B7280]">
          {language === 'no'
            ? 'Demo-plattform. BankID og Vipps er simulerte for porteføljedemonstrasjon.'
            : 'Demo platform. BankID and Vipps are simulated for portfolio demonstration purposes.'}
        </p>
      </div>
    </footer>
  )
}
