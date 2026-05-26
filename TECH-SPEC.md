# Klinikktime — Technical Specification
**Version:** v1 (Single-clinic MVP)
**Architecture:** Production-ready single-tenant, schema prepared for multi-tenant v2

---

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | strict mode |
| Styling | Tailwind CSS | v4 |
| Database | Supabase PostgreSQL | latest |
| Auth | Supabase Auth | latest |
| Realtime | Supabase Realtime | latest |
| Storage | Supabase Storage | latest (practitioner photos) |
| Email | Resend | latest |
| QR codes | `qrcode` | latest |
| Calendar | `ical-generator` | latest |
| Drag-drop | `@dnd-kit/core` + `@dnd-kit/sortable` | latest |
| Charts | `recharts` | latest |
| Deployment | Vercel | — |

---

## Architecture Overview

```
Browser
  └── Next.js 16 App Router (Vercel Edge / Node)
        ├── /app/(public)/          Patient-facing pages
        ├── /app/(auth)/            Auth-gated patient pages
        ├── /app/admin/             Admin panel (role-gated)
        ├── /app/checkout/          Vipps flow pages
        └── /app/api/               API routes
              ├── practitioners/
              ├── availability/
              ├── bookings/
              ├── vipps/
              ├── admin/
              └── email/

Supabase
  ├── PostgreSQL (all data)
  ├── Auth (patient sessions + admin roles)
  ├── Realtime (admin schedule live updates)
  └── Storage (practitioner photos)

Resend
  └── Transactional emails (confirmation, cancellation, waitlist)
```

---

## Supabase Schema

### organisations
Prepared for multi-tenant v2. v1 has exactly one row.

```sql
CREATE TABLE organisations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  slug         text UNIQUE NOT NULL,
  address      text,
  phone        text,
  email        text,
  logo_url     text,
  created_at   timestamptz DEFAULT now()
);
```

### profiles
Extends `auth.users`. Created via trigger on user signup.

```sql
CREATE TABLE profiles (
  id                 uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name          text,
  phone              text,
  date_of_birth      date,
  preferred_language text DEFAULT 'no',
  created_at         timestamptz DEFAULT now()
);
```

### admin_users
Grants admin/staff access to the admin panel.

```sql
CREATE TABLE admin_users (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organisation_id uuid REFERENCES organisations(id),
  role            text DEFAULT 'staff', -- 'admin' | 'staff'
  created_at      timestamptz DEFAULT now()
);
```

### practitioners

```sql
CREATE TYPE specialty_type AS ENUM (
  'physio', 'psychology', 'sports_medicine', 'nutritionist', 'private_gp'
);

CREATE TABLE practitioners (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id           uuid REFERENCES organisations(id) NOT NULL,
  name                      text NOT NULL,
  specialty                 specialty_type NOT NULL,
  bio_no                    text,
  bio_en                    text,
  photo_url                 text,
  languages                 text[] DEFAULT ARRAY['no'],
  slot_duration_minutes     int DEFAULT 30,
  consultation_fee_nok      int,           -- in øre (80000 = 800 NOK)
  is_active                 bool DEFAULT true,
  created_at                timestamptz DEFAULT now()
);
```

### availability_templates
Weekly recurring schedule per practitioner. Generates available slots at query time.

```sql
CREATE TABLE availability_templates (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id  uuid REFERENCES practitioners(id) ON DELETE CASCADE,
  day_of_week      int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Mon, 6=Sun
  start_time       time NOT NULL,
  end_time         time NOT NULL,
  is_active        bool DEFAULT true
);
```

### availability_exceptions
Days off, vacations, public holidays.

```sql
CREATE TABLE availability_exceptions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id  uuid REFERENCES practitioners(id) ON DELETE CASCADE,
  exception_date   date NOT NULL,
  reason           text
);
```

### appointments
Core booking record. `organisation_id` on every row enables multi-tenant v2 via RLS.

```sql
CREATE TYPE appointment_status AS ENUM (
  'pending', 'confirmed', 'cancelled', 'completed', 'no_show', 'arrived'
);

CREATE TYPE payment_status AS ENUM (
  'pending', 'paid', 'refunded', 'failed'
);

CREATE TABLE appointments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id  uuid REFERENCES organisations(id) NOT NULL,
  practitioner_id  uuid REFERENCES practitioners(id) NOT NULL,
  patient_id       uuid REFERENCES auth.users(id) NOT NULL,
  patient_name     text NOT NULL,    -- denormalized for admin display
  patient_email    text NOT NULL,
  patient_phone    text,
  appointment_date date NOT NULL,
  start_time       time NOT NULL,
  end_time         time NOT NULL,
  status           appointment_status DEFAULT 'pending',
  reason           text,
  vipps_order_id   text,
  payment_status   payment_status DEFAULT 'pending',
  amount_nok       int,              -- in øre
  admin_notes      text,
  qr_token         text UNIQUE DEFAULT gen_random_uuid()::text,
  created_at       timestamptz DEFAULT now()
);
```

