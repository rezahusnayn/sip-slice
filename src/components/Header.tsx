import { useEffect, useRef, useState } from "react";
import { useCart } from "../state/cart";
import { gsap, dur } from "../lib/motion";

type Props = { onOpenCart: () => void; onOpenSources: () => void };

export function Header({ onOpenCart, onOpenSources }: Props) {
  const { totals } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const badge = useRef<HTMLSpanElement>(null);
  const prevCount = useRef(totals.count);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Bump the badge whenever the item count rises.
  useEffect(() => {
    if (totals.count > prevCount.current && badge.current) {
      gsap.fromTo(
        badge.current,
        { scale: 1.6 },
        { scale: 1, duration: dur(0.6), ease: "elastic.out(1, 0.4)" },
      );
    }
    prevCount.current = totals.count;
  }, [totals.count]);

  return (
    <header className={`header ${scrolled ? "is-scrolled" : ""}`}>
      <a className="skip-link" href="#menu">
        Skip to menu
      </a>
      <a className="header__brand" href="#top" aria-label="Sip & Savor — back to top">
        <img src="/img/logo.webp" alt="" width="40" height="40" />
        <span>Sip &amp; Savor</span>
      </a>
      <nav className="header__nav" aria-label="Primary">
        <a href="#menu">Menu</a>
        <a href="#story">The Space</a>
        <a href="#visit">Visit</a>
        <button type="button" className="linklike" onClick={onOpenSources}>
          Data sources
        </button>
      </nav>
      <button
        type="button"
        className="cart-btn"
        id="cart-button"
        onClick={onOpenCart}
        aria-label={`Open cart, ${totals.count} item${totals.count === 1 ? "" : "s"}`}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Zm4 0V6a3 3 0 0 1 6 0v2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <span className="cart-btn__label">Cart</span>
        <span ref={badge} className="cart-btn__badge" aria-hidden="true">
          {totals.count}
        </span>
      </button>
    </header>
  );
}
