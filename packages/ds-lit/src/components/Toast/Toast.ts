// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ToastBehavior } from './ToastBehavior.js';
import { AutoDismissController } from '../../primitives/index.js';
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
      --fsds-box-model-gap: var(--fsds-semantic-surface-size-gap, 12px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-surface-size-min-width, 64px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-toast-surface-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-toast-surface-shadow: var(--fsds-semantic-elevation-surface-raised, none);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-toast-accent-default: var(--fsds-semantic-color-status-info, #0a65fe);
      --fsds-toast-spacing-padding: var(--fsds-core-spacing-size-05, 12px);
      --fsds-toast-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-spacing-stackGap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-size-maxWidth: 400px;
      --fsds-toast-motion-enter: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toast-motion-leave: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toast-timing-auto-dismiss: var(--fsds-semantic-motion-dwell-notification, 6000ms);
    }
    
    .toast--success {
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-success);
    }
    
    .toast--warning {
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-warning);
    }
    
    .toast--error {
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-danger);
    }
    
    .toast {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-toast-spacing-stackGap);
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
      background-color: var(--fsds-toast-surface-bg);
      border-color: var(--fsds-toast-surface-border);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-toast-surface-radius);
      box-shadow: var(--fsds-toast-surface-shadow);
      padding: var(--fsds-toast-spacing-padding);
      max-width: var(--fsds-toast-size-maxWidth);
      display: flex;
      flex-direction: column;
      position: relative;
      pointer-events: auto;
      box-sizing: border-box;
    }
    
    .toast__row {
      display: flex;
      align-items: flex-start;
      gap: var(--fsds-toast-spacing-gap);
      flex: 1 1 auto;
    }
    
    .toast__title {
      margin: 0;
      font-weight: 600;
      flex: 1 1 auto;
    }
    
    .toast__description {
      flex: 1 1 auto;
      color: var(--fsds-toast-color-default);
      font-size: inherit;
    }
    
    .toast__action {
      display: inline-flex;
      align-items: center;
      background: transparent;
      border: 0;
      cursor: pointer;
      color: var(--fsds-toast-color-default);
    }
    
    .toast__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 0;
      border-radius: 9999px;
      cursor: pointer;
      color: var(--fsds-toast-color-default);
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

  private handleOpenChange(event: Event): void {
    this.behavior.setOpen((event.target as HTMLInputElement).checked);
  }

  private computeClasses(): string {
    return [
      "toast",
      this.variant ? `toast--${this.variant}` : null,
      this.politeness ? `toast--${this.politeness}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" aria-live="polite" aria-label="Notifications" role="alert" @pointerenter=${this.autoDismiss.pauseListeners.pointerenter} @pointerleave=${this.autoDismiss.pauseListeners.pointerleave} @focusin=${this.autoDismiss.pauseListeners.focusin} @focusout=${this.autoDismiss.pauseListeners.focusout}>
  ${this.behavior.open ? html`
  <div class=${'toast__item'} role="status" data-fsds-channel-renders="open">
    <div class=${'toast__row'}>
      ${this.title ? html`
      <div class=${'toast__title'}></div>
      ` : nothing}
      <div class=${'toast__description'}>
        <slot></slot>
      </div>
      ${this.action ? html`
      <div class=${'toast__action'}></div>
      ` : nothing}
      <button class=${'toast__close'} type="button" aria-label="Dismiss" @click=${(e: Event) => this.handleOpenChange(e)}></button>
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
      --fsds-box-model-gap: var(--fsds-semantic-surface-size-gap, 12px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-surface-size-min-width, 64px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-toast-surface-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-toast-surface-shadow: var(--fsds-semantic-elevation-surface-raised, none);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-toast-accent-default: var(--fsds-semantic-color-status-info, #0a65fe);
      --fsds-toast-spacing-padding: var(--fsds-core-spacing-size-05, 12px);
      --fsds-toast-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-spacing-stackGap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-size-maxWidth: 400px;
      --fsds-toast-motion-enter: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toast-motion-leave: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toast-timing-auto-dismiss: var(--fsds-semantic-motion-dwell-notification, 6000ms);
    }
    
    .toast--success {
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-success);
    }
    
    .toast--warning {
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-warning);
    }
    
    .toast--error {
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-danger);
    }
    
    .toast {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-toast-spacing-stackGap);
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
      background-color: var(--fsds-toast-surface-bg);
      border-color: var(--fsds-toast-surface-border);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-toast-surface-radius);
      box-shadow: var(--fsds-toast-surface-shadow);
      padding: var(--fsds-toast-spacing-padding);
      max-width: var(--fsds-toast-size-maxWidth);
      display: flex;
      flex-direction: column;
      position: relative;
      pointer-events: auto;
      box-sizing: border-box;
    }
    
    .toast__row {
      display: flex;
      align-items: flex-start;
      gap: var(--fsds-toast-spacing-gap);
      flex: 1 1 auto;
    }
    
    .toast__title {
      margin: 0;
      font-weight: 600;
      flex: 1 1 auto;
    }
    
    .toast__description {
      flex: 1 1 auto;
      color: var(--fsds-toast-color-default);
      font-size: inherit;
    }
    
    .toast__action {
      display: inline-flex;
      align-items: center;
      background: transparent;
      border: 0;
      cursor: pointer;
      color: var(--fsds-toast-color-default);
    }
    
    .toast__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 0;
      border-radius: 9999px;
      cursor: pointer;
      color: var(--fsds-toast-color-default);
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
      --fsds-box-model-gap: var(--fsds-semantic-surface-size-gap, 12px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-surface-size-min-width, 64px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-toast-surface-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-toast-surface-shadow: var(--fsds-semantic-elevation-surface-raised, none);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-toast-accent-default: var(--fsds-semantic-color-status-info, #0a65fe);
      --fsds-toast-spacing-padding: var(--fsds-core-spacing-size-05, 12px);
      --fsds-toast-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-spacing-stackGap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-size-maxWidth: 400px;
      --fsds-toast-motion-enter: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toast-motion-leave: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toast-timing-auto-dismiss: var(--fsds-semantic-motion-dwell-notification, 6000ms);
    }
    
    .toast--success {
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-success);
    }
    
    .toast--warning {
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-warning);
    }
    
    .toast--error {
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-danger);
    }
    
    .toast {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-toast-spacing-stackGap);
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
      background-color: var(--fsds-toast-surface-bg);
      border-color: var(--fsds-toast-surface-border);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-toast-surface-radius);
      box-shadow: var(--fsds-toast-surface-shadow);
      padding: var(--fsds-toast-spacing-padding);
      max-width: var(--fsds-toast-size-maxWidth);
      display: flex;
      flex-direction: column;
      position: relative;
      pointer-events: auto;
      box-sizing: border-box;
    }
    
    .toast__row {
      display: flex;
      align-items: flex-start;
      gap: var(--fsds-toast-spacing-gap);
      flex: 1 1 auto;
    }
    
    .toast__title {
      margin: 0;
      font-weight: 600;
      flex: 1 1 auto;
    }
    
    .toast__description {
      flex: 1 1 auto;
      color: var(--fsds-toast-color-default);
      font-size: inherit;
    }
    
    .toast__action {
      display: inline-flex;
      align-items: center;
      background: transparent;
      border: 0;
      cursor: pointer;
      color: var(--fsds-toast-color-default);
    }
    
    .toast__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 0;
      border-radius: 9999px;
      cursor: pointer;
      color: var(--fsds-toast-color-default);
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
      --fsds-box-model-gap: var(--fsds-semantic-surface-size-gap, 12px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-surface-size-min-width, 64px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-toast-surface-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-toast-surface-shadow: var(--fsds-semantic-elevation-surface-raised, none);
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-toast-accent-default: var(--fsds-semantic-color-status-info, #0a65fe);
      --fsds-toast-spacing-padding: var(--fsds-core-spacing-size-05, 12px);
      --fsds-toast-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-spacing-stackGap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-size-maxWidth: 400px;
      --fsds-toast-motion-enter: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toast-motion-leave: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toast-timing-auto-dismiss: var(--fsds-semantic-motion-dwell-notification, 6000ms);
    }
    
    .toast--success {
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-success);
    }
    
    .toast--warning {
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-warning);
    }
    
    .toast--error {
      --fsds-toast-color-default: var(--fsds-semantic-color-foreground-danger);
    }
    
    .toast {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-toast-spacing-stackGap);
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
      background-color: var(--fsds-toast-surface-bg);
      border-color: var(--fsds-toast-surface-border);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-toast-surface-radius);
      box-shadow: var(--fsds-toast-surface-shadow);
      padding: var(--fsds-toast-spacing-padding);
      max-width: var(--fsds-toast-size-maxWidth);
      display: flex;
      flex-direction: column;
      position: relative;
      pointer-events: auto;
      box-sizing: border-box;
    }
    
    .toast__row {
      display: flex;
      align-items: flex-start;
      gap: var(--fsds-toast-spacing-gap);
      flex: 1 1 auto;
    }
    
    .toast__title {
      margin: 0;
      font-weight: 600;
      flex: 1 1 auto;
    }
    
    .toast__description {
      flex: 1 1 auto;
      color: var(--fsds-toast-color-default);
      font-size: inherit;
    }
    
    .toast__action {
      display: inline-flex;
      align-items: center;
      background: transparent;
      border: 0;
      cursor: pointer;
      color: var(--fsds-toast-color-default);
    }
    
    .toast__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 0;
      border-radius: 9999px;
      cursor: pointer;
      color: var(--fsds-toast-color-default);
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