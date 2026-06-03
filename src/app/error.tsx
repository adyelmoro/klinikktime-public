'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-50 flex items-center justify-center">
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-[#111827] mb-2">Noe gikk galt</h1>
        <p className="text-[#6B7280] text-sm mb-8 leading-relaxed">
          En uventet feil oppstod. Vi beklager ulempene.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#1A6BCC] text-white text-sm font-semibold rounded-xl hover:bg-[#1558A8] transition-colors"
          >
            Prøv igjen
          </button>
          <a
            href="/"
            className="px-6 py-3 border border-[#E5E7EB] text-[#374151] text-sm font-semibold rounded-xl hover:bg-[#F5F7FA] transition-colors"
          >
            Tilbake til forsiden
          </a>
        </div>
      </div>
    </div>
  )
}
