import './globals.css'
import Chrome from './components/Chrome'
import Footer from './components/Footer'

export const metadata = {
  title: 'DEWDS — 10,000 hand drawn DEWDs in 100 days',
  description: '10,000 hand drawn DEWDs in 100 days by Derrick Kempf.',
  icons: {
    icon: '/10k-dewd-ico.svg',
    apple: '/apple-touch-icon.png',
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
