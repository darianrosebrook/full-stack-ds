// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ButtonSize = "small" | "medium" | "large";
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost" | "destructive" | "outline";
export type ButtonType = "button" | "submit" | "reset";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class ButtonElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .button {
      --fsds-button-color-background-default: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
      --fsds-button-color-foreground-default: var(--fsds-semantic-color-foreground-inverse, #fafafa);
      --fsds-button-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-button-size-gap-default: var(--fsds-core-spacing-size-04, 8px);
      --fsds-button-size-radius: var(--fsds-core-shape-radius-full, 9999px);
      --fsds-button-size-border: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-button-text-weight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-button-motion-duration-fast: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-button-motion-easing-standard: var(--fsds-core-motion-easing-standard, cubic-bezier(0.4, 0, 0.2, 1));
      --fsds-button-color-background-hover: var(--fsds-semantic-interaction-background-hover, #efefef);
      --fsds-button-color-border-hover: var(--fsds-semantic-interaction-border-hover, #8f8f8f);
      --fsds-button-color-background-active: var(--fsds-semantic-interaction-background-active, #cecece);
      --fsds-button-color-border-focus: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-button-color-background-disabled: var(--fsds-semantic-color-action-background-primary-disabled, #cecece);
      --fsds-button-color-foreground-disabled: var(--fsds-semantic-color-foreground-disabled, #aeaeae);
      --fsds-button-size-padding-block-small: var(--fsds-core-spacing-size-03, 4px);
      --fsds-button-size-padding-block-medium: var(--fsds-core-spacing-size-04, 8px);
      --fsds-button-size-padding-block-large: var(--fsds-core-spacing-size-05, 12px);
      --fsds-button-size-padding-inline-small: var(--fsds-core-spacing-size-04, 8px);
      --fsds-button-size-padding-inline-medium: var(--fsds-core-spacing-size-05, 12px);
      --fsds-button-size-padding-inline-large: var(--fsds-core-spacing-size-06, 16px);
      --fsds-button-size-minHeight-small: var(--fsds-core-dimension-actionMinHeightSmall, 28px);
      --fsds-button-size-minHeight-medium: var(--fsds-core-dimension-actionMinHeight, 36px);
      --fsds-button-size-minHeight-large: var(--fsds-core-dimension-actionMinHeightLarge, 48px);
      --fsds-button-size-fontSize-small: var(--fsds-core-typography-ramp-3, 0.875rem);
      --fsds-button-size-fontSize-medium: var(--fsds-core-typography-ramp-4, 1rem);
      --fsds-button-size-fontSize-large: var(--fsds-core-typography-ramp-5, 1.125rem);
    }
    
    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      cursor: pointer;
      border-style: solid;
      white-space: nowrap;
      user-select: none;
      background-color: var(--fsds-button-color-background-default);
      color: var(--fsds-button-color-foreground-default);
      border-color: var(--fsds-button-color-border-default);
      gap: var(--fsds-button-size-gap-default);
      border-radius: var(--fsds-button-size-radius);
      border-width: var(--fsds-button-size-border);
      font-weight: var(--fsds-button-text-weight);
      transition-duration: var(--fsds-button-motion-duration-fast);
      transition-timing-function: var(--fsds-button-motion-easing-standard);
    
      &:hover {
        background-color: var(--fsds-button-color-background-hover);
        border-color: var(--fsds-button-color-border-hover);
      }
    
      &:active {
        background-color: var(--fsds-button-color-background-active);
      }
    
      &:focus-visible {
        border-color: var(--fsds-button-color-border-focus);
      }
    
      &:disabled {
        background-color: var(--fsds-button-color-background-disabled);
        color: var(--fsds-button-color-foreground-disabled);
      }
    }
    
    .button--small {
      padding-block: var(--fsds-button-size-padding-block-small);
      padding-inline: var(--fsds-button-size-padding-inline-small);
      min-height: var(--fsds-button-size-minHeight-small);
      font-size: var(--fsds-button-size-fontSize-small);
    }
    
    .button--medium {
      padding-block: var(--fsds-button-size-padding-block-medium);
      padding-inline: var(--fsds-button-size-padding-inline-medium);
      min-height: var(--fsds-button-size-minHeight-medium);
      font-size: var(--fsds-button-size-fontSize-medium);
    }
    
    .button--large {
      padding-block: var(--fsds-button-size-padding-block-large);
      padding-inline: var(--fsds-button-size-padding-inline-large);
      min-height: var(--fsds-button-size-minHeight-large);
      font-size: var(--fsds-button-size-fontSize-large);
    }
    
    .button__spinner {
      display: inline-block;
      width: 1em;
      height: 1em;
      flex-shrink: 0;
      animation: spin 1s linear infinite;
    }
    
    .button__loadingText {
      display: inline-block;
      opacity: 0.7;
    }
    
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `;

  @property({ type: String }) size?: ButtonSize = "medium";
  @property({ type: String }) variant?: ButtonVariant = "primary";
  @property({ type: String }) type?: ButtonType = "button";
  @property({ type: Boolean }) loading?: boolean;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ attribute: 'aria-label', reflect: true })
  override ariaLabel: string | null = null;
  @property({ attribute: 'aria-expanded', reflect: true })
  override ariaExpanded: string | null = null;
  @property({ attribute: 'aria-pressed', reflect: true })
  override ariaPressed: string | null = null;

  private computeClasses(): string {
    return [
      "button",
      this.size ? `button--${this.size}` : null,
      this.variant ? `button--${this.variant}` : null,
      this.disabled ? "button--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<button class="${this.computeClasses()}" type=${ifDefined(this.type)} ?disabled=${this.disabled ?? false} aria-label=${ifDefined(this.ariaLabel ?? undefined)} aria-expanded=${ifDefined(this.ariaExpanded === undefined ? undefined : (this.ariaExpanded ? 'true' : 'false'))} aria-pressed=${ifDefined(this.ariaPressed === undefined ? undefined : (this.ariaPressed ? 'true' : 'false'))} aria-busy=${ifDefined(this.loading === undefined ? undefined : (this.loading ? 'true' : 'false'))}>
  <slot></slot>
</button>`;
  }
}

customElements.define('fsds-button', ButtonElement);
// @generated:end

// @custom:start trailing

// @custom:end