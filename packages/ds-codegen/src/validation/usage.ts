/**
 * Usage-sidecar cross-contract validator.
 *
 * Each component owns a `<Name>.usage.jsonl` of composition examples. Per-line
 * schema validation lives in the shared Ajv validator (`validateUsageLine`);
 * this pass runs *after* schema validation and checks the cross-component
 * relationships the schema cannot express:
 *
 *   1. Every `fsds.<Name>` ref resolves to a real contract.
 *   2. Every `props.<key>` matches a real prop on the target contract.
 *   3. Every `slots.<key>` matches an anatomy part on the target contract.
 *
 * Validation is scoped to documentation fidelity. Event-handler shape, state
 * machine wiring, and behavior contracts are intentionally NOT checked —
 * usage examples describe composition, not runtime semantics.
 */
import type { AuthoredPropType, ComponentContract } from "../contract.js";
import { buildComponentIR } from "../ir.js";
import type { ValidationIssue } from "../validate.js";
import { usageIconRefIssue } from "./icon-refs.js";
import {
  deriveUsageComposition,
  parseUsageRef,
} from "../usage-composition.js";

/** A usage tree node — the post-schema-validated shape. */
interface TreeNode {
  // Exactly one key matching /^fsds\.[A-Z][A-Za-z0-9]*$/.
  [ref: string]: NodeBody;
}

interface NodeBody {
  props?: Record<string, PropValue>;
  /** Slots may hold sub-trees OR plain strings for naturally-text slots. */
  slots?: Record<string, TreeNode | string>;
}

type PropValue =
  | string
  | number
  | boolean
  | null
  | TreeNode
  | PropValue[]
  | { [key: string]: PropValue };

interface UsageLine {
  name: string;
  description?: string;
  tree: TreeNode;
}

export interface UsageValidationContext {
  /** Map of contract name → contract, populated from the components/ directory. */
  contracts: ReadonlyMap<string, ComponentContract>;
}

/**
 * Validate a single usage line (already schema-checked) against the contract
 * registry. Returns an array of cross-contract issues; empty array means OK.
 */
export function validateUsageLine(
  line: UsageLine,
  source: { file: string; lineNumber: number; exampleName: string },
  ctx: UsageValidationContext,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const sourcePrefix = `${source.file}#L${source.lineNumber} [${source.exampleName}]`;
  walkTreeNode(line.tree, `/tree`, sourcePrefix, ctx, issues);
  return issues;
}

