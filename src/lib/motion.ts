import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, Flip);
gsap.defaults({ ease: "power3.out", duration: 0.7 });

export const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia(REDUCED_QUERY).matches;

/** Duration helper: collapses to 0 when the user prefers reduced motion. */
export const dur = (s: number) => (prefersReducedMotion() ? 0 : s);

export { gsap, ScrollTrigger, Flip, useGSAP };

// Late-loading fonts/images shift layout; re-measure trigger positions once ready.
if (typeof window !== "undefined") {
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
