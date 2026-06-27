// Public entry point for the storefront-checkout lane-local data layer.
//
// Future framework lanes import the functional API and domain types from here.
// They must NOT import the adapter (`../data`) or the raw fixtures directly —
// this barrel is the boundary. In particular, the UI never recomputes money
// totals: it calls `quoteCart` and display-formats the returned cents.

export {
  CheckoutApi,
  createCheckoutApi,
  type CheckoutApiOptions,
} from "./checkout-api.js";

export type {
  ApiError,
  ApiErrorCode,
  ApiResult,
  CartLine,
  CurrencyCode,
  OrderConfirmation,
  OrderRequest,
  PaymentPayload,
  PaymentResult,
  Product,
  ProductVariant,
  PromoCode,
  PromoKind,
  PromoValidation,
  Quote,
  QuoteLine,
  QuoteRequest,
  ShippingMethod,
  TaxRule,
} from "../types/index.js";
