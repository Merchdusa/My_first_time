'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/billing'
import type { Group, Member, Session, PollResponse } from '@/lib/types'

const MIN_PEOPLE = 6

type Props = {
  group: Group
  members: Member[]
  session: Session | null
  pollResponses: PollResponse[]
}

export default function PollClient({ group, members, session, pollResponses: initial }: Props) {
  const [responses, setResponses] = useState(initial)
  const [myMemberId, setMyMemberId] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [showSelect, setShowSelect] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(`sauna_member_${group.slug}`)
    if (saved) setMyMemberId(saved)
    else setShowSelect(true)
  }, [group.slug])

  const myResponse = responses.find((r) => r.member_id === myMemberId)
  const coming = responses.filter((r) => r.coming)
  const notComing = responses.filter((r) => !r.coming)
  const myMember = members.find((m) => m.id === myMemberId)

  async function vote(coming: boolean) {
    if (!myMemberId || !session) return
    setLoading(coming ? 'yes' : 'no')

    const res = await fetch('/api/poll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupSlug: group.slug, memberId: myMemberId, coming }),
    })

    if (res.ok) {
      setResponses((prev) => {
        const filtered = prev.filter((r) => r.member_id !== myMemberId)
        return [...filtered, { id: '', session_id: session.id, member_id: myMemberId, coming, updated_at: '' }]
      })
    }
    setLoading(null)
  }

  function selectMember(id: string) {
    localStorage.setItem(`sauna_member_${group.slug}`, id)
    setMyMemberId(id)
    setShowSelect(false)
  }

  const dateLabel = session ? formatDate(session.date) : '—'

  return (
    <main className="flex flex-col flex-1 px-4 py-6 max-w-md mx-auto w-full gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-cyan-600 text-sm">← Zpět</Link>
          <h1 className="text-2xl font-bold text-cyan-800 mt-1">{group.name}</h1>
          <p className="text-cyan-600 capitalize">{dateLabel}</p>
        </div>
        <Link href={`/${group.slug}/admin`} className="text-cyan-400 text-sm">Admin</Link>
      </div>

      {/* Attendance counter */}
      <div className={`rounded-2xl p-5 text-center shadow-sm ${coming.length >= MIN_PEOPLE ? 'bg-green-100 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
        <div className="text-4xl font-bold">{coming.length}</div>
        <div className="text-lg mt-1">
          {coming.length >= MIN_PEOPLE
            ? `Jdeme! (min. ${MIN_PEOPLE} splněno)`
            : `z ${MIN_PEOPLE} potřebných`}
        </div>
      </div>

      {/* Who's coming */}
      {coming.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-cyan-700 mb-3 uppercase tracking-wide">Přijdou</h2>
          <div className="flex flex-wrap gap-2">
            {coming.map((r) => {
              const m = members.find((m) => m.id === r.member_id)
              return m ? (
                <span key={r.member_id} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {m.name}
                </span>
              ) : null
            })}
          </div>
        </div>
      )}

      {/* Who's not coming */}
      {notComing.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">Nepřijdou</h2>
          <div className="flex flex-wrap gap-2">
            {notComing.map((r) => {
              const m = members.find((m) => m.id === r.member_id)
              return m ? (
                <span key={r.member_id} className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-sm">
                  {m.name}
                </span>
              ) : null
            })}
          </div>
        </div>
      )}

      {/* Select who you are */}
      {showSelect && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-semibold text-cyan-800 mb-3">Kdo jsi?</h2>
          <div className="flex flex-col gap-2">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => selectMember(m.id)}
                className="w-full py-3 px-4 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-xl text-left font-medium"
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Vote buttons */}
      {myMemberId && !showSelect && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-cyan-700 font-medium">Hlasovat jako: <strong>{myMember?.name}</strong></p>
            <button onClick={() => setShowSelect(true)} className="text-cyan-400 text-sm underline">Změnit</button>
          </div>

          {myResponse ? (
            <div className={`text-center py-3 rounded-xl font-semibold ${myResponse.coming ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
              {myResponse.coming ? 'Hlasovala/jsi: Přijdu 👍' : 'Hlasovala/jsi: Nepřijdu 👎'}
              <div className="text-sm font-normal mt-1 text-inherit opacity-70">Klikni pro změnu</div>
            </div>
          ) : null}

          <div className="flex gap-3 mt-3">
            <button
              onClick={() => vote(true)}
              disabled={!!loading}
              className="flex-1 py-4 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-lg font-bold rounded-xl shadow"
            >
              {loading === 'yes' ? '...' : 'Přijdu 👍'}
            </button>
            <button
              onClick={() => vote(false)}
              disabled={!!loading}
              className="flex-1 py-4 bg-slate-300 hover:bg-slate-400 disabled:opacity-50 text-slate-700 text-lg font-bold rounded-xl shadow"
            >
              {loading === 'no' ? '...' : 'Nepřijdu 👎'}
            </button>
          </div>
        </div>
      )}

      {/* Check-in link */}
      <Link
        href={`/${group.slug}/checkin`}
        className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white text-center text-lg font-semibold rounded-2xl shadow-md"
      >
        Zapsat příchod do sauny →
      </Link>
    </main>
  )
}
