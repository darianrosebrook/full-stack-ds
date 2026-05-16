// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class LabelElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property() htmlFor?: string;
  @property() form?: string;

  private computeClasses(): string {
    return [
      "label",
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<label class="${this.computeClasses()}" .htmlFor=${this.htmlFor} form=${this.form}>
  <slot></slot>
</label>`;
  }
}

customElements.define('fsds-label', LabelElement);
// @generated:end

// @custom:start trailing

// @custom:end