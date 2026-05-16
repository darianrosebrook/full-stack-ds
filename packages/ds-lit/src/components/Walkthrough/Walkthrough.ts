// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { WalkthroughBehavior } from './WalkthroughBehavior.js';
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
  static override styles = css`:host { display: contents; }`;

  @property() steps?: WalkthroughStepSpec[];
  @property({ type: Number }) index?: number;
  @property({ type: Number }) defaultIndex?: number = 0;
  @property() label?: string = "Feature tour";
  @property() storageKey?: string;
  @property({ type: Boolean }) autoStart?: boolean = false;
  @property({ type: Boolean }) closeOnOutsideClick?: boolean = false;
  @property() placement?: WalkthroughPlacement = "auto";
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
    return html`<div class="${this.computeClasses()}" role="status" aria-label=${this.label}>
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
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack class="walkthrough__content"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-walkthrough-content', WalkthroughContentElement);

export class WalkthroughTitleElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="h3" class="walkthrough__title"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-walkthrough-title', WalkthroughTitleElement);

export class WalkthroughDescriptionElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="p" class="walkthrough__description"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-walkthrough-description', WalkthroughDescriptionElement);
// @generated:end

// @custom:start trailing

// @custom:end