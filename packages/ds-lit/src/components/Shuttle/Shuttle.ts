// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ShuttleBehavior } from './ShuttleBehavior.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class ShuttleElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .shuttle {
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
      --fsds-shuttle-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-shuttle-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-shuttle-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-shuttle-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-shuttle-size-padding-default: var(--fsds-core-spacing-size-07, 24px);
      --fsds-shuttle-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
    }

    .shuttle {
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
      background-color: var(--fsds-shuttle-color-background-default);
      border-color: var(--fsds-shuttle-color-border-accent);
      padding: var(--fsds-shuttle-size-padding-default);
      border-radius: var(--fsds-shuttle-size-radius-default);
    }

    .shuttle__item {
      display: flex;
      align-items: center;
      padding: 4px 8px;
      color: var(--fsds-shuttle-color-foreground-primary);
      cursor: pointer;
    }
  `;

  @property({ attribute: 'aria-label', reflect: true })
  override ariaLabel: string | null = null;
  @property({ attribute: false }) value?: string[];
  @property({ attribute: false }) defaultValue?: string[] = ["alpha","beta","gamma"];
  @property({ attribute: false }) onValueChange?: (value: string[]) => void;

  private behavior = new ShuttleBehavior(this, {
    value: () => this.value,
    defaultValue: this.defaultValue,
    onValueChange: (v) => this.onValueChange?.(v),
  });

  private computeClasses(): string {
    return [
      "shuttle",
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<ul class="${this.computeClasses()}" role="listbox" aria-label=${ifDefined(this.ariaLabel ?? undefined)}>
  ${(this.behavior.selection ?? []).map((item, index) => html`
  <li class=${'shuttle__item'} role="option" aria-selected="true">
    <span>${item}</span>
  </li>
  `)}
</ul>`;
  }
}

customElements.define('fsds-shuttle', ShuttleElement);

export class ShuttleItemElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .shuttle {
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
      --fsds-shuttle-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-shuttle-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-shuttle-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-shuttle-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-shuttle-size-padding-default: var(--fsds-core-spacing-size-07, 24px);
      --fsds-shuttle-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
    }

    .shuttle {
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
      background-color: var(--fsds-shuttle-color-background-default);
      border-color: var(--fsds-shuttle-color-border-accent);
      padding: var(--fsds-shuttle-size-padding-default);
      border-radius: var(--fsds-shuttle-size-radius-default);
    }

    .shuttle__item {
      display: flex;
      align-items: center;
      padding: 4px 8px;
      color: var(--fsds-shuttle-color-foreground-primary);
      cursor: pointer;
    }
  `;

  override render() {
    return html`<fsds-stack as="li" class="shuttle__item"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-shuttle-item', ShuttleItemElement);
// @generated:end

// @custom:start trailing

// @custom:end