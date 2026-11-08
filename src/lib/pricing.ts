import { PRODUCT_BY_ID, type Product } from "../data/menu";
import { DEMO } from "../data/demo";

/** Selected options: groupId -> choice ids (single groups hold exactly one). */
export type Selection = Record<string, string[]>;

export const formatRM = (sen: number) =>
  `RM ${(Math.round(sen) / 100).toFixed(2)}`;

export function defaultSelection(p: Product): Selection {
  const sel: Selection = {};
  for (const g of p.options) {
    if (g.type === "single") sel[g.id] = [g.defaultId ?? g.choices[0]!.id];
    else sel[g.id] = [];
  }
  return sel;
}

/**
 * Normalises a selection against the product definition: drops unknown groups
 * and choices, enforces exactly one choice for single groups. Used both for UI
 * input and for re-validating anything loaded from localStorage.
 */
export function sanitizeSelection(p: Product, raw: unknown): Selection {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const out: Selection = {};
  for (const g of p.options) {
    const ids = Array.isArray(input[g.id])
      ? (input[g.id] as unknown[]).filter((v): v is string => typeof v === "string")
      : [];
    const valid = ids.filter((id) => g.choices.some((c) => c.id === id));
    if (g.type === "single") {
      out[g.id] = [valid[0] ?? g.defaultId ?? g.choices[0]!.id];
    } else {
      out[g.id] = [...new Set(valid)].sort();
    }
  }
  return out;
}

export function unitPrice(p: Product, sel: Selection): number {
  let total = p.price;
  for (const g of p.options) {
    for (const id of sel[g.id] ?? []) {
      total += g.choices.find((c) => c.id === id)?.delta ?? 0;
    }
  }
  return total;
}

/** Human-readable summary of non-default/selected options. */
export function describeSelection(p: Product, sel: Selection): string[] {
  const parts: string[] = [];
  for (const g of p.options) {
    for (const id of sel[g.id] ?? []) {
      const c = g.choices.find((x) => x.id === id);
      if (c) parts.push(c.label);
    }
  }
  return parts;
}

/** Stable key so identical configurations merge into one cart line. */
export function lineKey(productId: string, sel: Selection, note: string): string {
  const groups = Object.keys(sel)
    .sort()
    .map((k) => `${k}=${[...(sel[k] ?? [])].sort().join("+")}`)
    .join("|");
  return `${productId}::${groups}::${note.trim().toLowerCase()}`;
}

export type CartLine = {
  key: string;
  productId: string;
  selection: Selection;
  note: string;
  qty: number;
};

export type Totals = {
  subtotal: number;
  discount: number;
  total: number;
  count: number;
};

export function computeTotals(lines: CartLine[], promoApplied: boolean): Totals {
  let subtotal = 0;
  let count = 0;
  for (const l of lines) {
    const p = PRODUCT_BY_ID[l.productId];
    if (!p) continue;
    subtotal += unitPrice(p, l.selection) * l.qty;
    count += l.qty;
  }
  const discount = promoApplied ? Math.round((subtotal * DEMO.promo.percent) / 100) : 0;
  return { subtotal, discount, total: subtotal - discount, count };
}

export const clampQty = (n: number) =>
  Math.max(1, Math.min(DEMO.maxQtyPerLine, Math.floor(Number.isFinite(n) ? n : 1)));

/** Strip control chars and cap length of free-text kitchen notes. */
export const sanitizeNote = (s: string) =>
  s.replace(/[\u0000-\u001f\u007f<>]/g, "").slice(0, 120);
