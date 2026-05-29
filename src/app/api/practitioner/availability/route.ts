import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getPractitionerFromSession } from '@/lib/practitioner-auth'

export async function GET() {
  const practitioner = await getPractitionerFromSession()
  if (!practitioner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const { data, error } = await (supabase as any)
    .from('availability_templates')
    .select('*')
    .eq('practitioner_id', practitioner.id)
    .order('day_of_week')
    .order('start_time')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ templates: data ?? [] })
}

export async function POST(req: NextRequest) {
  const practitioner = await getPractitionerFromSession()
  if (!practitioner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const supabase = createServiceClient()

  const { data, error } = await (supabase as any)
    .from('availability_templates')
    .insert({
      practitioner_id: practitioner.id,
      day_of_week: body.day_of_week,
      start_time: body.start_time,
      end_time: body.end_time,
      is_active: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ template: data })
}
