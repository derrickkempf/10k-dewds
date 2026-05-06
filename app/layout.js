import './globals.css'
import Script from 'next/script'
import Chrome from './components/Chrome'
import Footer from './components/Footer'

export const metadata = {
  title: 'DEWDS — 10,000 hand drawn DEWDs in 100 days',
  description: '10,000 hand drawn DEWDs in 100 days by Derrick Kempf.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* dotlottie-wc registers <dotlottie-wc> as a custom element so the
            logo in the nav animates the same way it does on /app.html. */}
        <Script
          src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.10/dist/dotlottie-wc.js"
          type="module"
          strategy="beforeInteractive"
        />
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
