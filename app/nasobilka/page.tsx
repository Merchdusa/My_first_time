'use client'

import { useState, useRef, useCallback } from 'react'

type CareAction = 'feed' | 'drink' | 'pet' | 'wash' | 'play'

const CARE_CONFIG: Record<CareAction, { label: string; emoji: string; bg: string; text: string }> = {
  feed:  { label: 'Nakrmit',  emoji: '🥕', bg: 'bg-orange-400 hover:bg-orange-500', text: 'Dostává mrkev!' },
  drink: { label: 'Napojit',  emoji: '💧', bg: 'bg-blue-400 hover:bg-blue-500',     text: 'Dostává vodu!' },
  pet:   { label: 'Pohladit', emoji: '❤️', bg: 'bg-pink-400 hover:bg-pink-500',     text: 'Dostává pohlazení!' },
  wash:  { label: 'Umýt',     emoji: '🫧', bg: 'bg-cyan-400 hover:bg-cyan-500',     text: 'Dostává koupel!' },
  play:  { label: 'Hrát si',  emoji: '🎾', bg: 'bg-green-400 hover:bg-green-500',   text: 'Hraje si!' },
}

const ACTION_SEQUENCE: CareAction[] = ['feed', 'drink', 'pet', 'wash', 'play']

interface Problem {
  display: string
  answer: number
}

function generateProblem(): Problem {
  const a = Math.floor(Math.random() * 10) + 1
  const b = Math.floor(Math.random() * 10) + 1
  const product = a * b
  const rand = Math.random()

  if (rand < 0.4) {
    return { display: `${a} × ${b} = _`, answer: product }
  } else if (rand < 0.7) {
    return { display: `_ × ${b} = ${product}`, answer: a }
  } else {
    // product : a = b  →  blank is a
    return { display: `${product} : _ = ${b}`, answer: a }
  }
}

