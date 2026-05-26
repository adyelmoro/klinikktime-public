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
