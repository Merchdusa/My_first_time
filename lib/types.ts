export type Group = {
  id: string
  name: string
  slug: string
  visit_day: number
  poll_day: number
  manager_phone: string | null
}

export type Member = {
  id: string
  group_id: string
  name: string
  is_admin: boolean
  active: boolean
}

export type Session = {
  id: string
  group_id: string
  date: string
  sms_sent: boolean
}

export type PollResponse = {
  id: string
  session_id: string
  member_id: string
  coming: boolean
  updated_at: string
  member?: Member
}

export type Visit = {
  id: string
  session_id: string
  member_id: string
  created_at: string
  member?: Member
}

export type BillingRow = {
  member: Member
  totalVisits: number
  freeVisits: number
  paidVisits: number
  amount: number
}
