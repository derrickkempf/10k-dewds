// GET  /api/punks  → returns saved punk data (public)
// POST /api/punks  → body { punks } (admin only) — saves punk data
import { NextResponse } from 'next/server'
import { readJSON, writeJSON } from '@/lib/storage'
import { requireAdmin } from '@/lib/admin'

const KEY = 'punks'

export async function GET() {
  const data = (await readJSON(KEY, {})) || {}
  return NextResponse.json(data)
}

export async function POST(request) {
  try { await requireAdmin() }
  catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  await writeJSON(KEY, body)
  return NextResponse.json({ ok: true })
}
