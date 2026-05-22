// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ToastBehavior } from './ToastBehavior.js';
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
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-toast-surface-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-toast-surface-shadow: var(--fsds-semantic-elevation-surface-raised, none);
      --fsds-toast-color-info: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-toast-color-success: var(--fsds-semantic-color-foreground-success, #487e1e);
      --fsds-toast-color-warning: var(--fsds-semantic-color-foreground-warning, #ac5c00);
      --fsds-toast-color-error: var(--fsds-semantic-color-foreground-danger, #d9292b);
      --fsds-toast-accent-info: var(--fsds-semantic-color-status-info, #0a65fe);
      --fsds-toast-accent-success: var(--fsds-semantic-color-status-success, #487e1e);
      --fsds-toast-accent-warning: var(--fsds-semantic-color-status-warning, #ac5c00);
      --fsds-toast-accent-error: var(--fsds-semantic-color-status-danger, #d9292b);
      --fsds-toast-spacing-padding: var(--fsds-core-spacing-size-05, 12px);
      --fsds-toast-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-spacing-stackGap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-size-maxWidth: 400px;
      --fsds-toast-motion-enter: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toast-motion-leave: var(--fsds-core-motion-duration-short, 150ms);
    }
    
    .toast {
      border-radius: var(--fsds-toast-surface-radius);
      box-shadow: var(--fsds-toast-surface-shadow);
      padding: var(--fsds-toast-spacing-padding);
      gap: var(--fsds-toast-spacing-stackGap);
    }
  `;

  @property({ type: Boolean }) open?: boolean;
  @property({ attribute: false }) variant?: ToastVariant = "info";
  @property({ attribute: false }) politeness?: ToastPoliteness = "polite";
  @property({ attribute: false }) action?: unknown;
  @property({ attribute: false }) onOpenChange?: (value: boolean) => void;

  private behavior = new ToastBehavior(this, {
    open: () => this.open,
    onOpenChange: (v) => this.onOpenChange?.(v),
  });

  private computeClasses(): string {
    return [
      "toast",
      this.variant ? `toast--${this.variant}` : null,
      this.politeness ? `toast--${this.politeness}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" aria-live="polite" aria-label="Notifications" role="alert">
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
      <button class=${'toast__close'} type="button" aria-label="Dismiss"></button>
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
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-toast-surface-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-toast-surface-shadow: var(--fsds-semantic-elevation-surface-raised, none);
      --fsds-toast-color-info: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-toast-color-success: var(--fsds-semantic-color-foreground-success, #487e1e);
      --fsds-toast-color-warning: var(--fsds-semantic-color-foreground-warning, #ac5c00);
      --fsds-toast-color-error: var(--fsds-semantic-color-foreground-danger, #d9292b);
      --fsds-toast-accent-info: var(--fsds-semantic-color-status-info, #0a65fe);
      --fsds-toast-accent-success: var(--fsds-semantic-color-status-success, #487e1e);
      --fsds-toast-accent-warning: var(--fsds-semantic-color-status-warning, #ac5c00);
      --fsds-toast-accent-error: var(--fsds-semantic-color-status-danger, #d9292b);
      --fsds-toast-spacing-padding: var(--fsds-core-spacing-size-05, 12px);
      --fsds-toast-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-spacing-stackGap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-size-maxWidth: 400px;
      --fsds-toast-motion-enter: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toast-motion-leave: var(--fsds-core-motion-duration-short, 150ms);
    }
    
    .toast {
      border-radius: var(--fsds-toast-surface-radius);
      box-shadow: var(--fsds-toast-surface-shadow);
      padding: var(--fsds-toast-spacing-padding);
      gap: var(--fsds-toast-spacing-stackGap);
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
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-toast-surface-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-toast-surface-shadow: var(--fsds-semantic-elevation-surface-raised, none);
      --fsds-toast-color-info: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-toast-color-success: var(--fsds-semantic-color-foreground-success, #487e1e);
      --fsds-toast-color-warning: var(--fsds-semantic-color-foreground-warning, #ac5c00);
      --fsds-toast-color-error: var(--fsds-semantic-color-foreground-danger, #d9292b);
      --fsds-toast-accent-info: var(--fsds-semantic-color-status-info, #0a65fe);
      --fsds-toast-accent-success: var(--fsds-semantic-color-status-success, #487e1e);
      --fsds-toast-accent-warning: var(--fsds-semantic-color-status-warning, #ac5c00);
      --fsds-toast-accent-error: var(--fsds-semantic-color-status-danger, #d9292b);
      --fsds-toast-spacing-padding: var(--fsds-core-spacing-size-05, 12px);
      --fsds-toast-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-spacing-stackGap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-size-maxWidth: 400px;
      --fsds-toast-motion-enter: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toast-motion-leave: var(--fsds-core-motion-duration-short, 150ms);
    }
    
    .toast {
      border-radius: var(--fsds-toast-surface-radius);
      box-shadow: var(--fsds-toast-surface-shadow);
      padding: var(--fsds-toast-spacing-padding);
      gap: var(--fsds-toast-spacing-stackGap);
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
      --fsds-toast-surface-bg: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-toast-surface-border: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-toast-surface-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-toast-surface-shadow: var(--fsds-semantic-elevation-surface-raised, none);
      --fsds-toast-color-info: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-toast-color-success: var(--fsds-semantic-color-foreground-success, #487e1e);
      --fsds-toast-color-warning: var(--fsds-semantic-color-foreground-warning, #ac5c00);
      --fsds-toast-color-error: var(--fsds-semantic-color-foreground-danger, #d9292b);
      --fsds-toast-accent-info: var(--fsds-semantic-color-status-info, #0a65fe);
      --fsds-toast-accent-success: var(--fsds-semantic-color-status-success, #487e1e);
      --fsds-toast-accent-warning: var(--fsds-semantic-color-status-warning, #ac5c00);
      --fsds-toast-accent-error: var(--fsds-semantic-color-status-danger, #d9292b);
      --fsds-toast-spacing-padding: var(--fsds-core-spacing-size-05, 12px);
      --fsds-toast-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-spacing-stackGap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-toast-size-maxWidth: 400px;
      --fsds-toast-motion-enter: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toast-motion-leave: var(--fsds-core-motion-duration-short, 150ms);
    }
    
    .toast {
      border-radius: var(--fsds-toast-surface-radius);
      box-shadow: var(--fsds-toast-surface-shadow);
      padding: var(--fsds-toast-spacing-padding);
      gap: var(--fsds-toast-spacing-stackGap);
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