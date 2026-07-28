// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import '../Image/Image.js';
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
      --fsds-avatar-size-small: var(--fsds-core-spacing-size-06, 16px);
      --fsds-avatar-size-medium: var(--fsds-core-spacing-size-07, 24px);
      --fsds-avatar-size-large: var(--fsds-core-spacing-size-08, 32px);
      --fsds-avatar-size-extra-large: var(--fsds-core-spacing-size-09, 48px);
      --fsds-avatar-size-radius-default: var(--fsds-semantic-shape-control-radius-pill, 9999px);
      --fsds-avatar-size-border-default: var(--fsds-semantic-shape-control-border-defaultWidth, 1px);
      --fsds-avatar-color-background-default: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-avatar-color-background-inverse: var(--fsds-semantic-color-background-inverse, #141414);
      --fsds-avatar-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-avatar-color-border-default: var(--fsds-semantic-color-border-light, #b8b8b8);
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
      width: var(--fsds-avatar-size-default, 16px);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-avatar-size-default, 16px);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      overflow: hidden;
      position: relative;
      border-radius: var(--fsds-avatar-size-radius-default, 9999px);
      background-color: var(--fsds-avatar-color-background-default, #d0d0d0);
      color: var(--fsds-avatar-color-foreground-primary, #141414);
      border-color: var(--fsds-avatar-color-border-default, #b8b8b8);
      border-style: solid;
      border-width: var(--fsds-avatar-size-border-default, 1px);
      font-weight: var(--fsds-avatar-typography-fontWeight-medium, 500);
      font-family: var(--fsds-avatar-typography-fontFamily-sans, "Inter", sans-serif);
    }

    .avatar__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .avatar--small {
      width: var(--fsds-avatar-size-small, 16px);
      height: var(--fsds-avatar-size-small, 16px);
    }

    .avatar--medium {
      width: var(--fsds-avatar-size-medium, 24px);
      height: var(--fsds-avatar-size-medium, 24px);
    }

    .avatar--large {
      width: var(--fsds-avatar-size-large, 32px);
      height: var(--fsds-avatar-size-large, 32px);
    }

    .avatar--extra-large {
      width: var(--fsds-avatar-size-extra-large, 48px);
      height: var(--fsds-avatar-size-extra-large, 48px);
    }
  `;

  @property({ type: String }) src?: string;
  @property({ type: String }) name!: string;
  @property({ type: Boolean }) priority?: boolean;
  @property() size?: string;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "avatar");
  }

  private computeClasses(): string {
    return [
      "avatar",
      this.size ? `avatar--${this.size}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" role="img" aria-label=${ifDefined(this.name)}>
  ${this.src ? html`
  <fsds-image class=${'avatar__image'} .src=${this.src} alt=""></fsds-image>
  ` : nothing}
</div>`;
  }
}

customElements.define('fsds-avatar', AvatarElement);
// @generated:end

// @custom:start trailing

// @custom:end