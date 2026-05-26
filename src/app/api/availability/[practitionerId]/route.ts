import { NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/availability'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ practitionerId: string }> }
) {
  const { practitionerId } = await params
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date. Use YYYY-MM-DD.' }, { status: 400 })
  }

  const slots = await getAvailableSlots(practitionerId, date)
  return NextResponse.json({ slots })
}
