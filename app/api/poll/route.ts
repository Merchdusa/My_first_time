import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { toDateString, getThisWeekSessionDate } from '@/lib/billing'

export async function POST(req: NextRequest) {
  const { groupSlug, memberId, coming } = await req.json()

  if (!groupSlug || !memberId || coming === undefined) {
    return NextResponse.json({ error: 'Chybí parametry' }, { status: 400 })
  }

  const db = createServerClient()

  // Get group
  const { data: group } = await db
    .from('groups')
    .select('*')
    .eq('slug', groupSlug)
    .single()

  if (!group) return NextResponse.json({ error: 'Skupina nenalezena' }, { status: 404 })

  // Get or create session for this week
  const sessionDate = toDateString(getThisWeekSessionDate(group.visit_day))

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

  // Upsert poll response
  const { error: pollError } = await db.from('poll_responses').upsert(
    { session_id: sessionId, member_id: memberId, coming, updated_at: new Date().toISOString() },
    { onConflict: 'session_id,member_id' }
  )

  if (pollError) return NextResponse.json({ error: 'Chyba uložení' }, { status: 500 })

  // Check if we hit 6+ coming → send SMS if not yet sent
  if (coming) {
    const { count } = await db
      .from('poll_responses')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .eq('coming', true)

    const { data: session } = await db.from('sessions').select('sms_sent').eq('id', sessionId).single()

    if ((count ?? 0) >= 6 && session && !session.sms_sent && group.manager_phone) {
      await sendSmsToManager(group.manager_phone, group.name, sessionDate, count ?? 6)
      await db.from('sessions').update({ sms_sent: true }).eq('id', sessionId)
    }
  }

  return NextResponse.json({ ok: true, sessionId })
}

async function sendSmsToManager(phone: string, groupName: string, date: string, count: number) {
  if (!process.env.TWILIO_ACCOUNT_SID) return

  const { default: twilio } = await import('twilio')
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  const d = new Date(date).toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })

  await client.messages.create({
    body: `Sauna ${groupName}: ${count} lidí potvrdilo příchod na ${d}. Prosím zapněte saunu. Děkujeme!`,
    from: process.env.TWILIO_FROM_PHONE!,
    to: phone,
  })
}
