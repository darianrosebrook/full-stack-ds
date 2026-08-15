// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ToastBehavior } from './ToastBehavior.js';
import { AutoDismissController } from '../../primitives/index.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ToastVariant = "info" | "success" | "warning" | "error";
export type ToastPoliteness = "polite" | "assertive";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class ToastElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .toast {
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
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-toast-surface-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-toast-surface-shadow: var(--fsds-semantic-elevation-surface-overlay, 0px 4px 6px #0000000d, 0px 10px 15px #0000001a);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-toast-accent-default: var(--fsds-semantic-color-status-info, #0566fe);
      --fsds-toast-color-intent-bg: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-toast-color-intent-border: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-toast-spacing-padding: var(--fsds-core-spacing-size-05, 12px);
      --fsds-toast-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-spacing-stack-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-size-max-width: 400px;
      --fsds-toast-motion-enter: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toast-motion-leave: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toast-timing-auto-dismiss: var(--fsds-semantic-motion-dwell-notification, 6000ms);
    }

    .toast--info {
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-info-subtle, #95dafb);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-on-info-subtle, #013ab0);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-info, #034fd6);
    }

    .toast--success {
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-success-subtle, #b3dba7);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-on-success-subtle, #2c4f09);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-success, #3a6614);
    }

    .toast--warning {
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-warning-subtle, #fdc67f);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-on-warning-subtle, #6c3a00);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-warning, #8b4b00);
    }

    .toast--error {
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-danger-subtle, #fac2c2);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-on-danger-subtle, #900909);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-danger, #b31b1b);
    }

    .toast {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-toast-spacing-stack-gap, 8px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      position: fixed;
      bottom: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      z-index: 1000;
      pointer-events: none;
    }

    .toast__item {
      background-color: var(--fsds-toast-surface-bg, #d0d0d0);
      border-color: var(--fsds-toast-surface-border, #d0d0d0);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-toast-surface-radius, 6px);
      box-shadow: var(--fsds-toast-surface-shadow, 0px 4px 6px #0000000d, 0px 10px 15px #0000001a);
      padding: var(--fsds-toast-spacing-padding, 12px);
      max-width: var(--fsds-toast-size-max-width, 400px);
      display: flex;
      flex-direction: column;
      position: relative;
      pointer-events: auto;
      box-sizing: border-box;
    }

    .toast__row {
      display: flex;
      align-items: flex-start;
      gap: var(--fsds-toast-spacing-gap, 8px);
      flex: 1 1 auto;
    }

    .toast__title {
      margin: 0;
      font-weight: 600;
      flex: 1 1 auto;
    }

    .toast__description {
      flex: 1 1 auto;
      color: var(--fsds-toast-color-default, #141414);
      font-size: inherit;
    }

    .toast__action {
      display: inline-flex;
      align-items: center;
      background: transparent;
      border: 0;
      cursor: pointer;
      color: var(--fsds-toast-color-default, #141414);
    }

    .toast__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 0;
      border-radius: 9999px;
      cursor: pointer;
      color: var(--fsds-toast-color-default, #141414);
      flex-shrink: 0;
    }
  `;

  @property({ type: Boolean }) open?: boolean;
  @property({ attribute: false }) onOpenChange?: (open: boolean) => void;
  @property({ type: String }) variant?: ToastVariant = "info";
  @property({ type: String }) politeness?: ToastPoliteness = "polite";
  @property({ attribute: false }) action?: unknown;
  @property({ attribute: false }) duration?: number | null;

  private behavior = new ToastBehavior(this, {
    open: () => this.open,
    onOpenChange: (v) => this.onOpenChange?.(v),
  });

  private autoDismiss = new AutoDismissController(this, {
    open: () => Boolean(this.behavior.open),
    durationMs: () => this.duration === undefined ? 6000 : this.duration,
    onDismiss: () => this.behavior.setOpen(false),
  });

  private _moving = false;
  private _portaled = false;
  private _portalOriginParent: Node | null = null;
  private _portalOriginNext: Node | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "toast");
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
      "toast",
      (this.variant ?? "info") ? `toast--${(this.variant ?? "info")}` : null,
      (this.politeness ?? "polite") ? `toast--${(this.politeness ?? "polite")}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" aria-label="Notifications" role="alert" aria-live=${ifDefined((this.politeness ?? "polite"))} @pointerenter=${this.autoDismiss.pauseListeners.pointerenter} @pointerleave=${this.autoDismiss.pauseListeners.pointerleave} @focusin=${this.autoDismiss.pauseListeners.focusin} @focusout=${this.autoDismiss.pauseListeners.focusout}>
  ${this.behavior.open ? html`
  <div class=${'toast__item'} role="status" aria-labelledby=${ifDefined([this.title ? 'toast-title' : null].filter(Boolean).join(' ') || undefined)} data-fsds-channel-renders="open">
    <div class=${'toast__row'}>
      ${this.title ? html`
      <div class=${'toast__title'} id="toast-title">${this.title}</div>
      ` : nothing}
      <div class=${'toast__description'}>
        <slot></slot>
      </div>
      ${this.action ? html`
      <div class=${'toast__action'}></div>
      ` : nothing}
      <button class=${'toast__close'} type="button" aria-label="Dismiss" @click=${() => this.behavior.setOpen(!this.behavior.open)}></button>
    </div>
  </div>
  ` : nothing}
</div>`;
  }
}

customElements.define('fsds-toast', ToastElement);

export class ToastItemElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .toast {
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
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-toast-surface-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-toast-surface-shadow: var(--fsds-semantic-elevation-surface-overlay, 0px 4px 6px #0000000d, 0px 10px 15px #0000001a);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-toast-accent-default: var(--fsds-semantic-color-status-info, #0566fe);
      --fsds-toast-color-intent-bg: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-toast-color-intent-border: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-toast-spacing-padding: var(--fsds-core-spacing-size-05, 12px);
      --fsds-toast-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-spacing-stack-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-size-max-width: 400px;
      --fsds-toast-motion-enter: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toast-motion-leave: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toast-timing-auto-dismiss: var(--fsds-semantic-motion-dwell-notification, 6000ms);
    }

    .toast--info {
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-info-subtle, #95dafb);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-on-info-subtle, #013ab0);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-info, #034fd6);
    }

    .toast--success {
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-success-subtle, #b3dba7);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-on-success-subtle, #2c4f09);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-success, #3a6614);
    }

    .toast--warning {
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-warning-subtle, #fdc67f);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-on-warning-subtle, #6c3a00);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-warning, #8b4b00);
    }

    .toast--error {
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-danger-subtle, #fac2c2);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-on-danger-subtle, #900909);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-danger, #b31b1b);
    }

    .toast {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-toast-spacing-stack-gap, 8px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      position: fixed;
      bottom: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      z-index: 1000;
      pointer-events: none;
    }

    .toast__item {
      background-color: var(--fsds-toast-surface-bg, #d0d0d0);
      border-color: var(--fsds-toast-surface-border, #d0d0d0);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-toast-surface-radius, 6px);
      box-shadow: var(--fsds-toast-surface-shadow, 0px 4px 6px #0000000d, 0px 10px 15px #0000001a);
      padding: var(--fsds-toast-spacing-padding, 12px);
      max-width: var(--fsds-toast-size-max-width, 400px);
      display: flex;
      flex-direction: column;
      position: relative;
      pointer-events: auto;
      box-sizing: border-box;
    }

    .toast__row {
      display: flex;
      align-items: flex-start;
      gap: var(--fsds-toast-spacing-gap, 8px);
      flex: 1 1 auto;
    }

    .toast__title {
      margin: 0;
      font-weight: 600;
      flex: 1 1 auto;
    }

    .toast__description {
      flex: 1 1 auto;
      color: var(--fsds-toast-color-default, #141414);
      font-size: inherit;
    }

    .toast__action {
      display: inline-flex;
      align-items: center;
      background: transparent;
      border: 0;
      cursor: pointer;
      color: var(--fsds-toast-color-default, #141414);
    }

    .toast__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 0;
      border-radius: 9999px;
      cursor: pointer;
      color: var(--fsds-toast-color-default, #141414);
      flex-shrink: 0;
    }
  `;

  override render() {
    return html`<fsds-stack as="li" class="toast__item"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-toast-item', ToastItemElement);

export class ToastTitleElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .toast {
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
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-toast-surface-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-toast-surface-shadow: var(--fsds-semantic-elevation-surface-overlay, 0px 4px 6px #0000000d, 0px 10px 15px #0000001a);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-toast-accent-default: var(--fsds-semantic-color-status-info, #0566fe);
      --fsds-toast-color-intent-bg: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-toast-color-intent-border: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-toast-spacing-padding: var(--fsds-core-spacing-size-05, 12px);
      --fsds-toast-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-spacing-stack-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-size-max-width: 400px;
      --fsds-toast-motion-enter: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toast-motion-leave: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toast-timing-auto-dismiss: var(--fsds-semantic-motion-dwell-notification, 6000ms);
    }

    .toast--info {
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-info-subtle, #95dafb);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-on-info-subtle, #013ab0);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-info, #034fd6);
    }

    .toast--success {
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-success-subtle, #b3dba7);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-on-success-subtle, #2c4f09);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-success, #3a6614);
    }

    .toast--warning {
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-warning-subtle, #fdc67f);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-on-warning-subtle, #6c3a00);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-warning, #8b4b00);
    }

    .toast--error {
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-danger-subtle, #fac2c2);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-on-danger-subtle, #900909);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-danger, #b31b1b);
    }

    .toast {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-toast-spacing-stack-gap, 8px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      position: fixed;
      bottom: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      z-index: 1000;
      pointer-events: none;
    }

    .toast__item {
      background-color: var(--fsds-toast-surface-bg, #d0d0d0);
      border-color: var(--fsds-toast-surface-border, #d0d0d0);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-toast-surface-radius, 6px);
      box-shadow: var(--fsds-toast-surface-shadow, 0px 4px 6px #0000000d, 0px 10px 15px #0000001a);
      padding: var(--fsds-toast-spacing-padding, 12px);
      max-width: var(--fsds-toast-size-max-width, 400px);
      display: flex;
      flex-direction: column;
      position: relative;
      pointer-events: auto;
      box-sizing: border-box;
    }

    .toast__row {
      display: flex;
      align-items: flex-start;
      gap: var(--fsds-toast-spacing-gap, 8px);
      flex: 1 1 auto;
    }

    .toast__title {
      margin: 0;
      font-weight: 600;
      flex: 1 1 auto;
    }

    .toast__description {
      flex: 1 1 auto;
      color: var(--fsds-toast-color-default, #141414);
      font-size: inherit;
    }

    .toast__action {
      display: inline-flex;
      align-items: center;
      background: transparent;
      border: 0;
      cursor: pointer;
      color: var(--fsds-toast-color-default, #141414);
    }

    .toast__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 0;
      border-radius: 9999px;
      cursor: pointer;
      color: var(--fsds-toast-color-default, #141414);
      flex-shrink: 0;
    }
  `;

  override render() {
    return html`<fsds-stack as="h3" class="toast__title"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-toast-title', ToastTitleElement);

export class ToastDescriptionElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .toast {
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
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-toast-surface-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-toast-surface-shadow: var(--fsds-semantic-elevation-surface-overlay, 0px 4px 6px #0000000d, 0px 10px 15px #0000001a);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-toast-accent-default: var(--fsds-semantic-color-status-info, #0566fe);
      --fsds-toast-color-intent-bg: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-toast-color-intent-border: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-toast-spacing-padding: var(--fsds-core-spacing-size-05, 12px);
      --fsds-toast-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-spacing-stack-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-size-max-width: 400px;
      --fsds-toast-motion-enter: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toast-motion-leave: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toast-timing-auto-dismiss: var(--fsds-semantic-motion-dwell-notification, 6000ms);
    }

    .toast--info {
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-info-subtle, #95dafb);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-on-info-subtle, #013ab0);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-info, #034fd6);
    }

    .toast--success {
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-success-subtle, #b3dba7);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-on-success-subtle, #2c4f09);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-success, #3a6614);
    }

    .toast--warning {
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-warning-subtle, #fdc67f);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-on-warning-subtle, #6c3a00);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-warning, #8b4b00);
    }

    .toast--error {
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-danger-subtle, #fac2c2);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-on-danger-subtle, #900909);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-danger, #b31b1b);
    }

    .toast {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-toast-spacing-stack-gap, 8px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      position: fixed;
      bottom: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      z-index: 1000;
      pointer-events: none;
    }

    .toast__item {
      background-color: var(--fsds-toast-surface-bg, #d0d0d0);
      border-color: var(--fsds-toast-surface-border, #d0d0d0);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-toast-surface-radius, 6px);
      box-shadow: var(--fsds-toast-surface-shadow, 0px 4px 6px #0000000d, 0px 10px 15px #0000001a);
      padding: var(--fsds-toast-spacing-padding, 12px);
      max-width: var(--fsds-toast-size-max-width, 400px);
      display: flex;
      flex-direction: column;
      position: relative;
      pointer-events: auto;
      box-sizing: border-box;
    }

    .toast__row {
      display: flex;
      align-items: flex-start;
      gap: var(--fsds-toast-spacing-gap, 8px);
      flex: 1 1 auto;
    }

    .toast__title {
      margin: 0;
      font-weight: 600;
      flex: 1 1 auto;
    }

    .toast__description {
      flex: 1 1 auto;
      color: var(--fsds-toast-color-default, #141414);
      font-size: inherit;
    }

    .toast__action {
      display: inline-flex;
      align-items: center;
      background: transparent;
      border: 0;
      cursor: pointer;
      color: var(--fsds-toast-color-default, #141414);
    }

    .toast__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 0;
      border-radius: 9999px;
      cursor: pointer;
      color: var(--fsds-toast-color-default, #141414);
      flex-shrink: 0;
    }
  `;

  override render() {
    return html`<fsds-stack as="p" class="toast__description"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-toast-description', ToastDescriptionElement);
// @generated:end

// @custom:start trailing

// @custom:end