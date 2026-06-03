# Klinikktime — Session Context
**Project:** Portfolio Project #3 — Norwegian private healthcare booking platform
**Developer:** Ayyad Anwar | iamayyad@gmail.com | github.com/adyelmoro
**Project directory:** A:\ClaudeAI\MyAI-Projects\klinikktime
**Parent context:** A:\ClaudeAI\MyAI-Projects\CLAUDE.md
**Session name:** Klinikktime - Project
**Status:** ✅ SHIPPED — All phases complete. Live at klinikktime.vercel.app

---

## Read This First

Before doing anything, read the parent context:
`A:\ClaudeAI\MyAI-Projects\CLAUDE.md`

That file contains the full portfolio strategy, Norwegian market context, conventions, decisions log, and the status of the two completed projects (StrømVei + DokumentAI). Everything in this session builds on that foundation.

---

## What Klinikktime Is

Norwegian private healthcare booking platform. Patients browse practitioners (physio, psychologist, sports medicine, nutritionist, private GP consult), check real-time availability, book with a simulated Vipps payment flow, and manage their appointments with QR check-in. Clinic staff get a real-time admin panel. Bilingual NO/EN.

Inspired by DrDropin and Volvat — built from scratch as an original portfolio project with commercial potential. Architecture is designed for future monetisation and real production deployment.

**Target employers:** Volvat Medisinske Senter (applied), Aleris Helse, Helselink, NHN (Norsk Helsenett), Bekk, Sopra Steria (clinic digitisation projects).

---

## Key Decisions Made in Planning

| Decision | Choice | Reason |
|----------|--------|--------|
| Brand name | Klinikktime | Correct Norwegian (klinikk + time), immediately understood |
| Folder | `klinikktime/` | Renamed from helsebook/ |
| Architecture v1 | Single clinic | Fast to build, clean demo. Schema prepared for multi-tenant v2. |
| Appointment slots | Fixed 30-min slots | Simple, realistic. Flexible duration in v2. |
| Vipps | Flow simulation (Option C) | No org nr yet. Full redirect + mock webhook = production-ready architecture. |
| BankID | Full UX simulation | Styled button + OTP modal + countdown. Shows BankID OIDC understanding. |
| Admin panel | Real-time schedule + drag-drop + analytics + QR check-in | Minimum impressive, not just CRUD |
| Email | Resend (v1) | Confirmations + iCal + cancellations + waitlist notifications |
| Practitioner types | Physio, psychology, sports medicine, nutritionist, private GP consult | No medical journals, no referrals, GDPR clean |
| GitHub | Private (`klinikktime-private`) + sanitized public (`klinikktime`) | IP protection + recruiter visibility |
| Future commercial | Planned — org nr registration pending | Schema and architecture must support production deployment |
| Cancellation | 24h policy + mock Vipps refund flow | Shows full payment lifecycle understanding |
| QR check-in | v1 | Patient QR → admin scans → Realtime status update |
| iCal export | v1 | "Legg til i kalender" on confirmation page + email attachment |

---

## Planned Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16, TypeScript strict, App Router |
| Styling | Tailwind CSS v4 — clinical white + trust blue, modern + accessible |
| Database + Auth + Realtime | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| Email | Resend |
| Payments (mock) | Vipps Checkout flow simulation (redirect page + internal callback) |
| Auth (mock) | BankID UX simulation (styled button + OTP modal + Supabase session) |
| QR codes | `qrcode` npm package |
| Calendar export | `ical-generator` npm package |
| Drag-drop | `@dnd-kit/core` (availability editor) |
| Charts | `recharts` (analytics dashboard) |
| Deployment | Vercel |

---

## Conventions (same as all portfolio projects)

- TypeScript strict mode — no `any` without comment
- Tailwind CSS only — no CSS-in-JS
- Commit format: `type(scope): description`
- `.env.local` always gitignored
- Norwegian (Bokmål) default UI, English toggle
- Every page: loading state + empty state
- Mobile-responsive — Norwegian recruiters test on phone
- Definition of DONE: deployed + README + live URL + CV updated

