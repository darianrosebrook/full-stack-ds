import type {
  ComponentBundle,
  UsageLine,
  UsagePropValue,
  UsageTreeNode,
} from "../../types/data";
import { renderUsageTree } from "../../lib/render-usage";
import {
  materialTokenRows,
  tokenOverridesToStyle,
} from "../../components/properties-panel/control-derivation";

interface UsageExamplesProps {
  component: ComponentBundle;
  /**
   * Live prop overrides from the right-rail Properties tab. These are merged
   * into the root component of each curated example at render time only; the
   * usage sidecar remains the authored source of truth.
   */
  propOverrides?: Record<string, unknown>;
  /**
   * Live token overrides (slot → literal). Examples render in the host
   * document — not an iframe — so the overrides apply as scoped inline custom
   * properties on each example frame (see tokenOverridesToStyle), never :root.
   */
  tokenOverrides?: Record<string, string>;
}

function coerceUsagePropOverride(value: unknown): UsagePropValue | undefined {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return value;
  }
  return undefined;
}

function sanitizedUsagePropOverrides(
  overrides: Record<string, unknown> | undefined,
): Record<string, UsagePropValue> {
  const out: Record<string, UsagePropValue> = {};
  for (const [key, value] of Object.entries(overrides ?? {})) {
    const coerced = coerceUsagePropOverride(value);
    if (coerced !== undefined) out[key] = coerced;
  }
  return out;
}

export function applyRootUsagePropOverrides(
  tree: UsageTreeNode,
  componentName: string,
  propOverrides: Record<string, unknown> | undefined,
): UsageTreeNode {
  const overrides = sanitizedUsagePropOverrides(propOverrides);
  if (Object.keys(overrides).length === 0) return tree;

  const entries = Object.entries(tree);
  if (entries.length !== 1) return tree;

  const [ref, body] = entries[0];
  if (ref !== `fsds.${componentName}`) return tree;

  return {
    [ref]: {
      ...body,
      props: {
        ...(body.props ?? {}),
        ...overrides,
      },
    },
  };
}

/**
 * Render every curated example from `<Name>.usage.jsonl` as live React. The
 * first example takes a larger frame as the de-facto hero; subsequent
 * examples stack below with a one-line label.
 *
 * When a component has no usage sidecar yet, this section renders nothing —
 * callers should gate on `component.usage.length` to decide whether to show
 * the surrounding section chrome.
 */
export function UsageExamples({
  component,
  propOverrides,
  tokenOverrides,
}: UsageExamplesProps) {
  if (component.usage.length === 0) return null;
  const [hero, ...rest] = component.usage;

  // Lower token overrides once for all frames; pass the derived rows so each
  // overridden slot also sets its resolvesTo semantic var (variant rules read
  // the semantic leaf, not the slot var — see tokenOverridesToCss).
  const tokenStyle =
    tokenOverrides && Object.keys(tokenOverrides).length > 0
      ? tokenOverridesToStyle(tokenOverrides, materialTokenRows(component))
      : undefined;

  return (
    <div>
      <ExampleFrame
        example={hero}
        emphasize
        componentName={component.name}
        propOverrides={propOverrides}
        tokenStyle={tokenStyle}
      />
      {rest.length > 0 && (
        <div style={{ display: "grid", gap: "var(--fsds-core-spacing-size-06)", marginTop: "var(--fsds-core-spacing-size-07)" }}>
          {rest.map((ex) => (
            <ExampleFrame
              key={ex.name}
              example={ex}
              componentName={component.name}
              propOverrides={propOverrides}
              tokenStyle={tokenStyle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ExampleFrameProps {
  example: UsageLine;
  emphasize?: boolean;
  componentName: string;
  propOverrides?: Record<string, unknown>;
  /** Scoped custom-property overrides spread onto the preview frame. */
  tokenStyle?: Record<string, string>;
}

function ExampleFrame({
  example,
  emphasize,
  componentName,
  propOverrides,
  tokenStyle,
}: ExampleFrameProps) {
  const renderedTree = applyRootUsagePropOverrides(
    example.tree,
    componentName,
    propOverrides,
  );

  return (
    <div className="panel">
      <div className="panel-toolbar">
        <span>
          {componentName} · <strong>{example.name}</strong>
        </span>
        {example.description && (
          <span className="muted" title={example.description}>
            {example.description}
          </span>
        )}
      </div>
      <div
        className="preview-frame"
        style={{
          padding: emphasize ? "var(--fsds-core-spacing-size-08)" : "var(--fsds-core-spacing-size-06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...tokenStyle,
        }}
      >
        {renderUsageTree(renderedTree)}
      </div>
    </div>
  );
}
