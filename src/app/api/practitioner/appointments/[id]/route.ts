import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getPractitionerFromSession } from '@/lib/practitioner-auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const practitioner = await getPractitionerFromSession()
  if (!practitioner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const supabase = createServiceClient()

  // Verify this appointment belongs to this practitioner
  const { data: appt } = await (supabase as any)
    .from('appointments')
    .select('id')
    .eq('id', id)
    .eq('practitioner_id', practitioner.id)
    .single()

  if (!appt) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })

  const { error } = await (supabase as any)
    .from('appointments')
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
