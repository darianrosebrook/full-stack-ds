// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
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

  @property({ type: String }) htmlFor?: string;
  @property({ type: String }) form?: string;

  private computeClasses(): string {
    return [
      "label",
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<label class="${this.computeClasses()}" htmlFor=${ifDefined(this.htmlFor)} form=${ifDefined(this.form)}>
  <slot></slot>
</label>`;
  }
}

customElements.define('fsds-label', LabelElement);
// @generated:end

// @custom:start trailing

// @custom:end