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
  static override styles = css`:host { display: contents; }`;

  @property({ type: Number }) lines?: number;
  @property({ type: Boolean }) expandable?: boolean;
  @property({ type: Boolean }) expanded?: boolean;
  @property({ type: Boolean }) defaultExpanded?: boolean;
  @property() expandText?: string = "Show more";
  @property() collapseText?: string = "Show less";
  @property({ attribute: false }) onExpandedChange?: (value: boolean) => void;

  private behavior = new TruncateBehavior(this, {
    expanded: () => this.expanded,
    defaultExpanded: this.defaultExpanded,
    onExpandedChange: (v) => this.onExpandedChange?.(v),
  });

  private handleExpandedChange(event: Event): void {
    this.behavior.setExpanded((event.target as HTMLInputElement).checked);
  }

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
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack class="truncate__content"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-truncate-content', TruncateContentElement);
// @generated:end

// @custom:start trailing

// @custom:end