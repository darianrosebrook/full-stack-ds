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
export type PopoverPlacement = "top" | "bottom" | "left" | "right" | "auto";
interface PopoverSurfaceContext {
  open: () => boolean;
  setOpen: (value: boolean) => void;
  contentId: string;
  controller: AnchoredSurfaceController;
  registerContent: (node: HTMLElement | null) => void;
  buildDismissal: () => readonly SurfaceDismissalMode[];
}

const PopoverSurface_CTX = createCompoundContext<PopoverSurfaceContext>("PopoverSurface");

let _surfaceIdCounter = 0;
// @generated:end

// @generated:start root-class
export class PopoverElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .popover {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-gap: var(--fsds-semantic-surface-size-gap, 12px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-surface-size-min-width, 64px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-popover-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-popover-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-popover-size-gap-default: var(--fsds-core-spacing-size-04, 8px);
      --fsds-popover-color-background-content: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-popover-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-popover-elevation-default: var(--fsds-semantic-elevation-surface-popover, 0 8px 10px rgba(0,0,0,0.04), 0 20px 25px rgba(0,0,0,0.1));
      --fsds-popover-layer-content: var(--fsds-core-layer-dropdown, 1000);
    }
    
    .popover {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-popover-size-gap-default);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      padding: var(--fsds-popover-size-padding-default);
      border-radius: var(--fsds-popover-size-radius-default);
      background-color: var(--fsds-popover-color-background-content);
      border-color: var(--fsds-popover-color-border-accent);
      box-shadow: var(--fsds-popover-elevation-default);
      position: relative;
      display: inline-block;
    }
    
    .popover [data-popover-trigger] {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
    }
    
    [data-popover-content] {
      background-color: var(--fsds-popover-color-background-content);
      border-color: var(--fsds-popover-color-border-accent);
      border-radius: var(--fsds-popover-size-radius-default);
      padding: var(--fsds-popover-size-padding-default);
      gap: var(--fsds-popover-size-gap-default);
      box-shadow: var(--fsds-popover-elevation-default);
      z-index: var(--fsds-popover-layer-content);
      display: inline-block;
      border-style: solid;
      border-width: 1px;
    }
  `;
  @property({ type: Boolean }) open?: boolean;
  @property({ type: Boolean }) defaultOpen?: boolean;
  @property({ attribute: false }) onOpenChange?: (open: boolean) => void;
  @property({ type: String }) placement?: PopoverPlacement;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: Boolean, attribute: "close-on-escape" }) closeOnEscape?: boolean;
  @property({ type: Boolean, attribute: "close-on-outside-click" }) closeOnOutsideClick?: boolean;
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
      openTriggers: ["click"],
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
      this.closeOnOutsideClick !== false ? "outside-click" as const : null,
      this.closeOnBlur !== false ? "blur" as const : null
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
    if (_changed.has("closeOnEscape") || _changed.has("closeOnOutsideClick") || _changed.has("closeOnBlur")) {
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
    }>(this, PopoverSurface_CTX.key, {
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
      "popover",
      this.placement ? `popover--${this.placement}` : null,
      this.disabled ? "popover--disabled" : null,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @generated:start trigger-class
export class PopoverTriggerElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .popover {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-gap: var(--fsds-semantic-surface-size-gap, 12px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-surface-size-min-width, 64px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-popover-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-popover-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-popover-size-gap-default: var(--fsds-core-spacing-size-04, 8px);
      --fsds-popover-color-background-content: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-popover-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-popover-elevation-default: var(--fsds-semantic-elevation-surface-popover, 0 8px 10px rgba(0,0,0,0.04), 0 20px 25px rgba(0,0,0,0.1));
      --fsds-popover-layer-content: var(--fsds-core-layer-dropdown, 1000);
    }
    
    .popover {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-popover-size-gap-default);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      padding: var(--fsds-popover-size-padding-default);
      border-radius: var(--fsds-popover-size-radius-default);
      background-color: var(--fsds-popover-color-background-content);
      border-color: var(--fsds-popover-color-border-accent);
      box-shadow: var(--fsds-popover-elevation-default);
      position: relative;
      display: inline-block;
    }
    
    .popover [data-popover-trigger] {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
    }
    
    [data-popover-content] {
      background-color: var(--fsds-popover-color-background-content);
      border-color: var(--fsds-popover-color-border-accent);
      border-radius: var(--fsds-popover-size-radius-default);
      padding: var(--fsds-popover-size-padding-default);
      gap: var(--fsds-popover-size-gap-default);
      box-shadow: var(--fsds-popover-elevation-default);
      z-index: var(--fsds-popover-layer-content);
      display: inline-block;
      border-style: solid;
      border-width: 1px;
    }
  `;
  private _ctx = new ContextConsumerController<PopoverSurfaceContext>(this, PopoverSurface_CTX);
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
      this._anchor.removeAttribute("aria-controls");
      this._anchor.removeAttribute("data-popover-trigger");
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
      this._anchor.removeAttribute("aria-controls");
      this._anchor.removeAttribute("data-popover-trigger");
    }
    this._anchor = next;
    if (next) next.setAttribute("data-popover-trigger", "");
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
    anchor.setAttribute("aria-controls", ctx.contentId);
    anchor.setAttribute("aria-expanded", isOpen ? "true" : "false");
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
export class PopoverContentElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .popover {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-gap: var(--fsds-semantic-surface-size-gap, 12px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-surface-size-min-width, 64px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-popover-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-popover-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-popover-size-gap-default: var(--fsds-core-spacing-size-04, 8px);
      --fsds-popover-color-background-content: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-popover-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-popover-elevation-default: var(--fsds-semantic-elevation-surface-popover, 0 8px 10px rgba(0,0,0,0.04), 0 20px 25px rgba(0,0,0,0.1));
      --fsds-popover-layer-content: var(--fsds-core-layer-dropdown, 1000);
    }
    
    .popover {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-popover-size-gap-default);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      padding: var(--fsds-popover-size-padding-default);
      border-radius: var(--fsds-popover-size-radius-default);
      background-color: var(--fsds-popover-color-background-content);
      border-color: var(--fsds-popover-color-border-accent);
      box-shadow: var(--fsds-popover-elevation-default);
      position: relative;
      display: inline-block;
    }
    
    .popover [data-popover-trigger] {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
    }
    
    [data-popover-content] {
      background-color: var(--fsds-popover-color-background-content);
      border-color: var(--fsds-popover-color-border-accent);
      border-radius: var(--fsds-popover-size-radius-default);
      padding: var(--fsds-popover-size-padding-default);
      gap: var(--fsds-popover-size-gap-default);
      box-shadow: var(--fsds-popover-elevation-default);
      z-index: var(--fsds-popover-layer-content);
      display: inline-block;
      border-style: solid;
      border-width: 1px;
    }
  `;

  private _ctx = new ContextConsumerController<PopoverSurfaceContext>(this, PopoverSurface_CTX);
  private _registered = false;

  override disconnectedCallback(): void {
    if (this._registered) {
      this._ctxOrNull()?.registerContent(null);
      this._registered = false;
    }
    super.disconnectedCallback();
  }

  private _ctxOrNull(): PopoverSurfaceContext | null {
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
      this.setAttribute("data-popover-content", "");
    } else {
      this.removeAttribute("id");
      this.removeAttribute("data-popover-content");
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
customElements.define("fsds-popover", PopoverElement);
customElements.define("fsds-popover-trigger", PopoverTriggerElement);
customElements.define("fsds-popover-content", PopoverContentElement);
// @generated:end

// @custom:start trailing

// @custom:end