function walkTreeNode(
  node: TreeNode,
  pointer: string,
  sourcePrefix: string,
  ctx: UsageValidationContext,
  issues: ValidationIssue[],
): void {
  const keys = Object.keys(node);
  if (keys.length !== 1) {
    issues.push({
      pointer,
      message: `${sourcePrefix}: tree node must have exactly one fsds.* ref, found ${keys.length}`,
    });
    return;
  }
  const ref = keys[0];
  const parsedRef = parseUsageRef(ref);
  if (!parsedRef) {
    issues.push({
      pointer,
      message: `${sourcePrefix}: invalid component or subcomponent ref "${ref}"`,
    });
    return;
  }
  const compName = parsedRef.rootName;
  const target = ctx.contracts.get(compName);
  if (!target) {
    issues.push({
      pointer,
      message: `${sourcePrefix}: unknown component ref "${ref}" — no contract named "${compName}"`,
    });
    return;
  }

  const body = node[ref];
  const composition = deriveUsageComposition(target);
  const subcomponent = parsedRef.part
    ? composition.subcomponents.find((part) => part.part === parsedRef.part)
    : undefined;
  if (parsedRef.part && !subcomponent) {
    issues.push({
      pointer,
      message: `${sourcePrefix}: "${ref}" is not a contract-declared public subcomponent`,
    });
    return;
  }

  if (body.props) {
    const rootProps = parsedRef.part
      ? new Map()
      : new Map(buildComponentIR(target).styledProps.map((prop) => [prop.name, prop]));
    const targetPropNames = parsedRef.part
      ? new Set(subcomponent?.allowedProps ?? [])
      : collectPropNames(target);
    for (const propName of Object.keys(body.props)) {
      // `children` is universally accepted in the DS — contracts don't enumerate
      // it because the codegen threads it through every framework's component
      // signature regardless. Only flag non-children props missing from the
      // contract's props.styled.members.
      if (propName !== "children" && !targetPropNames.has(propName)) {
        issues.push({
          pointer: `${pointer}/props/${propName}`,
          message: `${sourcePrefix}: prop "${propName}" is not declared on ${ref}`,
        });
      }
      // ICON-CATALOG-RUNTIME-DELIVERY-01: a literal value for an
      // icon-name-typed prop (a prop the target's iconGlyph directive
      // binds via nameFrom) must resolve in the icon corpus — the
      // token-resolvesTo analogy for icons.
      const iconIssue = parsedRef.part
        ? null
        : usageIconRefIssue(target, propName, body.props[propName]);
      if (iconIssue) {
        issues.push({
          pointer: `${pointer}/props/${propName}`,
          message: `${sourcePrefix}: ${iconIssue}`,
        });
      }
      const declaredProp = rootProps.get(propName);
      if (declaredProp && declaredProp.propType.kind !== "fallback") {
        const typeIssue = validateTypedPropValue(
          body.props[propName],
          declaredProp.propType,
          target,
        );
        if (typeIssue) {
          issues.push({
            pointer: `${pointer}/props/${propName}`,
            message: `${sourcePrefix}: prop "${propName}" on ${ref} ${typeIssue}`,
          });
        }
      }
      // Children may carry sub-trees; descend.
      if (propName === "children") {
        const v = body.props[propName];
        if (Array.isArray(v)) {
          v.forEach((item, i) => {
            if (isTreeNode(item)) {
              walkTreeNode(item, `${pointer}/props/children/${i}`, sourcePrefix, ctx, issues);
            }
          });
        } else if (isTreeNode(v)) {
          walkTreeNode(v, `${pointer}/props/children`, sourcePrefix, ctx, issues);
        }
      }
    }
  }

  if (body.slots) {
    if (parsedRef.part) {
      issues.push({
        pointer: `${pointer}/slots`,
        message: `${sourcePrefix}: subcomponent "${ref}" composes content through props.children, not root anatomy slots`,
      });
      return;
    }
    const anatomy = target.anatomy;
    const partNames = Array.isArray(anatomy)
      ? anatomy
      : (anatomy?.parts ?? []);
    const anatomyParts = new Set(partNames);
    const namedSlots = new Set(composition.namedSlots);
    const publicParts = new Set(
      composition.subcomponents.map((part) => part.part),
    );
    for (const [slotName, child] of Object.entries(body.slots)) {
      if (!anatomyParts.has(slotName) && !namedSlots.has(slotName)) {
        issues.push({
          pointer: `${pointer}/slots/${slotName}`,
          message: `${sourcePrefix}: slot "${slotName}" is not an anatomy part on ${compName}`,
        });
      } else if (!namedSlots.has(slotName) && !publicParts.has(slotName)) {
        issues.push({
          pointer: `${pointer}/slots/${slotName}`,
          message: `${sourcePrefix}: slot "${slotName}" on ${compName} has no consumer delivery path (not a named DOM slot or contract-declared public subcomponent)`,
        });
      }
      // Strings need no cross-contract resolution; only tree nodes recurse.
      if (typeof child === "object" && child !== null) {
        walkTreeNode(child, `${pointer}/slots/${slotName}`, sourcePrefix, ctx, issues);
      }
    }
  }
}

/**
 * Validate JSON-authored example values against the contract's structured prop
 * IR. Legacy fallback types remain outside this proof boundary; migrated types
 * are checked recursively, including named object aliases.
 */
function validateTypedPropValue(
  value: PropValue,
  type: AuthoredPropType,
  contract: ComponentContract,
): string | null {
  switch (type.kind) {
    case "string":
      return typeof value === "string" ? null : "must be a string";
    case "number":
      return typeof value === "number" ? null : "must be a number";
    case "boolean":
      return typeof value === "boolean" ? null : "must be a boolean";
    case "literal":
      return value === type.value ? null : `must equal ${JSON.stringify(type.value)}`;
    case "enum":
      return typeof value === "string" && type.values.includes(value)
        ? null
        : `must be one of ${type.values.map((item) => JSON.stringify(item)).join(", ")}`;
    case "array":
      if (!Array.isArray(value)) return "must be an array";
      for (let index = 0; index < value.length; index += 1) {
        const issue = validateTypedPropValue(value[index], type.items, contract);
        if (issue) return `item ${index} ${issue}`;
      }
      return null;
    case "union": {
      const matches = type.of.some(
        (member) => validateTypedPropValue(value, member, contract) === null,
      );
      return matches ? null : "does not match any declared union member";
    }
    case "ref": {
      const definition = contract.types?.[type.to];
      if (definition?.values) {
        return typeof value === "string" && definition.values.includes(value)
          ? null
          : `must be one of ${definition.values.map((item) => JSON.stringify(item)).join(", ")}`;
      }
      if (definition?.alias) {
        return validateAliasValue(value, definition.alias, contract);
      }
      // Date is a framework-neutral contract ref but JSON sidecars carry its
      // serializable ISO representation. Materialization is owned by the
      // renderer when a Date-valued example is authored.
      if (type.to === "Date") {
        return typeof value === "string" && !Number.isNaN(Date.parse(value))
          ? null
          : "must be an ISO date string";
      }
      return null;
    }
    case "node":
      return typeof value === "string" || typeof value === "number" || value === null || isTreeNode(value)
        ? null
        : "must be renderable node content";
    case "callback":
      return "cannot be authored as JSON callback content";
    case "void":
      return value === null ? null : "must be null";
    case "promise":
      return "cannot be authored as JSON promise content";
  }
}

