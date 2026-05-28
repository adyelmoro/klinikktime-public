'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useLanguage } from '@/i18n/context'
import { BankIDButton } from '@/components/auth/BankIDButton'
import { Button } from '@/components/ui/Button'
import type { Practitioner } from '@/types/database'

interface AuthUser {
  userId: string
  email: string
  name: string
}

function BookingForm() {
  const { t } = useLanguage()
  const router = useRouter()
  const params = useSearchParams()

  const practitionerId = params.get('practitionerId') ?? ''
  const date = params.get('date') ?? ''
  const time = params.get('time') ?? ''    // HH:MM

  const [practitioner, setPractitioner] = useState<Practitioner | null>(null)
  const [auth, setAuth] = useState<AuthUser | null>(null)
  const [reason, setReason] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!practitionerId) return
    fetch(`/api/practitioners/${practitionerId}`)
      .then((r) => r.json())
      .then((d) => setPractitioner(d.practitioner ?? null))
      .catch(() => setError(t.common.error))
  }, [practitionerId, t.common.error])

  // Derive end time (+30 min)
  const endTime = (() => {
    if (!time) return ''
    const [h, m] = time.split(':').map(Number)
    const end = new Date(0, 0, 0, h, m + 30)
    return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`
  })()

  // Format display date
  const displayDate = (() => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })
  })()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!auth) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/vipps/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId,
          date,
          startTime: time,
          endTime,
          patientId: auth.userId,
          patientEmail: auth.email,
          patientName: auth.name,
          patientPhone: phone ? `+47${phone}` : null,
          reason: reason || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Feil ved oppstart av betaling')

      // Redirect to Vipps simulation page
      router.push(data.redirectUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error)
      setLoading(false)
    }
  }

  if (!practitionerId || !date || !time) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-[#6B7280]">Ugyldig bestillingslenke.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push('/practitioners')}>
          {t.common.back}
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t.common.back}
      </button>

      <h1 className="text-2xl font-bold text-[#111827] mb-1">Book time</h1>

      {/* Appointment summary card */}
      {practitioner && (
        <div className="bg-[#F5F7FA] rounded-xl p-4 mb-6 mt-4">
          <p className="font-semibold text-[#111827]">{practitioner.name}</p>
          <p className="text-sm text-[#6B7280] mt-0.5 capitalize">
            {t.specialty[practitioner.specialty]}
          </p>
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm text-[#111827] capitalize">{displayDate}</p>
              <p className="text-sm text-[#6B7280]">kl. {time}–{endTime}</p>
            </div>
            {practitioner.consultation_fee_nok && (
              <p className="text-lg font-bold text-[#1A6BCC]">
                {(practitioner.consultation_fee_nok / 100).toFixed(0)} {t.common.nok}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 1 — Login with BankID */}
      {!auth ? (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-[#1A6BCC] text-white text-xs flex items-center justify-center font-bold">1</span>
            <p className="font-medium text-[#111827]">Bekreft identitet</p>
          </div>
          <p className="text-sm text-[#6B7280] mb-4 ml-8">{t.booking.loginRequired}</p>
          <div className="ml-8">
            <BankIDButton
              onSuccess={(userId, email, name) => setAuth({ userId, email, name })}
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-green-800">Innlogget med BankID</p>
            <p className="text-xs text-green-600">{auth.email}</p>
          </div>
        </div>
      )}

      {/* Step 2 — Booking details form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold ${auth ? 'bg-[#1A6BCC]' : 'bg-gray-300'}`}>2</span>
            <p className={`font-medium ${auth ? 'text-[#111827]' : 'text-gray-400'}`}>Bestillingsdetaljer</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">{t.booking.phone}</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-[#6B7280] text-sm font-medium select-none">
                +47
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="900 00 000"
                disabled={!auth}
                className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A6BCC] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">
              {t.booking.reason}
              <span className="text-[#9CA3AF] font-normal ml-1">(valgfritt)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t.booking.reasonPlaceholder}
              rows={3}
              disabled={!auth}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A6BCC] focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm mt-3">{error}</p>
        )}

        {/* Vipps pay button */}
        <Button
          type="submit"
          variant="vipps"
          size="lg"
          loading={loading}
          disabled={!auth}
          className="w-full mt-5"
        >
          <svg className="w-5 h-5" viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm6.5 9.5c-.9 0-1.5.6-2.1 1.5L16 19l-4.4-6c-.6-.9-1.2-1.5-2.1-1.5-.9 0-1.5.6-1.5 1.5 0 .4.1.7.4 1.1l5.5 7.5c.6.8 1.2 1.1 2.1 1.1s1.5-.3 2.1-1.1l5.5-7.5c.2-.4.4-.7.4-1.1 0-.9-.6-1.5-1.5-1.5z"/>
          </svg>
          {t.booking.confirmCta}
        </Button>

        <p className="text-xs text-[#9CA3AF] text-center mt-3">
          Du vil bli videresendt til Vipps for betaling
        </p>
      </form>
    </div>
  )
}

export default function BookingNewPage() {
  return (
    <Suspense fallback={
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-[#6B7280]">Laster...</p>
      </div>
    }>
      <BookingForm />
    </Suspense>
  )
}