### waitlist

```sql
CREATE TABLE waitlist (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id       uuid REFERENCES practitioners(id) ON DELETE CASCADE,
  patient_id            uuid REFERENCES auth.users(id) NOT NULL,
  patient_name          text NOT NULL,
  patient_email         text NOT NULL,
  patient_phone         text,
  preferred_date        date,
  preferred_time_of_day text DEFAULT 'any', -- 'morning' | 'afternoon' | 'any'
  notified_at           timestamptz,
  created_at            timestamptz DEFAULT now()
);
```

---

## Row Level Security (RLS)

All tables have RLS enabled. Key policies:

| Table | Patient | Admin/Staff |
|-------|---------|-------------|
| `organisations` | SELECT (public) | SELECT + UPDATE |
| `practitioners` | SELECT (active only) | ALL |
| `availability_templates` | SELECT | ALL |
| `availability_exceptions` | SELECT | ALL |
| `appointments` | SELECT/INSERT/UPDATE own rows | ALL in their org |
| `waitlist` | SELECT/INSERT/DELETE own rows | SELECT all in org |
| `profiles` | SELECT/UPDATE own row | SELECT all |
| `admin_users` | — | SELECT own row |

Multi-tenant v2 note: all admin policies will add `organisation_id = auth.jwt()->>'org_id'` clause. The column is already on every table — upgrading is additive, not destructive.

---

## API Routes

### Public

```
GET  /api/practitioners                            List active practitioners
GET  /api/practitioners/[id]                       Practitioner profile + specialty
GET  /api/availability/[practitionerId]?date=...   Available slots for a given date
```

### Auth-required (patient)

```
POST /api/bookings                                 Create booking → initiates Vipps flow
GET  /api/bookings/[id]                            Booking details (own only)
POST /api/bookings/[id]/cancel                     Cancel booking + trigger refund if eligible
GET  /api/bookings/[id]/ical                       .ics file download
GET  /api/bookings/[id]/qr                         QR code PNG (own only)
POST /api/waitlist                                 Join waitlist for a practitioner
DELETE /api/waitlist/[id]                          Leave waitlist
```

### Vipps flow (internal + webhook)

```
POST /api/vipps/initiate                           Create mock order, return redirect URL
POST /api/vipps/callback                           Mock webhook: payment.completed / payment.refunded
```

### Admin-only

```
GET  /api/admin/schedule?date=...                  Today's appointments (Realtime-ready)
POST /api/admin/appointments/[id]/status           Update status (confirmed/completed/no_show/cancelled)
POST /api/admin/checkin                            QR token → mark arrived (Realtime broadcast)
GET  /api/admin/analytics                          KPI stats + bookings trend data
GET  /api/admin/waitlist/[practitionerId]          Waitlist entries
POST /api/admin/waitlist/[id]/notify               Send Resend notification to next in queue
GET  /api/admin/availability/[practitionerId]      Weekly template
PUT  /api/admin/availability/[practitionerId]      Update weekly template
POST /api/admin/availability/[practitionerId]/exceptions  Add exception date
```

---

## Availability Calculation

Slot generation algorithm (runs at query time, not stored):

```
Input:  practitionerId, date
Output: array of { startTime, endTime, available: boolean }

1. Fetch availability_template rows for practitioner + day_of_week
2. Check availability_exceptions — if date is excepted, return []
3. Generate all 30-min slots between template start_time and end_time
4. Fetch existing appointments for practitioner + date with status != 'cancelled'
5. Mark slots as unavailable where they overlap existing appointments
6. Return full slot array with availability flags
```

This logic lives in `src/lib/availability.ts` — proprietary, excluded from public repo.

---

## Vipps Flow Simulation

The mock implements the exact same interface as real Vipps Checkout API. Swapping in real credentials later requires only environment variable changes.

### Happy path

