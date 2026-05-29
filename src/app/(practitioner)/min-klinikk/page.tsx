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
  amount_nok: number | null
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
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}

export default function PractitionerSchedulePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const today = todayLocal()

  const fetchToday = useCallback(async () => {
    const res = await fetch(`/api/practitioner/appointments?date=${today}`)
    const data = await res.json()
    setAppointments(data.appointments ?? [])
    setLoading(false)
  }, [today])

  useEffect(() => {
    fetchToday()

    const supabase = createClient()
    const channel = supabase
      .channel('practitioner-today')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setAppointments((prev) =>
            prev.map((a) => a.id === (payload.new as Appointment).id ? { ...a, ...(payload.new as Appointment) } : a)
          )
        } else {
          fetchToday()
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchToday])

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id)
    await fetch(`/api/practitioner/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setUpdatingId(null)
  }

  const total     = appointments.length
  const confirmed = appointments.filter((a) => a.status === 'confirmed').length
  const arrived   = appointments.filter((a) => a.status === 'arrived').length
  const completed = appointments.filter((a) => a.status === 'completed').length

  const todayFormatted = new Date(today + 'T12:00:00').toLocaleDateString('nb-NO', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827] capitalize">{todayFormatted}</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Mine timer i dag · Live oppdatering via Supabase Realtime</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Totalt i dag',  value: total,     color: 'text-[#111827]' },
          { label: 'Bekreftet',     value: confirmed,  color: '#0d9463' },
          { label: 'Ankommet',      value: arrived,    color: 'text-purple-600' },
          { label: 'Fullført',      value: completed,  color: 'text-[#059669]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <p className={`text-2xl font-bold ${typeof color === 'string' && color.startsWith('#') ? '' : color}`}
               style={typeof color === 'string' && color.startsWith('#') ? { color } : {}}>
              {value}
            </p>
            <p className="text-xs text-[#6B7280] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F3F4F6]">
          <p className="font-semibold text-[#111827]">Mine timer i dag</p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#0d9463', borderTopColor: 'transparent' }} />
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
                  {['Tid', 'Pasient', 'Betaling', 'Status', 'Handlinger'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">
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
                      <p className="text-xs text-[#9CA3AF]">#{appt.id.split('-')[0].toUpperCase()}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#6B7280]">
                      {appt.payment_status === 'paid' && appt.amount_nok
                        ? <span className="text-[#059669] font-medium">{(appt.amount_nok / 100).toFixed(0)} kr</span>
                        : <span className="text-[#9CA3AF]">{appt.payment_status}</span>
                      }
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
                          <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#0d9463', borderTopColor: 'transparent' }} />
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

      <div className="flex items-center gap-2 mt-4">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#0d9463' }} />
        <p className="text-xs text-[#9CA3AF]">Live oppdatering via Supabase Realtime</p>
      </div>
    </div>
  )
}
