import type { ComponentContract } from "../contract.js";
import { buildComponentIR } from "../ir.js";
import { webTokenConsumption } from "../css.js";
import type { ValidationIssue } from "../validate.js";

/** Brands emit Web CSS. A native-only token or retired name cannot receive that override. */
export function validateBrandComponentOverrides(
  name: string,
  overrides: unknown,
  contract?: ComponentContract,
): ValidationIssue[] {
  const pointer = `/components/${name}`;
  if (!contract) return [{ pointer, message: `[BRAND_COMPONENT_UNKNOWN] ${name} is not a current component.` }];
  const ir = buildComponentIR(contract);
  const { consumed } = webTokenConsumption(ir);
  const issues: ValidationIssue[] = [];
  function walk(node: unknown, segments: string[]) {
    const at = [pointer, ...segments].join("/");
    if (!node || typeof node !== "object" || Array.isArray(node)) {
      issues.push({ pointer: at, message: "[BRAND_COMPONENT_INVALID] Expected a token group or a $value leaf." });
      return;
    }
    const record = node as Record<string, unknown>;
    if ("$value" in record) {
      const cssVar = `--fsds-${ir.cssPrefix}-${segments.join(".").replace(/\./g, "-")}`;
      if (!consumed.has(cssVar)) issues.push({
        pointer: at,
        message: `[BRAND_COMPONENT_UNCONSUMED] ${cssVar} has no Web property consumer in ${name}; use a current component token or design slot.`,
      });
      return;
    }
    for (const [key, value] of Object.entries(record)) {
      if (!key.startsWith("$")) walk(value, [...segments, key]);
    }
  }
  walk(overrides, []);
  return issues;
}
