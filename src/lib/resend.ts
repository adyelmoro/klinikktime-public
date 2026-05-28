import { Resend } from 'resend'

// Lazy-initialised — avoids build-time crash when RESEND_API_KEY is not set
function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  return new Resend(key)
}

const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@klinikktime.no'

interface BookingEmailData {
  to: string
  patientName: string
  practitionerName: string
  specialty: string
  date: string      // formatted: "mandag 2. juni 2025"
  time: string      // formatted: "10:00–10:30"
  address: string
  appointmentId: string
  icalBuffer: Buffer
}

export async function sendBookingConfirmation(data: BookingEmailData) {
  return getResend().emails.send({
    from: `Klinikktime <${FROM}>`,
    to: data.to,
    subject: `Timebekreftelse: ${data.practitionerName} — ${data.date}`,
    html: buildConfirmationHtml(data),
    attachments: [
      {
        filename: 'klinikktime-time.ics',
        content: data.icalBuffer,
        contentType: 'text/calendar',
      },
    ],
  })
}

export async function sendCancellationEmail(data: {
  to: string
  patientName: string
  practitionerName: string
  date: string
  time: string
  refund: boolean
}) {
  const subject = data.refund
    ? `Avbestilling bekreftet — refusjon initiert`
    : `Avbestilling bekreftet — ingen refusjon`

  return getResend().emails.send({
    from: `Klinikktime <${FROM}>`,
    to: data.to,
    subject,
    html: buildCancellationHtml(data),
  })
}

export async function sendWaitlistNotification(data: {
  to: string
  patientName: string
  practitionerName: string
  bookingUrl: string
}) {
  return getResend().emails.send({
    from: `Klinikktime <${FROM}>`,
    to: data.to,
    subject: `Ledig time tilgjengelig hos ${data.practitionerName}`,
    html: buildWaitlistHtml(data),
  })
}

function buildConfirmationHtml(data: BookingEmailData): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #1A6BCC; font-size: 24px; margin-bottom: 8px;">Time bekreftet ✓</h1>
      <p style="color: #6B7280; margin-bottom: 24px;">Hei ${data.patientName}, din time er nå bekreftet.</p>
      <div style="background: #F5F7FA; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px;"><strong>${data.practitionerName}</strong> — ${data.specialty}</p>
        <p style="margin: 0 0 8px; color: #111827;">${data.date}, kl. ${data.time}</p>
        <p style="margin: 0; color: #6B7280;">${data.address}</p>
      </div>
      <a href="${baseUrl}/booking/confirmation/${data.appointmentId}"
         style="display: inline-block; background: #1A6BCC; color: white; text-decoration: none;
                padding: 12px 24px; border-radius: 8px; margin-bottom: 16px;">
        Se bestillingsdetaljer
      </a>
      <p style="color: #6B7280; font-size: 14px;">
        iCal-fil er vedlagt. Åpne vedlegget for å legge timen til i kalenderen din.
      </p>
    </div>
  `
}

function buildCancellationHtml(data: {
  patientName: string
  practitionerName: string
  date: string
  time: string
  refund: boolean
}): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #DC2626; font-size: 24px; margin-bottom: 8px;">Time avbestilt</h1>
      <p style="color: #6B7280; margin-bottom: 24px;">Hei ${data.patientName}, din time er avbestilt.</p>
      <div style="background: #F5F7FA; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px;"><strong>${data.practitionerName}</strong></p>
        <p style="margin: 0; color: #111827;">${data.date}, kl. ${data.time}</p>
      </div>
      ${data.refund
        ? `<p style="color: #059669;">Refusjon er initiert og vil komme innen 3–5 virkedager.</p>`
        : `<p style="color: #DC2626;">Avbestillingen ble gjort for sent. Refusjon er ikke mulig i henhold til våre vilkår.</p>`
      }
    </div>
  `
}

function buildWaitlistHtml(data: {
  patientName: string
  practitionerName: string
  bookingUrl: string
}): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #1A6BCC; font-size: 24px; margin-bottom: 8px;">Ledig time tilgjengelig!</h1>
      <p style="color: #6B7280; margin-bottom: 24px;">Hei ${data.patientName},</p>
      <p>En ledig time er nå tilgjengelig hos <strong>${data.practitionerName}</strong>.</p>
      <a href="${data.bookingUrl}"
         style="display: inline-block; background: #1A6BCC; color: white; text-decoration: none;
                padding: 12px 24px; border-radius: 8px; margin-top: 16px;">
        Book time nå
      </a>
      <p style="color: #6B7280; font-size: 14px; margin-top: 16px;">
        Tilbudet gjelder til neste i køen varsles.
      </p>
    </div>
  `
}
