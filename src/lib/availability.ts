import type { TimeSlot } from '@/types/database'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Generate available time slots for a practitioner on a given date.
 * Algorithm:
 *   1. Fetch availability_templates for practitioner + day_of_week
 *   2. Return [] if date has an availability_exception
 *   3. Generate all 30-min slots between template start_time and end_time
 *   4. Fetch existing appointments (status != 'cancelled') for that day
 *   5. Mark slots unavailable where they overlap booked appointments
 */
export async function getAvailableSlots(
  practitionerId: string,
  date: string  // YYYY-MM-DD
): Promise<TimeSlot[]> {
  const supabase = createServiceClient()

  // Map JS Date.getDay() (0=Sun) to our day_of_week (0=Mon)
  const d = new Date(date)
  const jsDay = d.getDay() // 0=Sun, 1=Mon ... 6=Sat
  const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1 // convert to 0=Mon ... 6=Sun

  // Check for exception
  const { data: exceptions } = await supabase
    .from('availability_exceptions')
    .select('id')
    .eq('practitioner_id', practitionerId)
    .eq('exception_date', date)

  if (exceptions && exceptions.length > 0) return []

  // Fetch templates for this day
  const { data: templatesRaw } = await supabase
    .from('availability_templates')
    .select('start_time, end_time')
    .eq('practitioner_id', practitionerId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true)

  const templates = (templatesRaw ?? []) as { start_time: string; end_time: string }[]
  if (templates.length === 0) return []

  // Fetch booked appointments
  const { data: booked } = await supabase
    .from('appointments')
    .select('start_time, end_time')
    .eq('practitioner_id', practitionerId)
    .eq('appointment_date', date)
    .neq('status', 'cancelled')

  const bookedRanges = ((booked ?? []) as { start_time: string; end_time: string }[])
    .map((a) => ({ start: a.start_time, end: a.end_time }))

  const slots: TimeSlot[] = []
  const SLOT_MINUTES = 30

  for (const template of templates as { start_time: string; end_time: string }[]) {
    const [startH, startM] = template.start_time.split(':').map(Number)
    const [endH, endM] = template.end_time.split(':').map(Number)
    let cursor = startH * 60 + startM

    while (cursor + SLOT_MINUTES <= endH * 60 + endM) {
      const slotStart = minutesToTime(cursor)
      const slotEnd = minutesToTime(cursor + SLOT_MINUTES)

      const isBooked = bookedRanges.some(
        (b) => b.start < slotEnd && b.end > slotStart
      )

      // Don't show past slots for today
      const now = new Date()
      const isToday = date === now.toISOString().split('T')[0]
      const isPast = isToday && cursor <= now.getHours() * 60 + now.getMinutes()

      if (!isPast) {
        slots.push({ startTime: slotStart, endTime: slotEnd, available: !isBooked })
      }

      cursor += SLOT_MINUTES
    }
  }

  return slots
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}
