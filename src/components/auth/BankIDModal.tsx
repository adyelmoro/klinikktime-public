'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/i18n/context'
import { Button } from '@/components/ui/Button'

type Step = 'input' | 'waiting' | 'done'

interface BankIDModalProps {
  onSuccess: (userId: string, email: string, name: string) => void
  onClose: () => void
}

export function BankIDModal({ onSuccess, onClose }: BankIDModalProps) {
  const { t } = useLanguage()
  const [step, setStep] = useState<Step>('input')
  const [ssn, setSsn] = useState('')
  const [countdown, setCountdown] = useState(30)
  const [error, setError] = useState('')

  // Countdown while waiting for "app approval"
  useEffect(() => {
    if (step !== 'waiting') return
    if (countdown <= 0) {
      simulateApproval()
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [step, countdown])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cleaned = ssn.replace(/\s/g, '')
    if (cleaned.length !== 11 || !/^\d+$/.test(cleaned)) {
      setError('Fødselsnummer må være 11 siffer')
      return
    }
    setError('')
    setStep('waiting')
  }

  async function simulateApproval() {
    setStep('done')

    // Create or sign in a demo Supabase user using the SSN as seed for the email
    const supabase = createClient()
    const demoEmail = `demo+${ssn.slice(0, 6)}@klinikktime.no`
    const demoPassword = `BankID-${ssn.slice(-5)}-demo`

    // Try sign-in first, fall back to sign-up
    let userId = ''
    let userEmail = demoEmail
    let fullName = 'Demo Bruker'

    const { data: signIn } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    })

    if (signIn?.user) {
      userId = signIn.user.id
    } else {
      const { data: signUp } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: { data: { full_name: fullName } },
      })
      if (signUp?.user) {
        userId = signUp.user.id
      }
    }

    // Short pause so user sees the "verified" state
    await new Promise((r) => setTimeout(r, 1200))
    onSuccess(userId, userEmail, fullName)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="bg-[#39134C] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-md px-2.5 py-1.5">
              <Image src="/icons/bankid-wordmark.svg" alt="BankID" width={70} height={10} />
            </div>
            <span className="text-white font-medium text-sm">{t.bankid.title}</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6">

          {/* Step 1 — SSN input */}
          {step === 'input' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="text-sm font-medium text-[#111827] mb-1">{t.bankid.step1Title}</p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  value={ssn}
                  onChange={(e) => setSsn(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="12345678901"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#39134C] focus:border-transparent tracking-widest"
                />
                {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
              </div>
              <Button type="submit" variant="bankid" size="md" className="w-full">
                {t.bankid.step1Cta}
              </Button>
            </form>
          )}

          {/* Step 2 — Waiting for app */}
          {step === 'waiting' && (
            <div className="text-center space-y-4 py-2">
              <div className="relative w-16 h-16 mx-auto">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#F3F4F6" strokeWidth="4" />
                  <circle
                    cx="32" cy="32" r="28"
                    fill="none" stroke="#39134C" strokeWidth="4"
                    strokeDasharray={`${(countdown / 30) * 175.9} 175.9`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-[#111827]">
                  {countdown}
                </span>
              </div>
              <div>
                <p className="font-medium text-[#111827]">{t.bankid.step2Title}</p>
                <p className="text-sm text-[#6B7280] mt-1">{t.bankid.step2Instruction}</p>
              </div>
              <div className="flex justify-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#39134C] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Done */}
          {step === 'done' && (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-semibold text-[#111827]">{t.bankid.step3Title}</p>
              <div className="flex justify-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-green-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-[#9CA3AF] mt-5 text-center leading-relaxed">
            {t.bankid.disclaimer}
          </p>
        </div>
      </div>
    </div>
  )
}
