import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { getThisWeekSessionDate, toDateString } from '@/lib/billing'
import CheckinClient from './CheckinClient'

export default async function CheckinPage({ params }: { params: Promise<{ group: string }> }) {
  const { group: groupSlug } = await params
  const db = createServerClient()

  const { data: group } = await db.from('groups').select('*').eq('slug', groupSlug).single()
  if (!group) notFound()

  const { data: members } = await db
    .from('members')
    .select('*')
    .eq('group_id', group.id)
    .eq('active', true)
    .order('name')

  const sessionDate = toDateString(getThisWeekSessionDate(group.visit_day))

  let { data: session } = await db
    .from('sessions')
    .select('*')
    .eq('group_id', group.id)
    .eq('date', sessionDate)
    .single()

  if (!session) {
    const { data: newSession } = await db
      .from('sessions')
      .insert({ group_id: group.id, date: sessionDate })
      .select()
      .single()
    session = newSession
  }

  const { data: visits } = session
    ? await db.from('visits').select('*').eq('session_id', session.id)
    : { data: [] }

  return (
    <CheckinClient
      group={group}
      members={members ?? []}
      session={session}
      existingVisits={visits ?? []}
    />
  )
}
