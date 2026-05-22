// @generated:start imports
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { StackElement as _Stack } from '../../primitives/index.js';
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
      --fsds-table-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-table-color-textMuted: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-table-color-border: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-table-color-background-footer: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-table-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-table-spacing-sortGap: var(--fsds-core-spacing-size-02, 2px);
      --fsds-table-size-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-table-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-table-text-lineHeight: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-table-text-sizeCaption: var(--fsds-semantic-typography-body-04, 12px);
      --fsds-table-text-weightHead: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-table-text-weightFooter: var(--fsds-semantic-typography-font-weight-medium, 500);
    
      &:hover {
        --fsds-table-color-background-hover: var(--fsds-semantic-interaction-background-hover, #efefef);
      }
    
      &[aria-selected="true"] {
        --fsds-table-color-background-selected: var(--fsds-semantic-color-background-accent, #d9292b);
      }
    }
    
    .table {
      color: var(--fsds-table-color-textMuted);
      border-color: var(--fsds-table-color-border);
      background-color: var(--fsds-table-color-background-footer);
      border-width: var(--fsds-table-border-width);
      gap: var(--fsds-table-spacing-sortGap);
      border-radius: var(--fsds-table-size-radius);
      font-size: var(--fsds-table-text-sizeCaption);
      line-height: var(--fsds-table-text-lineHeight);
      font-weight: var(--fsds-table-text-weightFooter);
      /* --fsds-core-spacing-size-03: 4px; */
      /* --fsds-core-spacing-size-02: 2px; */
      /* --fsds-core-spacing-size-04: 8px; */
      /* --fsds-semantic-control-size-md-height: 32px; */
    
      &:hover {
        background-color: var(--fsds-table-color-background-hover);
      }
    
      &:focus-visible {
        /* --fsds-core-shape-border-width-thick: 2px; */
        /* --fsds-semantic-color-border-accent: #d9292b; */
        /* --fsds-core-spacing-size-01: 1px; */
      }
    
      &[aria-selected="true"] {
        background-color: var(--fsds-table-color-background-selected);
      }
    }
  `;

  @property({ type: Boolean })
  responsive?: boolean;
  @property({ attribute: 'aria-label', reflect: true })
  override ariaLabel: string | null = null;

  override render() {
    return html`<fsds-stack class="table"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-table', TableElement);

export class TableBodyElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .table {
      --fsds-table-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-table-color-textMuted: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-table-color-border: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-table-color-background-footer: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-table-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-table-spacing-sortGap: var(--fsds-core-spacing-size-02, 2px);
      --fsds-table-size-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-table-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-table-text-lineHeight: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-table-text-sizeCaption: var(--fsds-semantic-typography-body-04, 12px);
      --fsds-table-text-weightHead: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-table-text-weightFooter: var(--fsds-semantic-typography-font-weight-medium, 500);
    
      &:hover {
        --fsds-table-color-background-hover: var(--fsds-semantic-interaction-background-hover, #efefef);
      }
    
      &[aria-selected="true"] {
        --fsds-table-color-background-selected: var(--fsds-semantic-color-background-accent, #d9292b);
      }
    }
    
    .table {
      color: var(--fsds-table-color-textMuted);
      border-color: var(--fsds-table-color-border);
      background-color: var(--fsds-table-color-background-footer);
      border-width: var(--fsds-table-border-width);
      gap: var(--fsds-table-spacing-sortGap);
      border-radius: var(--fsds-table-size-radius);
      font-size: var(--fsds-table-text-sizeCaption);
      line-height: var(--fsds-table-text-lineHeight);
      font-weight: var(--fsds-table-text-weightFooter);
      /* --fsds-core-spacing-size-03: 4px; */
      /* --fsds-core-spacing-size-02: 2px; */
      /* --fsds-core-spacing-size-04: 8px; */
      /* --fsds-semantic-control-size-md-height: 32px; */
    
      &:hover {
        background-color: var(--fsds-table-color-background-hover);
      }
    
      &:focus-visible {
        /* --fsds-core-shape-border-width-thick: 2px; */
        /* --fsds-semantic-color-border-accent: #d9292b; */
        /* --fsds-core-spacing-size-01: 1px; */
      }
    
      &[aria-selected="true"] {
        background-color: var(--fsds-table-color-background-selected);
      }
    }
  `;

  override render() {
    return html`<fsds-stack class="table__body"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-table-body', TableBodyElement);

export class TableFooterElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .table {
      --fsds-table-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-table-color-textMuted: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-table-color-border: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-table-color-background-footer: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-table-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-table-spacing-sortGap: var(--fsds-core-spacing-size-02, 2px);
      --fsds-table-size-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-table-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-table-text-lineHeight: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-table-text-sizeCaption: var(--fsds-semantic-typography-body-04, 12px);
      --fsds-table-text-weightHead: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-table-text-weightFooter: var(--fsds-semantic-typography-font-weight-medium, 500);
    
      &:hover {
        --fsds-table-color-background-hover: var(--fsds-semantic-interaction-background-hover, #efefef);
      }
    
      &[aria-selected="true"] {
        --fsds-table-color-background-selected: var(--fsds-semantic-color-background-accent, #d9292b);
      }
    }
    
    .table {
      color: var(--fsds-table-color-textMuted);
      border-color: var(--fsds-table-color-border);
      background-color: var(--fsds-table-color-background-footer);
      border-width: var(--fsds-table-border-width);
      gap: var(--fsds-table-spacing-sortGap);
      border-radius: var(--fsds-table-size-radius);
      font-size: var(--fsds-table-text-sizeCaption);
      line-height: var(--fsds-table-text-lineHeight);
      font-weight: var(--fsds-table-text-weightFooter);
      /* --fsds-core-spacing-size-03: 4px; */
      /* --fsds-core-spacing-size-02: 2px; */
      /* --fsds-core-spacing-size-04: 8px; */
      /* --fsds-semantic-control-size-md-height: 32px; */
    
      &:hover {
        background-color: var(--fsds-table-color-background-hover);
      }
    
      &:focus-visible {
        /* --fsds-core-shape-border-width-thick: 2px; */
        /* --fsds-semantic-color-border-accent: #d9292b; */
        /* --fsds-core-spacing-size-01: 1px; */
      }
    
      &[aria-selected="true"] {
        background-color: var(--fsds-table-color-background-selected);
      }
    }
  `;

  override render() {
    return html`<fsds-stack as="footer" variant="horizontal" class="table__footer"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-table-footer', TableFooterElement);

export class TableHeaderElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .table {
      --fsds-table-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-table-color-textMuted: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-table-color-border: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-table-color-background-footer: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-table-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-table-spacing-sortGap: var(--fsds-core-spacing-size-02, 2px);
      --fsds-table-size-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-table-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-table-text-lineHeight: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-table-text-sizeCaption: var(--fsds-semantic-typography-body-04, 12px);
      --fsds-table-text-weightHead: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-table-text-weightFooter: var(--fsds-semantic-typography-font-weight-medium, 500);
    
      &:hover {
        --fsds-table-color-background-hover: var(--fsds-semantic-interaction-background-hover, #efefef);
      }
    
      &[aria-selected="true"] {
        --fsds-table-color-background-selected: var(--fsds-semantic-color-background-accent, #d9292b);
      }
    }
    
    .table {
      color: var(--fsds-table-color-textMuted);
      border-color: var(--fsds-table-color-border);
      background-color: var(--fsds-table-color-background-footer);
      border-width: var(--fsds-table-border-width);
      gap: var(--fsds-table-spacing-sortGap);
      border-radius: var(--fsds-table-size-radius);
      font-size: var(--fsds-table-text-sizeCaption);
      line-height: var(--fsds-table-text-lineHeight);
      font-weight: var(--fsds-table-text-weightFooter);
      /* --fsds-core-spacing-size-03: 4px; */
      /* --fsds-core-spacing-size-02: 2px; */
      /* --fsds-core-spacing-size-04: 8px; */
      /* --fsds-semantic-control-size-md-height: 32px; */
    
      &:hover {
        background-color: var(--fsds-table-color-background-hover);
      }
    
      &:focus-visible {
        /* --fsds-core-shape-border-width-thick: 2px; */
        /* --fsds-semantic-color-border-accent: #d9292b; */
        /* --fsds-core-spacing-size-01: 1px; */
      }
    
      &[aria-selected="true"] {
        background-color: var(--fsds-table-color-background-selected);
      }
    }
  `;

  override render() {
    return html`<fsds-stack as="header" class="table__header"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-table-header', TableHeaderElement);
// @generated:end

// @custom:start trailing

// @custom:end