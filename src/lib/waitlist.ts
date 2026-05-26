import type { WaitlistEntry } from '@/types/database'
import { createServiceClient } from '@/lib/supabase/server'

export async function getWaitlistForPractitioner(practitionerId: string): Promise<WaitlistEntry[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('waitlist')
    .select('*')
    .eq('practitioner_id', practitionerId)
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function getNextInQueue(practitionerId: string): Promise<WaitlistEntry | null> {
  const queue = await getWaitlistForPractitioner(practitionerId)
  return queue.find((e) => !e.notified_at) ?? null
}

export async function markNotified(waitlistId: string): Promise<void> {
  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('waitlist') as any)
    .update({ notified_at: new Date().toISOString() })
    .eq('id', waitlistId)
}
