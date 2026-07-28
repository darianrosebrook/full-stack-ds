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
export class DividerElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .divider {
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
      --fsds-divider-color-default: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-divider-size-thickness: var(--fsds-semantic-shape-control-border-defaultWidth, 1px);
      --fsds-divider-size-thicknessThick: var(--fsds-semantic-shape-control-border-defaultWidth, 1px);
      --fsds-divider-spacing-margin: var(--fsds-core-spacing-size-04, 8px);
    }

    .divider {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: 100%;
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: block;
      border-top-color: var(--fsds-divider-color-default, #b8b8b8);
      border-top-style: solid;
      border-top-width: var(--fsds-divider-size-thickness, 1px);
      margin-top: var(--fsds-divider-spacing-margin, 8px);
      margin-bottom: var(--fsds-divider-spacing-margin, 8px);
    }

    .divider--vertical {
      width: 1px;
      height: auto;
      border-top: none;
      border-left-color: var(--fsds-divider-color-default, #b8b8b8);
      border-left-style: solid;
      border-left-width: var(--fsds-divider-size-thickness, 1px);
      margin-top: 0;
      margin-bottom: 0;
      margin-left: var(--fsds-divider-spacing-margin, 8px);
      margin-right: var(--fsds-divider-spacing-margin, 8px);
    }
  `;

  @property({ attribute: false }) orientation?: "horizontal" | "vertical";
  @property({ type: Boolean }) decorative?: boolean;
  @property({ type: String }) thickness?: string;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "divider");
  }

  private computeClasses(): string {
    return [
      "divider",
      this.orientation ? `divider--${this.orientation}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<hr class="${this.computeClasses()}" role="separator" />`;
  }
}

customElements.define('fsds-divider', DividerElement);
// @generated:end

// @custom:start trailing

// @custom:end