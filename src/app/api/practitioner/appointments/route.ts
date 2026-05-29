import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getPractitionerFromSession } from '@/lib/practitioner-auth'

export async function GET(req: NextRequest) {
  const practitioner = await getPractitionerFromSession()
  if (!practitioner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const date   = searchParams.get('date')
  const status = searchParams.get('status')

  const supabase = createServiceClient()
  let query = (supabase as any)
    .from('appointments')
    .select('id, patient_name, appointment_date, start_time, end_time, status, payment_status, amount_nok')
    .eq('practitioner_id', practitioner.id)
    .neq('status', 'cancelled')
    .order('appointment_date', { ascending: true })
    .order('start_time', { ascending: true })

  if (date)   query = query.eq('appointment_date', date)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ appointments: data ?? [] })
}
