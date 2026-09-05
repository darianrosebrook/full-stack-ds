// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { SheetBehavior } from './SheetBehavior.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SheetSide = "top" | "right" | "bottom" | "left";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class SheetElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .sheet {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-gap: var(--fsds-semantic-surface-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-surface-size-min-width, 64px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-sheet-color-overlay: var(--fsds-semantic-overlay-scrim-medium, rgba(0,0,0,0.40));
      --fsds-sheet-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-sheet-color-border: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-sheet-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-text-title: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-text-description: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-sheet-border-width: var(--fsds-semantic-shape-control-border-default-width, 1px);
      --fsds-sheet-border-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-sheet-size-width: 400px;
      --fsds-sheet-size-height: 300px;
      --fsds-sheet-size-close: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-sheet-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-sheet-text-size-title: var(--fsds-semantic-typography-heading-06, 14px);
      --fsds-sheet-text-weight-title: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-sheet-shadow: var(--fsds-semantic-elevation-surface-floating, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      --fsds-sheet-focus-width: var(--fsds-semantic-shape-control-border-focus-width, 2px);
      --fsds-sheet-focus-color: var(--fsds-semantic-color-border-accent, #d92d2e);
      --fsds-sheet-color-background-hover: var(--fsds-semantic-interaction-background-hover, #f7f7f7);
    }

    .sheet {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .sheet__overlay {
      position: absolute;
      inset: 0;
      background-color: var(--fsds-sheet-color-overlay, rgba(0,0,0,0.40));
      pointer-events: auto;
    }

    .sheet__content {
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: var(--fsds-sheet-color-background, #ffffff);
      color: var(--fsds-sheet-color-text, #141414);
      border-color: var(--fsds-sheet-color-border, #b8b8b8);
      border-style: solid;
      border-width: var(--fsds-sheet-border-width, 1px);
      box-shadow: var(--fsds-sheet-shadow, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      max-height: 100vh;
      width: var(--fsds-sheet-size-width, 400px);
      pointer-events: auto;
      box-sizing: border-box;
      overflow: hidden;
    }

    .sheet__header {
      display: flex;
      align-items: center;
      padding: var(--fsds-sheet-spacing-padding, 16px);
      border-bottom-color: var(--fsds-sheet-color-border, #b8b8b8);
      border-bottom-style: solid;
      border-bottom-width: 1px;
      gap: var(--fsds-sheet-spacing-gap, 8px);
    }

    .sheet__title {
      margin: 0;
      font-size: var(--fsds-sheet-text-size-title, 14px);
      font-weight: var(--fsds-sheet-text-weight-title, 500);
      color: var(--fsds-sheet-color-text-title, #141414);
      flex: 1 1 auto;
    }

    .sheet__description {
      margin: 0;
      color: var(--fsds-sheet-color-text-description, #474647);
      font-size: var(--fsds-sheet-text-size, 16px);
    }

    .sheet__body {
      flex: 1 1 auto;
      padding: var(--fsds-sheet-spacing-padding, 16px);
      color: var(--fsds-sheet-color-text, #141414);
      overflow-y: auto;
    }

    .sheet__footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: var(--fsds-sheet-spacing-gap, 8px);
      padding: var(--fsds-sheet-spacing-padding, 16px);
      border-top-color: var(--fsds-sheet-color-border, #b8b8b8);
      border-top-style: solid;
      border-top-width: 1px;
    }

    .sheet__close {
      position: absolute;
      top: var(--fsds-sheet-spacing-padding, 16px);
      right: var(--fsds-sheet-spacing-padding, 16px);
      width: var(--fsds-sheet-size-close, 16px);
      height: var(--fsds-sheet-size-close, 16px);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      border: 0;
      border-radius: 9999px;
      color: var(--fsds-sheet-color-text-description, #474647);
      cursor: pointer;
    }

    .sheet--right .sheet__content {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: var(--fsds-sheet-size-width, 400px);
      max-height: 100vh;
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }

    .sheet--left .sheet__content {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: var(--fsds-sheet-size-width, 400px);
      max-height: 100vh;
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }

    .sheet--top .sheet__content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      max-height: var(--fsds-sheet-size-height, 300px);
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }

    .sheet--bottom .sheet__content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      max-height: var(--fsds-sheet-size-height, 300px);
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }
  `;

  @property({ type: Boolean }) open?: boolean;
  @property({ type: Boolean }) defaultOpen?: boolean;
  @property({ attribute: false }) onOpenChange?: (open: boolean) => void;
  @property({ type: String }) side?: SheetSide = "right";
  @property({ type: Boolean }) modal?: boolean = true;
  @property({ attribute: 'aria-label', reflect: true })
  override ariaLabel: string | null = null;
  @property({ type: String }) ariaLabelledby?: string;
  @property({ type: String }) ariaDescribedby?: string;

  private behavior = new SheetBehavior(this, {
    open: () => this.open,
    defaultOpen: this.defaultOpen,
    onOpenChange: (v) => this.onOpenChange?.(v),
  });

  private _handleOverlayClick = (): void => {
    this.behavior.setOpenness(false);
  };

  private _moving = false;
  private _portaled = false;
  private _portalOriginParent: Node | null = null;
  private _portalOriginNext: Node | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "sheet");
    this.addEventListener('click', this._handleOverlayClick);
    if (!this._portaled && typeof document !== "undefined" && this.parentNode && this.parentNode !== document.body) {
      this._portalOriginParent = this.parentNode;
      this._portalOriginNext = this.nextSibling;
      this._portaled = true;
      this._moving = true;
      document.body.appendChild(this);
      this._moving = false;
    }
  }

  override disconnectedCallback(): void {
    this.removeEventListener('click', this._handleOverlayClick);
    if (!this._moving) {
      if (this._portalOriginParent && this._portalOriginParent.isConnected) {
        this._portalOriginParent.insertBefore(this, this._portalOriginNext);
      }
      this._portaled = false;
      this._portalOriginParent = null;
      this._portalOriginNext = null;
    }
    super.disconnectedCallback();
  }

  private computeClasses(): string {
    return [
      "sheet",
      (this.side ?? "right") ? `sheet--${(this.side ?? "right")}` : null,
      this.behavior.openness ? "sheet--open" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}">
  ${this.behavior.openness ? html`
  <div class=${'sheet__overlay'} aria-hidden="true" data-fsds-channel-renders="openness"></div>
  ` : nothing}
  ${this.behavior.openness ? html`
  <div class=${'sheet__content'} role="dialog" aria-modal="true" aria-label=${ifDefined(this.ariaLabel ?? undefined)} data-side=${ifDefined((this.side ?? "right"))} aria-labelledby=${ifDefined([this.querySelector('[slot="title"]') !== null && !this.ariaLabel ? 'sheet-title' : null, this.ariaLabelledby].filter(Boolean).join(' ') || undefined)} aria-describedby=${ifDefined([this.querySelector('[slot="description"]') !== null ? 'sheet-description' : null, this.ariaDescribedby].filter(Boolean).join(' ') || undefined)} data-fsds-channel-renders="openness" @click=${(e: Event) => e.stopPropagation()}>
    <div class=${'sheet__header'}>
      <h2 class=${'sheet__title'} id="sheet-title">
        <slot name="title" @slotchange=${() => this.requestUpdate()}></slot>
      </h2>
      <p class=${'sheet__description'} id="sheet-description">
        <slot name="description" @slotchange=${() => this.requestUpdate()}></slot>
      </p>
      <button class=${'sheet__close'} type="button" aria-label="Close sheet" @click=${() => this.behavior.setOpenness(!this.behavior.openness)}></button>
    </div>
    <div class=${'sheet__body'}>
      <slot></slot>
    </div>
    <div class=${'sheet__footer'}>
      <slot name="footer"></slot>
    </div>
  </div>
  ` : nothing}
</div>`;
  }
}

customElements.define('fsds-sheet', SheetElement);


export class SheetContentElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .sheet {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-gap: var(--fsds-semantic-surface-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-surface-size-min-width, 64px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-sheet-color-overlay: var(--fsds-semantic-overlay-scrim-medium, rgba(0,0,0,0.40));
      --fsds-sheet-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-sheet-color-border: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-sheet-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-text-title: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-text-description: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-sheet-border-width: var(--fsds-semantic-shape-control-border-default-width, 1px);
      --fsds-sheet-border-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-sheet-size-width: 400px;
      --fsds-sheet-size-height: 300px;
      --fsds-sheet-size-close: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-sheet-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-sheet-text-size-title: var(--fsds-semantic-typography-heading-06, 14px);
      --fsds-sheet-text-weight-title: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-sheet-shadow: var(--fsds-semantic-elevation-surface-floating, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      --fsds-sheet-focus-width: var(--fsds-semantic-shape-control-border-focus-width, 2px);
      --fsds-sheet-focus-color: var(--fsds-semantic-color-border-accent, #d92d2e);
      --fsds-sheet-color-background-hover: var(--fsds-semantic-interaction-background-hover, #f7f7f7);
    }

    .sheet {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .sheet__overlay {
      position: absolute;
      inset: 0;
      background-color: var(--fsds-sheet-color-overlay, rgba(0,0,0,0.40));
      pointer-events: auto;
    }

    .sheet__content {
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: var(--fsds-sheet-color-background, #ffffff);
      color: var(--fsds-sheet-color-text, #141414);
      border-color: var(--fsds-sheet-color-border, #b8b8b8);
      border-style: solid;
      border-width: var(--fsds-sheet-border-width, 1px);
      box-shadow: var(--fsds-sheet-shadow, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      max-height: 100vh;
      width: var(--fsds-sheet-size-width, 400px);
      pointer-events: auto;
      box-sizing: border-box;
      overflow: hidden;
    }

    .sheet__header {
      display: flex;
      align-items: center;
      padding: var(--fsds-sheet-spacing-padding, 16px);
      border-bottom-color: var(--fsds-sheet-color-border, #b8b8b8);
      border-bottom-style: solid;
      border-bottom-width: 1px;
      gap: var(--fsds-sheet-spacing-gap, 8px);
    }

    .sheet__title {
      margin: 0;
      font-size: var(--fsds-sheet-text-size-title, 14px);
      font-weight: var(--fsds-sheet-text-weight-title, 500);
      color: var(--fsds-sheet-color-text-title, #141414);
      flex: 1 1 auto;
    }

    .sheet__description {
      margin: 0;
      color: var(--fsds-sheet-color-text-description, #474647);
      font-size: var(--fsds-sheet-text-size, 16px);
    }

    .sheet__body {
      flex: 1 1 auto;
      padding: var(--fsds-sheet-spacing-padding, 16px);
      color: var(--fsds-sheet-color-text, #141414);
      overflow-y: auto;
    }

    .sheet__footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: var(--fsds-sheet-spacing-gap, 8px);
      padding: var(--fsds-sheet-spacing-padding, 16px);
      border-top-color: var(--fsds-sheet-color-border, #b8b8b8);
      border-top-style: solid;
      border-top-width: 1px;
    }

    .sheet__close {
      position: absolute;
      top: var(--fsds-sheet-spacing-padding, 16px);
      right: var(--fsds-sheet-spacing-padding, 16px);
      width: var(--fsds-sheet-size-close, 16px);
      height: var(--fsds-sheet-size-close, 16px);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      border: 0;
      border-radius: 9999px;
      color: var(--fsds-sheet-color-text-description, #474647);
      cursor: pointer;
    }

    .sheet--right .sheet__content {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: var(--fsds-sheet-size-width, 400px);
      max-height: 100vh;
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }

    .sheet--left .sheet__content {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: var(--fsds-sheet-size-width, 400px);
      max-height: 100vh;
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }

    .sheet--top .sheet__content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      max-height: var(--fsds-sheet-size-height, 300px);
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }

    .sheet--bottom .sheet__content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      max-height: var(--fsds-sheet-size-height, 300px);
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }
  `;

  override render() {
    return html`<fsds-stack class="sheet__content"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-sheet-content', SheetContentElement);

export class SheetHeaderElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .sheet {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-gap: var(--fsds-semantic-surface-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-surface-size-min-width, 64px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-sheet-color-overlay: var(--fsds-semantic-overlay-scrim-medium, rgba(0,0,0,0.40));
      --fsds-sheet-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-sheet-color-border: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-sheet-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-text-title: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-text-description: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-sheet-border-width: var(--fsds-semantic-shape-control-border-default-width, 1px);
      --fsds-sheet-border-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-sheet-size-width: 400px;
      --fsds-sheet-size-height: 300px;
      --fsds-sheet-size-close: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-sheet-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-sheet-text-size-title: var(--fsds-semantic-typography-heading-06, 14px);
      --fsds-sheet-text-weight-title: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-sheet-shadow: var(--fsds-semantic-elevation-surface-floating, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      --fsds-sheet-focus-width: var(--fsds-semantic-shape-control-border-focus-width, 2px);
      --fsds-sheet-focus-color: var(--fsds-semantic-color-border-accent, #d92d2e);
      --fsds-sheet-color-background-hover: var(--fsds-semantic-interaction-background-hover, #f7f7f7);
    }

    .sheet {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .sheet__overlay {
      position: absolute;
      inset: 0;
      background-color: var(--fsds-sheet-color-overlay, rgba(0,0,0,0.40));
      pointer-events: auto;
    }

    .sheet__content {
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: var(--fsds-sheet-color-background, #ffffff);
      color: var(--fsds-sheet-color-text, #141414);
      border-color: var(--fsds-sheet-color-border, #b8b8b8);
      border-style: solid;
      border-width: var(--fsds-sheet-border-width, 1px);
      box-shadow: var(--fsds-sheet-shadow, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      max-height: 100vh;
      width: var(--fsds-sheet-size-width, 400px);
      pointer-events: auto;
      box-sizing: border-box;
      overflow: hidden;
    }

    .sheet__header {
      display: flex;
      align-items: center;
      padding: var(--fsds-sheet-spacing-padding, 16px);
      border-bottom-color: var(--fsds-sheet-color-border, #b8b8b8);
      border-bottom-style: solid;
      border-bottom-width: 1px;
      gap: var(--fsds-sheet-spacing-gap, 8px);
    }

    .sheet__title {
      margin: 0;
      font-size: var(--fsds-sheet-text-size-title, 14px);
      font-weight: var(--fsds-sheet-text-weight-title, 500);
      color: var(--fsds-sheet-color-text-title, #141414);
      flex: 1 1 auto;
    }

    .sheet__description {
      margin: 0;
      color: var(--fsds-sheet-color-text-description, #474647);
      font-size: var(--fsds-sheet-text-size, 16px);
    }

    .sheet__body {
      flex: 1 1 auto;
      padding: var(--fsds-sheet-spacing-padding, 16px);
      color: var(--fsds-sheet-color-text, #141414);
      overflow-y: auto;
    }

    .sheet__footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: var(--fsds-sheet-spacing-gap, 8px);
      padding: var(--fsds-sheet-spacing-padding, 16px);
      border-top-color: var(--fsds-sheet-color-border, #b8b8b8);
      border-top-style: solid;
      border-top-width: 1px;
    }

    .sheet__close {
      position: absolute;
      top: var(--fsds-sheet-spacing-padding, 16px);
      right: var(--fsds-sheet-spacing-padding, 16px);
      width: var(--fsds-sheet-size-close, 16px);
      height: var(--fsds-sheet-size-close, 16px);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      border: 0;
      border-radius: 9999px;
      color: var(--fsds-sheet-color-text-description, #474647);
      cursor: pointer;
    }

    .sheet--right .sheet__content {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: var(--fsds-sheet-size-width, 400px);
      max-height: 100vh;
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }

    .sheet--left .sheet__content {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: var(--fsds-sheet-size-width, 400px);
      max-height: 100vh;
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }

    .sheet--top .sheet__content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      max-height: var(--fsds-sheet-size-height, 300px);
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }

    .sheet--bottom .sheet__content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      max-height: var(--fsds-sheet-size-height, 300px);
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }
  `;

  override render() {
    return html`<fsds-stack as="header" class="sheet__header"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-sheet-header', SheetHeaderElement);

export class SheetTitleElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .sheet {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-gap: var(--fsds-semantic-surface-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-surface-size-min-width, 64px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-sheet-color-overlay: var(--fsds-semantic-overlay-scrim-medium, rgba(0,0,0,0.40));
      --fsds-sheet-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-sheet-color-border: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-sheet-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-text-title: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-text-description: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-sheet-border-width: var(--fsds-semantic-shape-control-border-default-width, 1px);
      --fsds-sheet-border-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-sheet-size-width: 400px;
      --fsds-sheet-size-height: 300px;
      --fsds-sheet-size-close: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-sheet-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-sheet-text-size-title: var(--fsds-semantic-typography-heading-06, 14px);
      --fsds-sheet-text-weight-title: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-sheet-shadow: var(--fsds-semantic-elevation-surface-floating, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      --fsds-sheet-focus-width: var(--fsds-semantic-shape-control-border-focus-width, 2px);
      --fsds-sheet-focus-color: var(--fsds-semantic-color-border-accent, #d92d2e);
      --fsds-sheet-color-background-hover: var(--fsds-semantic-interaction-background-hover, #f7f7f7);
    }

    .sheet {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .sheet__overlay {
      position: absolute;
      inset: 0;
      background-color: var(--fsds-sheet-color-overlay, rgba(0,0,0,0.40));
      pointer-events: auto;
    }

    .sheet__content {
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: var(--fsds-sheet-color-background, #ffffff);
      color: var(--fsds-sheet-color-text, #141414);
      border-color: var(--fsds-sheet-color-border, #b8b8b8);
      border-style: solid;
      border-width: var(--fsds-sheet-border-width, 1px);
      box-shadow: var(--fsds-sheet-shadow, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      max-height: 100vh;
      width: var(--fsds-sheet-size-width, 400px);
      pointer-events: auto;
      box-sizing: border-box;
      overflow: hidden;
    }

    .sheet__header {
      display: flex;
      align-items: center;
      padding: var(--fsds-sheet-spacing-padding, 16px);
      border-bottom-color: var(--fsds-sheet-color-border, #b8b8b8);
      border-bottom-style: solid;
      border-bottom-width: 1px;
      gap: var(--fsds-sheet-spacing-gap, 8px);
    }

    .sheet__title {
      margin: 0;
      font-size: var(--fsds-sheet-text-size-title, 14px);
      font-weight: var(--fsds-sheet-text-weight-title, 500);
      color: var(--fsds-sheet-color-text-title, #141414);
      flex: 1 1 auto;
    }

    .sheet__description {
      margin: 0;
      color: var(--fsds-sheet-color-text-description, #474647);
      font-size: var(--fsds-sheet-text-size, 16px);
    }

    .sheet__body {
      flex: 1 1 auto;
      padding: var(--fsds-sheet-spacing-padding, 16px);
      color: var(--fsds-sheet-color-text, #141414);
      overflow-y: auto;
    }

    .sheet__footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: var(--fsds-sheet-spacing-gap, 8px);
      padding: var(--fsds-sheet-spacing-padding, 16px);
      border-top-color: var(--fsds-sheet-color-border, #b8b8b8);
      border-top-style: solid;
      border-top-width: 1px;
    }

    .sheet__close {
      position: absolute;
      top: var(--fsds-sheet-spacing-padding, 16px);
      right: var(--fsds-sheet-spacing-padding, 16px);
      width: var(--fsds-sheet-size-close, 16px);
      height: var(--fsds-sheet-size-close, 16px);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      border: 0;
      border-radius: 9999px;
      color: var(--fsds-sheet-color-text-description, #474647);
      cursor: pointer;
    }

    .sheet--right .sheet__content {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: var(--fsds-sheet-size-width, 400px);
      max-height: 100vh;
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }

    .sheet--left .sheet__content {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: var(--fsds-sheet-size-width, 400px);
      max-height: 100vh;
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }

    .sheet--top .sheet__content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      max-height: var(--fsds-sheet-size-height, 300px);
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }

    .sheet--bottom .sheet__content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      max-height: var(--fsds-sheet-size-height, 300px);
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }
  `;

  override render() {
    return html`<fsds-stack as="h3" class="sheet__title"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-sheet-title', SheetTitleElement);

export class SheetDescriptionElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .sheet {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-gap: var(--fsds-semantic-surface-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-surface-size-min-width, 64px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-sheet-color-overlay: var(--fsds-semantic-overlay-scrim-medium, rgba(0,0,0,0.40));
      --fsds-sheet-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-sheet-color-border: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-sheet-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-text-title: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-text-description: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-sheet-border-width: var(--fsds-semantic-shape-control-border-default-width, 1px);
      --fsds-sheet-border-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-sheet-size-width: 400px;
      --fsds-sheet-size-height: 300px;
      --fsds-sheet-size-close: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-sheet-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-sheet-text-size-title: var(--fsds-semantic-typography-heading-06, 14px);
      --fsds-sheet-text-weight-title: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-sheet-shadow: var(--fsds-semantic-elevation-surface-floating, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      --fsds-sheet-focus-width: var(--fsds-semantic-shape-control-border-focus-width, 2px);
      --fsds-sheet-focus-color: var(--fsds-semantic-color-border-accent, #d92d2e);
      --fsds-sheet-color-background-hover: var(--fsds-semantic-interaction-background-hover, #f7f7f7);
    }

    .sheet {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .sheet__overlay {
      position: absolute;
      inset: 0;
      background-color: var(--fsds-sheet-color-overlay, rgba(0,0,0,0.40));
      pointer-events: auto;
    }

    .sheet__content {
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: var(--fsds-sheet-color-background, #ffffff);
      color: var(--fsds-sheet-color-text, #141414);
      border-color: var(--fsds-sheet-color-border, #b8b8b8);
      border-style: solid;
      border-width: var(--fsds-sheet-border-width, 1px);
      box-shadow: var(--fsds-sheet-shadow, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      max-height: 100vh;
      width: var(--fsds-sheet-size-width, 400px);
      pointer-events: auto;
      box-sizing: border-box;
      overflow: hidden;
    }

    .sheet__header {
      display: flex;
      align-items: center;
      padding: var(--fsds-sheet-spacing-padding, 16px);
      border-bottom-color: var(--fsds-sheet-color-border, #b8b8b8);
      border-bottom-style: solid;
      border-bottom-width: 1px;
      gap: var(--fsds-sheet-spacing-gap, 8px);
    }

    .sheet__title {
      margin: 0;
      font-size: var(--fsds-sheet-text-size-title, 14px);
      font-weight: var(--fsds-sheet-text-weight-title, 500);
      color: var(--fsds-sheet-color-text-title, #141414);
      flex: 1 1 auto;
    }

    .sheet__description {
      margin: 0;
      color: var(--fsds-sheet-color-text-description, #474647);
      font-size: var(--fsds-sheet-text-size, 16px);
    }

    .sheet__body {
      flex: 1 1 auto;
      padding: var(--fsds-sheet-spacing-padding, 16px);
      color: var(--fsds-sheet-color-text, #141414);
      overflow-y: auto;
    }

    .sheet__footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: var(--fsds-sheet-spacing-gap, 8px);
      padding: var(--fsds-sheet-spacing-padding, 16px);
      border-top-color: var(--fsds-sheet-color-border, #b8b8b8);
      border-top-style: solid;
      border-top-width: 1px;
    }

    .sheet__close {
      position: absolute;
      top: var(--fsds-sheet-spacing-padding, 16px);
      right: var(--fsds-sheet-spacing-padding, 16px);
      width: var(--fsds-sheet-size-close, 16px);
      height: var(--fsds-sheet-size-close, 16px);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      border: 0;
      border-radius: 9999px;
      color: var(--fsds-sheet-color-text-description, #474647);
      cursor: pointer;
    }

    .sheet--right .sheet__content {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: var(--fsds-sheet-size-width, 400px);
      max-height: 100vh;
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }

    .sheet--left .sheet__content {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: var(--fsds-sheet-size-width, 400px);
      max-height: 100vh;
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }

    .sheet--top .sheet__content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      max-height: var(--fsds-sheet-size-height, 300px);
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }

    .sheet--bottom .sheet__content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      max-height: var(--fsds-sheet-size-height, 300px);
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }
  `;

  override render() {
    return html`<fsds-stack as="p" class="sheet__description"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-sheet-description', SheetDescriptionElement);

export class SheetBodyElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .sheet {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-gap: var(--fsds-semantic-surface-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-surface-size-min-width, 64px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-sheet-color-overlay: var(--fsds-semantic-overlay-scrim-medium, rgba(0,0,0,0.40));
      --fsds-sheet-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-sheet-color-border: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-sheet-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-text-title: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-text-description: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-sheet-border-width: var(--fsds-semantic-shape-control-border-default-width, 1px);
      --fsds-sheet-border-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-sheet-size-width: 400px;
      --fsds-sheet-size-height: 300px;
      --fsds-sheet-size-close: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-sheet-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-sheet-text-size-title: var(--fsds-semantic-typography-heading-06, 14px);
      --fsds-sheet-text-weight-title: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-sheet-shadow: var(--fsds-semantic-elevation-surface-floating, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      --fsds-sheet-focus-width: var(--fsds-semantic-shape-control-border-focus-width, 2px);
      --fsds-sheet-focus-color: var(--fsds-semantic-color-border-accent, #d92d2e);
      --fsds-sheet-color-background-hover: var(--fsds-semantic-interaction-background-hover, #f7f7f7);
    }

    .sheet {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .sheet__overlay {
      position: absolute;
      inset: 0;
      background-color: var(--fsds-sheet-color-overlay, rgba(0,0,0,0.40));
      pointer-events: auto;
    }

    .sheet__content {
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: var(--fsds-sheet-color-background, #ffffff);
      color: var(--fsds-sheet-color-text, #141414);
      border-color: var(--fsds-sheet-color-border, #b8b8b8);
      border-style: solid;
      border-width: var(--fsds-sheet-border-width, 1px);
      box-shadow: var(--fsds-sheet-shadow, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      max-height: 100vh;
      width: var(--fsds-sheet-size-width, 400px);
      pointer-events: auto;
      box-sizing: border-box;
      overflow: hidden;
    }

    .sheet__header {
      display: flex;
      align-items: center;
      padding: var(--fsds-sheet-spacing-padding, 16px);
      border-bottom-color: var(--fsds-sheet-color-border, #b8b8b8);
      border-bottom-style: solid;
      border-bottom-width: 1px;
      gap: var(--fsds-sheet-spacing-gap, 8px);
    }

    .sheet__title {
      margin: 0;
      font-size: var(--fsds-sheet-text-size-title, 14px);
      font-weight: var(--fsds-sheet-text-weight-title, 500);
      color: var(--fsds-sheet-color-text-title, #141414);
      flex: 1 1 auto;
    }

    .sheet__description {
      margin: 0;
      color: var(--fsds-sheet-color-text-description, #474647);
      font-size: var(--fsds-sheet-text-size, 16px);
    }

    .sheet__body {
      flex: 1 1 auto;
      padding: var(--fsds-sheet-spacing-padding, 16px);
      color: var(--fsds-sheet-color-text, #141414);
      overflow-y: auto;
    }

    .sheet__footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: var(--fsds-sheet-spacing-gap, 8px);
      padding: var(--fsds-sheet-spacing-padding, 16px);
      border-top-color: var(--fsds-sheet-color-border, #b8b8b8);
      border-top-style: solid;
      border-top-width: 1px;
    }

    .sheet__close {
      position: absolute;
      top: var(--fsds-sheet-spacing-padding, 16px);
      right: var(--fsds-sheet-spacing-padding, 16px);
      width: var(--fsds-sheet-size-close, 16px);
      height: var(--fsds-sheet-size-close, 16px);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      border: 0;
      border-radius: 9999px;
      color: var(--fsds-sheet-color-text-description, #474647);
      cursor: pointer;
    }

    .sheet--right .sheet__content {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: var(--fsds-sheet-size-width, 400px);
      max-height: 100vh;
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }

    .sheet--left .sheet__content {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: var(--fsds-sheet-size-width, 400px);
      max-height: 100vh;
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }

    .sheet--top .sheet__content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      max-height: var(--fsds-sheet-size-height, 300px);
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }

    .sheet--bottom .sheet__content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      max-height: var(--fsds-sheet-size-height, 300px);
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }
  `;

  override render() {
    return html`<fsds-stack class="sheet__body"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-sheet-body', SheetBodyElement);

export class SheetFooterElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .sheet {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-gap: var(--fsds-semantic-surface-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-surface-size-min-width, 64px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-sheet-color-overlay: var(--fsds-semantic-overlay-scrim-medium, rgba(0,0,0,0.40));
      --fsds-sheet-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-sheet-color-border: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-sheet-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-text-title: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-text-description: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-sheet-border-width: var(--fsds-semantic-shape-control-border-default-width, 1px);
      --fsds-sheet-border-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-sheet-size-width: 400px;
      --fsds-sheet-size-height: 300px;
      --fsds-sheet-size-close: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-sheet-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-sheet-text-size-title: var(--fsds-semantic-typography-heading-06, 14px);
      --fsds-sheet-text-weight-title: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-sheet-shadow: var(--fsds-semantic-elevation-surface-floating, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      --fsds-sheet-focus-width: var(--fsds-semantic-shape-control-border-focus-width, 2px);
      --fsds-sheet-focus-color: var(--fsds-semantic-color-border-accent, #d92d2e);
      --fsds-sheet-color-background-hover: var(--fsds-semantic-interaction-background-hover, #f7f7f7);
    }

    .sheet {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .sheet__overlay {
      position: absolute;
      inset: 0;
      background-color: var(--fsds-sheet-color-overlay, rgba(0,0,0,0.40));
      pointer-events: auto;
    }

    .sheet__content {
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: var(--fsds-sheet-color-background, #ffffff);
      color: var(--fsds-sheet-color-text, #141414);
      border-color: var(--fsds-sheet-color-border, #b8b8b8);
      border-style: solid;
      border-width: var(--fsds-sheet-border-width, 1px);
      box-shadow: var(--fsds-sheet-shadow, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      max-height: 100vh;
      width: var(--fsds-sheet-size-width, 400px);
      pointer-events: auto;
      box-sizing: border-box;
      overflow: hidden;
    }

    .sheet__header {
      display: flex;
      align-items: center;
      padding: var(--fsds-sheet-spacing-padding, 16px);
      border-bottom-color: var(--fsds-sheet-color-border, #b8b8b8);
      border-bottom-style: solid;
      border-bottom-width: 1px;
      gap: var(--fsds-sheet-spacing-gap, 8px);
    }

    .sheet__title {
      margin: 0;
      font-size: var(--fsds-sheet-text-size-title, 14px);
      font-weight: var(--fsds-sheet-text-weight-title, 500);
      color: var(--fsds-sheet-color-text-title, #141414);
      flex: 1 1 auto;
    }

    .sheet__description {
      margin: 0;
      color: var(--fsds-sheet-color-text-description, #474647);
      font-size: var(--fsds-sheet-text-size, 16px);
    }

    .sheet__body {
      flex: 1 1 auto;
      padding: var(--fsds-sheet-spacing-padding, 16px);
      color: var(--fsds-sheet-color-text, #141414);
      overflow-y: auto;
    }

    .sheet__footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: var(--fsds-sheet-spacing-gap, 8px);
      padding: var(--fsds-sheet-spacing-padding, 16px);
      border-top-color: var(--fsds-sheet-color-border, #b8b8b8);
      border-top-style: solid;
      border-top-width: 1px;
    }

    .sheet__close {
      position: absolute;
      top: var(--fsds-sheet-spacing-padding, 16px);
      right: var(--fsds-sheet-spacing-padding, 16px);
      width: var(--fsds-sheet-size-close, 16px);
      height: var(--fsds-sheet-size-close, 16px);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      border: 0;
      border-radius: 9999px;
      color: var(--fsds-sheet-color-text-description, #474647);
      cursor: pointer;
    }

    .sheet--right .sheet__content {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: var(--fsds-sheet-size-width, 400px);
      max-height: 100vh;
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }

    .sheet--left .sheet__content {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: var(--fsds-sheet-size-width, 400px);
      max-height: 100vh;
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }

    .sheet--top .sheet__content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      max-height: var(--fsds-sheet-size-height, 300px);
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }

    .sheet--bottom .sheet__content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      max-height: var(--fsds-sheet-size-height, 300px);
      border-radius: var(--fsds-sheet-border-radius, 6px);
    }
  `;

  override render() {
    return html`<fsds-stack as="footer" variant="horizontal" class="sheet__footer"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-sheet-footer', SheetFooterElement);
// @generated:end

// @custom:start trailing

// @custom:end