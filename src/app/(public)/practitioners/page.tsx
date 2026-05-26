'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/i18n/context'
import { PractitionerCard } from '@/components/practitioners/PractitionerCard'
import { PractitionerCardSkeleton } from '@/components/ui/Skeleton'
import type { Practitioner } from '@/types/database'

export default function PractitionersPage() {
  const { t } = useLanguage()
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/practitioners')
      .then((r) => r.json())
      .then((d) => setPractitioners(d.practitioners ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-[#111827] mb-2">{t.home.browseTitle}</h1>
      <p className="text-[#6B7280] mb-8">{t.home.browseSubtitle}</p>

      {error && <p className="text-[#6B7280]">{t.common.error}</p>}

      {loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <PractitionerCardSkeleton key={i} />)}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {practitioners.map((p) => (
            <PractitionerCard key={p.id} practitioner={p} />
          ))}
        </div>
      )}
    </div>
  )
}
