// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type IconDefinition = { iconName: string; prefix?: string; icon?: unknown };
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class IconElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .icon {
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
      --fsds-icon-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-icon-size-padding-default: var(--fsds-core-spacing-size-01, 1px);
    }

    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-sizing: border-box;
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
      color: var(--fsds-icon-color-foreground-default);
      padding: var(--fsds-icon-size-padding-default);
    }
  `;

  @property({ attribute: false }) icon!: IconDefinition;
  @property({ type: Number }) width?: number = 20;
  @property({ type: Number }) height?: number = 20;

  private computeClasses(): string {
    return [
      "icon",
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<span class="${this.computeClasses()}" aria-hidden="true">
  <svg viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" width=${ifDefined(this.width)} height=${ifDefined(this.height)}>
    <circle cx="8.5" cy="8.5" r="8" stroke="currentColor" stroke-linecap="round" stroke-dasharray="2 4"></circle>
    <circle cx="8.5" cy="8.5" r="3" stroke="currentColor" stroke-linecap="round" stroke-dasharray=".125 3"></circle>
  </svg>
</span>`;
  }
}

customElements.define('fsds-icon', IconElement);
// @generated:end

// @custom:start trailing

// @custom:end