# Klinikktime — Session Context
**Project:** Portfolio Project #3 — Norwegian private healthcare booking platform
**Developer:** Ayyad Anwar | iamayyad@gmail.com | github.com/adyelmoro
**Project directory:** A:\ClaudeAI\MyAI-Projects\klinikktime
**Parent context:** A:\ClaudeAI\MyAI-Projects\CLAUDE.md
**Session name:** Klinikktime - Project
**Status:** 🔲 PLANNING COMPLETE — ready to build Phase 0

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
| 0 | Project setup | 🔲 Not started |
| 1 | Foundation + browsing | 🔲 Not started |
| 2 | Auth + booking flow | 🔲 Not started |
| 3 | Patient dashboard | 🔲 Not started |
| 4 | Admin panel | 🔲 Not started |
| 5 | Polish + deploy | 🔲 Not started |
| v2 | Multi-tenant, flexible slots, real Vipps | 🔲 Future |

---

## Environment Variables (to configure)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
VIPPS_CLIENT_ID=mock
VIPPS_CLIENT_SECRET=mock
VIPPS_MERCHANT_SERIAL_NUMBER=mock
```

---

## "Save and Update" Command

When Ayyad says "save and update" — update ALL of the following without exception:
1. This file (`klinikktime/CLAUDE.md`) — latest phase, status, technical notes
2. `A:\ClaudeAI\MyAI-Projects\CLAUDE.md` — project status table + LAST SYNCED date
3. `A:\CV\2026\CLAUDE.md` — project status table
4. `A:\CV\2026\MAY2026\CLAUDE.md` — SESSION SUMMARY
5. `A:\CV\skills\cv-builder.md` — if any process or rule changed
6. Memory files in `C:\Users\PC-33445\.claude\projects\A--ClaudeAI-MyAI-Projects\memory\`
7. If project just shipped → also update cv-build-may.js (all 4 locations) and rebuild
