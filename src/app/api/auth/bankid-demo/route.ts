import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Server-side BankID demo auth helper.
 *
 * Uses the service role admin client to find-or-create a Supabase user
 * with the email already confirmed, so signInWithPassword always works
 * from any browser session (including incognito / second device).
 *
 * Without this, Supabase blocks signInWithPassword for unconfirmed emails,
 * causing the client to fall through to signInAnonymously() and creating
 * a different user ID each time — losing all appointments.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { email, password, fullName } = body as {
    email?: string
    password?: string
    fullName?: string
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
  }

  // Admin client — uses supabase-js directly so auth.admin is available
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // 1. Try to create the user with email already confirmed
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName ?? 'Demo Bruker' },
  })

  if (created?.user) {
    return NextResponse.json({ userId: created.user.id })
  }

  // 2. User likely already exists (duplicate email error) — find them
  //    For a demo app with few users, listing all is fine
  const { data: listData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const existing = listData?.users?.find((u) => u.email === email)

  if (existing) {
    // Confirm email if it somehow isn't confirmed yet
    if (!existing.email_confirmed_at) {
      await admin.auth.admin.updateUserById(existing.id, { email_confirm: true })
    }
    return NextResponse.json({ userId: existing.id })
  }

  console.error('bankid-demo: could not create or find user', createError)
  return NextResponse.json({ error: 'Could not find or create demo user' }, { status: 500 })
}
