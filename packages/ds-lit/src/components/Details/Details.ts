// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { DetailsBehavior } from './DetailsBehavior.js';
import { ifDefined } from 'lit/directives/if-defined.js';
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
      --fsds-details-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-details-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-details-size-icon: var(--fsds-core-spacing-size-05, 12px);
      --fsds-details-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-details-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-details-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-details-color-border-default: var(--fsds-semantic-color-border-primary, #f29495);
      --fsds-details-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-details-focus-ring-width: var(--fsds-core-shape-border-width-thick, 2px);
      --fsds-details-focus-ring-color: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-details-focus-ring-offset: var(--fsds-core-spacing-size-02, 2px);
      --fsds-details-spacing-gap-default: var(--fsds-core-spacing-size-02, 2px);
      --fsds-details-typography-lineHeight-body: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-details-typography-fontWeight-medium: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-details-color-background-hover: var(--fsds-semantic-color-background-hover, #cecece);
      --fsds-details-color-border-hover: var(--fsds-semantic-color-border-bold, #8f8f8f);
    }
    
    .details {
      padding: var(--fsds-details-size-padding-default);
      border-radius: var(--fsds-details-size-radius-default);
      background-color: var(--fsds-details-color-background-default);
      color: var(--fsds-details-color-foreground-secondary);
      border-color: var(--fsds-details-color-border-accent);
      gap: var(--fsds-details-spacing-gap-default);
      line-height: var(--fsds-details-typography-lineHeight-body);
    
      &:hover {
        background-color: var(--fsds-details-color-background-hover);
        border-color: var(--fsds-details-color-border-hover);
      }
    }
  `;

  @property({ type: String }) summary!: string;
  @property({ type: Boolean }) open?: boolean;
  @property({ type: Boolean }) defaultOpen?: boolean;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ attribute: false }) variant?: DetailsVariant;
  @property({ attribute: false }) icon?: DetailsIcon;
  @property({ attribute: false }) onOpenChange?: (value: boolean) => void;

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
      <span class=${'details__summaryText'} textContent=${ifDefined(this.summary)}></span>
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
      --fsds-details-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-details-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-details-size-icon: var(--fsds-core-spacing-size-05, 12px);
      --fsds-details-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-details-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-details-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-details-color-border-default: var(--fsds-semantic-color-border-primary, #f29495);
      --fsds-details-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-details-focus-ring-width: var(--fsds-core-shape-border-width-thick, 2px);
      --fsds-details-focus-ring-color: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-details-focus-ring-offset: var(--fsds-core-spacing-size-02, 2px);
      --fsds-details-spacing-gap-default: var(--fsds-core-spacing-size-02, 2px);
      --fsds-details-typography-lineHeight-body: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-details-typography-fontWeight-medium: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-details-color-background-hover: var(--fsds-semantic-color-background-hover, #cecece);
      --fsds-details-color-border-hover: var(--fsds-semantic-color-border-bold, #8f8f8f);
    }
    
    .details {
      padding: var(--fsds-details-size-padding-default);
      border-radius: var(--fsds-details-size-radius-default);
      background-color: var(--fsds-details-color-background-default);
      color: var(--fsds-details-color-foreground-secondary);
      border-color: var(--fsds-details-color-border-accent);
      gap: var(--fsds-details-spacing-gap-default);
      line-height: var(--fsds-details-typography-lineHeight-body);
    
      &:hover {
        background-color: var(--fsds-details-color-background-hover);
        border-color: var(--fsds-details-color-border-hover);
      }
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