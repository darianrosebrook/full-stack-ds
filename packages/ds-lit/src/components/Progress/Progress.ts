// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
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
  static override styles = css`:host { display: contents; }`;

  @property({ type: Number }) value?: number;
  @property() variant?: ProgressVariant;
  @property() size?: ProgressSize;
  @property() intent?: ProgressIntent;
  @property() label?: string;
  @property({ type: Boolean }) showValue?: boolean;
  @property({ type: Number }) formatValue?: (value: number, max: number) => string;

  private computeClasses(): string {
    return [
      "progress",
      this.variant ? `progress--${this.variant}` : null,
      this.size ? `progress--${this.size}` : null,
      this.intent ? `progress--${this.intent}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" role="progressbar" aria-valuenow=${this.value} aria-valuemin="0" aria-valuemax="100" aria-label=${this.label}>
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