```
Patient: POST /api/vipps/initiate
  → Creates appointment (status: 'pending', payment_status: 'pending')
  → Generates vipps_order_id (UUID)
  → Returns { redirectUrl: '/checkout/vipps-redirect?orderId=...' }

Patient: navigates to /checkout/vipps-redirect
  → Styled Vipps page (Vipps blue #FF5B24, white text, key icon)
  → "Åpne Vipps på telefonen din"
  → Reference number displayed
  → 3-second auto-confirm countdown
  → Page fires: POST /api/vipps/callback { orderId, event: 'payment.completed' }

Callback handler:
  → Updates appointment: status='confirmed', payment_status='paid'
  → Sends Resend confirmation email (with iCal attachment)
  → Returns { redirectUrl: '/booking/confirmation/[appointmentId]' }

Patient: arrives at /booking/confirmation/[id]
  → Appointment summary, QR code, iCal download button
```

### Cancellation + refund path

```
Patient: POST /api/bookings/[id]/cancel
  → Check: appointment_date - now() > 24 hours?
    YES → fire POST /api/vipps/callback { event: 'payment.refunded' }
           → payment_status='refunded', status='cancelled'
           → Resend cancellation email ("Refusjon initiert — 3–5 virkedager")
    NO  → status='cancelled', payment_status stays 'paid'
           → Resend cancellation email ("Avbestilt for sent — ikke refusjon")
```

---

## BankID Simulation

Goal: Show understanding of the BankID OIDC flow UX, not bypass security.

### Component flow

```
<BankIDButton />
  → onClick: open <BankIDModal />

<BankIDModal />
  Step 1: "Logg inn med BankID"
    - Input: Fødselsnummer (11 digits) — any valid format passes
    - Button: "Fortsett"
  
  Step 2: "Åpne BankID-appen på din telefon"
    - Rotating reference code (e.g. "KT-7421")
    - 30-second countdown progress bar
    - After 3 seconds: auto-advance to Step 3

  Step 3: "Du er nå innlogget"
    - Green checkmark animation
    - Supabase magic link / email session fires in background
    - Modal closes after 1.5s

Footer disclaimer (small, not hidden):
  "Demo-versjon av BankID-innlogging. Ekte integrasjon krever BankID OIDC-sertifisering."
```

