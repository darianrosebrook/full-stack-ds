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
export class ShuttleElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property({ attribute: 'aria-label', reflect: true })
  override ariaLabel: string | null = null;

  override render() {
    return html`<fsds-stack class="shuttle"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-shuttle', ShuttleElement);

export class ShuttleItemElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="li" class="shuttle__item"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-shuttle-item', ShuttleItemElement);
// @generated:end

// @custom:start trailing

// @custom:end