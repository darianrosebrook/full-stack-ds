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
      --fsds-postcard-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-postcard-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-postcard-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-postcard-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-postcard-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-postcard-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-postcard-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-postcard-size-radius-full: var(--fsds-core-shape-radius-full, 9999px);
      --fsds-postcard-size-gap-default: var(--fsds-core-spacing-size-05, 12px);
      --fsds-postcard-size-gap-small: var(--fsds-core-spacing-size-03, 4px);
      --fsds-postcard-size-border-default: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-postcard-typography-displayName-fontSize: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-postcard-typography-displayName-fontWeight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-postcard-typography-handle-fontSize: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-postcard-typography-content-fontSize: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-postcard-typography-content-lineHeight: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-postcard-typography-footer-fontSize: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-postcard-color-background-hover: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-postcard-color-border-hover: var(--fsds-semantic-color-border-bold, #8f8f8f);
    }
    
    .postcard {
      background-color: var(--fsds-postcard-color-background-default);
      border-color: var(--fsds-postcard-color-border-accent);
      color: var(--fsds-postcard-color-foreground-secondary);
      padding: var(--fsds-postcard-size-padding-default);
      border-radius: var(--fsds-postcard-size-radius-full);
      gap: var(--fsds-postcard-size-gap-small);
      line-height: var(--fsds-postcard-typography-content-lineHeight);
    
      &:hover {
        background-color: var(--fsds-postcard-color-background-hover);
        border-color: var(--fsds-postcard-color-border-hover);
      }
    }
    
    .postcard__content {
      line-height: var(--fsds-postcard-typography-content-lineHeight);
    }
  `;

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
  static override styles = css`
    :host { display: contents; }
    .postcard {
      --fsds-postcard-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-postcard-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-postcard-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-postcard-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-postcard-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-postcard-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-postcard-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-postcard-size-radius-full: var(--fsds-core-shape-radius-full, 9999px);
      --fsds-postcard-size-gap-default: var(--fsds-core-spacing-size-05, 12px);
      --fsds-postcard-size-gap-small: var(--fsds-core-spacing-size-03, 4px);
      --fsds-postcard-size-border-default: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-postcard-typography-displayName-fontSize: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-postcard-typography-displayName-fontWeight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-postcard-typography-handle-fontSize: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-postcard-typography-content-fontSize: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-postcard-typography-content-lineHeight: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-postcard-typography-footer-fontSize: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-postcard-color-background-hover: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-postcard-color-border-hover: var(--fsds-semantic-color-border-bold, #8f8f8f);
    }
    
    .postcard {
      background-color: var(--fsds-postcard-color-background-default);
      border-color: var(--fsds-postcard-color-border-accent);
      color: var(--fsds-postcard-color-foreground-secondary);
      padding: var(--fsds-postcard-size-padding-default);
      border-radius: var(--fsds-postcard-size-radius-full);
      gap: var(--fsds-postcard-size-gap-small);
      line-height: var(--fsds-postcard-typography-content-lineHeight);
    
      &:hover {
        background-color: var(--fsds-postcard-color-background-hover);
        border-color: var(--fsds-postcard-color-border-hover);
      }
    }
    
    .postcard__content {
      line-height: var(--fsds-postcard-typography-content-lineHeight);
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
      --fsds-postcard-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-postcard-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-postcard-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-postcard-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-postcard-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-postcard-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-postcard-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-postcard-size-radius-full: var(--fsds-core-shape-radius-full, 9999px);
      --fsds-postcard-size-gap-default: var(--fsds-core-spacing-size-05, 12px);
      --fsds-postcard-size-gap-small: var(--fsds-core-spacing-size-03, 4px);
      --fsds-postcard-size-border-default: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-postcard-typography-displayName-fontSize: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-postcard-typography-displayName-fontWeight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-postcard-typography-handle-fontSize: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-postcard-typography-content-fontSize: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-postcard-typography-content-lineHeight: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-postcard-typography-footer-fontSize: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-postcard-color-background-hover: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-postcard-color-border-hover: var(--fsds-semantic-color-border-bold, #8f8f8f);
    }
    
    .postcard {
      background-color: var(--fsds-postcard-color-background-default);
      border-color: var(--fsds-postcard-color-border-accent);
      color: var(--fsds-postcard-color-foreground-secondary);
      padding: var(--fsds-postcard-size-padding-default);
      border-radius: var(--fsds-postcard-size-radius-full);
      gap: var(--fsds-postcard-size-gap-small);
      line-height: var(--fsds-postcard-typography-content-lineHeight);
    
      &:hover {
        background-color: var(--fsds-postcard-color-background-hover);
        border-color: var(--fsds-postcard-color-border-hover);
      }
    }
    
    .postcard__content {
      line-height: var(--fsds-postcard-typography-content-lineHeight);
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
      --fsds-postcard-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-postcard-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-postcard-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-postcard-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-postcard-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-postcard-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-postcard-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-postcard-size-radius-full: var(--fsds-core-shape-radius-full, 9999px);
      --fsds-postcard-size-gap-default: var(--fsds-core-spacing-size-05, 12px);
      --fsds-postcard-size-gap-small: var(--fsds-core-spacing-size-03, 4px);
      --fsds-postcard-size-border-default: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-postcard-typography-displayName-fontSize: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-postcard-typography-displayName-fontWeight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-postcard-typography-handle-fontSize: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-postcard-typography-content-fontSize: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-postcard-typography-content-lineHeight: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-postcard-typography-footer-fontSize: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-postcard-color-background-hover: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-postcard-color-border-hover: var(--fsds-semantic-color-border-bold, #8f8f8f);
    }
    
    .postcard {
      background-color: var(--fsds-postcard-color-background-default);
      border-color: var(--fsds-postcard-color-border-accent);
      color: var(--fsds-postcard-color-foreground-secondary);
      padding: var(--fsds-postcard-size-padding-default);
      border-radius: var(--fsds-postcard-size-radius-full);
      gap: var(--fsds-postcard-size-gap-small);
      line-height: var(--fsds-postcard-typography-content-lineHeight);
    
      &:hover {
        background-color: var(--fsds-postcard-color-background-hover);
        border-color: var(--fsds-postcard-color-border-hover);
      }
    }
    
    .postcard__content {
      line-height: var(--fsds-postcard-typography-content-lineHeight);
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