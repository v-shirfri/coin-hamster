import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

function Layout() {
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = (): void => setScrollY(window.scrollY)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Coins parallax: moves at 0.5x scroll speed, capped at 100px (scaleY headroom).
  const bannerHeight = heroRef.current?.offsetHeight ?? 420
  const coinsParallaxY = Math.min(scrollY * 0.5, bannerHeight * 0.22)

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__content">
          <nav className="app-nav">
            <NavLink className="app-nav__link" to="/">Home</NavLink>
            <NavLink className="app-nav__link" to="/reports">Reports</NavLink>
            <NavLink className="app-nav__link" to="/ai-recommendation">AI Recommendation</NavLink>
            <NavLink className="app-nav__link" to="/about">About</NavLink>
          </nav>
        </div>

        <section className="hero-section" ref={heroRef}>
          <div className="hero-banner">
            <div className="hero-banner__base">
              <img
                className="hero-banner__base-image"
                src={`${import.meta.env.BASE_URL}hamster-bg.png`}
                alt="Hamster background"
              />
            </div>

            <div
              className="hero-banner__coins"
              style={{ transform: `translate3d(0, ${coinsParallaxY}px, 0)` }}
            >
              <img
                className="hero-banner__coins-image"
                src={`${import.meta.env.BASE_URL}coins-layer.png`}
                alt="Floating coins"
              />
            </div>

            <div className="hero-banner__overlay">
              <div className="hero-banner__content">
                <h2 className="hero-banner__title">Coin Hamster</h2>
              </div>
            </div>
          </div>
        </section>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout