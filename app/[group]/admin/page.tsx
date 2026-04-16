import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { calculateBilling } from '@/lib/billing'
import AdminClient from './AdminClient'
import type { Member } from '@/lib/types'

export default async function AdminPage({ params }: { params: Promise<{ group: string }> }) {
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

  // Last 8 sessions
  const { data: sessions } = await db
    .from('sessions')
    .select('*')
    .eq('group_id', group.id)
    .order('date', { ascending: false })
    .limit(8)

  // Visits per session
  const sessionsWithVisits = await Promise.all(
    (sessions ?? []).map(async (s) => {
      const { data: visits } = await db
        .from('visits')
        .select('*, member:members(name)')
        .eq('session_id', s.id)
      return { ...s, visits: visits ?? [] }
    })
  )

  // Billing for all members
  const billing = await Promise.all(
    (members ?? []).map(async (member: Member) => {
      const { count } = await db
        .from('visits')
        .select('id', { count: 'exact', head: true })
        .eq('member_id', member.id)
      return calculateBilling(member, count ?? 0)
    })
  )

  return (
    <AdminClient
      group={group}
      members={members ?? []}
      sessions={sessionsWithVisits}
      billing={billing}
    />
  )
}
