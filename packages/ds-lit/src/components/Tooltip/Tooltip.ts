// @generated:start imports
import { LitElement, html, css, nothing, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import { ref, createRef, type Ref } from "lit/directives/ref.js";
import {
  createCompoundContext,
  provideContext,
  ContextConsumerController,
} from "../../primitives/index.js";
import { AnchoredSurfaceController } from "../../primitives/surfaces/AnchoredSurfaceController.js";
import type { SurfaceDismissalMode } from "../../primitives/surfaces/SurfaceController.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type TooltipPlacement = "top" | "bottom" | "left" | "right" | "auto";
interface TooltipSurfaceContext {
  open: () => boolean;
  setOpen: (value: boolean) => void;
  contentId: string;
  controller: AnchoredSurfaceController;
  registerContent: (node: HTMLElement | null) => void;
  buildDismissal: () => readonly SurfaceDismissalMode[];
}

const TooltipSurface_CTX = createCompoundContext<TooltipSurfaceContext>("TooltipSurface");

let _surfaceIdCounter = 0;
// @generated:end

// @generated:start root-class
export class TooltipElement extends LitElement {
  static override styles = css`:host { display: contents; }`;
  @property({ type: Boolean }) open?: boolean;
  @property({ type: Boolean }) defaultOpen?: boolean;
  @property({ attribute: false }) onOpenChange?: (open: boolean) => void;
  @property({ type: String }) placement?: TooltipPlacement;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: Boolean, attribute: "close-on-escape" }) closeOnEscape?: boolean;
  @property({ type: Boolean, attribute: "close-on-blur" }) closeOnBlur?: boolean;
  /** Uncontrolled open state. Used as the fallback when no
   *  controlled `open` prop is set. Not seeded via onOpenChange
   *  to avoid firing the consumer's callback for the initial
   *  value of `defaultOpen`. */
  @state() private _uncontrolledOpen = false;
  private _contentId: string;
  private _surfaceController: AnchoredSurfaceController;
  private _contentEl: HTMLElement | null = null;
  constructor() {
    super();
    _surfaceIdCounter += 1;
    this._contentId = `surface-${_surfaceIdCounter}`;
    this._surfaceController = new AnchoredSurfaceController(this, {
      isOpen: () => this._isOpen(),
      setOpen: (next) => this._setOpen(next),
      openTriggers: ["hover","focus"],
      // Getter form: each install() pulls the latest array so
      // toggles to closeOnEscape/closeOnBlur take effect once the
      // host calls requestRemount() in updated().
      dismissal: () => this._buildDismissal(),
      disabled: () => this.disabled === true,
    });
  }
  private _isOpen(): boolean {
    return this.open === undefined ? this._uncontrolledOpen : this.open;
  }
  private _setOpen(next: boolean): void {
    if (this.open === undefined) this._uncontrolledOpen = next;
    this.onOpenChange?.(next);
  }
  /** Recomputed each cycle so close-on-escape/blur toggles can
   *  re-mount listeners by re-calling install via setAnchor. */
  private _buildDismissal(): readonly SurfaceDismissalMode[] {
    return [
      this.closeOnEscape !== false ? "escape" as const : null,
      this.closeOnBlur !== false ? "blur" as const : null,
      "pointer-leave" as const
    ].filter((d): d is Exclude<typeof d, null> => d !== null);
  }
  override connectedCallback(): void {
    super.connectedCallback();
    // Seed uncontrolled state from defaultOpen WITHOUT firing
    // onOpenChange — the consumer didn't trigger this, the
    // initial-mount default did.
    if (this.defaultOpen !== undefined && this.open === undefined) {
      this._uncontrolledOpen = this.defaultOpen === true;
    }
    this._provideContext();
  }
  override updated(_changed: PropertyValues): void {
    this._provideContext();
    // Public + runtime-toggleable dismissal props are read by the
    // controller via the dismissal getter; force a re-install
    // when any of them changes so the new array takes effect.
    if (_changed.has("closeOnEscape") || _changed.has("closeOnBlur")) {
      this._surfaceController.requestRemount();
    }
  }
  private _provideContext(): void {
    provideContext<{
      open: () => boolean;
      setOpen: (value: boolean) => void;
      contentId: string;
      controller: AnchoredSurfaceController;
      registerContent: (node: HTMLElement | null) => void;
      buildDismissal: () => readonly SurfaceDismissalMode[];
    }>(this, TooltipSurface_CTX.key, {
      open: () => this._isOpen(),
      setOpen: (next) => this._setOpen(next),
      contentId: this._contentId,
      controller: this._surfaceController,
      registerContent: (node) => {
        this._contentEl = node;
        this._surfaceController.setContent(node);
      },
      buildDismissal: () => this._buildDismissal(),
    });
  }
  override render() {
    return html`<span class="${this._classes()}"><slot></slot></span>`;
  }
  private _classes(): string {
    return [
      "tooltip",
      this.placement ? `tooltip--${this.placement}` : null,
      this.disabled ? "tooltip--disabled" : null,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @generated:start trigger-class
export class TooltipTriggerElement extends LitElement {
  static override styles = css`:host { display: contents; }`;
  private _ctx = new ContextConsumerController<TooltipSurfaceContext>(this, TooltipSurface_CTX);
  /** The element currently registered as the surface anchor.
   *  Either an element slotted by the consumer (host-adoption
   *  path) or the built-in default <button> in our shadow root
   *  (default-host path). */
  @state() private _anchor: HTMLElement | null = null;
  /** True after the first slotchange where the consumer has
   *  provided their own host element. Controls whether we render
   *  the fallback <button> in shadow DOM. */
  @state() private _hasSlottedHost = false;
  private _defaultHostRef: Ref<HTMLButtonElement> = createRef();
  override disconnectedCallback(): void {
    if (this._anchor) {
      this._anchor.removeAttribute("aria-describedby");
      this._anchor.removeAttribute("data-tooltip-trigger");
    }
    super.disconnectedCallback();
  }
  private _onSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const assigned = slot
      .assignedElements({ flatten: true })
      .filter((n): n is HTMLElement => n instanceof HTMLElement);
    const slotted = assigned[0] ?? null;
    this._hasSlottedHost = slotted !== null;
    if (slotted) {
      this._updateAnchor(slotted);
    } else if (this._defaultHostRef.value) {
      // No slotted host — re-bind to the default <button> which
      // becomes the anchor in this fallback path.
      this._updateAnchor(this._defaultHostRef.value);
    } else {
      this._updateAnchor(null);
    }
  }
  private _updateAnchor(next: HTMLElement | null): void {
    if (next === this._anchor) {
      this._applyAriaState();
      return;
    }
    if (this._anchor) {
      this._anchor.removeAttribute("aria-describedby");
      this._anchor.removeAttribute("data-tooltip-trigger");
    }
    this._anchor = next;
    if (next) next.setAttribute("data-tooltip-trigger", "");
    this._ctx.value.controller.setAnchor(next);
    this._applyAriaState();
  }
  /** Reflect open state to ARIA on the anchor element. Re-runs
   *  every render cycle so open-state changes propagate to
   *  the consumer-rendered host without needing a re-bind. */
  private _applyAriaState(): void {
    const anchor = this._anchor;
    if (!anchor) return;
    const ctx = this._ctx.value;
    const isOpen = ctx.open();
    if (isOpen) anchor.setAttribute("aria-describedby", ctx.contentId);
    else anchor.removeAttribute("aria-describedby");
  }
  override updated(): void {
    this._applyAriaState();
    // First-render: if no slotchange has fired yet (no consumer
    // child) and our default-host button is now in the DOM, bind
    // it as the anchor.
    if (!this._hasSlottedHost && !this._anchor && this._defaultHostRef.value) {
      this._updateAnchor(this._defaultHostRef.value);
    }
  }
  override render() {
    return html`
      <slot @slotchange=${this._onSlotChange}></slot>
      ${this._hasSlottedHost
        ? nothing
        : html`<button type="button" ${ref(this._defaultHostRef)}><slot name="default-label"></slot></button>`}
    `;
  }
}
// @generated:end

// @generated:start content-class
export class TooltipContentElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  private _ctx = new ContextConsumerController<TooltipSurfaceContext>(this, TooltipSurface_CTX);
  private _registered = false;

  override disconnectedCallback(): void {
    if (this._registered) {
      this._ctxOrNull()?.registerContent(null);
      this._registered = false;
    }
    super.disconnectedCallback();
  }

  private _ctxOrNull(): TooltipSurfaceContext | null {
    try {
      return this._ctx.value;
    } catch {
      return null;
    }
  }

  override updated(): void {
    const ctx = this._ctxOrNull();
    if (!ctx) return;
    // Register the host element itself as the content node for
    // substrate purposes. The substrate uses content.contains(node)
    // for grace-path checks; if we registered the inner <div>
    // (which lives in shadow DOM), the browser would retarget
    // any cross-shadow event's relatedTarget to this host
    // anyway, so contains() would return false. Registering the
    // host directly avoids the retargeting mismatch.
    if (!this._registered) {
      this._registered = true;
      ctx.registerContent(this);
    }
    // ARIA: reflect id + role + data marker to the host element
    // so they apply to the same node the substrate registered.
    if (ctx.open()) {
      this.setAttribute("id", ctx.contentId);
      this.setAttribute("role", "tooltip");
      this.setAttribute("data-tooltip-content", "");
    } else {
      this.removeAttribute("id");
      this.removeAttribute("role");
      this.removeAttribute("data-tooltip-content");
    }
  }

  override render() {
    const ctx = this._ctxOrNull();
    if (!ctx || !ctx.open()) return nothing;
    return html`<slot></slot>`;
  }
}
// @generated:end

// @generated:start define
customElements.define("fsds-tooltip", TooltipElement);
customElements.define("fsds-tooltip-trigger", TooltipTriggerElement);
customElements.define("fsds-tooltip-content", TooltipContentElement);
// @generated:end

// @custom:start trailing

// @custom:end
