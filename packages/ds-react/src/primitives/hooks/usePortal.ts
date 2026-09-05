import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";

type PortalTarget = Element | string | null;

const PortalTargetContext = createContext<PortalTarget | undefined>(undefined);

export interface PortalTargetProviderProps {
  /** Destination used by every portal primitive below this composition seam. */
  target: PortalTarget;
  children?: ReactNode;
}

/**
 * Override the default portal destination for a composed subtree.
 *
 * Applications normally need no provider: portals continue to mount at
 * `document.body`. Bounded hosts such as component explorers can supply an
 * isolated canvas without adding preview-only props to every component.
 */
export function PortalTargetProvider({
  target,
  children,
}: PortalTargetProviderProps) {
  return createElement(PortalTargetContext.Provider, { value: target }, children);
}

/** Resolve an explicit or composed target, defaulting to body for consumers. */
export function usePortalTarget(override?: Element | string): Element | null {
  const composedTarget = useContext(PortalTargetContext);
  const hasOverride = override !== undefined;
  const requested = hasOverride ? override : composedTarget;
  const [mountNode, setMountNode] = useState<Element | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") {
      setMountNode(null);
      return;
    }
    if (requested === null) {
      setMountNode(null);
      return;
    }
    if (typeof requested === "string") {
      const resolved = document.querySelector(requested);
      // Preserve the public explicit-selector fallback. A provider whose
      // target is not ready stays inline instead of escaping its boundary.
      setMountNode(resolved ?? (hasOverride ? document.body : null));
      return;
    }
    setMountNode(requested ?? document.body);
  }, [hasOverride, requested]);

  return mountNode;
}

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
  const mountNode = usePortalTarget(target);

  return {
    enabled,
    render: (node) => {
      if (!enabled || !mountNode) return node;
      return createPortal(node, mountNode);
    },
  };
}
