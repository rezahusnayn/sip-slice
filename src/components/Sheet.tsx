import { useEffect, useRef, type ReactNode } from "react";
import { gsap, useGSAP, dur } from "../lib/motion";

type Props = {
  labelledBy: string;
  onClose: () => void;
  /** "drawer" slides from the right; "modal" rises centred (bottom sheet on mobile). */
  variant: "drawer" | "modal";
  children: (close: () => void) => ReactNode;
  className?: string;
};

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Accessible animated dialog: focus trap, Escape to close, focus restore,
 * background scroll lock, inert siblings, GSAP enter/exit.
 */
export function Sheet({ labelledBy, onClose, variant, children, className = "" }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  const { contextSafe } = useGSAP(
    () => {
      const from =
        variant === "drawer"
          ? { xPercent: 100 }
          : window.innerWidth < 640
            ? { yPercent: 100 }
            : { y: 40, opacity: 0, scale: 0.97 };
      gsap.from(".sheet__scrim", { opacity: 0, duration: dur(0.35), ease: "power1.out" });
      gsap.from(panel.current, { ...from, duration: dur(0.55), ease: "expo.out" });
    },
    { scope: root },
  );

  const close = contextSafe(() => {
    if (closing.current) return;
    closing.current = true;
    const to =
      variant === "drawer"
        ? { xPercent: 100 }
        : window.innerWidth < 640
          ? { yPercent: 100 }
          : { y: 30, opacity: 0, scale: 0.98 };
    gsap.to(".sheet__scrim", { opacity: 0, duration: dur(0.25) });
    gsap.to(panel.current, { ...to, duration: dur(0.3), ease: "power2.in", onComplete: onClose });
  });

  // focus management, scroll lock, inert background
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const appRoot = document.getElementById("app-shell");
    appRoot?.setAttribute("inert", "");
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const first = panel.current?.querySelector<HTMLElement>("[data-autofocus]") ??
      panel.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus({ preventScroll: true });

    return () => {
      appRoot?.removeAttribute("inert");
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, []);

  // Keyboard handling lives on the document so it still works when focus has
  // dropped to <body> (e.g. after a checkout step swaps its content).
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (!items.length) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;
      if (!panel.current.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div ref={root} className={`sheet sheet--${variant} ${className}`}>
      <div className="sheet__scrim" onClick={close} aria-hidden="true" />
      <div
        ref={panel}
        className="sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        {children(close)}
      </div>
    </div>
  );
}
