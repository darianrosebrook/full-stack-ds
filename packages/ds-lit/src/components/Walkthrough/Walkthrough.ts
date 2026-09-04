// @generated:start imports
import { LitElement, html, css, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { WalkthroughBehavior } from './WalkthroughBehavior.js';
import { AnchoredPositionController } from '../../primitives/surfaces/AnchoredPositionController.js';
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
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 16px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-walkthrough-surface-bg: var(--fsds-semantic-color-background-secondary, #f7f7f7);
      --fsds-walkthrough-surface-border: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-walkthrough-surface-radius: var(--fsds-semantic-shape-radius-large, 16px);
      --fsds-walkthrough-surface-shadow: var(--fsds-semantic-elevation-surface-floating, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      --fsds-walkthrough-surface-padding: var(--fsds-core-spacing-size-08, 32px);
      --fsds-walkthrough-title-font-size: var(--fsds-semantic-typography-heading-03, 20px);
      --fsds-walkthrough-title-font-weight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-walkthrough-title-color: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-walkthrough-description-font-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-walkthrough-description-color: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-walkthrough-description-margin-top: var(--fsds-core-spacing-size-04, 8px);
      --fsds-walkthrough-controls-gap: var(--fsds-core-spacing-size-05, 12px);
      --fsds-walkthrough-controls-margin-top: var(--fsds-core-spacing-size-06, 16px);
      --fsds-walkthrough-dots-size: var(--fsds-core-spacing-size-04, 8px);
      --fsds-walkthrough-dots-gap: var(--fsds-core-spacing-size-03, 4px);
      --fsds-walkthrough-dots-active: var(--fsds-semantic-color-action-background-primary-default, #0566fe);
      --fsds-walkthrough-dots-idle: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-walkthrough-button-primary-bg: var(--fsds-semantic-color-action-background-primary-default, #0566fe);
      --fsds-walkthrough-button-primary-color: var(--fsds-semantic-color-action-foreground-primary-default, #ffffff);
      --fsds-walkthrough-button-primary-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-walkthrough-button-secondary-bg: var(--fsds-core-color-mode-transparent, #00000000);
      --fsds-walkthrough-button-secondary-color: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-walkthrough-button-secondary-border: var(--fsds-semantic-color-border-subtle, #d0d0d0);
    }

    .walkthrough {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-walkthrough-dots-gap, 4px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: var(--fsds-walkthrough-surface-bg, #f7f7f7);
      border-color: var(--fsds-walkthrough-surface-border, #d0d0d0);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-walkthrough-surface-radius, 16px);
      box-shadow: var(--fsds-walkthrough-surface-shadow, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      padding: var(--fsds-walkthrough-surface-padding, 32px);
    }

    .walkthrough__content {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-walkthrough-description-margin-top, 8px);
    }

    .walkthrough__title {
      margin: 0;
      font-size: var(--fsds-walkthrough-title-font-size, 20px);
      font-weight: var(--fsds-walkthrough-title-font-weight, 700);
      color: var(--fsds-walkthrough-title-color, #141414);
    }

    .walkthrough__description {
      margin: 0;
      font-size: var(--fsds-walkthrough-description-font-size, 16px);
      color: var(--fsds-walkthrough-description-color, #474647);
      line-height: 1.5;
    }

    .walkthrough__controls {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--fsds-walkthrough-controls-gap, 12px);
      margin-top: var(--fsds-walkthrough-controls-margin-top, 16px);
      border-top-color: var(--fsds-walkthrough-surface-border, #d0d0d0);
      border-top-style: solid;
      border-top-width: 1px;
      padding-top: var(--fsds-walkthrough-controls-margin-top, 16px);
    }

    .walkthrough__skip {
      background: transparent;
      border: none;
      color: var(--fsds-walkthrough-button-secondary-color, #474647);
      cursor: pointer;
      padding: 0;
      margin-right: auto;
    }

    .walkthrough__prev {
      background-color: var(--fsds-walkthrough-button-secondary-bg, #00000000);
      border-color: var(--fsds-walkthrough-button-secondary-border, #d0d0d0);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-walkthrough-button-primary-radius, 6px);
      color: var(--fsds-walkthrough-button-secondary-color, #474647);
      cursor: pointer;
    }

    .walkthrough__next {
      background-color: var(--fsds-walkthrough-button-primary-bg, #0566fe);
      border: none;
      border-radius: var(--fsds-walkthrough-button-primary-radius, 6px);
      color: var(--fsds-walkthrough-button-primary-color, #ffffff);
      cursor: pointer;
    }

    .walkthrough__dots {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: var(--fsds-walkthrough-dots-gap, 4px);
    }

    .walkthrough__dot {
      display: block;
      width: var(--fsds-walkthrough-dots-size, 8px);
      height: var(--fsds-walkthrough-dots-size, 8px);
      border-radius: 50%;
      background-color: var(--fsds-walkthrough-dots-idle, #d0d0d0);
      border: none;
      padding: 0;
      cursor: pointer;
    }

    .walkthrough__counter {
      color: var(--fsds-walkthrough-description-color, #474647);
      font-size: var(--fsds-walkthrough-description-font-size, 16px);
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

  private _moving = false;
  private _portaled = false;
  private _portalOriginParent: Node | null = null;
  private _portalOriginNext: Node | null = null;

  private _anchorTargetEl: HTMLElement | null = null;
  private _position = new AnchoredPositionController(this, {
    anchor: () => this._anchorTargetEl,
    content: () => this,
    open: () => true,
    placement: () => ((this.placement ?? "auto") as "top" | "bottom" | "left" | "right" | "auto"),
    collision: () => "flip-shift",
    onChange: () => this.requestUpdate(),
  });

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "walkthrough");
    if (!this._portaled && typeof document !== "undefined" && this.parentNode && this.parentNode !== document.body) {
      this._portalOriginParent = this.parentNode;
      this._portalOriginNext = this.nextSibling;
      this._portaled = true;
      this._moving = true;
      document.body.appendChild(this);
      this._moving = false;
    }
  }

  override disconnectedCallback(): void {
    if (!this._moving) {
      if (this._portalOriginParent && this._portalOriginParent.isConnected) {
        this._portalOriginParent.insertBefore(this, this._portalOriginNext);
      }
      this._portaled = false;
      this._portalOriginParent = null;
      this._portalOriginNext = null;
    }
    super.disconnectedCallback();
  }

  override willUpdate(_changedProperties: PropertyValues<this>): void {
    // Re-query on every update pass — the anchor lives outside this
    // element's tree, so a per-property changed-set check can't see
    // mutations to the target page (only index/steps changes are
    // reactive triggers here, but re-resolving is cheap and idempotent).
    const selector = ((this.steps ?? [{"anchor":"#step-1","title":"Welcome to the tour"},{"anchor":"#step-2","title":"Browse your dashboard"},{"anchor":"#step-3","title":"Configure preferences"}]))[this.index ?? 0]?.anchor;
    this._anchorTargetEl = selector && typeof document !== "undefined" ? document.querySelector<HTMLElement>(selector) : null;
  }

  override updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);
    // A stale scheduled update landing after a genuine disconnect must
    // be a no-op — it must NOT resurrect inline positioning on an
    // element that has already torn down.
    if (!this.isConnected) return;
    const pos = this._position.state;
    // The static :host rule is display: contents (no box), which would
    // make position: fixed a layout no-op. Give the host a real box
    // before applying fixed positioning.
    this.style.display = "block";
    this.style.position = "fixed";
    this.style.top = `${pos.top}px`;
    this.style.left = `${pos.left}px`;
    this.style.visibility = pos.ready ? "visible" : "hidden";
    this.setAttribute("data-placement", pos.placement);
  }

  private computeClasses(): string {
    return [
      "walkthrough",
      (this.placement ?? "auto") ? `walkthrough--${(this.placement ?? "auto")}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" role="status" aria-label=${ifDefined((this.label ?? "Feature tour"))}>
  <div class=${'walkthrough__content'} role="group" aria-labelledby=${ifDefined([this.querySelector('[slot="title"]') !== null ? 'walkthrough-title' : null].filter(Boolean).join(' ') || undefined)} aria-describedby=${ifDefined([this.querySelector('[slot="description"]') !== null ? 'walkthrough-description' : null].filter(Boolean).join(' ') || undefined)}>
    <h3 class=${'walkthrough__title'} aria-label=${ifDefined((this.label ?? "Feature tour"))} id="walkthrough-title">
      <slot name="title" @slotchange=${() => this.requestUpdate()}></slot>
    </h3>
    <p class=${'walkthrough__description'} id="walkthrough-description">
      <slot name="description" @slotchange=${() => this.requestUpdate()}></slot>
    </p>
  </div>
  <div class=${'walkthrough__controls'}>
    <button class=${'walkthrough__skip'} type="button" aria-label="Skip tour"></button>
    <button class=${'walkthrough__prev'} type="button" aria-label="Previous step"></button>
    <div class=${'walkthrough__dots'}>
      ${((this.steps ?? [{"anchor":"#step-1","title":"Welcome to the tour"},{"anchor":"#step-2","title":"Browse your dashboard"},{"anchor":"#step-3","title":"Configure preferences"}])).map((item, index) => html`
      <button class=${'walkthrough__dot'} type="button" aria-label=${item.title} data-step-index=${index}></button>
      `)}
    </div>
    <span class=${'walkthrough__counter'}></span>
    <button class=${'walkthrough__next'} type="button" aria-label="Next step"></button>
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
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 16px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-walkthrough-surface-bg: var(--fsds-semantic-color-background-secondary, #f7f7f7);
      --fsds-walkthrough-surface-border: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-walkthrough-surface-radius: var(--fsds-semantic-shape-radius-large, 16px);
      --fsds-walkthrough-surface-shadow: var(--fsds-semantic-elevation-surface-floating, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      --fsds-walkthrough-surface-padding: var(--fsds-core-spacing-size-08, 32px);
      --fsds-walkthrough-title-font-size: var(--fsds-semantic-typography-heading-03, 20px);
      --fsds-walkthrough-title-font-weight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-walkthrough-title-color: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-walkthrough-description-font-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-walkthrough-description-color: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-walkthrough-description-margin-top: var(--fsds-core-spacing-size-04, 8px);
      --fsds-walkthrough-controls-gap: var(--fsds-core-spacing-size-05, 12px);
      --fsds-walkthrough-controls-margin-top: var(--fsds-core-spacing-size-06, 16px);
      --fsds-walkthrough-dots-size: var(--fsds-core-spacing-size-04, 8px);
      --fsds-walkthrough-dots-gap: var(--fsds-core-spacing-size-03, 4px);
      --fsds-walkthrough-dots-active: var(--fsds-semantic-color-action-background-primary-default, #0566fe);
      --fsds-walkthrough-dots-idle: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-walkthrough-button-primary-bg: var(--fsds-semantic-color-action-background-primary-default, #0566fe);
      --fsds-walkthrough-button-primary-color: var(--fsds-semantic-color-action-foreground-primary-default, #ffffff);
      --fsds-walkthrough-button-primary-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-walkthrough-button-secondary-bg: var(--fsds-core-color-mode-transparent, #00000000);
      --fsds-walkthrough-button-secondary-color: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-walkthrough-button-secondary-border: var(--fsds-semantic-color-border-subtle, #d0d0d0);
    }

    .walkthrough {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-walkthrough-dots-gap, 4px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: var(--fsds-walkthrough-surface-bg, #f7f7f7);
      border-color: var(--fsds-walkthrough-surface-border, #d0d0d0);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-walkthrough-surface-radius, 16px);
      box-shadow: var(--fsds-walkthrough-surface-shadow, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      padding: var(--fsds-walkthrough-surface-padding, 32px);
    }

    .walkthrough__content {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-walkthrough-description-margin-top, 8px);
    }

    .walkthrough__title {
      margin: 0;
      font-size: var(--fsds-walkthrough-title-font-size, 20px);
      font-weight: var(--fsds-walkthrough-title-font-weight, 700);
      color: var(--fsds-walkthrough-title-color, #141414);
    }

    .walkthrough__description {
      margin: 0;
      font-size: var(--fsds-walkthrough-description-font-size, 16px);
      color: var(--fsds-walkthrough-description-color, #474647);
      line-height: 1.5;
    }

    .walkthrough__controls {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--fsds-walkthrough-controls-gap, 12px);
      margin-top: var(--fsds-walkthrough-controls-margin-top, 16px);
      border-top-color: var(--fsds-walkthrough-surface-border, #d0d0d0);
      border-top-style: solid;
      border-top-width: 1px;
      padding-top: var(--fsds-walkthrough-controls-margin-top, 16px);
    }

    .walkthrough__skip {
      background: transparent;
      border: none;
      color: var(--fsds-walkthrough-button-secondary-color, #474647);
      cursor: pointer;
      padding: 0;
      margin-right: auto;
    }

    .walkthrough__prev {
      background-color: var(--fsds-walkthrough-button-secondary-bg, #00000000);
      border-color: var(--fsds-walkthrough-button-secondary-border, #d0d0d0);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-walkthrough-button-primary-radius, 6px);
      color: var(--fsds-walkthrough-button-secondary-color, #474647);
      cursor: pointer;
    }

    .walkthrough__next {
      background-color: var(--fsds-walkthrough-button-primary-bg, #0566fe);
      border: none;
      border-radius: var(--fsds-walkthrough-button-primary-radius, 6px);
      color: var(--fsds-walkthrough-button-primary-color, #ffffff);
      cursor: pointer;
    }

    .walkthrough__dots {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: var(--fsds-walkthrough-dots-gap, 4px);
    }

    .walkthrough__dot {
      display: block;
      width: var(--fsds-walkthrough-dots-size, 8px);
      height: var(--fsds-walkthrough-dots-size, 8px);
      border-radius: 50%;
      background-color: var(--fsds-walkthrough-dots-idle, #d0d0d0);
      border: none;
      padding: 0;
      cursor: pointer;
    }

    .walkthrough__counter {
      color: var(--fsds-walkthrough-description-color, #474647);
      font-size: var(--fsds-walkthrough-description-font-size, 16px);
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
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 16px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-walkthrough-surface-bg: var(--fsds-semantic-color-background-secondary, #f7f7f7);
      --fsds-walkthrough-surface-border: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-walkthrough-surface-radius: var(--fsds-semantic-shape-radius-large, 16px);
      --fsds-walkthrough-surface-shadow: var(--fsds-semantic-elevation-surface-floating, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      --fsds-walkthrough-surface-padding: var(--fsds-core-spacing-size-08, 32px);
      --fsds-walkthrough-title-font-size: var(--fsds-semantic-typography-heading-03, 20px);
      --fsds-walkthrough-title-font-weight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-walkthrough-title-color: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-walkthrough-description-font-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-walkthrough-description-color: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-walkthrough-description-margin-top: var(--fsds-core-spacing-size-04, 8px);
      --fsds-walkthrough-controls-gap: var(--fsds-core-spacing-size-05, 12px);
      --fsds-walkthrough-controls-margin-top: var(--fsds-core-spacing-size-06, 16px);
      --fsds-walkthrough-dots-size: var(--fsds-core-spacing-size-04, 8px);
      --fsds-walkthrough-dots-gap: var(--fsds-core-spacing-size-03, 4px);
      --fsds-walkthrough-dots-active: var(--fsds-semantic-color-action-background-primary-default, #0566fe);
      --fsds-walkthrough-dots-idle: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-walkthrough-button-primary-bg: var(--fsds-semantic-color-action-background-primary-default, #0566fe);
      --fsds-walkthrough-button-primary-color: var(--fsds-semantic-color-action-foreground-primary-default, #ffffff);
      --fsds-walkthrough-button-primary-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-walkthrough-button-secondary-bg: var(--fsds-core-color-mode-transparent, #00000000);
      --fsds-walkthrough-button-secondary-color: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-walkthrough-button-secondary-border: var(--fsds-semantic-color-border-subtle, #d0d0d0);
    }

    .walkthrough {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-walkthrough-dots-gap, 4px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: var(--fsds-walkthrough-surface-bg, #f7f7f7);
      border-color: var(--fsds-walkthrough-surface-border, #d0d0d0);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-walkthrough-surface-radius, 16px);
      box-shadow: var(--fsds-walkthrough-surface-shadow, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      padding: var(--fsds-walkthrough-surface-padding, 32px);
    }

    .walkthrough__content {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-walkthrough-description-margin-top, 8px);
    }

    .walkthrough__title {
      margin: 0;
      font-size: var(--fsds-walkthrough-title-font-size, 20px);
      font-weight: var(--fsds-walkthrough-title-font-weight, 700);
      color: var(--fsds-walkthrough-title-color, #141414);
    }

    .walkthrough__description {
      margin: 0;
      font-size: var(--fsds-walkthrough-description-font-size, 16px);
      color: var(--fsds-walkthrough-description-color, #474647);
      line-height: 1.5;
    }

    .walkthrough__controls {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--fsds-walkthrough-controls-gap, 12px);
      margin-top: var(--fsds-walkthrough-controls-margin-top, 16px);
      border-top-color: var(--fsds-walkthrough-surface-border, #d0d0d0);
      border-top-style: solid;
      border-top-width: 1px;
      padding-top: var(--fsds-walkthrough-controls-margin-top, 16px);
    }

    .walkthrough__skip {
      background: transparent;
      border: none;
      color: var(--fsds-walkthrough-button-secondary-color, #474647);
      cursor: pointer;
      padding: 0;
      margin-right: auto;
    }

    .walkthrough__prev {
      background-color: var(--fsds-walkthrough-button-secondary-bg, #00000000);
      border-color: var(--fsds-walkthrough-button-secondary-border, #d0d0d0);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-walkthrough-button-primary-radius, 6px);
      color: var(--fsds-walkthrough-button-secondary-color, #474647);
      cursor: pointer;
    }

    .walkthrough__next {
      background-color: var(--fsds-walkthrough-button-primary-bg, #0566fe);
      border: none;
      border-radius: var(--fsds-walkthrough-button-primary-radius, 6px);
      color: var(--fsds-walkthrough-button-primary-color, #ffffff);
      cursor: pointer;
    }

    .walkthrough__dots {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: var(--fsds-walkthrough-dots-gap, 4px);
    }

    .walkthrough__dot {
      display: block;
      width: var(--fsds-walkthrough-dots-size, 8px);
      height: var(--fsds-walkthrough-dots-size, 8px);
      border-radius: 50%;
      background-color: var(--fsds-walkthrough-dots-idle, #d0d0d0);
      border: none;
      padding: 0;
      cursor: pointer;
    }

    .walkthrough__counter {
      color: var(--fsds-walkthrough-description-color, #474647);
      font-size: var(--fsds-walkthrough-description-font-size, 16px);
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
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 16px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-walkthrough-surface-bg: var(--fsds-semantic-color-background-secondary, #f7f7f7);
      --fsds-walkthrough-surface-border: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-walkthrough-surface-radius: var(--fsds-semantic-shape-radius-large, 16px);
      --fsds-walkthrough-surface-shadow: var(--fsds-semantic-elevation-surface-floating, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      --fsds-walkthrough-surface-padding: var(--fsds-core-spacing-size-08, 32px);
      --fsds-walkthrough-title-font-size: var(--fsds-semantic-typography-heading-03, 20px);
      --fsds-walkthrough-title-font-weight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-walkthrough-title-color: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-walkthrough-description-font-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-walkthrough-description-color: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-walkthrough-description-margin-top: var(--fsds-core-spacing-size-04, 8px);
      --fsds-walkthrough-controls-gap: var(--fsds-core-spacing-size-05, 12px);
      --fsds-walkthrough-controls-margin-top: var(--fsds-core-spacing-size-06, 16px);
      --fsds-walkthrough-dots-size: var(--fsds-core-spacing-size-04, 8px);
      --fsds-walkthrough-dots-gap: var(--fsds-core-spacing-size-03, 4px);
      --fsds-walkthrough-dots-active: var(--fsds-semantic-color-action-background-primary-default, #0566fe);
      --fsds-walkthrough-dots-idle: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-walkthrough-button-primary-bg: var(--fsds-semantic-color-action-background-primary-default, #0566fe);
      --fsds-walkthrough-button-primary-color: var(--fsds-semantic-color-action-foreground-primary-default, #ffffff);
      --fsds-walkthrough-button-primary-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-walkthrough-button-secondary-bg: var(--fsds-core-color-mode-transparent, #00000000);
      --fsds-walkthrough-button-secondary-color: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-walkthrough-button-secondary-border: var(--fsds-semantic-color-border-subtle, #d0d0d0);
    }

    .walkthrough {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-walkthrough-dots-gap, 4px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: var(--fsds-walkthrough-surface-bg, #f7f7f7);
      border-color: var(--fsds-walkthrough-surface-border, #d0d0d0);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-walkthrough-surface-radius, 16px);
      box-shadow: var(--fsds-walkthrough-surface-shadow, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      padding: var(--fsds-walkthrough-surface-padding, 32px);
    }

    .walkthrough__content {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-walkthrough-description-margin-top, 8px);
    }

    .walkthrough__title {
      margin: 0;
      font-size: var(--fsds-walkthrough-title-font-size, 20px);
      font-weight: var(--fsds-walkthrough-title-font-weight, 700);
      color: var(--fsds-walkthrough-title-color, #141414);
    }

    .walkthrough__description {
      margin: 0;
      font-size: var(--fsds-walkthrough-description-font-size, 16px);
      color: var(--fsds-walkthrough-description-color, #474647);
      line-height: 1.5;
    }

    .walkthrough__controls {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--fsds-walkthrough-controls-gap, 12px);
      margin-top: var(--fsds-walkthrough-controls-margin-top, 16px);
      border-top-color: var(--fsds-walkthrough-surface-border, #d0d0d0);
      border-top-style: solid;
      border-top-width: 1px;
      padding-top: var(--fsds-walkthrough-controls-margin-top, 16px);
    }

    .walkthrough__skip {
      background: transparent;
      border: none;
      color: var(--fsds-walkthrough-button-secondary-color, #474647);
      cursor: pointer;
      padding: 0;
      margin-right: auto;
    }

    .walkthrough__prev {
      background-color: var(--fsds-walkthrough-button-secondary-bg, #00000000);
      border-color: var(--fsds-walkthrough-button-secondary-border, #d0d0d0);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-walkthrough-button-primary-radius, 6px);
      color: var(--fsds-walkthrough-button-secondary-color, #474647);
      cursor: pointer;
    }

    .walkthrough__next {
      background-color: var(--fsds-walkthrough-button-primary-bg, #0566fe);
      border: none;
      border-radius: var(--fsds-walkthrough-button-primary-radius, 6px);
      color: var(--fsds-walkthrough-button-primary-color, #ffffff);
      cursor: pointer;
    }

    .walkthrough__dots {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: var(--fsds-walkthrough-dots-gap, 4px);
    }

    .walkthrough__dot {
      display: block;
      width: var(--fsds-walkthrough-dots-size, 8px);
      height: var(--fsds-walkthrough-dots-size, 8px);
      border-radius: 50%;
      background-color: var(--fsds-walkthrough-dots-idle, #d0d0d0);
      border: none;
      padding: 0;
      cursor: pointer;
    }

    .walkthrough__counter {
      color: var(--fsds-walkthrough-description-color, #474647);
      font-size: var(--fsds-walkthrough-description-font-size, 16px);
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