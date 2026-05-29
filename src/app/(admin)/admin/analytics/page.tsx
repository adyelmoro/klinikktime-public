'use client'

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts'

interface AnalyticsData {
  totalThisMonth: number
  revenueThisMonth: number
  bookingsPerDay: { date: string; count: number }[]
  specialtyBreakdown: { name: string; value: number }[]
  practitionerBookings: { name: string; count: number }[]
  todaySummary: { total: number; confirmed: number; arrived: number; completed: number }
  activePractitioners: number
}

const SPECIALTY_COLORS: Record<string, string> = {
  physio: '#1A6BCC', psychology: '#7C3AED', sports_medicine: '#059669',
  nutritionist: '#D97706', private_gp: '#DC2626',
}
const PIE_COLORS = ['#1A6BCC', '#7C3AED', '#059669', '#D97706', '#DC2626']

const SPECIALTY_NO: Record<string, string> = {
  physio: 'Fysioterapi', psychology: 'Psykologi', sports_medicine: 'Idrettsmedisin',
  nutritionist: 'Ernæring', private_gp: 'Fastlege',
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#1A6BCC] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return <div className="p-8 text-[#6B7280]">Kunne ikke laste statistikk</div>

  const avgPerDay = data.bookingsPerDay.length > 0
    ? (data.bookingsPerDay.reduce((s, d) => s + d.count, 0) / data.bookingsPerDay.length).toFixed(1)
    : '0'

  const specialtyData = data.specialtyBreakdown.map((s) => ({
    ...s,
    name: SPECIALTY_NO[s.name] ?? s.name,
  }))

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Analyse</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Siste 30 dager</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Timer denne måneden',
            value: data.totalThisMonth,
            sub: 'bestillinger',
            color: 'text-[#1A6BCC]',
            icon: (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#1A6BCC" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
              </svg>
            ),
          },
          {
            label: 'Inntekt denne måneden',
            value: `${data.revenueThisMonth.toLocaleString('nb-NO')} kr`,
            sub: 'betalt via Vipps',
            color: 'text-[#059669]',
            icon: (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M12 6v6l4 2" strokeLinecap="round" />
              </svg>
            ),
          },
          {
            label: 'Snitt per dag',
            value: avgPerDay,
            sub: 'timer per dag',
            color: 'text-[#7C3AED]',
            icon: (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#7C3AED" strokeWidth={2}>
                <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
              </svg>
            ),
          },
          {
            label: 'Aktive behandlere',
            value: data.activePractitioners,
            sub: 'i systemet',
            color: 'text-[#D97706]',
            icon: (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#D97706" strokeWidth={2}>
                <circle cx="12" cy="8" r="3" /><path d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" strokeLinecap="round" />
              </svg>
            ),
          },
        ].map(({ label, value, sub, color, icon }) => (
          <div key={label} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#F5F7FA] flex items-center justify-center">
                {icon}
              </div>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{label}</p>
            <p className="text-xs text-[#C4C9D4] mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1: Line + Pie */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Bookings per day */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h2 className="font-semibold text-[#111827] mb-4">Timer per dag (siste 30 dager)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.bookingsPerDay} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                labelStyle={{ color: '#374151', fontWeight: 600 }}
              />
              <Line type="monotone" dataKey="count" name="Timer" stroke="#1A6BCC" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Specialty breakdown */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h2 className="font-semibold text-[#111827] mb-4">Fordeling per spesialitet</h2>
          {specialtyData.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-[#9CA3AF] text-sm">Ingen data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={specialtyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {specialtyData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Practitioner bar chart */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
        <h2 className="font-semibold text-[#111827] mb-4">Timer per behandler (siste 30 dager)</h2>
        {data.practitionerBookings.length === 0 ? (
          <div className="flex items-center justify-center h-[180px] text-[#9CA3AF] text-sm">Ingen data</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.practitionerBookings} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                cursor={{ fill: '#F5F7FA' }}
              />
              <Bar dataKey="count" name="Timer" fill="#1A6BCC" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
