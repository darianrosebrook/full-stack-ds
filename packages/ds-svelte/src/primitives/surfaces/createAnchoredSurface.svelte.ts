import { getContext, onDestroy, setContext } from "svelte";
import type { Action } from "svelte/action";
import {
  AnchoredSurfaceController,
  type AnchoredSurfaceControllerOptions,
} from "./AnchoredSurfaceController";
import type {
  SurfaceAnchorRelation,
  SurfaceDismissalMode,
  SurfaceOpenTrigger,
} from "./SurfaceController";

/**
 * Per-kind data marker placed on the trigger element so consumers can
 * select for "any tooltip trigger" / "any popover trigger" in CSS or
 * test harnesses. Always shaped `data-<kind>-trigger` so the surface
 * IR's cssPrefix is the single source of truth for the identifier.
 * The template-literal type forces callers to construct the marker
 * from a literal prefix instead of an arbitrary string.
 */
export type SurfaceDataMarker = `data-${string}-trigger`;

export interface CreateAnchoredSurfaceOptions {
  /** Getter returning the current controlled open value, or undefined
   *  when uncontrolled. Svelte convention: callers pass `() => props.open`
   *  so reactivity flows naturally without piping refs around. */
  open: () => boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openTriggers: () => readonly SurfaceOpenTrigger[];
  dismissal: () => readonly SurfaceDismissalMode[];
  anchorRelation: SurfaceAnchorRelation;
  disabled?: () => boolean;
  /** Optional override for the content id. Defaults to a unique id. */
  idBase?: string;
  /** Per-kind data marker emitted on the trigger element. Derived
   *  from the surface IR's cssPrefix at codegen time (e.g.
   *  `data-tooltip-trigger`, `data-popover-trigger`). */
  dataMarker: SurfaceDataMarker;
}

export interface SurfaceTriggerHandlers {
  onpointerenter?: (event: PointerEvent) => void;
  onpointerleave?: (event: PointerEvent) => void;
  onfocus?: (event: FocusEvent) => void;
  /** Boundary-focusout listener used in handler/adoption mode. Fires
   *  on `focusout` (which bubbles), so a single listener on the anchor
   *  catches focus leaving any descendant; the substrate's
   *  `isInsideSurface` predicate then decides whether to dismiss. */
  onfocusout?: (event: FocusEvent) => void;
  onclick?: (event: MouseEvent) => void;
}

/**
 * ARIA + data + handler subset of the host-adoption binding. Spread
 * onto the consumer's element via `{...attrs}`. Always paired with
 * `action` (see `SurfaceTriggerBinding`) — applying only `attrs` is
 * a contract violation because the substrate will never be told which
 * element became the anchor.
 *
 * The `data-<kind>-trigger` key is per-surface (see `SurfaceDataMarker`)
 * and is rendered via an index signature so different surface kinds
 * can share this shape without one kind's marker leaking into another.
 */
export interface SurfaceTriggerAttrs extends SurfaceTriggerHandlers {
  [dataMarker: SurfaceDataMarker]: "";
  "aria-describedby"?: string;
  "aria-controls"?: string;
  "aria-expanded"?: boolean;
  "aria-labelledby"?: string;
}

/**
 * Host-adoption props for the snippet-based adoption path. Svelte's
 * renderer cannot carry a node-registration callback inside a spread,
 * so the contract is **logically atomic but physically split**:
 *
 *   - `action` is a Svelte action applied via `use:trigger.action`
 *     that owns anchor registration (DOM node capture, ARIA/
 *     grace-path queries).
 *   - `attrs` is a plain object of ARIA, data marker, and Svelte
 *     event handlers spread via `{...trigger.attrs}`.
 *
 * Consumer pattern (snippet prop is named `child`; snippet parameter
 * is the whole `trigger` object so the split is explicit):
 *
 *   <TooltipTrigger>
 *     {#snippet child(trigger)}
 *       <a href="#help" use:trigger.action {...trigger.attrs}>
 *         Save
 *       </a>
 *     {/snippet}
 *   </TooltipTrigger>
 *
 * Applying one without the other will silently break the substrate —
 * this is the same atomicity contract as React's `asChild` and Vue's
 * `triggerProps`, expressed through Svelte's two native channels
 * (`use:` and spread) instead of a single atomic object.
 */
