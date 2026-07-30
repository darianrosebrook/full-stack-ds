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
export type CardDensity = "default" | "inset";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class CardElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .card {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-gap: var(--fsds-semantic-surface-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-surface-size-min-width, 64px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-card-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-card-color-background-hover: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-card-color-border-default: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-card-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-card-size-padding-inset: var(--fsds-core-spacing-size-04, 8px);
      --fsds-card-size-radius-default: var(--fsds-semantic-shape-radius-medium, 8px);
      --fsds-card-size-gap-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-card-typography-line-height-heading: var(--fsds-semantic-typography-line-height-heading, 1);
      --fsds-card-typography-line-height-normal: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-card-color-badge-success-background: var(--fsds-semantic-color-background-success-subtle, #b3dba7);
      --fsds-card-color-badge-success-foreground: var(--fsds-semantic-color-foreground-on-success-subtle, #2c4f09);
      --fsds-card-color-badge-warning-background: var(--fsds-semantic-color-background-warning-subtle, #fdc67f);
      --fsds-card-color-badge-warning-foreground: var(--fsds-semantic-color-foreground-on-warning-subtle, #6c3a00);
      --fsds-card-color-badge-info-background: var(--fsds-semantic-color-background-info-subtle, #95dafb);
      --fsds-card-color-badge-info-foreground: var(--fsds-semantic-color-foreground-on-info-subtle, #013ab0);
      --fsds-card-color-badge-error-background: var(--fsds-semantic-color-background-danger-subtle, #fac2c2);
      --fsds-card-color-badge-error-foreground: var(--fsds-semantic-color-foreground-on-danger-subtle, #900909);
      --fsds-card-color-badge-neutral-background: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-card-color-badge-neutral-foreground: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
      --fsds-card-color-badge-accent-background: var(--fsds-semantic-color-background-accent, #d92d2e);
      --fsds-card-color-badge-accent-foreground: var(--fsds-semantic-color-foreground-on-brand, #ffffff);
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-card-size-status-accent-width: var(--fsds-core-spacing-size-02, 2px);
      --fsds-card-elevation-resting: var(--fsds-semantic-elevation-surface-raised, 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1));
      --fsds-card-elevation-raised: var(--fsds-semantic-elevation-surface-floating, 0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.1));
      --fsds-card-color-focus-ring: var(--fsds-semantic-focus-ring-color, #0566fe);
      --fsds-card-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-card-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }

    .card--completed {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-success, #3a6614);
    }

    .card--in-progress {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-info, #034fd6);
    }

    .card--planned {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-subtle, #d0d0d0);
    }

    .card--deprecated {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-danger, #b31b1b);
    }

    .card--category {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-accent, #d92d2e);
    }

    .card--complexity {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-warning, #8b4b00);
    }

    .card__description {
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .card__link {
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-link, #d92d2e);
    }

    .card__note {
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .card {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-card-size-gap-default, 4px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      background-color: var(--fsds-card-color-background-default, #ffffff);
      border-color: var(--fsds-card-color-border-default, #b8b8b8);
      color: var(--fsds-card-color-foreground-primary, #141414);
      padding: var(--fsds-card-size-padding-default, 16px);
      border-radius: var(--fsds-card-size-radius-default, 8px);
      line-height: var(--fsds-card-typography-line-height-normal, 1.5);
      display: flex;
      flex-direction: column;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
      box-shadow: var(--fsds-card-elevation-resting, 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1));
      border-inline-start-width: var(--fsds-card-size-status-accent-width, 2px);
      border-inline-start-color: var(--fsds-card-color-status-accent-default, #d0d0d0);
      transition-property: box-shadow, border-color, background-color, transform;
      transition-duration: 150ms;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

      &:focus-visible {
        outline-width: var(--fsds-card-focus-ring-width, 2px);
        outline-color: var(--fsds-card-color-focus-ring, #0566fe);
        outline-offset: var(--fsds-card-focus-ring-offset, 2px);
        outline-style: solid;
      }
    }

    .card--interactive:hover {
      background-color: var(--fsds-card-color-background-hover, #d0d0d0);
      box-shadow: var(--fsds-card-elevation-raised, 0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.1));
      transform: translateY(-1px);
    }

    .card--interactive:active {
      box-shadow: var(--fsds-card-elevation-resting, 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1));
      transform: translateY(0);
    }

    .card--inset {
      padding: var(--fsds-card-size-padding-inset, 8px);
    }

    .card__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--fsds-card-size-gap-default, 4px);
      line-height: var(--fsds-card-typography-line-height-heading, 1);
      color: var(--fsds-card-color-foreground-primary, #141414);
    }

    .card__media {
      display: block;
      width: 100%;
      overflow: hidden;
      border-radius: var(--fsds-card-size-radius-default, 8px);
    }

    .card__content {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-card-size-gap-default, 4px);
      flex: 1 1 auto;
      color: var(--fsds-card-color-foreground-primary, #141414);
    }

    .card__description {
      margin: 0;
    }

    .card__footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--fsds-card-size-gap-default, 4px);
      padding-top: var(--fsds-card-size-padding-default, 16px);
      margin-top: auto;
      border-top-color: var(--fsds-card-color-border-default, #b8b8b8);
      border-top-style: solid;
      border-top-width: 1px;
    }

    .card__actions {
      display: flex;
      align-items: center;
      gap: var(--fsds-card-size-gap-default, 4px);
    }

    .card__badge {
      display: inline-flex;
      align-items: center;
      background-color: var(--fsds-card-color-badge-accent-background, #d92d2e);
      color: var(--fsds-card-color-badge-accent-foreground, #ffffff);
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 0.75em;
      line-height: 1.4;
    }

    .card__link {
      text-decoration: none;
    }

    .card__link:hover {
      text-decoration: underline;
    }

    .card__note {
      font-size: 0.875em;
      line-height: var(--fsds-card-typography-line-height-normal, 1.5);
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "card");
  }

  @property({ type: Boolean })
  interactive?: boolean;
  @property({ type: String })
  status?: CardStatus;
  @property({ type: String })
  density?: CardDensity = "default";

  override render() {
    const classes = {
      'card': true,
      [`card--${this.status}`]: !!this.status,
      [`card--${(this.density ?? "default")}`]: !!(this.density ?? "default"),
      'card--interactive': !!this.interactive,
    };
    return html`<fsds-stack role="group" class=${classMap(classes)}><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-card', CardElement);

export class CardHeaderElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .card {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-gap: var(--fsds-semantic-surface-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-surface-size-min-width, 64px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-card-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-card-color-background-hover: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-card-color-border-default: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-card-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-card-size-padding-inset: var(--fsds-core-spacing-size-04, 8px);
      --fsds-card-size-radius-default: var(--fsds-semantic-shape-radius-medium, 8px);
      --fsds-card-size-gap-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-card-typography-line-height-heading: var(--fsds-semantic-typography-line-height-heading, 1);
      --fsds-card-typography-line-height-normal: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-card-color-badge-success-background: var(--fsds-semantic-color-background-success-subtle, #b3dba7);
      --fsds-card-color-badge-success-foreground: var(--fsds-semantic-color-foreground-on-success-subtle, #2c4f09);
      --fsds-card-color-badge-warning-background: var(--fsds-semantic-color-background-warning-subtle, #fdc67f);
      --fsds-card-color-badge-warning-foreground: var(--fsds-semantic-color-foreground-on-warning-subtle, #6c3a00);
      --fsds-card-color-badge-info-background: var(--fsds-semantic-color-background-info-subtle, #95dafb);
      --fsds-card-color-badge-info-foreground: var(--fsds-semantic-color-foreground-on-info-subtle, #013ab0);
      --fsds-card-color-badge-error-background: var(--fsds-semantic-color-background-danger-subtle, #fac2c2);
      --fsds-card-color-badge-error-foreground: var(--fsds-semantic-color-foreground-on-danger-subtle, #900909);
      --fsds-card-color-badge-neutral-background: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-card-color-badge-neutral-foreground: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
      --fsds-card-color-badge-accent-background: var(--fsds-semantic-color-background-accent, #d92d2e);
      --fsds-card-color-badge-accent-foreground: var(--fsds-semantic-color-foreground-on-brand, #ffffff);
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-card-size-status-accent-width: var(--fsds-core-spacing-size-02, 2px);
      --fsds-card-elevation-resting: var(--fsds-semantic-elevation-surface-raised, 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1));
      --fsds-card-elevation-raised: var(--fsds-semantic-elevation-surface-floating, 0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.1));
      --fsds-card-color-focus-ring: var(--fsds-semantic-focus-ring-color, #0566fe);
      --fsds-card-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-card-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }

    .card--completed {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-success, #3a6614);
    }

    .card--in-progress {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-info, #034fd6);
    }

    .card--planned {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-subtle, #d0d0d0);
    }

    .card--deprecated {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-danger, #b31b1b);
    }

    .card--category {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-accent, #d92d2e);
    }

    .card--complexity {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-warning, #8b4b00);
    }

    .card__description {
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .card__link {
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-link, #d92d2e);
    }

    .card__note {
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .card {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-card-size-gap-default, 4px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      background-color: var(--fsds-card-color-background-default, #ffffff);
      border-color: var(--fsds-card-color-border-default, #b8b8b8);
      color: var(--fsds-card-color-foreground-primary, #141414);
      padding: var(--fsds-card-size-padding-default, 16px);
      border-radius: var(--fsds-card-size-radius-default, 8px);
      line-height: var(--fsds-card-typography-line-height-normal, 1.5);
      display: flex;
      flex-direction: column;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
      box-shadow: var(--fsds-card-elevation-resting, 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1));
      border-inline-start-width: var(--fsds-card-size-status-accent-width, 2px);
      border-inline-start-color: var(--fsds-card-color-status-accent-default, #d0d0d0);
      transition-property: box-shadow, border-color, background-color, transform;
      transition-duration: 150ms;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

      &:focus-visible {
        outline-width: var(--fsds-card-focus-ring-width, 2px);
        outline-color: var(--fsds-card-color-focus-ring, #0566fe);
        outline-offset: var(--fsds-card-focus-ring-offset, 2px);
        outline-style: solid;
      }
    }

    .card--interactive:hover {
      background-color: var(--fsds-card-color-background-hover, #d0d0d0);
      box-shadow: var(--fsds-card-elevation-raised, 0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.1));
      transform: translateY(-1px);
    }

    .card--interactive:active {
      box-shadow: var(--fsds-card-elevation-resting, 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1));
      transform: translateY(0);
    }

    .card--inset {
      padding: var(--fsds-card-size-padding-inset, 8px);
    }

    .card__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--fsds-card-size-gap-default, 4px);
      line-height: var(--fsds-card-typography-line-height-heading, 1);
      color: var(--fsds-card-color-foreground-primary, #141414);
    }

    .card__media {
      display: block;
      width: 100%;
      overflow: hidden;
      border-radius: var(--fsds-card-size-radius-default, 8px);
    }

    .card__content {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-card-size-gap-default, 4px);
      flex: 1 1 auto;
      color: var(--fsds-card-color-foreground-primary, #141414);
    }

    .card__description {
      margin: 0;
    }

    .card__footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--fsds-card-size-gap-default, 4px);
      padding-top: var(--fsds-card-size-padding-default, 16px);
      margin-top: auto;
      border-top-color: var(--fsds-card-color-border-default, #b8b8b8);
      border-top-style: solid;
      border-top-width: 1px;
    }

    .card__actions {
      display: flex;
      align-items: center;
      gap: var(--fsds-card-size-gap-default, 4px);
    }

    .card__badge {
      display: inline-flex;
      align-items: center;
      background-color: var(--fsds-card-color-badge-accent-background, #d92d2e);
      color: var(--fsds-card-color-badge-accent-foreground, #ffffff);
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 0.75em;
      line-height: 1.4;
    }

    .card__link {
      text-decoration: none;
    }

    .card__link:hover {
      text-decoration: underline;
    }

    .card__note {
      font-size: 0.875em;
      line-height: var(--fsds-card-typography-line-height-normal, 1.5);
    }
  `;

  override render() {
    return html`<fsds-stack as="header" class="card__header"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-card-header', CardHeaderElement);

export class CardContentElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .card {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-gap: var(--fsds-semantic-surface-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-surface-size-min-width, 64px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-card-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-card-color-background-hover: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-card-color-border-default: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-card-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-card-size-padding-inset: var(--fsds-core-spacing-size-04, 8px);
      --fsds-card-size-radius-default: var(--fsds-semantic-shape-radius-medium, 8px);
      --fsds-card-size-gap-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-card-typography-line-height-heading: var(--fsds-semantic-typography-line-height-heading, 1);
      --fsds-card-typography-line-height-normal: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-card-color-badge-success-background: var(--fsds-semantic-color-background-success-subtle, #b3dba7);
      --fsds-card-color-badge-success-foreground: var(--fsds-semantic-color-foreground-on-success-subtle, #2c4f09);
      --fsds-card-color-badge-warning-background: var(--fsds-semantic-color-background-warning-subtle, #fdc67f);
      --fsds-card-color-badge-warning-foreground: var(--fsds-semantic-color-foreground-on-warning-subtle, #6c3a00);
      --fsds-card-color-badge-info-background: var(--fsds-semantic-color-background-info-subtle, #95dafb);
      --fsds-card-color-badge-info-foreground: var(--fsds-semantic-color-foreground-on-info-subtle, #013ab0);
      --fsds-card-color-badge-error-background: var(--fsds-semantic-color-background-danger-subtle, #fac2c2);
      --fsds-card-color-badge-error-foreground: var(--fsds-semantic-color-foreground-on-danger-subtle, #900909);
      --fsds-card-color-badge-neutral-background: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-card-color-badge-neutral-foreground: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
      --fsds-card-color-badge-accent-background: var(--fsds-semantic-color-background-accent, #d92d2e);
      --fsds-card-color-badge-accent-foreground: var(--fsds-semantic-color-foreground-on-brand, #ffffff);
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-card-size-status-accent-width: var(--fsds-core-spacing-size-02, 2px);
      --fsds-card-elevation-resting: var(--fsds-semantic-elevation-surface-raised, 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1));
      --fsds-card-elevation-raised: var(--fsds-semantic-elevation-surface-floating, 0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.1));
      --fsds-card-color-focus-ring: var(--fsds-semantic-focus-ring-color, #0566fe);
      --fsds-card-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-card-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }

    .card--completed {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-success, #3a6614);
    }

    .card--in-progress {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-info, #034fd6);
    }

    .card--planned {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-subtle, #d0d0d0);
    }

    .card--deprecated {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-danger, #b31b1b);
    }

    .card--category {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-accent, #d92d2e);
    }

    .card--complexity {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-warning, #8b4b00);
    }

    .card__description {
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .card__link {
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-link, #d92d2e);
    }

    .card__note {
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .card {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-card-size-gap-default, 4px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      background-color: var(--fsds-card-color-background-default, #ffffff);
      border-color: var(--fsds-card-color-border-default, #b8b8b8);
      color: var(--fsds-card-color-foreground-primary, #141414);
      padding: var(--fsds-card-size-padding-default, 16px);
      border-radius: var(--fsds-card-size-radius-default, 8px);
      line-height: var(--fsds-card-typography-line-height-normal, 1.5);
      display: flex;
      flex-direction: column;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
      box-shadow: var(--fsds-card-elevation-resting, 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1));
      border-inline-start-width: var(--fsds-card-size-status-accent-width, 2px);
      border-inline-start-color: var(--fsds-card-color-status-accent-default, #d0d0d0);
      transition-property: box-shadow, border-color, background-color, transform;
      transition-duration: 150ms;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

      &:focus-visible {
        outline-width: var(--fsds-card-focus-ring-width, 2px);
        outline-color: var(--fsds-card-color-focus-ring, #0566fe);
        outline-offset: var(--fsds-card-focus-ring-offset, 2px);
        outline-style: solid;
      }
    }

    .card--interactive:hover {
      background-color: var(--fsds-card-color-background-hover, #d0d0d0);
      box-shadow: var(--fsds-card-elevation-raised, 0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.1));
      transform: translateY(-1px);
    }

    .card--interactive:active {
      box-shadow: var(--fsds-card-elevation-resting, 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1));
      transform: translateY(0);
    }

    .card--inset {
      padding: var(--fsds-card-size-padding-inset, 8px);
    }

    .card__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--fsds-card-size-gap-default, 4px);
      line-height: var(--fsds-card-typography-line-height-heading, 1);
      color: var(--fsds-card-color-foreground-primary, #141414);
    }

    .card__media {
      display: block;
      width: 100%;
      overflow: hidden;
      border-radius: var(--fsds-card-size-radius-default, 8px);
    }

    .card__content {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-card-size-gap-default, 4px);
      flex: 1 1 auto;
      color: var(--fsds-card-color-foreground-primary, #141414);
    }

    .card__description {
      margin: 0;
    }

    .card__footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--fsds-card-size-gap-default, 4px);
      padding-top: var(--fsds-card-size-padding-default, 16px);
      margin-top: auto;
      border-top-color: var(--fsds-card-color-border-default, #b8b8b8);
      border-top-style: solid;
      border-top-width: 1px;
    }

    .card__actions {
      display: flex;
      align-items: center;
      gap: var(--fsds-card-size-gap-default, 4px);
    }

    .card__badge {
      display: inline-flex;
      align-items: center;
      background-color: var(--fsds-card-color-badge-accent-background, #d92d2e);
      color: var(--fsds-card-color-badge-accent-foreground, #ffffff);
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 0.75em;
      line-height: 1.4;
    }

    .card__link {
      text-decoration: none;
    }

    .card__link:hover {
      text-decoration: underline;
    }

    .card__note {
      font-size: 0.875em;
      line-height: var(--fsds-card-typography-line-height-normal, 1.5);
    }
  `;

  override render() {
    return html`<fsds-stack class="card__content"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-card-content', CardContentElement);

export class CardFooterElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .card {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-gap: var(--fsds-semantic-surface-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-surface-size-min-width, 64px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-card-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-card-color-background-hover: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-card-color-border-default: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-card-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-card-size-padding-inset: var(--fsds-core-spacing-size-04, 8px);
      --fsds-card-size-radius-default: var(--fsds-semantic-shape-radius-medium, 8px);
      --fsds-card-size-gap-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-card-typography-line-height-heading: var(--fsds-semantic-typography-line-height-heading, 1);
      --fsds-card-typography-line-height-normal: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-card-color-badge-success-background: var(--fsds-semantic-color-background-success-subtle, #b3dba7);
      --fsds-card-color-badge-success-foreground: var(--fsds-semantic-color-foreground-on-success-subtle, #2c4f09);
      --fsds-card-color-badge-warning-background: var(--fsds-semantic-color-background-warning-subtle, #fdc67f);
      --fsds-card-color-badge-warning-foreground: var(--fsds-semantic-color-foreground-on-warning-subtle, #6c3a00);
      --fsds-card-color-badge-info-background: var(--fsds-semantic-color-background-info-subtle, #95dafb);
      --fsds-card-color-badge-info-foreground: var(--fsds-semantic-color-foreground-on-info-subtle, #013ab0);
      --fsds-card-color-badge-error-background: var(--fsds-semantic-color-background-danger-subtle, #fac2c2);
      --fsds-card-color-badge-error-foreground: var(--fsds-semantic-color-foreground-on-danger-subtle, #900909);
      --fsds-card-color-badge-neutral-background: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-card-color-badge-neutral-foreground: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
      --fsds-card-color-badge-accent-background: var(--fsds-semantic-color-background-accent, #d92d2e);
      --fsds-card-color-badge-accent-foreground: var(--fsds-semantic-color-foreground-on-brand, #ffffff);
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-card-size-status-accent-width: var(--fsds-core-spacing-size-02, 2px);
      --fsds-card-elevation-resting: var(--fsds-semantic-elevation-surface-raised, 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1));
      --fsds-card-elevation-raised: var(--fsds-semantic-elevation-surface-floating, 0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.1));
      --fsds-card-color-focus-ring: var(--fsds-semantic-focus-ring-color, #0566fe);
      --fsds-card-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-card-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }

    .card--completed {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-success, #3a6614);
    }

    .card--in-progress {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-info, #034fd6);
    }

    .card--planned {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-subtle, #d0d0d0);
    }

    .card--deprecated {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-danger, #b31b1b);
    }

    .card--category {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-accent, #d92d2e);
    }

    .card--complexity {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-warning, #8b4b00);
    }

    .card__description {
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .card__link {
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-link, #d92d2e);
    }

    .card__note {
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .card {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-card-size-gap-default, 4px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      background-color: var(--fsds-card-color-background-default, #ffffff);
      border-color: var(--fsds-card-color-border-default, #b8b8b8);
      color: var(--fsds-card-color-foreground-primary, #141414);
      padding: var(--fsds-card-size-padding-default, 16px);
      border-radius: var(--fsds-card-size-radius-default, 8px);
      line-height: var(--fsds-card-typography-line-height-normal, 1.5);
      display: flex;
      flex-direction: column;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
      box-shadow: var(--fsds-card-elevation-resting, 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1));
      border-inline-start-width: var(--fsds-card-size-status-accent-width, 2px);
      border-inline-start-color: var(--fsds-card-color-status-accent-default, #d0d0d0);
      transition-property: box-shadow, border-color, background-color, transform;
      transition-duration: 150ms;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

      &:focus-visible {
        outline-width: var(--fsds-card-focus-ring-width, 2px);
        outline-color: var(--fsds-card-color-focus-ring, #0566fe);
        outline-offset: var(--fsds-card-focus-ring-offset, 2px);
        outline-style: solid;
      }
    }

    .card--interactive:hover {
      background-color: var(--fsds-card-color-background-hover, #d0d0d0);
      box-shadow: var(--fsds-card-elevation-raised, 0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.1));
      transform: translateY(-1px);
    }

    .card--interactive:active {
      box-shadow: var(--fsds-card-elevation-resting, 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1));
      transform: translateY(0);
    }

    .card--inset {
      padding: var(--fsds-card-size-padding-inset, 8px);
    }

    .card__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--fsds-card-size-gap-default, 4px);
      line-height: var(--fsds-card-typography-line-height-heading, 1);
      color: var(--fsds-card-color-foreground-primary, #141414);
    }

    .card__media {
      display: block;
      width: 100%;
      overflow: hidden;
      border-radius: var(--fsds-card-size-radius-default, 8px);
    }

    .card__content {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-card-size-gap-default, 4px);
      flex: 1 1 auto;
      color: var(--fsds-card-color-foreground-primary, #141414);
    }

    .card__description {
      margin: 0;
    }

    .card__footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--fsds-card-size-gap-default, 4px);
      padding-top: var(--fsds-card-size-padding-default, 16px);
      margin-top: auto;
      border-top-color: var(--fsds-card-color-border-default, #b8b8b8);
      border-top-style: solid;
      border-top-width: 1px;
    }

    .card__actions {
      display: flex;
      align-items: center;
      gap: var(--fsds-card-size-gap-default, 4px);
    }

    .card__badge {
      display: inline-flex;
      align-items: center;
      background-color: var(--fsds-card-color-badge-accent-background, #d92d2e);
      color: var(--fsds-card-color-badge-accent-foreground, #ffffff);
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 0.75em;
      line-height: 1.4;
    }

    .card__link {
      text-decoration: none;
    }

    .card__link:hover {
      text-decoration: underline;
    }

    .card__note {
      font-size: 0.875em;
      line-height: var(--fsds-card-typography-line-height-normal, 1.5);
    }
  `;

  override render() {
    return html`<fsds-stack as="footer" variant="horizontal" class="card__footer"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-card-footer', CardFooterElement);

export class CardDescriptionElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .card {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-gap: var(--fsds-semantic-surface-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-surface-size-min-width, 64px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-card-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-card-color-background-hover: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-card-color-border-default: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-card-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-card-size-padding-inset: var(--fsds-core-spacing-size-04, 8px);
      --fsds-card-size-radius-default: var(--fsds-semantic-shape-radius-medium, 8px);
      --fsds-card-size-gap-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-card-typography-line-height-heading: var(--fsds-semantic-typography-line-height-heading, 1);
      --fsds-card-typography-line-height-normal: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-card-color-badge-success-background: var(--fsds-semantic-color-background-success-subtle, #b3dba7);
      --fsds-card-color-badge-success-foreground: var(--fsds-semantic-color-foreground-on-success-subtle, #2c4f09);
      --fsds-card-color-badge-warning-background: var(--fsds-semantic-color-background-warning-subtle, #fdc67f);
      --fsds-card-color-badge-warning-foreground: var(--fsds-semantic-color-foreground-on-warning-subtle, #6c3a00);
      --fsds-card-color-badge-info-background: var(--fsds-semantic-color-background-info-subtle, #95dafb);
      --fsds-card-color-badge-info-foreground: var(--fsds-semantic-color-foreground-on-info-subtle, #013ab0);
      --fsds-card-color-badge-error-background: var(--fsds-semantic-color-background-danger-subtle, #fac2c2);
      --fsds-card-color-badge-error-foreground: var(--fsds-semantic-color-foreground-on-danger-subtle, #900909);
      --fsds-card-color-badge-neutral-background: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-card-color-badge-neutral-foreground: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
      --fsds-card-color-badge-accent-background: var(--fsds-semantic-color-background-accent, #d92d2e);
      --fsds-card-color-badge-accent-foreground: var(--fsds-semantic-color-foreground-on-brand, #ffffff);
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-card-size-status-accent-width: var(--fsds-core-spacing-size-02, 2px);
      --fsds-card-elevation-resting: var(--fsds-semantic-elevation-surface-raised, 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1));
      --fsds-card-elevation-raised: var(--fsds-semantic-elevation-surface-floating, 0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.1));
      --fsds-card-color-focus-ring: var(--fsds-semantic-focus-ring-color, #0566fe);
      --fsds-card-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-card-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }

    .card--completed {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-success, #3a6614);
    }

    .card--in-progress {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-info, #034fd6);
    }

    .card--planned {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-subtle, #d0d0d0);
    }

    .card--deprecated {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-danger, #b31b1b);
    }

    .card--category {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-accent, #d92d2e);
    }

    .card--complexity {
      --fsds-card-color-status-accent-default: var(--fsds-semantic-color-border-warning, #8b4b00);
    }

    .card__description {
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .card__link {
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-link, #d92d2e);
    }

    .card__note {
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .card {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-card-size-gap-default, 4px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      background-color: var(--fsds-card-color-background-default, #ffffff);
      border-color: var(--fsds-card-color-border-default, #b8b8b8);
      color: var(--fsds-card-color-foreground-primary, #141414);
      padding: var(--fsds-card-size-padding-default, 16px);
      border-radius: var(--fsds-card-size-radius-default, 8px);
      line-height: var(--fsds-card-typography-line-height-normal, 1.5);
      display: flex;
      flex-direction: column;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
      box-shadow: var(--fsds-card-elevation-resting, 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1));
      border-inline-start-width: var(--fsds-card-size-status-accent-width, 2px);
      border-inline-start-color: var(--fsds-card-color-status-accent-default, #d0d0d0);
      transition-property: box-shadow, border-color, background-color, transform;
      transition-duration: 150ms;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

      &:focus-visible {
        outline-width: var(--fsds-card-focus-ring-width, 2px);
        outline-color: var(--fsds-card-color-focus-ring, #0566fe);
        outline-offset: var(--fsds-card-focus-ring-offset, 2px);
        outline-style: solid;
      }
    }

    .card--interactive:hover {
      background-color: var(--fsds-card-color-background-hover, #d0d0d0);
      box-shadow: var(--fsds-card-elevation-raised, 0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.1));
      transform: translateY(-1px);
    }

    .card--interactive:active {
      box-shadow: var(--fsds-card-elevation-resting, 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1));
      transform: translateY(0);
    }

    .card--inset {
      padding: var(--fsds-card-size-padding-inset, 8px);
    }

    .card__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--fsds-card-size-gap-default, 4px);
      line-height: var(--fsds-card-typography-line-height-heading, 1);
      color: var(--fsds-card-color-foreground-primary, #141414);
    }

    .card__media {
      display: block;
      width: 100%;
      overflow: hidden;
      border-radius: var(--fsds-card-size-radius-default, 8px);
    }

    .card__content {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-card-size-gap-default, 4px);
      flex: 1 1 auto;
      color: var(--fsds-card-color-foreground-primary, #141414);
    }

    .card__description {
      margin: 0;
    }

    .card__footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--fsds-card-size-gap-default, 4px);
      padding-top: var(--fsds-card-size-padding-default, 16px);
      margin-top: auto;
      border-top-color: var(--fsds-card-color-border-default, #b8b8b8);
      border-top-style: solid;
      border-top-width: 1px;
    }

    .card__actions {
      display: flex;
      align-items: center;
      gap: var(--fsds-card-size-gap-default, 4px);
    }

    .card__badge {
      display: inline-flex;
      align-items: center;
      background-color: var(--fsds-card-color-badge-accent-background, #d92d2e);
      color: var(--fsds-card-color-badge-accent-foreground, #ffffff);
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 0.75em;
      line-height: 1.4;
    }

    .card__link {
      text-decoration: none;
    }

    .card__link:hover {
      text-decoration: underline;
    }

    .card__note {
      font-size: 0.875em;
      line-height: var(--fsds-card-typography-line-height-normal, 1.5);
    }
  `;

  override render() {
    return html`<fsds-stack as="p" class="card__description"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-card-description', CardDescriptionElement);
// @generated:end

// @custom:start trailing

// @custom:end