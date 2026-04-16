import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Add a visit manually (admin correction)
export async function POST(req: NextRequest) {
  const { pin, sessionId, memberId } = await req.json()

  if (pin !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: 'Špatný PIN' }, { status: 403 })
  }

  const db = createServerClient()
  const { error } = await db
    .from('visits')
    .upsert({ session_id: sessionId, member_id: memberId }, { onConflict: 'session_id,member_id' })

  if (error) return NextResponse.json({ error: 'Chyba uložení' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// Remove a visit (admin correction)
export async function DELETE(req: NextRequest) {
  const { pin, sessionId, memberId } = await req.json()

  if (pin !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: 'Špatný PIN' }, { status: 403 })
  }

  const db = createServerClient()
  const { error } = await db
    .from('visits')
    .delete()
    .eq('session_id', sessionId)
    .eq('member_id', memberId)

  if (error) return NextResponse.json({ error: 'Chyba mazání' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
