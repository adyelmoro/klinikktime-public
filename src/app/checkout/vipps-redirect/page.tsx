'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

type Stage = 'loading' | 'confirming' | 'done' | 'error'

function VippsRedirectContent() {
  const params = useSearchParams()
  const router = useRouter()

  const orderId = params.get('orderId') ?? ''
  const appointmentId = params.get('appointmentId') ?? ''

  const [stage, setStage] = useState<Stage>('loading')
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (!orderId || !appointmentId) {
      setStage('error')
      return
    }

    // Simulate Vipps "loading" then auto-confirm
    const t1 = setTimeout(() => setStage('confirming'), 1200)
    return () => clearTimeout(t1)
  }, [orderId, appointmentId])

  useEffect(() => {
    if (stage !== 'confirming') return

    const t = setTimeout(async () => {
      try {
        const res = await fetch('/api/vipps/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            event: 'payment.completed',
            appointmentId,
          }),
        })
        if (!res.ok) throw new Error('Callback failed')
        setStage('done')
      } catch {
        setStage('error')
      }
    }, 2000)

    return () => clearTimeout(t)
  }, [stage, orderId, appointmentId])

  // Countdown redirect after done
  useEffect(() => {
    if (stage !== 'done') return
    if (countdown <= 0) {
      router.push(`/booking/confirmation/${appointmentId}`)
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [stage, countdown, appointmentId, router])

  return (
    <div className="min-h-screen bg-[#FF5B24] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Vipps header */}
        <div className="bg-[#FF5B24] px-6 py-5 text-center">
          <div className="inline-flex items-center gap-2">
            {/* Vipps V logo */}
            <svg className="w-8 h-8 text-white" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm6.5 9.5c-.9 0-1.5.6-2.1 1.5L16 19l-4.4-6c-.6-.9-1.2-1.5-2.1-1.5-.9 0-1.5.6-1.5 1.5 0 .4.1.7.4 1.1l5.5 7.5c.6.8 1.2 1.1 2.1 1.1s1.5-.3 2.1-1.1l5.5-7.5c.2-.4.4-.7.4-1.1 0-.9-.6-1.5-1.5-1.5z"/>
            </svg>
            <span className="text-white font-bold text-2xl tracking-tight">Vipps</span>
          </div>
        </div>

        <div className="px-6 py-8 text-center">
          {stage === 'loading' && (
            <div className="space-y-4">
              <div className="w-14 h-14 mx-auto border-4 border-[#FF5B24] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#111827] font-medium">Kobler til Vipps...</p>
              <p className="text-sm text-[#6B7280]">Åpne Vipps-appen på telefonen din</p>
            </div>
          )}

          {stage === 'confirming' && (
            <div className="space-y-4">
              <div className="w-14 h-14 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-[#FF5B24] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[#111827] font-medium">Bekrefter betaling...</p>
              <div className="flex justify-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#FF5B24] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {stage === 'done' && (
            <div className="space-y-4">
              <div className="w-14 h-14 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[#111827] font-semibold text-lg">Betaling bekreftet!</p>
              <p className="text-sm text-[#6B7280]">Videresender om {countdown} sekund{countdown !== 1 ? 'er' : ''}...</p>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          {stage === 'error' && (
            <div className="space-y-4">
              <div className="w-14 h-14 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-[#111827] font-medium">Noe gikk galt</p>
              <p className="text-sm text-[#6B7280]">Betalingen ble ikke fullført. Ingen beløp er trukket.</p>
              <button
                onClick={() => router.back()}
                className="text-sm text-[#1A6BCC] hover:underline"
              >
                Prøv igjen
              </button>
            </div>
          )}

          <p className="text-xs text-[#9CA3AF] mt-6 leading-relaxed">
            Demo-versjon av Vipps-betaling. Ekte integrasjon krever Vipps merchant-konto og org.nr.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VippsRedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FF5B24] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VippsRedirectContent />
    </Suspense>
  )
}