function validateAliasValue(
  value: PropValue,
  alias: string,
  contract: ComponentContract,
): string | null {
  const source = alias.trim();
  const union = splitTopLevel(source, "|");
  if (union.length > 1) {
    return union.some((member) => validateAliasValue(value, member, contract) === null)
      ? null
      : `does not match alias ${JSON.stringify(source)}`;
  }
  if (source.endsWith("[]")) {
    if (!Array.isArray(value)) return "must be an array";
    const itemType = source.slice(0, -2).trim();
    for (let index = 0; index < value.length; index += 1) {
      const issue = validateAliasValue(value[index], itemType, contract);
      if (issue) return `item ${index} ${issue}`;
    }
    return null;
  }
  if (source.startsWith("{") && source.endsWith("}")) {
    if (!isPlainJsonObject(value) || isTreeNode(value)) return "must be an object";
    for (const member of splitTopLevel(source.slice(1, -1), ";")) {
      const separator = findTopLevel(member, ":");
      if (separator < 0) continue;
      const rawName = member.slice(0, separator).trim();
      const optional = rawName.endsWith("?");
      const name = optional ? rawName.slice(0, -1) : rawName;
      const memberType = member.slice(separator + 1).trim();
      if (!(name in value)) {
        if (!optional) return `is missing required field "${name}"`;
        continue;
      }
      const issue = validateAliasValue(value[name], memberType, contract);
      if (issue) return `field "${name}" ${issue}`;
    }
    return null;
  }
  if (source === "string") return typeof value === "string" ? null : "must be a string";
  if (source === "number") return typeof value === "number" ? null : "must be a number";
  if (source === "boolean") return typeof value === "boolean" ? null : "must be a boolean";
  if (source === "null") return value === null ? null : "must be null";
  if (/^(['"]).*\1$/.test(source)) {
    const literal = source.slice(1, -1);
    return value === literal ? null : `must equal ${JSON.stringify(literal)}`;
  }
  const nested = contract.types?.[source];
  if (nested?.alias) return validateAliasValue(value, nested.alias, contract);
  if (nested?.values) {
    return typeof value === "string" && nested.values.includes(value)
      ? null
      : `must be one of ${nested.values.map((item) => JSON.stringify(item)).join(", ")}`;
  }
  // Unknown external aliases are intentionally outside this validator's proof
  // boundary; their serializable shape is not declared in the contract.
  return null;
}

function isPlainJsonObject(value: PropValue): value is Record<string, PropValue> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function splitTopLevel(source: string, delimiter: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let quote = "";
  let start = 0;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === quote && source[index - 1] !== "\\") quote = "";
      continue;
    }
    if (char === "'" || char === '"') quote = char;
    else if (char === "{" || char === "[" || char === "(") depth += 1;
    else if (char === "}" || char === "]" || char === ")") depth -= 1;
    else if (char === delimiter && depth === 0) {
      out.push(source.slice(start, index).trim());
      start = index + 1;
    }
  }
  out.push(source.slice(start).trim());
  return out.filter(Boolean);
}

function findTopLevel(source: string, delimiter: string): number {
  let depth = 0;
  let quote = "";
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === quote && source[index - 1] !== "\\") quote = "";
      continue;
    }
    if (char === "'" || char === '"') quote = char;
    else if (char === "{" || char === "[" || char === "(") depth += 1;
    else if (char === "}" || char === "]" || char === ")") depth -= 1;
    else if (char === delimiter && depth === 0) return index;
  }
  return -1;
}

function isTreeNode(value: unknown): value is TreeNode {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return keys.length === 1 && keys[0].startsWith("fsds.");
}

/**
 * Collect every prop name declared on a contract. Includes both `styled` and
 * `unstyled` groups; the codegen treats them as one consumer-facing surface.
 */
function collectPropNames(contract: ComponentContract): Set<string> {
  const out = new Set<string>();
  const groups = contract.props ?? {};
  for (const group of Object.values(groups)) {
    if (!group || typeof group !== "object") continue;
    const members = (group as { members?: { name?: string }[] }).members ?? [];
    for (const m of members) {
      if (typeof m?.name === "string") out.add(m.name);
    }
  }
  return out;
}

/**
 * Parse a JSONL file's text into [lineNumber, raw-object] pairs. Skips blank
 * lines so authors can use whitespace for grouping. lineNumber is 1-based.
 */
export function parseUsageJsonl(
  text: string,
): Array<{ lineNumber: number; raw: unknown; parseError?: string }> {
  const result: Array<{ lineNumber: number; raw: unknown; parseError?: string }> = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed === "") return;
    try {
      result.push({ lineNumber: i + 1, raw: JSON.parse(line) });
    } catch (e) {
      result.push({
        lineNumber: i + 1,
        raw: null,
        parseError: (e as Error).message,
      });
    }
  });
  return result;
}
