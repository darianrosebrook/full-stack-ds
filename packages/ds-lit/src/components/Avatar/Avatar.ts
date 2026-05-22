// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class AvatarElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .avatar {
      --fsds-avatar-size-small: var(--fsds-core-spacing-size-05, 12px);
      --fsds-avatar-size-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-avatar-size-medium: var(--fsds-core-spacing-size-08, 32px);
      --fsds-avatar-size-large: var(--fsds-core-spacing-size-10, 64px);
      --fsds-avatar-size-status: var(--fsds-core-spacing-size-03, 4px);
      --fsds-avatar-size-radius-default: var(--fsds-core-shape-radius-full, 9999px);
      --fsds-avatar-size-radius-small: var(--fsds-core-shape-radius-small, 4px);
      --fsds-avatar-size-border-default: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-avatar-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-avatar-color-background-inverse: var(--fsds-semantic-color-background-inverse, #141414);
      --fsds-avatar-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-avatar-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-avatar-typography-fontWeight-medium: var(--fsds-core-typography-weight-medium, 500);
      --fsds-avatar-typography-fontFamily-sans: var(--fsds-core-typography-font-family-sans, "Inter", sans-serif);
    }
    
    .avatar {
      border-radius: var(--fsds-avatar-size-radius-small);
      background-color: var(--fsds-avatar-color-background-inverse);
      color: var(--fsds-avatar-color-foreground-primary);
      border-color: var(--fsds-avatar-color-border-default);
    }
  `;

  @property({ type: String }) src?: string;
  @property({ type: String }) name!: string;
  @property({ type: Boolean }) priority?: boolean;
  @property() size?: string;

  private computeClasses(): string {
    return [
      "avatar",
      this.size ? `avatar--${this.size}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" role="img"></div>`;
  }
}

customElements.define('fsds-avatar', AvatarElement);
// @generated:end

// @custom:start trailing

// @custom:end