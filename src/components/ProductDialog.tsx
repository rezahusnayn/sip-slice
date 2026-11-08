import { useId, useRef, useState } from "react";
import type { Product } from "../data/menu";
import { DEMO } from "../data/demo";
import {
  clampQty,
  defaultSelection,
  describeSelection,
  formatRM,
  sanitizeNote,
  unitPrice,
  type CartLine,
  type Selection,
} from "../lib/pricing";
import { useCart } from "../state/cart";
import { Sheet } from "./Sheet";
import { flyToCart } from "../lib/flyToCart";

type Props = {
  product: Product;
  /** When set, the dialog edits this existing cart line instead of adding. */
  editing?: CartLine;
  onClose: () => void;
  onAdded: (msg: string) => void;
};

export function ProductDialog({ product: p, editing, onClose, onAdded }: Props) {
  const titleId = useId();
  const [sel, setSel] = useState<Selection>(() => editing?.selection ?? defaultSelection(p));
  const [qty, setQty] = useState(editing?.qty ?? 1);
  const [note, setNote] = useState(editing?.note ?? "");
  const { add, replace } = useCart();
  const submitRef = useRef<HTMLButtonElement>(null);

  const unit = unitPrice(p, sel);
  const total = unit * qty;

  const pickSingle = (groupId: string, id: string) => setSel((s) => ({ ...s, [groupId]: [id] }));
  const toggleMulti = (groupId: string, id: string) =>
    setSel((s) => {
      const cur = s[groupId] ?? [];
      return { ...s, [groupId]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] };
    });

  return (
    <Sheet variant="modal" labelledBy={titleId} onClose={onClose} className="product-sheet">
      {(close) => (
        <form
          className="pd"
          onSubmit={(e) => {
            e.preventDefault();
            if (editing) {
              replace(editing.key, p.id, sel, note, qty);
              onAdded(`${p.name} updated`);
            } else {
              add(p.id, sel, note, qty);
              flyToCart(submitRef.current);
              onAdded(`${qty} × ${p.name} added to cart`);
            }
            close();
          }}
        >
          <div className="pd__media">
            {p.photo ? (
              <img src={p.photo} alt={`${p.name}, photographed by Sip & Savor`} width="353" height="353" />
            ) : (
              <span className="card__mono card__mono--lg" aria-hidden="true">
                <span>{p.monogram}</span>
              </span>
            )}
            <button type="button" className="pd__close" onClick={close} aria-label="Close" data-autofocus>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="pd__body">
            <div className="pd__provenance">
              <span className={`pill ${p.nameVerified ? "pill--verified" : "pill--demo"}`}>
                Name: {p.nameVerified ? "from menu" : "demo"}
              </span>
              <span className={`pill ${p.priceVerified ? "pill--verified" : "pill--demo"}`}>
                Price: {p.priceVerified ? "from menu" : "demo"}
              </span>
              <span className={`pill ${p.optionsVerified ? "pill--verified" : "pill--demo"}`}>
                Options: {p.optionsVerified ? "from menu" : "demo"}
              </span>
            </div>
            <h2 id={titleId} className="pd__title">
              {p.name}
            </h2>
            <p className="pd__desc">{p.description}</p>
            <p className="pd__base">From {formatRM(p.price)}</p>

            {p.options.map((g) => (
              <fieldset key={g.id} className="opt">
                <legend>
                  {g.label}
                  <span className="opt__hint">{g.type === "single" ? "Choose 1" : "Optional"}</span>
                </legend>
                <div className="opt__choices">
                  {g.choices.map((c) => {
                    const checked = (sel[g.id] ?? []).includes(c.id);
                    return (
                      <label key={c.id} className={`choice ${checked ? "is-on" : ""}`}>
                        <input
                          type={g.type === "single" ? "radio" : "checkbox"}
                          name={`${p.id}-${g.id}`}
                          checked={checked}
                          onChange={() => (g.type === "single" ? pickSingle(g.id, c.id) : toggleMulti(g.id, c.id))}
                        />
                        <span className="choice__label">{c.label}</span>
                        {c.delta > 0 && <span className="choice__delta">+{formatRM(c.delta)}</span>}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            <label className="field">
              <span className="field__label">
                Note for the kitchen <span className="opt__hint">Optional</span>
              </span>
              <input
                type="text"
                value={note}
                maxLength={120}
                placeholder="e.g. no peanuts, sauce on the side"
                onChange={(e) => setNote(sanitizeNote(e.target.value))}
              />
            </label>

            <p className="pd__summary" aria-live="polite">
              {describeSelection(p, sel).join(" · ") || "Standard"}
            </p>
          </div>

          <div className="pd__bar">
            <div className="qty" role="group" aria-label="Quantity">
              <button type="button" onClick={() => setQty((q) => clampQty(q - 1))} disabled={qty <= 1} aria-label="Decrease quantity">
                −
              </button>
              <output aria-live="polite" aria-label={`Quantity ${qty}`}>
                {qty}
              </output>
              <button
                type="button"
                onClick={() => setQty((q) => clampQty(q + 1))}
                disabled={qty >= DEMO.maxQtyPerLine}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button ref={submitRef} type="submit" className="btn btn--primary btn--wide">
              {editing ? "Update item" : "Add to cart"} · {formatRM(total)}
            </button>
          </div>
        </form>
      )}
    </Sheet>
  );
}
