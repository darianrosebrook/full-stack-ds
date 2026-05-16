import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface UsePortalOptions {
  /** When false (or SSR), children render inline at their natural position. */
  enabled?: boolean;
  /**
   * Mount point. Accepts a DOM element, a CSS selector resolved at mount,
   * or undefined to default to `document.body`.
   */
  target?: Element | string;
}

/**
 * Render `children` into a detached DOM node. Used by Modal/Tooltip/Popover
 * to escape stacking-context traps without leaking layout.
 *
 * Returns a render helper rather than a component so the caller can place
 * the JSX inline (`return <>{...} {portal(node)}</>;`) and avoid an extra
 * wrapper element.
 */
export function usePortal(options: UsePortalOptions = {}): {
  enabled: boolean;
  render: (node: ReactNode) => ReactNode;
} {
  const { enabled = true, target } = options;
  const [mountNode, setMountNode] = useState<Element | null>(null);

  useEffect(() => {
    if (!enabled || typeof document === "undefined") {
      setMountNode(null);
      return;
    }
    if (typeof target === "string") {
      setMountNode(document.querySelector(target) ?? document.body);
    } else if (target) {
      setMountNode(target);
    } else {
      setMountNode(document.body);
    }
  }, [enabled, target]);

  return {
    enabled,
    render: (node) => {
      if (!enabled || !mountNode) return node;
      return createPortal(node, mountNode);
    },
  };
}
