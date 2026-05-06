'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

// /draw — full-bleed white canvas with the pen-cursor.svg as the cursor.
// Strokes use quadratic curves between sampled pointer points for a smooth
// hand-drawn feel. Color toggles between black and #0099ff. Clear wipes the
// canvas. PointerEvents cover mouse, touch, and pen input in one path.

const COLORS = {
  black: '#111111',
  blue: '#0099ff',
}
const STROKE_WIDTH = 3

export default function DrawClient() {
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef(null)
  const colorRef = useRef(COLORS.black)
  const strokesRef = useRef([])    // [{ color, points: [{x,y}] }] — kept so we can redraw on resize
  const currentStrokeRef = useRef(null)
  const [color, setColor] = useState('black')

  // Keep a ref in sync with state so handlers always read the current color
  useEffect(() => { colorRef.current = COLORS[color] }, [color])

  // Set up the canvas once mounted; redraw all saved strokes on resize so the
  // existing artwork survives device rotations / window resizes.
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = STROKE_WIDTH
    ctxRef.current = ctx
    redrawAll()
  }, [])

  const redrawAll = () => {
    const ctx = ctxRef.current
    if (!ctx) return
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    for (const stroke of strokesRef.current) {
      drawStroke(ctx, stroke)
    }
  }

  const drawStroke = (ctx, stroke) => {
    if (!stroke.points.length) return
    ctx.strokeStyle = stroke.color
    ctx.beginPath()
    const pts = stroke.points
    if (pts.length === 1) {
      // Single tap — draw a dot
      ctx.fillStyle = stroke.color
      ctx.arc(pts[0].x, pts[0].y, STROKE_WIDTH / 2, 0, Math.PI * 2)
      ctx.fill()
      return
    }
    ctx.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length - 1; i++) {
      const midX = (pts[i].x + pts[i + 1].x) / 2
      const midY = (pts[i].y + pts[i + 1].y) / 2
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY)
    }
    const last = pts[pts.length - 1]
    ctx.lineTo(last.x, last.y)
    ctx.stroke()
  }

  useEffect(() => {
    setupCanvas()
    const onResize = () => setupCanvas()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [setupCanvas])

  const pointFromEvent = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handlePointerDown = (e) => {
    e.preventDefault()
    canvasRef.current.setPointerCapture?.(e.pointerId)
    drawingRef.current = true
    const p = pointFromEvent(e)
    lastPointRef.current = p
    currentStrokeRef.current = { color: colorRef.current, points: [p] }
    strokesRef.current.push(currentStrokeRef.current)
  }

  const handlePointerMove = (e) => {
    if (!drawingRef.current) return
    e.preventDefault()
    const p = pointFromEvent(e)
    const stroke = currentStrokeRef.current
    if (!stroke) return
    stroke.points.push(p)
    // Incrementally draw the latest segment as a quad curve from the last
    // point through `p`, to keep the in-flight stroke as smooth as the
    // post-redraw version.
    const ctx = ctxRef.current
    if (!ctx) return
    ctx.strokeStyle = stroke.color
    const last = lastPointRef.current
    const midX = (last.x + p.x) / 2
    const midY = (last.y + p.y) / 2
    ctx.beginPath()
    ctx.moveTo(last.x, last.y)
    ctx.quadraticCurveTo(last.x, last.y, midX, midY)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(midX, midY)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    lastPointRef.current = p
  }

  const handlePointerUp = (e) => {
    if (!drawingRef.current) return
    drawingRef.current = false
    canvasRef.current.releasePointerCapture?.(e.pointerId)
    currentStrokeRef.current = null
    lastPointRef.current = null
  }

  const clearCanvas = () => {
    strokesRef.current = []
    redrawAll()
  }

  return (
    <div className="draw-root">
      <canvas
        ref={canvasRef}
        className="draw-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Toolbar — minimal floating controls, bottom-center */}
      <div className="draw-toolbar">
        <button
          type="button"
          className={`draw-swatch ${color === 'black' ? 'on' : ''}`}
          onClick={() => setColor('black')}
          aria-label="Black ink"
          title="Black"
        >
          <span className="draw-swatch-dot" style={{ background: COLORS.black }} />
        </button>
        <button
          type="button"
          className={`draw-swatch ${color === 'blue' ? 'on' : ''}`}
          onClick={() => setColor('blue')}
          aria-label="Blue ink"
          title="Blue"
        >
          <span className="draw-swatch-dot" style={{ background: COLORS.blue }} />
        </button>
        <span className="draw-divider" />
        <button
          type="button"
          className="draw-clear"
          onClick={clearCanvas}
          title="Clear canvas"
        >
          Clear
        </button>
      </div>

      {/* Scoped styles — keeps /draw isolated from the rest of the site. */}
      <style jsx global>{`
        body { background: #fff; overflow: hidden; }
        /* Hide the global site nav/footer on /draw — full-bleed canvas */
        body > nav,
        body > #stats-bar,
        body > .nav-progress,
        body > .site-footer,
        body > footer { display: none !important; }
        body > main { padding: 0 !important; margin: 0 !important; }
        .draw-root {
          position: fixed; inset: 0;
          background: #fff;
          /* Pen-cursor with hotspot at the pen tip (lower-left of the SVG) */
          cursor: url('/pen-cursor.svg') 1 18, crosshair;
          touch-action: none;
        }
        .draw-canvas {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          display: block;
          background: #fff;
        }
        .draw-toolbar {
          position: fixed;
          left: 50%;
          bottom: 24px;
          transform: translateX(-50%);
          display: flex; align-items: center; gap: 8px;
          padding: 8px 12px;
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 999px;
          box-shadow: 0 4px 16px rgba(0,0,0,.08);
          font-family: 'Ohno Softie', -apple-system, BlinkMacSystemFont, sans-serif;
          z-index: 10;
          /* Toolbar gets the default cursor so buttons feel clickable. */
          cursor: default;
        }
        .draw-swatch {
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid transparent;
          background: transparent;
          border-radius: 50%;
          cursor: pointer;
          padding: 0;
          transition: border-color .12s;
        }
        .draw-swatch:hover { border-color: #ddd; }
        .draw-swatch.on { border-color: #111; }
        .draw-swatch-dot {
          width: 18px; height: 18px;
          border-radius: 50%;
          display: block;
        }
        .draw-divider {
          width: 1px; height: 24px;
          background: #e5e5e5;
        }
        .draw-clear {
          font-size: 13px;
          font-weight: 500;
          color: #666;
          background: transparent;
          border: none;
          padding: 6px 12px;
          border-radius: 999px;
          cursor: pointer;
          font-family: inherit;
          transition: color .12s, background .12s;
        }
        .draw-clear:hover { color: #111; background: #f5f5f5; }
      `}</style>
    </div>
  )
}
