'use client'

import { useState, useMemo } from 'react'

interface Game {
  id: string
  name: string
  emoji: string
  description: string
  category: string
  minPlayers: number
  maxPlayers: number
  minAge: number
  minTime: number  // including setup+rules, minutes
  maxTime: number  // including setup+rules, minutes
  complexity: 1 | 2 | 3
}

const GAMES: Game[] = [
  {
    id: 'pokojovky',
    name: 'Pokojovky',
    emoji: '🏠',
    description: 'Karetní hra o zařizování pokojů — kombinuj rostliny, nábytek a mazlíčky na mřížce 3×5 karet.',
    category: 'Karetní hra',
    minPlayers: 1,
    maxPlayers: 5,
    minAge: 10,
    minTime: 50,
    maxTime: 60,
    complexity: 1,
  },
  {
    id: 'carcassonne',
    name: 'Carcassonne',
    emoji: '🏰',
    description: 'Skládej dlaždice středověké krajiny — stavěj města, silnice a kláštery a umísťuj své rytíře.',
    category: 'Strategická',
    minPlayers: 2,
    maxPlayers: 5,
    minAge: 7,
    minTime: 40,
    maxTime: 60,
    complexity: 1,
  },
  {
    id: 'catan',
    name: 'Osadníci z Catanu',
    emoji: '🏝️',
    description: 'Klasická obchodní strategie — buduj osady a města, obchoduj se surovinami a poraz sousedy.',
    category: 'Strategická',
    minPlayers: 3,
    maxPlayers: 6,
    minAge: 10,
    minTime: 75,
    maxTime: 105,
    complexity: 2,
  },
  {
    id: 'heat',
    name: 'Heat',
    emoji: '🏎️',
    description: 'Závodní hra Formule 1 s taktikou — ovládej teplo motoru, vybírej rychlost a bojuj o první místo.',
    category: 'Závodní',
    minPlayers: 1,
    maxPlayers: 6,
    minAge: 10,
    minTime: 40,
    maxTime: 70,
    complexity: 2,
  },
  {
    id: 'munchkin',
    name: 'Munchkin',
    emoji: '⚔️',
    description: 'Humorná karetní hra — dorazi příšery, získej poklady, povyšuj se a v pravý čas zraď přátele.',
    category: 'Karetní hra',
    minPlayers: 3,
    maxPlayers: 6,
    minAge: 10,
    minTime: 100,
    maxTime: 130,
    complexity: 2,
  },
  {
    id: 'mars',
    name: 'Mars: Teraformace',
    emoji: '🪐',
    description: 'Rozsáhlá engine-building strategie — řiď korporaci, pokládej projekty a terraformuj rudou planetu.',
    category: 'Strategická',
    minPlayers: 1,
    maxPlayers: 5,
    minAge: 12,
    minTime: 115,
    maxTime: 145,
    complexity: 3,
  },
  {
    id: 'brink',
    name: 'Břink',
    emoji: '🐉',
    description: 'Deckbuilding dobrodružství — plíž se dračím doupětem, ukoř artefakty a unikni dřív než ostatní.',
    category: 'Deckbuilding',
    minPlayers: 2,
    maxPlayers: 4,
    minAge: 12,
    minTime: 75,
    maxTime: 105,
    complexity: 2,
  },
]

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} hod` : `${h} hod ${m} min`
}

function complexityLabel(c: 1 | 2 | 3) {
  return c === 1 ? 'Jednoduchá' : c === 2 ? 'Středně náročná' : 'Náročná'
}

function complexityColors(c: 1 | 2 | 3) {
  return c === 1
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : c === 2
    ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-rose-700 bg-rose-50 border-rose-200'
}

function countLabel(n: number, singular: string, few: string, many: string) {
  if (n === 1) return `${n} ${singular}`
  if (n >= 2 && n <= 4) return `${n} ${few}`
  return `${n} ${many}`
}

function whyUnsuitableReasons(game: Game, players: number, hasChildren: boolean, youngestAge: number, availableTime: number): string[] {
  const reasons: string[] = []
  if (players < game.minPlayers || players > game.maxPlayers)
    reasons.push(`vyžaduje ${game.minPlayers}–${game.maxPlayers} hráčů`)
  if (hasChildren && youngestAge < game.minAge)
    reasons.push(`od ${game.minAge} let`)
  if (availableTime < game.minTime)
    reasons.push(`potřeba min. ${formatTime(game.minTime)}`)
  return reasons
}

export default function DeskovkyPage() {
  const [players, setPlayers] = useState(4)
  const [hasChildren, setHasChildren] = useState(false)
  const [youngestAge, setYoungestAge] = useState(8)
  const [availableTime, setAvailableTime] = useState(90)

  const effectiveMinAge = hasChildren ? youngestAge : 0

  const { suitable, unsuitable } = useMemo(() => {
    const suitable: Game[] = []
    const unsuitable: Game[] = []
    for (const game of GAMES) {
      if (
        players >= game.minPlayers &&
        players <= game.maxPlayers &&
        effectiveMinAge >= game.minAge &&
        availableTime >= game.minTime
      ) {
        suitable.push(game)
      } else {
        unsuitable.push(game)
      }
    }
    return { suitable, unsuitable }
  }, [players, effectiveMinAge, availableTime])

  const topGame = useMemo(() => {
    if (suitable.length === 0) return null
    return suitable.reduce((best, game) => {
      const score =
        game.minTime / availableTime +
        (hasChildren ? (4 - game.complexity) * 0.12 : 0)
      const bestScore =
        best.minTime / availableTime +
        (hasChildren ? (4 - best.complexity) * 0.12 : 0)
      return score > bestScore ? game : best
    })
  }, [suitable, availableTime, hasChildren])

  return (
    <main className="min-h-screen" style={{ background: '#fdf8f0', color: '#292524' }}>
      {/* Header */}
      <header style={{ background: '#78350f', color: '#fef3c7' }} className="py-6 px-8 shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight">🎲 Průvodce deskovkami</h1>
        <p style={{ color: '#fde68a' }} className="mt-1 text-base">
          Nastav posuvníky a my vybereme správnou hru pro váš večer
        </p>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 grid gap-8" style={{ gridTemplateColumns: '400px 1fr', alignItems: 'start' }}>

        {/* ── Questionnaire ── */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b" style={{ borderColor: '#e7e5e4' }}>
            <h2 className="font-semibold text-lg" style={{ color: '#78350f' }}>Dotazník</h2>
          </div>
          <div className="px-6 py-6 space-y-7">

            {/* Players slider */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="font-medium" style={{ color: '#44403c' }}>Počet hráčů</label>
                <span className="text-2xl font-bold" style={{ color: '#d97706' }}>{players}</span>
              </div>
              <input
                type="range" min={1} max={8} step={1}
                value={players}
                onChange={e => setPlayers(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: '#d97706' }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: '#a8a29e' }}>
                <span>1 hráč</span><span>8 hráčů</span>
              </div>
            </div>

            {/* Children toggle */}
            <div>
              <label className="font-medium block mb-2" style={{ color: '#44403c' }}>
                Jsou ve skupině děti?
              </label>
              <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: '#e7e5e4' }}>
                <button
                  onClick={() => setHasChildren(false)}
                  className="flex-1 py-2.5 text-sm font-medium transition-colors"
                  style={!hasChildren
                    ? { background: '#d97706', color: '#fff' }
                    : { background: '#fff', color: '#78716c' }}
                >
                  Ne, jen dospělí
                </button>
                <button
                  onClick={() => setHasChildren(true)}
                  className="flex-1 py-2.5 text-sm font-medium transition-colors"
                  style={hasChildren
                    ? { background: '#d97706', color: '#fff' }
                    : { background: '#fff', color: '#78716c' }}
                >
                  Ano, jsou děti
                </button>
              </div>
            </div>

            {/* Youngest age — only when children */}
            {hasChildren && (
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <label className="font-medium" style={{ color: '#44403c' }}>Věk nejmladšího hráče</label>
                  <span className="text-2xl font-bold" style={{ color: '#d97706' }}>{youngestAge} let</span>
                </div>
                <input
                  type="range" min={4} max={17} step={1}
                  value={youngestAge}
                  onChange={e => setYoungestAge(Number(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{ accentColor: '#d97706' }}
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: '#a8a29e' }}>
                  <span>4 roky</span><span>17 let</span>
                </div>
              </div>
            )}

            {/* Available time slider */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="font-medium" style={{ color: '#44403c' }}>Kolik máme času?</label>
                <span className="text-2xl font-bold" style={{ color: '#d97706' }}>{formatTime(availableTime)}</span>
              </div>
              <input
                type="range" min={30} max={240} step={15}
                value={availableTime}
                onChange={e => setAvailableTime(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: '#d97706' }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: '#a8a29e' }}>
                <span>30 min</span><span>4 hodiny</span>
              </div>
            </div>

            {/* Summary pill */}
            <div className="rounded-xl px-4 py-3 text-sm space-y-1" style={{ background: '#fef3c7', color: '#78350f' }}>
              <p>👥 <strong>{countLabel(players, 'hráč', 'hráči', 'hráčů')}</strong></p>
              {hasChildren
                ? <p>🧒 nejmladší hráč: <strong>{youngestAge} let</strong></p>
                : <p>🧑 pouze dospělí</p>
              }
              <p>⏱️ čas vč. setupu a pravidel: <strong>{formatTime(availableTime)}</strong></p>
            </div>
          </div>
        </div>

        {/* ── Results ── */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg" style={{ color: '#78350f' }}>
            {suitable.length === 0
              ? 'Žádná vhodná hra'
              : countLabel(suitable.length, 'vhodná hra', 'vhodné hry', 'vhodných her')}
          </h2>

          {/* No results */}
          {suitable.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md px-8 py-10 text-center" style={{ color: '#78716c' }}>
              <div className="text-5xl mb-3">😕</div>
              <p className="font-medium text-lg">Pro tyto parametry není vhodná žádná hra.</p>
              <p className="text-sm mt-2">Zkus přidat čas, upravit věk nebo snížit počet hráčů.</p>
            </div>
          )}

          {/* Suitable games */}
          {suitable.map(game => {
            const isTop = game.id === topGame?.id
            return (
              <div
                key={game.id}
                className="bg-white rounded-2xl shadow-md p-5 transition-shadow"
                style={isTop ? { outline: '2px solid #d97706', boxShadow: '0 4px 20px rgba(217,119,6,0.15)' } : {}}
              >
                {isTop && (
                  <div className="mb-3">
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                      style={{ background: '#d97706', color: '#fff' }}
                    >
                      ⭐ Top volba
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <span className="text-4xl select-none">{game.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <h3 className="font-bold text-lg leading-tight">{game.name}</h3>
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full border shrink-0 ${complexityColors(game.complexity)}`}
                      >
                        {complexityLabel(game.complexity)}
                      </span>
                    </div>
                    <p className="text-sm mt-1" style={{ color: '#78716c' }}>{game.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm" style={{ color: '#57534e' }}>
                      <span>👥 {game.minPlayers}–{game.maxPlayers} hráčů</span>
                      <span>👶 od {game.minAge} let</span>
                      <span>⏱️ {formatTime(game.minTime)}–{formatTime(game.maxTime)}</span>
                      <span className="text-xs" style={{ color: '#a8a29e' }}>({game.category})</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Unsuitable games (collapsible) */}
          {unsuitable.length > 0 && (
            <details className="group mt-2">
              <summary
                className="cursor-pointer text-sm select-none list-none flex items-center gap-1.5 py-1"
                style={{ color: '#a8a29e' }}
              >
                <span className="group-open:hidden">▶</span>
                <span className="hidden group-open:block">▼</span>
                Nevhodné hry ({unsuitable.length})
              </summary>

              <div className="space-y-3 mt-3">
                {unsuitable.map(game => {
                  const reasons = whyUnsuitableReasons(game, players, hasChildren, youngestAge, availableTime)
                  return (
                    <div
                      key={game.id}
                      className="bg-white rounded-2xl p-5"
                      style={{ opacity: 0.5, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-4xl grayscale select-none">{game.emoji}</span>
                        <div className="flex-1">
                          <h3 className="font-bold text-base">{game.name}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm" style={{ color: '#57534e' }}>
                            <span>👥 {game.minPlayers}–{game.maxPlayers} hráčů</span>
                            <span>👶 od {game.minAge} let</span>
                            <span>⏱️ {formatTime(game.minTime)}–{formatTime(game.maxTime)}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {reasons.map(r => (
                              <span
                                key={r}
                                className="text-xs px-2 py-0.5 rounded"
                                style={{ background: '#fee2e2', color: '#b91c1c' }}
                              >
                                ✗ {r}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </details>
          )}
        </div>
      </div>
    </main>
  )
}
