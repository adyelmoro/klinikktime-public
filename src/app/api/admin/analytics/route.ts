import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()
  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  // 30 days ago
  const past30 = new Date(now)
  past30.setDate(past30.getDate() - 29)
  const past30Str = `${past30.getFullYear()}-${String(past30.getMonth() + 1).padStart(2, '0')}-${String(past30.getDate()).padStart(2, '0')}`

  const [
    { data: allAppointments },
    { data: todayAppointments },
    { data: practitioners },
  ] = await Promise.all([
    (supabase as any)
      .from('appointments')
      .select('appointment_date, status, payment_status, amount_nok, practitioners(name, specialty)')
      .gte('appointment_date', past30Str)
      .neq('status', 'cancelled'),
    (supabase as any)
      .from('appointments')
      .select('status, practitioners(name)')
      .eq('appointment_date', today)
      .neq('status', 'cancelled'),
    (supabase as any)
      .from('practitioners')
      .select('id, name, specialty')
      .eq('is_active', true),
  ])

  const appts = (allAppointments ?? []) as any[]
  const todayAppts = (todayAppointments ?? []) as any[]

  // Monthly stats (appointments in current month)
  const monthAppts = appts.filter((a: any) => a.appointment_date >= monthStart)
  const totalThisMonth = monthAppts.length
  const revenueThisMonth = monthAppts
    .filter((a: any) => a.payment_status === 'paid')
    .reduce((sum: number, a: any) => sum + (a.amount_nok ?? 0), 0)

  // Bookings per day (last 30 days)
  const dayMap: Record<string, number> = {}
  for (let i = 0; i < 30; i++) {
    const d = new Date(past30)
    d.setDate(d.getDate() + i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    dayMap[key] = 0
  }
  appts.forEach((a: any) => {
    if (dayMap[a.appointment_date] !== undefined) dayMap[a.appointment_date]++
  })
  const bookingsPerDay = Object.entries(dayMap).map(([date, count]) => ({
    date: date.slice(5), // MM-DD for display
    count,
  }))

  // Specialty breakdown (this month)
  const specialtyMap: Record<string, number> = {}
  monthAppts.forEach((a: any) => {
    const s = a.practitioners?.specialty ?? 'unknown'
    specialtyMap[s] = (specialtyMap[s] ?? 0) + 1
  })
  const specialtyBreakdown = Object.entries(specialtyMap).map(([name, value]) => ({ name, value }))

  // Practitioner bookings (last 30 days)
  const practMap: Record<string, number> = {}
  appts.forEach((a: any) => {
    const n = a.practitioners?.name ?? 'Unknown'
    practMap[n] = (practMap[n] ?? 0) + 1
  })
  const practitionerBookings = Object.entries(practMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name: name.split(' ')[0], count })) // first name only for chart

  // Today summary
  const todaySummary = {
    total: todayAppts.length,
    confirmed: todayAppts.filter((a: any) => a.status === 'confirmed').length,
    arrived: todayAppts.filter((a: any) => a.status === 'arrived').length,
    completed: todayAppts.filter((a: any) => a.status === 'completed').length,
  }

  return NextResponse.json({
    totalThisMonth,
    revenueThisMonth: revenueThisMonth / 100, // convert øre → NOK
    bookingsPerDay,
    specialtyBreakdown,
    practitionerBookings,
    todaySummary,
    activePractitioners: (practitioners ?? []).length,
  })
}
