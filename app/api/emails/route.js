// GET /api/emails?secret=ADMIN_HASH
// Export all collected emails. Protected by admin hash.
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import crypto from 'crypto'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  // Verify admin access
  const hash = crypto.createHash('sha256').update(secret || '').digest('hex')
  if (hash !== process.env.ADMIN_HASH) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const users = await query(
    `SELECT email, created_at FROM users ORDER BY created_at DESC`
  )

  // Support CSV download
  const format = searchParams.get('format')
  if (format === 'csv') {
    const csv = 'email,signed_up\n' + users.map(u =>
      `${u.email},${u.created_at}`
    ).join('\n')
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=punk-dewds-emails.csv',
      },
    })
  }

  return NextResponse.json({ total: users.length, users })
}
