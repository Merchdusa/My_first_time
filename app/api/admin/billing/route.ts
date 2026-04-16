import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { calculateBilling } from '@/lib/billing'
import type { Member } from '@/lib/types'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const groupSlug = searchParams.get('group')

  if (!groupSlug) return NextResponse.json({ error: 'Chybí skupina' }, { status: 400 })

  const db = createServerClient()

  const { data: group } = await db.from('groups').select('*').eq('slug', groupSlug).single()
  if (!group) return NextResponse.json({ error: 'Skupina nenalezena' }, { status: 404 })

  const { data: members } = await db
    .from('members')
    .select('*')
    .eq('group_id', group.id)
    .eq('active', true)
    .order('name')

  if (!members) return NextResponse.json({ billing: [] })

  // Count visits per member (all time)
  const billing = await Promise.all(
    members.map(async (member: Member) => {
      const { count } = await db
        .from('visits')
        .select('id', { count: 'exact', head: true })
        .eq('member_id', member.id)
      return calculateBilling(member, count ?? 0)
    })
  )

  return NextResponse.json({ billing })
}
