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

  // Slots: try compound resolution first; if neither static-property nor
  // sibling-export form exists, pass through as a named JSX prop. Static-
  // property and sibling-export slots become JSX children of the root.
  const slotChildren: ReactNode[] = [];
  if (body.slots) {
    for (const [slotName, child] of Object.entries(body.slots)) {
      const SlotComponent = resolveSlot(ref, slotName);
      const childNode = renderUsageTree(child);
      if (SlotComponent) {
        slotChildren.push(
          createElement(SlotComponent, { key: slotName }, childNode),
        );
      } else {
        // Last-resort fallback: render as a named JSX prop. Some components
        // genuinely accept slots-as-props (legacy from before compound parts
        // were standardized). The validator already guarantees the slot name
        // matches an anatomy part, so this never injects a stray prop.
        props[slotName] = childNode;
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
        padding: "var(--space-2) var(--space-3)",
        border: "1px dashed var(--semantic-color-border-danger, #c00)",
        color: "var(--semantic-color-foreground-danger, #c00)",
        fontSize: "0.85em",
      }}
    >
      [usage fallback] {message}
    </code>
  );
}
