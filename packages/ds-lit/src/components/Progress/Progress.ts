// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ProgressVariant = "linear" | "circular";
export type ProgressSize = "sm" | "md" | "lg";
export type ProgressIntent = "info" | "success" | "warning" | "danger";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class ProgressElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .progress {
      --fsds-progress-color-text-default: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-progress-spacing-gap: var(--fsds-core-spacing-size-02, 2px);
      --fsds-progress-motion-duration-indeterminate: var(--fsds-core-motion-duration-extra-long1, 1500ms);
      --fsds-progress-color-track-background: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-progress-color-fill-info: var(--fsds-semantic-color-status-info, #0a65fe);
    }
    
    .progress {
      color: var(--fsds-progress-color-text-default);
      gap: var(--fsds-progress-spacing-gap);
      transition-duration: var(--fsds-progress-motion-duration-indeterminate);
    }
    
    .progress__track {
      background-color: var(--fsds-progress-color-track-background);
    }
    
    .progress__fill {
      background-color: var(--fsds-progress-color-fill-info);
    }
  `;

  @property({ type: Number }) value?: number;
  @property({ attribute: false }) variant?: ProgressVariant;
  @property({ attribute: false }) size?: ProgressSize;
  @property({ attribute: false }) intent?: ProgressIntent;
  @property({ type: String }) label?: string;
  @property({ type: Boolean }) showValue?: boolean;
  @property({ attribute: false }) formatValue?: (value: number, max: number) => string;

  private computeClasses(): string {
    return [
      "progress",
      this.variant ? `progress--${this.variant}` : null,
      this.size ? `progress--${this.size}` : null,
      this.intent ? `progress--${this.intent}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" role="progressbar" aria-valuenow=${ifDefined(this.value)} aria-valuemin="0" aria-valuemax="100" aria-label=${ifDefined(this.label)}>
  <span class=${'progress__track'} aria-hidden="true">
    <span class=${'progress__fill'}></span>
  </span>
  ${this.showValue ? html`
  <span class=${'progress__value'}>
    <slot></slot>
  </span>
  ` : nothing}
</div>`;
  }
}

customElements.define('fsds-progress', ProgressElement);
// @generated:end

// @custom:start trailing

// @custom:end