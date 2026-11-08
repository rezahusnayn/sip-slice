import { useCallback, useEffect, useRef, useState } from "react";
import { CartProvider, useCart } from "./state/cart";
import { PRODUCT_BY_ID, type Product } from "./data/menu";
import type { CartLine } from "./lib/pricing";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Menu } from "./components/Menu";
import { Story, Visit, Footer } from "./components/Sections";
import { ProductDialog } from "./components/ProductDialog";
import { CartDrawer } from "./components/CartDrawer";
import { Checkout } from "./components/Checkout";
import { SourcesDialog } from "./components/SourcesDialog";
import { formatRM } from "./lib/pricing";

type Overlay =
  | { kind: "none" }
  | { kind: "product"; product: Product; editing?: CartLine }
  | { kind: "cart" }
  | { kind: "checkout" }
  | { kind: "sources" };

function Shell() {
  const [overlay, setOverlay] = useState<Overlay>({ kind: "none" });
  const [toast, setToast] = useState<string>("");
  const toastTimer = useRef<number | undefined>(undefined);
  const { totals } = useCart();

  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2800);
  }, []);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const close = () => setOverlay({ kind: "none" });

  return (
    <>
      <div id="app-shell">
        <div className="demo-ribbon" role="note">
          Prototype · Simulated ordering, no real payments
        </div>
        <Header onOpenCart={() => setOverlay({ kind: "cart" })} onOpenSources={() => setOverlay({ kind: "sources" })} />
        <main>
          <Hero />
          <Menu onCustomise={(p) => setOverlay({ kind: "product", product: p })} onAdded={notify} />
          <Story />
          <Visit />
        </main>
        <Footer onOpenSources={() => setOverlay({ kind: "sources" })} />

        {totals.count > 0 && (
          <button type="button" className="mobile-cart" onClick={() => setOverlay({ kind: "cart" })}>
            View cart · {totals.count} item{totals.count === 1 ? "" : "s"} · {formatRM(totals.total)}
          </button>
        )}
      </div>

      <div className={`toast ${toast ? "is-on" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>

      {overlay.kind === "product" && (
        <ProductDialog
          key={overlay.product.id + (overlay.editing?.key ?? "")}
          product={overlay.product}
          editing={overlay.editing}
          onAdded={notify}
          onClose={() =>
            // after editing a line, return to the cart
            setOverlay(overlay.editing ? { kind: "cart" } : { kind: "none" })
          }
        />
      )}
      {overlay.kind === "cart" && (
        <CartDrawer
          onClose={close}
          onEdit={(line) => {
            const p = PRODUCT_BY_ID[line.productId];
            if (p) setOverlay({ kind: "product", product: p, editing: line });
          }}
          onCheckout={() => setOverlay({ kind: "checkout" })}
        />
      )}
      {overlay.kind === "checkout" && <Checkout onClose={close} />}
      {overlay.kind === "sources" && <SourcesDialog onClose={close} />}
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Shell />
    </CartProvider>
  );
}
