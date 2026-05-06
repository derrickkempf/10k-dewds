import Link from 'next/link'
import { readJSON } from '@/lib/storage'
import { getAdminSession } from '@/lib/admin'

export const metadata = {
  title: 'Feed — DEWDS',
  description: 'Sketches, videos, and posts from the daily practice.',
}

export const dynamic = 'force-dynamic'

function formatRelative(iso) {
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const day = 86_400_000
  const min = 60_000
  if (diff < min)        return 'just now'
  if (diff < 60 * min)   return `${Math.floor(diff / min)}m ago`
  if (diff < 24 * 60 * min) return `${Math.floor(diff / 3_600_000)}h ago`
  if (diff < 7 * day)    return `${Math.floor(diff / day)}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function PostCard({ post }) {
  return (
    <article className="post">
      <header className="post-head">
        <span className={`post-kind k-${post.kind}`}>{post.kind}</span>
        <span className="post-time">{formatRelative(post.createdAt)}</span>
      </header>
      {post.title && <h2 className="post-title">{post.title}</h2>}
      {post.body && <p className="post-body">{post.body}</p>}
      {post.mediaUrl && post.kind === 'video' && (
        <video className="post-media" src={post.mediaUrl} controls preload="metadata" />
      )}
      {post.mediaUrl && post.kind !== 'video' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="post-media" src={post.mediaUrl} alt={post.title || 'post'} />
      )}
    </article>
  )
}

export default async function FeedPage() {
  const posts = (await readJSON('feed', [])) || []
  posts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  const adminSession = await getAdminSession()
  const isAdmin = !!adminSession

  return (
    <>
      <main className="pd-container">
        <div className="feed-head">
          <div>
            <h1 className="feed-title">Feed</h1>
            <p className="feed-sub">Sketches, videos, and posts from the daily practice.</p>
          </div>
          {isAdmin && (
            <Link href="/feed/admin" className="pd-btn pd-btn--primary">+ New post</Link>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="empty">
            <p>Nothing here yet.</p>
            {isAdmin && <p className="empty-sub"><Link href="/feed/admin">Write the first post →</Link></p>}
          </div>
        ) : (
          <div className="posts">
            {posts.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </main>

    </>
  )
}
