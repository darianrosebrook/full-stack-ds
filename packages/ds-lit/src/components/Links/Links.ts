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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: var(--fsds-semantic-display-size-gap, 4px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-links-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-links-color-underline-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-links-spacing-gap-default: var(--fsds-core-spacing-size-02, 2px);
      --fsds-links-motion-duration-fast: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-links-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-links-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0a65fe);
      --fsds-links-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-links-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
      --fsds-links-focus-ring-radius: var(--fsds-core-shape-radius-small, 2px);
    
      &:hover {
        --fsds-links-color-foreground-default: var(--fsds-semantic-interaction-text-hover, #555555);
      }
    
      &:disabled {
        --fsds-links-color-foreground-default: var(--fsds-semantic-color-foreground-disabled, #aeaeae);
      }
    }
    
    .links__visited {
      --fsds-links-color-foreground-default: var(--fsds-semantic-color-foreground-secondary, #555555);
    }
    
    .links {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-links-spacing-gap-default);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      color: var(--fsds-links-color-foreground-default);
      text-decoration-color: var(--fsds-links-color-underline-default);
      transition-duration: var(--fsds-links-motion-duration-fast);
    
      &:focus-visible {
        outline-width: var(--fsds-links-focus-ring-width);
        outline-color: var(--fsds-links-focus-ring-color);
        outline-style: var(--fsds-links-focus-ring-style);
        outline-offset: var(--fsds-links-focus-ring-offset);
        border-radius: var(--fsds-links-focus-ring-radius);
      }
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