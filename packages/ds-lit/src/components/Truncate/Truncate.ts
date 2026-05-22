// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { TruncateBehavior } from './TruncateBehavior.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class TruncateElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .truncate {
      --fsds-truncate-color-foreground-link: var(--fsds-semantic-color-foreground-link, #d9292b);
      --fsds-truncate-color-background-primary: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-truncate-typography-fontWeight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-truncate-spacing-toggle: var(--fsds-core-spacing-size-02, 2px);
      --fsds-truncate-color-foreground-linkHover: var(--fsds-semantic-link-hover-text, #ae0001);
    }
    
    .truncate {
      display: block;
    }
    
    .truncate__content {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .truncate__toggle {
      display: inline-flex;
      align-items: center;
      color: var(--fsds-truncate-color-foreground-link);
      font-weight: var(--fsds-truncate-typography-fontWeight);
      margin-top: var(--fsds-truncate-spacing-toggle);
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
    }
  `;

  @property({ type: Number }) lines?: number;
  @property({ type: Boolean }) expandable?: boolean;
  @property({ type: Boolean }) expanded?: boolean;
  @property({ type: Boolean }) defaultExpanded?: boolean;
  @property({ type: String }) expandText?: string = "Show more";
  @property({ type: String }) collapseText?: string = "Show less";
  @property({ attribute: false }) onExpandedChange?: (value: boolean) => void;

  private behavior = new TruncateBehavior(this, {
    expanded: () => this.expanded,
    defaultExpanded: this.defaultExpanded,
    onExpandedChange: (v) => this.onExpandedChange?.(v),
  });

  private computeClasses(): string {
    return [
      "truncate",
      this.behavior.expanded ? "truncate--expanded" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}">
  <span class=${'truncate__content'}>
    <slot></slot>
  </span>
  ${this.expandable ? html`
  <button class=${'truncate__toggle'} type="button" aria-expanded=${this.behavior.expanded ? 'true' : 'false'}></button>
  ` : nothing}
</div>`;
  }
}

customElements.define('fsds-truncate', TruncateElement);

export class TruncateContentElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .truncate {
      --fsds-truncate-color-foreground-link: var(--fsds-semantic-color-foreground-link, #d9292b);
      --fsds-truncate-color-background-primary: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-truncate-typography-fontWeight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-truncate-spacing-toggle: var(--fsds-core-spacing-size-02, 2px);
      --fsds-truncate-color-foreground-linkHover: var(--fsds-semantic-link-hover-text, #ae0001);
    }
    
    .truncate {
      display: block;
    }
    
    .truncate__content {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .truncate__toggle {
      display: inline-flex;
      align-items: center;
      color: var(--fsds-truncate-color-foreground-link);
      font-weight: var(--fsds-truncate-typography-fontWeight);
      margin-top: var(--fsds-truncate-spacing-toggle);
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
    }
  `;

  override render() {
    return html`<fsds-stack class="truncate__content"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-truncate-content', TruncateContentElement);
// @generated:end

// @custom:start trailing

// @custom:end