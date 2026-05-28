import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { Appointment } from '@/types/database'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const { patientId } = body

  if (!id || !patientId) {
    return NextResponse.json({ error: 'Mangler påkrevde felt' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Fetch appointment — cast to any to avoid Supabase never inference
  const { data: raw, error: fetchError } = await (supabase as any)
    .from('appointments')
    .select('*')
    .eq('id', id)
    .single()

  const appt = raw as Appointment | null

  if (fetchError || !appt || !raw) {
    return NextResponse.json({ error: 'Bestilling ikke funnet' }, { status: 404 })
  }

  // Verify this patient owns the appointment
  if (appt.patient_id !== patientId) {
    return NextResponse.json({ error: 'Ingen tilgang' }, { status: 403 })
  }

  // Can only cancel confirmed or pending appointments
  if (!['confirmed', 'pending'].includes(appt.status)) {
    return NextResponse.json(
      { error: 'Denne bestillingen kan ikke avbestilles' },
      { status: 400 }
    )
  }

  // Check 24h cancellation window
  const appointmentDateTime = new Date(`${appt.appointment_date}T${appt.start_time}`)
  const now = new Date()
  const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
  const withinCancellationWindow = hoursUntilAppointment < 24

  // Update: cancel the appointment + mock refund
  const { error: updateError } = await (supabase as any)
    .from('appointments')
    .update({
      status: 'cancelled',
      payment_status: appt.payment_status === 'paid' ? 'refunded' : appt.payment_status,
    })
    .eq('id', id)

  if (updateError) {
    console.error('Cancel error:', updateError)
    return NextResponse.json({ error: 'Kunne ikke avbestille' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    withinCancellationWindow,
    refunded: appt.payment_status === 'paid',
  })
}
