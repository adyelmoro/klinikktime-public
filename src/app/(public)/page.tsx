'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/i18n/context'
import { PractitionerCard } from '@/components/practitioners/PractitionerCard'
import { PractitionerCardSkeleton } from '@/components/ui/Skeleton'
import { HeroSection } from '@/components/layout/HeroSection'
import type { Practitioner } from '@/types/database'

export default function HomePage() {
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
    <>
      <HeroSection />

      {/* Practitioners grid */}
      <section id="practitioners" className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#111827]">{t.home.browseTitle}</h2>
          <p className="mt-1 text-[#6B7280]">{t.home.browseSubtitle}</p>
        </div>

        {error && (
          <div className="text-center py-12 text-[#6B7280]">{t.common.error}</div>
        )}

        {loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <PractitionerCardSkeleton key={i} />)}
          </div>
        )}

        {!loading && !error && practitioners.length === 0 && (
          <div className="text-center py-12 text-[#6B7280]">
            Ingen aktive behandlere for øyeblikket.
          </div>
        )}

        {!loading && !error && practitioners.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {practitioners.map((p) => (
              <PractitionerCard key={p.id} practitioner={p} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
