import { cloneElement, useEffect, useId, useMemo, useRef, useState } from "react";
import { PRODUCT_BY_ID } from "../data/menu";
import { DEMO } from "../data/demo";
import { describeSelection, formatRM, unitPrice, type CartLine, type Totals } from "../lib/pricing";
import { useCart } from "../state/cart";
import { Sheet } from "./Sheet";
import { gsap, useGSAP, dur } from "../lib/motion";

/**
 * SIMULATED CHECKOUT
 * - No network requests are made; nothing leaves the browser.
 * - Customer details live only in this component's state and are discarded on close.
 * - No card numbers or bank credentials are ever requested.
 */

type Step = "details" | "payment" | "processing" | "done";
type Fulfilment = "pickup" | "dinein";
type Method = "counter" | "fpx" | "card";

const METHODS: { id: Method; label: string; hint: string }[] = [
  { id: "counter", label: "Pay at counter", hint: "Settle when you collect" },
  { id: "fpx", label: "Online banking (FPX)", hint: "Simulated — no bank redirect" },
  { id: "card", label: "Debit / credit card", hint: "Simulated — no card details asked" },
];

type Receipt = {
  orderNo: string;
  lines: CartLine[];
  totals: Totals;
  fulfilment: Fulfilment;
  when: string;
  table: string;
  name: string;
  method: Method;
};

function makeSlots(): string[] {
  const out: string[] = [];
  const step = DEMO.slotStepMinutes * 60_000;
  let t = Math.ceil((Date.now() + DEMO.prepMinutes * 60_000) / step) * step;
  for (let i = 0; i < DEMO.slotCount; i++, t += step) {
    out.push(new Date(t).toLocaleTimeString("en-MY", { hour: "numeric", minute: "2-digit" }));
  }
  return out;
}

function orderNumber() {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return `SS-${String(a[0]! % 10000).padStart(4, "0")}`;
}

// Malaysian mobile numbers: 01X-XXXXXXX(X), optional +60 prefix.
const PHONE_RE = /^(\+?60|0)1[0-9]{8,9}$/;

type Errors = Partial<Record<"name" | "phone" | "table" | "when", string>>;

