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
      --fsds-walkthrough-surface-bg: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-walkthrough-surface-border: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-walkthrough-surface-radius: var(--fsds-semantic-shape-radius-large, 16px);
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
      --fsds-walkthrough-dots-size: var(--fsds-core-spacing-size-04, 8px);
      --fsds-walkthrough-dots-gap: var(--fsds-core-spacing-size-03, 4px);
      --fsds-walkthrough-dots-active: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
      --fsds-walkthrough-dots-idle: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-walkthrough-button-primary-bg: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
      --fsds-walkthrough-button-primary-color: var(--fsds-semantic-color-action-foreground-primary-default, #ffffff);
      --fsds-walkthrough-button-primary-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-walkthrough-button-secondary-bg: var(--fsds-core-color-mode-transparent, transparent);
      --fsds-walkthrough-button-secondary-color: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-walkthrough-button-secondary-border: var(--fsds-semantic-color-border-subtle, #cecece);
    }

    .walkthrough {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-walkthrough-dots-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: var(--fsds-walkthrough-surface-bg);
      border-color: var(--fsds-walkthrough-surface-border);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-walkthrough-surface-radius);
      box-shadow: var(--fsds-walkthrough-surface-shadow);
      padding: var(--fsds-walkthrough-surface-padding);
    }

    .walkthrough__content {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-walkthrough-description-marginTop);
    }

    .walkthrough__title {
      margin: 0;
      font-size: var(--fsds-walkthrough-title-fontSize);
      font-weight: var(--fsds-walkthrough-title-fontWeight);
      color: var(--fsds-walkthrough-title-color);
    }

    .walkthrough__description {
      margin: 0;
      font-size: var(--fsds-walkthrough-description-fontSize);
      color: var(--fsds-walkthrough-description-color);
      line-height: 1.5;
    }

    .walkthrough__controls {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--fsds-walkthrough-controls-gap);
      margin-top: var(--fsds-walkthrough-controls-marginTop);
      border-top-color: var(--fsds-walkthrough-surface-border);
      border-top-style: solid;
      border-top-width: 1px;
      padding-top: var(--fsds-walkthrough-controls-marginTop);
    }

    .walkthrough__skip {
      background: transparent;
      border: none;
      color: var(--fsds-walkthrough-button-secondary-color);
      cursor: pointer;
      padding: 0;
      margin-right: auto;
    }

    .walkthrough__prev {
      background-color: var(--fsds-walkthrough-button-secondary-bg);
      border-color: var(--fsds-walkthrough-button-secondary-border);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-walkthrough-button-primary-radius);
      color: var(--fsds-walkthrough-button-secondary-color);
      cursor: pointer;
    }

    .walkthrough__next {
      background-color: var(--fsds-walkthrough-button-primary-bg);
      border: none;
      border-radius: var(--fsds-walkthrough-button-primary-radius);
      color: var(--fsds-walkthrough-button-primary-color);
      cursor: pointer;
    }

    .walkthrough__dots {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: var(--fsds-walkthrough-dots-gap);
    }

    .walkthrough__dot {
      display: block;
      width: var(--fsds-walkthrough-dots-size);
      height: var(--fsds-walkthrough-dots-size);
      border-radius: 50%;
      background-color: var(--fsds-walkthrough-dots-idle);
      border: none;
      padding: 0;
      cursor: pointer;
    }

    .walkthrough__counter {
      color: var(--fsds-walkthrough-description-color);
      font-size: var(--fsds-walkthrough-description-fontSize);
    }
  `;

  @property({ attribute: false }) steps?: WalkthroughStepSpec[] = [{"anchor":"#step-1","title":"Welcome to the tour"},{"anchor":"#step-2","title":"Browse your dashboard"},{"anchor":"#step-3","title":"Configure preferences"}];
  @property({ type: Number }) index?: number;
  @property({ type: Number }) defaultIndex?: number = 0;
  @property({ attribute: false }) onStepChange?: (index: number) => void;
  @property({ attribute: false }) onComplete?: () => void;
  @property({ attribute: false }) onSkip?: () => void;
  @property({ type: String }) label?: string = "Feature tour";
  @property({ type: String }) storageKey?: string;
  @property({ type: Boolean }) autoStart?: boolean = false;
  @property({ type: Boolean }) closeOnOutsideClick?: boolean = false;
  @property({ type: String }) placement?: WalkthroughPlacement = "auto";

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
      ${(this.steps ?? []).map((item, index) => html`
      <button class=${'walkthrough__dot'} type="button" aria-label=${item.title} data-step-index=${index}></button>
      `)}
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
      --fsds-walkthrough-surface-bg: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-walkthrough-surface-border: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-walkthrough-surface-radius: var(--fsds-semantic-shape-radius-large, 16px);
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
      --fsds-walkthrough-dots-size: var(--fsds-core-spacing-size-04, 8px);
      --fsds-walkthrough-dots-gap: var(--fsds-core-spacing-size-03, 4px);
      --fsds-walkthrough-dots-active: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
      --fsds-walkthrough-dots-idle: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-walkthrough-button-primary-bg: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
      --fsds-walkthrough-button-primary-color: var(--fsds-semantic-color-action-foreground-primary-default, #ffffff);
      --fsds-walkthrough-button-primary-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-walkthrough-button-secondary-bg: var(--fsds-core-color-mode-transparent, transparent);
      --fsds-walkthrough-button-secondary-color: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-walkthrough-button-secondary-border: var(--fsds-semantic-color-border-subtle, #cecece);
    }

    .walkthrough {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-walkthrough-dots-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: var(--fsds-walkthrough-surface-bg);
      border-color: var(--fsds-walkthrough-surface-border);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-walkthrough-surface-radius);
      box-shadow: var(--fsds-walkthrough-surface-shadow);
      padding: var(--fsds-walkthrough-surface-padding);
    }

    .walkthrough__content {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-walkthrough-description-marginTop);
    }

    .walkthrough__title {
      margin: 0;
      font-size: var(--fsds-walkthrough-title-fontSize);
      font-weight: var(--fsds-walkthrough-title-fontWeight);
      color: var(--fsds-walkthrough-title-color);
    }

    .walkthrough__description {
      margin: 0;
      font-size: var(--fsds-walkthrough-description-fontSize);
      color: var(--fsds-walkthrough-description-color);
      line-height: 1.5;
    }

    .walkthrough__controls {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--fsds-walkthrough-controls-gap);
      margin-top: var(--fsds-walkthrough-controls-marginTop);
      border-top-color: var(--fsds-walkthrough-surface-border);
      border-top-style: solid;
      border-top-width: 1px;
      padding-top: var(--fsds-walkthrough-controls-marginTop);
    }

    .walkthrough__skip {
      background: transparent;
      border: none;
      color: var(--fsds-walkthrough-button-secondary-color);
      cursor: pointer;
      padding: 0;
      margin-right: auto;
    }

    .walkthrough__prev {
      background-color: var(--fsds-walkthrough-button-secondary-bg);
      border-color: var(--fsds-walkthrough-button-secondary-border);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-walkthrough-button-primary-radius);
      color: var(--fsds-walkthrough-button-secondary-color);
      cursor: pointer;
    }

    .walkthrough__next {
      background-color: var(--fsds-walkthrough-button-primary-bg);
      border: none;
      border-radius: var(--fsds-walkthrough-button-primary-radius);
      color: var(--fsds-walkthrough-button-primary-color);
      cursor: pointer;
    }

    .walkthrough__dots {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: var(--fsds-walkthrough-dots-gap);
    }

    .walkthrough__dot {
      display: block;
      width: var(--fsds-walkthrough-dots-size);
      height: var(--fsds-walkthrough-dots-size);
      border-radius: 50%;
      background-color: var(--fsds-walkthrough-dots-idle);
      border: none;
      padding: 0;
      cursor: pointer;
    }

    .walkthrough__counter {
      color: var(--fsds-walkthrough-description-color);
      font-size: var(--fsds-walkthrough-description-fontSize);
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
      --fsds-walkthrough-surface-bg: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-walkthrough-surface-border: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-walkthrough-surface-radius: var(--fsds-semantic-shape-radius-large, 16px);
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
      --fsds-walkthrough-dots-size: var(--fsds-core-spacing-size-04, 8px);
      --fsds-walkthrough-dots-gap: var(--fsds-core-spacing-size-03, 4px);
      --fsds-walkthrough-dots-active: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
      --fsds-walkthrough-dots-idle: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-walkthrough-button-primary-bg: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
      --fsds-walkthrough-button-primary-color: var(--fsds-semantic-color-action-foreground-primary-default, #ffffff);
      --fsds-walkthrough-button-primary-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-walkthrough-button-secondary-bg: var(--fsds-core-color-mode-transparent, transparent);
      --fsds-walkthrough-button-secondary-color: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-walkthrough-button-secondary-border: var(--fsds-semantic-color-border-subtle, #cecece);
    }

    .walkthrough {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-walkthrough-dots-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: var(--fsds-walkthrough-surface-bg);
      border-color: var(--fsds-walkthrough-surface-border);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-walkthrough-surface-radius);
      box-shadow: var(--fsds-walkthrough-surface-shadow);
      padding: var(--fsds-walkthrough-surface-padding);
    }

    .walkthrough__content {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-walkthrough-description-marginTop);
    }

    .walkthrough__title {
      margin: 0;
      font-size: var(--fsds-walkthrough-title-fontSize);
      font-weight: var(--fsds-walkthrough-title-fontWeight);
      color: var(--fsds-walkthrough-title-color);
    }

    .walkthrough__description {
      margin: 0;
      font-size: var(--fsds-walkthrough-description-fontSize);
      color: var(--fsds-walkthrough-description-color);
      line-height: 1.5;
    }

    .walkthrough__controls {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--fsds-walkthrough-controls-gap);
      margin-top: var(--fsds-walkthrough-controls-marginTop);
      border-top-color: var(--fsds-walkthrough-surface-border);
      border-top-style: solid;
      border-top-width: 1px;
      padding-top: var(--fsds-walkthrough-controls-marginTop);
    }

    .walkthrough__skip {
      background: transparent;
      border: none;
      color: var(--fsds-walkthrough-button-secondary-color);
      cursor: pointer;
      padding: 0;
      margin-right: auto;
    }

    .walkthrough__prev {
      background-color: var(--fsds-walkthrough-button-secondary-bg);
      border-color: var(--fsds-walkthrough-button-secondary-border);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-walkthrough-button-primary-radius);
      color: var(--fsds-walkthrough-button-secondary-color);
      cursor: pointer;
    }

    .walkthrough__next {
      background-color: var(--fsds-walkthrough-button-primary-bg);
      border: none;
      border-radius: var(--fsds-walkthrough-button-primary-radius);
      color: var(--fsds-walkthrough-button-primary-color);
      cursor: pointer;
    }

    .walkthrough__dots {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: var(--fsds-walkthrough-dots-gap);
    }

    .walkthrough__dot {
      display: block;
      width: var(--fsds-walkthrough-dots-size);
      height: var(--fsds-walkthrough-dots-size);
      border-radius: 50%;
      background-color: var(--fsds-walkthrough-dots-idle);
      border: none;
      padding: 0;
      cursor: pointer;
    }

    .walkthrough__counter {
      color: var(--fsds-walkthrough-description-color);
      font-size: var(--fsds-walkthrough-description-fontSize);
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
      --fsds-walkthrough-surface-bg: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-walkthrough-surface-border: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-walkthrough-surface-radius: var(--fsds-semantic-shape-radius-large, 16px);
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
      --fsds-walkthrough-dots-size: var(--fsds-core-spacing-size-04, 8px);
      --fsds-walkthrough-dots-gap: var(--fsds-core-spacing-size-03, 4px);
      --fsds-walkthrough-dots-active: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
      --fsds-walkthrough-dots-idle: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-walkthrough-button-primary-bg: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
      --fsds-walkthrough-button-primary-color: var(--fsds-semantic-color-action-foreground-primary-default, #ffffff);
      --fsds-walkthrough-button-primary-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-walkthrough-button-secondary-bg: var(--fsds-core-color-mode-transparent, transparent);
      --fsds-walkthrough-button-secondary-color: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-walkthrough-button-secondary-border: var(--fsds-semantic-color-border-subtle, #cecece);
    }

    .walkthrough {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-walkthrough-dots-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: var(--fsds-walkthrough-surface-bg);
      border-color: var(--fsds-walkthrough-surface-border);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-walkthrough-surface-radius);
      box-shadow: var(--fsds-walkthrough-surface-shadow);
      padding: var(--fsds-walkthrough-surface-padding);
    }

    .walkthrough__content {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-walkthrough-description-marginTop);
    }

    .walkthrough__title {
      margin: 0;
      font-size: var(--fsds-walkthrough-title-fontSize);
      font-weight: var(--fsds-walkthrough-title-fontWeight);
      color: var(--fsds-walkthrough-title-color);
    }

    .walkthrough__description {
      margin: 0;
      font-size: var(--fsds-walkthrough-description-fontSize);
      color: var(--fsds-walkthrough-description-color);
      line-height: 1.5;
    }

    .walkthrough__controls {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--fsds-walkthrough-controls-gap);
      margin-top: var(--fsds-walkthrough-controls-marginTop);
      border-top-color: var(--fsds-walkthrough-surface-border);
      border-top-style: solid;
      border-top-width: 1px;
      padding-top: var(--fsds-walkthrough-controls-marginTop);
    }

    .walkthrough__skip {
      background: transparent;
      border: none;
      color: var(--fsds-walkthrough-button-secondary-color);
      cursor: pointer;
      padding: 0;
      margin-right: auto;
    }

    .walkthrough__prev {
      background-color: var(--fsds-walkthrough-button-secondary-bg);
      border-color: var(--fsds-walkthrough-button-secondary-border);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-walkthrough-button-primary-radius);
      color: var(--fsds-walkthrough-button-secondary-color);
      cursor: pointer;
    }

    .walkthrough__next {
      background-color: var(--fsds-walkthrough-button-primary-bg);
      border: none;
      border-radius: var(--fsds-walkthrough-button-primary-radius);
      color: var(--fsds-walkthrough-button-primary-color);
      cursor: pointer;
    }

    .walkthrough__dots {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: var(--fsds-walkthrough-dots-gap);
    }

    .walkthrough__dot {
      display: block;
      width: var(--fsds-walkthrough-dots-size);
      height: var(--fsds-walkthrough-dots-size);
      border-radius: 50%;
      background-color: var(--fsds-walkthrough-dots-idle);
      border: none;
      padding: 0;
      cursor: pointer;
    }

    .walkthrough__counter {
      color: var(--fsds-walkthrough-description-color);
      font-size: var(--fsds-walkthrough-description-fontSize);
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