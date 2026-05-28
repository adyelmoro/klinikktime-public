import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { Appointment, Practitioner } from '@/types/database'

interface AppointmentRow extends Appointment {
  practitioners: Pick<Practitioner, 'name' | 'specialty' | 'photo_url'>
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get('patientId')

  if (!patientId) {
    return NextResponse.json({ error: 'Mangler pasient-ID' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: raw, error } = await (supabase as any)
    .from('appointments')
    .select(`
      *,
      practitioners (
        name,
        specialty,
        photo_url
      )
    `)
    .eq('patient_id', patientId)
    .order('appointment_date', { ascending: false })
    .order('start_time', { ascending: false })

  if (error) {
    console.error('Appointments fetch error:', error)
    return NextResponse.json({ error: 'Kunne ikke hente bestillinger' }, { status: 500 })
  }

  return NextResponse.json({ appointments: (raw ?? []) as AppointmentRow[] })
}
