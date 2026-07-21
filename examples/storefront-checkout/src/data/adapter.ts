// Lane-local fixture adapter for the storefront-checkout example.
//
// This module is the ONLY layer that touches the raw fixture file shape. It
// reads the static JSON/JSONL fixtures as bundler modules (isomorphic — the
// seam runs unchanged under node via Vitest and in the browser via Vite),
// parses and lightly validates them into the typed domain records declared in
// `../types`, builds the lookup indexes the API needs, and memoizes the parsed
// snapshot (loaded once into memory).
//
// BOUNDARY: future framework UI code must NOT import this module or the raw
// fixtures directly. UI consumes data only through the functional API in
// `../api`. Fixture-shape knowledge — and the variant->product join the quote
// math depends on — lives here, in one typed place.

import productsRaw from "../../fixtures/products.jsonl?raw";
import promoCodesRaw from "../../fixtures/promo-codes.json?raw";
import shippingMethodsRaw from "../../fixtures/shipping-methods.json?raw";
import taxRulesRaw from "../../fixtures/tax-rules.json?raw";

import type {
  Product,
  ProductVariant,
  PromoCode,
  ShippingMethod,
  TaxRule,
} from "../types/index.js";

/** Parse a JSONL string into an array of records, ignoring blank lines. */
function parseJsonl<T>(raw: string, file: string): T[] {
  const out: T[] = [];
  const lines = raw.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue;
    try {
      out.push(JSON.parse(line) as T);
    } catch (cause) {
      // A malformed fixture is a programmer/authoring error, not a domain
      // failure — throw loudly at load time rather than surface it as an
      // ApiError to the UI.
      throw new Error(
        `storefront-checkout adapter: invalid JSONL at ${file}:${i + 1}`,
        { cause },
      );
    }
  }
  return out;
}

/** A variant joined to its owning product, for price/label resolution. */
export interface ResolvedVariant {
  product: Product;
  variant: ProductVariant;
}

/** The fully-parsed, indexed snapshot the API operates over. */
export interface FixtureSnapshot {
  /** Catalog products (with their variants). */
  products: Product[];
  /** Every variant id -> its product + variant, for O(1) quote resolution. */
  variantIndex: Map<string, ResolvedVariant>;
  /** Promo codes keyed by uppercased code. */
  promoByCode: Map<string, PromoCode>;
  /** Shipping methods keyed by id. */
  shippingById: Map<string, ShippingMethod>;
  /** Tax rate (basis points) keyed by region, plus a default. */
  taxRateByRegion: Map<string, number>;
  defaultTaxRateBps: number;
}

let memoized: FixtureSnapshot | null = null;

/**
 * Parse all fixtures into a typed, indexed snapshot. Memoized: the static
 * fixtures are read and parsed once, then the same snapshot is reused. Pass
 * `force` in tests to re-read after a deliberate fixture edit.
 */
export function loadFixtures(force = false): FixtureSnapshot {
  if (memoized && !force) return memoized;

  const products = parseJsonl<Product>(productsRaw, "products.jsonl");
  const promos = (
    JSON.parse(promoCodesRaw) as { promos: PromoCode[] }
  ).promos;
  const shipping = (
    JSON.parse(shippingMethodsRaw) as { methods: ShippingMethod[] }
  ).methods;
  const tax = JSON.parse(taxRulesRaw) as {
    defaultRateBps: number;
    rules: TaxRule[];
  };

  const variantIndex = new Map<string, ResolvedVariant>();
  for (const product of products) {
    if (product.variants.length === 0) {
      throw new Error(
        `storefront-checkout adapter: product ${product.id} has no variants`,
      );
    }
    for (const variant of product.variants) {
      variantIndex.set(variant.id, { product, variant });
    }
  }

  const promoByCode = new Map<string, PromoCode>();
  for (const promo of promos) {
    promoByCode.set(promo.code.toUpperCase(), promo);
  }

  const shippingById = new Map<string, ShippingMethod>();
  for (const method of shipping) {
    shippingById.set(method.id, method);
  }

  const taxRateByRegion = new Map<string, number>();
  for (const rule of tax.rules) {
    taxRateByRegion.set(rule.region, rule.rateBps);
  }

  memoized = {
    products,
    variantIndex,
    promoByCode,
    shippingById,
    taxRateByRegion,
    defaultTaxRateBps: tax.defaultRateBps,
  };
  return memoized;
}
