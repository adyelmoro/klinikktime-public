import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')          // YYYY-MM-DD or null = all
  const practitionerId = searchParams.get('practitioner')
  const status = searchParams.get('status')

  const supabase = createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('appointments')
    .select('*, practitioners(id, name, specialty)')
    .order('appointment_date', { ascending: true })
    .order('start_time', { ascending: true })

  if (date) query = query.eq('appointment_date', date)
  if (practitionerId) query = query.eq('practitioner_id', practitionerId)
  if (status) query = query.eq('status', status)

  const { data, error } = await query

  if (error) {
    console.error('admin/appointments GET:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ appointments: data ?? [] })
}
