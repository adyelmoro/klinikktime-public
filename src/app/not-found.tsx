import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#EBF3FD] flex items-center justify-center">
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#1A6BCC" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[#111827] mb-2">404</h1>
        <h2 className="text-lg font-semibold text-[#374151] mb-3">Siden ble ikke funnet</h2>
        <p className="text-[#6B7280] text-sm mb-8 leading-relaxed">
          Siden du leter etter eksisterer ikke eller har blitt flyttet.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A6BCC] text-white text-sm font-semibold rounded-xl hover:bg-[#1558A8] transition-colors"
        >
          ← Tilbake til forsiden
        </Link>
      </div>
    </div>
  )
}