function RabbitSVG({ animation }: { animation: CareAction | null }) {
  const isHappy   = animation === 'pet'
  const isEating  = animation === 'feed'
  const isDrinking = animation === 'drink'
  const isWashing = animation === 'wash'
  const isPlaying = animation === 'play'

  return (
    <div className={`relative select-none ${isPlaying ? 'animate-bounce' : ''}`}>
      <svg viewBox="0 0 200 265" width="200" height="265" xmlns="http://www.w3.org/2000/svg">
        {/* Ears */}
        <ellipse cx="68" cy="55" rx="21" ry="52" fill="#fce4ec" stroke="#f8bbd0" strokeWidth="2" />
        <ellipse cx="68" cy="60" rx="11" ry="37" fill="#f48fb1" />
        <ellipse cx="132" cy="55" rx="21" ry="52" fill="#fce4ec" stroke="#f8bbd0" strokeWidth="2" />
        <ellipse cx="132" cy="60" rx="11" ry="37" fill="#f48fb1" />

        {/* Body */}
        <ellipse cx="100" cy="200" rx="60" ry="58" fill="#fce4ec" stroke="#f8bbd0" strokeWidth="2" />

        {/* Head */}
        <circle cx="100" cy="126" r="56" fill="#fce4ec" stroke="#f8bbd0" strokeWidth="2" />

        {/* Eyes: squiggly-happy when petted, normal otherwise */}
        {isHappy ? (
          <>
            <path d="M71 117 Q80 108 89 117" stroke="#4a2040" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M111 117 Q120 108 129 117" stroke="#4a2040" strokeWidth="4" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="80" cy="117" r="12" fill="white" />
            <circle cx="120" cy="117" r="12" fill="white" />
            <circle cx="83" cy="117" r="7.5" fill="#3d1a2e" />
            <circle cx="123" cy="117" r="7.5" fill="#3d1a2e" />
            <circle cx="85" cy="114" r="2.5" fill="white" />
            <circle cx="125" cy="114" r="2.5" fill="white" />
          </>
        )}

        {/* Cheeks */}
        <ellipse cx="67" cy="132" rx="13" ry="8" fill="#f48fb1" opacity="0.45" />
        <ellipse cx="133" cy="132" rx="13" ry="8" fill="#f48fb1" opacity="0.45" />

        {/* Nose */}
        <ellipse cx="100" cy="134" rx="6.5" ry="4.5" fill="#f48fb1" />

        {/* Mouth */}
        <path d="M93 140 Q100 148 107 140" stroke="#e91e8c" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Whiskers */}
        <line x1="56" y1="134" x2="91" y2="136" stroke="#c8a8b8" strokeWidth="1.5" />
        <line x1="56" y1="141" x2="91" y2="140" stroke="#c8a8b8" strokeWidth="1.5" />
        <line x1="109" y1="136" x2="144" y2="134" stroke="#c8a8b8" strokeWidth="1.5" />
        <line x1="109" y1="140" x2="144" y2="141" stroke="#c8a8b8" strokeWidth="1.5" />

        {/* Tail */}
        <circle cx="156" cy="204" r="14" fill="white" stroke="#f8bbd0" strokeWidth="1.5" />

        {/* Front paws */}
        <ellipse cx="72" cy="236" rx="20" ry="14" fill="#fce4ec" stroke="#f8bbd0" strokeWidth="1.5" />
        <ellipse cx="128" cy="236" rx="20" ry="14" fill="#fce4ec" stroke="#f8bbd0" strokeWidth="1.5" />

        {/* Feed: carrot near mouth */}
        {isEating && (
          <g>
            <rect x="108" y="140" width="38" height="11" rx="5.5" fill="#ff7043" />
            <path d="M135 139 Q141 128 148 137" fill="#4caf50" />
            <path d="M139 138 Q143 124 149 134" fill="#388e3c" />
          </g>
        )}

        {/* Drink: blue cup near mouth */}
        {isDrinking && (
          <g>
            <rect x="108" y="134" width="24" height="30" rx="5" fill="#42a5f5" opacity="0.85" />
            <rect x="108" y="132" width="24" height="7" rx="3" fill="#1e88e5" />
            <ellipse cx="120" cy="149" rx="7" ry="9" fill="#90caf9" opacity="0.4" />
          </g>
        )}

        {/* Wash: soap bubbles */}
        {isWashing && (
          <>
            <circle cx="52"  cy="92"  r="10" fill="none" stroke="#42a5f5"  strokeWidth="2" opacity="0.7" />
            <circle cx="152" cy="83"  r="7"  fill="none" stroke="#ce93d8"  strokeWidth="2" opacity="0.7" />
            <circle cx="100" cy="68"  r="12" fill="none" stroke="#42a5f5"  strokeWidth="2" opacity="0.6" />
            <circle cx="46"  cy="148" r="6"  fill="none" stroke="#ce93d8"  strokeWidth="2" opacity="0.5" />
            <circle cx="157" cy="138" r="9"  fill="none" stroke="#42a5f5"  strokeWidth="2" opacity="0.6" />
            <circle cx="165" cy="100" r="5"  fill="none" stroke="#ce93d8"  strokeWidth="2" opacity="0.5" />
          </>
        )}
      </svg>

      {/* Floating hearts for pet */}
      {isHappy && (
        <>
          <span className="absolute top-1 left-4  text-2xl animate-bounce" style={{ animationDelay: '0s' }}>❤️</span>
          <span className="absolute top-0 right-4 text-2xl animate-bounce" style={{ animationDelay: '0.25s' }}>💕</span>
          <span className="absolute top-4 left-1/2 -translate-x-1/2 text-xl animate-bounce" style={{ animationDelay: '0.12s' }}>❤️</span>
        </>
      )}

      {/* Tennis ball for play */}
      {isPlaying && (
        <span className="absolute -bottom-3 right-2 text-4xl">🎾</span>
      )}
    </div>
  )
}

