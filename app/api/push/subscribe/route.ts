import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { memberId, subscription } = await req.json()

  if (!memberId || !subscription) {
    return NextResponse.json({ error: 'Chybí parametry' }, { status: 400 })
  }

  const db = createServerClient()
  const { error } = await db
    .from('push_subscriptions')
    .upsert({ member_id: memberId, subscription }, { onConflict: 'member_id' })

  if (error) return NextResponse.json({ error: 'Chyba uložení' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
