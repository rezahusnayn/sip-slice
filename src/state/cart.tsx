import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { PRODUCT_BY_ID } from "../data/menu";
import { DEMO } from "../data/demo";
import {
  clampQty,
  computeTotals,
  lineKey,
  sanitizeNote,
  sanitizeSelection,
  type CartLine,
  type Selection,
  type Totals,
} from "../lib/pricing";

/**
 * Cart state. Persisted to localStorage (cart contents + promo flag only —
 * never any customer personal details). Everything read back from storage is
 * re-validated against the catalogue, so tampered or stale data is discarded.
 */

const STORAGE_KEY = "sipsavor.cart.v1";

type State = { lines: CartLine[]; promoApplied: boolean };

type Action =
  | { type: "add"; productId: string; selection: Selection; note: string; qty: number }
  | { type: "setQty"; key: string; qty: number }
  | { type: "remove"; key: string }
  | { type: "replace"; key: string; productId: string; selection: Selection; note: string; qty: number }
  | { type: "promo"; applied: boolean }
  | { type: "clear" };

function normaliseLine(productId: string, selection: unknown, note: unknown, qty: unknown): CartLine | null {
  const p = PRODUCT_BY_ID[productId];
  if (!p) return null;
  const sel = sanitizeSelection(p, selection);
  const n = sanitizeNote(typeof note === "string" ? note : "");
  return { key: lineKey(productId, sel, n), productId, selection: sel, note: n, qty: clampQty(Number(qty)) };
}

function mergeInto(lines: CartLine[], line: CartLine): CartLine[] {
  const i = lines.findIndex((l) => l.key === line.key);
  if (i === -1) return [...lines, line];
  return lines.map((l, idx) => (idx === i ? { ...l, qty: clampQty(l.qty + line.qty) } : l));
}

function reducer(state: State, a: Action): State {
  switch (a.type) {
    case "add": {
      const line = normaliseLine(a.productId, a.selection, a.note, a.qty);
      return line ? { ...state, lines: mergeInto(state.lines, line) } : state;
    }
    case "setQty":
      return {
        ...state,
        lines: state.lines.map((l) => (l.key === a.key ? { ...l, qty: clampQty(a.qty) } : l)),
      };
    case "remove": {
      const lines = state.lines.filter((l) => l.key !== a.key);
      return { lines, promoApplied: lines.length ? state.promoApplied : false };
    }
    case "replace": {
      const line = normaliseLine(a.productId, a.selection, a.note, a.qty);
      if (!line) return state;
      const without = state.lines.filter((l) => l.key !== a.key);
      // keep original position when the edited line doesn't merge with another
      const idx = state.lines.findIndex((l) => l.key === a.key);
      if (without.some((l) => l.key === line.key)) return { ...state, lines: mergeInto(without, line) };
      const lines = [...without];
      lines.splice(idx < 0 ? lines.length : idx, 0, line);
      return { ...state, lines };
    }
    case "promo":
      return { ...state, promoApplied: a.applied };
    case "clear":
      return { lines: [], promoApplied: false };
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || raw.length > 50_000) return { lines: [], promoApplied: false };
    const parsed = JSON.parse(raw) as { lines?: unknown; promoApplied?: unknown };
    let lines: CartLine[] = [];
    if (Array.isArray(parsed.lines)) {
      for (const l of parsed.lines.slice(0, 50)) {
        if (!l || typeof l !== "object") continue;
        const o = l as Record<string, unknown>;
        if (typeof o.productId !== "string") continue;
        const line = normaliseLine(o.productId, o.selection, o.note, o.qty);
        if (line) lines = mergeInto(lines, line);
      }
    }
    return { lines, promoApplied: parsed.promoApplied === true && lines.length > 0 };
  } catch {
    return { lines: [], promoApplied: false };
  }
}

type CartApi = State & {
  totals: Totals;
  add: (productId: string, selection: Selection, note: string, qty: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  replace: (key: string, productId: string, selection: Selection, note: string, qty: number) => void;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
  clear: () => void;
};

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or disabled — cart still works in memory */
    }
  }, [state]);

  const api = useMemo<CartApi>(
    () => ({
      ...state,
      totals: computeTotals(state.lines, state.promoApplied),
      add: (productId, selection, note, qty) => dispatch({ type: "add", productId, selection, note, qty }),
      setQty: (key, qty) => dispatch({ type: "setQty", key, qty }),
      remove: (key) => dispatch({ type: "remove", key }),
      replace: (key, productId, selection, note, qty) =>
        dispatch({ type: "replace", key, productId, selection, note, qty }),
      applyPromo: (code) => {
        const ok = code.trim().toUpperCase() === DEMO.promo.code && state.lines.length > 0;
        if (ok) dispatch({ type: "promo", applied: true });
        return ok;
      },
      removePromo: () => dispatch({ type: "promo", applied: false }),
      clear: () => dispatch({ type: "clear" }),
    }),
    [state],
  );

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
