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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-breadcrumbs-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-breadcrumbs-color-background-elevated: var(--fsds-semantic-color-background-elevated, #ffffff);
      --fsds-breadcrumbs-color-border-subtle: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-breadcrumbs-typography-lineHeight-collapse: var(--fsds-semantic-typography-line-height-collapse, 1);
      --fsds-breadcrumbs-shape-radius-medium: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-breadcrumbs-spacing-gap-default: var(--fsds-core-spacing-size-04, 8px);
      --fsds-breadcrumbs-spacing-padding-default: var(--fsds-core-spacing-size-04, 8px);
      --fsds-breadcrumbs-color-focus: var(--fsds-semantic-color-border-accent, #d9292b);
    }
    
    .breadcrumbs {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      background-color: var(--fsds-breadcrumbs-color-background-elevated);
      border-color: var(--fsds-breadcrumbs-color-border-subtle);
      line-height: var(--fsds-breadcrumbs-typography-lineHeight-collapse);
      display: block;
      border-radius: var(--fsds-breadcrumbs-shape-radius-medium);
      padding: var(--fsds-breadcrumbs-spacing-padding-default);
      color: var(--fsds-breadcrumbs-color-foreground-primary);
    
      &:focus-visible {
        outline-color: var(--fsds-breadcrumbs-color-focus);
      }
    }
    
    .breadcrumbs__list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--fsds-breadcrumbs-spacing-gap-default);
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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-breadcrumbs-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-breadcrumbs-color-background-elevated: var(--fsds-semantic-color-background-elevated, #ffffff);
      --fsds-breadcrumbs-color-border-subtle: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-breadcrumbs-typography-lineHeight-collapse: var(--fsds-semantic-typography-line-height-collapse, 1);
      --fsds-breadcrumbs-shape-radius-medium: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-breadcrumbs-spacing-gap-default: var(--fsds-core-spacing-size-04, 8px);
      --fsds-breadcrumbs-spacing-padding-default: var(--fsds-core-spacing-size-04, 8px);
      --fsds-breadcrumbs-color-focus: var(--fsds-semantic-color-border-accent, #d9292b);
    }
    
    .breadcrumbs {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      background-color: var(--fsds-breadcrumbs-color-background-elevated);
      border-color: var(--fsds-breadcrumbs-color-border-subtle);
      line-height: var(--fsds-breadcrumbs-typography-lineHeight-collapse);
      display: block;
      border-radius: var(--fsds-breadcrumbs-shape-radius-medium);
      padding: var(--fsds-breadcrumbs-spacing-padding-default);
      color: var(--fsds-breadcrumbs-color-foreground-primary);
    
      &:focus-visible {
        outline-color: var(--fsds-breadcrumbs-color-focus);
      }
    }
    
    .breadcrumbs__list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--fsds-breadcrumbs-spacing-gap-default);
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