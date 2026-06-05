// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type StatSize = "sm" | "md" | "lg";
export type StatTrend = "up" | "down" | "neutral";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class StatElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .stat {
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
      --fsds-stat-color-foreground-value: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-stat-color-foreground-label: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-stat-color-foreground-trend-up: var(--fsds-semantic-color-feedback-foreground-success-default, #1f8a4c);
      --fsds-stat-color-foreground-trend-down: var(--fsds-semantic-color-feedback-foreground-danger-default, #d9292b);
      --fsds-stat-color-foreground-trend-neutral: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-stat-size-value-md: var(--fsds-semantic-typography-heading-02, 28px);
      --fsds-stat-size-label: var(--fsds-semantic-typography-caption-02, 12px);
      --fsds-stat-size-gap: var(--fsds-core-spacing-size-02, 4px);
      --fsds-stat-typography-lineHeight-value: 1.1;
      --fsds-stat-typography-weight-value: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-stat-typography-weight-label: var(--fsds-semantic-typography-font-weight-medium, 500);
    }
    
    .stat {
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
      display: block;
      color: var(--fsds-stat-color-foreground-value);
      font-size: var(--fsds-stat-size-value-md);
      font-weight: var(--fsds-stat-typography-weight-value);
      line-height: var(--fsds-stat-typography-lineHeight-value);
      letter-spacing: -0.02em;
    }
  `;

  @property({ type: String }) size?: StatSize = "md";
  @property({ type: String }) trend?: StatTrend;

  private computeClasses(): string {
    return [
      "stat",
      this.size ? `stat--${this.size}` : null,
      this.trend ? `stat--${this.trend}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}">
  <slot></slot>
</div>`;
  }
}

customElements.define('fsds-stat', StatElement);
// @generated:end

// @custom:start trailing

// @custom:end