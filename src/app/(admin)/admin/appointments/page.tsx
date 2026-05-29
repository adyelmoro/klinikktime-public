'use client'

import { useEffect, useState, useCallback } from 'react'

interface Appointment {
  id: string
  patient_name: string
  patient_email: string
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  payment_status: string
  amount_nok: number | null
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

const PAYMENT_COLORS: Record<string, string> = {
  pending: 'text-yellow-600', paid: 'text-green-600',
  refunded: 'text-blue-600', failed: 'text-red-600',
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterDate) params.set('date', filterDate)
    if (filterStatus) params.set('status', filterStatus)
    const res = await fetch(`/api/admin/appointments?${params}`)
    const data = await res.json()
    setAppointments(data.appointments ?? [])
    setLoading(false)
  }, [filterDate, filterStatus])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  const filtered = appointments.filter((a) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      a.patient_name.toLowerCase().includes(q) ||
      a.patient_email.toLowerCase().includes(q) ||
      a.practitioners?.name?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Alle timer</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">{filtered.length} timer vist</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Søk pasient, behandler..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-3.5 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A6BCC]/30 focus:border-[#1A6BCC]"
          />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3.5 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A6BCC]/30 focus:border-[#1A6BCC]"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A6BCC]/30 focus:border-[#1A6BCC] bg-white"
          >
            <option value="">Alle statuser</option>
            {Object.entries(STATUS_NO).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          {(filterDate || filterStatus || search) && (
            <button
              onClick={() => { setFilterDate(''); setFilterStatus(''); setSearch('') }}
              className="px-3.5 py-2 text-sm text-[#6B7280] border border-[#D1D5DB] rounded-lg hover:bg-[#F5F7FA] transition-colors"
            >
              Nullstill
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-6 h-6 border-2 border-[#1A6BCC] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[#9CA3AF]">Ingen timer funnet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  {['Dato', 'Tid', 'Pasient', 'Behandler', 'Status', 'Betaling'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {filtered.map((appt) => (
                  <tr key={appt.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3.5 text-[#374151] whitespace-nowrap">
                      {new Date(appt.appointment_date + 'T12:00:00').toLocaleDateString('nb-NO', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[#374151] whitespace-nowrap">
                      {appt.start_time.slice(0, 5)}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-[#111827]">{appt.patient_name}</p>
                      <p className="text-xs text-[#9CA3AF]">{appt.patient_email}</p>
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
                      <p className={`text-xs font-semibold ${PAYMENT_COLORS[appt.payment_status] ?? 'text-gray-500'}`}>
                        {appt.payment_status === 'paid' && appt.amount_nok
                          ? `${(appt.amount_nok / 100).toFixed(0)} kr`
                          : appt.payment_status}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
