'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export function PractitionerLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError('Feil e-post eller passord')
        setLoading(false)
        return
      }
      window.location.reload()
    } catch {
      setError('Noe gikk galt')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <Image src="/icons/logo.svg" alt="Klinikktime" width={36} height={36} />
            <span className="text-xl font-bold text-[#111827]">Klinikktime</span>
          </div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-white text-xs font-semibold tracking-wide uppercase" style={{ backgroundColor: '#0d9463' }}>
            Behandler
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
          <h1 className="text-lg font-semibold text-[#111827] mb-1">Logg inn</h1>
          <p className="text-sm text-[#6B7280] mb-6">Behandlerportalen · kun for klinikkansatte</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">E-post</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="behandler@klinikktime.no"
                autoFocus
                className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-[#0d9463] transition-colors"
                style={{ '--tw-ring-color': '#0d9463' } as React.CSSProperties}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Passord</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-[#0d9463] transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full text-white font-semibold rounded-xl py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              style={{ backgroundColor: loading || !email || !password ? undefined : '#0d9463' }}
              onMouseEnter={(e) => { if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = '#0b7d52' }}
              onMouseLeave={(e) => { if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = '#0d9463' }}
            >
              {loading ? 'Logger inn...' : 'Logg inn'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#9CA3AF] mt-6">
          Klinikktime Demo · Kun for behandlere
        </p>
      </div>
    </div>
  )
}
