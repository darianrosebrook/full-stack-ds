// @generated:start imports
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { StackElement as _Stack } from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AlertNoticeStatus = "info" | "success" | "warning" | "error";
export type AlertNoticeLevel = "page" | "section" | "inline";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class AlertNoticeElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property({ attribute: false })
  status?: AlertNoticeStatus;
  @property({ attribute: false })
  level?: AlertNoticeLevel;
  @property({ type: Boolean })
  dismissible?: boolean;
  @property({ attribute: false })
  icon?: unknown;

  override render() {
    const classes = {
      'alert-notice': true,
      [`alert-notice--${this.status}`]: !!this.status,
      [`alert-notice--${this.level}`]: !!this.level,
    };
    return html`<fsds-stack role="alert" class=${classMap(classes)}><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-alert-notice', AlertNoticeElement);

export class AlertNoticeBodyElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack class="alert-notice__body"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-alert-notice-body', AlertNoticeBodyElement);

export class AlertNoticeTitleElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="h3" class="alert-notice__title"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-alert-notice-title', AlertNoticeTitleElement);
// @generated:end

// @custom:start trailing

// @custom:end