export interface SurfaceTriggerProps {
  action: Action<HTMLElement>;
  attrs: SurfaceTriggerAttrs;
}

export interface CreateAnchoredSurfaceResult {
  /** Reactive snapshot of the current open value (getter). Callers
   *  read this in `$derived(surface.open())` or directly in template. */
  open: () => boolean;
  setOpen: (next: boolean) => void;
  contentId: string;
  anchorRelation: SurfaceAnchorRelation;
  /** Default-host path: pass the element to this when bound via
   *  bind:this in the rendered template, e.g.
   *    $effect(() => surface.registerAnchor(triggerEl));
   *  Installs DOM listeners on the anchor. */
  registerAnchor: (node: HTMLElement | null) => void;
  /** Host-adoption path: registers the anchor for ARIA/grace-path
   *  queries but skips DOM listener install. Used when the consumer
   *  composes `triggerProps` onto their own element via {...props}. */
  registerAnchorRefOnly: (node: HTMLElement | null) => void;
  registerContent: (node: HTMLElement | null) => void;
  /** Reactive getter for the current anchor node (or null). Positioning-
   *  aware consumers (createAnchoredPosition) read this to track anchor
   *  identity changes. */
  anchorEl: () => HTMLElement | null;
  /** Reactive getter for the current content node (or null). */
  contentEl: () => HTMLElement | null;
  /** Returns Svelte-shaped handlers gated by openTriggers/dismissal.
   *  Used by the snippet adoption path. */
  getTriggerHandlers: () => SurfaceTriggerHandlers;
  /** Returns the host-adoption props (`action` + `attrs`). The
   *  generated `<Surface>Trigger` passes this single object into its
   *  `child` snippet so consumers can apply `use:trigger.action`
   *  and `{...trigger.attrs}` explicitly. See `SurfaceTriggerProps`
   *  doc for the atomicity contract. */
  getTriggerProps: () => SurfaceTriggerProps;
}

let surfaceIdCounter = 0;

/**
 * Internal substrate for anchored surfaces. The generated
 * `use<Surface>.svelte.ts` (e.g. `useTooltip`, `usePopover`) calls
 * this from inside `<script>` so the Svelte component lifecycle owns
 * teardown.
 */
