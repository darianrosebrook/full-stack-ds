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
  static override styles = css`
    :host { display: contents; }
    .card {
      --fsds-card-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-card-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-card-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-card-color-foreground-link: var(--fsds-semantic-color-foreground-link, #d9292b);
      --fsds-card-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-card-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-card-size-gap-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-card-typography-lineHeight-heading: var(--fsds-semantic-typography-line-height-heading, 1);
      --fsds-card-typography-lineHeight-normal: var(--fsds-semantic-typography-line-height-normal, 1.5);
    
      &:hover {
        --fsds-card-color-background-hover: var(--fsds-semantic-color-background-secondary, #efefef);
      }
    
      &__badge {
        --fsds-card-color-badge-success-background: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
        --fsds-card-color-badge-success-foreground: var(--fsds-semantic-color-foreground-on-success-subtle, #234104);
        --fsds-card-color-badge-warning-background: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
        --fsds-card-color-badge-warning-foreground: var(--fsds-semantic-color-foreground-on-warning-subtle, #593000);
        --fsds-card-color-badge-info-background: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
        --fsds-card-color-badge-info-foreground: var(--fsds-semantic-color-foreground-on-info-subtle, #002d99);
        --fsds-card-color-badge-error-background: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
        --fsds-card-color-badge-error-foreground: var(--fsds-semantic-color-foreground-on-danger-subtle, #7b0000);
        --fsds-card-color-badge-neutral-background: var(--fsds-semantic-color-background-secondary, #efefef);
        --fsds-card-color-badge-neutral-foreground: var(--fsds-semantic-color-foreground-secondary, #555555);
        --fsds-card-color-badge-accent-background: var(--fsds-semantic-color-background-accent, #d9292b);
        --fsds-card-color-badge-accent-foreground: var(--fsds-semantic-color-foreground-on-brand, #ffffff);
      }
    }
    
    .card {
      background-color: var(--fsds-card-color-background-default);
      border-color: var(--fsds-card-color-border-default);
      color: var(--fsds-card-color-foreground-link);
      padding: var(--fsds-card-size-padding-default);
      border-radius: var(--fsds-card-size-radius-default);
      gap: var(--fsds-card-size-gap-default);
      line-height: var(--fsds-card-typography-lineHeight-normal);
    
      &:hover {
        background-color: var(--fsds-card-color-background-hover);
      }
    
      &__badge {
        background-color: var(--fsds-card-color-badge-accent-background);
        color: var(--fsds-card-color-badge-accent-foreground);
      }
    }
  `;

  @property({ type: Boolean })
  interactive?: boolean;
  @property({ attribute: false })
  status?: CardStatus;

  override render() {
    const classes = {
      'card': true,
      [`card--${this.status}`]: !!this.status,
    };
    return html`<fsds-stack role="group" class=${classMap(classes)}><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-card', CardElement);

export class CardHeaderElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .card {
      --fsds-card-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-card-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-card-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-card-color-foreground-link: var(--fsds-semantic-color-foreground-link, #d9292b);
      --fsds-card-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-card-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-card-size-gap-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-card-typography-lineHeight-heading: var(--fsds-semantic-typography-line-height-heading, 1);
      --fsds-card-typography-lineHeight-normal: var(--fsds-semantic-typography-line-height-normal, 1.5);
    
      &:hover {
        --fsds-card-color-background-hover: var(--fsds-semantic-color-background-secondary, #efefef);
      }
    
      &__badge {
        --fsds-card-color-badge-success-background: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
        --fsds-card-color-badge-success-foreground: var(--fsds-semantic-color-foreground-on-success-subtle, #234104);
        --fsds-card-color-badge-warning-background: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
        --fsds-card-color-badge-warning-foreground: var(--fsds-semantic-color-foreground-on-warning-subtle, #593000);
        --fsds-card-color-badge-info-background: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
        --fsds-card-color-badge-info-foreground: var(--fsds-semantic-color-foreground-on-info-subtle, #002d99);
        --fsds-card-color-badge-error-background: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
        --fsds-card-color-badge-error-foreground: var(--fsds-semantic-color-foreground-on-danger-subtle, #7b0000);
        --fsds-card-color-badge-neutral-background: var(--fsds-semantic-color-background-secondary, #efefef);
        --fsds-card-color-badge-neutral-foreground: var(--fsds-semantic-color-foreground-secondary, #555555);
        --fsds-card-color-badge-accent-background: var(--fsds-semantic-color-background-accent, #d9292b);
        --fsds-card-color-badge-accent-foreground: var(--fsds-semantic-color-foreground-on-brand, #ffffff);
      }
    }
    
    .card {
      background-color: var(--fsds-card-color-background-default);
      border-color: var(--fsds-card-color-border-default);
      color: var(--fsds-card-color-foreground-link);
      padding: var(--fsds-card-size-padding-default);
      border-radius: var(--fsds-card-size-radius-default);
      gap: var(--fsds-card-size-gap-default);
      line-height: var(--fsds-card-typography-lineHeight-normal);
    
      &:hover {
        background-color: var(--fsds-card-color-background-hover);
      }
    
      &__badge {
        background-color: var(--fsds-card-color-badge-accent-background);
        color: var(--fsds-card-color-badge-accent-foreground);
      }
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
      --fsds-card-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-card-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-card-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-card-color-foreground-link: var(--fsds-semantic-color-foreground-link, #d9292b);
      --fsds-card-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-card-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-card-size-gap-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-card-typography-lineHeight-heading: var(--fsds-semantic-typography-line-height-heading, 1);
      --fsds-card-typography-lineHeight-normal: var(--fsds-semantic-typography-line-height-normal, 1.5);
    
      &:hover {
        --fsds-card-color-background-hover: var(--fsds-semantic-color-background-secondary, #efefef);
      }
    
      &__badge {
        --fsds-card-color-badge-success-background: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
        --fsds-card-color-badge-success-foreground: var(--fsds-semantic-color-foreground-on-success-subtle, #234104);
        --fsds-card-color-badge-warning-background: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
        --fsds-card-color-badge-warning-foreground: var(--fsds-semantic-color-foreground-on-warning-subtle, #593000);
        --fsds-card-color-badge-info-background: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
        --fsds-card-color-badge-info-foreground: var(--fsds-semantic-color-foreground-on-info-subtle, #002d99);
        --fsds-card-color-badge-error-background: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
        --fsds-card-color-badge-error-foreground: var(--fsds-semantic-color-foreground-on-danger-subtle, #7b0000);
        --fsds-card-color-badge-neutral-background: var(--fsds-semantic-color-background-secondary, #efefef);
        --fsds-card-color-badge-neutral-foreground: var(--fsds-semantic-color-foreground-secondary, #555555);
        --fsds-card-color-badge-accent-background: var(--fsds-semantic-color-background-accent, #d9292b);
        --fsds-card-color-badge-accent-foreground: var(--fsds-semantic-color-foreground-on-brand, #ffffff);
      }
    }
    
    .card {
      background-color: var(--fsds-card-color-background-default);
      border-color: var(--fsds-card-color-border-default);
      color: var(--fsds-card-color-foreground-link);
      padding: var(--fsds-card-size-padding-default);
      border-radius: var(--fsds-card-size-radius-default);
      gap: var(--fsds-card-size-gap-default);
      line-height: var(--fsds-card-typography-lineHeight-normal);
    
      &:hover {
        background-color: var(--fsds-card-color-background-hover);
      }
    
      &__badge {
        background-color: var(--fsds-card-color-badge-accent-background);
        color: var(--fsds-card-color-badge-accent-foreground);
      }
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
      --fsds-card-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-card-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-card-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-card-color-foreground-link: var(--fsds-semantic-color-foreground-link, #d9292b);
      --fsds-card-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-card-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-card-size-gap-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-card-typography-lineHeight-heading: var(--fsds-semantic-typography-line-height-heading, 1);
      --fsds-card-typography-lineHeight-normal: var(--fsds-semantic-typography-line-height-normal, 1.5);
    
      &:hover {
        --fsds-card-color-background-hover: var(--fsds-semantic-color-background-secondary, #efefef);
      }
    
      &__badge {
        --fsds-card-color-badge-success-background: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
        --fsds-card-color-badge-success-foreground: var(--fsds-semantic-color-foreground-on-success-subtle, #234104);
        --fsds-card-color-badge-warning-background: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
        --fsds-card-color-badge-warning-foreground: var(--fsds-semantic-color-foreground-on-warning-subtle, #593000);
        --fsds-card-color-badge-info-background: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
        --fsds-card-color-badge-info-foreground: var(--fsds-semantic-color-foreground-on-info-subtle, #002d99);
        --fsds-card-color-badge-error-background: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
        --fsds-card-color-badge-error-foreground: var(--fsds-semantic-color-foreground-on-danger-subtle, #7b0000);
        --fsds-card-color-badge-neutral-background: var(--fsds-semantic-color-background-secondary, #efefef);
        --fsds-card-color-badge-neutral-foreground: var(--fsds-semantic-color-foreground-secondary, #555555);
        --fsds-card-color-badge-accent-background: var(--fsds-semantic-color-background-accent, #d9292b);
        --fsds-card-color-badge-accent-foreground: var(--fsds-semantic-color-foreground-on-brand, #ffffff);
      }
    }
    
    .card {
      background-color: var(--fsds-card-color-background-default);
      border-color: var(--fsds-card-color-border-default);
      color: var(--fsds-card-color-foreground-link);
      padding: var(--fsds-card-size-padding-default);
      border-radius: var(--fsds-card-size-radius-default);
      gap: var(--fsds-card-size-gap-default);
      line-height: var(--fsds-card-typography-lineHeight-normal);
    
      &:hover {
        background-color: var(--fsds-card-color-background-hover);
      }
    
      &__badge {
        background-color: var(--fsds-card-color-badge-accent-background);
        color: var(--fsds-card-color-badge-accent-foreground);
      }
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
      --fsds-card-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-card-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-card-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-card-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-card-color-foreground-link: var(--fsds-semantic-color-foreground-link, #d9292b);
      --fsds-card-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-card-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-card-size-gap-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-card-typography-lineHeight-heading: var(--fsds-semantic-typography-line-height-heading, 1);
      --fsds-card-typography-lineHeight-normal: var(--fsds-semantic-typography-line-height-normal, 1.5);
    
      &:hover {
        --fsds-card-color-background-hover: var(--fsds-semantic-color-background-secondary, #efefef);
      }
    
      &__badge {
        --fsds-card-color-badge-success-background: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
        --fsds-card-color-badge-success-foreground: var(--fsds-semantic-color-foreground-on-success-subtle, #234104);
        --fsds-card-color-badge-warning-background: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
        --fsds-card-color-badge-warning-foreground: var(--fsds-semantic-color-foreground-on-warning-subtle, #593000);
        --fsds-card-color-badge-info-background: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
        --fsds-card-color-badge-info-foreground: var(--fsds-semantic-color-foreground-on-info-subtle, #002d99);
        --fsds-card-color-badge-error-background: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
        --fsds-card-color-badge-error-foreground: var(--fsds-semantic-color-foreground-on-danger-subtle, #7b0000);
        --fsds-card-color-badge-neutral-background: var(--fsds-semantic-color-background-secondary, #efefef);
        --fsds-card-color-badge-neutral-foreground: var(--fsds-semantic-color-foreground-secondary, #555555);
        --fsds-card-color-badge-accent-background: var(--fsds-semantic-color-background-accent, #d9292b);
        --fsds-card-color-badge-accent-foreground: var(--fsds-semantic-color-foreground-on-brand, #ffffff);
      }
    }
    
    .card {
      background-color: var(--fsds-card-color-background-default);
      border-color: var(--fsds-card-color-border-default);
      color: var(--fsds-card-color-foreground-link);
      padding: var(--fsds-card-size-padding-default);
      border-radius: var(--fsds-card-size-radius-default);
      gap: var(--fsds-card-size-gap-default);
      line-height: var(--fsds-card-typography-lineHeight-normal);
    
      &:hover {
        background-color: var(--fsds-card-color-background-hover);
      }
    
      &__badge {
        background-color: var(--fsds-card-color-badge-accent-background);
        color: var(--fsds-card-color-badge-accent-foreground);
      }
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