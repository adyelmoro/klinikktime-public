# Klinikktime — Project Plan
**Version:** v1 (Single-clinic MVP)
**Target:** Live on Vercel within 5–7 weeks of Phase 0 start
**Commercial intent:** Yes — architecture designed for real production deployment

---

## Product Vision

Klinikktime is a modern Norwegian private healthcare booking platform. Private clinics (physio, psychology, sports medicine, nutritionist) onboard practitioners, patients book using BankID identity + Vipps payment, and clinic staff manage their daily schedule via a real-time admin panel with QR check-in.

v1 is a single-clinic demo that proves the complete system end-to-end. v2 evolves it into a multi-tenant SaaS platform with real Vipps and real BankID.

---

## MVP Scope (v1 — Build Now)

### What's in v1

**Patient-facing:**
- Browse practitioners by specialty
- View practitioner profile (bio, specialties, languages, availability)
- Real-time availability calendar + slot picker (fixed 30-min slots)
- BankID UX simulation (styled flow, not real OIDC) → Supabase Auth
- Booking form (reason for visit, contact details)
- Vipps payment flow simulation (full redirect page + internal webhook callback)
- Booking confirmation page with iCal download ("Legg til i kalender")
- Booking confirmation email via Resend (with iCal attachment)
- 24-hour cancellation policy with mock Vipps refund flow
- Patient dashboard ("Mine timer") — appointments, QR code, cancel, waitlist
- Waitlist — join queue when a practitioner is full

**Admin panel:**
- Protected admin routes (Supabase role-based)
- Today's live schedule with Supabase Realtime (updates without refresh)
- Appointment management — confirm, cancel, mark completed / no-show
- QR check-in — admin clicks/scans QR → patient marked "Arrived" (Realtime update)
- Drag-and-drop weekly availability editor per practitioner
- Availability exceptions (add days off, public holidays)
- Analytics dashboard — 4 KPI cards + bookings trend chart
- Waitlist management — view queue, notify next patient
- Practitioner management — edit bio, specialty, photo

**System:**
- Bilingual NO/EN (Norwegian default, English toggle)
- Mobile-responsive (all pages)
- Loading + empty states on all data-fetching components
- Error boundaries on all major sections
- SEO metadata + Open Graph

### What's Explicitly Out of Scope for v1

- Medical journals / health records of any kind
- GP referral system or Helfo reimbursement
- Real BankID OIDC (certification costs NOK 30,000+/year)
- Real Vipps (requires Norwegian org nr — pending registration)
- Multi-clinic / multi-location management
- Flexible appointment durations (v2)
- Recurring appointment booking (v2)
- Insurance billing
- Practitioner app / mobile admin view
- Dark mode (clinical white + trust blue is the intentional v1 direction)
- Email reminders / cron-based notifications (v2)
- Pre-consultation intake forms (v2)

---

## v2 Roadmap (Planned, Not Built)

v2 transforms Klinikktime from a portfolio demo into a commercial product.

