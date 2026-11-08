import { gsap, prefersReducedMotion } from "./motion";

/** Animates a small token from `from` to the header cart button. Purely decorative. */
export function flyToCart(from: Element | null) {
  const target = document.getElementById("cart-button");
  if (!from || !target || prefersReducedMotion()) return;
  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const dot = document.createElement("div");
  dot.className = "fly-dot";
  dot.setAttribute("aria-hidden", "true");
  document.body.appendChild(dot);
  const sx = a.left + a.width / 2;
  const sy = a.top + a.height / 2;
  const ex = b.left + b.width / 2;
  const ey = b.top + b.height / 2;
  gsap.set(dot, { x: sx, y: sy, xPercent: -50, yPercent: -50 });
  const tl = gsap.timeline({ onComplete: () => dot.remove() });
  tl.to(dot, { x: ex, duration: 0.75, ease: "power1.inOut" }, 0)
    .to(dot, { y: Math.min(sy, ey) - 80, duration: 0.35, ease: "power2.out" }, 0)
    .to(dot, { y: ey, duration: 0.4, ease: "power2.in" }, 0.35)
    .to(dot, { scale: 0.3, opacity: 0.2, duration: 0.2 }, 0.6);
}
