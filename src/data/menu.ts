/**
 * MENU CATALOGUE — transcribed from Sip & Savor's printed menu
 * ---------------------------------------------------------------------------
 * Source: photos of the café's menu supplied by the client on 8 Nov 2026
 * (Western, Meal, Tea, Sparkling, Matcha, Cocoa, Coffee, Special Coffee,
 * Solo and Couple set menus). Item names, descriptions, H/C prices,
 * add-ons and set contents follow that menu.
 *
 * Provenance flags:
 *   nameVerified / priceVerified – read from the menu photos (or Instagram)
 *   optionsVerified              – every option and price delta is on the menu
 *   photo                        – the café's own photo (cropped from Instagram)
 *
 * Deliberately EXCLUDED because the price is unreadable in the photos:
 *   Strawberry Matcha Latte, Ocean Mist Latte, Spanish Latte (see SourcesDialog).
 *
 * All money values are integers in sen (RM 1.00 = 100).
 */

export type CategoryId = "mains" | "sets" | "pastry" | "coffee" | "matcha-cocoa" | "tea" | "sparkling";

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "mains", label: "Western & Meals" },
  { id: "sets", label: "Set Menus" },
  { id: "coffee", label: "Coffee" },
  { id: "matcha-cocoa", label: "Matcha & Cocoa" },
  { id: "tea", label: "Tea" },
  { id: "sparkling", label: "Sparkling" },
  { id: "pastry", label: "Pastry" },
];

export type Choice = { id: string; label: string; delta: number };

export type OptionGroup = {
  id: string;
  label: string;
  /** single = radio (one required), multi = checkboxes (optional) */
  type: "single" | "multi";
  choices: Choice[];
  /** default choice id for single groups */
  defaultId?: string;
};

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  price: number;
  /** Set menus: the "NP" (normal price) printed on the menu. */
  normalPrice?: number;
  nameVerified: boolean;
  priceVerified: boolean;
  optionsVerified: boolean;
  photo?: string;
  /** Initials for typographic cards when no photo exists. */
  monogram?: string;
  tags?: string[];
  options: OptionGroup[];
};

/* ---- helpers ---------------------------------------------------------------- */

const rm = (n: number) => Math.round(n * 100);

/** Hot / Cold pricing exactly as printed in the menu's H and C columns. */
const hc = (hot: number, cold: number): OptionGroup => ({
  id: "temp",
  label: "Hot or cold",
  type: "single",
  defaultId: "hot",
  choices: [
    { id: "hot", label: "Hot", delta: 0 },
    { id: "cold", label: "Cold", delta: rm(cold) - rm(hot) },
  ],
});

const single = (id: string, label: string, choices: [string, string, number?][], defaultId?: string): OptionGroup => ({
  id,
  label,
  type: "single",
  defaultId: defaultId ?? choices[0]![0],
  choices: choices.map(([cid, l, d = 0]) => ({ id: cid, label: l, delta: rm(d) })),
});

const multi = (id: string, label: string, choices: [string, string, number][]): OptionGroup => ({
  id,
  label,
  type: "multi",
  choices: choices.map(([cid, l, d]) => ({ id: cid, label: l, delta: rm(d) })),
});

const initials = (name: string) =>
  name
    .replace(/\(.*?\)/g, "")
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

/** Set-menu coffee choice. "Any coffee" is on the menu; the list below is the café's
 *  classic coffee menu. The +RM5 latte upgrade is printed under the set menus. */
const setCoffee = (n?: number): OptionGroup[] => [
  single(n ? `coffee${n}` : "coffee", n ? `Coffee ${n}` : "Coffee", [
    ["americano", "Americano"],
    ["cappuccino", "Cappuccino"],
    ["latte", "Latte"],
    ["flatwhite", "Flat White"],
    ["mocha", "Mocha"],
    ["macchiato", "Caramel Macchiato"],
    ["cheesecake", "Cloud Cheesecake Latte (+RM5)", 5],
    ["tiramisu", "Tiramisu Latte (+RM5)", 5],
  ]),
  single(n ? `temp${n}` : "temp", n ? `Coffee ${n}: hot or cold` : "Hot or cold", [
    ["hot", "Hot"],
    ["cold", "Cold"],
  ]),
];

