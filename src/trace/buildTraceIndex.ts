import type {
  AnatomyDetailed,
  ComponentContract,
  Framework,
} from "../types/data";
import type { TraceHit, TraceIndex } from "./types";

// Anatomy can be a parts-array, a detailed object, or undefined. The trace
// rules only care about the detailed form (which carries `dom.tag` and
// `dom.bindings`). This helper narrows in one place so the rule resolvers
// can stay untyped-cast-free.
function detailedAnatomy(
  anatomy: ComponentContract["anatomy"],
): AnatomyDetailed | undefined {
  if (!anatomy || Array.isArray(anatomy)) return undefined;
  return anatomy;
}

interface PatternRule {
  /** A RegExp with the /g flag set. The first capture group is the highlight span. */
  pattern: RegExp;
  kind: TraceHit["kind"];
  /** Returns the contract path and explanation for a given match. May read the contract. */
  resolve: (
    match: RegExpExecArray,
    contract: ComponentContract,
  ) => { contractPath: string; explanation: string } | null;
}

// Indices in `source` where each line starts. `lineStarts[i]` is the offset
// of the first character on line `i` (0-based). The trailing entry is
// `source.length`, so `lineStarts[i+1] - lineStarts[i]` is the line length.
//
// Offsets are UTF-16 code units, matching `String.prototype.indexOf` and
// `RegExp.exec().index`. Source files in this codebase are ASCII; if a
// contract description with an emoji ever leaks into a generated source,
// columns will be off by the surrogate-pair count.
function buildLineStarts(source: string): number[] {
  const starts = [0];
  for (let i = 0; i < source.length; i++) {
    if (source[i] === "\n") starts.push(i + 1);
  }
  starts.push(source.length + 1);
  return starts;
}

function offsetToLineCol(
  lineStarts: number[],
  offset: number,
): { line: number; column: number } {
  // Binary-search for the greatest lineStarts[i] <= offset.
  let lo = 0;
  let hi = lineStarts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >>> 1;
    if (lineStarts[mid] <= offset) lo = mid;
    else hi = mid - 1;
  }
  return { line: lo, column: offset - lineStarts[lo] };
}

