import { useId, useRef, useState } from "react";
import { PRODUCT_BY_ID } from "../data/menu";
import { DEMO } from "../data/demo";
import { describeSelection, formatRM, unitPrice, type CartLine } from "../lib/pricing";
import { useCart } from "../state/cart";
import { Sheet } from "./Sheet";
import { gsap, useGSAP, dur } from "../lib/motion";

type Props = {
  onClose: () => void;
  onEdit: (line: CartLine) => void;
  onCheckout: () => void;
};

export function CartDrawer({ onClose, onEdit, onCheckout }: Props) {
  const titleId = useId();
  const cart = useCart();
  const { lines, totals, promoApplied } = cart;
  const [code, setCode] = useState("");
  const [promoMsg, setPromoMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const list = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      gsap.from(".line", { x: 30, opacity: 0, stagger: 0.05, duration: dur(0.5), delay: dur(0.2) });
    },
    { scope: list },
  );

  const { contextSafe } = useGSAP({ scope: list });
  const removeLine = contextSafe((key: string, el: HTMLElement | null) => {
    if (!el) return cart.remove(key);
    gsap.to(el, {
      x: 40,
      opacity: 0,
      height: 0,
      paddingTop: 0,
      paddingBottom: 0,
      marginBottom: 0,
      duration: dur(0.35),
      ease: "power2.in",
      onComplete: () => cart.remove(key),
    });
  });

  return (
    <Sheet variant="drawer" labelledBy={titleId} onClose={onClose}>
      {(close) => (
        <div className="cart">
          <div className="cart__head">
            <h2 id={titleId}>Your order</h2>
            <button type="button" className="icon-btn" onClick={close} aria-label="Close cart" data-autofocus>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {lines.length === 0 ? (
            <div className="cart__empty">
              <p>Your cart is empty.</p>
              <a
                className="btn btn--primary"
                href="#menu"
                onClick={() => close()}
              >
                Browse the menu
              </a>
            </div>
          ) : (
            <>
              <ul className="cart__lines" ref={list}>
                {lines.map((l) => {
                  const p = PRODUCT_BY_ID[l.productId];
                  if (!p) return null;
                  const opts = describeSelection(p, l.selection);
                  return (
                    <li key={l.key} className="line" id={`line-${cssId(l.key)}`}>
                      <div className="line__thumb" aria-hidden="true">
                        {p.photo ? <img src={p.photo} alt="" width="64" height="64" /> : <span>{p.monogram}</span>}
                      </div>
                      <div className="line__info">
                        <p className="line__name">{p.name}</p>
                        {opts.length > 0 && <p className="line__opts">{opts.join(" · ")}</p>}
                        {l.note && <p className="line__opts">Note: “{l.note}”</p>}
                        <div className="line__row">
                          <div className="qty qty--sm" role="group" aria-label={`Quantity of ${p.name}`}>
                            <button
                              type="button"
                              aria-label={`Decrease ${p.name}`}
                              onClick={() =>
                                l.qty <= 1
                                  ? removeLine(l.key, document.getElementById(`line-${cssId(l.key)}`))
                                  : cart.setQty(l.key, l.qty - 1)
                              }
                            >
                              −
                            </button>
                            <output aria-live="polite">{l.qty}</output>
                            <button
                              type="button"
                              aria-label={`Increase ${p.name}`}
                              disabled={l.qty >= DEMO.maxQtyPerLine}
                              onClick={() => cart.setQty(l.key, l.qty + 1)}
                            >
                              +
                            </button>
                          </div>
                          {p.options.length > 0 && (
                            <button type="button" className="btn btn--text" onClick={() => onEdit(l)}>
                              Edit
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn--text btn--danger"
                            onClick={() => removeLine(l.key, document.getElementById(`line-${cssId(l.key)}`))}
                            aria-label={`Remove ${p.name}`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <p className="line__price">{formatRM(unitPrice(p, l.selection) * l.qty)}</p>
                    </li>
                  );
                })}
              </ul>

              <div className="cart__foot">
                {promoApplied ? (
                  <p className="promo promo--on">
                    Code <strong>{DEMO.promo.code}</strong> applied ({DEMO.promo.percent}% off).{" "}
                    <button type="button" className="linklike" onClick={() => cart.removePromo()}>
                      Remove
                    </button>
                  </p>
                ) : (
                  <form
                    className="promo"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const ok = cart.applyPromo(code);
                      setPromoMsg(
                        ok
                          ? { ok: true, text: "Promo applied." }
                          : { ok: false, text: "That code isn't valid." },
                      );
                      if (ok) setCode("");
                    }}
                  >
                    <label className="visually-hidden" htmlFor="promo-input">
                      Promo code
                    </label>
                    <input
                      id="promo-input"
                      value={code}
                      maxLength={20}
                      autoComplete="off"
                      placeholder={`Promo code (try ${DEMO.promo.code})`}
                      onChange={(e) => setCode(e.target.value.replace(/[^a-z0-9]/gi, ""))}
                    />
                    <button type="submit" className="btn btn--ghost" disabled={!code}>
                      Apply
                    </button>
                  </form>
                )}
                {promoMsg && !promoApplied && (
                  <p className={`promo__msg ${promoMsg.ok ? "" : "is-error"}`} role="status">
                    {promoMsg.text}
                  </p>
                )}

                <dl className="totals">
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{formatRM(totals.subtotal)}</dd>
                  </div>
                  {totals.discount > 0 && (
                    <div>
                      <dt>Promo</dt>
                      <dd>−{formatRM(totals.discount)}</dd>
                    </div>
                  )}
                  <div className="totals__grand">
                    <dt>Total</dt>
                    <dd>{formatRM(totals.total)}</dd>
                  </div>
                </dl>
                <p className="fineprint">Prototype pricing. Taxes and service charges aren't modelled.</p>
                <button type="button" className="btn btn--primary btn--wide" onClick={onCheckout}>
                  Checkout · {formatRM(totals.total)}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </Sheet>
  );
}

const cssId = (key: string) => key.replace(/[^a-z0-9_-]/gi, "_");
