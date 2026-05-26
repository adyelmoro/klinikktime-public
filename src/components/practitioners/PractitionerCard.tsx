'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/i18n/context'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Practitioner, SpecialtyType } from '@/types/database'

interface PractitionerCardProps {
  practitioner: Practitioner
}

const specialtyIcons: Record<SpecialtyType, string> = {
  physio:          '🦴',
  psychology:      '🧠',
  sports_medicine: '⚡',
  nutritionist:    '🥗',
  private_gp:      '🩺',
}

export function PractitionerCard({ practitioner }: PractitionerCardProps) {
  const { t, language } = useLanguage()

  const bio = language === 'en' ? practitioner.bio_en : practitioner.bio_no
  const specialty = t.specialty[practitioner.specialty]
  const fee = practitioner.consultation_fee_nok
    ? `${(practitioner.consultation_fee_nok / 100).toFixed(0)} ${t.common.nok}`
    : null

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB] hover:shadow-md transition-shadow flex flex-col gap-4">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-[#E8F1FB] flex items-center justify-center flex-shrink-0 text-2xl overflow-hidden">
          {practitioner.photo_url ? (
            <Image
              src={practitioner.photo_url}
              alt={practitioner.name}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          ) : (
            <span>{specialtyIcons[practitioner.specialty]}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#111827] text-lg leading-tight">{practitioner.name}</h3>
          <Badge variant="specialty" type={practitioner.specialty} className="mt-1">
            {specialty}
          </Badge>
          {bio && (
            <p className="mt-2 text-sm text-[#6B7280] line-clamp-2">{bio}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#F5F7FA]">
        <div className="text-sm text-[#6B7280]">
          {fee && <span className="font-medium text-[#111827]">{fee}</span>}
          {fee && <span className="ml-1">{t.common.perConsultation}</span>}
        </div>
        <Link href={`/practitioners/${practitioner.id}`}>
          <Button size="sm">{t.practitioner.bookCta}</Button>
        </Link>
      </div>
    </div>
  )
}
