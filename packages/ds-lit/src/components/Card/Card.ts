// @generated:start imports
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { StackElement as _Stack } from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type CardStatus = "completed" | "in-progress" | "planned" | "deprecated" | "category" | "complexity";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class CardElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property({ type: Boolean })
  interactive?: boolean;
  @property({ type: String })
  status?: CardStatus;

  override render() {
    const classes = {
      'card': true,
      [`card--${this.status}`]: !!this.status,
    };
    return html`<fsds-stack class=${classMap(classes)}><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-card', CardElement);

export class CardHeaderElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="header" class="card__header"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-card-header', CardHeaderElement);

export class CardContentElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack class="card__content"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-card-content', CardContentElement);

export class CardFooterElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="footer" variant="horizontal" class="card__footer"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-card-footer', CardFooterElement);

export class CardDescriptionElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="p" class="card__description"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-card-description', CardDescriptionElement);
// @generated:end

// @custom:start trailing

// @custom:end