### Styling
- Button: BankID red (#E3001B), white text, key icon (SVG), "Logg inn med BankID"
- Modal header: BankID wordmark font weight
- Reference code: monospace, bold, large — looks like a real BankID reference

---

## Resend Email Templates

All emails sent server-side via Resend API. Templates are React Email components.

| Template | Trigger | Includes |
|----------|---------|----------|
| Booking confirmation | `payment.completed` callback | Practitioner, date/time, address, QR code link, iCal attachment, cancel link |
| Booking cancellation (refund) | Cancel within 24h window | Appointment details, "Refusjon initiert — 3–5 virkedager" |
| Booking cancellation (no refund) | Cancel within 24h of appointment | Appointment details, "Avbestilt for sent — ikke refusjon i henhold til vilkårene" |
| Waitlist notification | Admin clicks "Notify" | "En ledig time er tilgjengelig hos [practitioner]" + booking link |

---

## iCal Export

Generated via `ical-generator` on `/api/bookings/[id]/ical`.

```typescript
const cal = ical({ name: 'Klinikktime' })
cal.createEvent({
  start: appointmentDateTime,
  end: appointmentEndDateTime,
  summary: `Time hos ${practitioner.name} — ${specialty}`,
  description: `Klinikktime-booking. Bestillingsnummer: ${appointment.id}`,
  location: organisation.address,
  url: `${BASE_URL}/booking/confirmation/${appointment.id}`,
})
```

Attached to confirmation email as `klinikktime-time.ics`. Also available as download button on confirmation page.

---

## QR Check-in

Each appointment has a unique `qr_token` (UUID string, generated at insert time).

**Patient side:** QR code displayed on `/min-side` appointment card and `/booking/confirmation/[id]`. Generated client-side from `qr_token` using `qrcode` package.

**Admin side:** Admin clicks "Sjekk inn" button → `POST /api/admin/checkin { qrToken }` → appointment status updated to `'arrived'` → Supabase Realtime broadcasts update → all connected admin clients update live.

In production, a tablet camera could scan the QR code — same endpoint. The `qr_token` is the only thing encoded in the QR.

---

## Supabase Realtime (Admin Schedule)

Admin schedule page subscribes to `appointments` table changes filtered by `organisation_id` and `appointment_date = today`.

```typescript
supabase
  .channel('admin-schedule')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'appointments',
    filter: `appointment_date=eq.${today}`,
  }, (payload) => {
    // update local state
  })
  .subscribe()
```

This means when a patient cancels, a booking comes in via Vipps callback, or admin changes a status — every admin session sees it immediately. No polling.

---

## Design System

**Visual direction:** Clinical white + trust blue — modern, accessible, clean. Old and young patients must be able to use this.

**Colour palette:**

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#1A6BCC` (trust blue) | CTAs, active states, links |
| `primary-dark` | `#1355A3` | Hover states |
| `surface` | `#FFFFFF` | Cards, panels |
| `background` | `#F5F7FA` | Page background |
| `text-primary` | `#111827` | Body text |
| `text-muted` | `#6B7280` | Secondary text |
| `success` | `#059669` | Confirmed, paid |
| `warning` | `#D97706` | Pending |
| `danger` | `#DC2626` | Cancelled, error |
| `vipps` | `#FF5B24` | Vipps buttons only |
| `bankid` | `#E3001B` | BankID button only |

**Typography:** System font stack — `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`. Large base font size (16px minimum) — elderly patients must be comfortable.

**Spacing:** 4px base unit. Generous padding on interactive elements (min 44px touch targets — WCAG AA).

---

## File Structure

```
klinikktime/
├── CLAUDE.md
├── PLAN.md
├── TECH-SPEC.md
├── PROJECT-TRACKER.md
├── PITCH.md
├── .env.local                  (gitignored)
├── .env.example
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── src/
    ├── app/
    │   ├── layout.tsx           Root layout (header, footer, i18n provider)
    │   ├── page.tsx             Homepage
    │   ├── (auth)/              Auth-gated patient routes
    │   │   └── min-side/        Patient dashboard
    │   ├── practitioners/
    │   │   └── [id]/            Practitioner profile
    │   ├── booking/
    │   │   └── confirmation/[id]/
    │   ├── checkout/
    │   │   └── vipps-redirect/  Vipps mock page
    │   ├── admin/               Admin panel (role-gated)
    │   │   ├── layout.tsx
    │   │   ├── page.tsx         Today's schedule
    │   │   ├── analytics/
    │   │   ├── availability/[practitionerId]/
    │   │   └── waitlist/
    │   └── api/
    │       ├── practitioners/
    │       ├── availability/[practitionerId]/
    │       ├── bookings/
    │       ├── vipps/
    │       └── admin/
    ├── components/
    │   ├── ui/                  Shared primitives (Button, Badge, Card, Modal)
    │   ├── auth/                BankIDButton, BankIDModal
    │   ├── booking/             SlotPicker, AvailabilityCalendar, BookingForm
    │   ├── admin/               ScheduleBoard, AvailabilityEditor, AnalyticsDashboard
    │   └── layout/              Header, Footer, LanguageToggle
    ├── lib/
    │   ├── supabase.ts          Client + server Supabase instances
    │   ├── availability.ts      Slot generation algorithm (PROPRIETARY — stub in public repo)
    │   ├── waitlist.ts          Waitlist logic (PROPRIETARY — stub in public repo)
    │   ├── vipps-mock.ts        Vipps mock implementation (PROPRIETARY — stub in public repo)
    │   ├── resend.ts            Email sending + template helpers
    │   ├── ical.ts              iCal file generation
    │   └── qr.ts               QR code generation
    ├── types/
    │   └── database.ts          Supabase generated types + domain types
    └── i18n/
        ├── no.ts                Norwegian strings
        └── en.ts                English strings
```

---

## Multi-Tenant Migration Path (v2)

The v1 schema already has `organisation_id` on `practitioners`, `appointments`, `waitlist`, and `admin_users`. Upgrading to multi-tenant requires:

1. **RLS policy update** — add `organisation_id = (auth.jwt()->>'org_id')::uuid` to admin policies
2. **JWT claims** — store `org_id` in Supabase Auth custom claims on admin login
3. **Clinic onboarding flow** — registration, Stripe subscription, Vipps merchant setup
4. **Subdomain routing** — `[clinic].klinikktime.no` → filter by org slug
5. **No schema changes required** — all columns exist in v1

Estimated v2 upgrade: 3–4 weeks additional work on top of v1.

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@klinikktime.no

# App
NEXT_PUBLIC_BASE_URL=https://klinikktime.vercel.app

# Vipps (mock values for v1)
VIPPS_CLIENT_ID=mock
VIPPS_CLIENT_SECRET=mock
VIPPS_MERCHANT_SERIAL_NUMBER=mock
# Real values set here when org nr obtained + merchant registered
```
