// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ProfileFlagData = { id: string; username: string; full_name: string; first_name: string | null; last_name: string | null; avatar_url: string | null; bio: string; occupation: string | null; account_status: string; created_at: string; updated_at: string | null };
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class ProfileFlagElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .profile-flag {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 2px;
      --fsds-box-model-padding-block-end: 2px;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 4px;
      --fsds-box-model-padding-inline-end: 4px;
      --fsds-box-model-gap: 0;
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: var(--fsds-semantic-glyph-size-medium-extent, 16px);
      --fsds-box-model-max-height: none;
      --fsds-profile-flag-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-profile-flag-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-profile-flag-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-profile-flag-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-profile-flag-spacing-gap-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-profile-flag-spacing-padding-default: var(--fsds-core-spacing-size-04, 8px);
      --fsds-profile-flag-spacing-padding-right: var(--fsds-core-spacing-size-06, 16px);
      --fsds-profile-flag-color-border-hover: var(--fsds-semantic-color-border-bold, #8f8f8f);
    }

    .profile-flag {
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      box-sizing: border-box;
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-profile-flag-spacing-gap-default);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      background-color: var(--fsds-profile-flag-color-background-default);
      border-color: var(--fsds-profile-flag-color-border-default);
      color: var(--fsds-profile-flag-color-foreground-primary);
      border-radius: var(--fsds-profile-flag-size-radius-default);
      padding: var(--fsds-profile-flag-spacing-padding-right);

      &:hover {
        border-color: var(--fsds-profile-flag-color-border-hover);
      }
    }
  `;

  @property({ attribute: false }) profile?: ProfileFlagData;

  private computeClasses(): string {
    return [
      "profile-flag",
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}">
  <slot></slot>
</div>`;
  }
}

customElements.define('fsds-profile-flag', ProfileFlagElement);
// @generated:end

// @custom:start trailing

// @custom:end