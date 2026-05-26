-- Klinikktime v1 — Row Level Security Policies
-- Run AFTER 001_schema.sql

-- Enable RLS on all tables
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- ─── Helper function: is current user an admin/staff? ────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ─── organisations ───────────────────────────────────────────────────────────
CREATE POLICY "Public can view organisations"
  ON organisations FOR SELECT USING (true);

CREATE POLICY "Admins can update organisations"
  ON organisations FOR UPDATE USING (public.is_admin());

-- ─── profiles ────────────────────────────────────────────────────────────────
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT USING (public.is_admin());

-- ─── admin_users ─────────────────────────────────────────────────────────────
CREATE POLICY "Admins can view own admin record"
  ON admin_users FOR SELECT USING (auth.uid() = id);

-- ─── practitioners ───────────────────────────────────────────────────────────
CREATE POLICY "Public can view active practitioners"
  ON practitioners FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can do everything with practitioners"
  ON practitioners FOR ALL USING (public.is_admin());

-- ─── availability_templates ──────────────────────────────────────────────────
CREATE POLICY "Public can view availability templates"
  ON availability_templates FOR SELECT USING (true);

CREATE POLICY "Admins can manage availability templates"
  ON availability_templates FOR ALL USING (public.is_admin());

-- ─── availability_exceptions ─────────────────────────────────────────────────
CREATE POLICY "Public can view availability exceptions"
  ON availability_exceptions FOR SELECT USING (true);

CREATE POLICY "Admins can manage availability exceptions"
  ON availability_exceptions FOR ALL USING (public.is_admin());

-- ─── appointments ────────────────────────────────────────────────────────────
CREATE POLICY "Patients can view own appointments"
  ON appointments FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert own appointments"
  ON appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update own appointments"
  ON appointments FOR UPDATE USING (auth.uid() = patient_id);

CREATE POLICY "Admins can do everything with appointments"
  ON appointments FOR ALL USING (public.is_admin());

-- Allow service role to insert appointments (for Vipps callback route)
CREATE POLICY "Service role can insert appointments"
  ON appointments FOR INSERT WITH CHECK (true);

-- ─── waitlist ────────────────────────────────────────────────────────────────
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
