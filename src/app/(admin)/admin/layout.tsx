import { cookies } from 'next/headers'
import { AdminLogin } from '@/components/admin/AdminLogin'
import { AdminShell } from '@/components/admin/AdminShell'

export const metadata = { title: 'Admin | Klinikktime' }

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('klinikktime_admin')?.value === 'authenticated'

  if (!isAuthenticated) {
    // AdminLogin calls window.location.reload() on success so the server
    // re-reads the cookie and renders the shell on next load
    return <AdminLogin />
  }

  return <AdminShell>{children}</AdminShell>
}
