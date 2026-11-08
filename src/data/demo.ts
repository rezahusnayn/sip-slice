/**
 * FICTIONAL DEMONSTRATION DATA
 * ---------------------------------------------------------------------------
 * None of the values below come from the client's material. They exist so the
 * prototype can demonstrate a complete ordering flow. Replace with real data
 * once confirmed by the business.
 */

export const DEMO = {
  /** Demo promo code (10% off subtotal). */
  promo: { code: "SIPDEMO10", percent: 10 },
  /** Pickup lead time used to generate slots. */
  prepMinutes: 20,
  slotStepMinutes: 15,
  slotCount: 6,
  maxQtyPerLine: 20,
} as const;
