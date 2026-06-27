// Lane-local functional API for the storefront-checkout example.
//
// This is the surface future framework lanes import and call. It is
// promise-returning so the UI's loading / validating / pending / error states
// are real async transitions. Simulated latency and failure live HERE, behind
// the API — never in UI code.
//
// APP-SPECIFIC DECISION (see storefront-checkout/spec.md): totals, promo
// validation, the shipping/tax quote, payment simulation, and order placement
// all live behind this API. `quoteCart` owns the money pipeline
// (subtotal -> discount -> shipping -> tax -> total) and returns already-computed
// integer-cent numbers. Future framework lanes consume those numbers and only
// display-format them; they must NOT recompute the math, or five lanes will
// drift.
//
// BOUNDARY: UI imports from the barrel (`./index.ts`) only — never the adapter
// (`../data`) or the raw fixtures.
//
// Determinism: no wall-clock randomness and no Math.random. Latency is a fixed,
// configurable number of ms (0 in tests). Failure is an explicit flag. The
// order id is derived from a monotonic per-instance counter, so the same call
// sequence always yields the same ids.

import { loadFixtures, type FixtureSnapshot } from "../data/adapter.js";
import type {
  ApiError,
  ApiResult,
  OrderConfirmation,
  OrderRequest,
  PaymentPayload,
  PaymentResult,
  Product,
  PromoValidation,
  Quote,
  QuoteLine,
  QuoteRequest,
} from "../types/index.js";

/** Construction-time options. All optional with deterministic defaults. */
export interface CheckoutApiOptions {
  /** Simulated latency applied to every call, in ms. Default 0. */
  latencyMs?: number;
  /**
   * When true, read calls (`listProducts`) resolve `{ ok: false, LOAD_FAILED }`
   * to exercise the error + retry path. Toggle via `simulateLoadFailure`.
   */
  failLoads?: boolean;
  /**
   * When true, `submitPayment` resolves `{ ok: false, PAYMENT_DECLINED }` to
   * exercise the recoverable payment-failure path. Toggle via
   * `simulatePaymentFailure`.
   */
  failPayments?: boolean;
}

function delay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ok<T>(value: T): ApiResult<T> {
  return { ok: true, value };
}

function err<T>(error: ApiError): ApiResult<T> {
  return { ok: false, error };
}

/**
 * The storefront-checkout functional API. Construct via `createCheckoutApi()`.
 */
export class CheckoutApi {
  private readonly snapshot: FixtureSnapshot;
  private latencyMs: number;
  private failLoads: boolean;
  private failPayments: boolean;
  /** Monotonic counter for deterministic order ids. */
  private orderSeq = 0;

  constructor(snapshot: FixtureSnapshot, options: CheckoutApiOptions = {}) {
    this.snapshot = snapshot;
    this.latencyMs = options.latencyMs ?? 0;
    this.failLoads = options.failLoads ?? false;
    this.failPayments = options.failPayments ?? false;
  }

  /** Toggle the simulated read-failure flag (drives load error -> retry). */
  simulateLoadFailure(enabled: boolean): void {
    this.failLoads = enabled;
  }

  /** Toggle the simulated payment-failure flag (drives a recoverable decline). */
  simulatePaymentFailure(enabled: boolean): void {
    this.failPayments = enabled;
  }

  /** List the catalog (products with their variants). */
  async listProducts(): Promise<ApiResult<Product[]>> {
    await delay(this.latencyMs);
    if (this.failLoads) {
      return err({
        code: "LOAD_FAILED",
        message: "Simulated load failure while listing products.",
      });
    }
    // Deep-ish clone so callers cannot mutate the snapshot.
    return ok(
      this.snapshot.products.map((p) => ({
        ...p,
        variants: p.variants.map((v) => ({ ...v })),
      })),
    );
  }

