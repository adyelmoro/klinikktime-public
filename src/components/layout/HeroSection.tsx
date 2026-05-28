'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

const StarIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
    <path d="M5 0L6.12 3.38L9.76 3.09L7.07 5.38L8 9L5 7.1L2 9L2.93 5.38L.24 3.09L3.88 3.38Z" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="2.5" width="12" height="10" rx="2" stroke="#1A6BCC" strokeWidth="1.3" />
    <path d="M1 5.5H13" stroke="#1A6BCC" strokeWidth="1.3" />
    <rect x="3.75" y="1" width="1.5" height="3" rx="0.75" fill="#1A6BCC" />
    <rect x="8.75" y="1" width="1.5" height="3" rx="0.75" fill="#1A6BCC" />
  </svg>
)

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="#1A6BCC" strokeWidth="1.3" />
    <path d="M7 4V7L9 9" stroke="#1A6BCC" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1C4.79 1 3 2.79 3 5C3 7.67 6.5 12.5 7 13C7.5 12.5 11 7.67 11 5C11 2.79 9.21 1 7 1Z" stroke="#1A6BCC" strokeWidth="1.3" />
    <circle cx="7" cy="5" r="1.5" fill="#1A6BCC" />
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const PersonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="3.5" fill="#1A6BCC" opacity="0.85" />
    <path d="M5 20C5 16.134 8.134 13 12 13C15.866 13 19 16.134 19 20" stroke="#1A6BCC" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
  </svg>
)

