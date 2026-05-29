'use client'

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell,
} from 'recharts'

interface AnalyticsData {
  totalThisMonth: number
  revenueThisMonth: number
  avgPerDay: number
  bookingsPerDay: { date: string; count: number }[]
  statusBreakdown: { name: string; value: number }[]
}

const PRIMARY = '#0d9463'

const STATUS_NO: Record<string, string> = {
  pending: 'Venter', confirmed: 'Bekreftet', arrived: 'Ankommet',
  completed: 'Fullført', cancelled: 'Avbestilt', no_show: 'Ikke møtt',
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#1A6BCC', arrived: '#7C3AED', completed: '#0d9463',
  pending: '#D97706', cancelled: '#9CA3AF', no_show: '#DC2626',
}

export default function PractitionerAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/practitioner/analytics')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: PRIMARY, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!data) return <div className="p-8 text-[#6B7280]">Kunne ikke laste statistikk</div>

  const statusData = (data.statusBreakdown ?? []).map((s) => ({
    ...s,
    name: STATUS_NO[s.name] ?? s.name,
    fill: STATUS_COLORS[s.name] ?? PRIMARY,
  }))

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Min analyse</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Siste 30 dager · kun mine timer</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: 'Timer denne måneden',
            value: data.totalThisMonth,
            sub: 'bestillinger',
            icon: (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={PRIMARY}>
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
              </svg>
            ),
          },
          {
            label: 'Inntekt denne måneden',
            value: `${data.revenueThisMonth.toLocaleString('nb-NO')} kr`,
            sub: 'betalt via Vipps',
            icon: (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={PRIMARY}>
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" />
              </svg>
            ),
          },
          {
            label: 'Snitt per dag',
            value: data.avgPerDay,
            sub: 'timer per dag',
            icon: (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={PRIMARY}>
                <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
              </svg>
            ),
          },
        ].map(({ label, value, sub, icon }) => (
          <div key={label} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="w-9 h-9 rounded-lg bg-[#F5F7FA] flex items-center justify-center mb-3">
              {icon}
            </div>
            <p className="text-2xl font-bold" style={{ color: PRIMARY }}>{value}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{label}</p>
            <p className="text-xs text-[#C4C9D4] mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Line chart */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 mb-6">
        <h2 className="font-semibold text-[#111827] mb-4">Timer per dag (siste 30 dager)</h2>
        {data.bookingsPerDay.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] text-[#9CA3AF] text-sm">Ingen data</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.bookingsPerDay} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
              <Line type="monotone" dataKey="count" name="Timer" stroke={PRIMARY} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Status breakdown bar chart */}
      {statusData.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h2 className="font-semibold text-[#111827] mb-4">Fordeling etter status</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={statusData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} cursor={{ fill: '#F5F7FA' }} />
              <Bar dataKey="value" name="Timer" radius={[4, 4, 0, 0]}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
