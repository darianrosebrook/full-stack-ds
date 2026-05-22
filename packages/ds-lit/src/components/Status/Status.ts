// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type StatusIntent = "info" | "success" | "warning" | "danger" | "error";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class StatusElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .status {
      --fsds-status-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-status-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-status-color-border-default: var(--fsds-semantic-color-border-primary, #f29495);
      --fsds-status-size-radius-default: var(--fsds-core-shape-radius-full, 9999px);
      --fsds-status-size-padding-default: var(--fsds-core-spacing-size-04, 8px);
      --fsds-status-size-border-default: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-status-typography-lineHeight: var(--fsds-semantic-typography-line-height-collapse, 1);
    }
    
    .status {
      background-color: var(--fsds-status-color-background-default);
      color: var(--fsds-status-color-foreground-primary);
      border-color: var(--fsds-status-color-border-default);
      border-radius: var(--fsds-status-size-radius-default);
      padding: var(--fsds-status-size-padding-default);
      line-height: var(--fsds-status-typography-lineHeight);
    }
  `;

  @property({ attribute: false }) status!: StatusIntent;

  private computeClasses(): string {
    return [
      "status",
      this.status ? `status--${this.status}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<span class="${this.computeClasses()}">
  <span class=${'status__icon'} aria-hidden="true"></span>
  <span class=${'status__label'}>
    <slot></slot>
  </span>
</span>`;
  }
}

customElements.define('fsds-status', StatusElement);
// @generated:end

// @custom:start trailing

// @custom:end