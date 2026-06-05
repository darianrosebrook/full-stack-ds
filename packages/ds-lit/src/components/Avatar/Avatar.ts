// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: 0;
      --fsds-box-model-width: var(--fsds-semantic-glyph-size-medium-extent, 16px);
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: var(--fsds-semantic-glyph-size-medium-extent, 16px);
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-avatar-size-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-avatar-size-radius-default: var(--fsds-core-shape-radius-full, 9999px);
      --fsds-avatar-size-border-default: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-avatar-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-avatar-color-background-inverse: var(--fsds-semantic-color-background-inverse, #141414);
      --fsds-avatar-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-avatar-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-avatar-typography-fontWeight-medium: var(--fsds-core-typography-weight-medium, 500);
      --fsds-avatar-typography-fontFamily-sans: var(--fsds-core-typography-font-family-sans, "Inter", sans-serif);
    }
    
    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-sizing: border-box;
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: var(--fsds-avatar-size-default);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-avatar-size-default);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      overflow: hidden;
      position: relative;
      border-radius: var(--fsds-avatar-size-radius-default);
      background-color: var(--fsds-avatar-color-background-default);
      color: var(--fsds-avatar-color-foreground-primary);
      border-color: var(--fsds-avatar-color-border-default);
      border-style: solid;
      border-width: var(--fsds-avatar-size-border-default);
      font-weight: var(--fsds-avatar-typography-fontWeight-medium);
      font-family: var(--fsds-avatar-typography-fontFamily-sans);
    }
    
    .avatar__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
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
    return html`<div class="${this.computeClasses()}" role="img" aria-label=${ifDefined(this.name)}>
  ${this.src ? html`
  <img class=${'avatar__image'} src=${ifDefined(this.src)} alt="" />
  ` : nothing}
</div>`;
  }
}

customElements.define('fsds-avatar', AvatarElement);
// @generated:end

// @custom:start trailing

// @custom:end