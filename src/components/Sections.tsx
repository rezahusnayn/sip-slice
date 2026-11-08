import { useRef } from "react";
import { gsap, useGSAP, REDUCED_QUERY } from "../lib/motion";
import { VERIFIED } from "../data/verified";
import { MonsteraLeaf } from "./Art";

export function Story() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED_QUERY}`, () => {
        gsap.from(".story__copy > *", {
          y: 30,
          opacity: 0,
          stagger: 0.1,
          scrollTrigger: { trigger: ".story__copy", start: "top 80%" },
        });
        gsap.utils.toArray<HTMLElement>(".story__frame").forEach((f, i) => {
          gsap.from(f, {
            clipPath: "inset(18% 18% 18% 18% round 24px)",
            duration: 1.3,
            ease: "expo.out",
            scrollTrigger: { trigger: f, start: "top 85%" },
          });
          gsap.fromTo(
            f.querySelector("img"),
            { yPercent: -8 },
            {
              yPercent: 8,
              ease: "none",
              scrollTrigger: { trigger: f, start: "top bottom", end: "bottom top", scrub: 0.6 + i * 0.3 },
            },
          );
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="story" className="story" ref={root} aria-labelledby="story-title">
      <div className="story__copy">
        <p className="eyebrow">The space</p>
        <h2 id="story-title">A navy room for long conversations.</h2>
        <p>
          Hand-drawn monstera leaves climb the walls, brass lamps glow over every table, and the
          chalkboards list the day's specials. It's a café for a slow coffee or a proper meal.
        </p>
        <ul className="story__facts" aria-label="What the photos show">
          {VERIFIED.ambience.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>
      <div className="story__gallery">
        <figure className="story__frame story__frame--tall">
          <img
            src="/img/shopfront.webp"
            alt="The Sip & Savor shopfront at dusk: glass doors framed by fairy lights and potted plants."
            loading="lazy"
            width="512"
            height="820"
          />
          <figcaption>The shopfront, lit up at dusk</figcaption>
        </figure>
        <figure className="story__frame">
          <img
            src="/img/interior.webp"
            alt="Dining area with dark tables and black chairs in front of the navy mural wall."
            loading="lazy"
            width="630"
            height="912"
          />
          <figcaption>The mural wall</figcaption>
        </figure>
      </div>
    </section>
  );
}

const L = VERIFIED.listing;

export function Visit() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED_QUERY}`, () => {
        gsap.from(".visit__card", {
          y: 50,
          opacity: 0,
          stagger: 0.12,
          scrollTrigger: { trigger: root.current, start: "top 75%" },
        });
        gsap.to(".visit__leaf", {
          rotate: 12,
          yPercent: -20,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="visit" className="visit" ref={root} aria-labelledby="visit-title">
      <MonsteraLeaf className="visit__leaf" />
      <h2 id="visit-title">Come say hello</h2>
      <div className="visit__grid">
        <article className="visit__card">
          <h3>Find us</h3>
          <address className="visit__addr">{L.address}</address>
          <p>
            <a href={`tel:${L.phone.replace(/[\s-]/g, "")}`}>{L.phone}</a>
          </p>
          <dl>
            <div>
              <dt>Closes</dt>
              <dd>{L.closes}</dd>
            </div>
            <div>
              <dt>Price per person</dt>
              <dd>{L.pricePerPerson}</dd>
            </div>
          </dl>
          <p className="fineprint">From the café's Google listing. Opening time isn't listed there; please confirm before visiting.</p>
        </article>
        <article className="visit__card">
          <h3>On Google</h3>
          <p className="visit__rating">
            <strong>{L.rating}</strong> <span aria-hidden="true">★</span>
            <span className="visually-hidden"> out of 5</span> · {L.reviewCount} reviews
          </p>
          <p>Guests mention most often:</p>
          <ul className="visit__tags">
            {L.mentions.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </article>
        <article className="visit__card">
          <h3>
            How ordering works <span className="pill pill--demo">Prototype</span>
          </h3>
          <ol className="visit__steps">
            <li>Choose your dishes and how you like them</li>
            <li>Pick self-pickup or dine-in</li>
            <li>Pay at the counter or online (simulated here)</li>
          </ol>
        </article>
      </div>
    </section>
  );
}

export function Footer({ onOpenSources }: { onOpenSources: () => void }) {
  return (
    <footer className="footer">
      <div className="footer__brand">
        <img src="/img/logo.webp" alt="Sip & Savor logo" width="72" height="72" loading="lazy" />
        <p className="footer__script">{VERIFIED.tagline}</p>
      </div>
      <p className="footer__note">
        Unofficial interactive prototype. It doesn't take real orders or payments, and it doesn't
        collect any data. The menu and prices come from Sip &amp; Savor's printed menu, the photos from
        its Instagram, and the address from its Google listing. Ordering, pickup slots and the promo
        code are simulated.{" "}
        <button type="button" className="linklike" onClick={onOpenSources}>
          See data sources
        </button>
      </p>
    </footer>
  );
}
