import { useId } from "react";
import { Sheet } from "./Sheet";
import { SOURCES, VERIFIED } from "../data/verified";
import { PRODUCTS, PRICE_NOT_LEGIBLE } from "../data/menu";
import { DEMO } from "../data/demo";

export function SourcesDialog({ onClose }: { onClose: () => void }) {
  const titleId = useId();
  const L = VERIFIED.listing;
  const fromMenu = PRODUCTS.filter((p) => p.priceVerified && p.nameVerified).length;
  return (
    <Sheet variant="modal" labelledBy={titleId} onClose={onClose} className="sources-sheet">
      {(close) => (
        <div className="sources">
          <div className="co__head">
            <h2 id={titleId}>Data sources</h2>
            <button type="button" className="icon-btn" onClick={close} aria-label="Close" data-autofocus>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <h3>
            <span className="pill pill--verified">Verified</span> From the client's material
          </h3>
          <ul>
            <li>Name “{VERIFIED.name}” and tagline “{VERIFIED.tagline}” (logo)</li>
            <li>
              Menu: names, descriptions, prices, hot/cold prices, add-ons and set-menu contents for {fromMenu} of{" "}
              {PRODUCTS.length} items (printed menu photos; the croissant price is from Instagram)
            </li>
            <li>Address {L.address}, phone {L.phone}, closes {L.closes} (Google listing)</li>
            <li>Rating {L.rating} from {L.reviewCount} Google reviews; price per person {L.pricePerPerson}</li>
            <li>Interior, shopfront and dish photos (Instagram). The menu itself says pictures are for illustration.</li>
          </ul>
          <p className="fineprint">Sources: {Object.values(SOURCES).map((s) => s.label).join(" · ")}</p>

          <h3>
            <span className="pill pill--demo">Assumed</span> Interpretations of the menu
          </h3>
          <ul>
            <li>Classic coffees show a hot price only; the cold column isn't legible, so only hot is offered.</li>
            <li>For set menus, “any coffee” is shown as the classic coffee list. The +RM5 latte upgrade and +RM10 desserts are as printed.</li>
            <li>The Couple Full Meal's drink is treated as one choice; the menu doesn't say if there is one drink or two.</li>
            <li>The sparkling-lemon Instagram photo is shown on Fresh Sparkle.</li>
          </ul>

          <h3>
            <span className="pill pill--demo">Demo</span> Invented for this prototype
          </h3>
          <ul>
            <li>Online ordering itself, pickup time slots, table numbers and promo code {DEMO.promo.code}</li>
            <li>Headlines and marketing copy</li>
          </ul>

          <h3>Not available</h3>
          <ul>
            <li>Left off the menu because their price isn't legible in the photos: {PRICE_NOT_LEGIBLE.join(", ")}</li>
            <li>Opening time (the listing only shows closing time)</li>
            <li>Real payments, order delivery to the café, accounts and notifications are intentionally not built</li>
          </ul>
        </div>
      )}
    </Sheet>
  );
}
