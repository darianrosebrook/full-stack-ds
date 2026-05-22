// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class BreadcrumbsElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .breadcrumbs {
      --fsds-breadcrumbs-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-breadcrumbs-color-foreground-link: var(--fsds-semantic-color-foreground-link, #d9292b);
      --fsds-breadcrumbs-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-breadcrumbs-color-foreground-tertiary: var(--fsds-semantic-color-foreground-tertiary, #717171);
      --fsds-breadcrumbs-color-background-elevated: var(--fsds-semantic-color-background-elevated, #ffffff);
      --fsds-breadcrumbs-color-border-subtle: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-breadcrumbs-typography-lineHeight-collapse: var(--fsds-semantic-typography-line-height-collapse, 1);
      --fsds-breadcrumbs-shape-radius-medium: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-breadcrumbs-shape-radius-small: var(--fsds-core-shape-radius-small, 4px);
      --fsds-breadcrumbs-spacing-gap-default: var(--fsds-core-spacing-size-04, 8px);
      --fsds-breadcrumbs-spacing-gap-small: var(--fsds-core-spacing-size-03, 4px);
      --fsds-breadcrumbs-spacing-padding-default: var(--fsds-core-spacing-size-04, 8px);
      --fsds-breadcrumbs-spacing-padding-small: var(--fsds-core-spacing-size-03, 4px);
    
      &:focus-visible {
        --fsds-breadcrumbs-color-focus: var(--fsds-semantic-color-border-accent, #d9292b);
      }
    }
    
    .breadcrumbs {
      color: var(--fsds-breadcrumbs-color-foreground-tertiary);
      background-color: var(--fsds-breadcrumbs-color-background-elevated);
      border-color: var(--fsds-breadcrumbs-color-border-subtle);
      line-height: var(--fsds-breadcrumbs-typography-lineHeight-collapse);
      border-radius: var(--fsds-breadcrumbs-shape-radius-small);
      gap: var(--fsds-breadcrumbs-spacing-gap-small);
      padding: var(--fsds-breadcrumbs-spacing-padding-small);
    
      &:focus-visible {
        outline-color: var(--fsds-breadcrumbs-color-focus);
      }
    }
  `;

  @property({ attribute: 'aria-label', reflect: true })
  override ariaLabel: string | null = null;
  @property({ type: String }) separator?: string;

  private computeClasses(): string {
    return [
      "breadcrumbs",
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<nav class="${this.computeClasses()}" aria-label=${ifDefined(this.ariaLabel ?? undefined)}>
  <ol class=${'breadcrumbs__list'}>
    <slot></slot>
  </ol>
</nav>`;
  }
}

customElements.define('fsds-breadcrumbs', BreadcrumbsElement);

export class BreadcrumbsListElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .breadcrumbs {
      --fsds-breadcrumbs-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-breadcrumbs-color-foreground-link: var(--fsds-semantic-color-foreground-link, #d9292b);
      --fsds-breadcrumbs-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-breadcrumbs-color-foreground-tertiary: var(--fsds-semantic-color-foreground-tertiary, #717171);
      --fsds-breadcrumbs-color-background-elevated: var(--fsds-semantic-color-background-elevated, #ffffff);
      --fsds-breadcrumbs-color-border-subtle: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-breadcrumbs-typography-lineHeight-collapse: var(--fsds-semantic-typography-line-height-collapse, 1);
      --fsds-breadcrumbs-shape-radius-medium: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-breadcrumbs-shape-radius-small: var(--fsds-core-shape-radius-small, 4px);
      --fsds-breadcrumbs-spacing-gap-default: var(--fsds-core-spacing-size-04, 8px);
      --fsds-breadcrumbs-spacing-gap-small: var(--fsds-core-spacing-size-03, 4px);
      --fsds-breadcrumbs-spacing-padding-default: var(--fsds-core-spacing-size-04, 8px);
      --fsds-breadcrumbs-spacing-padding-small: var(--fsds-core-spacing-size-03, 4px);
    
      &:focus-visible {
        --fsds-breadcrumbs-color-focus: var(--fsds-semantic-color-border-accent, #d9292b);
      }
    }
    
    .breadcrumbs {
      color: var(--fsds-breadcrumbs-color-foreground-tertiary);
      background-color: var(--fsds-breadcrumbs-color-background-elevated);
      border-color: var(--fsds-breadcrumbs-color-border-subtle);
      line-height: var(--fsds-breadcrumbs-typography-lineHeight-collapse);
      border-radius: var(--fsds-breadcrumbs-shape-radius-small);
      gap: var(--fsds-breadcrumbs-spacing-gap-small);
      padding: var(--fsds-breadcrumbs-spacing-padding-small);
    
      &:focus-visible {
        outline-color: var(--fsds-breadcrumbs-color-focus);
      }
    }
  `;

  override render() {
    return html`<fsds-stack as="ul" variant="horizontal" class="breadcrumbs__list"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-breadcrumbs-list', BreadcrumbsListElement);
// @generated:end

// @custom:start trailing

// @custom:end