// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ShowMoreBehavior } from './ShowMoreBehavior.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class ShowMoreElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .show-more {
      --fsds-show-more-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-show-more-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-show-more-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-show-more-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-show-more-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-show-more-size-padding-default: var(--fsds-core-spacing-size-07, 24px);
      --fsds-show-more-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-show-more-overlay-imageOverlay: var(--fsds-semantic-color-background-image-overlay, rgba(0, 0, 0, 0.5));
    }
    
    .show-more {
      background-color: var(--fsds-show-more-color-background-default);
      color: var(--fsds-show-more-color-foreground-secondary);
      border-color: var(--fsds-show-more-color-border-accent);
      padding: var(--fsds-show-more-size-padding-default);
      border-radius: var(--fsds-show-more-size-radius-default);
    }
    
    .show-more__content {
      overflow: hidden;
      display: block;
    }
    
    .show-more__trigger {
      display: inline-flex;
      align-items: center;
      color: var(--fsds-show-more-color-foreground-primary);
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
    }
  `;

  @property({ type: Boolean }) expanded?: boolean;
  @property({ type: Boolean }) defaultExpanded?: boolean;
  @property({ attribute: false }) onExpandedChange?: (expanded: boolean) => void;
  @property({ type: Number }) maxLines?: number = 3;
  @property({ type: String }) showMoreLabel?: string = "Show more";
  @property({ type: String }) showLessLabel?: string = "Show less";

  private behavior = new ShowMoreBehavior(this, {
    expanded: () => this.expanded,
    defaultExpanded: this.defaultExpanded,
    onExpandedChange: (v) => this.onExpandedChange?.(v),
  });

  private handleExpandedChange(event: Event): void {
    this.behavior.setExpanded((event.target as HTMLInputElement).checked);
  }

  private computeClasses(): string {
    return [
      "show-more",
      this.behavior.expanded ? "show-more--expanded" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}">
  <div class=${'show-more__content'}>
    <slot></slot>
  </div>
  <button class=${'show-more__trigger'} type="button" aria-expanded=${this.behavior.expanded ? 'true' : 'false'} @click=${(e: Event) => this.handleExpandedChange(e)} textContent=${ifDefined(this.showMoreLabel)}></button>
</div>`;
  }
}

customElements.define('fsds-show-more', ShowMoreElement);

export class ShowMoreContentElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .show-more {
      --fsds-show-more-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-show-more-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-show-more-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-show-more-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-show-more-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-show-more-size-padding-default: var(--fsds-core-spacing-size-07, 24px);
      --fsds-show-more-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-show-more-overlay-imageOverlay: var(--fsds-semantic-color-background-image-overlay, rgba(0, 0, 0, 0.5));
    }
    
    .show-more {
      background-color: var(--fsds-show-more-color-background-default);
      color: var(--fsds-show-more-color-foreground-secondary);
      border-color: var(--fsds-show-more-color-border-accent);
      padding: var(--fsds-show-more-size-padding-default);
      border-radius: var(--fsds-show-more-size-radius-default);
    }
    
    .show-more__content {
      overflow: hidden;
      display: block;
    }
    
    .show-more__trigger {
      display: inline-flex;
      align-items: center;
      color: var(--fsds-show-more-color-foreground-primary);
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
    }
  `;

  override render() {
    return html`<fsds-stack class="show-more__content"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-show-more-content', ShowMoreContentElement);

export class ShowMoreTriggerElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .show-more {
      --fsds-show-more-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-show-more-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-show-more-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-show-more-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-show-more-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-show-more-size-padding-default: var(--fsds-core-spacing-size-07, 24px);
      --fsds-show-more-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-show-more-overlay-imageOverlay: var(--fsds-semantic-color-background-image-overlay, rgba(0, 0, 0, 0.5));
    }
    
    .show-more {
      background-color: var(--fsds-show-more-color-background-default);
      color: var(--fsds-show-more-color-foreground-secondary);
      border-color: var(--fsds-show-more-color-border-accent);
      padding: var(--fsds-show-more-size-padding-default);
      border-radius: var(--fsds-show-more-size-radius-default);
    }
    
    .show-more__content {
      overflow: hidden;
      display: block;
    }
    
    .show-more__trigger {
      display: inline-flex;
      align-items: center;
      color: var(--fsds-show-more-color-foreground-primary);
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
    }
  `;

  override render() {
    return html`<fsds-stack as="button" class="show-more__trigger"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-show-more-trigger', ShowMoreTriggerElement);
// @generated:end

// @custom:start trailing

// @custom:end