// @generated:start imports
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { StackElement as _Stack } from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AlertIntent = "info" | "success" | "warning" | "danger";
export type AlertLevel = "inline" | "section" | "page";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class AlertElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property({ attribute: false })
  intent?: AlertIntent;
  @property({ attribute: false })
  level?: AlertLevel;
  @property({ type: Boolean })
  dismissible?: boolean;
  @property({ attribute: false })
  icon?: unknown;

  override render() {
    const classes = {
      'alert': true,
      [`alert--${this.intent}`]: !!this.intent,
      [`alert--${this.level}`]: !!this.level,
    };
    return html`<fsds-stack role="alert" class=${classMap(classes)}><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-alert', AlertElement);

export class AlertBodyElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack class="alert__body"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-alert-body', AlertBodyElement);

export class AlertTitleElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="h3" class="alert__title"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-alert-title', AlertTitleElement);
// @generated:end

// @custom:start trailing

// @custom:end