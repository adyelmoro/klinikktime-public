import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()

  const { data, error } = await (supabase as any)
    .from('availability_templates')
    .select('*, practitioners(id, name, specialty)')
    .order('practitioner_id')
    .order('day_of_week')
    .order('start_time')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ templates: data ?? [] })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { practitioner_id, day_of_week, start_time, end_time } = body

  if (!practitioner_id || day_of_week === undefined || !start_time || !end_time) {
    return NextResponse.json({ error: 'Mangler felt' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data, error } = await (supabase as any)
    .from('availability_templates')
    .insert({ practitioner_id, day_of_week, start_time, end_time, is_active: true })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ template: data })
}
