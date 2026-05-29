import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

async function isAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get('klinikktime_admin')?.value === 'authenticated'
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'Mangler e-post eller passord' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Passord må være minst 8 tegn' }, { status: 400 })
  }

  const admin = adminClient()

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // Link auth user to practitioner row
  const supabase = createServiceClient()
  const { error: updateError } = await (supabase as any)
    .from('practitioners')
    .update({ user_id: authData.user.id })
    .eq('id', id)

  if (updateError) {
    // Rollback: delete the created auth user
    await admin.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, userId: authData.user.id })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  const { data: pract } = await (supabase as any)
    .from('practitioners')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!pract?.user_id) return NextResponse.json({ error: 'Ingen konto funnet' }, { status: 404 })

  // Remove link first
  await (supabase as any)
    .from('practitioners')
    .update({ user_id: null })
    .eq('id', id)

  // Delete the auth user
  const admin = adminClient()
  await admin.auth.admin.deleteUser(pract.user_id)

  return NextResponse.json({ success: true })
}
