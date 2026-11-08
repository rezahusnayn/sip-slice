import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, PRODUCTS, type CategoryId, type Product } from "../data/menu";
import { defaultSelection, formatRM } from "../lib/pricing";
import { useCart } from "../state/cart";
import { Flip, gsap, useGSAP, dur, REDUCED_QUERY, ScrollTrigger } from "../lib/motion";
import { flyToCart } from "../lib/flyToCart";

type Filter = "all" | CategoryId;

type Props = {
  onCustomise: (p: Product) => void;
  onAdded: (msg: string) => void;
};

export function Menu({ onCustomise, onAdded }: Props) {
  const root = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const { add } = useCart();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        (filter === "all" || p.category === filter) &&
        (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
    );
  }, [filter, query]);

  const captureFlip = () => {
    if (!grid.current) return;
    const cards = grid.current.querySelectorAll(".card");
    // Finish any pending scroll-reveal so Flip starts from clean, final positions.
    gsap.killTweensOf(cards);
    gsap.set(cards, { clearProps: "opacity,transform" });
    flipState.current = Flip.getState(cards);
  };

  // Animate layout changes after the filter re-renders.
  // Cards stay in normal document flow (no `absolute`), so the menu never
  // collapses mid-animation and the sticky filter bar stays put. Flip only
  // animates transforms from each card's old position to its new one.
  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state || !grid.current) return;
    flipState.current = null;
    // The page height has already changed: re-measure scroll triggers before painting.
    ScrollTrigger.refresh();
    Flip.from(state, {
      targets: grid.current.querySelectorAll(".card"),
      duration: dur(0.5),
      ease: "power2.out",
      scale: false,
      onEnter: (els) =>
        gsap.fromTo(els, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: dur(0.45), stagger: 0.02, overwrite: true }),
    });
  }, [visible]);

  // Scroll reveal for the section heading + first paint of cards.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED_QUERY}`, () => {
        gsap.from(".menu__head > *", {
          y: 30,
          opacity: 0,
          stagger: 0.1,
          scrollTrigger: { trigger: ".menu__head", start: "top 85%" },
        });
        // Reveal cards/rows in small batches as each one scrolls into view.
        gsap.set(".card", { y: 40, opacity: 0 });
        ScrollTrigger.batch(".card", {
          start: "top 92%",
          once: true,
          onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, stagger: 0.06, duration: 0.7, overwrite: true }),
        });
      });
    },
    { scope: root },
  );

  const quickAdd = (p: Product, btn: HTMLElement) => {
    add(p.id, defaultSelection(p), "", 1);
    flyToCart(btn);
    onAdded(`${p.name} added to cart`);
  };

  return (
    <section id="menu" className="menu" ref={root} aria-labelledby="menu-title">
      <div className="menu__head">
        <p className="eyebrow">Order ahead · Pickup or dine-in</p>
        <h2 id="menu-title">The menu</h2>
        <p className="menu__note">
          Names, prices, hot/cold options and add-ons are taken from Sip &amp; Savor's printed menu
          (pictures are for illustration, as the menu itself notes). Ordering here is a{" "}
          <span className="pill pill--demo">Simulation</span>. Nothing reaches the café.
        </p>
      </div>

      <div className="menu__controls">
        <div className="chips" role="group" aria-label="Filter by category">
          {[{ id: "all" as const, label: "All" }, ...CATEGORIES].map((c) => (
            <button
              key={c.id}
              type="button"
              className="chip"
              aria-pressed={filter === c.id}
              onClick={() => {
                if (filter === c.id) return;
                captureFlip();
                setFilter(c.id);
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
        <label className="search">
          <span className="visually-hidden">Search the menu</span>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Search: tomyam, latte…"
            value={query}
            maxLength={40}
            onChange={(e) => {
              captureFlip();
              setQuery(e.target.value);
            }}
          />
        </label>
      </div>

      <p className="visually-hidden" aria-live="polite">
        {visible.length} item{visible.length === 1 ? "" : "s"} shown
      </p>

      <div ref={grid}>
        {visible.some((p) => p.photo) && (
          <ul className="grid">
            {visible.filter((p) => p.photo).map((p) => (
              <li key={p.id} className="card" data-flip-id={p.id}>
                <button type="button" className="card__media" onClick={() => onCustomise(p)} aria-label={`Customise ${p.name}`}>
                  <img src={p.photo} alt="" loading="lazy" width="353" height="353" />
                  <span className="card__badges">
                    {!p.priceVerified || !p.nameVerified ? (
                      <span className="pill pill--demo">Demo item</span>
                    ) : p.tags?.[0] ? (
                      <span className="pill pill--tag">{p.tags[0]}</span>
                    ) : null}
                  </span>
                </button>
                <div className="card__body">
                  <h3 className="card__title">{p.name}</h3>
                  <p className="card__desc">{p.description}</p>
                  <div className="card__foot">
                    <Price p={p} />
                    <Actions p={p} onCustomise={onCustomise} quickAdd={quickAdd} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {visible.some((p) => !p.photo) && (
          <ul className="mlist">
            {visible.filter((p) => !p.photo).map((p) => (
              <li key={p.id} className="card mrow" data-flip-id={p.id}>
                <div className="mrow__text">
                  <h3 className="mrow__title">
                    <button type="button" className="mrow__name" onClick={() => onCustomise(p)}>
                      {p.name}
                    </button>
                    {p.tags?.[0] && <span className="pill pill--tag">{p.tags[0]}</span>}
                  </h3>
                  <p className="mrow__desc">{p.description}</p>
                  <Price p={p} />
                </div>
                <Actions p={p} onCustomise={onCustomise} quickAdd={quickAdd} />
              </li>
            ))}
          </ul>
        )}
      </div>
      {visible.length === 0 && (
        <p className="empty">
          Nothing matches “{query}”.{" "}
          <button
            type="button"
            className="linklike"
            onClick={() => {
              captureFlip();
              setQuery("");
              setFilter("all");
            }}
          >
            Clear filters
          </button>
        </p>
      )}
    </section>
  );
}

/** "RM 9.90" or, for drinks with H/C columns on the menu, "H RM 9.90 · C RM 10.90". */
function priceLabel(p: Product): string {
  const temp = p.options.find((g) => g.id === "temp" && g.choices.some((c) => c.id === "cold" && c.delta > 0));
  if (!temp) return formatRM(p.price);
  const cold = temp.choices.find((c) => c.id === "cold")!;
  return `H ${formatRM(p.price)} · C ${formatRM(p.price + cold.delta)}`;
}

function Price({ p }: { p: Product }) {
  return (
    <span className="card__price">
      {priceLabel(p)}
      {p.normalPrice && (
        <s className="card__np" aria-label={`Normal price ${formatRM(p.normalPrice)}`}>
          {formatRM(p.normalPrice)}
        </s>
      )}
      {!p.priceVerified && <span className="card__price-note"> demo</span>}
    </span>
  );
}

function Actions({
  p,
  onCustomise,
  quickAdd,
}: {
  p: Product;
  onCustomise: (p: Product) => void;
  quickAdd: (p: Product, btn: HTMLElement) => void;
}) {
  return (
    <div className="card__actions">
      {p.options.length > 0 && (
        <button type="button" className="btn btn--text" onClick={() => onCustomise(p)} aria-label={`Customise ${p.name}`}>
          Customise
        </button>
      )}
      <button
        type="button"
        className="btn btn--icon"
        aria-label={`Quick add ${p.name}${p.options.length ? " with default options" : ""}`}
        onClick={(e) => quickAdd(p, e.currentTarget)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
