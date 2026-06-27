// Lane-local app-layer domain + API types for the storefront-checkout example.
//
// These are NOT package exports. They describe the shapes the lane-local
// adapter (`../data`) parses out of the static fixtures and the shapes the
// lane-local functional API (`../api`) returns to future framework lanes.
// Framework UI code consumes these types via the API surface only.
//
// All money values are integer minor units (cents) to avoid floating-point
// drift; the UI display-formats them, the API owns the arithmetic.

/** Deployment-agnostic currency code; the catalog is single-currency for the mock. */
export type CurrencyCode = "USD";

/** A selectable variant of a product (e.g. a size or color), with its own stock. */
export interface ProductVariant {
  /** Stable variant id, unique within the catalog, e.g. "tee-blue-m". */
  id: string;
  /** Human-readable variant label, e.g. "Blue / M". */
  label: string;
  /** Unit price in minor units (cents). */
  priceCents: number;
  /** Units in stock; 0 means out of stock (UI disables add-to-cart). */
  stock: number;
}

/** A catalog product with one or more selectable variants. */
export interface Product {
  /** Stable product id, e.g. "tee". */
  id: string;
  /** Product title. */
  title: string;
  /** Short marketing description. */
  description: string;
  /** Relative or absolute image reference (mock; not fetched). */
  image: string;
  /** Selectable variants; a product always has at least one. */
  variants: ProductVariant[];
}

/** A line the UI builds and passes to the API for quoting. UI-owned shape. */
export interface CartLine {
  /** Variant id being purchased (joins to `ProductVariant.id`). */
  variantId: string;
  /** Quantity; must be >= 1 for a valid line. */
  quantity: number;
}

/** Promo discount kind. */
export type PromoKind = "percent" | "fixed";

/** A promo code rule. The API owns evaluation; the UI never inspects rules. */
export interface PromoCode {
  /** The code the customer enters, compared case-insensitively. */
  code: string;
  /** percent => `value` is a whole-number percent off subtotal; fixed => `value` is cents off. */
  kind: PromoKind;
  /** Percent (1-100) or fixed minor units, per `kind`. */
  value: number;
  /** Minimum subtotal in cents for the promo to apply; 0 = no minimum. */
  minSubtotalCents: number;
}

/** A shipping method the customer can choose. */
export interface ShippingMethod {
  /** Stable method id, e.g. "standard". */
  id: string;
  /** Human-readable label, e.g. "Standard (5-7 days)". */
  label: string;
  /** Flat shipping fee in cents. */
  feeCents: number;
}

/** A tax rule keyed by destination region. The API owns application. */
export interface TaxRule {
  /** Region key the UI passes through from the shipping form, e.g. "CA". */
  region: string;
  /** Tax rate in basis points (e.g. 825 = 8.25%). */
  rateBps: number;
}

/** A single priced line in a computed quote (echoes the cart line + resolved price). */
export interface QuoteLine {
  variantId: string;
  /** Resolved product+variant label for display. */
  label: string;
  quantity: number;
  unitPriceCents: number;
  /** quantity * unitPriceCents. */
  lineTotalCents: number;
}

/**
 * The full derived money breakdown. Computed ONCE behind the API
 * (`quoteCart`). Future framework lanes consume these numbers and may only
 * display-format them — never recompute them.
 */
export interface Quote {
  currency: CurrencyCode;
  lines: QuoteLine[];
  subtotalCents: number;
  /** Applied promo code (uppercased) or null when none/invalid. */
  appliedPromo: string | null;
  /** Discount in cents (>= 0); 0 when no promo applied. */
  discountCents: number;
  /** Chosen shipping method id echoed back, or null when none selected. */
  shippingMethod: string | null;
  shippingCents: number;
  /** Tax on (subtotal - discount + shipping), per the destination rule. */
  taxCents: number;
  /** subtotal - discount + shipping + tax. */
  totalCents: number;
}

/** Inputs the UI passes to `quoteCart`. All optional bits default sensibly. */
export interface QuoteRequest {
  lines: CartLine[];
  /** Promo code to apply, if any (validated as part of quoting). */
  promoCode?: string;
  /** Chosen shipping method id, if any. */
  shippingMethodId?: string;
  /** Destination region for tax, if known (from the shipping step). */
  region?: string;
}

/** Result of validating a promo against a cart, returned by `validatePromo`. */
export interface PromoValidation {
  /** Uppercased code that was validated. */
  code: string;
  /** The promo's effect expressed as the discount it would apply, in cents. */
  discountCents: number;
}

/** Mock payment input. The card data is never real and never leaves the bundle. */
export interface PaymentPayload {
  /** Mock card number string; only its shape is checked. */
  cardNumber: string;
  /** Mock expiry "MM/YY". */
  expiry: string;
  /** Mock CVV. */
  cvv: string;
  /** Amount to charge in cents (the quote total). */
  amountCents: number;
}

/** Result of a successful payment authorization (mock). */
export interface PaymentResult {
  /** Mock authorization token. */
  authToken: string;
  amountCents: number;
}

/** Inputs to `placeOrder` once payment is authorized. */
export interface OrderRequest {
  quote: Quote;
  payment: PaymentResult;
  /** Contact email captured in the checkout flow. */
  email: string;
}

/** Result of a placed order (mock). */
export interface OrderConfirmation {
  /** Generated order id, e.g. "ORD-3F2A". */
  orderId: string;
  totalCents: number;
}

/** Typed error codes the API surfaces instead of throwing untyped errors. */
export type ApiErrorCode =
  | "LOAD_FAILED"
  | "EMPTY_CART"
  | "OUT_OF_STOCK"
  | "INVALID_PROMO"
  | "PAYMENT_DECLINED"
  | "PAYMENT_INVALID";

/** A typed API error. Callers narrow on `code` to drive UI error states. */
export interface ApiError {
  code: ApiErrorCode;
  message: string;
}

/**
 * Discriminated result the API methods resolve to. Methods never reject for
 * domain failures; they resolve `{ ok: false, error }` so future UI lanes can
 * model error states without try/catch around every call. (Programmer errors —
 * e.g. a malformed fixture at construction time — may still throw.)
 */
export type ApiResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: ApiError };
