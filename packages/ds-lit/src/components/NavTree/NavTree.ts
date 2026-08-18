// @generated:start imports
import { LitElement, html, css, nothing, svg } from 'lit';
import { property } from 'lit/decorators.js';
import { resolveIcon } from "@full-stack-ds/iconography";
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type NavTreeIconSize = "sm" | "md";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
const ICON_GLYPH_SIZE_HINTS: Record<string, number> = { "sm": 16, "md": 20 };

export class NavTreeElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .nav-tree {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: 0;
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-nav-tree-color-foreground-default: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-nav-tree-color-foreground-hover: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-nav-tree-color-foreground-current: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-nav-tree-color-foreground-heading: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-nav-tree-color-foreground-heading-hover: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-nav-tree-color-connector: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-nav-tree-color-outline-focus: var(--fsds-semantic-color-border-accent, #d92d2e);
      --fsds-nav-tree-size-indent: var(--fsds-core-spacing-size-06, 16px);
      --fsds-nav-tree-size-margin-group: var(--fsds-core-spacing-size-04, 8px);
      --fsds-nav-tree-size-padding-block: var(--fsds-core-spacing-size-02, 2px);
      --fsds-nav-tree-size-padding-inline: var(--fsds-core-spacing-size-04, 8px);
      --fsds-nav-tree-size-font-size-heading: var(--fsds-semantic-typography-caption-03, 10px);
      --fsds-nav-tree-size-font-size-item: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-nav-tree-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-nav-tree-size-gap-heading: var(--fsds-core-spacing-size-03, 4px);
      --fsds-nav-tree-size-gap-item: var(--fsds-core-spacing-size-01, 1px);
      --fsds-nav-tree-state-layer-hover: var(--fsds-semantic-interaction-state-layer-hover, 0.04);
      --fsds-nav-tree-state-layer-selected: var(--fsds-semantic-interaction-state-layer-selected, 0.08);
    }

    .nav-tree {
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
      margin-block-end: var(--fsds-nav-tree-size-margin-group, 8px);
    }

    .nav-tree__heading {
      display: flex;
      align-items: center;
      gap: var(--fsds-nav-tree-size-gap-heading, 4px);
      font-size: var(--fsds-nav-tree-size-font-size-heading, 10px);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--fsds-nav-tree-color-foreground-heading, #474647);
    }

    .nav-tree__icon {
      display: inline-flex;
      flex-shrink: 0;
      color: inherit;
    }

    .nav-tree__headingLink {
      color: var(--fsds-nav-tree-color-foreground-heading, #474647);
      text-decoration: none;
      padding-block: var(--fsds-nav-tree-size-padding-block, 2px);
      padding-inline: var(--fsds-nav-tree-size-padding-inline, 8px);
      border-radius: var(--fsds-nav-tree-size-radius-default, 6px);
      transition-property: background-color, color;
      transition-duration: 120ms;
    }

    .nav-tree__headingLabel {
      padding-block: var(--fsds-nav-tree-size-padding-block, 2px);
      padding-inline: var(--fsds-nav-tree-size-padding-inline, 8px);
      border-radius: var(--fsds-nav-tree-size-radius-default, 6px);
    }

    .nav-tree__list {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-nav-tree-size-gap-item, 1px);
      list-style: none;
      margin-block: 0;
      padding-block: 0;
      padding-inline-start: var(--fsds-nav-tree-size-indent, 16px);
      padding-inline-end: 0;
    }

