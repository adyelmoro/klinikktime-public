'use client'

import { useEffect, useState } from 'react'

interface Practitioner {
  id: string
  name: string
  specialty: string
  user_id: string | null
  is_active: boolean
}

const SPECIALTY_NO: Record<string, string> = {
  physio: 'Fysioterapi', psychology: 'Psykologi', sports_medicine: 'Idrettsmedisin',
  nutritionist: 'Ernæring', private_gp: 'Fastlege',
}

export default function AdminPractitionersPage() {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [loading, setLoading] = useState(true)
  const [activeForm, setActiveForm] = useState<string | null>(null)
  const [form, setForm] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null)

  useEffect(() => {
    fetch('/api/admin/practitioners')
      .then((r) => r.json())
      .then((d) => { setPractitioners(d.practitioners ?? []); setLoading(false) })
  }, [])

  function openForm(id: string) {
    setActiveForm(id)
    setForm({ email: '', password: '' })
    setMsg(null)
  }

  async function handleCreate(e: React.FormEvent, practId: string) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)

    const res = await fetch(`/api/admin/practitioners/${practId}/create-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (res.ok) {
      setPractitioners((prev) => prev.map((p) => p.id === practId ? { ...p, user_id: data.userId } : p))
      setMsg({ id: practId, text: '✓ Konto opprettet! Behandleren kan nå logge inn på /min-klinikk', ok: true })
      setActiveForm(null)
    } else {
      setMsg({ id: practId, text: data.error ?? 'Feil ved opprettelse', ok: false })
    }
    setBusy(false)
  }

  async function handleRemove(practId: string, name: string) {
    if (!confirm(`Fjern portaltilgang for ${name}? De kan ikke lenger logge inn.`)) return
    const res = await fetch(`/api/admin/practitioners/${practId}/create-account`, { method: 'DELETE' })
    if (res.ok) {
      setPractitioners((prev) => prev.map((p) => p.id === practId ? { ...p, user_id: null } : p))
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Behandlerkontoer</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          Opprett portal-tilgang for behandlere · de logger inn på{' '}
          <span className="font-mono text-[#1A6BCC]">/min-klinikk</span>
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#1A6BCC] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {practitioners.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EBF3FD] flex items-center justify-center text-sm font-bold text-[#1A6BCC] flex-shrink-0">
                    {p.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#111827]">{p.name}</h3>
                      {p.user_id ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                          Aktiv konto
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">
                          Ingen konto
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#6B7280]">{SPECIALTY_NO[p.specialty] ?? p.specialty}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {p.user_id ? (
                    <button
                      onClick={() => handleRemove(p.id, p.name)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg"
                    >
                      Fjern tilgang
                    </button>
                  ) : (
                    <button
                      onClick={() => openForm(activeForm === p.id ? null : p.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#1A6BCC] text-white hover:bg-[#1558A8] transition-colors"
                    >
                      {activeForm === p.id ? 'Avbryt' : 'Opprett konto'}
                    </button>
                  )}
                </div>
              </div>

              {/* Create account form */}
              {activeForm === p.id && !p.user_id && (
                <form
                  onSubmit={(e) => handleCreate(e, p.id)}
                  className="mt-2 pt-4 border-t border-[#F3F4F6] flex flex-wrap gap-3 items-end"
                >
                  <div>
                    <label className="block text-xs font-medium text-[#6B7280] mb-1">E-post til behandleren</label>
                    <input
                      type="email"
                      required
                      placeholder="lars.eriksen@klinikktime.no"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A6BCC]/30 focus:border-[#1A6BCC] min-w-[240px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6B7280] mb-1">Midlertidig passord</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="Minst 8 tegn"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      className="px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A6BCC]/30 focus:border-[#1A6BCC]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={busy || !form.email || form.password.length < 8}
                    className="px-4 py-2 bg-[#1A6BCC] text-white text-sm font-semibold rounded-lg hover:bg-[#1558A8] transition-colors disabled:opacity-50 min-h-[38px]"
                  >
                    {busy ? 'Oppretter...' : 'Opprett'}
                  </button>
                </form>
              )}

              {/* Feedback message */}
              {msg?.id === p.id && (
                <p className={`mt-3 text-sm px-3 py-2 rounded-lg ${msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  {msg.text}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
