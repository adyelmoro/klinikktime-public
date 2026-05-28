import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateIcal } from '@/lib/ical'
import type { Appointment } from '@/types/database'

interface AppointmentRow extends Appointment {
  practitioners: {
    name: string
    specialty: string
    organisations: { address: string | null }
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = createServiceClient()

  const { data: raw, error } = await (supabase as any)
    .from('appointments')
    .select(`
      *,
      practitioners (
        name,
        specialty,
        organisations ( address )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !raw) {
    return NextResponse.json({ error: 'Bestilling ikke funnet' }, { status: 404 })
  }

  const appointment = raw as AppointmentRow
  const practitioner = appointment.practitioners

  const icalBuffer = await generateIcal({
    appointmentId: appointment.id,
    practitionerName: practitioner?.name ?? '',
    specialty: practitioner?.specialty ?? '',
    date: appointment.appointment_date,
    startTime: appointment.start_time,
    endTime: appointment.end_time,
    address: practitioner?.organisations?.address ?? 'Klinikktime',
  })

  return new NextResponse(new Uint8Array(icalBuffer), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="klinikktime-${id.slice(0, 8)}.ics"`,
    },
  })
}
