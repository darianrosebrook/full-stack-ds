import { computed, getCurrentInstance, onBeforeUnmount, ref, watch, type ComponentPublicInstance, type ComputedRef } from "vue";

/**
 * Vue's ref-callback signature. The DOM ref may resolve to an
 * Element, a Vue ComponentPublicInstance, or null (during teardown).
 * We only care about the Element case; the Vue-component path is
 * unreachable here because we attach refs to native elements.
 */
export type SurfaceRefCallback = (
  el: Element | ComponentPublicInstance | null,
) => void;
import {
  AnchoredSurfaceController,
  type AnchoredSurfaceControllerOptions,
} from "./AnchoredSurfaceController";
import type {
  SurfaceAnchorRelation,
  SurfaceDismissalMode,
  SurfaceOpenTrigger,
} from "./SurfaceController";

export interface UseAnchoredSurfaceOptions {
  /** Controlled getter — returns the current open value, or undefined
   *  when uncontrolled. Vue convention: getter-shaped to keep the
   *  binding reactive. */
  open: () => boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openTriggers: () => readonly SurfaceOpenTrigger[];
  dismissal: () => readonly SurfaceDismissalMode[];
  anchorRelation: SurfaceAnchorRelation;
  disabled?: () => boolean;
  /** Optional override for the content id. Defaults to a unique id. */
  idBase?: string;
  /**
   * The data-attribute marker applied to the trigger element to make
   * the trigger discoverable from CSS / DOM-walk integrations.
   * Per-surface, derived from cssPrefix at emit time
   * (e.g. "data-tooltip-trigger", "data-popover-trigger").
   */
  dataMarker: SurfaceDataMarker;
}

/**
 * Template-literal type for the trigger data marker. Constrains the
 * key shape to `data-<prefix>-trigger` so the emitter can't pass a
 * malformed marker (e.g. without the `data-` prefix) without tsc
 * flagging the call site.
 */
export type SurfaceDataMarker = `data-${string}-trigger`;

