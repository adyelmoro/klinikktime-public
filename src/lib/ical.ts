import ical from 'ical-generator'

interface ICalEventData {
  appointmentId: string
  practitionerName: string
  specialty: string
  startDateTime: Date
  endDateTime: Date
  address: string
}

export function generateICalBuffer(data: ICalEventData): Buffer {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  const cal = ical({ name: 'Klinikktime' })
  cal.createEvent({
    start: data.startDateTime,
    end: data.endDateTime,
    summary: `Time hos ${data.practitionerName} — ${data.specialty}`,
    description: `Klinikktime-booking. Bestillingsnummer: ${data.appointmentId}`,
    location: data.address,
    url: `${baseUrl}/booking/confirmation/${data.appointmentId}`,
  })

  return Buffer.from(cal.toString(), 'utf-8')
}

// Convenience wrapper — accepts date string (YYYY-MM-DD) + time strings (HH:MM)
export async function generateIcal(data: {
  appointmentId: string
  practitionerName: string
  specialty: string
  date: string        // YYYY-MM-DD
  startTime: string   // HH:MM
  endTime: string     // HH:MM
  address: string
}): Promise<Buffer> {
  const [startH, startM] = data.startTime.split(':').map(Number)
  const [endH, endM] = data.endTime.split(':').map(Number)
  const [year, month, day] = data.date.split('-').map(Number)

  const startDateTime = new Date(year, month - 1, day, startH, startM)
  const endDateTime = new Date(year, month - 1, day, endH, endM)

  return generateICalBuffer({
    appointmentId: data.appointmentId,
    practitionerName: data.practitionerName,
    specialty: data.specialty,
    startDateTime,
    endDateTime,
    address: data.address,
  })
}
