/**
 * VERIFIED FACTS
 * ---------------------------------------------------------------------------
 * Only details that can be read directly from the source material supplied by
 * the client (files in /Media: logo, Instagram screenshots, printed-menu photos,
 * and the Google listing text they pasted) belong here.
 * Anything not visible in those sources lives in `demo.ts` and is labelled as
 * illustrative in the UI.
 */

export type Source = {
  id: string;
  label: string;
  file: string;
};

export const SOURCES: Record<string, Source> = {
  logo: {
    id: "logo",
    label: "Brand logo",
    file: "Media/589130913_18317833579219538_6488502866199882990_n.jpg",
  },
  interior: {
    id: "interior",
    label: "Instagram – interior photo",
    file: "Media/Screenshot 2026-11-07 at 16-49-42 (3) Instagram.png",
  },
  shopfront: {
    id: "shopfront",
    label: "Instagram – shopfront video still",
    file: "Media/Screenshot 2026-11-07 at 16-50-23 (3) Instagram.png",
  },
  menuPhotos: {
    id: "menuPhotos",
    label: "Printed menu – 7 photos (Western, Meal, Tea & Sparkling, Matcha & Cocoa, Coffee, Set Menus)",
    file: "Media/menu/*.png",
  },
  googleListing: {
    id: "googleListing",
    label: "Google Maps listing text supplied by the client (address, phone, closing time, rating)",
    file: "(pasted in chat, 7 Nov 2026)",
  },
  menuGrid: {
    id: "menuGrid",
    label: "Instagram – menu post grid",
    file: "Media/Screenshot 2026-11-07 at 16-52-29 (3) Instagram.png",
  },
};

export const VERIFIED = {
  name: "Sip & Savor",
  tagline: "Beyond Just Coffee",
  /** Brand palette sampled from the logo + painted mural wall. */
  palette: { navy: "#11143a", silver: "#d9dbe3" },
  /** Observed in photos: navy mural wall with white line-art monstera leaves,
   *  brass wall lamps, chalkboard menus, fairy-lit shopfront with potted plants. */
  ambience: [
    "Navy mural wall with hand-drawn monstera line art",
    "Warm brass wall lamps and track lighting",
    "Chalkboard specials boards",
    "Fairy-lit shopfront lined with potted plants",
  ],
  /** From the Google Maps listing text the client pasted on 7 Nov 2026. */
  listing: {
    address: "12-4, Lorong Selangor, Taman Melawati, 53100 Kuala Lumpur",
    phone: "010-287 8614",
    closes: "12 am",
    pricePerPerson: "RM 20–40 (reported by 58 people)",
    rating: "4.8",
    reviewCount: 101,
    /** Most-mentioned topics in the Google review summary. */
    mentions: ["mee kari", "tiramisu", "nasi lemak", "belgium choc cheese"],
  },
} as const;