export interface SurfaceTriggerHandlers {
  onPointerenter?: (event: PointerEvent) => void;
  onPointerleave?: (event: PointerEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onClick?: (event: MouseEvent) => void;
}

/**
 * Public bag spread onto the consumer's adopted host element via
 *
 *   <SurfaceTrigger v-slot="{ triggerProps }">
 *     <button v-bind="triggerProps">Save</button>
 *   </SurfaceTrigger>
 *
 * The bag is intentionally indivisible — ref, ARIA attribute, data
 * marker, and all event handlers travel together so consumers cannot
 * silently break the substrate by spreading only part of it. The
 * data-marker key is parameterized by the per-surface `dataMarker`
 * option (e.g. "data-tooltip-trigger", "data-popover-trigger"); the
 * index signature constrains it to `data-<x>-trigger` shape.
 */
export type SurfaceTriggerProps = SurfaceTriggerHandlers & {
  ref: SurfaceRefCallback;
  "aria-describedby"?: string;
  "aria-controls"?: string;
  "aria-expanded"?: boolean;
  "aria-labelledby"?: string;
} & {
  [K in SurfaceDataMarker]: "";
};

export interface UseAnchoredSurfaceResult {
  open: ComputedRef<boolean>;
  setOpen: (next: boolean) => void;
  contentId: string;
  anchorRelation: SurfaceAnchorRelation;
  /** Default-host path: ref callback that registers the anchor AND
   *  causes the controller to install DOM listeners on it. */
  registerAnchor: SurfaceRefCallback;
  /** Slot-props path: ref callback that registers the anchor for ARIA
   *  queries and grace-path checks but does NOT install DOM listeners. */
  registerAnchorRefOnly: SurfaceRefCallback;
  registerContent: SurfaceRefCallback;
  /** Returns Vue-shaped handlers gated by the surface's openTriggers
   *  and dismissal. Used by the slot-props host adoption path. */
  getTriggerHandlers: () => SurfaceTriggerHandlers;
  /**
   * The complete bindings bag for slot-props host adoption. Consumer
   * spreads atomically via `v-bind="triggerProps"`.
   */
  triggerProps: ComputedRef<SurfaceTriggerProps>;
}

let surfaceIdCounter = 0;

/**
 * Vue adapter around AnchoredSurfaceController. Owns controlled /
 * uncontrolled open state and bridges component lifecycle to the
 * controller's listener wiring. Two adoption modes:
 *
 *   - **Default-host**: caller uses `registerAnchor`. Substrate auto-
 *     wires DOM listeners on the anchor element.
 *   - **Slot-props host adoption**: caller spreads `triggerProps`
 *     onto an adopted child element. Substrate skips anchor-side
 *     listener installation; consumer's Vue handlers and surface
 *     handlers compose via `composeEventHandlers`.
 *
 * Only one mode should be used per component instance. Mixing them
 * results in duplicate handler invocation.
 */
export function useAnchoredSurface(
  options: UseAnchoredSurfaceOptions,
): UseAnchoredSurfaceResult {
  surfaceIdCounter += 1;
  const contentId = options.idBase ?? `surface-${surfaceIdCounter}`;

  const uncontrolledOpen = ref<boolean>(options.defaultOpen === true);
  const open = computed<boolean>(() => {
    const controlled = options.open();
    return controlled === undefined ? uncontrolledOpen.value : controlled;
  });

  const setOpen = (next: boolean): void => {
    if (options.open() === undefined) {
      uncontrolledOpen.value = next;
    }
    options.onOpenChange?.(next);
  };

  const anchorNode = ref<HTMLElement | null>(null);
  const contentNode = ref<HTMLElement | null>(null);

  // Mode latches at first ref-callback installation. Same rule as
  // React: a surface instance picks default-host or handler-mode and
  // sticks with it for its lifetime.
  let handlerMode: boolean | null = null;
  let controller: AnchoredSurfaceController | null = null;
  // Vue fires :ref callbacks with `null` during teardown AFTER the
  // parent's onBeforeUnmount has run. Without this flag the substrate
  // would re-mount listeners during teardown and leak them past
  // component unmount.
  let teardown = false;

  function buildController(modeHandler: boolean): AnchoredSurfaceController {
    const controllerOptions: AnchoredSurfaceControllerOptions = {
      isOpen: () => open.value,
      setOpen,
      openTriggers: options.openTriggers(),
      dismissal: options.dismissal(),
      disabled: options.disabled,
      handlerMode: modeHandler,
    };
    return new AnchoredSurfaceController(controllerOptions);
  }

  function ensureController(modeHandler: boolean): AnchoredSurfaceController {
    if (controller && handlerMode === modeHandler) return controller;
    if (controller) controller.unmount();
    handlerMode = modeHandler;
    controller = buildController(modeHandler);
    return controller;
  }

  function remount(): void {
    if (!controller) return;
    controller.setAnchor(anchorNode.value);
    controller.setContent(contentNode.value);
    controller.mount();
  }

  function toHtmlElement(
    node: Element | ComponentPublicInstance | null,
  ): HTMLElement | null {
    if (node === null) return null;
    // Vue passes a ComponentPublicInstance when the ref is on a
    // component; we only attach refs to native elements, so the
    // Element branch is the live path. The HTMLElement assertion is
    // safe because every supported anchor/content target is HTML.
    if (node instanceof HTMLElement) return node;
    return null;
  }

  function registerAnchor(node: Element | ComponentPublicInstance | null): void {
    if (teardown) return;
    ensureController(false);
    anchorNode.value = toHtmlElement(node);
    remount();
  }

  function registerAnchorRefOnly(node: Element | ComponentPublicInstance | null): void {
    if (teardown) return;
    ensureController(true);
    anchorNode.value = toHtmlElement(node);
    remount();
  }

  function registerContent(node: Element | ComponentPublicInstance | null): void {
    if (teardown) return;
    contentNode.value = toHtmlElement(node);
    remount();
  }

  // Re-mount when dismissal modes change (e.g. closeOnEscape toggled
  // at runtime). openTriggers is contract-fixed and does not change.
  watch(
    () => options.dismissal().join(","),
    () => {
      if (!controller) return;
      controller.unmount();
      controller = buildController(handlerMode === true);
      remount();
    },
  );

  // If the composable is used inside a component, tear listeners down
  // on unmount. (When called outside a Vue instance, this is a no-op.)
  if (getCurrentInstance()) {
    onBeforeUnmount(() => {
      teardown = true;
      controller?.unmount();
      controller = null;
    });
  }

  const triggerProps = computed<SurfaceTriggerProps>(() => {
    const relation = options.anchorRelation;
    const isOpen = open.value;
    const handlers = getTriggerHandlersImpl();
    const ariaProps: Partial<SurfaceTriggerProps> = {};
    if (relation === "describedby" && isOpen) {
      ariaProps["aria-describedby"] = contentId;
    } else if (relation === "controls-expanded") {
      ariaProps["aria-controls"] = contentId;
      ariaProps["aria-expanded"] = isOpen;
    } else if (relation === "labelledby" && isOpen) {
      ariaProps["aria-labelledby"] = contentId;
    }
    // Build a base object and assign the parameterized data-marker
    // key dynamically. The cast back to SurfaceTriggerProps is safe
    // because `options.dataMarker` is typed as SurfaceDataMarker, so
    // the index signature is satisfied; TS can't narrow it through a
    // dynamic key assignment without help.
    const base: Record<string, unknown> = {
      ref: registerAnchorRefOnly,
      ...ariaProps,
      ...handlers,
    };
    base[options.dataMarker] = "";
    return base as unknown as SurfaceTriggerProps;
  });

  function getTriggerHandlersImpl(): SurfaceTriggerHandlers {
    const handlers: SurfaceTriggerHandlers = {};
    const triggers = options.openTriggers();
    const dismissal = options.dismissal();
    const isDisabled = () => options.disabled?.() === true;
    const openSurface = () => {
      if (isDisabled()) return;
      setOpen(true);
    };
    const closeSurface = () => setOpen(false);

    if (triggers.includes("hover")) {
      handlers.onPointerenter = () => openSurface();
    }
    if (triggers.includes("focus")) {
      handlers.onFocus = () => openSurface();
    }
    if (triggers.includes("click")) {
      handlers.onClick = () => {
        if (isDisabled()) return;
        setOpen(!open.value);
      };
    }
    if (dismissal.includes("pointer-leave")) {
      handlers.onPointerleave = (event) => {
        const next = event.relatedTarget as Node | null;
        if (next && contentNode.value && contentNode.value.contains(next)) {
          return;
        }
        closeSurface();
      };
    }
    if (dismissal.includes("blur")) {
      // Boundary semantics: when focus leaves the slot-host trigger,
      // only dismiss if relatedTarget is outside the anchor ∪
      // content surface. Tooltip content is non-focusable, so this
      // collapses to "outside content" in practice — but Popover
      // content has focusable descendants and this check is what
      // keeps the surface open when focus moves trigger → content.
      // Mirror of React F-3A atom A.
      handlers.onBlur = (event) => {
        const next = event.relatedTarget as Node | null;
        if (next instanceof Node) {
          if (anchorNode.value && anchorNode.value.contains(next)) return;
          if (contentNode.value && contentNode.value.contains(next)) return;
        }
        closeSurface();
      };
    }
    return handlers;
  }

  return {
    open,
    setOpen,
    contentId,
    anchorRelation: options.anchorRelation,
    registerAnchor,
    registerAnchorRefOnly,
    registerContent,
    getTriggerHandlers: getTriggerHandlersImpl,
    triggerProps,
  };
}