function applyRules(rules: PatternRule[], source: string, contract: ComponentContract): TraceHit[] {
  const lineStarts = buildLineStarts(source);
  const hits: TraceHit[] = [];
  for (const rule of rules) {
    rule.pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = rule.pattern.exec(source))) {
      const cap = m[1] ?? m[0];
      const capStart = m.index + (m[0].indexOf(cap) >= 0 ? m[0].indexOf(cap) : 0);
      const start = offsetToLineCol(lineStarts, capStart);
      const resolved = rule.resolve(m, contract);
      if (!resolved) continue;
      hits.push({
        ...resolved,
        kind: rule.kind,
        start,
        length: cap.length,
      });
    }
  }
  // Dedupe — same start position + length + path counts once.
  const seen = new Set<string>();
  const deduped = hits.filter((h) => {
    const k = `${h.start.line}:${h.start.column}:${h.length}:${h.contractPath}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // Drop overlapping hits on the same line. The renderer paints one segment per
  // hit, leftmost-wins; a later hit whose range starts inside an earlier hit
  // is dropped silently at render time, leaving the trace count out of sync
  // with what the user sees. Filtering here keeps `traceIndex.hits.length` and
  // rendered regions in agreement.
  deduped.sort((a, b) => a.start.line - b.start.line || a.start.column - b.start.column);
  const placed: TraceHit[] = [];
  let lastLine = -1;
  let lastEnd = -1;
  for (const h of deduped) {
    if (h.start.line === lastLine && h.start.column < lastEnd) continue;
    placed.push(h);
    lastLine = h.start.line;
    lastEnd = h.start.column + h.length;
  }
  return placed;
}

// React / TSX trace rules ----------------------------------------------------
const REACT_RULES: PatternRule[] = [
  // <button … > tag in JSX
  {
    pattern: /<\s*(button|input|label|select|textarea|nav|header|footer|main|section|article|aside|div|span|ul|ol|li|table|tr|td|th|thead|tbody|p|h1|h2|h3|h4|h5|h6|svg|a|dialog|details|summary|figure|img|figcaption)\b/g,
    kind: "tag",
    resolve: (m, contract) => {
      const tag = m[1];
      const declared = detailedAnatomy(contract.anatomy)?.dom?.tag;
      if (declared && declared.toLowerCase() === tag.toLowerCase()) {
        return {
          contractPath: "anatomy.dom.tag",
          explanation: `Root element tag declared by anatomy.dom.tag = "${tag}".`,
        };
      }
      return null;
    },
  },
  // Aria/disabled bindings from anatomy.dom.bindings
  {
    pattern: /\b(aria-[a-z]+|disabled|type|hidden|tabIndex|name|value)=\{[^}]+\}/g,
    kind: "binding",
    resolve: (m, contract) => {
      const attr = m[1];
      const bindings = detailedAnatomy(contract.anatomy)?.dom?.bindings;
      if (bindings && bindings[attr]) {
        return {
          contractPath: `anatomy.dom.bindings.${attr}`,
          explanation: `Bound from anatomy.dom.bindings.${attr} = "${bindings[attr]}".`,
        };
      }
      return null;
    },
  },
  // BEM variant modifiers — `button--${size}` etc.
  {
    pattern: /`[a-z][a-z0-9-]*--\$\{(\w+)\}`/g,
    kind: "variant",
    resolve: (m, contract) => {
      const variantKey = m[1];
      if (contract.variants && variantKey in contract.variants) {
        return {
          contractPath: `variants.${variantKey}`,
          explanation: `BEM modifier emitted from contract.variants.${variantKey}.`,
        };
      }
      // disabled is a state, not a variant
      if (contract.states?.includes(variantKey)) {
        return {
          contractPath: `states`,
          explanation: `BEM modifier for declared state "${variantKey}".`,
        };
      }
      return null;
    },
  },
];

// Vue trace rules ------------------------------------------------------------
const VUE_RULES: PatternRule[] = [
  {
    pattern: /<\s*(button|input|label|select|textarea|nav|header|footer|main|section|article|aside|div|span|ul|ol|li|table|tr|td|th|p|h1|h2|h3|h4|h5|h6|svg|a|dialog|details|summary)\b/g,
    kind: "tag",
    resolve: (m, contract) => {
      const tag = m[1];
      const declared = detailedAnatomy(contract.anatomy)?.dom?.tag;
      if (declared && declared.toLowerCase() === tag.toLowerCase()) {
        return {
          contractPath: "anatomy.dom.tag",
          explanation: `Root tag from anatomy.dom.tag = "${tag}".`,
        };
      }
      return null;
    },
  },
  {
    pattern: /:(aria-[a-z]+|disabled|type)=/g,
    kind: "binding",
    resolve: (m, contract) => {
      const attr = m[1];
      const bindings = detailedAnatomy(contract.anatomy)?.dom?.bindings;
      if (bindings && bindings[attr]) {
        return {
          contractPath: `anatomy.dom.bindings.${attr}`,
          explanation: `Bound from anatomy.dom.bindings.${attr} = "${bindings[attr]}".`,
        };
      }
      return null;
    },
  },
  {
    pattern: /`[a-z][a-z0-9-]*--\$\{(?:props\.)?(\w+)\}`/g,
    kind: "variant",
    resolve: (m, contract) => {
      const variantKey = m[1];
      if (contract.variants && variantKey in contract.variants) {
        return {
          contractPath: `variants.${variantKey}`,
          explanation: `BEM modifier from contract.variants.${variantKey}.`,
        };
      }
      return null;
    },
  },
];

const SVELTE_RULES: PatternRule[] = REACT_RULES; // similar template syntax
const LIT_RULES: PatternRule[] = [
  {
    pattern: /html`<\s*(button|input|label|select|textarea|nav|header|footer|main|section|article|aside|div|span|ul|ol|li|table|tr|td|th|p|h1|h2|h3|h4|h5|h6|svg|a|dialog|details|summary)\b/g,
    kind: "tag",
    resolve: (m, contract) => {
      const tag = m[1];
      const declared = detailedAnatomy(contract.anatomy)?.dom?.tag;
      if (declared && declared.toLowerCase() === tag.toLowerCase()) {
        return {
          contractPath: "anatomy.dom.tag",
          explanation: `Root element tag from anatomy.dom.tag.`,
        };
      }
      return null;
    },
  },
];
const ANGULAR_RULES: PatternRule[] = [
  {
    pattern: /template:\s*`<\s*(button|input|label|select|textarea|nav|header|footer|main|section|article|aside|div|span|ul|ol|li|table|tr|td|th|p|h1|h2|h3|h4|h5|h6|svg|a|dialog|details|summary)\b/g,
    kind: "tag",
    resolve: (m, contract) => {
      const tag = m[1];
      const declared = detailedAnatomy(contract.anatomy)?.dom?.tag;
      if (declared && declared.toLowerCase() === tag.toLowerCase()) {
        return {
          contractPath: "anatomy.dom.tag",
          explanation: `Root element tag from anatomy.dom.tag.`,
        };
      }
      return null;
    },
  },
  {
    pattern: /@Input\(\)\s+(\w+)\??:/g,
    kind: "prop",
    resolve: (m, contract) => {
      const name = m[1];
      const members = contract.props?.styled?.members ?? [];
      if (members.some((p) => p.name === name)) {
        return {
          contractPath: `props.styled.members`,
          explanation: `@Input declared because contract.props.styled.members includes "${name}".`,
        };
      }
      if (contract.variants && name in contract.variants) {
        return {
          contractPath: `variants.${name}`,
          explanation: `@Input bound from variant key "${name}".`,
        };
      }
      return null;
    },
  },
];

const RULES_BY_FRAMEWORK: Record<Framework, PatternRule[]> = {
  react: REACT_RULES,
  vue: VUE_RULES,
  svelte: SVELTE_RULES,
  lit: LIT_RULES,
  angular: ANGULAR_RULES,
};

export function buildTraceIndex(
  framework: Framework,
  componentName: string,
  source: string,
  contract: ComponentContract,
): TraceIndex {
  const rules = RULES_BY_FRAMEWORK[framework] ?? [];
  return {
    framework,
    componentName,
    hits: applyRules(rules, source, contract),
  };
}
