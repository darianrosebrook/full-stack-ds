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
export class TableElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .table {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-table-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-table-color-textMuted: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-table-color-border: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-table-color-background-footer: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-table-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-table-spacing-cellX: var(--fsds-core-spacing-size-03, 4px);
      --fsds-table-spacing-cellY: var(--fsds-core-spacing-size-02, 2px);
      --fsds-table-spacing-caption: var(--fsds-core-spacing-size-04, 8px);
      --fsds-table-spacing-sortGap: var(--fsds-core-spacing-size-02, 2px);
      --fsds-table-size-cellHeight: var(--fsds-semantic-control-size-md-height, 32px);
      --fsds-table-size-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-table-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-table-text-lineHeight: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-table-text-sizeCaption: var(--fsds-semantic-typography-body-04, 12px);
      --fsds-table-text-weightHead: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-table-text-weightFooter: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-table-color-background-hover: var(--fsds-semantic-interaction-background-hover, #efefef);
      --fsds-table-color-background-selected: var(--fsds-semantic-color-background-accent, #d9292b);
      --fsds-table-focus-width: var(--fsds-core-shape-border-width-thick, 2px);
      --fsds-table-focus-color: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-table-focus-offset: var(--fsds-core-spacing-size-01, 1px);
    }

    .table {
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
      color: var(--fsds-table-color-text);
      font-size: var(--fsds-table-text-size);
      line-height: var(--fsds-table-text-lineHeight);
      overflow-x: auto;

      &:hover {
        background-color: var(--fsds-table-color-background-hover);
      }

      &[aria-selected="true"] {
        background-color: var(--fsds-table-color-background-selected);
      }
    }

    .table__container {
      border-collapse: collapse;
      border-color: var(--fsds-table-color-border);
      border-width: var(--fsds-table-border-width);
      border-radius: var(--fsds-table-size-radius);
      width: 100%;
    }

    .table__caption {
      font-size: var(--fsds-table-text-sizeCaption);
      text-align: start;
      padding-bottom: var(--fsds-table-spacing-caption);
    }

    .table__head {
      background-color: var(--fsds-table-color-background-footer);
    }

    .table__footer {
      background-color: var(--fsds-table-color-background-footer);
      font-weight: var(--fsds-table-text-weightFooter);
    }

    .table__headerCell {
      font-weight: var(--fsds-table-text-weightHead);
      color: var(--fsds-table-color-text);
      padding-left: var(--fsds-table-spacing-cellX);
      padding-right: var(--fsds-table-spacing-cellX);
      padding-top: var(--fsds-table-spacing-cellY);
      padding-bottom: var(--fsds-table-spacing-cellY);
      border-bottom-width: var(--fsds-table-border-width);
      border-bottom-color: var(--fsds-table-color-border);
      border-bottom-style: solid;
      text-align: start;
    }

    .table__cell {
      padding-left: var(--fsds-table-spacing-cellX);
      padding-right: var(--fsds-table-spacing-cellX);
      padding-top: var(--fsds-table-spacing-cellY);
      padding-bottom: var(--fsds-table-spacing-cellY);
      border-bottom-width: var(--fsds-table-border-width);
      border-bottom-color: var(--fsds-table-color-border);
      border-bottom-style: solid;
    }
  `;

  @property({ type: Boolean }) responsive?: boolean;
  @property({ attribute: 'aria-label', reflect: true })
  override ariaLabel: string | null = null;

  private computeClasses(): string {
    return [
      "table",
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}">
  <table class=${'table__container'} aria-label=${ifDefined(this.ariaLabel ?? undefined)}>
    <slot></slot>
  </table>
</div>`;
  }
}

customElements.define('fsds-table', TableElement);
// @generated:end

// @custom:start trailing

// @custom:end