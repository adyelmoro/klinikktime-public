import { createClient } from '@/lib/supabase/server'
import { PractitionerLogin } from '@/components/practitioner/PractitionerLogin'
import { PractitionerShell } from '@/components/practitioner/PractitionerShell'

export const metadata = { title: 'Min Klinikk | Klinikktime' }

export default async function PractitionerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return <PractitionerLogin />
  }

  const { data: practitioner } = await (supabase as any)
    .from('practitioners')
    .select('id, name, specialty')
    .eq('user_id', session.user.id)
    .single()

  if (!practitioner) {
    // Logged-in user but not a practitioner — sign them out and show login
    return <PractitionerLogin />
  }

  return (
    <PractitionerShell
      practitionerName={practitioner.name}
      practitionerSpecialty={practitioner.specialty}
    >
      {children}
    </PractitionerShell>
  )
}