---

## Repository Strategy

| Repo | Visibility | Contents |
|------|-----------|----------|
| `klinikktime-private` | Private | Full codebase including all business logic |
| `klinikktime` | Public (recruiter-facing) | UI components, API signatures, schema, README with code snippets |

Files replaced with stubs in public repo (proprietary IP):
- `src/lib/availability.ts` — availability calculation engine
- `src/lib/waitlist.ts` — waitlist algorithm
- `src/lib/vipps-mock.ts` — Vipps mock implementation

The live Vercel deployment builds from the private repo. The public repo shows architectural thinking and UI skill, including highlighted code snippets for key logic.

---

## Vipps Registration (Pending)

- Org nr registration: **PENDING** — must register enkeltpersonforetak on Altinn when ready
- Portal: portal.vipps.no / developer.vipps.no (requires org nr for real merchant account)
- Until then: full flow simulation (mock redirect page + internal webhook callback)
- When org nr obtained: swap mock redirect URL for real Vipps redirect, register real webhook. Rest of codebase stays identical — architecture is production-ready.

---

## Phase Status

| Phase | Name | Status |
|-------|------|--------|
| 0 | Project setup | ✅ Complete — 2026-05-26 |
| 1 | Foundation + browsing | ✅ Complete — 2026-05-26 |
| 2 | Auth + booking flow | ✅ Complete — 2026-05-28 |
| 3 | Patient dashboard | ✅ Complete — 2026-05-28 |
| 4 | Admin panel | ✅ Complete — 2026-05-29 |
| 4.5 | Practitioner portal | ✅ Complete — 2026-05-29 |
| 5 | Polish + deploy | ✅ Complete — 2026-06-03 |
| Mobile | React Native companion app | 🔲 After web ships |
| v2 | Multi-tenant, flexible slots, real Vipps | 🔲 Future (needs org nr) |

---

## Technical Notes

**Supabase project:** `ifgvmbhwmpmmkecfexxd` — eu-west-1, second Supabase account (free tier)
**GitHub:** https://github.com/adyelmoro/klinikktime (public repo — single repo, Ayyad's choice)
**Vercel:** https://klinikktime.vercel.app ✅ LIVE and working (Framework Preset fixed 2026-05-28)
**Git author:** adyelmoro / iamayyad@gmail.com (fixed from ayadaz/ay.ad.az@hotmail.com 2026-05-28)

**Phase 0 delivered (2026-05-26):**
- Next.js 16, TypeScript strict, Tailwind CSS v4 with full design token system
- Supabase SSR client (browser + server + service role)
- All 6 DB tables live with RLS policies + seed data (4 practitioners, availability templates)
- Full lib layer: availability.ts, vipps-mock.ts, waitlist.ts, resend.ts, ical.ts, qr.ts
- i18n system: no.ts + en.ts + LanguageProvider with cookie persistence
- `supabase/run_all.sql` — single-file migration for future resets

**Phase 1 delivered (2026-05-26):**
- Layout: Header, Footer, LanguageToggle
- UI primitives: Button, Badge, Skeleton
- PractitionerCard, PractitionerCardSkeleton
- AvailabilityCalendar (month picker + day selection)
- SlotPicker (live slots from Supabase, available/unavailable states)
- API routes: /api/practitioners, /api/practitioners/[id], /api/availability/[practitionerId]
- Pages: / (homepage with hero + grid), /practitioners, /practitioners/[id] (profile)
- All loading skeletons + empty states

