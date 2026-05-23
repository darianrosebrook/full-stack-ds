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
 * Slot resolution (see usage-registry.ts):
 *   1. If `Root[CapitalizedSlot]` exists → render as a static-property
 *      compound child (`<Popover.Trigger>...</Popover.Trigger>`).
 *   2. Else if `<RootName><CapitalizedSlot>` exists as a sibling export →
 *      render that (`<CardHeader>...</CardHeader>`).
 *   3. Else fall back to passing the slot's rendered content as a JSX prop
 *      named after the slot (`<Card header={...} />`).
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
  UsageNodeBody,
  UsagePropValue,
  UsageTreeNode,
} from "../types/data";

export function renderUsageTree(node: UsageTreeNode, key?: string | number): ReactNode {
  const entries = Object.entries(node);
  if (entries.length !== 1) {
    return <UsageFallback message={`tree node must have exactly one fsds.* ref, got ${entries.length}`} />;
  }
  const [ref, body] = entries[0];
  const Component = resolveRootComponent(ref);
  if (!Component) {
    return <UsageFallback message={`unknown component ref: ${ref}`} />;
  }
  return renderResolved(ref, Component, body, key);
}

function renderResolved(
  ref: string,
  Component: React.ComponentType<Record<string, unknown>>,
  body: UsageNodeBody,
  key?: string | number,
): ReactNode {
  const props: Record<string, unknown> = {};

  // Props pass through as-is, except `children` which may carry sub-trees.
  if (body.props) {
    for (const [propName, value] of Object.entries(body.props)) {
      props[propName] = propName === "children"
        ? materializeChildren(value)
        : materializeProp(value);
    }
  }

  // Slots: try to resolve the slot name to a real React surface in this order:
  //   1. Root[CapitalizedSlot] — static-property compound (Popover.Trigger).
  //   2. <RootName><CapitalizedSlot> — sibling-export compound (CardHeader).
  //   3. Inline child — append the rendered tree to children directly.
  //
  // The inline-child fallback exists because not every anatomy part has a
  // matching React surface: anatomy is the contract's semantic description,
  // and the React implementation may collapse multiple semantic parts into
  // one element or expose only a subset as compounds. Spreading unrecognized
  // slots as JSX props (the old fallback) leaked their values onto the root
  // element as DOM attributes — visible junk in the dev tools and broken
  // behavior at runtime. Inlining the child is the safe default: the content
  // still appears in the document; only the semantic-slot wrapper is lost.
  const slotChildren: ReactNode[] = [];
  if (body.slots) {
    for (const [slotName, child] of Object.entries(body.slots)) {
      const SlotComponent = resolveSlot(ref, slotName);
      const childNode: ReactNode =
        typeof child === "string" ? child : renderUsageTree(child, slotName);
      if (SlotComponent) {
        slotChildren.push(
          createElement(SlotComponent, { key: slotName }, childNode),
        );
      } else {
        // Inline as-is. For strings we wrap in a Fragment so React can key it
        // alongside its slot siblings without a host element.
        slotChildren.push(
          typeof child === "string" ? (
            <Fragment key={slotName}>{child}</Fragment>
          ) : (
            childNode
          ),
        );
      }
    }
  }

  // If slot children exist, they take precedence over `children`. Most
  // usage examples either set props.children OR slots, not both.
  if (slotChildren.length > 0) {
    return createElement(
      Component,
      { ...props, key },
      slotChildren,
    );
  }

  return createElement(Component, { ...props, key });
}

function materializeProp(value: UsagePropValue): unknown {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item, i) =>
      typeof item === "string" ? item : renderUsageTree(item, i),
    );
  }
  // Tree node passed as a non-children prop — render it.
  return renderUsageTree(value);
}

function materializeChildren(value: UsagePropValue): ReactNode {
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
      return renderUsageTree(item, i);
    });
  }
  return renderUsageTree(value);
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
