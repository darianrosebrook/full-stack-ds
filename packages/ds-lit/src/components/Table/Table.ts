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
  static override styles = css`:host { display: contents; }`;

  @property({ type: Boolean })
  responsive?: boolean;
  @property({ type: String })
  ariaLabel?: string;

  override render() {
    return html`<fsds-stack class="table"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-table', TableElement);

export class TableBodyElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack class="table__body"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-table-body', TableBodyElement);

export class TableFooterElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="footer" variant="horizontal" class="table__footer"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-table-footer', TableFooterElement);

export class TableHeaderElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="header" class="table__header"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-table-header', TableHeaderElement);
// @generated:end

// @custom:start trailing

// @custom:end