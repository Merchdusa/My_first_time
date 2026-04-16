import type { BillingRow, Member } from './types'

const PRICE_PER_VISIT = 80
const FREE_EVERY_N = 11

export function calculateBilling(member: Member, totalVisits: number): BillingRow {
  const freeVisits = Math.floor(totalVisits / FREE_EVERY_N)
  const paidVisits = totalVisits - freeVisits
  return {
    member,
    totalVisits,
    freeVisits,
    paidVisits,
    amount: paidVisits * PRICE_PER_VISIT,
  }
}

export function formatAmount(czk: number): string {
  return `${czk} Kč`
}

// Returns the next sauna date for a group (next occurrence of visit_day)
export function getNextSessionDate(visitDay: number): Date {
  const today = new Date()
  const day = today.getDay() // 0=Sun
  let diff = visitDay - day
  if (diff <= 0) diff += 7
  const next = new Date(today)
  next.setDate(today.getDate() + diff)
  return next
}

// Returns the current/upcoming session date (same week)
export function getThisWeekSessionDate(visitDay: number): Date {
  const today = new Date()
  const day = today.getDay()
  let diff = visitDay - day
  // If sauna day already passed this week, show next week's
  if (diff < 0) diff += 7
  const d = new Date(today)
  d.setDate(today.getDate() + diff)
  return d
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

const DAY_NAMES = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota']
export function dayName(day: number): string {
  return DAY_NAMES[day] ?? ''
}
