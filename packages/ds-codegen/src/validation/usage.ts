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
import type { ComponentContract } from "../contract.js";
import type { ValidationIssue } from "../validate.js";

/** A usage tree node — the post-schema-validated shape. */
interface TreeNode {
  // Exactly one key matching /^fsds\.[A-Z][A-Za-z0-9]*$/.
  [ref: string]: NodeBody;
}

interface NodeBody {
  props?: Record<string, PropValue>;
  slots?: Record<string, TreeNode>;
}

type PropValue = string | number | boolean | null | TreeNode | (string | TreeNode)[];

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
  const compName = ref.replace(/^fsds\./, "");
  const target = ctx.contracts.get(compName);
  if (!target) {
    issues.push({
      pointer,
      message: `${sourcePrefix}: unknown component ref "${ref}" — no contract named "${compName}"`,
    });
    return;
  }

  const body = node[ref];

  if (body.props) {
    const targetPropNames = collectPropNames(target);
    for (const propName of Object.keys(body.props)) {
      // `children` is universally accepted in the DS — contracts don't enumerate
      // it because the codegen threads it through every framework's component
      // signature regardless. Only flag non-children props missing from the
      // contract's props.styled.members.
      if (propName !== "children" && !targetPropNames.has(propName)) {
        issues.push({
          pointer: `${pointer}/props/${propName}`,
          message: `${sourcePrefix}: prop "${propName}" is not declared on ${compName}`,
        });
      }
      // Children may carry sub-trees; descend.
      if (propName === "children") {
        const v = body.props[propName];
        if (Array.isArray(v)) {
          v.forEach((item, i) => {
            if (typeof item === "object" && item !== null) {
              walkTreeNode(item, `${pointer}/props/children/${i}`, sourcePrefix, ctx, issues);
            }
          });
        } else if (typeof v === "object" && v !== null) {
          walkTreeNode(v, `${pointer}/props/children`, sourcePrefix, ctx, issues);
        }
      }
    }
  }

  if (body.slots) {
    const anatomy = target.anatomy;
    const partNames = Array.isArray(anatomy)
      ? anatomy
      : (anatomy?.parts ?? []);
    const anatomyParts = new Set(partNames);
    for (const [slotName, child] of Object.entries(body.slots)) {
      if (!anatomyParts.has(slotName)) {
        issues.push({
          pointer: `${pointer}/slots/${slotName}`,
          message: `${sourcePrefix}: slot "${slotName}" is not an anatomy part on ${compName}`,
        });
      }
      walkTreeNode(child, `${pointer}/slots/${slotName}`, sourcePrefix, ctx, issues);
    }
  }
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
