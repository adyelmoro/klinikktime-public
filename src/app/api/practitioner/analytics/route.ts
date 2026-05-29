import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getPractitionerFromSession } from '@/lib/practitioner-auth'

export async function GET() {
  const practitioner = await getPractitionerFromSession()
  if (!practitioner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const fromDate = thirtyDaysAgo.toISOString().split('T')[0]

  const thisMonthStart = new Date()
  thisMonthStart.setDate(1)
  const monthStart = thisMonthStart.toISOString().split('T')[0]

  const [recentRes, monthRes] = await Promise.all([
    (supabase as any)
      .from('appointments')
      .select('appointment_date, status, payment_status, amount_nok')
      .eq('practitioner_id', practitioner.id)
      .gte('appointment_date', fromDate)
      .neq('status', 'cancelled'),
    (supabase as any)
      .from('appointments')
      .select('amount_nok, payment_status')
      .eq('practitioner_id', practitioner.id)
      .gte('appointment_date', monthStart)
      .neq('status', 'cancelled'),
  ])

  const recent: any[] = recentRes.data ?? []
  const month:  any[] = monthRes.data  ?? []

  const totalThisMonth   = month.length
  const revenueThisMonth = month
    .filter((a: any) => a.payment_status === 'paid')
    .reduce((s: number, a: any) => s + (a.amount_nok ?? 0), 0) / 100

  // Bookings per day
  const dayMap: Record<string, number> = {}
  recent.forEach((a: any) => {
    dayMap[a.appointment_date] = (dayMap[a.appointment_date] ?? 0) + 1
  })
  const bookingsPerDay = Object.entries(dayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date: new Date(date + 'T12:00:00').toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' }),
      count,
    }))

  const avgPerDay = bookingsPerDay.length > 0
    ? parseFloat((bookingsPerDay.reduce((s, d) => s + d.count, 0) / bookingsPerDay.length).toFixed(1))
    : 0

  // Status breakdown
  const statusMap: Record<string, number> = {}
  recent.forEach((a: any) => {
    statusMap[a.status] = (statusMap[a.status] ?? 0) + 1
  })
  const statusBreakdown = Object.entries(statusMap).map(([name, value]) => ({ name, value }))

  return NextResponse.json({
    totalThisMonth,
    revenueThisMonth,
    avgPerDay,
    bookingsPerDay,
    statusBreakdown,
  })
}
