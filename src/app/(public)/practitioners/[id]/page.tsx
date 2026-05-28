'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/i18n/context'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { AvailabilityCalendar } from '@/components/booking/AvailabilityCalendar'
import type { Practitioner, SpecialtyType } from '@/types/database'

const specialtyIcons: Record<SpecialtyType, string> = {
  physio:          '/icons/specialty-physio.svg',
  psychology:      '/icons/specialty-psychology.svg',
  sports_medicine: '/icons/specialty-sports-medicine.svg',
  nutritionist:    '/icons/specialty-nutritionist.svg',
  private_gp:      '/icons/specialty-private-gp.svg',
}

export default function PractitionerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { t, language } = useLanguage()
  const router = useRouter()

  const [practitioner, setPractitioner] = useState<Practitioner | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/practitioners/${id}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null }
        return r.json()
      })
      .then((d) => d && setPractitioner(d.practitioner))
      .finally(() => setLoading(false))
  }, [id])

  function handleSlotSelect(date: string, startTime: string) {
    setSelectedDate(date)
    setSelectedSlot(startTime)
  }

  function handleBookNow() {
    if (!selectedDate || !selectedSlot) return
    router.push(
      `/booking/new?practitionerId=${id}&date=${selectedDate}&time=${selectedSlot}`
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (notFound || !practitioner) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <p className="text-[#6B7280] text-lg">Behandler ikke funnet.</p>
        <Link href="/" className="mt-4 inline-block text-[#1A6BCC] hover:underline">
          ← {t.common.back}
        </Link>
      </div>
    )
  }

  const bio = language === 'en' ? practitioner.bio_en : practitioner.bio_no
  const specialty = t.specialty[practitioner.specialty]
  const fee = practitioner.consultation_fee_nok
    ? `${(practitioner.consultation_fee_nok / 100).toFixed(0)} ${t.common.nok}`
    : null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827] mb-6 transition-colors">
        ← {t.common.back}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Practitioner info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB] sticky top-24">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-[#E8F1FB] flex items-center justify-center mb-4 text-4xl overflow-hidden">
              {practitioner.photo_url ? (
                <Image
                  src={practitioner.photo_url}
                  alt={practitioner.name}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : (
                <img
                  src={specialtyIcons[practitioner.specialty]}
                  alt={practitioner.specialty}
                  width={40}
                  height={40}
                />
              )}
            </div>

            <h1 className="text-xl font-bold text-[#111827]">{practitioner.name}</h1>
            <Badge variant="specialty" type={practitioner.specialty} className="mt-2">
              {specialty}
            </Badge>

            {bio && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                  {t.practitioner.bio}
                </p>
                <p className="text-sm text-[#111827] leading-relaxed">{bio}</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-[#F5F7FA] space-y-2">
              {practitioner.languages.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#6B7280]">{t.practitioner.languages}:</span>
                  <span className="text-[#111827] font-medium">
                    {practitioner.languages.map((l) => l.toUpperCase()).join(', ')}
                  </span>
                </div>
              )}
              {fee && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#6B7280]">{t.practitioner.fee}:</span>
                  <span className="text-[#111827] font-medium">{fee}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar + booking */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB]">
            <h2 className="text-lg font-semibold text-[#111827] mb-4">
              {t.booking.selectDate}
            </h2>
            <AvailabilityCalendar
              practitionerId={id}
              onSlotSelect={handleSlotSelect}
            />

            {selectedDate && selectedSlot && (
              <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
                <div className="bg-[#E8F1FB] rounded-xl p-4 mb-4">
                  <p className="text-sm font-medium text-[#111827]">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString(
                      language === 'no' ? 'nb-NO' : 'en-GB',
                      { weekday: 'long', day: 'numeric', month: 'long' }
                    )}
                    {' '}&mdash; kl. {selectedSlot}
                  </p>
                  <p className="text-sm text-[#6B7280] mt-0.5">{practitioner.name}</p>
                </div>
                <Button size="lg" className="w-full" onClick={handleBookNow}>
                  {t.practitioner.bookCta} →
                </Button>
              </div>
            )}
          </div>

          {/* Waitlist teaser (shown always for now) */}
          <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-[#E5E7EB] flex items-center justify-between">
            <p className="text-sm text-[#6B7280]">
              {language === 'no' ? 'Ingen ledige tider som passer?' : 'No suitable slots?'}
            </p>
            <button className="text-sm font-medium text-[#1A6BCC] hover:underline">
              {t.practitioner.joinWaitlist}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
