// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: 0;
      --fsds-box-model-width: 100%;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: 8px;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-progress-color-text-default: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-progress-spacing-gap: var(--fsds-core-spacing-size-02, 2px);
      --fsds-progress-motion-duration-indeterminate: var(--fsds-core-motion-duration-extra-long1, 1500ms);
      --fsds-progress-color-track-background: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-progress-color-fill-info: var(--fsds-semantic-color-status-info, #0a65fe);
      --fsds-progress-color-fill-success: var(--fsds-semantic-color-status-success, #487e1e);
      --fsds-progress-color-fill-warning: var(--fsds-semantic-color-status-warning, #ac5c00);
      --fsds-progress-color-fill-danger: var(--fsds-semantic-color-status-danger, #d9292b);
    }
    
    .progress {
      display: block;
      box-sizing: border-box;
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-progress-spacing-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      color: var(--fsds-progress-color-text-default);
      transition-duration: var(--fsds-progress-motion-duration-indeterminate);
    }
    
    .progress__track {
      background-color: var(--fsds-progress-color-track-background);
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    
    .progress__fill {
      background-color: var(--fsds-progress-color-fill-info);
      display: block;
      height: 100%;
      width: calc(var(--fsds-progress-fill-width, 0) * 1%);
    }
    
    .progress__value {
      display: inline-block;
      color: var(--fsds-progress-color-text-default);
      font-size: 0.875em;
      margin-left: var(--fsds-progress-spacing-gap);
    }
    
    .progress--info .progress__fill {
      background-color: var(--fsds-progress-color-fill-info);
    }
    
    .progress--success .progress__fill {
      background-color: var(--fsds-progress-color-fill-success);
    }
    
    .progress--warning .progress__fill {
      background-color: var(--fsds-progress-color-fill-warning);
    }
    
    .progress--danger .progress__fill {
      background-color: var(--fsds-progress-color-fill-danger);
    }
  `;

  @property({ type: Number }) value?: number;
  @property({ type: String }) variant?: ProgressVariant;
  @property({ type: String }) size?: ProgressSize;
  @property({ type: String }) intent?: ProgressIntent;
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
    <span class=${'progress__fill'} style=${styleMap({ '--fsds-progress-fill-width': this.value === undefined ? undefined : String(this.value) })}></span>
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