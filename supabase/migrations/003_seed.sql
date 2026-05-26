-- Klinikktime v1 — Demo Seed Data
-- Run AFTER 001_schema.sql and 002_rls.sql
-- IMPORTANT: Run this via Supabase SQL Editor (service role bypasses RLS)

-- ─── Organisation ────────────────────────────────────────────────────────────
INSERT INTO organisations (id, name, slug, address, phone, email)
VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Klinikktime Demo Klinikk',
  'klinikktime-demo',
  'Storgata 1, 0155 Oslo',
  '+47 22 00 00 00',
  'kontakt@klinikktime-demo.no'
);

-- ─── Practitioners ───────────────────────────────────────────────────────────
INSERT INTO practitioners (id, organisation_id, name, specialty, bio_no, bio_en, languages, consultation_fee_nok, slot_duration_minutes)
VALUES
(
  'b1b2c3d4-0000-0000-0000-000000000001',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Lars Eriksen',
  'physio',
  'Lars er spesialisert fysioterapeut med 12 års erfaring innen idrettsskader, ryggproblemer og rehabilitering. Han benytter evidensbaserte metoder og er utdannet fra Universitetet i Oslo.',
  'Lars is a specialist physiotherapist with 12 years of experience in sports injuries, back problems, and rehabilitation. He uses evidence-based methods and graduated from the University of Oslo.',
  ARRAY['no', 'en'],
  85000, -- 850 NOK in øre
  30
),
(
  'b1b2c3d4-0000-0000-0000-000000000002',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Ingrid Solberg',
  'psychology',
  'Ingrid er klinisk psykolog med spesialisering i kognitiv atferdsterapi (KAT), angst og depresjon. Hun tilbyr en trygg og ikke-dømmende ramme for å jobbe med psykisk helse.',
  'Ingrid is a clinical psychologist specialising in cognitive behavioural therapy (CBT), anxiety, and depression. She offers a safe, non-judgmental space for mental health work.',
  ARRAY['no', 'en', 'de'],
  125000, -- 1250 NOK
  50
),
(
  'b1b2c3d4-0000-0000-0000-000000000003',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Marte Haugen',
  'nutritionist',
  'Marte er autorisert klinisk ernæringsfysiolog. Hun hjelper pasienter med vekthåndtering, fordøyelsesplager, sportsernæring og generell kostholdsveiledning.',
  'Marte is a registered clinical dietitian. She helps patients with weight management, digestive issues, sports nutrition, and general dietary counselling.',
  ARRAY['no', 'en'],
  95000, -- 950 NOK
  45
),
(
  'b1b2c3d4-0000-0000-0000-000000000004',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Jonas Berg',
  'sports_medicine',
  'Jonas er idrettslege med bakgrunn fra toppidrett og lang erfaring med skadeforebygging, belastningsskader og returprotokoll etter skade. Tidligere lagslege for Rosenborg BK.',
  'Jonas is a sports medicine physician with a background in elite athletics and extensive experience in injury prevention, overuse injuries, and return-to-sport protocols. Former team physician at Rosenborg BK.',
  ARRAY['no', 'en'],
  150000, -- 1500 NOK
  30
);

-- ─── Availability Templates (Mon–Fri 09:00–16:00 for all practitioners) ──────
-- day_of_week: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri
INSERT INTO availability_templates (practitioner_id, day_of_week, start_time, end_time)
SELECT p.id, d.day, '09:00'::time, '16:00'::time
FROM practitioners p
CROSS JOIN (VALUES (0),(1),(2),(3),(4)) AS d(day);

-- Ingrid (psychology) works longer sessions so fewer slots — Wed afternoons off
INSERT INTO availability_exceptions (practitioner_id, exception_date, reason)
VALUES (
  'b1b2c3d4-0000-0000-0000-000000000002',
  CURRENT_DATE + 14,
  'Fagdag'
);

-- ─── Demo Appointments (so analytics shows non-zero data) ────────────────────
-- NOTE: These appointments use a placeholder patient_id that must be replaced
-- with a real auth.users UUID after creating the demo patient account.
-- Step: Create a patient account via Supabase Auth UI first, then paste the UUID below.
-- Replace 'PATIENT_UUID_HERE' with the actual UUID after creating the account.

-- Uncomment and update after creating demo patient:
/*
INSERT INTO appointments (
  organisation_id, practitioner_id, patient_id,
  patient_name, patient_email, patient_phone,
  appointment_date, start_time, end_time,
  status, payment_status, amount_nok, reason
)
VALUES
(
  'a1b2c3d4-0000-0000-0000-000000000001',
  'b1b2c3d4-0000-0000-0000-000000000001',
  'PATIENT_UUID_HERE',
  'Demo Pasient', 'demo@klinikktime.no', '+47 99 00 00 01',
  CURRENT_DATE - 7, '10:00', '10:30',
  'completed', 'paid', 85000, 'Vondt i ryggen'
),
(
  'a1b2c3d4-0000-0000-0000-000000000001',
  'b1b2c3d4-0000-0000-0000-000000000003',
  'PATIENT_UUID_HERE',
  'Demo Pasient', 'demo@klinikktime.no', '+47 99 00 00 01',
  CURRENT_DATE - 3, '13:00', '13:45',
  'completed', 'paid', 95000, 'Kostholdsveiledning'
),
(
  'a1b2c3d4-0000-0000-0000-000000000001',
  'b1b2c3d4-0000-0000-0000-000000000002',
  'PATIENT_UUID_HERE',
  'Demo Pasient', 'demo@klinikktime.no', '+47 99 00 00 01',
  CURRENT_DATE + 2, '11:00', '11:50',
  'confirmed', 'paid', 125000, 'Angst og stress'
);
*/
