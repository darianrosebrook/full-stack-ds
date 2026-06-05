// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ChipType = "button" | "submit" | "reset";
export type ChipVariant = "default" | "selected" | "dismissible";
export type ChipSize = "small" | "medium" | "large";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class ChipElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .chip {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: var(--fsds-semantic-display-size-gap, 4px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-chip-color-background-default: var(--fsds-semantic-color-action-background-secondary-default, #fafafa);
      --fsds-chip-color-background-hover: var(--fsds-semantic-color-action-background-secondary-hover, #efefef);
      --fsds-chip-color-background-active: var(--fsds-semantic-color-action-background-secondary-active, #cecece);
      --fsds-chip-color-foreground-default: var(--fsds-semantic-color-action-foreground-secondary-default, #141414);
      --fsds-chip-color-border-default: var(--fsds-semantic-color-action-border-secondary-default, #aeaeae);
      --fsds-chip-size-padding-horizontal: var(--fsds-core-spacing-size-04, 8px);
      --fsds-chip-size-padding-vertical: var(--fsds-core-spacing-size-02, 2px);
      --fsds-chip-size-gap: var(--fsds-core-spacing-size-02, 2px);
      --fsds-chip-size-radius: var(--fsds-core-shape-radius-full, 9999px);
      --fsds-chip-size-border: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-chip-text-size: var(--fsds-semantic-typography-body-04, 12px);
      --fsds-chip-text-weight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-chip-motion-duration-fast: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-chip-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-chip-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0a65fe);
      --fsds-chip-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-chip-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }
    
    .chip {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-chip-size-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      background-color: var(--fsds-chip-color-background-default);
      color: var(--fsds-chip-color-foreground-default);
      border-color: var(--fsds-chip-color-border-default);
      padding-block: var(--fsds-chip-size-padding-vertical);
      padding-inline: var(--fsds-chip-size-padding-horizontal);
      border-radius: var(--fsds-chip-size-radius);
      font-size: var(--fsds-chip-text-size);
      font-weight: var(--fsds-chip-text-weight);
      transition-duration: var(--fsds-chip-motion-duration-fast);
    
      &:hover {
        background-color: var(--fsds-chip-color-background-hover);
      }
    
      &:active {
        background-color: var(--fsds-chip-color-background-active);
      }
    
      &:focus-visible {
        outline-width: var(--fsds-chip-focus-ring-width);
        outline-color: var(--fsds-chip-focus-ring-color);
        outline-style: var(--fsds-chip-focus-ring-style);
        outline-offset: var(--fsds-chip-focus-ring-offset);
      }
    }
    
    .chip__icon {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      width: 1em;
      height: 1em;
      margin-inline-end: 2px;
    }
    
    .chip__text {
      display: inline-block;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      font-size: var(--fsds-chip-text-size);
      font-weight: var(--fsds-chip-text-weight);
    }
  `;

  @property({ type: String }) type?: ChipType;
  @property({ type: String }) variant?: ChipVariant;
  @property({ type: String }) size?: ChipSize;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ attribute: false }) icon?: unknown;
  @property({ attribute: 'aria-label', reflect: true })
  override ariaLabel: string | null = null;
  @property({ attribute: 'aria-expanded', reflect: true })
  override ariaExpanded: string | null = null;
  @property({ attribute: 'aria-pressed', reflect: true })
  override ariaPressed: string | null = null;

  private computeClasses(): string {
    return [
      "chip",
      this.variant ? `chip--${this.variant}` : null,
      this.size ? `chip--${this.size}` : null,
      this.disabled ? "chip--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<button class="${this.computeClasses()}" type=${ifDefined(this.type)} ?disabled=${this.disabled ?? false} aria-label=${ifDefined(this.ariaLabel ?? undefined)} aria-expanded=${ifDefined(this.ariaExpanded === undefined ? undefined : (this.ariaExpanded ? 'true' : 'false'))} aria-pressed=${ifDefined(this.ariaPressed === undefined ? undefined : (this.ariaPressed ? 'true' : 'false'))}>
  ${this.icon ? html`
  <span class=${'chip__icon'} aria-hidden="true"></span>
  ` : nothing}
  <span class=${'chip__text'}>
    <slot></slot>
  </span>
</button>`;
  }
}

customElements.define('fsds-chip', ChipElement);
// @generated:end

// @custom:start trailing

// @custom:end