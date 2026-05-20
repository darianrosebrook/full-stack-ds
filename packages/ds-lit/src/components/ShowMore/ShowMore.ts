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
  static override styles = css`:host { display: contents; }`;

  @property({ type: Boolean }) expanded?: boolean;
  @property({ type: Boolean }) defaultExpanded?: boolean;
  @property({ type: Number }) maxLines?: number = 3;
  @property({ type: String }) showMoreLabel?: string = "Show more";
  @property({ type: String }) showLessLabel?: string = "Show less";
  @property({ attribute: false }) onExpandedChange?: (value: boolean) => void;

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
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack class="show-more__content"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-show-more-content', ShowMoreContentElement);

export class ShowMoreTriggerElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="button" class="show-more__trigger"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-show-more-trigger', ShowMoreTriggerElement);
// @generated:end

// @custom:start trailing

// @custom:end