**Phase 2 delivered (2026-05-28):**
- BankIDModal (SSN input → 10s countdown → anonymous auth fallback → Supabase session)
- BankIDButton wrapper component with geometric bar mark SVG
- booking/new page (BankID gate → booking details → Vipps payment initiation)
- vipps-redirect page (loading → confirming → done → countdown redirect)
- booking/confirmation/[id] page (appointment details + QR code + iCal download)
- API routes: /api/vipps/initiate, /api/vipps/callback, /api/appointments/[id], /api/appointments/[id]/ical
- Resend lazy init (avoids build crash when RESEND_API_KEY unset)
- All 14 SVG icons committed to public/icons/ (logo, BankID, Vipps, specialty icons)
- HeroSection fully bilingual (12 new i18n keys in home namespace)
- Tested end-to-end on Vercel: BankID → slot → booking → Vipps → confirmation → QR code ✅

**Phase 3 delivered (2026-05-28):**
- `/min-side` patient dashboard: BankID gate, upcoming/past tabs, appointment cards
- QR modal (lazy-fetched per appointment), iCal download link
- Cancel flow: 24h window detection, confirmation modal, mock Vipps refund
- "Switch account" button: `supabase.auth.signOut()` + state reset
- API routes: /api/appointments (GET by patientId), /api/appointments/[id]/cancel (PATCH)
- i18n: 6 new dashboard keys (cancelAppointment, keepAppointment, cancelFreeUntil, cancelNoRefund, refundViaVipps, switchAccount)
- Tested end-to-end on Vercel ✅

**Bug fixes delivered (2026-05-28 session):**
- AvailabilityCalendar: fixed UTC timezone bug — `toISOString()` shifted date for Norwegian users (UTC+2). Replaced with local date parts (`getFullYear/getMonth/getDate`)
- availability.ts: removed `jsDay-1` conversion (DB uses 1=Mon matching JS getDay()), fixed date parsing to noon to prevent UTC shift, fixed isToday check
- BankID incognito bug: added `/api/auth/bankid-demo` server route using admin SDK to find-or-create user with `email_confirm: true` so `signInWithPassword` always works — same SSN always = same userId = same appointments visible
- Confirmation page: `router.push('/dashboard')` → `/min-side` (was 404), `amount_nok / 100` for display (was showing 150000 instead of 1500 kr)
- Demo seed data: ~100 appointments across Lars/Ingrid/Jonas/Marte/Nina for June–July 2026, creates realistic busy/available calendar pattern

**Quirks / gotchas:**
- `consultation_fee_nok` stored in øre — always divide by 100 for display
- `amount_nok` on appointments table is also in øre — always divide by 100
- Supabase `.select()` with joins returns `never` — cast with `(supabase as any)` + explicit interface
- iCal: `Buffer` not assignable to NextResponse body — use `new Uint8Array(icalBuffer)`
- BankID auth: requires `/api/auth/bankid-demo` to be called first (admin creates confirmed user), THEN `signInWithPassword` works. Anonymous fallback still in place.
- BankID anonymous fallback: requires "Anonymous sign-ins" enabled in Supabase dashboard (Authentication → Providers → Anonymous Users)
- Vercel Hobby: blocked deployments if commit author ≠ Vercel account owner
- Demo appointments: seeded with `patient_id = (SELECT id FROM auth.users LIMIT 1)` — FK requires a real auth user
- `practitioners.name` not `full_name` — the column is `name`

## Environment Variables (configured on Vercel)

```
NEXT_PUBLIC_SUPABASE_URL=https://ifgvmbhwmpmmkecfexxd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...RcI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...V80
RESEND_API_KEY=         ← not yet configured (Ayyad to add when ready)
RESEND_FROM_EMAIL=noreply@klinikktime.no
NEXT_PUBLIC_BASE_URL=https://klinikktime.vercel.app
VIPPS_CLIENT_ID=mock
VIPPS_CLIENT_SECRET=mock
VIPPS_MERCHANT_SERIAL_NUMBER=mock
```

---

