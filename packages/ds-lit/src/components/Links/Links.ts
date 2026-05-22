// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type LinkTarget = "_self" | "_blank" | "_parent" | "_top";
export type LinkSize = "small" | "medium" | "large";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class LinksElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .links {
      --fsds-links-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-links-color-underline-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-links-spacing-gap-default: var(--fsds-core-spacing-size-02, 2px);
      --fsds-links-motion-duration-fast: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-links-color-foreground-hover: var(--fsds-semantic-interaction-text-hover, #555555);
      --fsds-links-color-foreground-visited: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-links-color-foreground-disabled: var(--fsds-semantic-color-foreground-disabled, #aeaeae);
    }
    
    .links {
      color: var(--fsds-links-color-foreground-default);
      text-decoration-color: var(--fsds-links-color-underline-default);
      gap: var(--fsds-links-spacing-gap-default);
      transition-duration: var(--fsds-links-motion-duration-fast);
    
      &:hover {
        color: var(--fsds-links-color-foreground-hover);
      }
    
      &:disabled {
        color: var(--fsds-links-color-foreground-disabled);
      }
    }
    
    .links__visited {
      color: var(--fsds-links-color-foreground-visited);
    }
  `;

  @property({ type: String }) href?: string;
  @property({ type: String }) target?: LinkTarget;
  @property({ type: String }) rel?: string;
  @property({ type: String }) size?: LinkSize;
  @property({ type: Boolean }) disabled?: boolean;

  private computeClasses(): string {
    return [
      "links",
      this.size ? `links--${this.size}` : null,
      this.disabled ? "links--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<a class="${this.computeClasses()}" href=${ifDefined(this.href)} target=${ifDefined(this.target)} rel=${ifDefined(this.rel)}>
  <slot></slot>
</a>`;
  }
}

customElements.define('fsds-links', LinksElement);
// @generated:end

// @custom:start trailing

// @custom:end