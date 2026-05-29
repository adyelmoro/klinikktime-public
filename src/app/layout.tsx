import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/i18n/context'

export const metadata: Metadata = {
  title: {
    default: 'Klinikktime — Timebestilling for privatklinikker',
    template: '%s | Klinikktime',
  },
  description: 'Book time hos private behandlere i Norge. Fysioterapi, psykologi, idrettsmedisin og mer. Betal med Vipps.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
  icons: {
    icon: { url: '/favicon.svg', type: 'image/svg+xml' },
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    siteName: 'Klinikktime',
    type: 'website',
    locale: 'nb_NO',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-text-primary">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
