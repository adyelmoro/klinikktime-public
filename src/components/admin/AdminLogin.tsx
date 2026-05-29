'use client'

import { useState } from 'react'
import Image from 'next/image'

export function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        // Cookie is now set — reload so the server layout re-reads it
        window.location.reload()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Feil passord')
        setLoading(false)
      }
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
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#1A6BCC] text-white text-xs font-semibold tracking-wide uppercase">
            Admin
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
          <h1 className="text-lg font-semibold text-[#111827] mb-1">Logg inn</h1>
          <p className="text-sm text-[#6B7280] mb-6">Kun for klinikk-ansatte</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Passord
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
                className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A6BCC]/30 focus:border-[#1A6BCC] transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-[#1A6BCC] text-white font-semibold rounded-xl py-2.5 text-sm hover:bg-[#1558A8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {loading ? 'Logger inn...' : 'Logg inn'}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 pt-5 border-t border-[#F3F4F6]">
            <p className="text-xs text-[#9CA3AF] text-center">
              Demo-passord:{' '}
              <button
                type="button"
                onClick={() => setPassword('demo1234')}
                className="font-mono text-[#1A6BCC] hover:underline"
              >
                demo1234
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[#9CA3AF] mt-6">
          Klinikktime Demo · Porteføljeprosjekt
        </p>
      </div>
    </div>
  )
}
