'use client'
import { useEffect, useState, useCallback } from 'react'

const ACTIVITIES = [
  { key: 'drawing',  label: 'Draw 100 faces',   target: 100 },
  { key: 'pushups',  label: '100 pushups',      target: 100 },
  { key: 'crunches', label: '100 crunches',     target: 100 },
]

function todayISO() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

function shiftDate(iso, days) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    timeZone: 'UTC',
  })
}

const EMPTY_DAY = () => ({
  drawing:  { done: false, count: 0 },
  pushups:  { done: false, count: 0 },
  crunches: { done: false, count: 0 },
})

export default function DailyClient() {
  const [date, setDate] = useState(todayISO())
  const [day, setDay]   = useState(EMPTY_DAY())
  const [streak, setStreak] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const isToday  = date === todayISO()
  const isFuture = date > todayISO()

  const showToast = (msg, isError = false) => {
    setToast({ msg, error: isError })
    setTimeout(() => setToast(null), 2200)
  }

  const loadDay = useCallback(async (iso) => {
    setLoading(true)
    try {
      const r = await fetch(`/api/daily?date=${iso}`, { cache: 'no-store' })
      const json = await r.json()
      setDay(json.day || EMPTY_DAY())
      setStreak(json.streak ?? 0)
    } catch {
      setDay(EMPTY_DAY())
    } finally {
      setLoading(false)
    }
  }, [])

  // Check admin status (cookie set by /app.html admin login)
  useEffect(() => {
    fetch('/api/admin/session', { cache: 'no-store' })
      .then(r => r.json())
      .then(j => setIsAdmin(!!j.isAdmin))
      .catch(() => {})
  }, [])

  useEffect(() => { loadDay(date) }, [date, loadDay])

  // Keyboard: ← / → to flip days
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowLeft')  setDate(d => shiftDate(d, -1))
      if (e.key === 'ArrowRight') setDate(d => isToday ? d : shiftDate(d, 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isToday])

  const persist = async (next) => {
    setDay(next)
    try {
      const r = await fetch('/api/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, day: next }),
      })
      if (r.status === 401) {
        // Cookie expired or got cleared — silently re-lock
        setIsAdmin(false)
        return false
      }
      if (!r.ok) {
        showToast('Save failed', true)
        return false
      }
      const json = await r.json()
      setStreak(json.streak ?? 0)
      return true
    } catch {
      showToast('Save failed', true)
      return false
    }
  }

  const toggle = (key) => {
    if (!isAdmin) return
    const a = day[key]
    const nextDone = !a.done
    persist({
      ...day,
      [key]: { done: nextDone, count: nextDone && a.count === 0 ? 100 : a.count },
    })
  }

  const setCount = (key, value) => {
    if (!isAdmin) return
    const n = Math.max(0, Math.min(9999, parseInt(value || '0', 10) || 0))
    persist({
      ...day,
      [key]: { done: n >= 100 ? true : day[key].done, count: n },
    })
  }

  return (
    <div className="daily">
      {/* Date strip */}
      <div className="day-strip">
        <button className="pd-btn pd-btn--ghost" onClick={() => setDate(d => shiftDate(d, -1))} aria-label="Previous day">←</button>
        <div className="day-label">
          <div className="day-eyebrow">
            {isToday ? 'TODAY' : isFuture ? 'FUTURE' : 'PAST'}
          </div>
          <div className="day-date">{formatDate(date)}</div>
        </div>
        <button
          className="pd-btn pd-btn--ghost"
          onClick={() => setDate(d => isToday ? d : shiftDate(d, 1))}
          disabled={isToday}
          aria-label="Next day"
        >→</button>
      </div>

      {/* Streak */}
      <div className="streak-row">
        <div className="streak">
          <span className="streak-dot" />
          {streak} day streak
        </div>
      </div>

      {/* Tasks */}
      <ul className="tasks" aria-busy={loading}>
        {ACTIVITIES.map((a, i) => {
          const v = day[a.key]
          return (
            <li key={a.key} className={`task ${v.done ? 'done' : ''} ${isAdmin ? '' : 'readonly'}`}>
              <span className="task-num">{i + 1}.</span>
              <button
                className={`check ${v.done ? 'on' : ''}`}
                onClick={() => toggle(a.key)}
                disabled={!isAdmin}
                aria-label={`${v.done ? 'Completed' : 'Not yet'}: ${a.label}`}
              >
                {v.done ? '✓' : ''}
              </button>
              <span className="task-label">{a.label}</span>
              <input
                className="task-count"
                type="number"
                min="0"
                max="9999"
                placeholder="0"
                value={v.count || ''}
                onChange={(e) => setCount(a.key, e.target.value)}
                readOnly={!isAdmin}
                disabled={!isAdmin}
                aria-label={`${a.label} count`}
              />
              <span className="task-target">/ {a.target}</span>
            </li>
          )
        })}
      </ul>

      <p className="hint">Use ← → to flip between days.</p>

      {/* Toast */}
      {toast && <div className={`pd-toast show ${toast.error ? 'error' : 'ok'}`}>{toast.msg}</div>}
    </div>
  )
}
