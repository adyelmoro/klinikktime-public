import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateQRDataUrl } from '@/lib/qr'
import type { Appointment, Practitioner } from '@/types/database'

interface AppointmentRow extends Appointment {
  practitioners: Pick<Practitioner, 'name' | 'specialty' | 'photo_url'>
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'Mangler bestillings-ID' }, { status: 400 })
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
    .eq('id', id)
    .single()

  if (error || !raw) {
    return NextResponse.json({ error: 'Bestilling ikke funnet' }, { status: 404 })
  }

  const appointment = raw as AppointmentRow

  // Generate QR data URL for display
  const qrDataUrl = await generateQRDataUrl(appointment.qr_token).catch(() => '')

  return NextResponse.json({
    appointment: {
      ...appointment,
      qrDataUrl,
    },
  })
}