  /**
   * Compute the full quote for a cart. This is the single owner of the money
   * pipeline: subtotal -> discount -> shipping -> tax -> total. An invalid promo
   * is NOT a hard error here — it is simply not applied (discount 0); callers
   * that want to surface "that code is invalid" use `validatePromo`.
   */
  async quoteCart(request: QuoteRequest): Promise<ApiResult<Quote>> {
    await delay(this.latencyMs);

    if (request.lines.length === 0) {
      return err({
        code: "EMPTY_CART",
        message: "Cannot quote an empty cart.",
      });
    }

    const lines: QuoteLine[] = [];
    let subtotalCents = 0;
    for (const line of request.lines) {
      const resolved = this.snapshot.variantIndex.get(line.variantId);
      if (!resolved) {
        return err({
          code: "OUT_OF_STOCK",
          message: `Unknown variant ${line.variantId}.`,
        });
      }
      if (line.quantity < 1 || line.quantity > resolved.variant.stock) {
        return err({
          code: "OUT_OF_STOCK",
          message: `Variant ${line.variantId} is unavailable at quantity ${line.quantity}.`,
        });
      }
      const unit = resolved.variant.priceCents;
      const lineTotal = unit * line.quantity;
      subtotalCents += lineTotal;
      lines.push({
        variantId: line.variantId,
        label: `${resolved.product.title} — ${resolved.variant.label}`,
        quantity: line.quantity,
        unitPriceCents: unit,
        lineTotalCents: lineTotal,
      });
    }

    // Discount (promo applied only if valid for this subtotal).
    let discountCents = 0;
    let appliedPromo: string | null = null;
    if (request.promoCode) {
      const promo = this.snapshot.promoByCode.get(
        request.promoCode.toUpperCase(),
      );
      if (promo && subtotalCents >= promo.minSubtotalCents) {
        discountCents =
          promo.kind === "percent"
            ? Math.round((subtotalCents * promo.value) / 100)
            : Math.min(promo.value, subtotalCents);
        appliedPromo = promo.code.toUpperCase();
      }
    }

    // Shipping.
    let shippingCents = 0;
    let shippingMethod: string | null = null;
    if (request.shippingMethodId) {
      const method = this.snapshot.shippingById.get(request.shippingMethodId);
      if (method) {
        shippingCents = method.feeCents;
        shippingMethod = method.id;
      }
    }

    // Tax applies to (subtotal - discount + shipping), per destination rule.
    const taxable = subtotalCents - discountCents + shippingCents;
    const rateBps = request.region
      ? this.snapshot.taxRateByRegion.get(request.region) ??
        this.snapshot.defaultTaxRateBps
      : this.snapshot.defaultTaxRateBps;
    const taxCents = Math.round((taxable * rateBps) / 10000);

    const totalCents = subtotalCents - discountCents + shippingCents + taxCents;

    return ok({
      currency: "USD",
      lines,
      subtotalCents,
      appliedPromo,
      discountCents,
      shippingMethod,
      shippingCents,
      taxCents,
      totalCents,
    });
  }

  /**
   * Validate a promo against a cart. Resolves the discount it would apply, or a
   * typed INVALID_PROMO error (unknown code or unmet minimum). Used by the UI's
   * "Apply" affordance to surface a recoverable error distinct from quoting.
   */
  async validatePromo(
    code: string,
    request: QuoteRequest,
  ): Promise<ApiResult<PromoValidation>> {
    await delay(this.latencyMs);
    const promo = this.snapshot.promoByCode.get(code.toUpperCase());
    if (!promo) {
      return err({
        code: "INVALID_PROMO",
        message: `Promo code ${code} is not recognized.`,
      });
    }
    // Compute subtotal to check the minimum (resolve via the variant index).
    let subtotalCents = 0;
    for (const line of request.lines) {
      const resolved = this.snapshot.variantIndex.get(line.variantId);
      if (resolved) subtotalCents += resolved.variant.priceCents * line.quantity;
    }
    if (subtotalCents < promo.minSubtotalCents) {
      return err({
        code: "INVALID_PROMO",
        message: `Promo code ${code} requires a subtotal of at least ${promo.minSubtotalCents} cents.`,
      });
    }
    const discountCents =
      promo.kind === "percent"
        ? Math.round((subtotalCents * promo.value) / 100)
        : Math.min(promo.value, subtotalCents);
    return ok({ code: promo.code.toUpperCase(), discountCents });
  }

  /** Simulate a payment authorization. */
  async submitPayment(
    payload: PaymentPayload,
  ): Promise<ApiResult<PaymentResult>> {
    await delay(this.latencyMs);
    // Shape validation (mock): reject obviously malformed input as a typed,
    // distinct error from a decline.
    const digits = payload.cardNumber.replace(/\s+/g, "");
    if (!/^\d{12,19}$/.test(digits) || !/^\d{3,4}$/.test(payload.cvv)) {
      return err({
        code: "PAYMENT_INVALID",
        message: "Card details are malformed.",
      });
    }
    if (payload.amountCents <= 0) {
      return err({
        code: "PAYMENT_INVALID",
        message: "Payment amount must be positive.",
      });
    }
    if (this.failPayments) {
      return err({
        code: "PAYMENT_DECLINED",
        message: "Simulated payment decline.",
      });
    }
    // Deterministic mock auth token from the last 4 + amount.
    return ok({
      authToken: `AUTH-${digits.slice(-4)}-${payload.amountCents}`,
      amountCents: payload.amountCents,
    });
  }

  /** Place an order once payment is authorized. Generates a deterministic id. */
  async placeOrder(
    request: OrderRequest,
  ): Promise<ApiResult<OrderConfirmation>> {
    await delay(this.latencyMs);
    if (request.payment.amountCents !== request.quote.totalCents) {
      return err({
        code: "PAYMENT_INVALID",
        message: "Authorized amount does not match the order total.",
      });
    }
    this.orderSeq += 1;
    const orderId = `ORD-${this.orderSeq.toString().padStart(4, "0")}`;
    return ok({ orderId, totalCents: request.quote.totalCents });
  }
}

/**
 * Factory: load the fixture snapshot via the adapter and construct an API.
 * Future framework lanes call this once and hold the returned instance.
 */
export function createCheckoutApi(
  options: CheckoutApiOptions = {},
): CheckoutApi {
  return new CheckoutApi(loadFixtures(), options);
}
