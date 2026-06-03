import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'

const SPECIALTY_NO: Record<string, string> = {
  physio: 'Fysioterapeut', psychology: 'Psykolog',
  sports_medicine: 'Idrettsmedisin', nutritionist: 'Ernæringsfysiolog',
  private_gp: 'Fastlege',
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const supabase = createServiceClient()

  const { data: p } = await (supabase as any)
    .from('practitioners')
    .select('name, specialty, bio_no')
    .eq('id', id)
    .single()

  if (!p) {
    return { title: 'Behandler ikke funnet' }
  }

  const specialty = SPECIALTY_NO[p.specialty] ?? p.specialty
  const title = `${p.name} — ${specialty} | Klinikktime`
  const description = p.bio_no
    ? p.bio_no.slice(0, 155)
    : `Book time hos ${p.name}, ${specialty.toLowerCase()} i Norge. Betal med Vipps og bekreft med BankID.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
    },
  }
}

export default function PractitionerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
