import { ref, watchEffect, type Ref } from "vue";

export interface UsePortalOptions {
  enabled?: boolean;
  target?: () => Element | string | undefined;
}

export interface UsePortalResult {
  enabled: boolean;
  target: Ref<Element | null>;
}

/**
 * Resolve a portal mount point reactively. Vue's <Teleport> takes a
 * DOM element or selector string at template time; this composable
 * pre-resolves the element from the options' target getter so consumers
 * can pass it to <Teleport :to="portalTarget">.
 */
export function usePortal(options: UsePortalOptions = {}): UsePortalResult {
  const { enabled = true, target } = options;
  const resolved = ref<Element | null>(null);

  watchEffect(() => {
    if (!enabled || typeof document === "undefined") {
      resolved.value = null;
      return;
    }
    const t = target?.();
    if (typeof t === "string") {
      resolved.value = document.querySelector(t) ?? document.body;
    } else if (t) {
      resolved.value = t;
    } else {
      resolved.value = document.body;
    }
  });

  return { enabled, target: resolved };
}
