/**
 * Render a usage-JSONL tree as live React. Walks the structured composition
 * and instantiates real components from `@full-stack-ds/react`.
 *
 * Trust assumption: the codegen's `--check-usage` validator has already
 * verified that every `fsds.<Name>` ref resolves, every prop key matches the
 * target contract, and every slot key matches an anatomy part. So the
 * renderer can be optimistic. When something does fail (e.g. dev edit before
 * re-validate), we render a small fallback in place rather than crashing.
 *
 * Region resolution derives from the target contract's anatomy DOM:
 *   1. Named DOM slots become entries in the generated `slots` object.
 *   2. Compound anatomy parts become compound child components when the root
 *      exposes ordinary children.
 *   3. Other anatomy regions become ordinary children only when the contract
 *      exposes a children placeholder.
 *   4. Regions without a consumer path fail visibly; usage validation rejects
 *      the same shape before it reaches a generated bundle.
 *
 * Children handling:
 *   - String → text node.
 *   - Tree node → recursive render.
 *   - Array → mapped recursively, strings stay text, nodes recurse.
 */
import type { ReactNode } from "react";
import { createElement, Fragment } from "react";
import { resolveRootComponent, resolveSlot } from "./usage-registry";
import type {
  ComponentContract,
  DomNode,
  UsageNodeBody,
  UsagePropValue,
  UsageTreeNode,
} from "../types/data";

export interface UsageRenderOptions {
  /** Contract authority used to decide how authored regions reach a component. */
  resolveContract?: (ref: string) => ComponentContract | undefined;
}

/**
 * Bundled-asset seam for usage examples. A usage.jsonl is JSON, so it cannot
 * `import` a bundled asset to get Vite's hashed URL. Instead an example may
 * reference a file under `src/assets/` with the sentinel `@asset/<filename>`
 * (e.g. `"src": "@asset/darian-profile.webp"`); `resolveAssetSrc` swaps it for
 * the build-resolved URL. This keeps curated examples pointed at real images we
 * own rather than dead `https://example.com/...` URLs that 404 at runtime.
 */
const BUNDLED_ASSETS = import.meta.glob<string>("../assets/*", {
  eager: true,
  query: "?url",
  import: "default",
});

const ASSET_SENTINEL = "@asset/";

function resolveAssetSrc(value: string): string {
  if (!value.startsWith(ASSET_SENTINEL)) return value;
  const file = value.slice(ASSET_SENTINEL.length);
  const url = BUNDLED_ASSETS[`../assets/${file}`];
  if (!url) {
    // Fail visible-but-soft: keep the sentinel so the broken-image is obviously
    // a missing asset, not a silent empty src.
    if (import.meta.env?.DEV) {
      console.warn(
        `[render-usage] usage example references unknown bundled asset "${value}". ` +
          `Available: ${Object.keys(BUNDLED_ASSETS).join(", ")}`,
      );
    }
    return value;
  }
  return url;
}

export function renderUsageTree(
  node: UsageTreeNode,
  options: UsageRenderOptions = {},
  key?: string | number,
): ReactNode {
  const entries = Object.entries(node);
  if (entries.length !== 1) {
    return <UsageFallback message={`tree node must have exactly one fsds.* ref, got ${entries.length}`} />;
  }
  const [ref, body] = entries[0];
  const Component = resolveRootComponent(ref);
  if (!Component) {
    return <UsageFallback message={`unknown component ref: ${ref}`} />;
  }
  return renderResolved(ref, Component, body, options, key);
}

