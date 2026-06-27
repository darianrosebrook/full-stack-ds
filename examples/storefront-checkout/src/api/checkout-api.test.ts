import { describe, expect, it } from "vitest";

import { loadFixtures } from "../data/adapter.js";
import { CheckoutApi, createCheckoutApi } from "./checkout-api.js";
import type { ApiResult, QuoteRequest } from "../types/index.js";

/** Unwrap a successful result or fail the test with the typed error. */
function expectOk<T>(result: ApiResult<T>): T {
  if (!result.ok) {
    throw new Error(
      `expected ok result, got error ${result.error.code}: ${result.error.message}`,
    );
  }
  return result.value;
}

/** Fresh API per test (latencyMs 0 — deterministic, no wall-clock waits). */
function freshApi(): CheckoutApi {
  return new CheckoutApi(loadFixtures(), {});
}

describe("storefront-checkout fixture adapter", () => {
  it("parses products + variants and indexes promos/shipping/tax", () => {
    const snapshot = loadFixtures(true);

    expect(snapshot.products).toHaveLength(5);

    // The variant index resolves a variant to its owning product.
    const resolved = snapshot.variantIndex.get("tee-blue-m");
    expect(resolved?.product.id).toBe("tee");
    expect(resolved?.variant.priceCents).toBe(2200);

    // Lookups are keyed and complete.
    expect(snapshot.promoByCode.get("SAVE10")?.kind).toBe("percent");
    expect(snapshot.shippingById.get("overnight")?.feeCents).toBe(2500);
    expect(snapshot.taxRateByRegion.get("CA")).toBe(825);
  });
});

describe("listProducts", () => {
  it("returns the full catalog", async () => {
    const products = expectOk(await freshApi().listProducts());
    expect(products.map((p) => p.id).sort()).toEqual([
      "bottle",
      "cap",
      "hoodie",
      "socks",
      "tee",
    ]);
  });

  it("returns a clone callers cannot use to mutate the snapshot", async () => {
    const api = freshApi();
    const first = expectOk(await api.listProducts());
    first[0].title = "MUTATED";
    const second = expectOk(await api.listProducts());
    expect(second[0].title).not.toBe("MUTATED");
  });
});

