# Klinikktime — Project Tracker
**Version:** v1 (Single-clinic MVP)
**Last updated:** 2026-05-26
**Current phase:** Pre-Phase 0 — planning complete, ready to build

---

## Phase 0 — Project Setup

- [ ] Create Next.js 16 project (`npx create-next-app@latest klinikktime --typescript --tailwind --app --src-dir`)
- [ ] Configure Tailwind CSS v4 (update config, install v4 packages)
- [ ] Set up `tsconfig.json` strict mode + path aliases (`@/` → `./src/`)
- [ ] Create Supabase project (name: `klinikktime`)
- [ ] Run schema migrations (all tables from TECH-SPEC.md in order)
- [ ] Configure RLS policies (all tables)
- [ ] Create profiles trigger (auto-create profile on auth.users insert)
- [ ] Seed demo data:
  - [ ] 1 organisation row ("Klinikktime Demo Klinikk")
  - [ ] 4 practitioners (one per specialty: physio, psychology, sports_medicine, nutritionist)
  - [ ] Availability templates for each practitioner (Mon–Fri 09:00–16:00)
  - [ ] 1 admin user (test credentials for recruiter demo)
  - [ ] 2–3 existing appointments (for analytics to show non-zero data)
- [ ] Configure `.env.local` (all variables from TECH-SPEC.md)
- [ ] Create `.env.example` (all keys, no values)
- [ ] Initialize private GitHub repo `klinikktime-private`
- [ ] Initial commit + push
- [ ] Connect Vercel project (auto-deploy from `main` branch)
- [ ] Verify Vercel build succeeds (blank Next.js app)

---

## Phase 1 — Foundation + Browsing

### i18n + Layout
- [ ] i18n setup — `src/i18n/no.ts` + `src/i18n/en.ts`, language context + cookie persistence
- [ ] Global layout — `app/layout.tsx` with header + footer
- [ ] Header component — logo (Klinikktime wordmark), nav links, language toggle (NO / EN)
- [ ] Footer component — clinic name, address, phone, privacy note
- [ ] Design tokens in Tailwind config (primary blue, surface, background, text colours)

### Homepage
- [ ] Hero section — headline, subheading, "Finn en time" CTA button
- [ ] Practitioners grid section (list of all active practitioners)
- [ ] Loading skeleton for practitioners grid
- [ ] Empty state if no practitioners active

### Practitioner Components
- [ ] `PractitionerCard` component — photo, name, specialty badge, languages, "Book time" CTA
- [ ] Specialty label map (NO + EN): physio → Fysioterapi, psychology → Psykologi, etc.
- [ ] Practitioner profile page `/practitioners/[id]`
  - [ ] Photo, full name, specialty, languages, bio (NO/EN toggle)
  - [ ] "Book time" section with availability calendar
  - [ ] Loading state
  - [ ] Not found state (practitioner inactive or missing)

### Availability Calendar
- [ ] Month picker component (prev/next month, highlight days with availability)
- [ ] Day selection → slot picker view
- [ ] `SlotPicker` component — shows 30-min slots, available (clickable) vs unavailable (greyed)
- [ ] `GET /api/availability/[practitionerId]?date=YYYY-MM-DD` route
- [ ] Availability calculation logic (`src/lib/availability.ts`)
  - [ ] Generate slots from template
  - [ ] Filter exceptions
  - [ ] Subtract booked appointments
- [ ] Slot loading skeleton
- [ ] Empty state ("Ingen ledige tider denne dagen")

---

## Phase 2 — Auth + Booking Flow

### BankID Simulation
- [ ] `BankIDButton` component — BankID red, key icon, "Logg inn med BankID"
- [ ] `BankIDModal` component — 3-step flow
  - [ ] Step 1: Fødselsnummer input (11 digits, any passes)
  - [ ] Step 2: "Åpne BankID-appen" — reference code + 30s countdown, auto-advance at 3s
  - [ ] Step 3: "Du er nå innlogget" — green checkmark + 1.5s delay → close
- [ ] Disclaimer text in modal footer
- [ ] Supabase Auth session created in background (magic link or email/password)
- [ ] Redirect to booking page after successful auth

### Booking Form
- [ ] Auth guard — redirect to BankID modal if not logged in when clicking "Book time"
- [ ] Booking form page `/booking/new?practitionerId=...&date=...&time=...`
  - [ ] Pre-filled: practitioner name, date, time, cost
  - [ ] Input: reason for visit (textarea, optional)
  - [ ] Input: contact phone (pre-filled from profile if available)
  - [ ] Confirm button: "Betal med Vipps"
- [ ] Form validation (required fields, phone format)
- [ ] Loading state on submit

