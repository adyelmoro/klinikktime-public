import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const { status, admin_notes } = body as { status?: string; admin_notes?: string }

  if (!id) {
    return NextResponse.json({ error: 'Mangler ID' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const update: Record<string, string> = {}
  if (status) update.status = status
  if (admin_notes !== undefined) update.admin_notes = admin_notes

  const { error } = await (supabase as any)
    .from('appointments')
    .update(update)
    .eq('id', id)

  if (error) {
    console.error('admin/appointments PATCH:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
