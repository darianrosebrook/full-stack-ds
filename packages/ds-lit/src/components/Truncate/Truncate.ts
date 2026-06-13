// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { TruncateBehavior } from './TruncateBehavior.js';
import { styleMap } from 'lit/directives/style-map.js';
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
      --fsds-truncate-color-foreground-link: var(--fsds-semantic-color-foreground-link, #d9292b);
      --fsds-truncate-color-background-primary: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-truncate-typography-fontWeight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-truncate-spacing-toggle: var(--fsds-core-spacing-size-02, 2px);
      --fsds-truncate-color-foreground-linkHover: var(--fsds-semantic-color-foreground-linkHover, #ae0001);
    }

    .truncate {
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

    .truncate__content {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: var(--fsds-truncate-content-lines, 3);
      line-clamp: var(--fsds-truncate-content-lines, 3);
      overflow: hidden;
    }

    .truncate--expanded .truncate__content {
      display: block;
      -webkit-line-clamp: unset;
      line-clamp: unset;
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
  @property({ attribute: false }) onExpandedChange?: (expanded: boolean) => void;
  @property({ type: String }) expandText?: string = "Show more";
  @property({ type: String }) collapseText?: string = "Show less";

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
  <span class=${'truncate__content'} style=${styleMap({ '--fsds-truncate-content-lines': this.lines === undefined ? undefined : String(this.lines) })}>
    <slot></slot>
  </span>
  ${this.expandable ? html`
  <button class=${'truncate__toggle'} type="button" @click=${() => this.behavior.setExpanded(!this.behavior.expanded)} aria-expanded=${this.behavior.expanded ? 'true' : 'false'}>${(this.behavior.expanded ? this.collapseText : this.expandText)}</button>
  ` : nothing}
</div>`;
  }
}

customElements.define('fsds-truncate', TruncateElement);

export class TruncateContentElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .truncate {
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
      --fsds-truncate-color-foreground-link: var(--fsds-semantic-color-foreground-link, #d9292b);
      --fsds-truncate-color-background-primary: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-truncate-typography-fontWeight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-truncate-spacing-toggle: var(--fsds-core-spacing-size-02, 2px);
      --fsds-truncate-color-foreground-linkHover: var(--fsds-semantic-color-foreground-linkHover, #ae0001);
    }

    .truncate {
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

    .truncate__content {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: var(--fsds-truncate-content-lines, 3);
      line-clamp: var(--fsds-truncate-content-lines, 3);
      overflow: hidden;
    }

    .truncate--expanded .truncate__content {
      display: block;
      -webkit-line-clamp: unset;
      line-clamp: unset;
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