### Vipps Flow Simulation
- [ ] `POST /api/vipps/initiate` route
  - [ ] Validate slot is still available (race condition check)
  - [ ] Create appointment record (status: pending, payment_status: pending)
  - [ ] Generate `vipps_order_id`
  - [ ] Return `{ redirectUrl: '/checkout/vipps-redirect?orderId=...' }`
- [ ] `/checkout/vipps-redirect` page
  - [ ] Vipps styling (orange #FF5B24, white, Vipps logo placeholder)
  - [ ] "Åpne Vipps på telefonen din" with order ID
  - [ ] Reference number display
  - [ ] 3-second countdown → auto-fires internal callback
  - [ ] "Betalingen er bekreftet" → redirect to confirmation page
- [ ] `POST /api/vipps/callback` route
  - [ ] Handle `payment.completed` — update appointment to confirmed/paid
  - [ ] Handle `payment.refunded` — update appointment to refunded
  - [ ] Trigger Resend email on completed

### Cancellation + Refund
- [ ] 24h deadline check logic
- [ ] `POST /api/bookings/[id]/cancel` route
  - [ ] If > 24h before appointment: fire mock refund callback, send refund email
  - [ ] If ≤ 24h: cancel only, send no-refund email

### Emails
- [ ] Resend API client setup (`src/lib/resend.ts`)
- [ ] React Email: booking confirmation template (NO + EN)
- [ ] React Email: cancellation + refund template
- [ ] React Email: cancellation no-refund template
- [ ] iCal generation (`src/lib/ical.ts`)
- [ ] Attach `.ics` to booking confirmation email

### Confirmation Page
- [ ] `/booking/confirmation/[id]` page
  - [ ] Appointment summary card
  - [ ] QR code display (generated from `qr_token`)
  - [ ] "Legg til i kalender" iCal download button
  - [ ] "Gå til Mine timer" link
- [ ] `GET /api/bookings/[id]/ical` route (returns `.ics` file)
- [ ] QR code generation (`src/lib/qr.ts`)

---

## Phase 3 — Patient Dashboard

### Mine timer
- [ ] `/min-side` page — auth-gated
- [ ] Appointments list — upcoming (sorted by date asc) and past (sorted desc)
- [ ] `AppointmentCard` component
  - [ ] Practitioner, specialty, date/time, status badge
  - [ ] "Vis QR-kode" button (expand QR)
  - [ ] "Avbestill" button (if cancellable — upcoming + not within no-refund window)
  - [ ] Refund eligibility badge ("Gratis avbestilling frem til [datetime]")
- [ ] Loading skeleton for appointments list
- [ ] Empty state ("Du har ingen kommende timer")
- [ ] Cancel appointment flow — confirmation modal with refund/no-refund warning

### Waitlist
- [ ] "Sett meg på venteliste" button on practitioner profile (when no slots available)
- [ ] Waitlist join form — preferred date (optional), preferred time of day
- [ ] `POST /api/waitlist` route
- [ ] Waitlist status card on `/min-side` — "Du er på venteliste hos [practitioner]"
- [ ] Leave waitlist button + `DELETE /api/waitlist/[id]` route

---

## Phase 4 — Admin Panel

### Auth + Layout
- [ ] Admin auth check — Supabase role check in middleware
- [ ] Admin layout — sidebar nav (Schedule, Analytics, Waitlist, Availability, Practitioners)
- [ ] Redirect to `/admin/login` if not authenticated as admin
- [ ] Admin login page (email/password — no BankID sim for admin)

### Today's Schedule (Realtime)
- [ ] `/admin` page — today's schedule (default view)
- [ ] `ScheduleBoard` component — list of today's appointments sorted by time
- [ ] Status colour coding: pending=yellow, confirmed=blue, arrived=green, completed=grey, no-show=red, cancelled=strikethrough
- [ ] Supabase Realtime subscription on `appointments` filtered by today
- [ ] Inline status action buttons:
  - [ ] "Bekreft" (pending → confirmed)
  - [ ] "Ankom" (any → arrived) — also triggered by QR
  - [ ] "Fullført" (arrived → completed)
  - [ ] "Ikke møtt" (confirmed/arrived → no_show)
  - [ ] "Avbestill" (admin-initiated cancellation)
- [ ] `POST /api/admin/appointments/[id]/status` route
- [ ] QR check-in: "Sjekk inn via QR" button → enters QR token → `POST /api/admin/checkin`
- [ ] Realtime broadcast: status change immediately visible to all admin sessions

### Analytics Dashboard
- [ ] `/admin/analytics` page
- [ ] KPI cards (4 cards in responsive grid):
  - [ ] Bookings this week (count)
  - [ ] Cancellation rate this month (%)
  - [ ] Average slot utilisation this week (%)
  - [ ] Most booked practitioner (name + count)
- [ ] Bookings trend chart (last 4 weeks, bar chart, `recharts`)
- [ ] `GET /api/admin/analytics` route

### Availability Editor
- [ ] `/admin/availability/[practitionerId]` page
- [ ] Practitioner selector (dropdown if multiple)
- [ ] Weekly template grid (Mon–Sun columns, time rows)
- [ ] `@dnd-kit/core` drag to add/remove time blocks
- [ ] Add exception date — date picker + reason text + save
- [ ] Exceptions list (upcoming days off, with delete)
- [ ] `GET /PUT /api/admin/availability/[practitionerId]` routes
- [ ] `POST /api/admin/availability/[practitionerId]/exceptions` route

### Waitlist Management
- [ ] `/admin/waitlist` page
- [ ] Waitlist entries per practitioner (grouped)
- [ ] Entry shows: patient name, phone, preferred date/time, days waiting
- [ ] "Varsle" (Notify) button → `POST /api/admin/waitlist/[id]/notify` → Resend email
- [ ] Notified entries get timestamp + greyed out

### Practitioner Management
- [ ] `/admin/practitioners` page — list all practitioners
- [ ] Edit practitioner modal: name, bio (NO + EN), specialty, photo upload
- [ ] Photo upload to Supabase Storage
- [ ] Toggle practitioner active/inactive

---

## Phase 5 — Polish + Deploy

### Responsiveness
- [ ] Audit all pages at 375px (mobile S), 768px (tablet), 1280px (desktop)
- [ ] Admin panel — responsive sidebar (hamburger menu on mobile)
- [ ] Availability editor — touch-friendly drag on mobile
- [ ] Slot picker — full-width on mobile, comfortable tap targets (min 44px)

### Quality
- [ ] Error boundaries on: homepage, practitioner profile, booking flow, admin schedule, admin analytics
- [ ] 404 page (`not-found.tsx`)
- [ ] Error page (`error.tsx`)
- [ ] All loading states implemented (no blank flashes)
- [ ] All empty states implemented

### SEO + Metadata
- [ ] `metadata` export on homepage (title, description, OG image)
- [ ] `metadata` on practitioner profile pages (dynamic)
- [ ] `robots.txt` (noindex admin routes)
- [ ] `sitemap.xml`

### Deployment
- [ ] Vercel environment variables set (all from `.env.local`)
- [ ] Test full booking flow on production URL
- [ ] Test admin panel on production URL
- [ ] Test Resend emails from production
- [ ] No console errors in production

### Repository + Docs
- [ ] README.md — project description, screenshots, tech stack, live URL, demo credentials, "Try it" instructions
- [ ] `.env.example` committed
- [ ] Public repo `klinikktime` set up:
  - [ ] Copy all non-proprietary files
  - [ ] Replace `src/lib/availability.ts`, `waitlist.ts`, `vipps-mock.ts` with stubs + interfaces
  - [ ] Add code snippets to README (slot algorithm interface, Vipps flow, Realtime subscription)
  - [ ] Confirm no secrets anywhere in public repo
- [ ] Pin `klinikktime` repo on GitHub profile

### CV
- [ ] Update `cv-build-may.js` — all 4 locations (project name, URL, stack, description)
- [ ] Rebuild: `node C:/tmp/cv-build-may.js`
- [ ] Update `A:\ClaudeAI\MyAI-Projects\CLAUDE.md` project status table
- [ ] Update `A:\CV\2026\CLAUDE.md`
- [ ] Update `A:\CV\2026\MAY2026\CLAUDE.md` — SESSION SUMMARY

---

## v2 Backlog (Documented — Not Built in v1)

### Multi-tenant
- [ ] Clinic onboarding flow (register clinic, create admin account)
- [ ] Update RLS policies for `organisation_id` JWT claim scoping
- [ ] Subdomain routing (`[slug].klinikktime.no`)
- [ ] Stripe subscription billing for clinics

### Payments
- [ ] Real Vipps Checkout API integration (requires org nr)
- [ ] Register enkeltpersonforetak on Altinn → get org nr
- [ ] Register Vipps merchant at developer.vipps.no
- [ ] Swap mock flow for real Vipps redirect URL + webhook

### Auth
- [ ] Real BankID OIDC integration (requires certification)

### Booking Features
- [ ] Flexible appointment durations per practitioner + service type
- [ ] Recurring appointment booking ("every Tuesday for 8 weeks")
- [ ] Pre-consultation intake forms (emailed before appointment, admin sees responses)
- [ ] 24h email reminders (Vercel cron + Resend)

### Discovery
- [ ] Smart slot recommendations — "Neste ledige time i nærheten" with Nominatim geocoding
- [ ] Search / filter practitioners by specialty, language, location

### Mobile
- [ ] Klinikktime Mobile — separate React Native + Expo project (Portfolio Project #4)
