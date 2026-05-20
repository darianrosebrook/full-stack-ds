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
  static override styles = css`:host { display: contents; }`;

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