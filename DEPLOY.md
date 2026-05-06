# Deploy Punk Dewds

## What you need

1. **Vercel account** (you have this)
2. **Vercel Postgres** — a Neon database, added from Vercel dashboard
3. **Resend account** — free tier at resend.com (3,000 emails/month)
4. **A domain** — verified in Resend so emails come from your address
5. **Stripe account** — for $10 original purchases (stripe.com)
6. **MetaMask or similar** — for minting to the ERC-1155 contract

## Steps

### 1. Push to GitHub

```bash
cd punk-dewds
git init
git add .
git commit -m "initial commit"
gh repo create punk-dewds --private --push
```

### 2. Connect to Vercel

Go to vercel.com/new, import the `punk-dewds` repo. Vercel auto-detects Next.js.

### 3. Add Vercel Postgres

In your Vercel project dashboard:
- Go to **Storage** → **Create Database** → **Postgres (Neon)**
- This automatically adds `POSTGRES_URL` to your environment variables

### 4. Set up Resend

- Sign up at [resend.com](https://resend.com)
- Verify your domain (or use their test domain to start)
- Copy your API key

### 5. Add environment variables

In Vercel dashboard → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | Your Resend API key |
| `SESSION_SECRET` | Run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `FROM_EMAIL` | `Punk Dewds <hello@yourdomain.com>` |
| `ADMIN_HASH` | `1b8b39e2e32eb3491dd00a85126073fff218f7d75b8f12d9b922757bc8595ca5` (default password: punkdewds) |
| `STRIPE_SECRET_KEY` | Your Stripe secret key (starts with `sk_`) |
| `NEXT_PUBLIC_URL` | Your production URL (e.g. `https://punkdewds.com`) |

(`POSTGRES_URL` is already set from step 3)

### 6. Run database setup

After first deploy, run the setup script to create tables:

```bash
# Clone env vars locally
vercel env pull .env.local

# Run setup
npm run db:setup
```

Or run it via Vercel's serverless function by hitting the endpoint once.

### 7. Deploy

```bash
vercel --prod
```

Or just push to main — Vercel auto-deploys.

## Exporting emails

Visit this URL to get all collected emails (replace YOUR_PASSWORD with your admin password):

```
https://yourdomain.com/api/emails?secret=YOUR_PASSWORD
```

Add `&format=csv` to download as CSV:

```
https://yourdomain.com/api/emails?secret=YOUR_PASSWORD&format=csv
```

## Changing the admin password

```bash
node -e "require('crypto').createHash('sha256').update('your-new-password').digest('hex')"
```

Update `ADMIN_HASH` in Vercel environment variables with the output.
