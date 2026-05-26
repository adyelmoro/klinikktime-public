-- ============================================================
-- Klinikktime — Full Setup (Schema + RLS + Seed)
-- Paste this entire file into Supabase SQL Editor and click Run
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- 1. SCHEMA
-- ════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE organisations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  slug       text UNIQUE NOT NULL,
  address    text,
  phone      text,
  email      text,
  logo_url   text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE profiles (
  id                 uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name          text,
  phone              text,
  date_of_birth      date,
  preferred_language text DEFAULT 'no',
  created_at         timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE admin_users (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organisation_id uuid REFERENCES organisations(id),
  role            text DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at      timestamptz DEFAULT now()
);

CREATE TYPE specialty_type AS ENUM (
  'physio', 'psychology', 'sports_medicine', 'nutritionist', 'private_gp'
);

CREATE TABLE practitioners (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id       uuid REFERENCES organisations(id) NOT NULL,
  name                  text NOT NULL,
  specialty             specialty_type NOT NULL,
  bio_no                text,
  bio_en                text,
  photo_url             text,
  languages             text[] DEFAULT ARRAY['no'],
  slot_duration_minutes int DEFAULT 30,
  consultation_fee_nok  int,
  is_active             bool DEFAULT true,
  created_at            timestamptz DEFAULT now()
);

CREATE TABLE availability_templates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid REFERENCES practitioners(id) ON DELETE CASCADE,
  day_of_week     int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time      time NOT NULL,
  end_time        time NOT NULL,
  is_active       bool DEFAULT true
);

CREATE TABLE availability_exceptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid REFERENCES practitioners(id) ON DELETE CASCADE,
  exception_date  date NOT NULL,
  reason          text
);

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
  patient_name     text NOT NULL,
  patient_email    text NOT NULL,
  patient_phone    text,
  appointment_date date NOT NULL,
  start_time       time NOT NULL,
  end_time         time NOT NULL,
  status           appointment_status DEFAULT 'pending',
  reason           text,
  vipps_order_id   text,
  payment_status   payment_status DEFAULT 'pending',
  amount_nok       int,
  admin_notes      text,
  qr_token         text UNIQUE DEFAULT gen_random_uuid()::text,
  created_at       timestamptz DEFAULT now()
);

CREATE TABLE waitlist (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id       uuid REFERENCES practitioners(id) ON DELETE CASCADE,
  patient_id            uuid REFERENCES auth.users(id) NOT NULL,
  patient_name          text NOT NULL,
  patient_email         text NOT NULL,
  patient_phone         text,
  preferred_date        date,
  preferred_time_of_day text DEFAULT 'any' CHECK (preferred_time_of_day IN ('morning', 'afternoon', 'any')),
  notified_at           timestamptz,
  created_at            timestamptz DEFAULT now()
);


-- ════════════════════════════════════════════════════════════
-- 2. ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════

ALTER TABLE organisations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioners          ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist               ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- organisations
CREATE POLICY "Public can view organisations"
  ON organisations FOR SELECT USING (true);
CREATE POLICY "Admins can update organisations"
  ON organisations FOR UPDATE USING (public.is_admin());

-- profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT USING (public.is_admin());

-- admin_users
CREATE POLICY "Admins can view own admin record"
  ON admin_users FOR SELECT USING (auth.uid() = id);

-- practitioners
CREATE POLICY "Public can view active practitioners"
  ON practitioners FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can do everything with practitioners"
  ON practitioners FOR ALL USING (public.is_admin());

-- availability_templates
CREATE POLICY "Public can view availability templates"
  ON availability_templates FOR SELECT USING (true);
CREATE POLICY "Admins can manage availability templates"
  ON availability_templates FOR ALL USING (public.is_admin());

-- availability_exceptions
CREATE POLICY "Public can view availability exceptions"
  ON availability_exceptions FOR SELECT USING (true);
CREATE POLICY "Admins can manage availability exceptions"
  ON availability_exceptions FOR ALL USING (public.is_admin());

-- appointments
CREATE POLICY "Patients can view own appointments"
  ON appointments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Patients can insert own appointments"
  ON appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients can update own appointments"
  ON appointments FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "Admins can do everything with appointments"
  ON appointments FOR ALL USING (public.is_admin());
CREATE POLICY "Service role can insert appointments"
  ON appointments FOR INSERT WITH CHECK (true);

-- waitlist
CREATE POLICY "Patients can view own waitlist entries"
  ON waitlist FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Patients can join waitlist"
  ON waitlist FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients can leave waitlist"
  ON waitlist FOR DELETE USING (auth.uid() = patient_id);
CREATE POLICY "Admins can view all waitlist entries"
  ON waitlist FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update waitlist entries (notify)"
  ON waitlist FOR UPDATE USING (public.is_admin());


-- ════════════════════════════════════════════════════════════
-- 3. SEED DATA
-- ════════════════════════════════════════════════════════════

INSERT INTO organisations (id, name, slug, address, phone, email)
VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Klinikktime Demo Klinikk',
  'klinikktime-demo',
  'Storgata 1, 0155 Oslo',
  '+47 22 00 00 00',
  'kontakt@klinikktime-demo.no'
);

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
  85000,
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
  125000,
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
  95000,
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
  150000,
  30
);

INSERT INTO availability_templates (practitioner_id, day_of_week, start_time, end_time)
SELECT p.id, d.day, '09:00'::time, '16:00'::time
FROM practitioners p
CROSS JOIN (VALUES (0),(1),(2),(3),(4)) AS d(day);

INSERT INTO availability_exceptions (practitioner_id, exception_date, reason)
VALUES (
  'b1b2c3d4-0000-0000-0000-000000000002',
  CURRENT_DATE + 14,
  'Fagdag'
);
