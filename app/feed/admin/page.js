import AdminClient from './AdminClient'
import { getAdminSession } from '@/lib/admin'

export const metadata = {
  title: 'New post — DEWDS',
}

export const dynamic = 'force-dynamic'

export default async function FeedAdminPage() {
  const session = await getAdminSession()
  if (!session) {
    return (
      <main className="pd-container">
        <div style={{ padding: 'var(--space-2xl) 0', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-md)' }}>Admin only</h1>
          <p style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-lg)' }}>
            Sign in via the DEWDs tracker first (Ctrl+Shift+A on <a href="/app.html" style={{ color: 'var(--color-accent)' }}>/app.html</a>).
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="pd-container">
      <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 500, marginBottom: 'var(--space-lg)', letterSpacing: '-0.02em' }}>
        New post
      </h1>
      <AdminClient />
    </main>
  )
}
