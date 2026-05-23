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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: 0;
      --fsds-box-model-width: var(--fsds-semantic-glyph-size-medium-extent, 16px);
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: var(--fsds-semantic-glyph-size-medium-extent, 16px);
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-label-color-text-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-label-typo-weight-default: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-label-typo-lineHeight-default: var(--fsds-semantic-typography-line-height-tight, 1.2);
    }
    
    .label {
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