| Feature | Notes |
|---------|-------|
| Multi-tenant architecture | `organisation_id` already on every table — upgrade RLS + add clinic onboarding |
| Real Vipps Checkout | Swap mock flow for real credentials (requires org nr) |
| Real BankID OIDC | Requires certification, budgeted for launch |
| Flexible appointment durations | Per practitioner + per service type |
| Email reminders | 24h before appointment via Resend + Vercel cron |
| Pre-consultation intake forms | Emailed before appointment, admin sees responses |
| Recurring appointments | "Every Tuesday for 8 weeks" booking pattern |
| Smart slot recommendations | Location-aware "neste ledige time i nærheten" (Nominatim) |
| Multi-location support | One organisation, multiple clinic addresses |
| Klinikktime Mobile | Separate React Native + Expo project (Portfolio Project #4) |
| Stripe / alternative payments | Fallback if Vipps approval takes long |

---

## Phase Breakdown

### Phase 0 — Project Setup (1–2 days)
Goal: Working dev environment, Supabase schema live, private repo connected to Vercel.

- Next.js 16 init (TypeScript strict, App Router, Tailwind CSS v4)
- Supabase project creation
- Schema migrations (all tables from TECH-SPEC.md)
- Demo data seed (1 org, 4 practitioners, availability templates, 2 test users)
- `.env.local` configured
- Private GitHub repo `klinikktime-private` + initial commit
- Vercel project connected (auto-deploy from private repo)

### Phase 1 — Foundation + Browsing (3–4 days)
Goal: Unauthenticated user can browse practitioners and see availability.

- Global layout: header (logo, nav links, language toggle), footer
- i18n setup — Norwegian default, English toggle (React context + cookie)
- Homepage — hero section, clinic pitch, practitioners grid
- Practitioner cards component (photo, name, specialty, languages, "Book time" CTA)
- Practitioner profile page `/practitioners/[id]`
- Availability calendar component — month view → select day → slot picker
- Slot picker component (shows available / unavailable slots)
- All loading states + empty states

### Phase 2 — Auth + Booking Flow (4–5 days)
Goal: Patient can authenticate via BankID sim and complete a full Vipps booking.

- BankID simulation component — `BankIDButton` + `BankIDModal`
  - Step 1: "Skriv inn fødselsnummer" (11-digit validation, any passes)
  - Step 2: "Åpne BankID-appen" — rotating reference code, 30s countdown
  - Step 3: "Du er nå innlogget" → Supabase magic link / email session created
  - Disclaimer: "Demo-versjon. Ekte BankID krever BankID OIDC-sertifisering."
- Protected booking route (redirect to auth if not logged in)
- Booking form — contact details, reason for visit
- `POST /api/vipps/initiate` — creates pending appointment, returns mock redirect URL
- `/checkout/vipps-redirect` — styled Vipps page (Vipps blue, key logo, countdown)
  - "Åpne Vipps på telefonen din" + reference number + 3s auto-confirm
  - Auto-fires `POST /api/vipps/callback` with `payment.completed`
- Callback handler — confirms appointment, triggers Resend email
- Booking confirmation page — appointment summary, QR code, iCal download
- Resend booking confirmation email — appointment details + iCal (.ics) attachment
- 24h cancellation deadline — if cancelled within 24h, no refund; if before, mock refund fires
- Resend cancellation email with refund status

### Phase 3 — Patient Dashboard (2–3 days)
Goal: Patient has a full self-service area.

- `/min-side` — authenticated patient dashboard
- Appointments list (upcoming / past) with status badges
- Cancel appointment flow with deadline warning
- QR code display on appointment card
- Waitlist — join queue for a practitioner, see position
- Cancellation triggers mock Vipps refund if eligible, sends Resend cancellation email

### Phase 4 — Admin Panel (5–7 days)
Goal: Full real-time clinic management.

- Auth guard — Supabase role check (`admin` or `staff`)
- Admin layout with sidebar navigation
- Today's schedule — live Supabase Realtime feed
  - Appointment rows with status colour coding
  - Inline status actions (Confirm / Complete / No-show / Cancel)
  - QR check-in button — marks patient "Arrived", updates Realtime
- Practitioner availability editor
  - Drag-and-drop weekly template (Mon–Sun, morning/afternoon blocks)
  - Add/remove time slots via drag
  - Exception dates (days off) — date picker + reason
- Analytics dashboard
  - KPI cards: bookings this week, cancellation rate, utilisation %, most-booked practitioner
  - Bookings trend chart (last 4 weeks, `recharts`)
- Waitlist management — list per practitioner, "Notify" button sends Resend email
- Practitioner management — edit name, bio, specialty, photo (Supabase Storage)

### Phase 5 — Polish + Deploy (2–3 days)
Goal: Production-ready, live on Vercel, public repo set up.

- Mobile responsiveness full audit (all pages, all breakpoints)
- Error boundaries on all major sections
- SEO metadata + Open Graph images for all pages
- Vercel production deployment
- Environment variables on Vercel
- README with screenshots, tech stack, live URL, demo credentials
- `.env.example` committed
- Public GitHub repo `klinikktime` — sanitized (stubs replacing proprietary files, code snippets added to README)
- CV update — cv-build-may.js (all 4 locations) + rebuild
- Definition of DONE checklist (see below)

---

## Definition of DONE

- [ ] Core features working end-to-end (book → Vipps sim → admin sees it live)
- [ ] BankID simulation flow complete
- [ ] Vipps mock flow complete (redirect + callback + refund)
- [ ] QR check-in working
- [ ] iCal export working
- [ ] Resend emails sending (confirmation + cancellation + waitlist)
- [ ] Admin real-time schedule updating live
- [ ] Drag-drop availability editor working
- [ ] Analytics dashboard rendering real data
- [ ] Deployed on Vercel with live URL
- [ ] README with screenshots and tech stack
- [ ] `.env.example` committed
- [ ] No console errors in production
- [ ] Mobile-responsive (tested on 375px, 768px, 1280px)
- [ ] TECH-SPEC.md updated with final architecture
- [ ] PROJECT-TRACKER.md all v1 phases checked
- [ ] Repo public (`klinikktime`) and pinned on GitHub
- [ ] CV updated (cv-build-may.js rebuilt)

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Vipps test account blocked (no org nr) | High | Low | Option C (flow sim) chosen — no real Vipps dependency in v1 |
| Drag-drop availability editor scope creep | Medium | Medium | Use `@dnd-kit/core` — battle-tested, good DX; timebox to 2 days |
| Supabase Realtime connection issues on Vercel | Low | Medium | Test early in Phase 4; fallback to polling if needed |
| Resend email deliverability to test addresses | Low | Low | Use personal email as test recipient in dev |
| BankID modal feeling obviously fake | Medium | High | Polish the OTP flow carefully — animation, timing, correct colours matter |
| Admin panel scope creep | High | High | Strict phase gate — ship Phase 3 before touching Phase 4 |

---

## Timeline Estimate

| Phase | Duration |
|-------|----------|
| Phase 0 | 1–2 days |
| Phase 1 | 3–4 days |
| Phase 2 | 4–5 days |
| Phase 3 | 2–3 days |
| Phase 4 | 5–7 days |
| Phase 5 | 2–3 days |
| **Total** | **17–24 days (3–4 weeks active building)** |
