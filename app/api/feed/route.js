// GET  /api/feed              → list posts (public)
// POST /api/feed              → create post (admin only)
// DELETE /api/feed?id=...     → delete post (admin only)
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { readJSON, writeJSON } from '@/lib/storage'
import { requireAdmin } from '@/lib/admin'

const FILE = 'feed'
const VALID_KINDS = new Set(['sketch', 'image', 'video', 'text'])

// Accept either a local upload path (dev) or a Vercel Blob URL (prod).
function isOurMedia(url) {
  if (typeof url !== 'string') return false
  if (url.startsWith('/uploads/feed/')) return true
  try {
    const u = new URL(url)
    return u.hostname.endsWith('.public.blob.vercel-storage.com')
  } catch {
    return false
  }
}

export async function GET() {
  const posts = (await readJSON(FILE, [])) || []
  posts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  return NextResponse.json({ posts })
}

export async function POST(request) {
  try { await requireAdmin() }
  catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { kind, title, body: text, mediaUrl } = body || {}
  if (!VALID_KINDS.has(kind)) {
    return NextResponse.json({ error: 'Invalid kind' }, { status: 400 })
  }
  const safeTitle = String(title || '').slice(0, 200).trim()
  const safeBody  = String(text  || '').slice(0, 4000).trim()
  const safeMedia = isOurMedia(mediaUrl) ? mediaUrl : null
  if (!safeTitle && !safeBody && !safeMedia) {
    return NextResponse.json({ error: 'Empty post' }, { status: 400 })
  }

  const post = {
    id: crypto.randomUUID(),
    kind,
    title: safeTitle,
    body: safeBody,
    mediaUrl: safeMedia,
    createdAt: new Date().toISOString(),
  }

  const all = (await readJSON(FILE, [])) || []
  all.unshift(post)
  await writeJSON(FILE, all)
  return NextResponse.json({ post })
}

export async function DELETE(request) {
  try { await requireAdmin() }
  catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const all = (await readJSON(FILE, [])) || []
  const next = all.filter(p => p.id !== id)
  if (next.length === all.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  await writeJSON(FILE, next)
  return NextResponse.json({ ok: true })
}
