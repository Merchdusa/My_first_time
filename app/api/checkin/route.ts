import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { toDateString, getThisWeekSessionDate } from '@/lib/billing'

export async function POST(req: NextRequest) {
  const { groupSlug, memberId } = await req.json()

  if (!groupSlug || !memberId) {
    return NextResponse.json({ error: 'Chybí parametry' }, { status: 400 })
  }

  const db = createServerClient()

  const { data: group } = await db.from('groups').select('*').eq('slug', groupSlug).single()
  if (!group) return NextResponse.json({ error: 'Skupina nenalezena' }, { status: 404 })

  const sessionDate = toDateString(getThisWeekSessionDate(group.visit_day))

  // Get or create today's session
  const { data: existing } = await db
    .from('sessions')
    .select('*')
    .eq('group_id', group.id)
    .eq('date', sessionDate)
    .single()

  let sessionId: string
  if (existing) {
    sessionId = existing.id
  } else {
    const { data: newSession, error } = await db
      .from('sessions')
      .insert({ group_id: group.id, date: sessionDate })
      .select()
      .single()
    if (error || !newSession) return NextResponse.json({ error: 'Chyba databáze' }, { status: 500 })
    sessionId = newSession.id
  }

  // Upsert visit (idempotent - double tap does nothing)
  const { error } = await db
    .from('visits')
    .upsert({ session_id: sessionId, member_id: memberId }, { onConflict: 'session_id,member_id' })

  if (error) return NextResponse.json({ error: 'Chyba uložení' }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { groupSlug, memberId, sessionId } = await req.json()

  const db = createServerClient()
  const { error } = await db
    .from('visits')
    .delete()
    .eq('session_id', sessionId)
    .eq('member_id', memberId)

  if (error) return NextResponse.json({ error: 'Chyba mazání' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