export function HeroSection() {
  return (
    <section className="bg-white relative overflow-hidden border-b border-[#E5E7EB]">
      {/* Right-side gradient wash */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#EBF3FD]/50 to-transparent pointer-events-none" />

      {/* Decorative dots — top right */}
      <div className="absolute top-8 right-8 grid grid-cols-5 gap-2.5 opacity-20 pointer-events-none hidden lg:grid">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#1A6BCC]" />
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 lg:py-24 relative">
        <div className="grid lg:grid-cols-[58fr_42fr] gap-10 lg:gap-12 items-center">

          {/* ── LEFT: Copy ── */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF3FD] text-[#1A6BCC] text-[13px] font-semibold mb-6 border border-[#C8DCF5]">
              <span className="text-[#1A6BCC]"><StarIcon /></span>
              <span>Norsk privatpraksis · Rask timebestilling</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-[#111827] leading-[1.08] tracking-tight">
              Book time hos{' '}
              <span className="text-[#1A6BCC] relative inline-block">
                norske
                {/* Underline accent */}
                <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 160 6" preserveAspectRatio="none" fill="none">
                  <path d="M0 5C40 1 120 1 160 5" stroke="#1A6BCC" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
                </svg>
              </span>{' '}
              spesialister
            </h1>

            {/* Sub-copy */}
            <p className="mt-5 text-[17px] text-[#6B7280] leading-relaxed max-w-[480px]">
              Velg behandler, sjekk ledige tider og betal enkelt med Vipps.
              Trygg identifisering med BankID — alt på ett sted.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/practitioners">
                <Button size="lg">Finn behandler</Button>
              </Link>
              <Link href="/practitioners">
                <Button variant="secondary" size="lg">Se alle spesialister</Button>
              </Link>
            </div>

            {/* Trust logos */}
            <div className="mt-8 pt-8 border-t border-[#E5E7EB]">
              <p className="text-[11px] text-[#9CA3AF] uppercase tracking-widest font-semibold mb-3">
                Trygg betaling og ID-verifisering
              </p>
              <div className="flex items-center gap-5">
                <Image
                  src="/icons/vipps-wordmark.svg"
                  alt="Vipps"
                  width={88}
                  height={22}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                />
                <div className="w-px h-5 bg-[#E5E7EB]" />
                <Image
                  src="/icons/bankid-wordmark.svg"
                  alt="BankID"
                  width={107}
                  height={16}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                />
                <div className="w-px h-5 bg-[#E5E7EB]" />
                <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <rect x="1" y="5" width="11" height="7" rx="2" stroke="#059669" strokeWidth="1.3" />
                    <path d="M4 5V3.5C4 2.12 5.12 1 6.5 1C7.88 1 9 2.12 9 3.5V5" stroke="#059669" strokeWidth="1.3" strokeLinecap="round" />
                    <circle cx="6.5" cy="8.5" r="1" fill="#059669" />
                  </svg>
                  <span className="font-medium text-[#059669]">SSL-kryptert</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-7 flex items-center gap-6 flex-wrap">
              <div>
                <div className="text-2xl font-bold text-[#111827] leading-none">50+</div>
                <div className="text-xs text-[#9CA3AF] mt-1">Behandlere</div>
              </div>
              <div className="w-px h-7 bg-[#E5E7EB]" />
              <div>
                <div className="text-2xl font-bold text-[#111827] leading-none">4</div>
                <div className="text-xs text-[#9CA3AF] mt-1">Spesialiteter</div>
              </div>
              <div className="w-px h-7 bg-[#E5E7EB]" />
              <div>
                <div className="text-2xl font-bold text-[#111827] leading-none">100%</div>
                <div className="text-xs text-[#9CA3AF] mt-1">Norsk</div>
              </div>
              <div className="w-px h-7 bg-[#E5E7EB]" />
              <div>
                <div className="text-2xl font-bold text-[#111827] leading-none">24t</div>
                <div className="text-xs text-[#9CA3AF] mt-1">Avbestilling</div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Booking card illustration ── */}
          <div className="hidden lg:flex items-center justify-center relative min-h-[500px]">

            {/* Background blob circle */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-[#EBF3FD]" />

            {/* Back card (depth) */}
            <div
              className="absolute w-[268px] bg-white rounded-2xl shadow-md border border-[#E5E7EB]"
              style={{ top: '56px', left: '20px', transform: 'rotate(-4deg)', opacity: 0.55 }}
            >
              <div className="bg-[#E5E7EB] h-12 rounded-t-2xl" />
              <div className="p-4 space-y-2">
                <div className="h-2.5 w-3/4 bg-[#F3F4F6] rounded-full" />
                <div className="h-2.5 w-1/2 bg-[#F3F4F6] rounded-full" />
                <div className="h-2.5 w-2/3 bg-[#F3F4F6] rounded-full" />
              </div>
            </div>

            {/* ── Main confirmation card ── */}
            <div className="relative z-10 w-[290px] bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden">

              {/* Green confirmation header */}
              <div className="bg-[#059669] px-5 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckIcon />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">Booking bekreftet</p>
                  <p className="text-white/70 text-xs mt-0.5">Bekreftelse sendt på e-post</p>
                </div>
              </div>

              {/* Practitioner row */}
              <div className="px-5 py-4 flex items-center gap-3 border-b border-[#F3F4F6]">
                <div className="w-11 h-11 rounded-full bg-[#EBF3FD] flex items-center justify-center flex-shrink-0">
                  <PersonIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#111827] text-sm leading-tight">Dr. Sofia Hansen</p>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-semibold mt-1">
                    Psykolog
                  </span>
                </div>
                {/* 5-star row */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <svg key={i} width="9" height="9" viewBox="0 0 10 10" fill="#FBBF24">
                      <path d="M5 1L6.18 3.71L9 4.11L7 6.08L7.47 9L5 7.77L2.53 9L3 6.08L1 4.11L3.82 3.71L5 1Z" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Appointment details */}
              <div className="px-5 py-3.5 space-y-3">
                {[
                  { Icon: CalendarIcon, label: 'Dato', value: 'Tirsdag, 3. jun. 2025' },
                  { Icon: ClockIcon,    label: 'Tid',  value: '14:30 – 15:00' },
                  { Icon: PinIcon,      label: 'Sted', value: 'Oslo Sentrum' },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#EBF3FD] flex items-center justify-center flex-shrink-0">
                      <Icon />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#9CA3AF] leading-none">{label}</p>
                      <p className="text-sm font-medium text-[#111827] mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vipps payment badge */}
              <div className="px-5 pb-5 pt-1">
                <div className="flex items-center justify-between rounded-xl bg-[#FFF5F1] px-3.5 py-2.5 border border-[#FFCDB5]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-[#FF5B24] flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="white">
                        <path d="M2 5L5 9L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    </div>
                    <Image src="/icons/vipps-wordmark.svg" alt="Vipps" width={50} height={15} />
                    <span className="text-[11px] text-[#9CA3AF]">Betalt</span>
                  </div>
                  <span className="text-sm font-bold text-[#111827]">895 kr</span>
                </div>
              </div>
            </div>

            {/* ── Floating pill: next available ── */}
            <div
              className="absolute z-20 bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-2 border border-[#E5E7EB]"
              style={{ top: '24px', right: '-4px' }}
            >
              <div className="w-2 h-2 rounded-full bg-[#059669] flex-shrink-0 animate-pulse" />
              <span className="text-xs font-semibold text-[#111827] whitespace-nowrap">Neste ledig: i dag</span>
            </div>

            {/* ── Floating pill: specialties ── */}
            <div
              className="absolute z-20 bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-2 border border-[#E5E7EB]"
              style={{ bottom: '24px', left: '-4px' }}
            >
              <div className="w-6 h-6 rounded-full bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="3" fill="#7C3AED" />
                  <path d="M6 20C6 16.686 8.686 14 12 14C15.314 14 18 16.686 18 20" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-[#111827] whitespace-nowrap">4 spesialiteter tilgjengelig</span>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
