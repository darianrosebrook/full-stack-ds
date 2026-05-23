// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { DetailsBehavior } from './DetailsBehavior.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type DetailsVariant = "default" | "inline" | "compact";
export type DetailsIcon = "left" | "right" | "none";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class DetailsElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .details {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-details-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-details-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-details-size-icon: var(--fsds-core-spacing-size-05, 12px);
      --fsds-details-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-details-color-background-hover: var(--fsds-semantic-color-background-hover, #cecece);
      --fsds-details-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-details-color-border-default: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-details-color-border-hover: var(--fsds-semantic-color-border-bold, #8f8f8f);
      --fsds-details-focus-ring-width: var(--fsds-core-shape-border-width-thick, 2px);
      --fsds-details-focus-ring-color: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-details-focus-ring-offset: var(--fsds-core-spacing-size-02, 2px);
      --fsds-details-spacing-gap-default: var(--fsds-core-spacing-size-02, 2px);
      --fsds-details-typography-lineHeight-body: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-details-typography-fontWeight-medium: var(--fsds-semantic-typography-font-weight-medium, 500);
    }
    
    .details__summary:hover {
      --fsds-details-color-background-default: var(--fsds-semantic-color-background-hover, #cecece);
    }
    
    .details {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-details-spacing-gap-default);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      padding: var(--fsds-details-size-padding-default);
      border-radius: var(--fsds-details-size-radius-default);
      background-color: var(--fsds-details-color-background-default);
      line-height: var(--fsds-details-typography-lineHeight-body);
      display: block;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
    
      &:hover {
        background-color: var(--fsds-details-color-background-hover);
        border-color: var(--fsds-details-color-border-hover);
      }
    
      &[open] .details__icon {
        transform: rotate(180deg);
      }
    }
    
    .details__summary {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: var(--fsds-details-spacing-gap-default);
      list-style: none;
      padding: var(--fsds-details-size-padding-default);
      color: var(--fsds-details-color-foreground-primary);
      font-weight: var(--fsds-details-typography-fontWeight-medium);
    }
    
    .details__summary:focus-visible {
      outline-width: var(--fsds-details-focus-ring-width);
      outline-color: var(--fsds-details-focus-ring-color);
      outline-offset: var(--fsds-details-focus-ring-offset);
      outline-style: solid;
    }
    
    .details__summaryContent {
      display: flex;
      align-items: center;
      gap: var(--fsds-details-spacing-gap-default);
      flex: 1 1 auto;
    }
    
    .details__summaryText {
      flex: 1 1 auto;
      color: var(--fsds-details-color-foreground-primary);
    }
    
    .details__icon {
      display: inline-flex;
      flex-shrink: 0;
      width: var(--fsds-details-size-icon);
      height: var(--fsds-details-size-icon);
      transition: transform 200ms ease;
      align-items: center;
      justify-content: center;
    }
    
    .details__content {
      display: block;
      padding: var(--fsds-details-size-padding-default);
      color: var(--fsds-details-color-foreground-primary);
      line-height: var(--fsds-details-typography-lineHeight-body);
    }
  `;

  @property({ type: String }) summary!: string;
  @property({ type: Boolean }) open?: boolean;
  @property({ type: Boolean }) defaultOpen?: boolean;
  @property({ attribute: false }) onOpenChange?: (open: boolean) => void;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: String }) variant?: DetailsVariant;
  @property({ type: String }) icon?: DetailsIcon;

  private behavior = new DetailsBehavior(this, {
    open: () => this.open,
    defaultOpen: this.defaultOpen,
    onOpenChange: (v) => this.onOpenChange?.(v),
  });

  private computeClasses(): string {
    return [
      "details",
      this.variant ? `details--${this.variant}` : null,
      this.icon ? `details--${this.icon}` : null,
      this.behavior.open ? "details--open" : null,
      this.disabled ? "details--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<details class="${this.computeClasses()}" role="group" ?open=${this.behavior.open}>
  <summary class=${'details__summary'}>
    <span class=${'details__summaryContent'}>
      <span class=${'details__icon'}></span>
      <span class=${'details__summaryText'}>${this.summary}</span>
    </span>
  </summary>
  ${this.behavior.open ? html`
  <div class=${'details__content'} data-fsds-channel-renders="open">
    <slot></slot>
  </div>
  ` : nothing}
</details>`;
  }
}

customElements.define('fsds-details', DetailsElement);

export class DetailsContentElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .details {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-details-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-details-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-details-size-icon: var(--fsds-core-spacing-size-05, 12px);
      --fsds-details-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-details-color-background-hover: var(--fsds-semantic-color-background-hover, #cecece);
      --fsds-details-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-details-color-border-default: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-details-color-border-hover: var(--fsds-semantic-color-border-bold, #8f8f8f);
      --fsds-details-focus-ring-width: var(--fsds-core-shape-border-width-thick, 2px);
      --fsds-details-focus-ring-color: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-details-focus-ring-offset: var(--fsds-core-spacing-size-02, 2px);
      --fsds-details-spacing-gap-default: var(--fsds-core-spacing-size-02, 2px);
      --fsds-details-typography-lineHeight-body: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-details-typography-fontWeight-medium: var(--fsds-semantic-typography-font-weight-medium, 500);
    }
    
    .details__summary:hover {
      --fsds-details-color-background-default: var(--fsds-semantic-color-background-hover, #cecece);
    }
    
    .details {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-details-spacing-gap-default);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      padding: var(--fsds-details-size-padding-default);
      border-radius: var(--fsds-details-size-radius-default);
      background-color: var(--fsds-details-color-background-default);
      line-height: var(--fsds-details-typography-lineHeight-body);
      display: block;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
    
      &:hover {
        background-color: var(--fsds-details-color-background-hover);
        border-color: var(--fsds-details-color-border-hover);
      }
    
      &[open] .details__icon {
        transform: rotate(180deg);
      }
    }
    
    .details__summary {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: var(--fsds-details-spacing-gap-default);
      list-style: none;
      padding: var(--fsds-details-size-padding-default);
      color: var(--fsds-details-color-foreground-primary);
      font-weight: var(--fsds-details-typography-fontWeight-medium);
    }
    
    .details__summary:focus-visible {
      outline-width: var(--fsds-details-focus-ring-width);
      outline-color: var(--fsds-details-focus-ring-color);
      outline-offset: var(--fsds-details-focus-ring-offset);
      outline-style: solid;
    }
    
    .details__summaryContent {
      display: flex;
      align-items: center;
      gap: var(--fsds-details-spacing-gap-default);
      flex: 1 1 auto;
    }
    
    .details__summaryText {
      flex: 1 1 auto;
      color: var(--fsds-details-color-foreground-primary);
    }
    
    .details__icon {
      display: inline-flex;
      flex-shrink: 0;
      width: var(--fsds-details-size-icon);
      height: var(--fsds-details-size-icon);
      transition: transform 200ms ease;
      align-items: center;
      justify-content: center;
    }
    
    .details__content {
      display: block;
      padding: var(--fsds-details-size-padding-default);
      color: var(--fsds-details-color-foreground-primary);
      line-height: var(--fsds-details-typography-lineHeight-body);
    }
  `;

  override render() {
    return html`<fsds-stack class="details__content"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-details-content', DetailsContentElement);
// @generated:end

// @custom:start trailing

// @custom:end