# Sip & Savor — Interactive Ordering Prototype

A portfolio-quality, **simulated** ordering website for Sip & Savor ("Beyond Just Coffee").
It makes no real orders or payments and collects no data. The app makes no network calls.

**Stack:** React 18, TypeScript (strict), Vite 8, GSAP 3 (`@gsap/react` useGSAP, ScrollTrigger, Flip),
self-hosted fonts (Fraunces, Manrope, Italianno).

## Run it

> The folder name contains `&`, which breaks npm's Windows `.cmd` shims, so the scripts call
> `node` directly. Use the npm scripts below rather than `npx`.

```bash
npm install
npm run dev        # http://127.0.0.1:5174
npm run build      # type-check + production build to dist/
npm run preview    # serve dist/ at http://127.0.0.1:5175 (with the strict CSP)
```

## Verified facts vs. demo data

| Source | What's verified |
|---|---|
| `Media/menu/*.png` (7 printed-menu photos) | Item names, descriptions, prices, H/C prices, add-ons, Solo and Couple set menus with normal prices |
| Google listing text (supplied by the client) | Address, phone 010-287 8614, closes 12 am, RM 20–40 per person, 4.8 rating from 101 reviews, most-mentioned dishes |
| `Media/…_n.jpg` (logo) | Name, tagline "Beyond Just Coffee", navy and silver palette |
| Instagram photos | Interior, shopfront and dish photos; Lemon Cream Cheese croissant RM 12.90 |

**Interpretations** (listed in the in-app "Data sources" dialog):
- Classic coffees are offered hot only, because the cold column isn't legible.
- In the set menus, "any coffee" is shown as the classic coffee list.
- The Couple Full Meal drink is treated as a single choice.
- The lemon soda photo is shown on Fresh Sparkle.

**Left out:** Strawberry Matcha Latte, Ocean Mist Latte and Spanish Latte, because their prices aren't legible in the photos.

**Demo:** online ordering itself, pickup slots, table numbers, the promo code `SIPDEMO10`, and marketing copy.

**Not available:** opening time.

## Features
- Menu with category filter (GSAP Flip) and search
- Variant and option dialog: single-choice and multi-choice groups, price changes, kitchen note, quantity
- Quick-add with a fly-to-cart animation and a badge bump
- Cart drawer:
  - identical configurations merge into one line;
  - edit a line's options, change quantity, or remove it (with an animation);
  - demo promo code, subtotal, discount and total.
- Cart saved in `localStorage`. It holds cart contents only, never personal details, and is
  **re-validated against the catalogue on load**.
- Three-step simulated checkout:
  - pickup with time slots, or dine-in with a table number;
  - name and Malaysian mobile number checks;
  - pay at counter, or simulated FPX/card. It never asks for card or bank details.
  - confirmation with a demo order number and receipt.
- Accessibility:
  - skip link and focus-trapped dialogs, with `inert` set on the background;
  - Escape to close, and focus restored afterwards;
  - live regions for announcements, and labelled controls;
  - 44px touch targets;
  - `prefers-reduced-motion` turns off scroll and intro animation.
- Responsive layout: bottom-sheet dialogs and a floating cart bar on mobile.
- Security: strict CSP injected in production builds, no third-party origins, no asset inlining,
  and free text is sanitised.

## Tested (manually, in a browser)
Desktop and 375px mobile:
- filter, search and quick-add;
- custom options and price maths ((23.90 + 5.00) × 2 = 57.80);
- line merging and editing a line;
- invalid and valid promo codes (10% of 83.60 = 8.36);
- checkout validation and focus on the first invalid field;
- simulated payment, confirmation, and the cart clearing;
- Escape-to-close when focus has fallen to `<body>`;
- recovery from a tampered `localStorage` cart;
- no horizontal overflow on mobile;
- the production build loads with zero console errors under the CSP.

**Not tested:**
- reduced-motion mode, in a real browser (the code path exists);
- screen readers;
- Safari and Firefox.

There are no automated tests yet.
