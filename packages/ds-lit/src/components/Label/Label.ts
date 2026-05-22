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
  static override styles = css`
    :host { display: contents; }
    .label {
      --fsds-label-color-text-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-label-typo-weight-default: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-label-typo-lineHeight-default: var(--fsds-semantic-typography-line-height-tight, 1.2);
    }
    
    .label {
      color: var(--fsds-label-color-text-default);
      line-height: var(--fsds-label-typo-lineHeight-default);
    }
  `;

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