// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type NavListOrientation = "vertical" | "horizontal";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class NavListElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .nav-list {
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
      --fsds-nav-list-color-foreground-default: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-nav-list-color-foreground-hover: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-nav-list-color-foreground-current: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-nav-list-color-background-default: var(--fsds-semantic-color-background-transparent, transparent);
      --fsds-nav-list-color-background-hover: var(--fsds-semantic-color-background-subtle, #f5f5f5);
      --fsds-nav-list-stateLayer-hover: var(--fsds-semantic-interaction-stateLayer-hover, 0.04);
      --fsds-nav-list-stateLayer-selected: var(--fsds-semantic-interaction-stateLayer-selected, 0.08);
      --fsds-nav-list-color-background-current: var(--fsds-semantic-color-background-accentSubtle, #fceaea);
      --fsds-nav-list-color-outline-focus: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-nav-list-size-padding-block: var(--fsds-core-spacing-size-02, 4px);
      --fsds-nav-list-size-padding-inline: var(--fsds-core-spacing-size-04, 8px);
      --fsds-nav-list-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-nav-list-size-gap-list: var(--fsds-core-spacing-size-01, 2px);
      --fsds-nav-list-size-gap-group: var(--fsds-core-spacing-size-04, 8px);
      --fsds-nav-list-size-fontSize-item: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-nav-list-size-fontSize-groupLabel: var(--fsds-semantic-typography-caption-03, 11px);
    }

    .nav-list {
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
      display: block;
    }

    .nav-list__list {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-nav-list-size-gap-list);
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-list__item {
      display: block;
      color: var(--fsds-nav-list-color-foreground-default);
      padding-block: var(--fsds-nav-list-size-padding-block);
      padding-inline: var(--fsds-nav-list-size-padding-inline);
      border-radius: var(--fsds-nav-list-size-radius-default);
      transition-property: background-color, color;
      transition-duration: 120ms;
    }

    .nav-list__item:hover {
      background-color: color-mix(in srgb, currentColor calc(var(--fsds-nav-list-stateLayer-hover, 0.04) * 100%), transparent);
      color: var(--fsds-nav-list-color-foreground-hover);
    }

    .nav-list__item[aria-current="page"] {
      background-color: color-mix(in srgb, currentColor calc(var(--fsds-nav-list-stateLayer-selected, 0.08) * 100%), transparent);
      color: var(--fsds-nav-list-color-foreground-current);
    }
  `;

  @property({ type: String }) orientation?: NavListOrientation = "vertical";
  @property({ attribute: 'aria-label', reflect: true })
  override ariaLabel: string | null = null;

  private computeClasses(): string {
    return [
      "nav-list",
      (this.orientation ?? "vertical") ? `nav-list--${(this.orientation ?? "vertical")}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<nav class="${this.computeClasses()}" aria-label=${ifDefined(this.ariaLabel ?? undefined)}>
  <ul class=${'nav-list__list'}>
    <slot></slot>
  </ul>
</nav>`;
  }
}

customElements.define('fsds-nav-list', NavListElement);

export class NavListListElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .nav-list {
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
      --fsds-nav-list-color-foreground-default: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-nav-list-color-foreground-hover: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-nav-list-color-foreground-current: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-nav-list-color-background-default: var(--fsds-semantic-color-background-transparent, transparent);
      --fsds-nav-list-color-background-hover: var(--fsds-semantic-color-background-subtle, #f5f5f5);
      --fsds-nav-list-stateLayer-hover: var(--fsds-semantic-interaction-stateLayer-hover, 0.04);
      --fsds-nav-list-stateLayer-selected: var(--fsds-semantic-interaction-stateLayer-selected, 0.08);
      --fsds-nav-list-color-background-current: var(--fsds-semantic-color-background-accentSubtle, #fceaea);
      --fsds-nav-list-color-outline-focus: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-nav-list-size-padding-block: var(--fsds-core-spacing-size-02, 4px);
      --fsds-nav-list-size-padding-inline: var(--fsds-core-spacing-size-04, 8px);
      --fsds-nav-list-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-nav-list-size-gap-list: var(--fsds-core-spacing-size-01, 2px);
      --fsds-nav-list-size-gap-group: var(--fsds-core-spacing-size-04, 8px);
      --fsds-nav-list-size-fontSize-item: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-nav-list-size-fontSize-groupLabel: var(--fsds-semantic-typography-caption-03, 11px);
    }

    .nav-list {
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
      display: block;
    }

    .nav-list__list {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-nav-list-size-gap-list);
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-list__item {
      display: block;
      color: var(--fsds-nav-list-color-foreground-default);
      padding-block: var(--fsds-nav-list-size-padding-block);
      padding-inline: var(--fsds-nav-list-size-padding-inline);
      border-radius: var(--fsds-nav-list-size-radius-default);
      transition-property: background-color, color;
      transition-duration: 120ms;
    }

    .nav-list__item:hover {
      background-color: color-mix(in srgb, currentColor calc(var(--fsds-nav-list-stateLayer-hover, 0.04) * 100%), transparent);
      color: var(--fsds-nav-list-color-foreground-hover);
    }

    .nav-list__item[aria-current="page"] {
      background-color: color-mix(in srgb, currentColor calc(var(--fsds-nav-list-stateLayer-selected, 0.08) * 100%), transparent);
      color: var(--fsds-nav-list-color-foreground-current);
    }
  `;

  override render() {
    return html`<fsds-stack as="ul" variant="horizontal" class="nav-list__list"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-nav-list-list', NavListListElement);

export class NavListItemElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .nav-list {
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
      --fsds-nav-list-color-foreground-default: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-nav-list-color-foreground-hover: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-nav-list-color-foreground-current: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-nav-list-color-background-default: var(--fsds-semantic-color-background-transparent, transparent);
      --fsds-nav-list-color-background-hover: var(--fsds-semantic-color-background-subtle, #f5f5f5);
      --fsds-nav-list-stateLayer-hover: var(--fsds-semantic-interaction-stateLayer-hover, 0.04);
      --fsds-nav-list-stateLayer-selected: var(--fsds-semantic-interaction-stateLayer-selected, 0.08);
      --fsds-nav-list-color-background-current: var(--fsds-semantic-color-background-accentSubtle, #fceaea);
      --fsds-nav-list-color-outline-focus: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-nav-list-size-padding-block: var(--fsds-core-spacing-size-02, 4px);
      --fsds-nav-list-size-padding-inline: var(--fsds-core-spacing-size-04, 8px);
      --fsds-nav-list-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-nav-list-size-gap-list: var(--fsds-core-spacing-size-01, 2px);
      --fsds-nav-list-size-gap-group: var(--fsds-core-spacing-size-04, 8px);
      --fsds-nav-list-size-fontSize-item: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-nav-list-size-fontSize-groupLabel: var(--fsds-semantic-typography-caption-03, 11px);
    }

    .nav-list {
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
      display: block;
    }

    .nav-list__list {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-nav-list-size-gap-list);
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-list__item {
      display: block;
      color: var(--fsds-nav-list-color-foreground-default);
      padding-block: var(--fsds-nav-list-size-padding-block);
      padding-inline: var(--fsds-nav-list-size-padding-inline);
      border-radius: var(--fsds-nav-list-size-radius-default);
      transition-property: background-color, color;
      transition-duration: 120ms;
    }

    .nav-list__item:hover {
      background-color: color-mix(in srgb, currentColor calc(var(--fsds-nav-list-stateLayer-hover, 0.04) * 100%), transparent);
      color: var(--fsds-nav-list-color-foreground-hover);
    }

    .nav-list__item[aria-current="page"] {
      background-color: color-mix(in srgb, currentColor calc(var(--fsds-nav-list-stateLayer-selected, 0.08) * 100%), transparent);
      color: var(--fsds-nav-list-color-foreground-current);
    }
  `;

  override render() {
    return html`<fsds-stack as="li" class="nav-list__item"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-nav-list-item', NavListItemElement);
// @generated:end

// @custom:start trailing

// @custom:end