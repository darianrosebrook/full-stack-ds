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
      --fsds-stat-color-foreground-value: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-stat-color-foreground-label: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-stat-color-foreground-trend-up: var(--fsds-semantic-color-feedback-positive, #1f8a4c);
      --fsds-stat-color-foreground-trend-down: var(--fsds-semantic-color-feedback-negative, #d9292b);
      --fsds-stat-color-foreground-trend-neutral: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-stat-size-value-sm: var(--fsds-semantic-typography-heading-size-sm, 20px);
      --fsds-stat-size-value-md: var(--fsds-semantic-typography-heading-size-md, 28px);
      --fsds-stat-size-value-lg: var(--fsds-semantic-typography-heading-size-lg, 40px);
      --fsds-stat-size-label: var(--fsds-semantic-typography-caption-size-sm, 12px);
      --fsds-stat-size-gap: var(--fsds-core-spacing-size-02, 4px);
      --fsds-stat-typography-weight-value: var(--fsds-semantic-typography-weight-bold, 700);
      --fsds-stat-typography-weight-label: var(--fsds-semantic-typography-weight-medium, 500);
    }
    
    .stat {
      display: block;
      color: var(--fsds-stat-color-foreground-value);
      font-size: var(--fsds-stat-size-value-md);
      font-weight: var(--fsds-stat-typography-weight-value);
      line-height: 1.1;
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