export default function NasobilkaPage() {
  const [problem, setProblem]             = useState<Problem>(() => generateProblem())
  const [input, setInput]                 = useState('')
  const [score, setScore]                 = useState(0)
  const [totalCorrect, setTotalCorrect]   = useState(0)
  const [pendingActions, setPendingActions] = useState<CareAction[]>([])
  const [currentAnimation, setCurrentAnimation] = useState<CareAction | null>(null)
  const [feedback, setFeedback]           = useState<'correct' | 'wrong' | null>(null)
  const [actionIdx, setActionIdx]         = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const nextProblem = useCallback(() => {
    setProblem(generateProblem())
    setInput('')
    setFeedback(null)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const handleSubmit = useCallback(() => {
    const num = parseInt(input)
    if (isNaN(num) || input.trim() === '') return

    if (num === problem.answer) {
      setFeedback('correct')
      const newTotal = totalCorrect + 1
      setTotalCorrect(newTotal)
      setScore(s => s + 1)

      if (newTotal % 5 === 0) {
        const action = ACTION_SEQUENCE[actionIdx % ACTION_SEQUENCE.length]
        setPendingActions(prev => [...prev, action])
        setActionIdx(i => i + 1)
      }

      setTimeout(nextProblem, 700)
    } else {
      setFeedback('wrong')
      setInput('')
      setTimeout(() => setFeedback(null), 900)
    }
  }, [input, problem.answer, totalCorrect, actionIdx, nextProblem])

  const performAction = useCallback((action: CareAction) => {
    if (currentAnimation !== null) return
    setPendingActions(prev => prev.slice(1))
    setCurrentAnimation(action)
    setTimeout(() => setCurrentAnimation(null), 2500)
  }, [currentAnimation])

  const progressPct = (totalCorrect % 5) / 5 * 100

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-6">

        {/* ── LEFT: Math panel ── */}
        <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 flex flex-col items-center gap-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-purple-700">🔢 Násobilka</h1>
            <div className="flex items-center gap-2 mt-2 justify-center">
              <span className="text-2xl">⭐</span>
              <span className="text-2xl font-bold text-purple-600">{score}</span>
              <span className="text-gray-400 text-sm">správných odpovědí</span>
            </div>
          </div>

          {/* Problem */}
          <div
            className={`w-full text-center text-5xl font-bold py-8 px-4 rounded-2xl transition-all duration-300 ${
              feedback === 'correct' ? 'bg-green-100 text-green-600 scale-105' :
              feedback === 'wrong'   ? 'bg-red-100   text-red-500'             :
              'bg-purple-50 text-purple-800'
            }`}
          >
            {problem.display}
          </div>

          {feedback === 'correct' && (
            <div className="text-3xl animate-bounce">🎉 Správně!</div>
          )}
          {feedback === 'wrong' && (
            <div className="text-2xl text-red-500 font-semibold">❌ Zkus znovu!</div>
          )}
          {feedback === null && <div className="h-9" />}

          {/* Input row */}
          <div className="flex gap-3 w-full max-w-xs">
            <input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="flex-1 text-4xl text-center border-4 border-purple-300 rounded-2xl p-3 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
              placeholder="?"
              autoFocus
            />
            <button
              onClick={handleSubmit}
              className="bg-purple-500 hover:bg-purple-600 active:scale-95 text-white text-3xl w-16 rounded-2xl font-bold transition-all shadow-md"
            >
              ✓
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-xs space-y-1">
            <div className="flex justify-between text-xs text-purple-400">
              <span>Postup ke králíčkovi</span>
              <span>{totalCorrect % 5}/5</span>
            </div>
            <div className="h-5 bg-purple-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-center text-xs text-gray-400">
              {pendingActions.length > 0
                ? `🎁 ${pendingActions.length} péče čeká! Klikni na tlačítko →`
                : `Ještě ${5 - (totalCorrect % 5 || 5)} správných = péče pro králíčka`
              }
            </p>
          </div>
        </div>

        {/* ── RIGHT: Rabbit panel ── */}
        <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 flex flex-col items-center gap-5">
          <h2 className="text-2xl font-bold text-pink-600">🐰 Můj králíček</h2>

          <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-[280px]">
            <RabbitSVG animation={currentAnimation} />

            <div className="h-8 flex items-center justify-center">
              {currentAnimation ? (
                <div className="text-xl font-bold text-pink-500 animate-bounce">
                  {CARE_CONFIG[currentAnimation].emoji} {CARE_CONFIG[currentAnimation].text}
                </div>
              ) : (
                <div className="text-gray-300 text-sm">
                  {pendingActions.length > 0 ? '👆 Klikni a pohraj si!' : '💤 Čeká na péči…'}
                </div>
              )}
            </div>
          </div>

          {/* Care button */}
          <div className="w-full space-y-3">
            {pendingActions.length > 0 ? (
              <>
                <button
                  onClick={() => performAction(pendingActions[0])}
                  disabled={currentAnimation !== null}
                  className={`w-full ${CARE_CONFIG[pendingActions[0]].bg} text-white py-4 rounded-2xl text-xl font-bold shadow-lg active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {CARE_CONFIG[pendingActions[0]].emoji} {CARE_CONFIG[pendingActions[0]].label}!
                </button>
                {pendingActions.length > 1 && (
                  <p className="text-center text-pink-400 text-sm font-medium">
                    + ještě {pendingActions.length - 1}× péče čeká! 🎁
                  </p>
                )}
              </>
            ) : (
              <div className="text-center text-gray-400 text-sm py-4 space-y-1">
                <div className="text-4xl">😴</div>
                <div>Králíček odpočívá…</div>
                <div>Odpověz správně <strong>5×</strong> a odemkni péči!</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