describe("quoteCart owns the money pipeline", () => {
  it("computes subtotal -> discount -> shipping -> tax -> total exactly", async () => {
    const req: QuoteRequest = {
      lines: [{ variantId: "tee-blue-m", quantity: 2 }],
      promoCode: "SAVE10",
      shippingMethodId: "standard",
      region: "CA",
    };
    const quote = expectOk(await freshApi().quoteCart(req));

    // 2 x 2200 = 4400 subtotal.
    expect(quote.subtotalCents).toBe(4400);
    // SAVE10 = 10% of 4400 = 440 discount.
    expect(quote.discountCents).toBe(440);
    expect(quote.appliedPromo).toBe("SAVE10");
    // Standard shipping is free.
    expect(quote.shippingCents).toBe(0);
    // CA tax 8.25% on (4400 - 440 + 0) = 3960 -> round(326.7) = 327.
    expect(quote.taxCents).toBe(327);
    // Total = 4400 - 440 + 0 + 327 = 4287.
    expect(quote.totalCents).toBe(4287);
  });

  it("adds shipping into the taxable base", async () => {
    const quote = expectOk(
      await freshApi().quoteCart({
        lines: [{ variantId: "cap-one", quantity: 1 }], // 1900
        shippingMethodId: "expedited", // 800
        region: "NY", // 800 bps
      }),
    );
    expect(quote.subtotalCents).toBe(1900);
    expect(quote.shippingCents).toBe(800);
    // 8% of (1900 - 0 + 800) = 2700 -> 216.
    expect(quote.taxCents).toBe(216);
    expect(quote.totalCents).toBe(2916);
  });

  it("ignores an invalid promo in the quote without erroring (discount 0)", async () => {
    const quote = expectOk(
      await freshApi().quoteCart({
        lines: [{ variantId: "cap-one", quantity: 1 }],
        promoCode: "NOPE",
      }),
    );
    expect(quote.appliedPromo).toBeNull();
    expect(quote.discountCents).toBe(0);
    expect(quote.totalCents).toBe(1900);
  });

  it("rejects an empty cart with a typed EMPTY_CART error", async () => {
    const result = await freshApi().quoteCart({ lines: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("EMPTY_CART");
  });

  it("rejects an out-of-stock variant with a typed OUT_OF_STOCK error", async () => {
    // tee-black-m has stock 0.
    const result = await freshApi().quoteCart({
      lines: [{ variantId: "tee-black-m", quantity: 1 }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("OUT_OF_STOCK");
  });
});

describe("validatePromo", () => {
  it("accepts a valid code and returns its discount against the cart", async () => {
    const validation = expectOk(
      await freshApi().validatePromo("save10", {
        lines: [{ variantId: "tee-blue-m", quantity: 2 }], // 4400
      }),
    );
    expect(validation.code).toBe("SAVE10");
    expect(validation.discountCents).toBe(440);
  });

  it("rejects an unknown code with a typed INVALID_PROMO error", async () => {
    const result = await freshApi().validatePromo("BOGUS", {
      lines: [{ variantId: "cap-one", quantity: 1 }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("INVALID_PROMO");
  });

  it("rejects a valid code below its minimum subtotal", async () => {
    // TENOFF requires >= 4000; one cap is only 1900.
    const result = await freshApi().validatePromo("TENOFF", {
      lines: [{ variantId: "cap-one", quantity: 1 }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("INVALID_PROMO");
  });
});

describe("submitPayment + placeOrder mutation", () => {
  it("authorizes a well-formed payment and places an order with a deterministic id", async () => {
    const api = freshApi();
    const quote = expectOk(
      await api.quoteCart({
        lines: [{ variantId: "bottle-steel", quantity: 1 }], // 3200, OR region = 0 tax
        region: "OR",
      }),
    );
    expect(quote.totalCents).toBe(3200);

    const payment = expectOk(
      await api.submitPayment({
        cardNumber: "4242 4242 4242 4242",
        expiry: "12/30",
        cvv: "123",
        amountCents: quote.totalCents,
      }),
    );
    expect(payment.amountCents).toBe(3200);

    const order = expectOk(
      await api.placeOrder({ quote, payment, email: "shopper@example.com" }),
    );
    expect(order.orderId).toBe("ORD-0001");
    expect(order.totalCents).toBe(3200);

    // The order counter is monotonic per instance.
    const order2 = expectOk(
      await api.placeOrder({ quote, payment, email: "shopper@example.com" }),
    );
    expect(order2.orderId).toBe("ORD-0002");
  });

  it("rejects malformed card details with PAYMENT_INVALID (distinct from decline)", async () => {
    const result = await freshApi().submitPayment({
      cardNumber: "nope",
      expiry: "12/30",
      cvv: "12",
      amountCents: 1000,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("PAYMENT_INVALID");
  });

  it("rejects an order whose payment amount does not match the quote total", async () => {
    const api = freshApi();
    const quote = expectOk(
      await api.quoteCart({ lines: [{ variantId: "cap-one", quantity: 1 }] }),
    );
    const result = await api.placeOrder({
      quote,
      payment: { authToken: "AUTH-x", amountCents: quote.totalCents + 1 },
      email: "shopper@example.com",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("PAYMENT_INVALID");
  });
});

describe("simulated failure produces typed errors", () => {
  it("fails listProducts with LOAD_FAILED while the flag is on, then recovers", async () => {
    const api = freshApi();
    api.simulateLoadFailure(true);
    const failed = await api.listProducts();
    expect(failed.ok).toBe(false);
    if (!failed.ok) expect(failed.error.code).toBe("LOAD_FAILED");

    api.simulateLoadFailure(false);
    const recovered = expectOk(await api.listProducts());
    expect(recovered).toHaveLength(5);
  });

  it("declines payment with PAYMENT_DECLINED under the failure flag, then recovers", async () => {
    const api = createCheckoutApi({ failPayments: true });
    const declined = await api.submitPayment({
      cardNumber: "4242424242424242",
      expiry: "12/30",
      cvv: "123",
      amountCents: 1900,
    });
    expect(declined.ok).toBe(false);
    if (!declined.ok) expect(declined.error.code).toBe("PAYMENT_DECLINED");

    api.simulatePaymentFailure(false);
    const ok = await api.submitPayment({
      cardNumber: "4242424242424242",
      expiry: "12/30",
      cvv: "123",
      amountCents: 1900,
    });
    expect(ok.ok).toBe(true);
  });
});
