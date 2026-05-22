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
      --fsds-profileFlag-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-profileFlag-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-profileFlag-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-profileFlag-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-profileFlag-spacing-gap-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-profileFlag-spacing-padding-default: var(--fsds-core-spacing-size-04, 8px);
      --fsds-profileFlag-spacing-padding-right: var(--fsds-core-spacing-size-06, 16px);
      --fsds-profileFlag-color-border-hover: var(--fsds-semantic-color-border-bold, #8f8f8f);
    }
    
    .profile-flag {
      background-color: var(--fsds-profileFlag-color-background-default);
      border-color: var(--fsds-profileFlag-color-border-default);
      color: var(--fsds-profileFlag-color-foreground-primary);
      border-radius: var(--fsds-profileFlag-size-radius-default);
      gap: var(--fsds-profileFlag-spacing-gap-default);
      padding: var(--fsds-profileFlag-spacing-padding-right);
    
      &:hover {
        border-color: var(--fsds-profileFlag-color-border-hover);
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