import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import webpush from 'web-push'
import { toDateString, getThisWeekSessionDate } from '@/lib/billing'

// Called by Vercel Cron every Wednesday and Thursday morning
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  const db = createServerClient()
  const today = new Date().getDay() // 3=Wednesday, 4=Thursday

  // Find groups whose poll_day is today
  const { data: groups } = await db.from('groups').select('*').eq('poll_day', today)
  if (!groups || groups.length === 0) return NextResponse.json({ ok: true, sent: 0 })

  let totalSent = 0

  for (const group of groups) {
    const sessionDate = toDateString(getThisWeekSessionDate(group.visit_day))
    const d = new Date(sessionDate).toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })

    // Get all active members with push subscriptions
    const { data: members } = await db
      .from('members')
      .select('id, push_subscriptions(subscription)')
      .eq('group_id', group.id)
      .eq('active', true)

    for (const member of members ?? []) {
      const subs = (member as any).push_subscriptions
      if (!subs || subs.length === 0) continue

      try {
        await webpush.sendNotification(
          subs[0].subscription,
          JSON.stringify({
            title: `Zítra sauna — ${group.name}`,
            body: `${d} — Přijdeš? Otevři appku a hlasuj!`,
            url: `/${group.slug}`,
          })
        )
        totalSent++
      } catch {
        // Subscription expired — remove it
        await db.from('push_subscriptions').delete().eq('member_id', member.id)
      }
    }
  }

  return NextResponse.json({ ok: true, sent: totalSent })
}