const setDesserts = multi("dessert", "Add dessert", [
  ["tiramisu", "Tiramisu", 10],
  ["mangomisu", "Mango Misu", 10],
]);

type Seed = Omit<Product, "nameVerified" | "priceVerified" | "optionsVerified" | "monogram"> &
  Partial<Pick<Product, "nameVerified" | "priceVerified" | "optionsVerified" | "monogram">>;

const item = (s: Seed): Product => ({
  nameVerified: true,
  priceVerified: true,
  optionsVerified: true,
  monogram: s.photo ? undefined : initials(s.name),
  ...s,
});

/* ---- Catalogue ------------------------------------------------------------------ */

const CATALOGUE: Product[] = [
  // ---- Meal ------------------------------------------------------------------------
  item({
    id: "nasi-lemak-pandan",
    name: "Nasi Lemak Pandan with Telur Mata",
    category: "mains",
    description: "Pandan nasi lemak with a sunny-side-up egg. Add rendang, curry ayam or crispy chicken.",
    price: rm(10.9),
    photo: "/img/nasi-lemak-telur-mata.webp",
    tags: ["Mentioned in Google reviews"],
    options: [
      multi("addon", "Add on", [
        ["crispy", "Crispy Chicken", 8],
        ["ayamrendang", "Ayam Rendang", 11.9],
        ["dagingrendang", "Daging Rendang", 12.9],
        ["curryayam", "Curry Ayam", 12.9],
      ]),
    ],
  }),
  item({
    id: "curry-noodle",
    name: "Curry Noodle",
    category: "mains",
    description: "Creamy curry packed with noodles and hearty toppings such as prawns, taufu, fish balls and egg.",
    price: rm(16.9),
    tags: ["Must try!"],
    options: [],
  }),

  // ---- Western -----------------------------------------------------------------
  item({
    id: "mushroom-soup",
    name: "Creamy In-house Mushroom Soup",
    category: "mains",
    description: "House-made creamy mushroom soup, served with garlic bread.",
    price: rm(16.9),
    options: [],
  }),
  item({
    id: "bolognese-meatball",
    name: "Bolognese Beef with Meatball",
    category: "mains",
    description: "Beef bolognese pasta topped with meatballs.",
    price: rm(22.9),
    photo: "/img/bolognese-meatball.webp",
    options: [],
  }),
  item({
    id: "carbonara-smoked-duck",
    name: "Creamy Carbonara with Smoked Duck",
    category: "mains",
    description: "Creamy carbonara pasta with smoked duck.",
    price: rm(22.9),
    options: [],
  }),
  item({
    id: "tomyam-pasta",
    name: "Tomyam Creamy Pasta",
    category: "mains",
    description: "Creamy tomyam pasta, with crispy chicken or prawn.",
    price: rm(24.9),
    photo: "/img/tomyam-pasta-prawn.webp",
    tags: ["Signature fusion"],
    options: [single("topping", "Topping", [["prawn", "Prawn"], ["chicken", "Crispy Chicken"]])],
  }),
  item({
    id: "gochujang-pasta",
    name: "Creamy Gochujang Pasta",
    category: "mains",
    description: "Creamy gochujang pasta, with crispy chicken or prawn.",
    price: rm(24.9),
    options: [single("topping", "Topping", [["chicken", "Crispy Chicken"], ["prawn", "Prawn"]])],
  }),
  item({
    id: "crispy-chicken-chop",
    name: "Crispy Chicken Chop",
    category: "mains",
    description: "Flavourful crispy fried chicken chop with French fries and black pepper sauce.",
    price: rm(23.9),
    options: [],
  }),
  item({
    id: "cajun-chicken",
    name: "Grilled Cajun Chicken",
    category: "mains",
    description: "Juicy grilled chicken with French fries and salad, with black pepper sauce.",
    price: rm(27.9),
    options: [],
  }),
  item({
    id: "chicken-burger",
    name: "Crispy Chicken Burger with Fries",
    category: "mains",
    description: "Crispy chicken burger served with fries.",
    price: rm(20.9),
    options: [],
  }),
  item({
    id: "lasagna",
    name: "Lasagna",
    category: "mains",
    description: "Baked lasagna, with a chicken or beef filling.",
    price: rm(15.9),
    options: [single("filling", "Filling", [["chicken", "Chicken"], ["beef", "Beef"]])],
  }),
  item({
    id: "gochujang-mac",
    name: "Gochujang Mac and Cheese",
    category: "mains",
    description: "Mac and cheese with a gochujang kick.",
    price: rm(17.9),
    options: [],
  }),

  // ---- Set menus: Solo ----------------------------------------------------------
  item({
    id: "solo-light-fast",
    name: "Solo · Light & Fast",
    category: "sets",
    description: "1 pastry and 1 coffee, hot or cold.",
    price: rm(19.9),
    normalPrice: rm(22.9),
    options: [
      single("pastry", "Pastry", [["croissandwich", "Croissandwich ×2"], ["chickenpie", "Chicken Pie"], ["dalgabi", "Dalgabi Chicken Meltz"]]),
      ...setCoffee(),
      setDesserts,
    ],
  }),
  item({
    id: "solo-signature-combo",
    name: "Solo · Signature Combo",
    category: "sets",
    description: "Loaded fries or popcorn chicken, plus 1 coffee, hot or cold.",
    price: rm(23.9),
    normalPrice: rm(29.8),
    options: [single("snack", "Snack", [["loadedfries", "Loaded Fries"], ["popcorn", "Pop Corn Chicken"]]), ...setCoffee(), setDesserts],
  }),
  item({
    id: "solo-full-meal",
    name: "Solo · Full Meal",
    category: "sets",
    description: "A main of nasi lemak pandan with rendang, or smoked duck pasta, plus a sparkling juice or iced tea.",
    price: rm(26.9),
    normalPrice: rm(35),
    photo: "/img/nasi-lemak-rendang.webp",
    options: [
      single("main", "Main", [
        ["ayamrendang", "Nasi Lemak Pandan Ayam Rendang"],
        ["dagingrendang", "Nasi Lemak Pandan Daging Rendang"],
        ["duckpasta", "Smoked Duck Pasta"],
      ]),
      single("drink", "Drink", [["sparkling", "Sparkling juice"], ["icedtea", "Iced tea"]]),
      setDesserts,
    ],
  }),

  // ---- Set menus: Couple --------------------------------------------------------
  item({
    id: "couple-chill-coffee",
    name: "Couple · Chill & Coffee",
    category: "sets",
    description: "2 pastries and 2 coffees, hot or cold.",
    price: rm(44.9),
    normalPrice: rm(47.6),
    options: [
      single("pastry1", "Pastry 1", [["mushroom", "Mushroom Melts"], ["chickenpie", "Chicken Pie"], ["dalgabi", "Dalgabi Chicken Meltz"]]),
      single("pastry2", "Pastry 2", [["mushroom", "Mushroom Melts"], ["chickenpie", "Chicken Pie"], ["dalgabi", "Dalgabi Chicken Meltz"]]),
      ...setCoffee(1),
      ...setCoffee(2),
      setDesserts,
    ],
  }),
  item({
    id: "couple-sharing-bites",
    name: "Couple · Sharing Bites",
    category: "sets",
    description: "Loaded fries and popcorn chicken to share, plus 2 coffees, hot or cold.",
    price: rm(49.9),
    normalPrice: rm(56.6),
    options: [...setCoffee(1), ...setCoffee(2), setDesserts],
  }),
  item({
    id: "couple-full-meal",
    name: "Couple · Full Meal",
    category: "sets",
    description: "2 mains (crispy chicken chop, pasta or nasi lemak ayam rendang), plus a sparkling juice or iced tea. Add any coffee for RM 3.",
    price: rm(59.9),
    normalPrice: rm(69.9),
    options: [
      single("main1", "Main 1", [["chop", "Crispy Chicken Chop"], ["pasta", "Pasta"], ["nasilemak", "Nasi Lemak Ayam Rendang"]]),
      single("main2", "Main 2", [["chop", "Crispy Chicken Chop"], ["pasta", "Pasta"], ["nasilemak", "Nasi Lemak Ayam Rendang"]]),
      single("drink", "Drink", [["sparkling", "Sparkling juice"], ["icedtea", "Iced tea"]]),
      multi("coffee", "Add coffee", [["addcoffee", "Any coffee", 3]]),
      setDesserts,
    ],
  }),

  // ---- Pastry (Instagram) -------------------------------------------------------
  item({
    id: "lemon-cream-cheese-croissant",
    name: "Lemon Cream Cheese Croissant",
    category: "pastry",
    description: "Croissant with lemon cream cheese and a candied lemon slice. Price shown on the café's Instagram.",
    price: rm(12.9),
    photo: "/img/lemon-cream-cheese-croissant.webp",
    options: [],
  }),

  // ---- Coffee (hot prices; the cold column is not legible in the photo) ----------
  item({ id: "americano", name: "Americano", category: "coffee", description: "Smooth, bold espresso diluted with hot water.", price: rm(8.9), options: [] }),
  item({ id: "caramel-macchiato", name: "Caramel Macchiato", category: "coffee", description: "Espresso with steamed milk, milk foam and caramel drizzle.", price: rm(12.9), options: [] }),
  item({ id: "cappuccino", name: "Cappuccino", category: "coffee", description: "Espresso with steamed milk and thick foam.", price: rm(11.9), options: [] }),
  item({
    id: "latte",
    name: "Latte",
    category: "coffee",
    description: "Espresso with steamed milk. Also available as a flavoured latte.",
    price: rm(11.9),
    options: [single("flavour", "Flavour", [["none", "Classic"], ["vanilla", "Vanilla (+RM1)", 1], ["hazelnut", "Hazelnut (+RM1)", 1], ["caramel", "Caramel (+RM1)", 1]])],
  }),
  item({ id: "flat-white", name: "Flat White", category: "coffee", description: "Espresso with steamed micro-foam milk.", price: rm(11.9), options: [] }),
  item({ id: "mocha", name: "Mocha", category: "coffee", description: "Espresso with chocolate and steamed milk.", price: rm(12.9), options: [] }),
  item({
    id: "cloud-cheesecake-latte",
    name: "Cloud Cheesecake Latte",
    category: "coffee",
    description: "Espresso with chilled milk and cheesecream. Add cheesecake bits for RM 1.",
    price: rm(17.9),
    tags: ["Special coffee"],
    options: [multi("extras", "Extras", [["bits", "Cheesecake bits", 1]])],
  }),
  item({ id: "salted-mocha-cold-foam", name: "Salted Mocha Cold Foam Latte", category: "coffee", description: "Espresso with chocolate, milk and salted cold foam.", price: rm(16.9), tags: ["Special coffee"], options: [] }),
  item({
    id: "tiramisu-latte",
    name: "Tiramisu Latte",
    category: "coffee",
    description: "Espresso with mascarpone cream foam and a cocoa dusting, served with a sponge finger biscuit.",
    price: rm(17.9),
    tags: ["Special coffee"],
    options: [],
  }),

  // ---- Matcha & Cocoa ----------------------------------------------------------
  item({ id: "dirty-matcha", name: "Dirty Matcha", category: "matcha-cocoa", description: "Matcha layered with a shot of espresso and milk.", price: rm(13.9), options: [hc(13.9, 14.9)] }),
  item({ id: "matcha-latte", name: "Matcha Latte", category: "matcha-cocoa", description: "Matcha whisked with fresh milk.", price: rm(11.9), options: [hc(11.9, 12.9)] }),
  item({ id: "matcha-cream-foam", name: "Matcha Cream Foam Latte", category: "matcha-cocoa", description: "Matcha latte topped with a lightly sweet cream foam. Served cold.", price: rm(16.9), options: [] }),
  item({
    id: "belgium-chocolate",
    name: "Belgium Chocolate",
    category: "matcha-cocoa",
    description: "Premium chocolate blended with milk, topped with whipped cream for the iced version.",
    price: rm(15.9),
    options: [hc(15.9, 16.9)],
  }),
  item({ id: "belgium-choc-cheese", name: "Belgium Choc Cheese", category: "matcha-cocoa", description: "Premium chocolate topped with cream cheese foam. Served cold.", price: rm(17.9), tags: ["Mentioned in Google reviews"], options: [] }),
  item({ id: "sea-salt-choc-chip", name: "Sea Salt Choc Chip", category: "matcha-cocoa", description: "Creamy chocolate with cream foam, a hint of sea salt and choc chips. Served cold.", price: rm(16.9), options: [] }),
  item({ id: "tiramisu-choc-supreme", name: "Tiramisu Choc Supreme", category: "matcha-cocoa", description: "Chocolate blended with tiramisu cream and cocoa. Served cold.", price: rm(16.9), options: [] }),
  item({ id: "lava-oreo-burst", name: "Lava Oreo Burst", category: "matcha-cocoa", description: "Chocolate and Oreo, with a lava drizzle and cookie crunch. Served cold.", price: rm(16.9), options: [] }),
  item({ id: "salted-caramel-cocoa-cloud", name: "Salted Caramel Cocoa Cloud", category: "matcha-cocoa", description: "Chocolate topped with salted cream foam. Served cold.", price: rm(16.9), options: [] }),

  // ---- Tea --------------------------------------------------------------------------
  item({ id: "white-peach-oolong", name: "White Peach Oolong Milk Tea", category: "tea", description: "Oolong tea with white peach flavour and milk. Served cold.", price: rm(12.9), options: [] }),
  item({ id: "masala-chai", name: "Masala Chai", category: "tea", description: "Milk tea brewed with aromatic spices.", price: rm(9.9), options: [hc(9.9, 10.9)] }),
  item({ id: "milk-tea", name: "Milk Tea", category: "tea", description: "Classic tea blended with milk.", price: rm(8.9), options: [hc(8.9, 9.9)] }),
  item({ id: "black-tea", name: "Black Tea", category: "tea", description: "Hot black tea.", price: rm(6.9), options: [] }),
  item({ id: "green-tea", name: "Green Tea", category: "tea", description: "Premium tea bag.", price: rm(5.9), options: [hc(5.9, 6.9)] }),
  item({
    id: "lemon-tea",
    name: "Lemon Tea",
    category: "tea",
    description: "Lemon tea. Add honey for RM 1.",
    price: rm(6.9),
    options: [hc(6.9, 9.9), multi("extras", "Add on", [["honey", "Honey", 1]])],
  }),
  item({ id: "peach-tea", name: "Peach Tea", category: "tea", description: "Peach-flavoured tea.", price: rm(6.9), options: [hc(6.9, 9.9)] }),

  // ---- Sparkling ----------------------------------------------------------------------
  item({ id: "island-lagoon-fizz", name: "Island Lagoon Fizz", category: "sparkling", description: "Blue citrus with soda, fizzy and refreshing.", price: rm(13.9), options: [] }),
  item({
    id: "fresh-sparkle",
    name: "Fresh Sparkle",
    category: "sparkling",
    description: "Sparkling soda in your choice of lemon, strawberry, mango or apple.",
    price: rm(13.9),
    photo: "/img/sparkling-lemonade.webp",
    options: [single("flavour", "Flavour", [["lemon", "Lemon"], ["strawberry", "Strawberry"], ["mango", "Mango"], ["apple", "Apple"]])],
  }),
  item({ id: "sunset-lagoon-fizz", name: "Sunset Lagoon Fizz", category: "sparkling", description: "Blue citrus and mango juice with refreshing soda.", price: rm(14.9), options: [] }),
  item({ id: "strawberry-apple-fizz", name: "Strawberry Apple Fizz", category: "sparkling", description: "Strawberry and apple juice blended with soda.", price: rm(14.9), options: [] }),
  item({ id: "mango-strawberry-royale", name: "Mango Strawberry Royale", category: "sparkling", description: "Sweet mango juice mixed with strawberry and soda.", price: rm(14.9), options: [] }),
  item({ id: "ocean-berry-fusion", name: "Ocean Berry Fusion", category: "sparkling", description: "Strawberry and blue lagoon with soda.", price: rm(14.9), options: [] }),
  item({
    id: "mermaid-float",
    name: "Mermaid Float",
    category: "sparkling",
    description: "Zesty blue lagoon with refreshing soda, topped with vanilla ice cream.",
    price: rm(16.9),
    options: [],
  }),
];

/** Menu items seen in the photos but left out because their price isn't legible. */
export const PRICE_NOT_LEGIBLE = ["Strawberry Matcha Latte", "Ocean Mist Latte", "Spanish Latte"];

/** Display order follows CATEGORIES. */
const ORDER = Object.fromEntries(CATEGORIES.map((c, i) => [c.id, i])) as Record<CategoryId, number>;
export const PRODUCTS: Product[] = [...CATALOGUE].sort((a, b) => ORDER[a.category] - ORDER[b.category]);

export const PRODUCT_BY_ID: Record<string, Product> = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
