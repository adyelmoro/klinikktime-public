// Supabase generated types + domain types for Klinikktime
// Re-generate after schema changes: npx supabase gen types typescript --project-id <id>

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type SpecialtyType = 'physio' | 'psychology' | 'sports_medicine' | 'nutritionist' | 'private_gp'
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'arrived'
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'

export interface Database {
  public: {
    Tables: {
      organisations: {
        Row: {
          id: string
          name: string
          slug: string
          address: string | null
          phone: string | null
          email: string | null
          logo_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['organisations']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['organisations']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          date_of_birth: string | null
          preferred_language: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      admin_users: {
        Row: {
          id: string
          organisation_id: string | null
          role: 'admin' | 'staff'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['admin_users']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['admin_users']['Insert']>
      }
      practitioners: {
        Row: {
          id: string
          organisation_id: string
          name: string
          specialty: SpecialtyType
          bio_no: string | null
          bio_en: string | null
          photo_url: string | null
          languages: string[]
          slot_duration_minutes: number
          consultation_fee_nok: number | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['practitioners']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['practitioners']['Insert']>
      }
      availability_templates: {
        Row: {
          id: string
          practitioner_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_active: boolean
        }
        Insert: Omit<Database['public']['Tables']['availability_templates']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['availability_templates']['Insert']>
      }
      availability_exceptions: {
        Row: {
          id: string
          practitioner_id: string
          exception_date: string
          reason: string | null
        }
        Insert: Omit<Database['public']['Tables']['availability_exceptions']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['availability_exceptions']['Insert']>
      }
      appointments: {
        Row: {
          id: string
          organisation_id: string
          practitioner_id: string
          patient_id: string
          patient_name: string
          patient_email: string
          patient_phone: string | null
          appointment_date: string
          start_time: string
          end_time: string
          status: AppointmentStatus
          reason: string | null
          vipps_order_id: string | null
          payment_status: PaymentStatus
          amount_nok: number | null
          admin_notes: string | null
          qr_token: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'qr_token' | 'created_at'> & { id?: string; qr_token?: string }
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>
      }
      waitlist: {
        Row: {
          id: string
          practitioner_id: string
          patient_id: string
          patient_name: string
          patient_email: string
          patient_phone: string | null
          preferred_date: string | null
          preferred_time_of_day: 'morning' | 'afternoon' | 'any'
          notified_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['waitlist']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['waitlist']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      specialty_type: SpecialtyType
      appointment_status: AppointmentStatus
      payment_status: PaymentStatus
    }
  }
}

// Convenience types with joined relations
export type Practitioner = Database['public']['Tables']['practitioners']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type Organisation = Database['public']['Tables']['organisations']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type WaitlistEntry = Database['public']['Tables']['waitlist']['Row']
export type AvailabilityTemplate = Database['public']['Tables']['availability_templates']['Row']
export type AvailabilityException = Database['public']['Tables']['availability_exceptions']['Row']

export interface TimeSlot {
  startTime: string  // HH:MM
  endTime: string    // HH:MM
  available: boolean
}

export interface PractitionerWithSlots extends Practitioner {
  slots?: TimeSlot[]
}

export interface AppointmentWithPractitioner extends Appointment {
  practitioners: Pick<Practitioner, 'name' | 'specialty' | 'photo_url'>
}
