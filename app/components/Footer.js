// Footer — mirrors .site-footer + .bottom-section from /app.html.
// Support sticker + social links + copyright.
export default function Footer() {
  return (
    <>
      <div className="bottom-section">
        <a href="https://dewd.cool" target="_blank" rel="noopener" className="support-link">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/support-sticker-cream.svg" alt="Support your local artist" />
        </a>
      </div>

      <footer className="site-footer">
        <div className="footer-links">
          <a href="https://x.com/derrickkempf" target="_blank" rel="noopener">X</a>
          <a href="https://instagram.com/derrickkempf" target="_blank" rel="noopener">IG</a>
          <a href="https://dewd.cool" target="_blank" rel="noopener">dewd.cool</a>
        </div>
        <div className="footer-copy">&copy; Derrick Kempf (DEWD)</div>
      </footer>
    </>
  )
}
