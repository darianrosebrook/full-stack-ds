/**
 * Maps `fsds.<ContractName>` references in usage JSONL trees to the actual
 * React components exported from `@full-stack-ds/react`.
 *
 * The DS uses two compound-component patterns:
 *   1. Static-property — `Popover.Trigger`, `Popover.Content` (compound parts
 *      hung off the root export).
 *   2. Sibling-export  — `Card`, `CardHeader`, `CardFooter` (each part is its
 *      own top-level named export).
 *
 * For slot resolution we expose both as a single lookup so the renderer can
 * try `Card.Header`, then `CardHeader`, then fall back. See `resolveSlot`.
 */
import * as DS from "@full-stack-ds/react";
import type { ComponentType } from "react";

type AnyComponent = ComponentType<Record<string, unknown>>;

const allExports = DS as unknown as Record<string, AnyComponent | unknown>;

/**
 * Resolve `fsds.Foo` to the root React component. Returns null when no such
 * named export exists — the validator should have caught this upstream, but
 * the renderer guards anyway because dev-mode shows broken examples instead
 * of crashing the page.
 */
export function resolveRootComponent(ref: string): AnyComponent | null {
  if (!ref.startsWith("fsds.")) return null;
  const name = ref.slice("fsds.".length);
  const comp = allExports[name];
  return isComponent(comp) ? (comp as AnyComponent) : null;
}

/**
 * Resolve a slot (anatomy part) on a target component. Tries:
 *   1. Root[CapitalizedSlot] — static-property compound (Popover.Trigger).
 *   2. <RootName><CapitalizedSlot> — sibling export (CardHeader).
 * Returns null when neither exists; the renderer falls back to passing the
 * slot content as a JSX prop named after the slot.
 */
export function resolveSlot(
  rootRef: string,
  slotName: string,
): AnyComponent | null {
  const rootName = rootRef.startsWith("fsds.")
    ? rootRef.slice("fsds.".length)
    : rootRef;
  const cap = capitalize(slotName);
  const root = allExports[rootName] as Record<string, unknown> | undefined;
  const staticPart = root?.[cap];
  if (isComponent(staticPart)) return staticPart as AnyComponent;
  const sibling = allExports[`${rootName}${cap}`];
  if (isComponent(sibling)) return sibling as AnyComponent;
  return null;
}

function capitalize(s: string): string {
  if (s.length === 0) return s;
  return s[0].toUpperCase() + s.slice(1);
}

function isComponent(value: unknown): boolean {
  return typeof value === "function" || (typeof value === "object" && value !== null && "$$typeof" in (value as object));
}
