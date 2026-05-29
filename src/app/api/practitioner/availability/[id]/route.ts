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

  const { data: tmpl } = await (supabase as any)
    .from('availability_templates')
    .select('id')
    .eq('id', id)
    .eq('practitioner_id', practitioner.id)
    .single()

  if (!tmpl) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })

  const { error } = await (supabase as any)
    .from('availability_templates')
    .update({ is_active: body.is_active })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const practitioner = await getPractitionerFromSession()
  if (!practitioner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  const { data: tmpl } = await (supabase as any)
    .from('availability_templates')
    .select('id')
    .eq('id', id)
    .eq('practitioner_id', practitioner.id)
    .single()

  if (!tmpl) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })

  const { error } = await (supabase as any)
    .from('availability_templates')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
