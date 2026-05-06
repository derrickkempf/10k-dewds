// GET  /api/daily?date=YYYY-MM-DD  → returns { day, streak }
// POST /api/daily                   → body { date, day } (admin only)
import { NextResponse } from 'next/server'
import { readJSON, writeJSON } from '@/lib/storage'
import { requireAdmin } from '@/lib/admin'

const FILE = 'daily'
const ACTIVITIES = ['drawing', 'pushups', 'crunches']

const isISO = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
const todayISO = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}
const shift = (iso, days) => {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

function emptyDay() {
  return {
    drawing:  { done: false, count: 0 },
    pushups:  { done: false, count: 0 },
    crunches: { done: false, count: 0 },
  }
}

function isAllDone(day) {
  if (!day) return false
  return ACTIVITIES.every(k => day[k]?.done === true)
}

function computeStreak(all, fromISO) {
  let streak = 0
  let cursor = fromISO
  // Don't count today unless today is fully done
  if (!isAllDone(all[cursor])) cursor = shift(cursor, -1)
  while (isAllDone(all[cursor])) {
    streak += 1
    cursor = shift(cursor, -1)
  }
  return streak
}

function normalizeDay(input) {
  const out = emptyDay()
  if (!input || typeof input !== 'object') return out
  for (const k of ACTIVITIES) {
    const v = input[k]
    if (v && typeof v === 'object') {
      out[k] = {
        done: !!v.done,
        count: Math.max(0, Math.min(9999, parseInt(v.count, 10) || 0)),
      }
    }
  }
  return out
}

export async function GET(request) {
  const url = new URL(request.url)
  const date = url.searchParams.get('date') || todayISO()
  if (!isISO(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }
  const all = (await readJSON(FILE, {})) || {}
  const day = all[date] || emptyDay()
  const streak = computeStreak(all, todayISO())
  return NextResponse.json({ date, day, streak })
}

export async function POST(request) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { date, day } = body || {}
  if (!isISO(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }
  const all = (await readJSON(FILE, {})) || {}
  all[date] = normalizeDay(day)
  await writeJSON(FILE, all)
  const streak = computeStreak(all, todayISO())
  return NextResponse.json({ date, day: all[date], streak })
}
