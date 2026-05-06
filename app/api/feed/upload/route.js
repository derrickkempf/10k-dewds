// POST /api/feed/upload  (multipart "file") → { url } (admin only)
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { saveUpload } from '@/lib/storage'

const MAX_BYTES = 50 * 1024 * 1024  // 50 MB

export async function POST(request) {
  try { await requireAdmin() }
  catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  let form
  try {
    form = await request.formData()
  } catch (err) {
    return NextResponse.json(
      { error: 'Could not parse upload', detail: err.message },
      { status: 400 }
    )
  }
  const file = form.get('file')
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (50MB max)' }, { status: 413 })
  }

  // On Vercel, saveUpload requires BLOB_READ_WRITE_TOKEN — without it the
  // fallback tries to write to the read-only filesystem and explodes.
  // Surface that clearly instead of a generic 500.
  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Server misconfigured: BLOB_READ_WRITE_TOKEN is not set on this deployment. Add it in Vercel → Project → Settings → Environment Variables, then redeploy.' },
      { status: 500 }
    )
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer())
    const url = await saveUpload(buf, file.name || 'upload')
    return NextResponse.json({ url })
  } catch (err) {
    console.error('[feed/upload] saveUpload failed:', err)
    return NextResponse.json(
      {
        error: 'Upload failed',
        detail: err?.message || 'Unknown error',
        code: err?.code || null,
      },
      { status: 500 }
    )
  }
}

export const config = {
  api: { bodyParser: false },
}
