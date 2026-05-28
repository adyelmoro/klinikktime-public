'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLanguage } from '@/i18n/context'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { Appointment, Practitioner } from '@/types/database'

interface ConfirmationData extends Appointment {
  practitioners: Pick<Practitioner, 'name' | 'specialty' | 'photo_url'>
  qrDataUrl: string
}

export default function ConfirmationPage() {
  const { t } = useLanguage()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [data, setData] = useState<ConfirmationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    fetch(`/api/appointments/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setData(d.appointment)
      })
      .catch((e) => setError(e.message ?? t.common.error))
      .finally(() => setLoading(false))
  }, [id, t.common.error])

  const displayDate = data
    ? new Date(data.appointment_date).toLocaleDateString('nb-NO', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-[#1A6BCC] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#6B7280]">{t.common.loading}</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-[#6B7280] mb-4">{error || t.common.error}</p>
        <Button variant="primary" onClick={() => router.push('/')}>Gå til forsiden</Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">

      {/* Success header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-9 h-9 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#111827]">{t.confirmation.title}</h1>
        <p className="text-[#6B7280] mt-1">{t.confirmation.subtitle}</p>
      </div>

      {/* Appointment details card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-5">
        <div className="bg-[#F5F7FA] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-[#111827]">{data.practitioners?.name}</p>
            <Badge variant="specialty" type={data.practitioners?.specialty as import('@/types/database').SpecialtyType} className="mt-1">
              {data.practitioners?.specialty ?? ''}
            </Badge>
          </div>
          <Badge variant="status" type={data.status as import('@/types/database').AppointmentStatus}>
            {data.status}
          </Badge>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-[#6B7280] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-[#111827] capitalize">{displayDate}</p>
              <p className="text-xs text-[#6B7280]">kl. {data.start_time}–{data.end_time}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-[#6B7280] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-[#111827]">Betaling bekreftet</p>
              {data.amount_nok && (
                <p className="text-xs text-[#6B7280]">{data.amount_nok} kr via Vipps</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-[#6B7280] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-[#111827]">Bestillingsnummer</p>
              <p className="text-xs text-[#6B7280] font-mono">{data.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* QR code */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 text-center">
        <p className="font-medium text-[#111827] mb-1">{t.confirmation.qrTitle}</p>
        <p className="text-sm text-[#6B7280] mb-4">{t.confirmation.qrInstruction}</p>
        {data.qrDataUrl ? (
          <img
            src={data.qrDataUrl}
            alt="QR innsjekk"
            className="w-40 h-40 mx-auto rounded-lg"
          />
        ) : (
          <div className="w-40 h-40 mx-auto bg-[#F5F7FA] rounded-lg flex items-center justify-center">
            <p className="text-xs text-[#9CA3AF]">QR ikke tilgjengelig</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <a
          href={`/api/appointments/${id}/ical`}
          className="flex items-center justify-center gap-2 w-full border border-[#1A6BCC] text-[#1A6BCC] rounded-xl py-3 text-sm font-medium hover:bg-[#E8F1FB] transition-colors min-h-[44px]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {t.confirmation.addToCalendar}
        </a>

        <Button
          variant="ghost"
          size="md"
          className="w-full"
          onClick={() => router.push('/dashboard')}
        >
          {t.confirmation.myAppointments}
        </Button>
      </div>
    </div>
  )
}
