# Klinikktime — Product Pitch
**For:** Portfolio presentations, recruiter conversations, CV context
**Tagline:** Moderne timebestilling for norske privatklinikker

---

## The Problem

Private healthcare clinics in Norway run on legacy booking software — phone calls, paper schedules, and expensive enterprise systems (Visma Flyt Klinikk) that are hard to use and even harder to customise. Patients expect the same digital experience they get from booking a flight or a hotel.

Clinics need: real-time availability, Vipps payments (because Norwegians don't carry cards for healthcare), BankID identity (because Norwegian health services require verified identity), and staff tools that actually work on a tablet at reception.

---

## The Solution — Klinikktime

A full-stack Norwegian private healthcare booking platform built for the Norwegian digital infrastructure:

- **Vipps** — the payment method 4.1M Norwegians use daily
- **BankID** — the identity layer 98% of Norwegians have on their phone
- **Real-time clinic operations** — admin panel updates live as patients book and arrive
- **QR check-in** — patients scan at reception, staff see the arrival instantly
- **Bilingual** — Norwegian (Bokmål) default, English toggle

---

## Who It's For

**Patients:** Anyone booking a private physio, psychologist, sports medicine, nutritionist, or GP consult appointment — without calling, waiting on hold, or using an outdated form.

**Clinic staff:** Reception and admin teams who need a live view of today's schedule, the ability to manage waitlists, and availability control — all on a tablet or laptop.

**Target market:**
- ~350 private health clinics in Norway (Volvat alone has 30+ locations)
- Sports clubs with physio departments
- Private psychology practices
- Corporate wellness programmes

---

## Target Employers

| Employer | Relevance |
|----------|-----------|
| **Volvat Medisinske Senter** | Largest private clinic chain in Norway — applied |
| **Aleris Helse** | Major private hospital group — direct fit |
| **Helselink** | Norwegian healthtech startup — direct fit |
| **NHN (Norsk Helsenett)** | National health network — infrastructure layer |
| **Bekk** | Consulting firm with major healthcare clients |
| **Sopra Steria Norway** | Builds clinic digitisation systems — project fit |
| **Accenture Norway** | Digital health practice — portfolio fit |

---

## Norwegian Market Context

**Why this project is Norwegian-specific, not generic:**

- **Vipps** (4.1M users / 5.4M population) is the default payment method for services. Booking a physio without Vipps is like booking a taxi without a credit card option — it's wrong.
- **BankID** is used for everything from banking to public services. Norwegian users expect BankID for any service involving personal data. Showing you understand the BankID OIDC flow — even in simulation — signals real market knowledge.
- **GDPR + Datatilsynet** — Norwegian health data handling has strict requirements. Not storing health records (by design) is the right architectural call. Demonstrated understanding of what to include and what to stay out of.
- **Norsk Helsenett** — the national health network. Private clinics integrate with it for journal sharing. Out of scope for this project but relevant to mention in conversations.
- **Fastlege-systemet** — everyone has a GP assigned by the state. Private clinics handle referrals, specialist visits, and services outside the public system. Klinikktime targets this private tier.

**Competitor landscape:**
| Product | Status | Weakness |
|---------|--------|----------|
| Visma Flyt Klinikk | Dominant, enterprise | Complex, expensive, legacy UX |
| Min Helse (govt) | Public health only | No private clinic support |
| DrDropin | Modern, VC-backed | Walk-in only, no scheduling |
| Imendo | Niche (physio) | Specialty-only |

Klinikktime sits in the gap DrDropin left: scheduled appointments for private specialists, with modern Norwegian UX.

---

## Technical Differentiators

What makes this project stand out against other portfolio booking apps:

| Feature | Generic booking portfolio | Klinikktime |
|---------|--------------------------|-------------|
| Payment | Stripe credit card | Vipps flow simulation (Norwegian standard) |
| Auth | Google OAuth | BankID UX simulation (Norwegian identity) |
| Admin | CRUD table | Supabase Realtime live schedule |
| Check-in | — | QR code + Realtime status update |
| Calendar | iCal not included | iCal export + email attachment |
| Cancellation | Simple cancel | 24h policy + mock Vipps refund lifecycle |
| Architecture | Single monolith | Multi-tenant-ready schema from day one |
| IP strategy | Open source | Private core + public UI (commercial intent) |

---

## Demo Script (5-minute walkthrough)

Use this sequence when demoing live to a recruiter or in a video:

1. **Homepage** — "Dette er Klinikktime — moderne timebestilling for norske privatklinikker."
2. **Browse practitioners** — "Her ser pasienten alle aktive behandlere. Klikk på en fysioterapeut."
3. **Practitioner profile** — "Full profil med biografi, spesialitet, tilgjengelighet. Og her er kalenderen."
4. **Pick a slot** — "Grønne tider er ledige, grå er opptatt. Jeg velger mandag 10:00."
5. **BankID sim** ← **WOW MOMENT** — "Pasienten logger inn med BankID. Referansekode, 30-sekunders nedtelling... innlogget."
6. **Booking form** — "Legg til grunn for besøket, bekreft kontaktinfo."
7. **Vipps redirect** ← **WOW MOMENT** — "Betalingssiden. Vipps-design, ordrereferanse, 3-sekunders bekreftelse."
8. **Confirmation** — "Bestilling bekreftet. QR-kode for innsjekk. Legg til i kalender. Epost er sendt."
9. **Admin panel** ← **WOW MOMENT** — "Nå bytter vi til klinikksiden. Dagsskjemaet oppdaterer seg i sanntid."
10. **QR check-in** — "Pasienten møter opp, viser QR, vi klikker 'Ankom'. Status oppdaterer seg live."
11. **Analytics** — "Bookinger denne uken, kanselleringsrate, kapasitetsutnyttelse."
12. **Availability editor** — "Drag-and-drop for å sette åpningstider per behandler."

Total demo time: ~5 minutes. Can be shortened to 3 minutes by skipping availability editor.

---

## Conversation Talking Points

**"Why Vipps and not Stripe?"**
"Stripe is the international default. But in Norway, Vipps has 4.1 million users — that's 76% of the population. Any clinic booking platform that doesn't offer Vipps will lose patients at checkout. I built the architecture to be production-ready: when we have a merchant account, we swap the mock redirect for real Vipps credentials. Everything else stays the same."

**"Why BankID?"**
"In Norway, BankID is identity. It's on 98% of phones. Clinics deal with personal health data — Datatilsynet expects strong identity verification. I built the full UX flow so any Norwegian recruiter immediately recognises it. The real OIDC integration requires certification and a budget, but the architecture slot is there."

**"Why not just CRUD for the admin panel?"**
"Real clinics care about: who's coming in the next hour, which patients arrived, and why their 10 o'clock no-showed. A CRUD table doesn't answer those questions. I built what a reception tablet would actually show — live updates the second a booking changes, QR check-in, and utilisation metrics that a clinic manager actually looks at."

**"Is this production-ready?"**
"The schema is. `organisation_id` is on every table — upgrading to multi-tenant is additive, not a rewrite. The Vipps integration slots into the same API interface. BankID can be layered in. I'd estimate 4–6 weeks to go from this demo to a real product with paying clinics."

---

## Commercial Potential

Klinikktime is positioned as a future SaaS product:

**Pricing model (planned for v2+):**
- Per-clinic subscription: NOK 1,500–3,000/month
- Per-booking fee: NOK 5–15 per confirmed booking
- Target: 20 clinics × NOK 2,000/month = NOK 40,000 MRR

**Moat:**
- Norwegian-native integrations (Vipps, BankID) — non-trivial to replicate quickly
- Realtime clinic ops — the feature that makes receptionists happy to use it
- Patient relationship data (waitlists, booking history) — switching cost after adoption

**Exit options:**
- Acquisition by Visma (they dominate Norwegian clinic software — this is the modern version)
- Acquisition by a clinic chain (Volvat, Aleris) building internal tooling
- Grow as independent SaaS (bootstrappable — low server costs on Vercel + Supabase free tier initially)

---

## What the Project Demonstrates

**To a hiring manager:**
- You can build complete, production-shaped systems — not just UI demos
- You understand Norwegian digital infrastructure (Vipps, BankID, GDPR)
- You can design for real users, not just developers (accessibility, language, elderly-friendly UI)
- You think commercially — architecture designed for monetisation from day one

**To a tech lead:**
- Supabase Realtime in production patterns
- Multi-tenant schema design before the product needs it
- RLS as the security layer (no app-level auth checks for data access)
- Payment lifecycle (initiate → confirm → refund) — not just the happy path
- Two-repo IP strategy for open-source portfolio + commercial protection