export function createAnchoredSurface(
  options: CreateAnchoredSurfaceOptions,
): CreateAnchoredSurfaceResult {
  surfaceIdCounter += 1;
  const contentId = options.idBase ?? `surface-${surfaceIdCounter}`;

  let uncontrolledOpen = $state<boolean>(options.defaultOpen === true);
  const open = (): boolean => {
    const controlled = options.open();
    return controlled === undefined ? uncontrolledOpen : controlled;
  };

  const setOpen = (next: boolean): void => {
    if (options.open() === undefined) {
      uncontrolledOpen = next;
    }
    options.onOpenChange?.(next);
  };

  // Mode latches at first ref-callback installation. Same rule as
  // React/Vue: a surface instance picks default-host or handler-mode
  // and sticks with it for its lifetime.
  let handlerMode: boolean | null = null;
  let controller: AnchoredSurfaceController | null = null;
  let teardown = false;
  // $state so positioning-aware consumers (createAnchoredPosition) can
  // track node identity reactively via the exposed getters below —
  // mirrors React's useState-backed anchorEl/contentEl context values.
  let anchorNode: HTMLElement | null = $state(null);
  let contentNode: HTMLElement | null = $state(null);

  function buildController(modeHandler: boolean): AnchoredSurfaceController {
    const controllerOptions: AnchoredSurfaceControllerOptions = {
      isOpen: open,
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
    controller.setAnchor(anchorNode);
    controller.setContent(contentNode);
    controller.mount();
  }

  function registerAnchor(node: HTMLElement | null): void {
    if (teardown) return;
    ensureController(false);
    anchorNode = node;
    remount();
  }

  function registerAnchorRefOnly(node: HTMLElement | null): void {
    if (teardown) return;
    ensureController(true);
    anchorNode = node;
    remount();
  }

  function registerContent(node: HTMLElement | null): void {
    if (teardown) return;
    contentNode = node;
    remount();
  }

  function isInsideSurface(node: EventTarget | null): boolean {
    if (!(node instanceof Node)) return false;
    return Boolean(
      (anchorNode && anchorNode.contains(node)) ||
        (contentNode && contentNode.contains(node)),
    );
  }

  function getTriggerHandlers(): SurfaceTriggerHandlers {
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
      handlers.onpointerenter = () => openSurface();
    }
    if (triggers.includes("focus")) {
      handlers.onfocus = () => openSurface();
    }
    if (triggers.includes("click")) {
      handlers.onclick = () => {
        if (isDisabled()) return;
        setOpen(!open());
      };
    }
    if (dismissal.includes("pointer-leave")) {
      handlers.onpointerleave = (event) => {
        const next = event.relatedTarget as Node | null;
        if (next && contentNode && contentNode.contains(next)) return;
        closeSurface();
      };
    }
    if (dismissal.includes("blur")) {
      // Boundary semantics: focus leaving the anchor ∪ content surface
      // dismisses. `focusout` bubbles, so a single listener on the
      // adopted trigger catches focus leaving any descendant. Focus
      // moving from anchor INTO content (or staying within content)
      // is treated as staying inside the surface.
      handlers.onfocusout = (event) => {
        if (!open()) return;
        if (isInsideSurface(event.relatedTarget)) return;
        closeSurface();
      };
    }
    return handlers;
  }

  /**
   * Svelte action used by the consumer via `use:action`. Capturing the
   * node here lets the substrate run in handlerMode (anchor-side DOM
   * listeners are skipped; `attrs` carries the Svelte handlers
   * instead). `update`/`destroy` mirror the substrate's existing
   * register/unregister contract so swapping the host element at
   * runtime works.
   */
  const triggerAction: Action<HTMLElement> = (node) => {
    registerAnchorRefOnly(node);
    return {
      destroy() {
        // Pass null so the substrate sees the anchor leave; teardown
        // flag guards against any subsequent late-null callbacks.
        registerAnchorRefOnly(null);
      },
    };
  };

  function getTriggerProps(): SurfaceTriggerProps {
    const relation = options.anchorRelation;
    const isOpen = open();
    const handlers = getTriggerHandlers();
    const ariaProps: Partial<SurfaceTriggerAttrs> = {};
    if (relation === "describedby" && isOpen) {
      ariaProps["aria-describedby"] = contentId;
    } else if (relation === "controls-expanded") {
      ariaProps["aria-controls"] = contentId;
      ariaProps["aria-expanded"] = isOpen;
    } else if (relation === "labelledby" && isOpen) {
      ariaProps["aria-labelledby"] = contentId;
    }
    const attrs: SurfaceTriggerAttrs = {
      [options.dataMarker]: "",
      ...ariaProps,
      ...handlers,
    };
    return { action: triggerAction, attrs };
  }

  onDestroy(() => {
    teardown = true;
    controller?.unmount();
    controller = null;
  });

  return {
    open,
    setOpen,
    contentId,
    anchorRelation: options.anchorRelation,
    registerAnchor,
    registerAnchorRefOnly,
    registerContent,
    anchorEl: () => anchorNode,
    contentEl: () => contentNode,
    getTriggerHandlers,
    getTriggerProps,
  };
}

// Context bridge: generated use<Surface>.svelte.ts (useTooltip,
// usePopover, ...) calls these helpers to set + retrieve the
// surface object for compound components. Kept here so all three
// frameworks have the same factory shape.
const SURFACE_CONTEXT_PREFIX = "fsds-surface:";

export function provideSurfaceContext(
  name: string,
  value: CreateAnchoredSurfaceResult,
): void {
  setContext(`${SURFACE_CONTEXT_PREFIX}${name}`, value);
}

export function useSurfaceContext(name: string): CreateAnchoredSurfaceResult {
  const ctx = getContext<CreateAnchoredSurfaceResult | undefined>(
    `${SURFACE_CONTEXT_PREFIX}${name}`,
  );
  if (!ctx) {
    throw new Error(
      `${name} compound component used outside of <${name}> provider.`,
    );
  }
  return ctx;
}
