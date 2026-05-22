// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type IconDefinition = { iconName: string; prefix?: string; icon?: unknown };
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class IconElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .icon {
      --fsds-icon-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-icon-size-padding-default: var(--fsds-core-spacing-size-01, 1px);
    }
    
    .icon {
      color: var(--fsds-icon-color-foreground-default);
      padding: var(--fsds-icon-size-padding-default);
    }
  `;

  @property({ attribute: false }) icon!: IconDefinition;
  @property({ type: Number }) width?: number = 20;
  @property({ type: Number }) height?: number = 20;

  private computeClasses(): string {
    return [
      "icon",
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<span class="${this.computeClasses()}" aria-hidden="true"></span>`;
  }
}

customElements.define('fsds-icon', IconElement);
// @generated:end

// @custom:start trailing

// @custom:end