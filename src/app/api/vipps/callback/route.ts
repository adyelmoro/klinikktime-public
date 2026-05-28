import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateIcal } from '@/lib/ical'
import { sendBookingConfirmation } from '@/lib/resend'
import type { Appointment, Practitioner } from '@/types/database'

interface AppointmentRow extends Appointment {
  practitioners: {
    name: string
    specialty: string
    organisations: { name: string; address: string | null }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, event, appointmentId } = body as {
      orderId: string
      event: 'payment.completed' | 'payment.refunded' | 'payment.failed'
      appointmentId?: string
    }

    if (!orderId || !event) {
      return NextResponse.json({ error: 'Mangler orderId eller event' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Find the appointment by appointmentId or orderId
    const selectQuery = `
      *,
      practitioners (
        name,
        specialty,
        organisations ( name, address )
      )
    `
    const { data: raw, error: findErr } = appointmentId
      ? await (supabase as any).from('appointments').select(selectQuery).eq('id', appointmentId).single()
      : await (supabase as any).from('appointments').select(selectQuery).eq('vipps_order_id', orderId).single()

    if (findErr || !raw) {
      return NextResponse.json({ error: 'Bestilling ikke funnet' }, { status: 404 })
    }

    const appointment = raw as AppointmentRow

    if (event === 'payment.completed') {
      // Mark as confirmed + paid
      const { error: updateErr } = await (supabase as any)
        .from('appointments')
        .update({ status: 'confirmed', payment_status: 'paid' })
        .eq('id', appointment.id)

      if (updateErr) {
        console.error('Appointment update error:', updateErr)
        return NextResponse.json({ error: 'Oppdatering feilet' }, { status: 500 })
      }

      // Send confirmation email (fire-and-forget — don't block response)
      if (process.env.RESEND_API_KEY) {
        const practitioner = appointment.practitioners
        const org = practitioner?.organisations

        const displayDate = new Date(appointment.appointment_date).toLocaleDateString('nb-NO', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        })
        const timeRange = `${appointment.start_time}–${appointment.end_time}`

        try {
          const icalBuffer = await generateIcal({
            appointmentId: appointment.id,
            practitionerName: practitioner?.name ?? '',
            specialty: practitioner?.specialty ?? '',
            date: appointment.appointment_date,
            startTime: appointment.start_time,
            endTime: appointment.end_time,
            address: org?.address ?? 'Klinikktime',
          })

          await sendBookingConfirmation({
            to: appointment.patient_email,
            patientName: appointment.patient_name,
            practitionerName: practitioner?.name ?? '',
            specialty: practitioner?.specialty ?? '',
            date: displayDate,
            time: timeRange,
            address: org?.address ?? '',
            appointmentId: appointment.id,
            icalBuffer,
          })
        } catch (emailErr) {
          // Email failure should not fail the payment confirmation
          console.error('Email send error:', emailErr)
        }
      }

      return NextResponse.json({ success: true, status: 'confirmed' })
    }

    if (event === 'payment.failed') {
      await (supabase as any)
        .from('appointments')
        .update({ status: 'cancelled', payment_status: 'failed' })
        .eq('id', appointment.id)

      return NextResponse.json({ success: true, status: 'failed' })
    }

    if (event === 'payment.refunded') {
      await (supabase as any)
        .from('appointments')
        .update({ payment_status: 'refunded' })
        .eq('id', appointment.id)

      return NextResponse.json({ success: true, status: 'refunded' })
    }

    return NextResponse.json({ error: 'Ukjent event' }, { status: 400 })
  } catch (err) {
    console.error('Vipps callback error:', err)
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 })
  }
}