function renderResolved(
  ref: string,
  Component: React.ComponentType<Record<string, unknown>>,
  body: UsageNodeBody,
  options: UsageRenderOptions,
  key?: string | number,
): ReactNode {
  const props: Record<string, unknown> = {};

  // Props pass through as-is, except `children` which may carry sub-trees.
  if (body.props) {
    for (const [propName, value] of Object.entries(body.props)) {
      props[propName] = propName === "children"
        ? materializeChildren(value, options)
        : materializeProp(value, options);
    }
  }

  // A sidecar's `slots` keys name semantic anatomy regions. The contract — not
  // a component-name switch in this renderer — determines their React delivery:
  //   1. Named contract DOM slot -> generated `slots={{ name: content }}` prop.
  //   2. Generated compound surface -> compound child component.
  //   3. Contract children placeholder -> ordinary children.
  //   4. No admitted path -> visible fallback (the validator rejects this too).
  const contract = options.resolveContract?.(ref);
  const surface = contract ? usageDeliverySurface(contract) : undefined;
  const namedSlots: Record<string, ReactNode> = {};
  const slotChildren: ReactNode[] = [];
  if (body.slots) {
    for (const [slotName, child] of Object.entries(body.slots)) {
      const childNode: ReactNode =
        typeof child === "string"
          ? child
          : renderUsageTree(child, options, slotName);

      if (surface?.namedSlots.has(slotName)) {
        namedSlots[slotName] = childNode;
        continue;
      }

      const SlotComponent = surface?.anatomyParts.has(slotName)
        ? resolveSlot(ref, slotName)
        : null;
      if (SlotComponent && surface?.acceptsChildren) {
        slotChildren.push(
          createElement(SlotComponent, { key: slotName }, childNode),
        );
      } else if (surface?.acceptsChildren) {
        slotChildren.push(
          typeof child === "string" ? (
            <Fragment key={slotName}>{child}</Fragment>
          ) : (
            childNode
          ),
        );
      } else {
        slotChildren.push(
          <UsageFallback
            key={slotName}
            message={
              contract
                ? `${ref} region "${slotName}" has no consumer delivery path`
                : `contract unavailable for ${ref} region "${slotName}"`
            }
          />,
        );
      }
    }
  }

  if (Object.keys(namedSlots).length > 0) {
    props.slots = namedSlots;
  }

  // Authored props.children and region-derived children are both content.
  // Preserve both; region content precedes the label/content authored as the
  // ordinary children value (e.g. Chip icon before Chip text).
  const authoredChildren = props.children as ReactNode;
  if (slotChildren.length > 0 && authoredChildren !== undefined) {
    props.children = [...slotChildren, authoredChildren];
  } else if (slotChildren.length > 0) {
    props.children = slotChildren;
  }
  return createElement(Component, { ...props, key });
}

function materializeProp(
  value: UsagePropValue,
  options: UsageRenderOptions,
): unknown {
  if (typeof value === "string") {
    return resolveAssetSrc(value);
  }
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item, i) =>
      typeof item === "string" ? item : renderUsageTree(item, options, i),
    );
  }
  // Tree node passed as a non-children prop — render it.
  return renderUsageTree(value, options);
}

function materializeChildren(
  value: UsagePropValue,
  options: UsageRenderOptions,
): ReactNode {
  if (value === null || value === undefined) return null;
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value as ReactNode;
  }
  if (Array.isArray(value)) {
    return value.map((item, i) => {
      if (typeof item === "string") return <Fragment key={i}>{item}</Fragment>;
      return renderUsageTree(item, options, i);
    });
  }
  return renderUsageTree(value, options);
}

interface UsageDeliverySurface {
  anatomyParts: Set<string>;
  namedSlots: Set<string>;
  acceptsChildren: boolean;
}

function usageDeliverySurface(contract: ComponentContract): UsageDeliverySurface {
  const anatomy = contract.anatomy;
  if (!anatomy || Array.isArray(anatomy)) {
    return {
      anatomyParts: new Set(anatomy ?? []),
      namedSlots: new Set(),
      // Contracts without an explicit DOM use the codegen's legacy child host.
      acceptsChildren: true,
    };
  }

  const namedSlots = new Set<string>();
  let acceptsChildren = false;
  walkDom(anatomy.dom, (node) => {
    if (node.tag === "children" || (node.tag === "slot" && !node.name)) {
      acceptsChildren = true;
    }
    if (node.tag === "slot" && node.name) namedSlots.add(node.name);
  });

  return {
    anatomyParts: new Set(anatomy.parts),
    namedSlots,
    acceptsChildren,
  };
}

function walkDom(
  node: DomNode | undefined,
  visit: (node: DomNode) => void,
): void {
  if (!node) return;
  visit(node);
  for (const child of node.children ?? []) walkDom(child, visit);
}

function UsageFallback({ message }: { message: string }) {
  return (
    <code
      style={{
        display: "inline-block",
        padding: "var(--fsds-core-spacing-size-04) var(--fsds-core-spacing-size-05)",
        border: "1px dashed var(--fsds-semantic-color-border-danger, #c00)",
        color: "var(--fsds-semantic-color-foreground-danger, #c00)",
        fontSize: "0.85em",
      }}
    >
      [usage fallback] {message}
    </code>
  );
}
