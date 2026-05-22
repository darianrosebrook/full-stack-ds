// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { DialogBehavior } from './DialogBehavior.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type DialogSize = "sm" | "md" | "lg" | "xl" | "full";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class DialogElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .dialog {
      --fsds-dialog-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-dialog-color-background-backdrop: var(--fsds-semantic-color-overlay-scrim, #00000066);
      --fsds-dialog-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-dialog-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-dialog-color-border-default: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-dialog-size-radius-default: var(--fsds-core-shape-radius-large, 16px);
      --fsds-dialog-size-sm-width: 400px;
      --fsds-dialog-size-sm-maxWidth: 90vw;
      --fsds-dialog-size-md-width: 500px;
      --fsds-dialog-size-md-maxWidth: 90vw;
      --fsds-dialog-size-lg-width: 700px;
      --fsds-dialog-size-lg-maxWidth: 90vw;
      --fsds-dialog-size-xl-width: 900px;
      --fsds-dialog-size-xl-maxWidth: 95vw;
      --fsds-dialog-size-full-width: 100vw;
      --fsds-dialog-size-full-height: 100vh;
      --fsds-dialog-size-closeButton-size: var(--fsds-core-spacing-size-08, 32px);
      --fsds-dialog-elevation-default: var(--fsds-semantic-elevation-surface-floating, 0 8px 32px rgba(0,0,0,0.16));
      --fsds-dialog-spacing-header-paddingTop: var(--fsds-core-spacing-size-06, 16px);
      --fsds-dialog-spacing-body-paddingRight: var(--fsds-core-spacing-size-07, 24px);
      --fsds-dialog-spacing-footer-gap: var(--fsds-core-spacing-size-03, 4px);
      --fsds-dialog-typography-title-fontSize: var(--fsds-semantic-typography-heading-04, 18px);
      --fsds-dialog-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-dialog-typography-title-lineHeight: var(--fsds-semantic-typography-line-height-heading, 1);
      --fsds-dialog-color-background-hover: var(--fsds-semantic-color-background-hover, #cecece);
    }
    
    .dialog {
      background-color: var(--fsds-dialog-color-background-backdrop);
      color: var(--fsds-dialog-color-foreground-secondary);
      border-color: var(--fsds-dialog-color-border-default);
      border-radius: var(--fsds-dialog-size-radius-default);
      padding: var(--fsds-dialog-spacing-body-paddingRight);
      gap: var(--fsds-dialog-spacing-footer-gap);
      line-height: var(--fsds-dialog-typography-title-lineHeight);
    
      &:hover {
        background-color: var(--fsds-dialog-color-background-hover);
      }
    }
  `;

  @property({ type: Boolean }) open?: boolean;
  @property({ type: Boolean }) defaultOpen?: boolean;
  @property({ type: Boolean }) modal?: boolean = true;
  @property({ attribute: false }) size?: DialogSize = "md";
  @property({ type: Boolean }) dismissible?: boolean = true;
  @property({ type: Boolean }) closeOnEscape?: boolean = true;
  @property({ type: Boolean }) closeOnBackdropClick?: boolean = true;
  @property({ type: String }) initialFocus?: string;
  @property({ type: String }) returnFocus?: string;
  @property({ attribute: false }) onOpenChange?: (value: boolean) => void;

  private behavior = new DialogBehavior(this, {
    open: () => this.open,
    defaultOpen: this.defaultOpen,
    onOpenChange: (v) => this.onOpenChange?.(v),
    closeOnEscape: this.closeOnEscape,
    closeOnBackdropClick: this.closeOnBackdropClick,
  });

  private _handleOverlayClick = (): void => {
    if (this.closeOnBackdropClick !== false) {
      this.behavior.setOpenness(false);
    }
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this._handleOverlayClick);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('click', this._handleOverlayClick);
    super.disconnectedCallback();
  }

  private computeClasses(): string {
    return [
      "dialog",
      this.size ? `dialog--${this.size}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" role="dialog">
  ${this.behavior.openness ? html`
  <div class=${'dialog__backdrop'} aria-hidden="true" data-fsds-channel-renders="openness"></div>
  ` : nothing}
  ${this.behavior.openness ? html`
  <div class=${'dialog__modal'} role="dialog" aria-modal="true" aria-labelledby="dialog-title-id" aria-describedby="dialog-body-id" data-fsds-channel-renders="openness" @click=${(e: Event) => e.stopPropagation()}>
    <div class=${'dialog__header'}>
      <h2 class=${'dialog__title'}>
        <slot name="title"></slot>
      </h2>
      <button class=${'dialog__closeButton'} type="button" aria-label="Close dialog"></button>
    </div>
    <div class=${'dialog__body'}>
      <slot></slot>
    </div>
    <div class=${'dialog__footer'}></div>
  </div>
  ` : nothing}
</div>`;
  }
}

customElements.define('fsds-dialog', DialogElement);

export class DialogHeaderElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .dialog {
      --fsds-dialog-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-dialog-color-background-backdrop: var(--fsds-semantic-color-overlay-scrim, #00000066);
      --fsds-dialog-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-dialog-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-dialog-color-border-default: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-dialog-size-radius-default: var(--fsds-core-shape-radius-large, 16px);
      --fsds-dialog-size-sm-width: 400px;
      --fsds-dialog-size-sm-maxWidth: 90vw;
      --fsds-dialog-size-md-width: 500px;
      --fsds-dialog-size-md-maxWidth: 90vw;
      --fsds-dialog-size-lg-width: 700px;
      --fsds-dialog-size-lg-maxWidth: 90vw;
      --fsds-dialog-size-xl-width: 900px;
      --fsds-dialog-size-xl-maxWidth: 95vw;
      --fsds-dialog-size-full-width: 100vw;
      --fsds-dialog-size-full-height: 100vh;
      --fsds-dialog-size-closeButton-size: var(--fsds-core-spacing-size-08, 32px);
      --fsds-dialog-elevation-default: var(--fsds-semantic-elevation-surface-floating, 0 8px 32px rgba(0,0,0,0.16));
      --fsds-dialog-spacing-header-paddingTop: var(--fsds-core-spacing-size-06, 16px);
      --fsds-dialog-spacing-body-paddingRight: var(--fsds-core-spacing-size-07, 24px);
      --fsds-dialog-spacing-footer-gap: var(--fsds-core-spacing-size-03, 4px);
      --fsds-dialog-typography-title-fontSize: var(--fsds-semantic-typography-heading-04, 18px);
      --fsds-dialog-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-dialog-typography-title-lineHeight: var(--fsds-semantic-typography-line-height-heading, 1);
      --fsds-dialog-color-background-hover: var(--fsds-semantic-color-background-hover, #cecece);
    }
    
    .dialog {
      background-color: var(--fsds-dialog-color-background-backdrop);
      color: var(--fsds-dialog-color-foreground-secondary);
      border-color: var(--fsds-dialog-color-border-default);
      border-radius: var(--fsds-dialog-size-radius-default);
      padding: var(--fsds-dialog-spacing-body-paddingRight);
      gap: var(--fsds-dialog-spacing-footer-gap);
      line-height: var(--fsds-dialog-typography-title-lineHeight);
    
      &:hover {
        background-color: var(--fsds-dialog-color-background-hover);
      }
    }
  `;

  override render() {
    return html`<fsds-stack as="header" class="dialog__header"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-dialog-header', DialogHeaderElement);

export class DialogTitleElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .dialog {
      --fsds-dialog-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-dialog-color-background-backdrop: var(--fsds-semantic-color-overlay-scrim, #00000066);
      --fsds-dialog-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-dialog-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-dialog-color-border-default: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-dialog-size-radius-default: var(--fsds-core-shape-radius-large, 16px);
      --fsds-dialog-size-sm-width: 400px;
      --fsds-dialog-size-sm-maxWidth: 90vw;
      --fsds-dialog-size-md-width: 500px;
      --fsds-dialog-size-md-maxWidth: 90vw;
      --fsds-dialog-size-lg-width: 700px;
      --fsds-dialog-size-lg-maxWidth: 90vw;
      --fsds-dialog-size-xl-width: 900px;
      --fsds-dialog-size-xl-maxWidth: 95vw;
      --fsds-dialog-size-full-width: 100vw;
      --fsds-dialog-size-full-height: 100vh;
      --fsds-dialog-size-closeButton-size: var(--fsds-core-spacing-size-08, 32px);
      --fsds-dialog-elevation-default: var(--fsds-semantic-elevation-surface-floating, 0 8px 32px rgba(0,0,0,0.16));
      --fsds-dialog-spacing-header-paddingTop: var(--fsds-core-spacing-size-06, 16px);
      --fsds-dialog-spacing-body-paddingRight: var(--fsds-core-spacing-size-07, 24px);
      --fsds-dialog-spacing-footer-gap: var(--fsds-core-spacing-size-03, 4px);
      --fsds-dialog-typography-title-fontSize: var(--fsds-semantic-typography-heading-04, 18px);
      --fsds-dialog-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-dialog-typography-title-lineHeight: var(--fsds-semantic-typography-line-height-heading, 1);
      --fsds-dialog-color-background-hover: var(--fsds-semantic-color-background-hover, #cecece);
    }
    
    .dialog {
      background-color: var(--fsds-dialog-color-background-backdrop);
      color: var(--fsds-dialog-color-foreground-secondary);
      border-color: var(--fsds-dialog-color-border-default);
      border-radius: var(--fsds-dialog-size-radius-default);
      padding: var(--fsds-dialog-spacing-body-paddingRight);
      gap: var(--fsds-dialog-spacing-footer-gap);
      line-height: var(--fsds-dialog-typography-title-lineHeight);
    
      &:hover {
        background-color: var(--fsds-dialog-color-background-hover);
      }
    }
  `;

  override render() {
    return html`<fsds-stack as="h3" class="dialog__title"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-dialog-title', DialogTitleElement);

export class DialogBodyElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .dialog {
      --fsds-dialog-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-dialog-color-background-backdrop: var(--fsds-semantic-color-overlay-scrim, #00000066);
      --fsds-dialog-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-dialog-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-dialog-color-border-default: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-dialog-size-radius-default: var(--fsds-core-shape-radius-large, 16px);
      --fsds-dialog-size-sm-width: 400px;
      --fsds-dialog-size-sm-maxWidth: 90vw;
      --fsds-dialog-size-md-width: 500px;
      --fsds-dialog-size-md-maxWidth: 90vw;
      --fsds-dialog-size-lg-width: 700px;
      --fsds-dialog-size-lg-maxWidth: 90vw;
      --fsds-dialog-size-xl-width: 900px;
      --fsds-dialog-size-xl-maxWidth: 95vw;
      --fsds-dialog-size-full-width: 100vw;
      --fsds-dialog-size-full-height: 100vh;
      --fsds-dialog-size-closeButton-size: var(--fsds-core-spacing-size-08, 32px);
      --fsds-dialog-elevation-default: var(--fsds-semantic-elevation-surface-floating, 0 8px 32px rgba(0,0,0,0.16));
      --fsds-dialog-spacing-header-paddingTop: var(--fsds-core-spacing-size-06, 16px);
      --fsds-dialog-spacing-body-paddingRight: var(--fsds-core-spacing-size-07, 24px);
      --fsds-dialog-spacing-footer-gap: var(--fsds-core-spacing-size-03, 4px);
      --fsds-dialog-typography-title-fontSize: var(--fsds-semantic-typography-heading-04, 18px);
      --fsds-dialog-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-dialog-typography-title-lineHeight: var(--fsds-semantic-typography-line-height-heading, 1);
      --fsds-dialog-color-background-hover: var(--fsds-semantic-color-background-hover, #cecece);
    }
    
    .dialog {
      background-color: var(--fsds-dialog-color-background-backdrop);
      color: var(--fsds-dialog-color-foreground-secondary);
      border-color: var(--fsds-dialog-color-border-default);
      border-radius: var(--fsds-dialog-size-radius-default);
      padding: var(--fsds-dialog-spacing-body-paddingRight);
      gap: var(--fsds-dialog-spacing-footer-gap);
      line-height: var(--fsds-dialog-typography-title-lineHeight);
    
      &:hover {
        background-color: var(--fsds-dialog-color-background-hover);
      }
    }
  `;

  override render() {
    return html`<fsds-stack class="dialog__body"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-dialog-body', DialogBodyElement);

export class DialogFooterElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .dialog {
      --fsds-dialog-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-dialog-color-background-backdrop: var(--fsds-semantic-color-overlay-scrim, #00000066);
      --fsds-dialog-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-dialog-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-dialog-color-border-default: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-dialog-size-radius-default: var(--fsds-core-shape-radius-large, 16px);
      --fsds-dialog-size-sm-width: 400px;
      --fsds-dialog-size-sm-maxWidth: 90vw;
      --fsds-dialog-size-md-width: 500px;
      --fsds-dialog-size-md-maxWidth: 90vw;
      --fsds-dialog-size-lg-width: 700px;
      --fsds-dialog-size-lg-maxWidth: 90vw;
      --fsds-dialog-size-xl-width: 900px;
      --fsds-dialog-size-xl-maxWidth: 95vw;
      --fsds-dialog-size-full-width: 100vw;
      --fsds-dialog-size-full-height: 100vh;
      --fsds-dialog-size-closeButton-size: var(--fsds-core-spacing-size-08, 32px);
      --fsds-dialog-elevation-default: var(--fsds-semantic-elevation-surface-floating, 0 8px 32px rgba(0,0,0,0.16));
      --fsds-dialog-spacing-header-paddingTop: var(--fsds-core-spacing-size-06, 16px);
      --fsds-dialog-spacing-body-paddingRight: var(--fsds-core-spacing-size-07, 24px);
      --fsds-dialog-spacing-footer-gap: var(--fsds-core-spacing-size-03, 4px);
      --fsds-dialog-typography-title-fontSize: var(--fsds-semantic-typography-heading-04, 18px);
      --fsds-dialog-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-dialog-typography-title-lineHeight: var(--fsds-semantic-typography-line-height-heading, 1);
      --fsds-dialog-color-background-hover: var(--fsds-semantic-color-background-hover, #cecece);
    }
    
    .dialog {
      background-color: var(--fsds-dialog-color-background-backdrop);
      color: var(--fsds-dialog-color-foreground-secondary);
      border-color: var(--fsds-dialog-color-border-default);
      border-radius: var(--fsds-dialog-size-radius-default);
      padding: var(--fsds-dialog-spacing-body-paddingRight);
      gap: var(--fsds-dialog-spacing-footer-gap);
      line-height: var(--fsds-dialog-typography-title-lineHeight);
    
      &:hover {
        background-color: var(--fsds-dialog-color-background-hover);
      }
    }
  `;

  override render() {
    return html`<fsds-stack as="footer" variant="horizontal" class="dialog__footer"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-dialog-footer', DialogFooterElement);
// @generated:end

// @custom:start trailing

// @custom:end