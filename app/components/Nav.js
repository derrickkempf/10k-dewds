'use client'
import { usePathname } from 'next/navigation'

// Mirrors the nav in /public/app.html so /daily and /feed look identical.
// Logo + tagline left, pills right. Count pill toggles a stats drawer and
// the ? button opens the About modal — both rendered by <Chrome>.
// `hidden` prop drives scroll-direction-aware hide/show (matches app.html).
export default function Nav({ statsCount = 0, onToggleStats, onOpenAbout, hidden = false }) {
  const pathname = usePathname() || ''
  const isDaily = pathname.startsWith('/daily')
  const isFeed  = pathname.startsWith('/feed')

  return (
    <nav className={hidden ? 'nav-hidden' : ''}>
      <div className="nav-left">
        <a className="logo" href="/app.html" aria-label="DEWDs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/10k-dewds-logo.svg"
            alt="10K DEWDS"
            style={{ height: '35px', width: 'auto', display: 'block' }}
          />
        </a>
        <span className="tagline">10,000 hand drawn DEWDs in 100 days.</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <a
          className="nav-pill nav-draw-btn"
          href="/app.html?draw=1"
          title="Draw"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/squiggle.svg" alt="" className="nav-draw-icon" />
          Draw
        </a>
        <a
          className={`nav-pill${isDaily ? ' active' : ''}`}
          href="/daily"
          title="Daily tracker"
        >Daily</a>
        <a
          className={`nav-pill${isFeed ? ' active' : ''}`}
          href="/feed"
          title="Feed"
        >Feed</a>
        <button
          className="nav-pill"
          onClick={onToggleStats}
          title="DEWDs tracker stats"
          type="button"
        >
          <b>{statsCount.toLocaleString()}</b> / 10,000
        </button>
        <button
          className="nav-about-btn"
          onClick={onOpenAbout}
          title="About this project"
          aria-label="About"
          type="button"
        >?</button>
      </div>
    </nav>
  )
}
