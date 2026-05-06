# DEWDS

**10,000 hand-drawn DEWDs.**

Every original DEWD, drawn by hand, one at a time. The goal: 100 days. That's 100 drawings a day. Six days into the challenge the project pivoted away from using an existing IP (CryptoPunks) as reference, to drawing original ideas in the moment. This app tracks progress from DEWD #0000 to DEWD #9999.

**Live site:** [punk.dewd.cool](https://punk.dewd.cool/app.html)

---

## What It Does

DEWDS is a progress tracker and gallery for hand-drawing 10,000 DEWDs. Visitors can browse the full collection, see which DEWDs have been drawn, vote for favorites, and leave comments. An admin panel powers the drawing workflow with batch upload tools, status tracking, and a daily practice log.

### Features

- **10K DEWD grid** — browse, search, filter, and sort all 10,000 DEWDs
- **Drawing uploads** — individual or batch upload via a grid cropper tool that slices scanned sheets into individual tiles
- **SVG optimization** — auto-optimizes uploaded SVGs via SVGO for on-chain minting
- **Voting and comments** — email-authenticated community interaction on each DEWD
- **Daily tracker** — log daily drawing sessions with streak tracking
- **Feed** — post text, sketch, image, and video updates on the creative process
- **Admin panel** — password-gated upload, status management, and batch tools

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Frontend | Vanilla JS single-page app (`public/app.html`) |
| Database | [Neon Postgres](https://neon.tech) (KV store + user tables) |
| File storage | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) |
| Auth | HMAC-signed httpOnly cookies (admin), email verification codes (users) |
| Email | [Resend](https://resend.com) |
| Hosting | [Vercel](https://vercel.com) behind [Cloudflare](https://cloudflare.com) proxy |
| Blockchain | [ethers.js](https://ethers.org) (future on-chain minting) |

## Project Structure

```
punk-dewds/
├── public/
│   └── app.html              # Main UI — all HTML/CSS/JS in one file
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── login/route.js    # POST — admin password auth
│   │   │   └── session/route.js  # GET — check admin session
│   │   ├── daily/route.js        # GET/POST — daily task tracker
│   │   ├── feed/
│   │   │   ├── route.js          # GET/POST/DELETE — feed posts
│   │   │   └── upload/route.js   # POST — file uploads to Vercel Blob
│   │   └── punks/route.js        # GET/POST — punk data (art URLs, status, votes)
│   ├── layout.js                 # Root layout (nav, footer, lottie logo)
│   └── globals.css               # Shared styles
├── lib/
│   ├── db.js                 # Postgres pool + auto-migration
│   ├── db-setup.mjs          # Manual table creation script
│   ├── storage.js            # KV read/write + Blob uploads
│   └── admin.js              # HMAC cookie auth
├── middleware.js              # CORS for Cloudflare proxy
├── next.config.mjs
└── package.json
```

## Getting Started

```bash
# Install dependencies
npm install

# Set up local environment
cp .env.example .env.local
# Fill in your environment variables

# Create database tables
npm run db:setup

# Start dev server
npm run dev
```

The app will be available at `http://localhost:3000/app.html`.

## How the Grid Cropper Works

The admin panel includes a batch cropper for processing scanned sheets of hand-drawn DEWDs:

1. Upload a scanned image (e.g. a 12x9 inch sheet)
2. Set the grid dimensions (columns x rows) and starting DEWD number
3. Click "Crop & Preview" to slice the sheet into individual tiles
4. Select/deselect tiles you want to keep
5. Download as ZIP or upload directly — each tile auto-links to its DEWD by filename (e.g. `0042.png` maps to DEWD #42)

## License

All content, drawings, and code are property of Derrick Kempf / [dewd.cool](https://dewd.cool). The first six days referenced CryptoPunks (intellectual property held by Infinite NODE Foundation); after that this project documents original hand-drawn DEWDs and is not affiliated with NODE or CryptoPunks.
