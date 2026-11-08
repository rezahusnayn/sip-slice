import { useRef } from "react";
import { gsap, useGSAP, REDUCED_QUERY } from "../lib/motion";
import { CupMark, MonsteraLeaf } from "./Art";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED_QUERY}`, () => {
        // line-art leaves draw themselves in
        const paths = gsap.utils.toArray<SVGPathElement>(".hero .draw");
        paths.forEach((p) => {
          const len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.from(".hero__mark", { y: 24, opacity: 0, duration: 1 })
          .from(".hero__eyebrow", { y: 16, opacity: 0, duration: 0.8 }, "<0.15")
          .from(".hero__title .hero__line > span", { yPercent: 110, duration: 1.2, stagger: 0.12 }, "<0.1")
          .from(".hero__script", { opacity: 0, x: -20, duration: 1 }, "<0.5")
          .from(".hero__lede, .hero__ctas > *", { y: 20, opacity: 0, stagger: 0.08, duration: 0.9 }, "<0.2")
          .to(paths, { strokeDashoffset: 0, duration: 2.4, stagger: 0.05, ease: "power2.inOut" }, 0.2)
          .from(".hero__photo", { clipPath: "inset(100% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" }, 0.3);

        // steam loops gently
        gsap.to(".hero__mark .steam", {
          y: -4,
          opacity: 0.4,
          duration: 1.8,
          yoyo: true,
          repeat: -1,
          stagger: 0.4,
          ease: "sine.inOut",
        });

        // parallax drift on scroll
        gsap.to(".hero__leaf--a", {
          yPercent: -30,
          rotate: -8,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(".hero__photo img", {
          yPercent: 12,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
      });
      // matchMedia is created inside the useGSAP context, so it is reverted on unmount.
    },
    { scope: root },
  );

  return (
    <section id="top" className="hero" ref={root} aria-labelledby="hero-title">
      <MonsteraLeaf className="hero__leaf hero__leaf--a" />
      <MonsteraLeaf className="hero__leaf hero__leaf--b" />
      <div className="hero__copy">
        <CupMark className="hero__mark" />
        <p className="hero__eyebrow">Café · Kitchen · Coffee bar</p>
        <h1 id="hero-title" className="hero__title">
          <span className="hero__line">
            <span>Sip slowly.</span>
          </span>
          <span className="hero__line">
            <span>Savor every bite.</span>
          </span>
        </h1>
        <p className="hero__script" aria-label="Tagline: Beyond Just Coffee">
          Beyond Just Coffee
        </p>
        <p className="hero__lede">
          From creamy tomyam pasta to nasi lemak with rendang ayam, build your order, choose
          how you like it, and collect it fresh.
        </p>
        <div className="hero__ctas">
          <a className="btn btn--primary" href="#menu">
            Start your order
          </a>
          <a className="btn btn--ghost" href="#story">
            See the space
          </a>
        </div>
      </div>
      <figure className="hero__photo">
        <img
          src="/img/interior.webp"
          alt="Sip & Savor's interior: a navy mural wall with white monstera line art, brass lamps and the café logo."
          width="630"
          height="912"
          {...{ fetchpriority: "high" }}
        />
        <figcaption>Photo from the café's Instagram</figcaption>
      </figure>
    </section>
  );
}
