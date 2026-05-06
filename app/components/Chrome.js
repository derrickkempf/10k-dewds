'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import Nav from './Nav'

const TOTAL = 10000

// Read the same localStorage key that /app.html uses ('pd-v2')
// and compute the four stats (Total / Drawn / WIP / Remaining / Complete %).
function readStats() {
  if (typeof window === 'undefined') {
    return { done: 0, wip: 0, rem: TOTAL, pct: '0.0' }
  }
  let saved = {}
  try {
    const raw = localStorage.getItem('pd-v2')
    if (raw) saved = JSON.parse(raw)
  } catch {}
  let done = 0, wip = 0
  for (const id in saved) {
    if (saved[id]?.status === 'done')        done += 1
    else if (saved[id]?.status === 'in-progress') wip += 1
  }
  const rem = TOTAL - done
  const pct = (done / TOTAL * 100).toFixed(1)
  return { done, wip, rem, pct }
}

export default function Chrome() {
  const [statsOpen, setStatsOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [stats, setStats] = useState({ done: 0, wip: 0, rem: TOTAL, pct: '0.0' })
  const [navHidden, setNavHidden] = useState(false)
  const lastScrollY = useRef(0)

  // Refresh stats whenever the drawer opens, when window regains focus,
  // and on storage events (covers cross-tab updates from /app.html).
  const refresh = useCallback(() => setStats(readStats()), [])
  useEffect(() => {
    refresh()
    const onFocus   = () => refresh()
    const onStorage = (e) => { if (e.key === 'pd-v2') refresh() }
    window.addEventListener('focus', onFocus)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('storage', onStorage)
    }
  }, [refresh])

  useEffect(() => { if (statsOpen) refresh() }, [statsOpen, refresh])

  // Scroll-direction-aware nav — hide on scroll down, show on scroll up
  // (mirrors the behavior in /app.html)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y > lastScrollY.current && y > 80) {
        setNavHidden(true)
      } else {
        setNavHidden(false)
      }
      lastScrollY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ESC closes overlays
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setStatsOpen(false); setAboutOpen(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const progressPct = parseFloat(stats.pct) || 0

  // Toggle stats — scroll to top when opening (mirrors app.html)
  const handleToggleStats = useCallback(() => {
    setStatsOpen(prev => {
      const opening = !prev
      if (opening) window.scrollTo({ top: 0, behavior: 'smooth' })
      return opening
    })
  }, [])

  return (
    <>
      {/* Progress bar — same as #nav-progress in /app.html */}
      <div className="nav-progress" style={{ width: progressPct + '%' }} />

      {/* Stats bar sits ABOVE the nav in the DOM, just like /app.html.
          When open it pushes the nav (and page) down. */}
      <div id="stats-bar" className={statsOpen ? 'open' : ''}>
        <div className="stats">
          <div className="stat">
            <div className="stat-lbl">Total</div>
            <div className="stat-val">{TOTAL.toLocaleString()}</div>
          </div>
          <div className="stat">
            <div className="stat-lbl">Drawn</div>
            <div className="stat-val">{stats.done.toLocaleString()}</div>
          </div>
          <div className="stat">
            <div className="stat-lbl">WIP</div>
            <div className="stat-val">{stats.wip.toLocaleString()}</div>
          </div>
          <div className="stat">
            <div className="stat-lbl">Remaining</div>
            <div className="stat-val">{stats.rem.toLocaleString()}</div>
          </div>
          <div className="stat">
            <div className="stat-lbl">Complete</div>
            <div className="stat-val">{stats.pct}%</div>
          </div>
        </div>
      </div>

      <Nav
        statsCount={stats.done}
        onToggleStats={handleToggleStats}
        onOpenAbout={() => setAboutOpen(true)}
        hidden={navHidden}
      />

      {/* About modal — same content as /app.html */}
      <div
        id="about-backdrop"
        className={aboutOpen ? 'open' : ''}
        onClick={(e) => { if (e.target === e.currentTarget) setAboutOpen(false) }}
      >
        <div className="about-box">
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/10k-dewds-logo.svg"
              alt="10K DEWDS"
              style={{ height: '35px', width: 'auto', display: 'block' }}
            />
          </div>
          <p>
            <strong>10,000 hand-drawn DEWDs.</strong> Every original DEWD, drawn by hand,
            one at a time. The goal? 100 days. That&apos;s 100 drawings a day. Actually,
            it&apos;s a bit more because 6 days into this challenge I pivoted away from
            using an existing IP (CryptoPunks) as reference, to drawing my own ideas as
            in the moment. This app tracks progress from DEWD #0000 to DEWD #9999.
          </p>
          <p>
            Click any DEWD to see the drawing larger. Vote for your favorites and
            share a comment on what you like.
          </p>
          <p>Drawing on what makes us human. One day at a time.</p>
          <button className="btn-primary" onClick={() => setAboutOpen(false)}>Close</button>
        </div>
      </div>
    </>
  )
}
