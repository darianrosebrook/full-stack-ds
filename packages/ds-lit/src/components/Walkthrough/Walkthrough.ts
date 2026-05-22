// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { WalkthroughBehavior } from './WalkthroughBehavior.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type WalkthroughStepSpec = { anchor: string; title: string; description?: string };
export type WalkthroughPlacement = "top" | "bottom" | "left" | "right" | "auto";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class WalkthroughElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .walkthrough {
      --fsds-walkthrough-surface-bg: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-walkthrough-surface-border: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-walkthrough-surface-radius: var(--fsds-core-shape-radius-04, 16px);
      --fsds-walkthrough-surface-shadow: var(--fsds-semantic-elevation-surface-floating, 0 4px 24px rgba(0,0,0,0.12));
      --fsds-walkthrough-surface-padding: var(--fsds-core-spacing-size-08, 32px);
      --fsds-walkthrough-title-fontSize: var(--fsds-semantic-typography-heading-03, 20px);
      --fsds-walkthrough-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-walkthrough-title-color: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-walkthrough-description-fontSize: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-walkthrough-description-color: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-walkthrough-description-marginTop: var(--fsds-core-spacing-size-04, 8px);
      --fsds-walkthrough-controls-gap: var(--fsds-core-spacing-size-05, 12px);
      --fsds-walkthrough-controls-marginTop: var(--fsds-core-spacing-size-06, 16px);
      --fsds-walkthrough-dots-size: var(--fsds-core-spacing-size-02, 2px);
      --fsds-walkthrough-dots-gap: var(--fsds-core-spacing-size-03, 4px);
      --fsds-walkthrough-dots-active: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
      --fsds-walkthrough-dots-idle: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-walkthrough-button-primary-bg: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
      --fsds-walkthrough-button-primary-color: var(--fsds-semantic-color-action-foreground-primary-default, #ffffff);
      --fsds-walkthrough-button-primary-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-walkthrough-button-secondary-bg: var(--fsds-core-color-mode-transparent, transparent);
      --fsds-walkthrough-button-secondary-color: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-walkthrough-button-secondary-border: var(--fsds-semantic-color-border-subtle, #cecece);
    }
    
    .walkthrough {
      border-radius: var(--fsds-walkthrough-button-primary-radius);
      box-shadow: var(--fsds-walkthrough-surface-shadow);
      padding: var(--fsds-walkthrough-surface-padding);
      gap: var(--fsds-walkthrough-dots-gap);
    }
    
    .walkthrough__controls {
      gap: var(--fsds-walkthrough-controls-gap);
    }
    
    .walkthrough__dots {
      gap: var(--fsds-walkthrough-dots-gap);
    }
  `;

  @property({ attribute: false }) steps?: WalkthroughStepSpec[];
  @property({ type: Number }) index?: number;
  @property({ type: Number }) defaultIndex?: number = 0;
  @property({ type: String }) label?: string = "Feature tour";
  @property({ type: String }) storageKey?: string;
  @property({ type: Boolean }) autoStart?: boolean = false;
  @property({ type: Boolean }) closeOnOutsideClick?: boolean = false;
  @property({ attribute: false }) placement?: WalkthroughPlacement = "auto";
  @property({ attribute: false }) onStepChange?: (value: number) => void;

  private behavior = new WalkthroughBehavior(this, {
    index: () => this.index,
    defaultIndex: this.defaultIndex,
    onStepChange: (v) => this.onStepChange?.(v),
    closeOnOutsideClick: this.closeOnOutsideClick,
  });

  private computeClasses(): string {
    return [
      "walkthrough",
      this.placement ? `walkthrough--${this.placement}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" role="status" aria-label=${ifDefined(this.label)}>
  <div class=${'walkthrough__content'}>
    <h3 class=${'walkthrough__title'}>
      <slot name="title"></slot>
    </h3>
    <p class=${'walkthrough__description'}>
      <slot name="description"></slot>
    </p>
  </div>
  <div class=${'walkthrough__controls'}>
    <button class=${'walkthrough__skip'} type="button"></button>
    <button class=${'walkthrough__prev'} type="button"></button>
    <div class=${'walkthrough__dots'}>
      <button class=${'walkthrough__dot'} type="button"></button>
    </div>
    <span class=${'walkthrough__counter'}></span>
    <button class=${'walkthrough__next'} type="button"></button>
  </div>
</div>`;
  }
}

customElements.define('fsds-walkthrough', WalkthroughElement);

export class WalkthroughContentElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .walkthrough {
      --fsds-walkthrough-surface-bg: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-walkthrough-surface-border: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-walkthrough-surface-radius: var(--fsds-core-shape-radius-04, 16px);
      --fsds-walkthrough-surface-shadow: var(--fsds-semantic-elevation-surface-floating, 0 4px 24px rgba(0,0,0,0.12));
      --fsds-walkthrough-surface-padding: var(--fsds-core-spacing-size-08, 32px);
      --fsds-walkthrough-title-fontSize: var(--fsds-semantic-typography-heading-03, 20px);
      --fsds-walkthrough-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-walkthrough-title-color: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-walkthrough-description-fontSize: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-walkthrough-description-color: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-walkthrough-description-marginTop: var(--fsds-core-spacing-size-04, 8px);
      --fsds-walkthrough-controls-gap: var(--fsds-core-spacing-size-05, 12px);
      --fsds-walkthrough-controls-marginTop: var(--fsds-core-spacing-size-06, 16px);
      --fsds-walkthrough-dots-size: var(--fsds-core-spacing-size-02, 2px);
      --fsds-walkthrough-dots-gap: var(--fsds-core-spacing-size-03, 4px);
      --fsds-walkthrough-dots-active: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
      --fsds-walkthrough-dots-idle: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-walkthrough-button-primary-bg: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
      --fsds-walkthrough-button-primary-color: var(--fsds-semantic-color-action-foreground-primary-default, #ffffff);
      --fsds-walkthrough-button-primary-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-walkthrough-button-secondary-bg: var(--fsds-core-color-mode-transparent, transparent);
      --fsds-walkthrough-button-secondary-color: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-walkthrough-button-secondary-border: var(--fsds-semantic-color-border-subtle, #cecece);
    }
    
    .walkthrough {
      border-radius: var(--fsds-walkthrough-button-primary-radius);
      box-shadow: var(--fsds-walkthrough-surface-shadow);
      padding: var(--fsds-walkthrough-surface-padding);
      gap: var(--fsds-walkthrough-dots-gap);
    }
    
    .walkthrough__controls {
      gap: var(--fsds-walkthrough-controls-gap);
    }
    
    .walkthrough__dots {
      gap: var(--fsds-walkthrough-dots-gap);
    }
  `;

  override render() {
    return html`<fsds-stack class="walkthrough__content"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-walkthrough-content', WalkthroughContentElement);

export class WalkthroughTitleElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .walkthrough {
      --fsds-walkthrough-surface-bg: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-walkthrough-surface-border: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-walkthrough-surface-radius: var(--fsds-core-shape-radius-04, 16px);
      --fsds-walkthrough-surface-shadow: var(--fsds-semantic-elevation-surface-floating, 0 4px 24px rgba(0,0,0,0.12));
      --fsds-walkthrough-surface-padding: var(--fsds-core-spacing-size-08, 32px);
      --fsds-walkthrough-title-fontSize: var(--fsds-semantic-typography-heading-03, 20px);
      --fsds-walkthrough-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-walkthrough-title-color: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-walkthrough-description-fontSize: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-walkthrough-description-color: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-walkthrough-description-marginTop: var(--fsds-core-spacing-size-04, 8px);
      --fsds-walkthrough-controls-gap: var(--fsds-core-spacing-size-05, 12px);
      --fsds-walkthrough-controls-marginTop: var(--fsds-core-spacing-size-06, 16px);
      --fsds-walkthrough-dots-size: var(--fsds-core-spacing-size-02, 2px);
      --fsds-walkthrough-dots-gap: var(--fsds-core-spacing-size-03, 4px);
      --fsds-walkthrough-dots-active: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
      --fsds-walkthrough-dots-idle: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-walkthrough-button-primary-bg: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
      --fsds-walkthrough-button-primary-color: var(--fsds-semantic-color-action-foreground-primary-default, #ffffff);
      --fsds-walkthrough-button-primary-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-walkthrough-button-secondary-bg: var(--fsds-core-color-mode-transparent, transparent);
      --fsds-walkthrough-button-secondary-color: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-walkthrough-button-secondary-border: var(--fsds-semantic-color-border-subtle, #cecece);
    }
    
    .walkthrough {
      border-radius: var(--fsds-walkthrough-button-primary-radius);
      box-shadow: var(--fsds-walkthrough-surface-shadow);
      padding: var(--fsds-walkthrough-surface-padding);
      gap: var(--fsds-walkthrough-dots-gap);
    }
    
    .walkthrough__controls {
      gap: var(--fsds-walkthrough-controls-gap);
    }
    
    .walkthrough__dots {
      gap: var(--fsds-walkthrough-dots-gap);
    }
  `;

  override render() {
    return html`<fsds-stack as="h3" class="walkthrough__title"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-walkthrough-title', WalkthroughTitleElement);

export class WalkthroughDescriptionElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .walkthrough {
      --fsds-walkthrough-surface-bg: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-walkthrough-surface-border: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-walkthrough-surface-radius: var(--fsds-core-shape-radius-04, 16px);
      --fsds-walkthrough-surface-shadow: var(--fsds-semantic-elevation-surface-floating, 0 4px 24px rgba(0,0,0,0.12));
      --fsds-walkthrough-surface-padding: var(--fsds-core-spacing-size-08, 32px);
      --fsds-walkthrough-title-fontSize: var(--fsds-semantic-typography-heading-03, 20px);
      --fsds-walkthrough-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-walkthrough-title-color: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-walkthrough-description-fontSize: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-walkthrough-description-color: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-walkthrough-description-marginTop: var(--fsds-core-spacing-size-04, 8px);
      --fsds-walkthrough-controls-gap: var(--fsds-core-spacing-size-05, 12px);
      --fsds-walkthrough-controls-marginTop: var(--fsds-core-spacing-size-06, 16px);
      --fsds-walkthrough-dots-size: var(--fsds-core-spacing-size-02, 2px);
      --fsds-walkthrough-dots-gap: var(--fsds-core-spacing-size-03, 4px);
      --fsds-walkthrough-dots-active: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
      --fsds-walkthrough-dots-idle: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-walkthrough-button-primary-bg: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
      --fsds-walkthrough-button-primary-color: var(--fsds-semantic-color-action-foreground-primary-default, #ffffff);
      --fsds-walkthrough-button-primary-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-walkthrough-button-secondary-bg: var(--fsds-core-color-mode-transparent, transparent);
      --fsds-walkthrough-button-secondary-color: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-walkthrough-button-secondary-border: var(--fsds-semantic-color-border-subtle, #cecece);
    }
    
    .walkthrough {
      border-radius: var(--fsds-walkthrough-button-primary-radius);
      box-shadow: var(--fsds-walkthrough-surface-shadow);
      padding: var(--fsds-walkthrough-surface-padding);
      gap: var(--fsds-walkthrough-dots-gap);
    }
    
    .walkthrough__controls {
      gap: var(--fsds-walkthrough-controls-gap);
    }
    
    .walkthrough__dots {
      gap: var(--fsds-walkthrough-dots-gap);
    }
  `;

  override render() {
    return html`<fsds-stack as="p" class="walkthrough__description"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-walkthrough-description', WalkthroughDescriptionElement);
// @generated:end

// @custom:start trailing

// @custom:end