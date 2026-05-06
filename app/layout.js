import './globals.css'
import Chrome from './components/Chrome'
import Footer from './components/Footer'

export const metadata = {
  metadataBase: new URL('https://10k.dewd.cool'),
  title: 'DEWDS — 10,000 hand drawn DEWDs in 100 days',
  description: '10,000 hand drawn DEWDs in 100 days by Derrick Kempf.',
  icons: {
    icon: '/10k-dewd-ico.svg',
    apple: '/10k-dewd-ico.svg',
  },
  openGraph: {
    type: 'website',
    siteName: 'DEWDS',
    title: 'DEWDS',
    description: '10,000 hand drawn DEWDs in 100 days.',
    url: 'https://10k.dewd.cool/',
    images: [
      {
        url: '/10k-dewds-social-share.jpg',
        width: 1200,
        height: 630,
        alt: 'DEWDS — 10,000 hand drawn DEWDs in 100 days',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DEWDS',
    description: '10,000 hand drawn DEWDs in 100 days.',
    images: ['/10k-dewds-social-share.jpg'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Chrome renders the nav + progress bar + stats drawer + about modal
            so they work on every page (not just /app.html). */}
        <Chrome />
        {children}
        {/* Footer — same as .site-footer in /app.html */}
        <Footer />
      </body>
    </html>
  )
}
