import { createClient } from '@/lib/supabase/server'

export interface PractitionerContext {
  id: string
  name: string
  specialty: string
  user_id: string
}

export async function getPractitionerFromSession(): Promise<PractitionerContext | null> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return null

  const { data } = await (supabase as any)
    .from('practitioners')
    .select('id, name, specialty, user_id')
    .eq('user_id', session.user.id)
    .single()

  return data ?? null
}
