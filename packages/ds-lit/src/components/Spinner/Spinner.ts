// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SpinnerSize = "xs" | "sm" | "md" | "lg";
export type SpinnerThickness = "hairline" | "regular" | "bold";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class SpinnerElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .spinner {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: 0;
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-spinner-size-xs: var(--fsds-semantic-glyph-size-small-extent, 12px);
      --fsds-spinner-size-sm: var(--fsds-core-icon-size-sm, 16px);
      --fsds-spinner-size-md: var(--fsds-core-icon-size-md, 20px);
      --fsds-spinner-size-lg: var(--fsds-core-icon-size-lg, 24px);
      --fsds-spinner-thickness-hairline: 2px;
      --fsds-spinner-thickness-regular: 3px;
      --fsds-spinner-thickness-bold: 4px;
      --fsds-spinner-color-accent: var(--fsds-semantic-color-background-accent, #d9292b);
      --fsds-spinner-color-track: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-spinner-anim-duration: 800ms;
    }

    .spinner {
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
      transition-duration: var(--fsds-spinner-anim-duration);
    }

    .spinner__visual {
      display: inline-block;
      width: 1em;
      height: 1em;
      border-radius: 50%;
      border-style: solid;
      border-width: var(--fsds-spinner-thickness-regular);
      border-color: var(--fsds-spinner-color-track);
      border-top-color: var(--fsds-spinner-color-accent);
      animation: spin var(--fsds-spinner-anim-duration, 800ms) linear infinite;
    }

    .spinner--xs {
      font-size: var(--fsds-spinner-size-xs);
    }

    .spinner--sm {
      font-size: var(--fsds-spinner-size-sm);
    }

    .spinner--md {
      font-size: var(--fsds-spinner-size-md);
    }

    .spinner--lg {
      font-size: var(--fsds-spinner-size-lg);
    }

    .spinner--hairline .spinner__visual {
      border-width: var(--fsds-spinner-thickness-hairline);
    }

    .spinner--regular .spinner__visual {
      border-width: var(--fsds-spinner-thickness-regular);
    }

    .spinner--bold .spinner__visual {
      border-width: var(--fsds-spinner-thickness-bold);
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

  @property({ type: String }) size?: SpinnerSize;
  @property({ type: String }) thickness?: SpinnerThickness;
  @property({ attribute: 'aria-hidden', reflect: true })
  override ariaHidden: string | null = null;
  @property({ type: String }) label?: string;
  @property({ type: Boolean }) inline?: boolean;
  @property({ type: Number }) showAfterMs?: number;

  private computeClasses(): string {
    return [
      "spinner",
      this.size ? `spinner--${this.size}` : null,
      this.thickness ? `spinner--${this.thickness}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" role="status">
  <span class=${'spinner__visual'} aria-hidden="true"></span>
</div>`;
  }
}

customElements.define('fsds-spinner', SpinnerElement);
// @generated:end

// @custom:start trailing

// @custom:end