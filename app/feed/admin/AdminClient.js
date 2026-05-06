'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const KINDS = [
  { value: 'sketch', label: 'Sketch' },
  { value: 'image',  label: 'Image'  },
  { value: 'video',  label: 'Video'  },
  { value: 'text',   label: 'Text'   },
]

export default function AdminClient() {
  const router = useRouter()
  const [kind, setKind]   = useState('sketch')
  const [title, setTitle] = useState('')
  const [body, setBody]   = useState('')
  const [file, setFile]   = useState(null)
  const [busy, setBusy]   = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, isError = false) => {
    setToast({ msg, error: isError })
    setTimeout(() => setToast(null), 2500)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    if (!title.trim() && !body.trim() && !file) {
      showToast('Add a title, body, or media', true)
      return
    }
    setBusy(true)
    try {
      let mediaUrl = null
      if (file) {
        const fd = new FormData()
        fd.append('file', file)
        const up = await fetch('/api/feed/upload', { method: 'POST', body: fd })
        if (!up.ok) throw new Error('Upload failed')
        const j = await up.json()
        mediaUrl = j.url
      }
      const r = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, title: title.trim(), body: body.trim(), mediaUrl }),
      })
      if (!r.ok) throw new Error('Post failed')
      showToast('Posted')
      setTitle(''); setBody(''); setFile(null)
      // Soft refresh the feed
      setTimeout(() => router.push('/feed'), 600)
    } catch (err) {
      showToast(err.message || 'Failed', true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="composer">
      <div className="pd-field">
        <label className="pd-label" htmlFor="kind">Kind</label>
        <select
          id="kind"
          className="pd-select"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          {KINDS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
        </select>
      </div>

      <div className="pd-field">
        <label className="pd-label" htmlFor="title">Title (optional)</label>
        <input
          id="title"
          className="pd-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Day 14 — sketches"
        />
      </div>

      <div className="pd-field">
        <label className="pd-label" htmlFor="body">Body</label>
        <textarea
          id="body"
          className="pd-textarea"
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What's the story?"
        />
      </div>

      <div className="pd-field">
        <label className="pd-label" htmlFor="file">
          Media {kind === 'video' ? '(video file)' : '(image)'}
        </label>
        <input
          id="file"
          type="file"
          accept={kind === 'video' ? 'video/*' : 'image/*'}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {file && <div className="file-name">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</div>}
      </div>

      <div className="actions">
        <button type="button" className="pd-btn pd-btn--ghost" onClick={() => router.push('/feed')}>Cancel</button>
        <button type="submit" className="pd-btn pd-btn--primary" disabled={busy}>
          {busy ? 'Posting…' : 'Post'}
        </button>
      </div>

      {toast && <div className={`pd-toast show ${toast.error ? 'error' : 'ok'}`}>{toast.msg}</div>}
    </form>
  )
}
