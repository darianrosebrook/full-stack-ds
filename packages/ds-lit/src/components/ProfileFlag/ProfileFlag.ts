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
  static override styles = css`:host { display: contents; }`;

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