**Phase 4 delivered (2026-05-29):**
- Admin layout: httpOnly cookie auth (`klinikktime_admin`, `demo1234`), AdminShell with 5-item nav
- `/admin` — today's schedule: Supabase Realtime live updates, QR check-in bar (8-char token prefix match), status action buttons (Merk ankommet / Fullført / Ikke møtt), 4 stat cards
- `/admin/appointments` — all appointments with date/status/search filters
- `/admin/analytics` — recharts LineChart (bookings/day), PieChart (specialty), BarChart (per practitioner); 4 stat cards
- `/admin/availability` — @dnd-kit drag-to-reorder, active/inactive toggle, add/delete templates, per-practitioner selector
- `/admin/practitioners` — create/remove per-practitioner Supabase Auth accounts
- API routes: /api/admin/auth (POST/DELETE), /api/admin/appointments (GET), /api/admin/appointments/[id] (PATCH), /api/admin/analytics (GET), /api/admin/availability (GET/POST), /api/admin/availability/[id] (PATCH/DELETE), /api/admin/practitioners (GET), /api/admin/practitioners/[id]/create-account (POST/DELETE)
- Demo seed SQL: 6 appointments for 2026-05-29 with mixed statuses + organisation_id fix
- QR bug fix: qr.ts now encodes raw token (not URL), modal shows 8-char prefix, admin matches on prefix

**Phase 4.5 delivered (2026-05-29) — code complete, testing pending:**
- Practitioner portal at `/min-klinikk` — teal/green `#0d9463` scheme, "BEHANDLER" badge
- PractitionerLogin: Supabase `signInWithPassword` (email+password) — completely separate from admin cookie auth
- PractitionerShell: fixed sidebar with practitioner name + specialty identity card, initials avatar
- `/min-klinikk` — today's schedule (own appointments only), Realtime, status actions, no QR bar
- `/min-klinikk/appointments` — all own appointments, filters, patient contact details hidden
- `/min-klinikk/analytics` — personal stats: monthly totals, revenue, avg/day, line chart, status bar chart
- `/min-klinikk/availability` — own templates, full drag-drop editor, same UX as admin
- `getPractitionerFromSession()` helper in `src/lib/practitioner-auth.ts` — validates every API route
- All 6 `/api/practitioner/` routes enforce ownership server-side (not just UI filtering)
- DB migration required: `ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;`

**Strategic decisions locked (2026-05-29 session):**
- Practitioner portal: multi-auth per-practitioner (admin creates accounts), `/min-klinikk`, teal `#0d9463`
- Public repo: https://github.com/adyelmoro/klinikktime-public.git ✅ PUSHED — remote `public` registered locally
- Push both: `git push origin main && git push public main`
- React Native: Project 4, after web ships, native features include QR camera scan (centrepiece), push notifications, biometric lock
- No deadline pressure — build everything completely before shipping
- v2 = real Vipps (needs org nr) + multi-tenant + flexible slots — architecture already ready

**Quirks / gotchas (additions):**
- `appointments.organisation_id` is NOT NULL — always include in INSERT statements
- Practitioner portal uses Supabase session cookie auth (not httpOnly cookie like admin)
- If logged-in user has no matching `practitioners.user_id` row → PractitionerLogin shown (clean rejection)

## "Save and Update" Command

When Ayyad says "save and update" — update ALL of the following without exception:
1. This file (`klinikktime/CLAUDE.md`) — latest phase, status, technical notes
2. `A:\ClaudeAI\MyAI-Projects\CLAUDE.md` — project status table + LAST SYNCED date
3. `A:\CV\2026\CLAUDE.md` — project status table
4. `A:\CV\2026\MAY2026\CLAUDE.md` — SESSION SUMMARY
5. `A:\CV\skills\cv-builder.md` — if any process or rule changed
6. Memory files in `C:\Users\PC-33445\.claude\projects\A--ClaudeAI-MyAI-Projects\memory\`
7. If project just shipped → also update cv-build-may.js (all 4 locations) and rebuild
