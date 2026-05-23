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
    
    .dialog__backdrop {
      position: absolute;
      inset: 0;
      background-color: var(--fsds-dialog-color-background-backdrop);
      pointer-events: auto;
    }
    
    .dialog__modal {
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: var(--fsds-dialog-color-background-default);
      color: var(--fsds-dialog-color-foreground-default);
      border-color: var(--fsds-dialog-color-border-default);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-dialog-size-radius-default);
      box-shadow: var(--fsds-dialog-elevation-default);
      width: var(--fsds-dialog-size-md-width);
      max-width: var(--fsds-dialog-size-md-maxWidth);
      max-height: 90vh;
      pointer-events: auto;
      box-sizing: border-box;
      overflow: hidden;
    }
    
    .dialog__header {
      display: flex;
      align-items: center;
      padding-top: var(--fsds-dialog-spacing-header-paddingTop);
      padding-right: var(--fsds-dialog-spacing-body-paddingRight);
      padding-bottom: var(--fsds-dialog-spacing-header-paddingTop);
      padding-left: var(--fsds-dialog-spacing-body-paddingRight);
      border-bottom-color: var(--fsds-dialog-color-border-default);
      border-bottom-style: solid;
      border-bottom-width: 1px;
    }
    
    .dialog__title {
      margin: 0;
      font-size: var(--fsds-dialog-typography-title-fontSize);
      font-weight: var(--fsds-dialog-typography-title-fontWeight);
      line-height: var(--fsds-dialog-typography-title-lineHeight);
      color: var(--fsds-dialog-color-foreground-default);
    }
    
    .dialog__body {
      flex: 1 1 auto;
      padding-top: var(--fsds-dialog-spacing-header-paddingTop);
      padding-right: var(--fsds-dialog-spacing-body-paddingRight);
      padding-bottom: var(--fsds-dialog-spacing-header-paddingTop);
      padding-left: var(--fsds-dialog-spacing-body-paddingRight);
      color: var(--fsds-dialog-color-foreground-secondary);
      overflow-y: auto;
    }
    
    .dialog__footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: var(--fsds-dialog-spacing-footer-gap);
      padding-top: var(--fsds-dialog-spacing-header-paddingTop);
      padding-right: var(--fsds-dialog-spacing-body-paddingRight);
      padding-bottom: var(--fsds-dialog-spacing-header-paddingTop);
      padding-left: var(--fsds-dialog-spacing-body-paddingRight);
      border-top-color: var(--fsds-dialog-color-border-default);
      border-top-style: solid;
      border-top-width: 1px;
    }
    
    .dialog__closeButton {
      position: absolute;
      top: var(--fsds-dialog-spacing-header-paddingTop);
      right: var(--fsds-dialog-spacing-body-paddingRight);
      width: var(--fsds-dialog-size-closeButton-size);
      height: var(--fsds-dialog-size-closeButton-size);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      border: 0;
      border-radius: 9999px;
      color: var(--fsds-dialog-color-foreground-secondary);
      cursor: pointer;
    }
    
    .dialog__closeButton:hover {
      background-color: var(--fsds-dialog-color-background-hover);
    }
    
    .dialog--sm .dialog__modal {
      width: var(--fsds-dialog-size-sm-width);
      max-width: var(--fsds-dialog-size-sm-maxWidth);
    }
    
    .dialog--lg .dialog__modal {
      width: var(--fsds-dialog-size-lg-width);
      max-width: var(--fsds-dialog-size-lg-maxWidth);
    }
    
    .dialog--xl .dialog__modal {
      width: var(--fsds-dialog-size-xl-width);
      max-width: var(--fsds-dialog-size-xl-maxWidth);
    }
    
    .dialog--full .dialog__modal {
      width: var(--fsds-dialog-size-full-width);
      height: var(--fsds-dialog-size-full-height);
      max-width: 100vw;
      max-height: 100vh;
      border-radius: 0;
    }
  `;

  @property({ type: Boolean }) open?: boolean;
  @property({ type: Boolean }) defaultOpen?: boolean;
  @property({ attribute: false }) onOpenChange?: (open: boolean) => void;
  @property({ type: Boolean }) modal?: boolean = true;
  @property({ type: String }) size?: DialogSize = "md";
  @property({ type: Boolean }) dismissible?: boolean = true;
  @property({ type: Boolean }) closeOnEscape?: boolean = true;
  @property({ type: Boolean }) closeOnBackdropClick?: boolean = true;
  @property({ type: String }) initialFocus?: string;
  @property({ type: String }) returnFocus?: string;

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
    
    .dialog__backdrop {
      position: absolute;
      inset: 0;
      background-color: var(--fsds-dialog-color-background-backdrop);
      pointer-events: auto;
    }
    
    .dialog__modal {
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: var(--fsds-dialog-color-background-default);
      color: var(--fsds-dialog-color-foreground-default);
      border-color: var(--fsds-dialog-color-border-default);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-dialog-size-radius-default);
      box-shadow: var(--fsds-dialog-elevation-default);
      width: var(--fsds-dialog-size-md-width);
      max-width: var(--fsds-dialog-size-md-maxWidth);
      max-height: 90vh;
      pointer-events: auto;
      box-sizing: border-box;
      overflow: hidden;
    }
    
    .dialog__header {
      display: flex;
      align-items: center;
      padding-top: var(--fsds-dialog-spacing-header-paddingTop);
      padding-right: var(--fsds-dialog-spacing-body-paddingRight);
      padding-bottom: var(--fsds-dialog-spacing-header-paddingTop);
      padding-left: var(--fsds-dialog-spacing-body-paddingRight);
      border-bottom-color: var(--fsds-dialog-color-border-default);
      border-bottom-style: solid;
      border-bottom-width: 1px;
    }
    
    .dialog__title {
      margin: 0;
      font-size: var(--fsds-dialog-typography-title-fontSize);
      font-weight: var(--fsds-dialog-typography-title-fontWeight);
      line-height: var(--fsds-dialog-typography-title-lineHeight);
      color: var(--fsds-dialog-color-foreground-default);
    }
    
    .dialog__body {
      flex: 1 1 auto;
      padding-top: var(--fsds-dialog-spacing-header-paddingTop);
      padding-right: var(--fsds-dialog-spacing-body-paddingRight);
      padding-bottom: var(--fsds-dialog-spacing-header-paddingTop);
      padding-left: var(--fsds-dialog-spacing-body-paddingRight);
      color: var(--fsds-dialog-color-foreground-secondary);
      overflow-y: auto;
    }
    
    .dialog__footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: var(--fsds-dialog-spacing-footer-gap);
      padding-top: var(--fsds-dialog-spacing-header-paddingTop);
      padding-right: var(--fsds-dialog-spacing-body-paddingRight);
      padding-bottom: var(--fsds-dialog-spacing-header-paddingTop);
      padding-left: var(--fsds-dialog-spacing-body-paddingRight);
      border-top-color: var(--fsds-dialog-color-border-default);
      border-top-style: solid;
      border-top-width: 1px;
    }
    
    .dialog__closeButton {
      position: absolute;
      top: var(--fsds-dialog-spacing-header-paddingTop);
      right: var(--fsds-dialog-spacing-body-paddingRight);
      width: var(--fsds-dialog-size-closeButton-size);
      height: var(--fsds-dialog-size-closeButton-size);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      border: 0;
      border-radius: 9999px;
      color: var(--fsds-dialog-color-foreground-secondary);
      cursor: pointer;
    }
    
    .dialog__closeButton:hover {
      background-color: var(--fsds-dialog-color-background-hover);
    }
    
    .dialog--sm .dialog__modal {
      width: var(--fsds-dialog-size-sm-width);
      max-width: var(--fsds-dialog-size-sm-maxWidth);
    }
    
    .dialog--lg .dialog__modal {
      width: var(--fsds-dialog-size-lg-width);
      max-width: var(--fsds-dialog-size-lg-maxWidth);
    }
    
    .dialog--xl .dialog__modal {
      width: var(--fsds-dialog-size-xl-width);
      max-width: var(--fsds-dialog-size-xl-maxWidth);
    }
    
    .dialog--full .dialog__modal {
      width: var(--fsds-dialog-size-full-width);
      height: var(--fsds-dialog-size-full-height);
      max-width: 100vw;
      max-height: 100vh;
      border-radius: 0;
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
    
    .dialog__backdrop {
      position: absolute;
      inset: 0;
      background-color: var(--fsds-dialog-color-background-backdrop);
      pointer-events: auto;
    }
    
    .dialog__modal {
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: var(--fsds-dialog-color-background-default);
      color: var(--fsds-dialog-color-foreground-default);
      border-color: var(--fsds-dialog-color-border-default);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-dialog-size-radius-default);
      box-shadow: var(--fsds-dialog-elevation-default);
      width: var(--fsds-dialog-size-md-width);
      max-width: var(--fsds-dialog-size-md-maxWidth);
      max-height: 90vh;
      pointer-events: auto;
      box-sizing: border-box;
      overflow: hidden;
    }
    
    .dialog__header {
      display: flex;
      align-items: center;
      padding-top: var(--fsds-dialog-spacing-header-paddingTop);
      padding-right: var(--fsds-dialog-spacing-body-paddingRight);
      padding-bottom: var(--fsds-dialog-spacing-header-paddingTop);
      padding-left: var(--fsds-dialog-spacing-body-paddingRight);
      border-bottom-color: var(--fsds-dialog-color-border-default);
      border-bottom-style: solid;
      border-bottom-width: 1px;
    }
    
    .dialog__title {
      margin: 0;
      font-size: var(--fsds-dialog-typography-title-fontSize);
      font-weight: var(--fsds-dialog-typography-title-fontWeight);
      line-height: var(--fsds-dialog-typography-title-lineHeight);
      color: var(--fsds-dialog-color-foreground-default);
    }
    
    .dialog__body {
      flex: 1 1 auto;
      padding-top: var(--fsds-dialog-spacing-header-paddingTop);
      padding-right: var(--fsds-dialog-spacing-body-paddingRight);
      padding-bottom: var(--fsds-dialog-spacing-header-paddingTop);
      padding-left: var(--fsds-dialog-spacing-body-paddingRight);
      color: var(--fsds-dialog-color-foreground-secondary);
      overflow-y: auto;
    }
    
    .dialog__footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: var(--fsds-dialog-spacing-footer-gap);
      padding-top: var(--fsds-dialog-spacing-header-paddingTop);
      padding-right: var(--fsds-dialog-spacing-body-paddingRight);
      padding-bottom: var(--fsds-dialog-spacing-header-paddingTop);
      padding-left: var(--fsds-dialog-spacing-body-paddingRight);
      border-top-color: var(--fsds-dialog-color-border-default);
      border-top-style: solid;
      border-top-width: 1px;
    }
    
    .dialog__closeButton {
      position: absolute;
      top: var(--fsds-dialog-spacing-header-paddingTop);
      right: var(--fsds-dialog-spacing-body-paddingRight);
      width: var(--fsds-dialog-size-closeButton-size);
      height: var(--fsds-dialog-size-closeButton-size);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      border: 0;
      border-radius: 9999px;
      color: var(--fsds-dialog-color-foreground-secondary);
      cursor: pointer;
    }
    
    .dialog__closeButton:hover {
      background-color: var(--fsds-dialog-color-background-hover);
    }
    
    .dialog--sm .dialog__modal {
      width: var(--fsds-dialog-size-sm-width);
      max-width: var(--fsds-dialog-size-sm-maxWidth);
    }
    
    .dialog--lg .dialog__modal {
      width: var(--fsds-dialog-size-lg-width);
      max-width: var(--fsds-dialog-size-lg-maxWidth);
    }
    
    .dialog--xl .dialog__modal {
      width: var(--fsds-dialog-size-xl-width);
      max-width: var(--fsds-dialog-size-xl-maxWidth);
    }
    
    .dialog--full .dialog__modal {
      width: var(--fsds-dialog-size-full-width);
      height: var(--fsds-dialog-size-full-height);
      max-width: 100vw;
      max-height: 100vh;
      border-radius: 0;
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
    
    .dialog__backdrop {
      position: absolute;
      inset: 0;
      background-color: var(--fsds-dialog-color-background-backdrop);
      pointer-events: auto;
    }
    
    .dialog__modal {
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: var(--fsds-dialog-color-background-default);
      color: var(--fsds-dialog-color-foreground-default);
      border-color: var(--fsds-dialog-color-border-default);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-dialog-size-radius-default);
      box-shadow: var(--fsds-dialog-elevation-default);
      width: var(--fsds-dialog-size-md-width);
      max-width: var(--fsds-dialog-size-md-maxWidth);
      max-height: 90vh;
      pointer-events: auto;
      box-sizing: border-box;
      overflow: hidden;
    }
    
    .dialog__header {
      display: flex;
      align-items: center;
      padding-top: var(--fsds-dialog-spacing-header-paddingTop);
      padding-right: var(--fsds-dialog-spacing-body-paddingRight);
      padding-bottom: var(--fsds-dialog-spacing-header-paddingTop);
      padding-left: var(--fsds-dialog-spacing-body-paddingRight);
      border-bottom-color: var(--fsds-dialog-color-border-default);
      border-bottom-style: solid;
      border-bottom-width: 1px;
    }
    
    .dialog__title {
      margin: 0;
      font-size: var(--fsds-dialog-typography-title-fontSize);
      font-weight: var(--fsds-dialog-typography-title-fontWeight);
      line-height: var(--fsds-dialog-typography-title-lineHeight);
      color: var(--fsds-dialog-color-foreground-default);
    }
    
    .dialog__body {
      flex: 1 1 auto;
      padding-top: var(--fsds-dialog-spacing-header-paddingTop);
      padding-right: var(--fsds-dialog-spacing-body-paddingRight);
      padding-bottom: var(--fsds-dialog-spacing-header-paddingTop);
      padding-left: var(--fsds-dialog-spacing-body-paddingRight);
      color: var(--fsds-dialog-color-foreground-secondary);
      overflow-y: auto;
    }
    
    .dialog__footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: var(--fsds-dialog-spacing-footer-gap);
      padding-top: var(--fsds-dialog-spacing-header-paddingTop);
      padding-right: var(--fsds-dialog-spacing-body-paddingRight);
      padding-bottom: var(--fsds-dialog-spacing-header-paddingTop);
      padding-left: var(--fsds-dialog-spacing-body-paddingRight);
      border-top-color: var(--fsds-dialog-color-border-default);
      border-top-style: solid;
      border-top-width: 1px;
    }
    
    .dialog__closeButton {
      position: absolute;
      top: var(--fsds-dialog-spacing-header-paddingTop);
      right: var(--fsds-dialog-spacing-body-paddingRight);
      width: var(--fsds-dialog-size-closeButton-size);
      height: var(--fsds-dialog-size-closeButton-size);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      border: 0;
      border-radius: 9999px;
      color: var(--fsds-dialog-color-foreground-secondary);
      cursor: pointer;
    }
    
    .dialog__closeButton:hover {
      background-color: var(--fsds-dialog-color-background-hover);
    }
    
    .dialog--sm .dialog__modal {
      width: var(--fsds-dialog-size-sm-width);
      max-width: var(--fsds-dialog-size-sm-maxWidth);
    }
    
    .dialog--lg .dialog__modal {
      width: var(--fsds-dialog-size-lg-width);
      max-width: var(--fsds-dialog-size-lg-maxWidth);
    }
    
    .dialog--xl .dialog__modal {
      width: var(--fsds-dialog-size-xl-width);
      max-width: var(--fsds-dialog-size-xl-maxWidth);
    }
    
    .dialog--full .dialog__modal {
      width: var(--fsds-dialog-size-full-width);
      height: var(--fsds-dialog-size-full-height);
      max-width: 100vw;
      max-height: 100vh;
      border-radius: 0;
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
    
    .dialog__backdrop {
      position: absolute;
      inset: 0;
      background-color: var(--fsds-dialog-color-background-backdrop);
      pointer-events: auto;
    }
    
    .dialog__modal {
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: var(--fsds-dialog-color-background-default);
      color: var(--fsds-dialog-color-foreground-default);
      border-color: var(--fsds-dialog-color-border-default);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-dialog-size-radius-default);
      box-shadow: var(--fsds-dialog-elevation-default);
      width: var(--fsds-dialog-size-md-width);
      max-width: var(--fsds-dialog-size-md-maxWidth);
      max-height: 90vh;
      pointer-events: auto;
      box-sizing: border-box;
      overflow: hidden;
    }
    
    .dialog__header {
      display: flex;
      align-items: center;
      padding-top: var(--fsds-dialog-spacing-header-paddingTop);
      padding-right: var(--fsds-dialog-spacing-body-paddingRight);
      padding-bottom: var(--fsds-dialog-spacing-header-paddingTop);
      padding-left: var(--fsds-dialog-spacing-body-paddingRight);
      border-bottom-color: var(--fsds-dialog-color-border-default);
      border-bottom-style: solid;
      border-bottom-width: 1px;
    }
    
    .dialog__title {
      margin: 0;
      font-size: var(--fsds-dialog-typography-title-fontSize);
      font-weight: var(--fsds-dialog-typography-title-fontWeight);
      line-height: var(--fsds-dialog-typography-title-lineHeight);
      color: var(--fsds-dialog-color-foreground-default);
    }
    
    .dialog__body {
      flex: 1 1 auto;
      padding-top: var(--fsds-dialog-spacing-header-paddingTop);
      padding-right: var(--fsds-dialog-spacing-body-paddingRight);
      padding-bottom: var(--fsds-dialog-spacing-header-paddingTop);
      padding-left: var(--fsds-dialog-spacing-body-paddingRight);
      color: var(--fsds-dialog-color-foreground-secondary);
      overflow-y: auto;
    }
    
    .dialog__footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: var(--fsds-dialog-spacing-footer-gap);
      padding-top: var(--fsds-dialog-spacing-header-paddingTop);
      padding-right: var(--fsds-dialog-spacing-body-paddingRight);
      padding-bottom: var(--fsds-dialog-spacing-header-paddingTop);
      padding-left: var(--fsds-dialog-spacing-body-paddingRight);
      border-top-color: var(--fsds-dialog-color-border-default);
      border-top-style: solid;
      border-top-width: 1px;
    }
    
    .dialog__closeButton {
      position: absolute;
      top: var(--fsds-dialog-spacing-header-paddingTop);
      right: var(--fsds-dialog-spacing-body-paddingRight);
      width: var(--fsds-dialog-size-closeButton-size);
      height: var(--fsds-dialog-size-closeButton-size);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      border: 0;
      border-radius: 9999px;
      color: var(--fsds-dialog-color-foreground-secondary);
      cursor: pointer;
    }
    
    .dialog__closeButton:hover {
      background-color: var(--fsds-dialog-color-background-hover);
    }
    
    .dialog--sm .dialog__modal {
      width: var(--fsds-dialog-size-sm-width);
      max-width: var(--fsds-dialog-size-sm-maxWidth);
    }
    
    .dialog--lg .dialog__modal {
      width: var(--fsds-dialog-size-lg-width);
      max-width: var(--fsds-dialog-size-lg-maxWidth);
    }
    
    .dialog--xl .dialog__modal {
      width: var(--fsds-dialog-size-xl-width);
      max-width: var(--fsds-dialog-size-xl-maxWidth);
    }
    
    .dialog--full .dialog__modal {
      width: var(--fsds-dialog-size-full-width);
      height: var(--fsds-dialog-size-full-height);
      max-width: 100vw;
      max-height: 100vh;
      border-radius: 0;
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