-- Klinikktime v1 Schema
-- Run this in Supabase SQL Editor (in order)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── organisations ──────────────────────────────────────────────────────────
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

-- ─── profiles ────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id                 uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name          text,
  phone              text,
  date_of_birth      date,
  preferred_language text DEFAULT 'no',
  created_at         timestamptz DEFAULT now()
);

-- Auto-create profile on user signup
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

-- ─── admin_users ─────────────────────────────────────────────────────────────
CREATE TABLE admin_users (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organisation_id uuid REFERENCES organisations(id),
  role            text DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at      timestamptz DEFAULT now()
);

-- ─── practitioners ───────────────────────────────────────────────────────────
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

-- ─── availability_templates ──────────────────────────────────────────────────
CREATE TABLE availability_templates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid REFERENCES practitioners(id) ON DELETE CASCADE,
  day_of_week     int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Mon, 6=Sun
  start_time      time NOT NULL,
  end_time        time NOT NULL,
  is_active       bool DEFAULT true
);

-- ─── availability_exceptions ─────────────────────────────────────────────────
CREATE TABLE availability_exceptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid REFERENCES practitioners(id) ON DELETE CASCADE,
  exception_date  date NOT NULL,
  reason          text
);

-- ─── appointments ────────────────────────────────────────────────────────────
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

-- ─── waitlist ────────────────────────────────────────────────────────────────
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