export function Checkout({ onClose }: { onClose: () => void }) {
  const titleId = useId();
  const cart = useCart();
  const slots = useMemo(makeSlots, []);
  const [step, setStep] = useState<Step>("details");
  const [fulfilment, setFulfilment] = useState<Fulfilment>("pickup");
  const [when, setWhen] = useState(slots[0] ?? "");
  const [table, setTable] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<Method>("counter");
  const [errors, setErrors] = useState<Errors>({});
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const body = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  // If the dialog closes mid-"payment", cancel the simulated completion.
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Animate each step's content in.
  useGSAP(
    () => {
      gsap.from(".step-anim > *", { y: 18, opacity: 0, stagger: 0.05, duration: dur(0.5) });
      if (step === "done") {
        gsap.from(".tick path", {
          strokeDashoffset: 60,
          duration: dur(0.9),
          ease: "power2.out",
          delay: dur(0.2),
        });
      }
    },
    { scope: body, dependencies: [step], revertOnUpdate: true },
  );

  // Announce each new step by moving focus to the dialog heading.
  const heading = useRef<HTMLHeadingElement>(null);
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    heading.current?.focus({ preventScroll: true });
  }, [step]);

  const validate = (): boolean => {
    const e: Errors = {};
    const n = name.trim();
    if (n.length < 2) e.name = "Enter the name for the order.";
    else if (!/^[\p{L} .'@/-]{2,40}$/u.test(n)) e.name = "Use letters only (max 40).";
    const ph = phone.replace(/[\s-]/g, "");
    if (!PHONE_RE.test(ph)) e.phone = "Enter a Malaysian mobile number, e.g. 012-345 6789.";
    if (fulfilment === "dinein" && !/^([1-9]|1[0-9]|20)$/.test(table.trim())) e.table = "Choose a table number from 1–20.";
    if (fulfilment === "pickup" && !slots.includes(when)) e.when = "Choose a pickup time.";
    setErrors(e);
    const firstKey = Object.keys(e)[0];
    if (firstKey) body.current?.querySelector<HTMLElement>(`[name="${firstKey}"]`)?.focus();
    return !firstKey;
  };

  const pay = () => {
    setStep("processing");
    // Simulated gateway latency — no network call happens.
    timer.current = window.setTimeout(() => {
      setReceipt({
        orderNo: orderNumber(),
        lines: cart.lines,
        totals: cart.totals,
        fulfilment,
        when,
        table,
        name: name.trim(),
        method,
      });
      cart.clear();
      setStep("done");
    }, prefersFast() ? 300 : 1800);
  };

  const stepIndex = { details: 0, payment: 1, processing: 1, done: 2 }[step];

  return (
    <Sheet variant="modal" labelledBy={titleId} onClose={onClose} className="checkout-sheet">
      {(close) => (
        <div className="co" ref={body}>
          <div className="co__head">
            <h2 id={titleId} ref={heading} tabIndex={-1}>{step === "done" ? "Order confirmed" : "Checkout"}</h2>
            {step !== "processing" && (
              <button type="button" className="icon-btn" onClick={close} aria-label="Close checkout" data-autofocus>
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
          <p className="sim-banner" role="note">
            Simulation: no real order is placed, no payment is taken and nothing is sent anywhere.
          </p>

          <ol className="steps" aria-label="Checkout progress">
            {["Details", "Payment", "Confirmation"].map((s, i) => (
              <li key={s} className={i < stepIndex ? "is-done" : i === stepIndex ? "is-current" : ""} aria-current={i === stepIndex ? "step" : undefined}>
                <span>{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>

          {step === "details" && (
            <form
              className="step-anim co__form"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (validate()) setStep("payment");
              }}
            >
              <fieldset className="opt">
                <legend>How would you like it?</legend>
                <div className="opt__choices">
                  {(["pickup", "dinein"] as const).map((f) => (
                    <label key={f} className={`choice ${fulfilment === f ? "is-on" : ""}`}>
                      <input type="radio" name="fulfilment" checked={fulfilment === f} onChange={() => setFulfilment(f)} />
                      <span className="choice__label">{f === "pickup" ? "Self-pickup" : "Dine-in (order to table)"}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {fulfilment === "pickup" ? (
                <fieldset className="opt">
                  <legend>
                    Pickup time <span className="opt__hint">Today, demo slots</span>
                  </legend>
                  <div className="slots">
                    {slots.map((s) => (
                      <label key={s} className={`choice choice--slot ${when === s ? "is-on" : ""}`}>
                        <input type="radio" name="when" checked={when === s} onChange={() => setWhen(s)} />
                        <span className="choice__label">{s}</span>
                      </label>
                    ))}
                  </div>
                  {errors.when && <p className="err">{errors.when}</p>}
                </fieldset>
              ) : (
                <Field label="Table number" error={errors.table}>
                  <input
                    name="table"
                    inputMode="numeric"
                    maxLength={2}
                    value={table}
                    onChange={(e) => setTable(e.target.value.replace(/\D/g, ""))}
                    aria-invalid={!!errors.table}
                    placeholder="1–20"
                  />
                </Field>
              )}

              <Field label="Name for the order" error={errors.name}>
                <input
                  name="name"
                  autoComplete="off"
                  maxLength={40}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!errors.name}
                  placeholder="e.g. Aisyah"
                />
              </Field>
              <Field
                label="Mobile number"
                error={errors.phone}
                hint="Only used to show on the demo receipt. It isn't saved or sent."
              >
                <input
                  name="phone"
                  type="tel"
                  autoComplete="off"
                  inputMode="tel"
                  maxLength={16}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s-]/g, ""))}
                  aria-invalid={!!errors.phone}
                  placeholder="012-345 6789"
                />
              </Field>

              <OrderSummary lines={cart.lines} totals={cart.totals} />
              <button type="submit" className="btn btn--primary btn--wide">
                Continue to payment
              </button>
            </form>
          )}

          {step === "payment" && (
            <div className="step-anim co__form">
              <fieldset className="opt">
                <legend>Payment method</legend>
                <div className="methods">
                  {METHODS.map((m) => (
                    <label key={m.id} className={`choice choice--method ${method === m.id ? "is-on" : ""}`}>
                      <input type="radio" name="method" checked={method === m.id} onChange={() => setMethod(m.id)} />
                      <span className="choice__label">
                        {m.label}
                        <small>{m.hint}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <OrderSummary lines={cart.lines} totals={cart.totals} />
              <div className="co__row">
                <button type="button" className="btn btn--ghost" onClick={() => setStep("details")}>
                  Back
                </button>
                <button type="button" className="btn btn--primary btn--grow" onClick={pay}>
                  {method === "counter" ? "Place demo order" : "Simulate payment"} · {formatRM(cart.totals.total)}
                </button>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="step-anim co__processing" role="status" aria-live="assertive">
              <span className="spinner" aria-hidden="true" />
              <p>{method === "counter" ? "Sending to the kitchen (simulated)…" : "Authorising payment (simulated)…"}</p>
            </div>
          )}

          {step === "done" && receipt && (
            <div className="step-anim co__done" role="status">
              <svg className="tick" viewBox="0 0 52 52" width="64" height="64" aria-hidden="true">
                <circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M15 27l7 7 15-16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="60" />
              </svg>
              <p className="co__orderno">
                Demo order <strong>{receipt.orderNo}</strong>
              </p>
              <p>
                Thanks, {receipt.name}.{" "}
                {receipt.fulfilment === "pickup"
                  ? `Your order would be ready for pickup at ${receipt.when}.`
                  : `Your order would be served to table ${receipt.table}.`}{" "}
                {receipt.method === "counter" ? "Payment: at the counter." : "Payment: simulated, nothing charged."}
              </p>
              <OrderSummary lines={receipt.lines} totals={receipt.totals} open />
              <p className="fineprint">
                This is a portfolio prototype. No order reached Sip &amp; Savor and no money moved.
              </p>
              <button type="button" className="btn btn--primary btn--wide" onClick={close}>
                Back to the café
              </button>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactElement;
}) {
  const id = useId();
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {/* clone-free: wrap input with id via a div render prop */}
      <InputWithId id={id} describedBy={error ? `${id}-err` : hint ? `${id}-hint` : undefined}>
        {children}
      </InputWithId>
      {hint && !error && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="err" id={`${id}-err`}>
          {error}
        </p>
      )}
    </div>
  );
}

function InputWithId({
  id,
  describedBy,
  children,
}: {
  id: string;
  describedBy?: string;
  children: React.ReactElement<Record<string, unknown>>;
}) {
  return cloneElement(children, { id, "aria-describedby": describedBy });
}

function OrderSummary({ lines, totals, open = false }: { lines: CartLine[]; totals: Totals; open?: boolean }) {
  return (
    <details className="summary" open={open}>
      <summary>
        Order summary · {totals.count} item{totals.count === 1 ? "" : "s"} · <strong>{formatRM(totals.total)}</strong>
      </summary>
      <ul>
        {lines.map((l) => {
          const p = PRODUCT_BY_ID[l.productId];
          if (!p) return null;
          const opts = describeSelection(p, l.selection);
          return (
            <li key={l.key}>
              <span>
                {l.qty} × {p.name}
                {opts.length > 0 && <small>{opts.join(" · ")}</small>}
              </span>
              <span>{formatRM(unitPrice(p, l.selection) * l.qty)}</span>
            </li>
          );
        })}
        {totals.discount > 0 && (
          <li>
            <span>Promo {DEMO.promo.code}</span>
            <span>−{formatRM(totals.discount)}</span>
          </li>
        )}
      </ul>
    </details>
  );
}

const prefersFast = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
