'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/billing'
import type { Group, Member, Session, Visit } from '@/lib/types'

type Props = {
  group: Group
  members: Member[]
  session: Session | null
  existingVisits: Visit[]
}

export default function CheckinClient({ group, members, session, existingVisits }: Props) {
  const [visits, setVisits] = useState<Set<string>>(new Set(existingVisits.map((v) => v.member_id)))
  const [loading, setLoading] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<string | null>(null)

  async function toggleCheckin(memberId: string) {
    if (!session || loading) return
    setLoading(memberId)

    const alreadyIn = visits.has(memberId)

    if (alreadyIn) {
      const res = await fetch('/api/checkin', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupSlug: group.slug, memberId, sessionId: session.id }),
      })
      if (res.ok) {
        setVisits((prev) => { const s = new Set(prev); s.delete(memberId); return s })
        setLastChecked(null)
      }
    } else {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupSlug: group.slug, memberId }),
      })
      if (res.ok) {
        setVisits((prev) => new Set([...prev, memberId]))
        setLastChecked(memberId)
        // Save to localStorage so the poll page knows who this is
        localStorage.setItem(`sauna_member_${group.slug}`, memberId)
      }
    }

    setLoading(null)
  }

  const dateLabel = session ? formatDate(session.date) : '—'

  return (
    <main className="flex flex-col flex-1 px-4 py-6 max-w-md mx-auto w-full gap-6">
      <div>
        <Link href={`/${group.slug}`} className="text-cyan-600 text-sm">← Zpět</Link>
        <h1 className="text-2xl font-bold text-cyan-800 mt-1">Příchod do sauny</h1>
        <p className="text-cyan-600 capitalize">{dateLabel}</p>
      </div>

      {/* Success flash */}
      {lastChecked && (
        <div className="bg-green-100 text-green-800 rounded-2xl p-4 text-center font-semibold text-lg">
          ✅ {members.find(m => m.id === lastChecked)?.name} — návštěva zapsána!
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-cyan-700 mb-1 uppercase tracking-wide">
          Klepněte na své jméno
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Dnes zapsáno: <strong>{visits.size}</strong> návštěv
        </p>

        <div className="flex flex-col gap-3">
          {members.map((m) => {
            const checked = visits.has(m.id)
            const isLoading = loading === m.id
            return (
              <button
                key={m.id}
                onClick={() => toggleCheckin(m.id)}
                disabled={isLoading}
                className={`w-full py-4 px-5 rounded-xl text-left text-lg font-semibold flex items-center justify-between transition-all ${
                  checked
                    ? 'bg-green-500 text-white shadow'
                    : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800'
                } ${isLoading ? 'opacity-50' : ''}`}
              >
                <span>{m.name}</span>
                <span>{isLoading ? '⏳' : checked ? '✅' : ''}</span>
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-center text-sm text-slate-400">
        Klepnutím na zelené jméno zrušíte zápis
      </p>
    </main>
  )
}