    .nav-tree__item {
      position: relative;
      display: block;
      color: var(--fsds-nav-tree-color-foreground-default, #474647);
      font-size: var(--fsds-nav-tree-size-font-size-item, 14px);
    }

    .nav-tree__item::before {
      content: "";
      position: absolute;
      inset-inline-start: calc(-1 * var(--fsds-nav-tree-size-indent, 16px));
      top: 0;
      bottom: 0;
      border-inline-start: 1px solid var(--fsds-nav-tree-color-connector, #d0d0d0);
    }

    .nav-tree__item::after {
      content: "";
      position: absolute;
      inset-inline-start: calc(-1 * var(--fsds-nav-tree-size-indent, 16px));
      top: 50%;
      width: calc(var(--fsds-nav-tree-size-indent, 16px) - var(--fsds-nav-tree-size-gap-heading, 4px));
      border-block-start: 1px solid var(--fsds-nav-tree-color-connector, #d0d0d0);
    }

    .nav-tree__item:last-child::before {
      bottom: 50%;
    }

    .nav-tree__item > * {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fsds-nav-tree-size-gap-heading, 4px);
      color: inherit;
      text-decoration: none;
      padding-block: var(--fsds-nav-tree-size-padding-block, 2px);
      border-radius: var(--fsds-nav-tree-size-radius-default, 6px);
      transition-property: background-color, color;
      transition-duration: 120ms;
    }

    .nav-tree__item > *:hover {
      background-color: color-mix(in srgb, currentColor calc(var(--fsds-nav-tree-state-layer-hover, 0.04) * 100%), transparent);
      color: var(--fsds-nav-tree-color-foreground-hover, #141414);
    }

    .nav-tree__item > *:focus-visible {
      outline: 2px solid var(--fsds-nav-tree-color-outline-focus, #d92d2e);
      outline-offset: 1px;
    }

    .nav-tree__item > *[aria-current="page"] {
      background-color: color-mix(in srgb, currentColor calc(var(--fsds-nav-tree-state-layer-selected, 0.08) * 100%), transparent);
      color: var(--fsds-nav-tree-color-foreground-current, #141414);
      font-weight: 600;
    }

    .nav-tree__headingLink:hover {
      background-color: color-mix(in srgb, currentColor calc(var(--fsds-nav-tree-state-layer-hover, 0.04) * 100%), transparent);
      color: var(--fsds-nav-tree-color-foreground-heading-hover, #141414);
    }

    .nav-tree__headingLink:focus-visible {
      outline: 2px solid var(--fsds-nav-tree-color-outline-focus, #d92d2e);
      outline-offset: 1px;
    }
  `;

  @property({ type: String }) label!: string;
  @property({ type: String }) href?: string;
  @property({ type: String }) icon?: string;
  @property({ type: String }) iconSize?: NavTreeIconSize = "sm";

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "nav-tree");
    this.setAttribute("role", "listitem");
  }

  private computeClasses(): string {
    return [
      "nav-tree",
      (this.iconSize ?? "sm") ? `nav-tree--${(this.iconSize ?? "sm")}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    const iconGlyphPx = ICON_GLYPH_SIZE_HINTS[(this.iconSize ?? "sm")];
    const iconGlyph = resolveIcon(this.icon ?? "", iconGlyphPx ?? Number.NaN);
    return html`<li class="${this.computeClasses()}" role="listitem">
  <div class=${'nav-tree__heading'}>
    ${this.icon ? html`
    <span class=${'nav-tree__icon'} aria-hidden="true">
      ${iconGlyph ? svg`
      <svg fill="none" xmlns="http://www.w3.org/2000/svg" data-fsds-icon=${iconGlyph.name} viewBox=${iconGlyph.viewBox} width=${iconGlyphPx ?? iconGlyph.size} height=${iconGlyphPx ?? iconGlyph.size}>
        ${iconGlyph.paths.map((glyphPath) => svg`<path d=${ifDefined(glyphPath.d)} fill=${ifDefined(glyphPath.fill)} stroke=${ifDefined(glyphPath.stroke)} stroke-width=${ifDefined(glyphPath.strokeWidth)} stroke-linecap=${ifDefined(glyphPath.strokeLineCap)} stroke-linejoin=${ifDefined(glyphPath.strokeLineJoin)} stroke-dasharray=${ifDefined(glyphPath.strokeDasharray)} fill-rule=${ifDefined(glyphPath.fillRule)} clip-rule=${ifDefined(glyphPath.clipRule)} />`)}
      </svg>
      ` : nothing}
    </span>
    ` : nothing}
    ${this.href ? html`
    <a class=${'nav-tree__headingLink'} href=${ifDefined(this.href)}>${this.label}</a>
    ` : nothing}
    ${!this.href ? html`
    <span class=${'nav-tree__headingLabel'}>${this.label}</span>
    ` : nothing}
  </div>
  <ul class=${'nav-tree__list'}>
    <slot></slot>
  </ul>
</li>`;
  }
}

customElements.define('fsds-nav-tree', NavTreeElement);


export class NavTreeListElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .nav-tree {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: 0;
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-nav-tree-color-foreground-default: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-nav-tree-color-foreground-hover: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-nav-tree-color-foreground-current: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-nav-tree-color-foreground-heading: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-nav-tree-color-foreground-heading-hover: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-nav-tree-color-connector: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-nav-tree-color-outline-focus: var(--fsds-semantic-color-border-accent, #d92d2e);
      --fsds-nav-tree-size-indent: var(--fsds-core-spacing-size-06, 16px);
      --fsds-nav-tree-size-margin-group: var(--fsds-core-spacing-size-04, 8px);
      --fsds-nav-tree-size-padding-block: var(--fsds-core-spacing-size-02, 2px);
      --fsds-nav-tree-size-padding-inline: var(--fsds-core-spacing-size-04, 8px);
      --fsds-nav-tree-size-font-size-heading: var(--fsds-semantic-typography-caption-03, 10px);
      --fsds-nav-tree-size-font-size-item: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-nav-tree-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-nav-tree-size-gap-heading: var(--fsds-core-spacing-size-03, 4px);
      --fsds-nav-tree-size-gap-item: var(--fsds-core-spacing-size-01, 1px);
      --fsds-nav-tree-state-layer-hover: var(--fsds-semantic-interaction-state-layer-hover, 0.04);
      --fsds-nav-tree-state-layer-selected: var(--fsds-semantic-interaction-state-layer-selected, 0.08);
    }

    .nav-tree {
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
      margin-block-end: var(--fsds-nav-tree-size-margin-group, 8px);
    }

    .nav-tree__heading {
      display: flex;
      align-items: center;
      gap: var(--fsds-nav-tree-size-gap-heading, 4px);
      font-size: var(--fsds-nav-tree-size-font-size-heading, 10px);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--fsds-nav-tree-color-foreground-heading, #474647);
    }

    .nav-tree__icon {
      display: inline-flex;
      flex-shrink: 0;
      color: inherit;
    }

    .nav-tree__headingLink {
      color: var(--fsds-nav-tree-color-foreground-heading, #474647);
      text-decoration: none;
      padding-block: var(--fsds-nav-tree-size-padding-block, 2px);
      padding-inline: var(--fsds-nav-tree-size-padding-inline, 8px);
      border-radius: var(--fsds-nav-tree-size-radius-default, 6px);
      transition-property: background-color, color;
      transition-duration: 120ms;
    }

    .nav-tree__headingLabel {
      padding-block: var(--fsds-nav-tree-size-padding-block, 2px);
      padding-inline: var(--fsds-nav-tree-size-padding-inline, 8px);
      border-radius: var(--fsds-nav-tree-size-radius-default, 6px);
    }

    .nav-tree__list {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-nav-tree-size-gap-item, 1px);
      list-style: none;
      margin-block: 0;
      padding-block: 0;
      padding-inline-start: var(--fsds-nav-tree-size-indent, 16px);
      padding-inline-end: 0;
    }

    .nav-tree__item {
      position: relative;
      display: block;
      color: var(--fsds-nav-tree-color-foreground-default, #474647);
      font-size: var(--fsds-nav-tree-size-font-size-item, 14px);
    }

    .nav-tree__item::before {
      content: "";
      position: absolute;
      inset-inline-start: calc(-1 * var(--fsds-nav-tree-size-indent, 16px));
      top: 0;
      bottom: 0;
      border-inline-start: 1px solid var(--fsds-nav-tree-color-connector, #d0d0d0);
    }

    .nav-tree__item::after {
      content: "";
      position: absolute;
      inset-inline-start: calc(-1 * var(--fsds-nav-tree-size-indent, 16px));
      top: 50%;
      width: calc(var(--fsds-nav-tree-size-indent, 16px) - var(--fsds-nav-tree-size-gap-heading, 4px));
      border-block-start: 1px solid var(--fsds-nav-tree-color-connector, #d0d0d0);
    }

    .nav-tree__item:last-child::before {
      bottom: 50%;
    }

    .nav-tree__item > * {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fsds-nav-tree-size-gap-heading, 4px);
      color: inherit;
      text-decoration: none;
      padding-block: var(--fsds-nav-tree-size-padding-block, 2px);
      border-radius: var(--fsds-nav-tree-size-radius-default, 6px);
      transition-property: background-color, color;
      transition-duration: 120ms;
    }

    .nav-tree__item > *:hover {
      background-color: color-mix(in srgb, currentColor calc(var(--fsds-nav-tree-state-layer-hover, 0.04) * 100%), transparent);
      color: var(--fsds-nav-tree-color-foreground-hover, #141414);
    }

    .nav-tree__item > *:focus-visible {
      outline: 2px solid var(--fsds-nav-tree-color-outline-focus, #d92d2e);
      outline-offset: 1px;
    }

    .nav-tree__item > *[aria-current="page"] {
      background-color: color-mix(in srgb, currentColor calc(var(--fsds-nav-tree-state-layer-selected, 0.08) * 100%), transparent);
      color: var(--fsds-nav-tree-color-foreground-current, #141414);
      font-weight: 600;
    }

    .nav-tree__headingLink:hover {
      background-color: color-mix(in srgb, currentColor calc(var(--fsds-nav-tree-state-layer-hover, 0.04) * 100%), transparent);
      color: var(--fsds-nav-tree-color-foreground-heading-hover, #141414);
    }

    .nav-tree__headingLink:focus-visible {
      outline: 2px solid var(--fsds-nav-tree-color-outline-focus, #d92d2e);
      outline-offset: 1px;
    }
  `;

  override render() {
    return html`<fsds-stack as="ul" variant="horizontal" class="nav-tree__list"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-nav-tree-list', NavTreeListElement);

export class NavTreeItemElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .nav-tree {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: 0;
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-nav-tree-color-foreground-default: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-nav-tree-color-foreground-hover: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-nav-tree-color-foreground-current: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-nav-tree-color-foreground-heading: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-nav-tree-color-foreground-heading-hover: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-nav-tree-color-connector: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-nav-tree-color-outline-focus: var(--fsds-semantic-color-border-accent, #d92d2e);
      --fsds-nav-tree-size-indent: var(--fsds-core-spacing-size-06, 16px);
      --fsds-nav-tree-size-margin-group: var(--fsds-core-spacing-size-04, 8px);
      --fsds-nav-tree-size-padding-block: var(--fsds-core-spacing-size-02, 2px);
      --fsds-nav-tree-size-padding-inline: var(--fsds-core-spacing-size-04, 8px);
      --fsds-nav-tree-size-font-size-heading: var(--fsds-semantic-typography-caption-03, 10px);
      --fsds-nav-tree-size-font-size-item: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-nav-tree-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-nav-tree-size-gap-heading: var(--fsds-core-spacing-size-03, 4px);
      --fsds-nav-tree-size-gap-item: var(--fsds-core-spacing-size-01, 1px);
      --fsds-nav-tree-state-layer-hover: var(--fsds-semantic-interaction-state-layer-hover, 0.04);
      --fsds-nav-tree-state-layer-selected: var(--fsds-semantic-interaction-state-layer-selected, 0.08);
    }

    .nav-tree {
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
      margin-block-end: var(--fsds-nav-tree-size-margin-group, 8px);
    }

    .nav-tree__heading {
      display: flex;
      align-items: center;
      gap: var(--fsds-nav-tree-size-gap-heading, 4px);
      font-size: var(--fsds-nav-tree-size-font-size-heading, 10px);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--fsds-nav-tree-color-foreground-heading, #474647);
    }

    .nav-tree__icon {
      display: inline-flex;
      flex-shrink: 0;
      color: inherit;
    }

    .nav-tree__headingLink {
      color: var(--fsds-nav-tree-color-foreground-heading, #474647);
      text-decoration: none;
      padding-block: var(--fsds-nav-tree-size-padding-block, 2px);
      padding-inline: var(--fsds-nav-tree-size-padding-inline, 8px);
      border-radius: var(--fsds-nav-tree-size-radius-default, 6px);
      transition-property: background-color, color;
      transition-duration: 120ms;
    }

    .nav-tree__headingLabel {
      padding-block: var(--fsds-nav-tree-size-padding-block, 2px);
      padding-inline: var(--fsds-nav-tree-size-padding-inline, 8px);
      border-radius: var(--fsds-nav-tree-size-radius-default, 6px);
    }

    .nav-tree__list {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-nav-tree-size-gap-item, 1px);
      list-style: none;
      margin-block: 0;
      padding-block: 0;
      padding-inline-start: var(--fsds-nav-tree-size-indent, 16px);
      padding-inline-end: 0;
    }

    .nav-tree__item {
      position: relative;
      display: block;
      color: var(--fsds-nav-tree-color-foreground-default, #474647);
      font-size: var(--fsds-nav-tree-size-font-size-item, 14px);
    }

    .nav-tree__item::before {
      content: "";
      position: absolute;
      inset-inline-start: calc(-1 * var(--fsds-nav-tree-size-indent, 16px));
      top: 0;
      bottom: 0;
      border-inline-start: 1px solid var(--fsds-nav-tree-color-connector, #d0d0d0);
    }

    .nav-tree__item::after {
      content: "";
      position: absolute;
      inset-inline-start: calc(-1 * var(--fsds-nav-tree-size-indent, 16px));
      top: 50%;
      width: calc(var(--fsds-nav-tree-size-indent, 16px) - var(--fsds-nav-tree-size-gap-heading, 4px));
      border-block-start: 1px solid var(--fsds-nav-tree-color-connector, #d0d0d0);
    }

    .nav-tree__item:last-child::before {
      bottom: 50%;
    }

    .nav-tree__item > * {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fsds-nav-tree-size-gap-heading, 4px);
      color: inherit;
      text-decoration: none;
      padding-block: var(--fsds-nav-tree-size-padding-block, 2px);
      border-radius: var(--fsds-nav-tree-size-radius-default, 6px);
      transition-property: background-color, color;
      transition-duration: 120ms;
    }

    .nav-tree__item > *:hover {
      background-color: color-mix(in srgb, currentColor calc(var(--fsds-nav-tree-state-layer-hover, 0.04) * 100%), transparent);
      color: var(--fsds-nav-tree-color-foreground-hover, #141414);
    }

    .nav-tree__item > *:focus-visible {
      outline: 2px solid var(--fsds-nav-tree-color-outline-focus, #d92d2e);
      outline-offset: 1px;
    }

    .nav-tree__item > *[aria-current="page"] {
      background-color: color-mix(in srgb, currentColor calc(var(--fsds-nav-tree-state-layer-selected, 0.08) * 100%), transparent);
      color: var(--fsds-nav-tree-color-foreground-current, #141414);
      font-weight: 600;
    }

    .nav-tree__headingLink:hover {
      background-color: color-mix(in srgb, currentColor calc(var(--fsds-nav-tree-state-layer-hover, 0.04) * 100%), transparent);
      color: var(--fsds-nav-tree-color-foreground-heading-hover, #141414);
    }

    .nav-tree__headingLink:focus-visible {
      outline: 2px solid var(--fsds-nav-tree-color-outline-focus, #d92d2e);
      outline-offset: 1px;
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("role", "listitem");
  }

  override render() {
    return html`<fsds-stack as="li" class="nav-tree__item"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-nav-tree-item', NavTreeItemElement);
// @generated:end

// @custom:start trailing

// @custom:end