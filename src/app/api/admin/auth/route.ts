import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'demo1234'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { password } = body as { password?: string }

  if (!password || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Feil passord' }, { status: 401 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set('klinikktime_admin', 'authenticated', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete('klinikktime_admin')
  return res
}
