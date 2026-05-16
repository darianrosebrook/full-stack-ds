// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class BreadcrumbsElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property({ attribute: 'aria-label', reflect: true })
  override ariaLabel: string | null = null;
  @property() separator?: string;

  private computeClasses(): string {
    return [
      "breadcrumbs",
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<nav class="${this.computeClasses()}" aria-label=${this.ariaLabel}>
  <ol class=${'breadcrumbs__list'}>
    <slot></slot>
  </ol>
</nav>`;
  }
}

customElements.define('fsds-breadcrumbs', BreadcrumbsElement);

export class BreadcrumbsListElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="ul" variant="horizontal" class="breadcrumbs__list"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-breadcrumbs-list', BreadcrumbsListElement);
// @generated:end

// @custom:start trailing

// @custom:end