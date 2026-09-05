import type {
  ComponentBundle,
  UsageLine,
  UsagePropValue,
  UsageTreeNode,
} from "../../types/data";
import { type ReactNode, useState } from "react";
import { renderUsageTree } from "../../lib/render-usage";
import { bundle } from "../../types/bundle";
import { PortalTargetProvider, Stack } from "@full-stack-ds/react";
import {
  materialTokenRows,
  tokenOverridesToStyle,
} from "../../components/properties-panel/control-derivation";
import type { ComponentContract } from "../../types/data";

export type PortalPreviewKind = "overlay" | "anchored";

const PORTAL_PREVIEW_CLASS: Record<PortalPreviewKind, string> = {
  overlay: "preview-frame--portal-overlay",
  anchored: "preview-frame--portal-anchored",
};

export function portalPreviewKind(
  contract: ComponentContract,
): PortalPreviewKind | null {
  if (contract.portal?.enabled !== true) return null;
  const strategy = contract.surface?.positioning?.strategy;
  if (strategy === "centered" || strategy === "viewport-edge") return "overlay";
  if (strategy === "anchored") return "anchored";
  return null;
}

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

const compositionsByRef = new Map(
  bundle.components.map((entry) => [
    `fsds.${entry.name}`,
    entry.usageComposition,
  ]),
);

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
        portalKind={portalPreviewKind(component.contract)}
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
              portalKind={portalPreviewKind(component.contract)}
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
  portalKind: PortalPreviewKind | null;
}

function ExampleFrame({
  example,
  emphasize,
  componentName,
  propOverrides,
  tokenStyle,
  portalKind,
}: ExampleFrameProps) {
  const renderedTree = applyRootUsagePropOverrides(
    example.tree,
    componentName,
    propOverrides,
  );

  return (
    <div className="panel">
      <Stack variant="horizontal" className="panel-toolbar stack-gap-00">
        <span>
          {componentName} · <strong>{example.name}</strong>
        </span>
        {example.description && (
          <span className="muted" title={example.description}>
            {example.description}
          </span>
        )}
      </Stack>
      <Stack
        className={[
          "preview-frame stack-gap-00",
          portalKind && "preview-frame--portal",
          portalKind && PORTAL_PREVIEW_CLASS[portalKind],
        ].filter(Boolean).join(" ")}
        style={{
          padding: emphasize ? "var(--fsds-core-spacing-size-08)" : "var(--fsds-core-spacing-size-06)",
          alignItems: "center",
          justifyContent: "center",
          ...tokenStyle,
        }}
      >
        <PreviewContent portalKind={portalKind}>
          {renderUsageTree(renderedTree, {
            resolveComposition: (ref) => compositionsByRef.get(ref),
          })}
        </PreviewContent>
      </Stack>
    </div>
  );
}

function PreviewContent({
  portalKind,
  children,
}: {
  portalKind: PortalPreviewKind | null;
  children: ReactNode;
}) {
  const [portalTarget, setPortalTarget] = useState<HTMLDivElement | null>(null);
  if (portalKind === null) return children;

  return (
    <>
      <div
        ref={setPortalTarget}
        className="preview-frame__portal"
        data-fsds-preview-portal={portalKind}
      />
      {portalTarget && (
        <PortalTargetProvider target={portalTarget}>
          {children}
        </PortalTargetProvider>
      )}
    </>
  );
}
