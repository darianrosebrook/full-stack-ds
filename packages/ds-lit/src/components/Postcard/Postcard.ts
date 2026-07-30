// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type PostcardAuthor = { name: string; handle: string; avatar: string };
export type PostcardStats = { likes: number; replies: number; reposts: number };
export type PostcardEmbed = { type: 'image' | 'video' | 'audio'; url: string; aspectRatio: { width: number; height: number } };
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class PostcardElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .postcard {
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
      --fsds-postcard-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-postcard-color-background-hover: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-postcard-color-border-default: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-postcard-color-border-hover: var(--fsds-semantic-color-border-bold, #888889);
      --fsds-postcard-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-postcard-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-postcard-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-postcard-size-radius-full: var(--fsds-semantic-shape-control-radius-pill, 9999px);
      --fsds-postcard-size-gap-default: var(--fsds-core-spacing-size-05, 12px);
      --fsds-postcard-size-border-default: var(--fsds-semantic-shape-control-border-default-width, 1px);
      --fsds-postcard-typography-display-name-font-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-postcard-typography-display-name-font-weight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-postcard-typography-handle-font-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-postcard-typography-content-font-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-postcard-typography-content-line-height: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-postcard-typography-footer-font-size: var(--fsds-semantic-typography-body-03, 14px);
    }

    .postcard__userInfo {
      --fsds-postcard-size-gap-default: var(--fsds-core-spacing-size-03, 4px);
    }

    .postcard__handle {
      --fsds-postcard-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .postcard__timestamp {
      --fsds-postcard-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .postcard__stat {
      --fsds-postcard-size-gap-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-postcard-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .postcard {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-postcard-size-gap-default, 12px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      background-color: var(--fsds-postcard-color-background-default, #ffffff);
      padding: var(--fsds-postcard-size-padding-default, 16px);
      border-radius: var(--fsds-postcard-size-radius-default, 6px);
      line-height: var(--fsds-postcard-typography-content-line-height, 1.5);
      display: flex;
      flex-direction: column;
      border-style: solid;
      border-width: var(--fsds-postcard-size-border-default, 1px);
      box-sizing: border-box;
      border-color: var(--fsds-postcard-color-border-default, #b8b8b8);
      color: var(--fsds-postcard-color-foreground-primary, #141414);

      &:hover {
        background-color: var(--fsds-postcard-color-background-hover, #d0d0d0);
        border-color: var(--fsds-postcard-color-border-hover, #888889);
      }
    }

    .postcard__content {
      line-height: var(--fsds-postcard-typography-content-line-height, 1.5);
      display: flex;
      flex-direction: column;
      gap: var(--fsds-postcard-size-gap-default, 12px);
      color: var(--fsds-postcard-color-foreground-primary, #141414);
      font-size: var(--fsds-postcard-typography-content-font-size, 16px);
    }

    .postcard__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fsds-postcard-size-gap-default, 12px);
    }

    .postcard__userInfo {
      display: flex;
      align-items: center;
      flex: 1 1 auto;
    }

    .postcard__displayName {
      font-weight: var(--fsds-postcard-typography-display-name-font-weight, 500);
      font-size: var(--fsds-postcard-typography-display-name-font-size, 16px);
      color: var(--fsds-postcard-color-foreground-primary, #141414);
    }

    .postcard__handle {
      font-size: var(--fsds-postcard-typography-handle-font-size, 14px);
    }

    .postcard__timestamp {
      font-size: var(--fsds-postcard-typography-footer-font-size, 14px);
      flex-shrink: 0;
    }

    .postcard__footer {
      display: flex;
      align-items: center;
      gap: var(--fsds-postcard-size-gap-default, 12px);
      padding-top: var(--fsds-postcard-size-padding-default, 16px);
      border-top-color: var(--fsds-postcard-color-border-default, #b8b8b8);
      border-top-style: solid;
      border-top-width: var(--fsds-postcard-size-border-default, 1px);
      font-size: var(--fsds-postcard-typography-footer-font-size, 14px);
    }

    .postcard__stats {
      display: flex;
      align-items: center;
      gap: var(--fsds-postcard-size-gap-default, 12px);
    }

    .postcard__stat {
      display: inline-flex;
      align-items: center;
      font-size: var(--fsds-postcard-typography-footer-font-size, 14px);
    }
  `;

  @property({ type: String }) postId!: string;
  @property({ attribute: false }) author!: PostcardAuthor;
  @property({ type: String }) timestamp!: string;
  @property({ attribute: false }) stats!: PostcardStats;
  @property({ attribute: false }) embed?: PostcardEmbed;
  @property() type?: string;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "postcard");
  }

  private computeClasses(): string {
    return [
      "postcard",
      this.type ? `postcard--${this.type}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<article class="${this.computeClasses()}">
  <div class=${'postcard__header'}>
    <div class=${'postcard__userInfo'}>
      <span class=${'postcard__displayName'}></span>
      <span class=${'postcard__handle'}></span>
    </div>
    <time class=${'postcard__timestamp'}></time>
  </div>
  <div class=${'postcard__content'}>
    <slot></slot>
  </div>
  <div class=${'postcard__footer'}>
    <div class=${'postcard__stats'}>
      <span class=${'postcard__stat'}></span>
    </div>
  </div>
</article>`;
  }
}

customElements.define('fsds-postcard', PostcardElement);

export class PostcardHeaderElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .postcard {
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
      --fsds-postcard-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-postcard-color-background-hover: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-postcard-color-border-default: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-postcard-color-border-hover: var(--fsds-semantic-color-border-bold, #888889);
      --fsds-postcard-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-postcard-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-postcard-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-postcard-size-radius-full: var(--fsds-semantic-shape-control-radius-pill, 9999px);
      --fsds-postcard-size-gap-default: var(--fsds-core-spacing-size-05, 12px);
      --fsds-postcard-size-border-default: var(--fsds-semantic-shape-control-border-default-width, 1px);
      --fsds-postcard-typography-display-name-font-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-postcard-typography-display-name-font-weight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-postcard-typography-handle-font-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-postcard-typography-content-font-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-postcard-typography-content-line-height: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-postcard-typography-footer-font-size: var(--fsds-semantic-typography-body-03, 14px);
    }

    .postcard__userInfo {
      --fsds-postcard-size-gap-default: var(--fsds-core-spacing-size-03, 4px);
    }

    .postcard__handle {
      --fsds-postcard-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .postcard__timestamp {
      --fsds-postcard-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .postcard__stat {
      --fsds-postcard-size-gap-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-postcard-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .postcard {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-postcard-size-gap-default, 12px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      background-color: var(--fsds-postcard-color-background-default, #ffffff);
      padding: var(--fsds-postcard-size-padding-default, 16px);
      border-radius: var(--fsds-postcard-size-radius-default, 6px);
      line-height: var(--fsds-postcard-typography-content-line-height, 1.5);
      display: flex;
      flex-direction: column;
      border-style: solid;
      border-width: var(--fsds-postcard-size-border-default, 1px);
      box-sizing: border-box;
      border-color: var(--fsds-postcard-color-border-default, #b8b8b8);
      color: var(--fsds-postcard-color-foreground-primary, #141414);

      &:hover {
        background-color: var(--fsds-postcard-color-background-hover, #d0d0d0);
        border-color: var(--fsds-postcard-color-border-hover, #888889);
      }
    }

    .postcard__content {
      line-height: var(--fsds-postcard-typography-content-line-height, 1.5);
      display: flex;
      flex-direction: column;
      gap: var(--fsds-postcard-size-gap-default, 12px);
      color: var(--fsds-postcard-color-foreground-primary, #141414);
      font-size: var(--fsds-postcard-typography-content-font-size, 16px);
    }

    .postcard__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fsds-postcard-size-gap-default, 12px);
    }

    .postcard__userInfo {
      display: flex;
      align-items: center;
      flex: 1 1 auto;
    }

    .postcard__displayName {
      font-weight: var(--fsds-postcard-typography-display-name-font-weight, 500);
      font-size: var(--fsds-postcard-typography-display-name-font-size, 16px);
      color: var(--fsds-postcard-color-foreground-primary, #141414);
    }

    .postcard__handle {
      font-size: var(--fsds-postcard-typography-handle-font-size, 14px);
    }

    .postcard__timestamp {
      font-size: var(--fsds-postcard-typography-footer-font-size, 14px);
      flex-shrink: 0;
    }

    .postcard__footer {
      display: flex;
      align-items: center;
      gap: var(--fsds-postcard-size-gap-default, 12px);
      padding-top: var(--fsds-postcard-size-padding-default, 16px);
      border-top-color: var(--fsds-postcard-color-border-default, #b8b8b8);
      border-top-style: solid;
      border-top-width: var(--fsds-postcard-size-border-default, 1px);
      font-size: var(--fsds-postcard-typography-footer-font-size, 14px);
    }

    .postcard__stats {
      display: flex;
      align-items: center;
      gap: var(--fsds-postcard-size-gap-default, 12px);
    }

    .postcard__stat {
      display: inline-flex;
      align-items: center;
      font-size: var(--fsds-postcard-typography-footer-font-size, 14px);
    }
  `;

  override render() {
    return html`<fsds-stack as="header" class="postcard__header"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-postcard-header', PostcardHeaderElement);

export class PostcardContentElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .postcard {
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
      --fsds-postcard-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-postcard-color-background-hover: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-postcard-color-border-default: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-postcard-color-border-hover: var(--fsds-semantic-color-border-bold, #888889);
      --fsds-postcard-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-postcard-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-postcard-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-postcard-size-radius-full: var(--fsds-semantic-shape-control-radius-pill, 9999px);
      --fsds-postcard-size-gap-default: var(--fsds-core-spacing-size-05, 12px);
      --fsds-postcard-size-border-default: var(--fsds-semantic-shape-control-border-default-width, 1px);
      --fsds-postcard-typography-display-name-font-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-postcard-typography-display-name-font-weight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-postcard-typography-handle-font-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-postcard-typography-content-font-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-postcard-typography-content-line-height: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-postcard-typography-footer-font-size: var(--fsds-semantic-typography-body-03, 14px);
    }

    .postcard__userInfo {
      --fsds-postcard-size-gap-default: var(--fsds-core-spacing-size-03, 4px);
    }

    .postcard__handle {
      --fsds-postcard-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .postcard__timestamp {
      --fsds-postcard-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .postcard__stat {
      --fsds-postcard-size-gap-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-postcard-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .postcard {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-postcard-size-gap-default, 12px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      background-color: var(--fsds-postcard-color-background-default, #ffffff);
      padding: var(--fsds-postcard-size-padding-default, 16px);
      border-radius: var(--fsds-postcard-size-radius-default, 6px);
      line-height: var(--fsds-postcard-typography-content-line-height, 1.5);
      display: flex;
      flex-direction: column;
      border-style: solid;
      border-width: var(--fsds-postcard-size-border-default, 1px);
      box-sizing: border-box;
      border-color: var(--fsds-postcard-color-border-default, #b8b8b8);
      color: var(--fsds-postcard-color-foreground-primary, #141414);

      &:hover {
        background-color: var(--fsds-postcard-color-background-hover, #d0d0d0);
        border-color: var(--fsds-postcard-color-border-hover, #888889);
      }
    }

    .postcard__content {
      line-height: var(--fsds-postcard-typography-content-line-height, 1.5);
      display: flex;
      flex-direction: column;
      gap: var(--fsds-postcard-size-gap-default, 12px);
      color: var(--fsds-postcard-color-foreground-primary, #141414);
      font-size: var(--fsds-postcard-typography-content-font-size, 16px);
    }

    .postcard__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fsds-postcard-size-gap-default, 12px);
    }

    .postcard__userInfo {
      display: flex;
      align-items: center;
      flex: 1 1 auto;
    }

    .postcard__displayName {
      font-weight: var(--fsds-postcard-typography-display-name-font-weight, 500);
      font-size: var(--fsds-postcard-typography-display-name-font-size, 16px);
      color: var(--fsds-postcard-color-foreground-primary, #141414);
    }

    .postcard__handle {
      font-size: var(--fsds-postcard-typography-handle-font-size, 14px);
    }

    .postcard__timestamp {
      font-size: var(--fsds-postcard-typography-footer-font-size, 14px);
      flex-shrink: 0;
    }

    .postcard__footer {
      display: flex;
      align-items: center;
      gap: var(--fsds-postcard-size-gap-default, 12px);
      padding-top: var(--fsds-postcard-size-padding-default, 16px);
      border-top-color: var(--fsds-postcard-color-border-default, #b8b8b8);
      border-top-style: solid;
      border-top-width: var(--fsds-postcard-size-border-default, 1px);
      font-size: var(--fsds-postcard-typography-footer-font-size, 14px);
    }

    .postcard__stats {
      display: flex;
      align-items: center;
      gap: var(--fsds-postcard-size-gap-default, 12px);
    }

    .postcard__stat {
      display: inline-flex;
      align-items: center;
      font-size: var(--fsds-postcard-typography-footer-font-size, 14px);
    }
  `;

  override render() {
    return html`<fsds-stack class="postcard__content"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-postcard-content', PostcardContentElement);

export class PostcardFooterElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .postcard {
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
      --fsds-postcard-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-postcard-color-background-hover: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-postcard-color-border-default: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-postcard-color-border-hover: var(--fsds-semantic-color-border-bold, #888889);
      --fsds-postcard-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-postcard-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-postcard-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-postcard-size-radius-full: var(--fsds-semantic-shape-control-radius-pill, 9999px);
      --fsds-postcard-size-gap-default: var(--fsds-core-spacing-size-05, 12px);
      --fsds-postcard-size-border-default: var(--fsds-semantic-shape-control-border-default-width, 1px);
      --fsds-postcard-typography-display-name-font-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-postcard-typography-display-name-font-weight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-postcard-typography-handle-font-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-postcard-typography-content-font-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-postcard-typography-content-line-height: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-postcard-typography-footer-font-size: var(--fsds-semantic-typography-body-03, 14px);
    }

    .postcard__userInfo {
      --fsds-postcard-size-gap-default: var(--fsds-core-spacing-size-03, 4px);
    }

    .postcard__handle {
      --fsds-postcard-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .postcard__timestamp {
      --fsds-postcard-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .postcard__stat {
      --fsds-postcard-size-gap-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-postcard-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .postcard {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-postcard-size-gap-default, 12px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      background-color: var(--fsds-postcard-color-background-default, #ffffff);
      padding: var(--fsds-postcard-size-padding-default, 16px);
      border-radius: var(--fsds-postcard-size-radius-default, 6px);
      line-height: var(--fsds-postcard-typography-content-line-height, 1.5);
      display: flex;
      flex-direction: column;
      border-style: solid;
      border-width: var(--fsds-postcard-size-border-default, 1px);
      box-sizing: border-box;
      border-color: var(--fsds-postcard-color-border-default, #b8b8b8);
      color: var(--fsds-postcard-color-foreground-primary, #141414);

      &:hover {
        background-color: var(--fsds-postcard-color-background-hover, #d0d0d0);
        border-color: var(--fsds-postcard-color-border-hover, #888889);
      }
    }

    .postcard__content {
      line-height: var(--fsds-postcard-typography-content-line-height, 1.5);
      display: flex;
      flex-direction: column;
      gap: var(--fsds-postcard-size-gap-default, 12px);
      color: var(--fsds-postcard-color-foreground-primary, #141414);
      font-size: var(--fsds-postcard-typography-content-font-size, 16px);
    }

    .postcard__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fsds-postcard-size-gap-default, 12px);
    }

    .postcard__userInfo {
      display: flex;
      align-items: center;
      flex: 1 1 auto;
    }

    .postcard__displayName {
      font-weight: var(--fsds-postcard-typography-display-name-font-weight, 500);
      font-size: var(--fsds-postcard-typography-display-name-font-size, 16px);
      color: var(--fsds-postcard-color-foreground-primary, #141414);
    }

    .postcard__handle {
      font-size: var(--fsds-postcard-typography-handle-font-size, 14px);
    }

    .postcard__timestamp {
      font-size: var(--fsds-postcard-typography-footer-font-size, 14px);
      flex-shrink: 0;
    }

    .postcard__footer {
      display: flex;
      align-items: center;
      gap: var(--fsds-postcard-size-gap-default, 12px);
      padding-top: var(--fsds-postcard-size-padding-default, 16px);
      border-top-color: var(--fsds-postcard-color-border-default, #b8b8b8);
      border-top-style: solid;
      border-top-width: var(--fsds-postcard-size-border-default, 1px);
      font-size: var(--fsds-postcard-typography-footer-font-size, 14px);
    }

    .postcard__stats {
      display: flex;
      align-items: center;
      gap: var(--fsds-postcard-size-gap-default, 12px);
    }

    .postcard__stat {
      display: inline-flex;
      align-items: center;
      font-size: var(--fsds-postcard-typography-footer-font-size, 14px);
    }
  `;

  override render() {
    return html`<fsds-stack as="footer" variant="horizontal" class="postcard__footer"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-postcard-footer', PostcardFooterElement);
// @generated:end

// @custom:start trailing

// @custom:end