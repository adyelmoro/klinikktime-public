'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Appointment {
  id: string
  patient_name: string
  start_time: string
  end_time: string
  appointment_date: string
  status: string
  payment_status: string
  qr_token: string
  practitioners: { name: string; specialty: string }
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  arrived:   'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  no_show:   'bg-red-100 text-red-700',
}

const STATUS_NO: Record<string, string> = {
  pending: 'Venter', confirmed: 'Bekreftet', arrived: 'Ankommet',
  completed: 'Fullført', cancelled: 'Avbestilt', no_show: 'Ikke møtt',
}

function todayLocal() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`
}

export default function AdminSchedulePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [qrInput, setQrInput] = useState('')
  const [qrMsg, setQrMsg] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const today = todayLocal()

  const fetchToday = useCallback(async () => {
    const res = await fetch(`/api/admin/appointments?date=${today}`)
    const data = await res.json()
    setAppointments(data.appointments ?? [])
    setLoading(false)
  }, [today])

  useEffect(() => {
    fetchToday()

    // Supabase Realtime — live updates for today's appointments
    const supabase = createClient()
    const channel = supabase
      .channel('admin-today')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setAppointments((prev) =>
              prev.map((a) =>
                a.id === (payload.new as Appointment).id
                  ? { ...a, ...(payload.new as Appointment) }
                  : a
              )
            )
          } else {
            // INSERT or DELETE — refetch
            fetchToday()
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchToday])

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id)
    await fetch(`/api/admin/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setUpdatingId(null)
    // Realtime will update the UI automatically
  }

  async function handleQrCheckin(e: React.FormEvent) {
    e.preventDefault()
    const token = qrInput.trim().toUpperCase()
    // Match on full token OR the first 8-char segment (what the patient modal displays)
    const appt = appointments.find((a) => {
      const t = a.qr_token?.toUpperCase() ?? ''
      return t === token || (token.length >= 6 && t.startsWith(token))
    })
    if (!appt) {
      setQrMsg('QR-kode ikke funnet for i dag')
      return
    }
    if (appt.status === 'arrived' || appt.status === 'completed') {
      setQrMsg(`${appt.patient_name} er allerede registrert ankommet`)
      return
    }
    await updateStatus(appt.id, 'arrived')
    setQrMsg(`✓ ${appt.patient_name} er sjekket inn (${appt.start_time})`)
    setQrInput('')
    setTimeout(() => setQrMsg(''), 4000)
  }

  // Stats
  const total = appointments.length
  const confirmed = appointments.filter((a) => a.status === 'confirmed').length
  const arrived = appointments.filter((a) => a.status === 'arrived').length
  const completed = appointments.filter((a) => a.status === 'completed').length

  const todayFormatted = new Date(today + 'T12:00:00').toLocaleDateString('nb-NO', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827] capitalize">{todayFormatted}</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Dagsskjema · Live oppdatering via Supabase Realtime</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Totalt i dag', value: total, color: 'text-[#111827]' },
          { label: 'Bekreftet', value: confirmed, color: 'text-[#1A6BCC]' },
          { label: 'Ankommet', value: arrived, color: 'text-purple-600' },
          { label: 'Fullført', value: completed, color: 'text-[#059669]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* QR Check-in bar */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-6">
        <p className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A6BCC" strokeWidth={2}>
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h.01M18 14h.01M14 18h.01M18 18h.01M16 16h.01" strokeLinecap="round" />
          </svg>
          QR Innsjekk
        </p>
        <form onSubmit={handleQrCheckin} className="flex gap-3 items-center">
          <input
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            placeholder="Skann eller skriv inn QR-token..."
            className="flex-1 px-3.5 py-2 border border-[#D1D5DB] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1A6BCC]/30 focus:border-[#1A6BCC]"
          />
          <button
            type="submit"
            disabled={!qrInput.trim()}
            className="px-4 py-2 bg-[#1A6BCC] text-white text-sm font-semibold rounded-lg hover:bg-[#1558A8] transition-colors disabled:opacity-50 min-h-[38px]"
          >
            Sjekk inn
          </button>
        </form>
        {qrMsg && (
          <p className={`mt-2 text-sm ${qrMsg.startsWith('✓') ? 'text-[#059669]' : 'text-red-600'}`}>
            {qrMsg}
          </p>
        )}
      </div>

      {/* Appointments table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F3F4F6]">
          <p className="font-semibold text-[#111827]">Timer i dag</p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-[#1A6BCC] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#9CA3AF] text-sm">Ingen timer i dag</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  {['Tid', 'Pasient', 'Behandler', 'Status', 'Handlinger'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3.5 font-mono text-[#374151] whitespace-nowrap">
                      {appt.start_time.slice(0, 5)}–{appt.end_time.slice(0, 5)}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-[#111827]">{appt.patient_name}</p>
                    </td>
                    <td className="px-4 py-3.5 text-[#374151]">
                      {appt.practitioners?.name}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[appt.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_NO[appt.status] ?? appt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {appt.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(appt.id, 'arrived')}
                            disabled={updatingId === appt.id}
                            className="px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                          >
                            Merk ankommet
                          </button>
                        )}
                        {appt.status === 'arrived' && (
                          <button
                            onClick={() => updateStatus(appt.id, 'completed')}
                            disabled={updatingId === appt.id}
                            className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                          >
                            Fullført
                          </button>
                        )}
                        {['confirmed', 'pending'].includes(appt.status) && (
                          <button
                            onClick={() => updateStatus(appt.id, 'no_show')}
                            disabled={updatingId === appt.id}
                            className="px-3 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            Ikke møtt
                          </button>
                        )}
                        {updatingId === appt.id && (
                          <div className="w-4 h-4 border-2 border-[#1A6BCC] border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 mt-4">
        <div className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
        <p className="text-xs text-[#9CA3AF]">Live oppdatering via Supabase Realtime</p>
      </div>
    </div>
  )
}
