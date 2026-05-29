# Klinikktime — Norwegian Private Healthcare Booking Platform

> A production-ready appointment booking system for private clinics in Norway. Patients browse practitioners, book with a simulated Vipps payment flow and BankID identity verification, and manage appointments with QR check-in. Clinic staff get a real-time admin panel. Practitioners get their own secure portal.

**Live demo:** [klinikktime.vercel.app](https://klinikktime.vercel.app)

---

## Demo Access

| Role | URL | Credentials |
|------|-----|-------------|
| Patient | [/practitioners](https://klinikktime.vercel.app/practitioners) | Click "BankID" → any SSN (e.g. `12345678901`) |
| Admin | [/admin](https://klinikktime.vercel.app/admin) | Password: `demo1234` |
| Practitioner | [/min-klinikk](https://klinikktime.vercel.app/min-klinikk) | Create via Admin → Behandlere first |

---

## Features

### Patient-facing
- **Browse practitioners** — Filter by specialty (physio, psychology, sports medicine, nutritionist, private GP)
- **Real-time availability calendar** — Live slot availability fetched from Supabase, timezone-aware
- **BankID simulation** — Full OIDC-style flow: SSN input → countdown → verified session. Same SSN always maps to the same patient record across browser sessions (admin SDK ensures confirmed auth user)
- **Vipps payment flow** — Complete redirect → processing → confirmation cycle with mock webhook callback. Architecture is production-ready — swap real credentials when org nr obtained
- **Booking confirmation** — QR code + iCal (.ics) download, booking reference
- **Patient dashboard** (`/min-side`) — Upcoming/past appointments, QR modal with 8-char check-in code, cancel with 24h refund window detection, iCal download per appointment

### Admin panel (`/admin`) — desktop
- **Real-time schedule** — Today's appointments with live Supabase Realtime updates
- **QR check-in bar** — Type or scan the 8-char code → patient marked "Ankommet" instantly
- **Status management** — Mark arrived / completed / no-show per appointment
- **All appointments** — Full history with date, status, and free-text search filters
- **Analytics dashboard** — Bookings per day (line chart), specialty breakdown (pie), per-practitioner utilisation (bar) via Recharts
- **Availability editor** — Drag-to-reorder templates with `@dnd-kit`, active/inactive toggle, add/delete
- **Practitioner accounts** — Create and manage per-practitioner Supabase Auth accounts

### Practitioner portal (`/min-klinikk`) — desktop
- **Separate auth** — Email + password via Supabase Auth, completely independent from admin cookie auth
- **Filtered views** — Every page shows only this practitioner's own data, enforced server-side
- **Full parity with admin** — Schedule, appointments, analytics, availability editor
- **Privacy by design** — Patient contact details (email/phone) never exposed in practitioner views

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16, TypeScript strict, App Router |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth — patient anonymous/confirmed sessions + per-practitioner email/password + admin httpOnly cookie |
| Realtime | Supabase Realtime — `postgres_changes` subscription for live schedule updates |
| Payments | Vipps Checkout simulation (production-ready architecture) |
| Identity | BankID UX simulation (full OIDC flow demonstration) |
| Email | Resend — booking confirmations, iCal attachments, cancellation notices |
| QR codes | `qrcode` npm package |
| Calendar | `ical-generator` npm package |
| Drag-drop | `@dnd-kit/core` — availability template editor |
| Charts | Recharts — line, pie, bar |
| Deployment | Vercel |

---

## Architecture

```
src/
├── app/
│   ├── (public)/           # Patient-facing routes
│   │   ├── page.tsx        # Homepage — hero + practitioner grid
│   │   ├── practitioners/  # Browse + practitioner profiles
│   │   ├── booking/        # New booking, Vipps redirect, confirmation
│   │   └── min-side/       # Patient dashboard
│   ├── (admin)/admin/      # Admin panel (cookie auth)
│   │   ├── page.tsx        # Today's real-time schedule
│   │   ├── appointments/   # Full appointment history
│   │   ├── analytics/      # Recharts dashboard
│   │   ├── availability/   # Drag-drop template editor
│   │   └── practitioners/  # Account management
│   ├── (practitioner)/     # Practitioner portal (Supabase Auth)
│   │   └── min-klinikk/    # Same 4 views, own data only
│   └── api/
│       ├── admin/          # Admin-only routes (cookie-gated)
│       ├── practitioner/   # Practitioner routes (session-gated, ownership-checked)
│       ├── appointments/   # Patient appointment CRUD
│       ├── vipps/          # Initiate + callback (mock)
│       └── auth/           # BankID demo route (admin SDK)
├── components/
│   ├── admin/              # AdminLogin, AdminShell
│   ├── practitioner/       # PractitionerLogin, PractitionerShell
│   ├── booking/            # AvailabilityCalendar, SlotPicker, BankIDModal
│   └── ui/                 # Button, Badge, Skeleton
├── lib/
│   ├── supabase/           # Browser, server, service role clients
│   ├── availability.ts     # Slot generation engine
│   ├── vipps-mock.ts       # Vipps flow simulation
│   ├── practitioner-auth.ts # Session → practitioner context helper
│   ├── resend.ts           # Email + iCal sending
│   ├── qr.ts               # QR data URL generation
│   └── ical.ts             # iCal file generation
└── i18n/                   # Norwegian/English translation context
```

### Key architectural decisions

**Auth — three separate systems:**
1. **Patients** — Supabase Auth anonymous + confirmed sessions. BankID demo uses admin SDK to create/confirm a deterministic user per SSN so the same patient always sees their own appointments, even across incognito sessions.
2. **Admin** — httpOnly cookie (`klinikktime_admin`) set server-side on correct password. No Supabase session involved.
3. **Practitioners** — Supabase Auth email/password per practitioner. Admin creates accounts; practitioners log in at `/min-klinikk`. Every API route validates session and ownership via `getPractitionerFromSession()`.

**Vipps flow (production-ready mock):**
```
booking/new → POST /api/vipps/initiate → redirect to /vipps-redirect
→ simulate processing (3s) → POST /api/vipps/callback (internal)
→ appointment created + email sent → redirect to /booking/confirmation/[id]
```
Swap `VIPPS_CLIENT_ID/SECRET/MSN` for real credentials when org nr obtained. Architecture unchanged.

**Realtime:**
```typescript
supabase.channel('admin-today')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, handler)
  .subscribe()
```
Admin and practitioner portals both subscribe to live appointment updates. UPDATE events patch state in-place; INSERT/DELETE trigger a refetch.

**Availability calculation:**
Slots generated server-side from `availability_templates` rows. Each template defines a practitioner's working window for a day of the week. Slots are filtered against existing appointments to produce available/unavailable states. Timezone-safe: all date parsing uses local date parts to avoid UTC shifting for Norwegian users (UTC+2).

---

## Database Schema

```sql
practitioners       -- id, name, specialty, bio, photo_url, consultation_fee_nok, user_id (→ auth.users)
availability_templates -- practitioner_id, day_of_week, start_time, end_time, is_active
appointments        -- patient_id, practitioner_id, organisation_id, appointment_date,
                   --   start_time, end_time, status, payment_status, amount_nok,
                   --   patient_name, patient_email, qr_token, vipps_reference
organisations       -- id, name (single-tenant v1; schema prepared for multi-tenant v2)
```

---

## Running Locally

```bash
git clone https://github.com/adyelmoro/klinikktime.git
cd klinikktime
npm install
cp .env.example .env.local
# Fill in .env.local (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Required DB migration

```sql
ALTER TABLE practitioners
  ADD COLUMN IF NOT EXISTS user_id UUID
  REFERENCES auth.users(id) ON DELETE SET NULL;
```

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Admin panel
ADMIN_PASSWORD=demo1234

# Resend (optional — confirmations disabled if unset)
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@klinikktime.no

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Vipps (mock values for v1 — swap for real creds when org nr obtained)
VIPPS_CLIENT_ID=mock
VIPPS_CLIENT_SECRET=mock
VIPPS_MERCHANT_SERIAL_NUMBER=mock
```

---

## Norwegian Market Context

This project demonstrates integrations relevant to Norwegian digital health:

- **Vipps** — Norway's dominant mobile payment solution (used by 4.3M Norwegians). Architecture follows the [Vipps Checkout API](https://developer.vipps.no) redirect flow. Production-ready — requires merchant org nr to activate.
- **BankID** — Norway's national digital identity standard. Demo shows full OIDC-style UX (the real BankID OpenID Connect integration requires a commercial agreement with a BankID broker, but the architecture is identical).
- **Norwegian UX conventions** — Bokmål default, English toggle, `nb-NO` date/currency formatting throughout.

**Target use case:** Private clinic chains like Volvat, Aleris, DrDropin — replacing phone/email booking with a self-service digital flow.

---

## v2 Roadmap

- Real Vipps integration (pending org nr registration on Altinn)
- Multi-tenant architecture (multiple clinics on one platform)
- Flexible appointment durations (currently fixed 30-min slots)
- React Native companion app (QR camera check-in, push reminders, biometric lock)
- Practitioner-to-patient messaging
- Waitlist automation

---

## Author

**Ayyad Anwar** — Full-Stack Developer, Skien, Norway  
[github.com/adyelmoro](https://github.com/adyelmoro) · [iamayyad@gmail.com](mailto:iamayyad@gmail.com)

*Built as portfolio project #3 — Norwegian private healthcare booking. Architecture designed for real production deployment.*
