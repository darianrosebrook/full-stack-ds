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
  static override styles = css`:host { display: contents; }`;

  @property({ type: String }) postId!: string;
  @property({ attribute: false }) author!: PostcardAuthor;
  @property({ type: String }) timestamp!: string;
  @property({ attribute: false }) stats!: PostcardStats;
  @property({ attribute: false }) embed?: PostcardEmbed;
  @property() type?: string;

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
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="header" class="postcard__header"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-postcard-header', PostcardHeaderElement);

export class PostcardContentElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack class="postcard__content"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-postcard-content', PostcardContentElement);

export class PostcardFooterElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="footer" variant="horizontal" class="postcard__footer"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-postcard-footer', PostcardFooterElement);
// @generated:end

// @custom:start trailing

// @custom:end