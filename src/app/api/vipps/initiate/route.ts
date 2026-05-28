import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateOrderId, buildVippsRedirectUrl } from '@/lib/vipps-mock'
import type { Practitioner } from '@/types/database'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      practitionerId,
      date,
      startTime,
      endTime,
      patientId,
      patientEmail,
      patientName,
      patientPhone,
      reason,
    } = body

    // Validate required fields
    if (!practitionerId || !date || !startTime || !endTime || !patientId || !patientEmail || !patientName) {
      return NextResponse.json({ error: 'Mangler påkrevde felt' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Fetch practitioner to get fee and org
    const { data: practitionerRaw, error: pErr } = await (supabase as any)
      .from('practitioners')
      .select('id, organisation_id, consultation_fee_nok, is_active')
      .eq('id', practitionerId)
      .single()

    if (pErr || !practitionerRaw) {
      return NextResponse.json({ error: 'Behandler ikke funnet' }, { status: 404 })
    }

    const practitioner = practitionerRaw as Pick<Practitioner, 'id' | 'organisation_id' | 'consultation_fee_nok' | 'is_active'>

    if (!practitioner.is_active) {
      return NextResponse.json({ error: 'Behandler er ikke tilgjengelig' }, { status: 400 })
    }

    // Check slot is still available (guard against double-booking)
    const { data: existing } = await (supabase as any)
      .from('appointments')
      .select('id')
      .eq('practitioner_id', practitionerId)
      .eq('appointment_date', date)
      .eq('start_time', startTime)
      .in('status', ['pending', 'confirmed'])
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Denne timen er ikke lenger tilgjengelig' }, { status: 409 })
    }

    // Generate Vipps order ID
    const orderId = generateOrderId()

    // Create appointment in pending state
    const { data: appointmentRaw, error: aErr } = await (supabase as any)
      .from('appointments')
      .insert({
        organisation_id: practitioner.organisation_id,
        practitioner_id: practitionerId,
        patient_id: patientId,
        patient_name: patientName,
        patient_email: patientEmail,
        patient_phone: patientPhone ?? null,
        appointment_date: date,
        start_time: startTime,
        end_time: endTime,
        status: 'pending',
        reason: reason ?? null,
        vipps_order_id: orderId,
        payment_status: 'pending',
        amount_nok: practitioner.consultation_fee_nok,
      })
      .select('id')
      .single()

    if (aErr || !appointmentRaw) {
      console.error('Appointment insert error:', aErr)
      return NextResponse.json({ error: 'Kunne ikke opprette bestilling' }, { status: 500 })
    }

    const appointment = appointmentRaw as { id: string }

    // Build redirect URL to Vipps simulation page
    const redirectUrl = buildVippsRedirectUrl(orderId) + `&appointmentId=${appointment.id}`

    return NextResponse.json({ orderId, redirectUrl, appointmentId: appointment.id })
  } catch (err) {
    console.error('Vipps initiate error:', err)
    return NextResponse.json({ error: 'Intern serverfeil' }, { status: 500 })
  }
}
