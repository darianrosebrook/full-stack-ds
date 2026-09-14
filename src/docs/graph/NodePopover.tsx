import { Button } from "@full-stack-ds/react";
import { useEffect, useRef } from "react";

import type { GraphRenderNode } from "./docsGraphAdapter";

/**
 * Click popover for a docs-graph node, ported from Sterling's
 * DocsNodePopover contract: Escape dismisses, click-outside dismisses, and
 * Open navigates with the same callback the sidebar reader list uses. It is
 * the keyboard-reachable affordance for graph -> reader navigation.
 */

export interface NodePopoverProps {
  node: GraphRenderNode;
  onOpen: (route: string) => void;
  onDismiss: () => void;
}

export function NodePopover({ node, onOpen, onDismiss }: NodePopoverProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node) === false) onDismiss();
    };
    // capture phase: dismiss before the canvas re-opens a popover for the
    // same click that landed outside.
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [onDismiss]);

  return (
    <div
      ref={rootRef}
      className="docs-graph-popover"
      role="dialog"
      aria-label={`${node.title} details`}
    >
      <p className="docs-graph-popover__title">{node.title}</p>
      <p className="docs-graph-popover__path">{node.relPath}</p>
      <dl className="docs-graph-popover__meta">
        <div>
          <dt>authority</dt>
          <dd>{node.authority ?? "—"}</dd>
        </div>
        <div>
          <dt>status</dt>
          <dd>{node.status ?? "—"}</dd>
        </div>
        <div>
          <dt>links</dt>
          <dd>{node.degree}</dd>
        </div>
      </dl>
      <div className="docs-graph-popover__actions">
        <a
          href={`#${node.route}`}
          className="docs-graph-popover__open"
          onClick={() => onOpen(node.route)}
        >
          Open
        </a>
        <Button variant="ghost" size="small" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
