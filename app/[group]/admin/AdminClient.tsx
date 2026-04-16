'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDate, formatAmount } from '@/lib/billing'
import type { Group, Member, BillingRow } from '@/lib/types'

type SessionWithVisits = {
  id: string
  date: string
  visits: { member_id: string; member: { name: string } | null }[]
}

type Props = {
  group: Group
  members: Member[]
  sessions: SessionWithVisits[]
  billing: BillingRow[]
}

export default function AdminClient({ group, members, sessions, billing }: Props) {
  const [pin, setPin] = useState('')
  const [authed, setAuthed] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [tab, setTab] = useState<'billing' | 'sessions'>('billing')
  const [copied, setCopied] = useState(false)
  const [savingVisit, setSavingVisit] = useState<string | null>(null)
  const [visitsState, setVisitsState] = useState<Record<string, Set<string>>>(
    Object.fromEntries(sessions.map((s) => [s.id, new Set(s.visits.map((v) => v.member_id))]))
  )

  function checkPin() {
    if (pin === process.env.NEXT_PUBLIC_ADMIN_PIN_CHECK) {
      setAuthed(true)
    } else {
      // Client can't check env PIN — send to server
      fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      }).then(async (res) => {
        if (res.ok) setAuthed(true)
        else setPinError(true)
      })
    }
  }

  function copyBilling() {
    const lines = billing
      .filter((b) => b.totalVisits > 0)
      .map((b) => `${b.member.name}: ${b.totalVisits} návštěv → ${formatAmount(b.amount)}`)
      .join('\n')

    const text = `Vyúčtování sauny — ${group.name}\n\n${lines}\n\nKaždá návštěva 80 Kč, každá 11. zdarma.`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function toggleVisit(sessionId: string, memberId: string) {
    const key = `${sessionId}-${memberId}`
    setSavingVisit(key)
    const current = visitsState[sessionId] ?? new Set()
    const hasVisit = current.has(memberId)

    const res = await fetch('/api/admin/visits', {
      method: hasVisit ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, sessionId, memberId }),
    })

    if (res.ok) {
      setVisitsState((prev) => {
        const s = new Set(prev[sessionId] ?? [])
        hasVisit ? s.delete(memberId) : s.add(memberId)
        return { ...prev, [sessionId]: s }
      })
    }
    setSavingVisit(null)
  }

  const checkinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${group.slug}/checkin`
    : `/${group.slug}/checkin`

  if (!authed) {
    return (
      <main className="flex flex-col flex-1 items-center justify-center px-4 py-12 max-w-md mx-auto w-full gap-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🔒</div>
          <h1 className="text-2xl font-bold text-cyan-800">Admin — {group.name}</h1>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm w-full flex flex-col gap-4">
          <label className="text-cyan-700 font-medium">PIN kód</label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={8}
            value={pin}
            onChange={(e) => { setPin(e.target.value); setPinError(false) }}
            onKeyDown={(e) => e.key === 'Enter' && checkPin()}
            placeholder="····"
            className="w-full py-4 px-4 text-2xl text-center tracking-widest border-2 border-cyan-200 rounded-xl focus:outline-none focus:border-cyan-500"
          />
          {pinError && <p className="text-red-500 text-center">Špatný PIN</p>}
          <button
            onClick={checkPin}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white text-lg font-bold rounded-xl"
          >
            Přihlásit se
          </button>
        </div>

        <Link href={`/${group.slug}`} className="text-cyan-500 text-sm">← Zpět</Link>
      </main>
    )
  }

  return (
    <main className="flex flex-col flex-1 px-4 py-6 max-w-md mx-auto w-full gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/${group.slug}`} className="text-cyan-600 text-sm">← Zpět</Link>
          <h1 className="text-2xl font-bold text-cyan-800 mt-1">Admin — {group.name}</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-cyan-100 p-1 rounded-xl">
        <button
          onClick={() => setTab('billing')}
          className={`flex-1 py-2 rounded-lg font-semibold transition-all ${tab === 'billing' ? 'bg-white text-cyan-800 shadow' : 'text-cyan-600'}`}
        >
          Vyúčtování
        </button>
        <button
          onClick={() => setTab('sessions')}
          className={`flex-1 py-2 rounded-lg font-semibold transition-all ${tab === 'sessions' ? 'bg-white text-cyan-800 shadow' : 'text-cyan-600'}`}
        >
          Docházka
        </button>
      </div>

      {tab === 'billing' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-cyan-700 mb-4 uppercase tracking-wide">Celkové vyúčtování</h2>
            {billing.filter(b => b.totalVisits > 0).length === 0 && (
              <p className="text-slate-400 text-center py-4">Zatím žádné návštěvy</p>
            )}
            <div className="flex flex-col gap-3">
              {billing.filter(b => b.totalVisits > 0).map((b) => (
                <div key={b.member.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <div className="font-semibold text-cyan-800">{b.member.name}</div>
                    <div className="text-sm text-slate-500">
                      {b.totalVisits} návštěv
                      {b.freeVisits > 0 && <span className="text-green-600 ml-1">({b.freeVisits}× zdarma)</span>}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-cyan-700">{formatAmount(b.amount)}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={copyBilling}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white text-lg font-semibold rounded-2xl shadow"
          >
            {copied ? '✅ Zkopírováno!' : '📋 Zkopírovat pro WhatsApp'}
          </button>

          {/* QR code info */}
          <div className="bg-amber-50 rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-amber-700 mb-2 uppercase tracking-wide">QR kód pro saunu</h2>
            <p className="text-sm text-amber-700 mb-2">Adresa pro check-in (vytiskněte QR kód z této URL):</p>
            <div className="bg-white rounded-lg p-3 font-mono text-xs text-slate-600 break-all">
              {checkinUrl}
            </div>
            <p className="text-xs text-amber-600 mt-2">
              QR kód vygenerujte zdarma na qr-code-generator.com
            </p>
          </div>
        </div>
      )}

      {tab === 'sessions' && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-500">Klepněte na jméno pro přidání / odebrání návštěvy</p>
          {sessions.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-cyan-800 mb-3 capitalize">{formatDate(s.date)}</h3>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => {
                  const has = visitsState[s.id]?.has(m.id)
                  const key = `${s.id}-${m.id}`
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleVisit(s.id, m.id)}
                      disabled={savingVisit === key}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        has ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      } ${savingVisit === key ? 'opacity-50' : ''}`}
                    >
                      {m.name}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-slate-400 mt-2">{visitsState[s.id]?.size ?? 0} návštěv</p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
