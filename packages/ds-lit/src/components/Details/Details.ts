// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import '../Icon/Icon.js';
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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 16px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-details-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-details-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-details-size-icon: var(--fsds-core-spacing-size-05, 12px);
      --fsds-details-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-details-color-background-hover: var(--fsds-semantic-color-background-hover, #f7f7f7);
      --fsds-details-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-details-color-border-default: var(--fsds-semantic-color-border-primary, #a0a0a1);
      --fsds-details-color-border-hover: var(--fsds-semantic-color-border-bold, #888889);
      --fsds-details-focus-ring-width: var(--fsds-semantic-shape-control-border-focus-width, 2px);
      --fsds-details-focus-ring-color: var(--fsds-semantic-color-border-accent, #d92d2e);
      --fsds-details-focus-ring-offset: var(--fsds-core-spacing-size-02, 2px);
      --fsds-details-spacing-gap-default: var(--fsds-core-spacing-size-02, 2px);
      --fsds-details-typography-line-height-body: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-details-typography-font-weight-medium: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-details-size-padding-compact: var(--fsds-core-spacing-size-04, 8px);
      --fsds-details-size-padding-page: var(--fsds-core-spacing-size-07, 24px);
      --fsds-details-typography-font-size-body: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-details-typography-font-size-compact: var(--fsds-semantic-typography-body-04, 12px);
    }

    .details__summary:hover:not([aria-disabled="true"]) {
      --fsds-details-color-background-default: var(--fsds-semantic-color-background-hover, #f7f7f7);
    }

    .details--compact {
      --fsds-details-size-padding-default: var(--fsds-details-size-padding-compact, 8px);
      --fsds-details-typography-line-height-body: var(--fsds-core-spacing-size-06, 16px);
    }

    .details--inline {
      --fsds-details-size-padding-default: var(--fsds-core-spacing-size-07, 24px);
      --fsds-details-color-background-default: var(--fsds-semantic-color-background-secondary, #f7f7f7);
      --fsds-details-color-border-default: var(--fsds-semantic-color-border-subtle, #d0d0d0);
    }

    .details {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-details-spacing-gap-default, 2px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      padding: var(--fsds-details-size-padding-default, 16px);
      border-radius: var(--fsds-details-size-radius-default, 6px);
      background-color: var(--fsds-details-color-background-default, #ffffff);
      line-height: var(--fsds-details-typography-line-height-body, 1.5);
      display: block;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
      border-color: var(--fsds-details-color-border-default, #a0a0a1);
      color: var(--fsds-details-color-foreground-primary, #141414);

      &:hover:not([aria-disabled="true"]) {
        background-color: var(--fsds-details-color-background-hover, #f7f7f7);
        border-color: var(--fsds-details-color-border-hover, #888889);
      }

      &[open] .details__icon {
        transform: rotate(180deg);
      }
    }

    .details__summary {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: var(--fsds-details-spacing-gap-default, 2px);
      list-style: none;
      padding: var(--fsds-details-size-padding-default, 16px);
      color: var(--fsds-details-color-foreground-primary, #141414);
      font-weight: var(--fsds-details-typography-font-weight-medium, 500);
    }

    .details__summary:focus-visible:not([aria-disabled="true"]) {
      outline-width: var(--fsds-details-focus-ring-width, 2px);
      outline-color: var(--fsds-details-focus-ring-color, #d92d2e);
      outline-offset: var(--fsds-details-focus-ring-offset, 2px);
      outline-style: solid;
    }

    .details__summaryContent {
      display: flex;
      align-items: center;
      gap: var(--fsds-details-spacing-gap-default, 2px);
      flex: 1 1 auto;
    }

    .details__summaryText {
      flex: 1 1 auto;
      color: var(--fsds-details-color-foreground-primary, #141414);
    }

    .details__icon {
      display: inline-flex;
      flex-shrink: 0;
      width: var(--fsds-details-size-icon, 12px);
      height: var(--fsds-details-size-icon, 12px);
      transition: transform 200ms ease;
      align-items: center;
      justify-content: center;
    }

    .details__content {
      display: block;
      padding: var(--fsds-details-size-padding-default, 16px);
      color: var(--fsds-details-color-foreground-primary, #141414);
      line-height: var(--fsds-details-typography-line-height-body, 1.5);
    }

    .details--none .details__icon {
      display: none;
    }

    .details--right .details__icon {
      order: 1;
      margin-inline-start: auto;
    }
  `;

  @property({ type: String }) summary!: string;
  @property({ type: Boolean }) open?: boolean;
  @property({ type: Boolean }) defaultOpen?: boolean;
  @property({ attribute: false }) onOpenChange?: (open: boolean) => void;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: String }) variant?: DetailsVariant = "default";
  @property({ type: String }) icon?: DetailsIcon = "left";

  private behavior = new DetailsBehavior(this, {
    open: () => this.open,
    defaultOpen: this.defaultOpen,
    onOpenChange: (v) => this.onOpenChange?.(v),
  });

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "details");
  }

  private computeClasses(): string {
    return [
      "details",
      (this.variant ?? "default") ? `details--${(this.variant ?? "default")}` : null,
      (this.icon ?? "left") ? `details--${(this.icon ?? "left")}` : null,
      this.behavior.open ? "details--open" : null,
      this.disabled ? "details--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<details class="${this.computeClasses()}" role="group" ?open=${this.behavior.open}>
  <summary class=${'details__summary'} aria-controls=${ifDefined([this.open ? 'details-content' : null].filter(Boolean).join(' ') || undefined)}>
    <span class=${'details__summaryContent'}>
      <fsds-icon class=${'details__icon'} name="chevron-down" size="sm"></fsds-icon>
      <span class=${'details__summaryText'}>${this.summary}</span>
    </span>
  </summary>
  ${this.behavior.open ? html`
  <div class=${'details__content'} id="details-content" data-fsds-channel-renders="open">
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
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 16px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-details-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-details-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-details-size-icon: var(--fsds-core-spacing-size-05, 12px);
      --fsds-details-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-details-color-background-hover: var(--fsds-semantic-color-background-hover, #f7f7f7);
      --fsds-details-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-details-color-border-default: var(--fsds-semantic-color-border-primary, #a0a0a1);
      --fsds-details-color-border-hover: var(--fsds-semantic-color-border-bold, #888889);
      --fsds-details-focus-ring-width: var(--fsds-semantic-shape-control-border-focus-width, 2px);
      --fsds-details-focus-ring-color: var(--fsds-semantic-color-border-accent, #d92d2e);
      --fsds-details-focus-ring-offset: var(--fsds-core-spacing-size-02, 2px);
      --fsds-details-spacing-gap-default: var(--fsds-core-spacing-size-02, 2px);
      --fsds-details-typography-line-height-body: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-details-typography-font-weight-medium: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-details-size-padding-compact: var(--fsds-core-spacing-size-04, 8px);
      --fsds-details-size-padding-page: var(--fsds-core-spacing-size-07, 24px);
      --fsds-details-typography-font-size-body: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-details-typography-font-size-compact: var(--fsds-semantic-typography-body-04, 12px);
    }

    .details__summary:hover:not([aria-disabled="true"]) {
      --fsds-details-color-background-default: var(--fsds-semantic-color-background-hover, #f7f7f7);
    }

    .details--compact {
      --fsds-details-size-padding-default: var(--fsds-details-size-padding-compact, 8px);
      --fsds-details-typography-line-height-body: var(--fsds-core-spacing-size-06, 16px);
    }

    .details--inline {
      --fsds-details-size-padding-default: var(--fsds-core-spacing-size-07, 24px);
      --fsds-details-color-background-default: var(--fsds-semantic-color-background-secondary, #f7f7f7);
      --fsds-details-color-border-default: var(--fsds-semantic-color-border-subtle, #d0d0d0);
    }

    .details {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-details-spacing-gap-default, 2px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      padding: var(--fsds-details-size-padding-default, 16px);
      border-radius: var(--fsds-details-size-radius-default, 6px);
      background-color: var(--fsds-details-color-background-default, #ffffff);
      line-height: var(--fsds-details-typography-line-height-body, 1.5);
      display: block;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
      border-color: var(--fsds-details-color-border-default, #a0a0a1);
      color: var(--fsds-details-color-foreground-primary, #141414);

      &:hover:not([aria-disabled="true"]) {
        background-color: var(--fsds-details-color-background-hover, #f7f7f7);
        border-color: var(--fsds-details-color-border-hover, #888889);
      }

      &[open] .details__icon {
        transform: rotate(180deg);
      }
    }

    .details__summary {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: var(--fsds-details-spacing-gap-default, 2px);
      list-style: none;
      padding: var(--fsds-details-size-padding-default, 16px);
      color: var(--fsds-details-color-foreground-primary, #141414);
      font-weight: var(--fsds-details-typography-font-weight-medium, 500);
    }

    .details__summary:focus-visible:not([aria-disabled="true"]) {
      outline-width: var(--fsds-details-focus-ring-width, 2px);
      outline-color: var(--fsds-details-focus-ring-color, #d92d2e);
      outline-offset: var(--fsds-details-focus-ring-offset, 2px);
      outline-style: solid;
    }

    .details__summaryContent {
      display: flex;
      align-items: center;
      gap: var(--fsds-details-spacing-gap-default, 2px);
      flex: 1 1 auto;
    }

    .details__summaryText {
      flex: 1 1 auto;
      color: var(--fsds-details-color-foreground-primary, #141414);
    }

    .details__icon {
      display: inline-flex;
      flex-shrink: 0;
      width: var(--fsds-details-size-icon, 12px);
      height: var(--fsds-details-size-icon, 12px);
      transition: transform 200ms ease;
      align-items: center;
      justify-content: center;
    }

    .details__content {
      display: block;
      padding: var(--fsds-details-size-padding-default, 16px);
      color: var(--fsds-details-color-foreground-primary, #141414);
      line-height: var(--fsds-details-typography-line-height-body, 1.5);
    }

    .details--none .details__icon {
      display: none;
    }

    .details--right .details__icon {
      order: 1;
      margin-inline-start: auto;
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