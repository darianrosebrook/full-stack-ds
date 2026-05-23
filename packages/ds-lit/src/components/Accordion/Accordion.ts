// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { AccordionBehavior } from './AccordionBehavior.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AccordionType = "single" | "multiple";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class AccordionElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .accordion {
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
      --fsds-accordion-color-background-hover: var(--fsds-semantic-interaction-background-hover, #efefef);
      --fsds-accordion-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-accordion-color-textSecondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-accordion-color-icon: var(--fsds-semantic-color-foreground-tertiary, #717171);
      --fsds-accordion-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-accordion-border-color: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-accordion-border-radius: var(--fsds-core-shape-radius-small, 4px);
      --fsds-accordion-spacing-gap: var(--fsds-core-spacing-size-07, 24px);
      --fsds-accordion-spacing-paddingX: var(--fsds-core-spacing-size-00, 0px);
      --fsds-accordion-spacing-paddingY: var(--fsds-core-spacing-size-04, 8px);
      --fsds-accordion-text-weight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-accordion-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-accordion-text-lineHeight: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-accordion-text-sizeContent: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-accordion-text-lineHeightContent: var(--fsds-semantic-typography-line-height-loose, 1.8);
      --fsds-accordion-icon-size: var(--fsds-core-spacing-size-04, 8px);
      --fsds-accordion-focus-width: var(--fsds-core-shape-border-width-thick, 2px);
      --fsds-accordion-focus-color: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-accordion-focus-offset: var(--fsds-core-spacing-size-01, 1px);
      --fsds-accordion-opacity-disabled: var(--fsds-semantic-interaction-disabled-opacity, 0.5);
      --fsds-accordion-color-textHover: var(--fsds-semantic-interaction-text-hover, #555555);
    }
    
    .accordion {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-accordion-spacing-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      flex-direction: column;
      border-color: var(--fsds-accordion-border-color);
      border-radius: var(--fsds-accordion-border-radius);
      font-size: var(--fsds-accordion-text-sizeContent);
      line-height: var(--fsds-accordion-text-lineHeightContent);
    }
    
    .accordion__item {
      background-color: transparent;
      border-color: var(--fsds-accordion-border-color);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-accordion-border-radius);
      overflow: hidden;
    }
    
    .accordion__header {
      margin: 0;
    }
    
    .accordion__trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: var(--fsds-accordion-spacing-paddingY);
      background: transparent;
      border: 0;
      cursor: pointer;
      font-size: var(--fsds-accordion-text-size);
      font-weight: var(--fsds-accordion-text-weight);
      color: var(--fsds-accordion-color-text);
      text-align: left;
      line-height: var(--fsds-accordion-text-lineHeight);
    }
    
    .accordion__trigger:hover {
      background-color: var(--fsds-accordion-color-background-hover);
      color: var(--fsds-accordion-color-textHover);
    }
    
    .accordion__trigger:focus-visible {
      outline-width: var(--fsds-accordion-focus-width);
      outline-color: var(--fsds-accordion-focus-color);
      outline-offset: var(--fsds-accordion-focus-offset);
      outline-style: solid;
    }
    
    .accordion__chevron {
      display: inline-flex;
      flex-shrink: 0;
      width: var(--fsds-accordion-icon-size);
      height: var(--fsds-accordion-icon-size);
      align-items: center;
      justify-content: center;
      transition: transform 200ms ease;
      color: var(--fsds-accordion-color-icon);
    }
    
    .accordion__trigger[aria-expanded="true"] .accordion__chevron {
      transform: rotate(180deg);
    }
    
    .accordion__content {
      display: block;
      overflow: hidden;
    }
    
    .accordion__contentInner {
      padding: var(--fsds-accordion-spacing-paddingY);
      color: var(--fsds-accordion-color-textSecondary);
      font-size: var(--fsds-accordion-text-sizeContent);
      line-height: var(--fsds-accordion-text-lineHeightContent);
    }
    
    .accordion--disabled {
      opacity: var(--fsds-accordion-opacity-disabled);
      pointer-events: none;
    }
  `;

  @property({ type: String }) type?: AccordionType = "single";
  @property({ attribute: false }) value?: string | string[];
  @property({ attribute: false }) defaultValue?: string | string[];
  @property({ attribute: false }) onValueChange?: (value: string | string[]) => void;
  @property({ type: Boolean }) collapsible?: boolean = false;
  @property({ type: Boolean }) disabled?: boolean;

  private behavior = new AccordionBehavior(this, {
    value: () => this.value,
    defaultValue: this.defaultValue,
    onValueChange: (v) => this.onValueChange?.(v),
  });

  private computeClasses(): string {
    return [
      "accordion",
      this.type ? `accordion--${this.type}` : null,
      this.disabled ? "accordion--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}">
  <div class=${'accordion__item'}>
    <h3 class=${'accordion__header'}>
      <button class=${'accordion__trigger'} type="button" aria-expanded=${this.behavior.openness}>
        <slot></slot>
        <span class=${'accordion__chevron'}></span>
      </button>
    </h3>
    <div class=${'accordion__content'}>
      <div class=${'accordion__contentInner'}>
        <slot></slot>
      </div>
    </div>
  </div>
</div>`;
  }
}

customElements.define('fsds-accordion', AccordionElement);

export class AccordionItemElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .accordion {
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
      --fsds-accordion-color-background-hover: var(--fsds-semantic-interaction-background-hover, #efefef);
      --fsds-accordion-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-accordion-color-textSecondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-accordion-color-icon: var(--fsds-semantic-color-foreground-tertiary, #717171);
      --fsds-accordion-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-accordion-border-color: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-accordion-border-radius: var(--fsds-core-shape-radius-small, 4px);
      --fsds-accordion-spacing-gap: var(--fsds-core-spacing-size-07, 24px);
      --fsds-accordion-spacing-paddingX: var(--fsds-core-spacing-size-00, 0px);
      --fsds-accordion-spacing-paddingY: var(--fsds-core-spacing-size-04, 8px);
      --fsds-accordion-text-weight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-accordion-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-accordion-text-lineHeight: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-accordion-text-sizeContent: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-accordion-text-lineHeightContent: var(--fsds-semantic-typography-line-height-loose, 1.8);
      --fsds-accordion-icon-size: var(--fsds-core-spacing-size-04, 8px);
      --fsds-accordion-focus-width: var(--fsds-core-shape-border-width-thick, 2px);
      --fsds-accordion-focus-color: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-accordion-focus-offset: var(--fsds-core-spacing-size-01, 1px);
      --fsds-accordion-opacity-disabled: var(--fsds-semantic-interaction-disabled-opacity, 0.5);
      --fsds-accordion-color-textHover: var(--fsds-semantic-interaction-text-hover, #555555);
    }
    
    .accordion {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-accordion-spacing-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      flex-direction: column;
      border-color: var(--fsds-accordion-border-color);
      border-radius: var(--fsds-accordion-border-radius);
      font-size: var(--fsds-accordion-text-sizeContent);
      line-height: var(--fsds-accordion-text-lineHeightContent);
    }
    
    .accordion__item {
      background-color: transparent;
      border-color: var(--fsds-accordion-border-color);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-accordion-border-radius);
      overflow: hidden;
    }
    
    .accordion__header {
      margin: 0;
    }
    
    .accordion__trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: var(--fsds-accordion-spacing-paddingY);
      background: transparent;
      border: 0;
      cursor: pointer;
      font-size: var(--fsds-accordion-text-size);
      font-weight: var(--fsds-accordion-text-weight);
      color: var(--fsds-accordion-color-text);
      text-align: left;
      line-height: var(--fsds-accordion-text-lineHeight);
    }
    
    .accordion__trigger:hover {
      background-color: var(--fsds-accordion-color-background-hover);
      color: var(--fsds-accordion-color-textHover);
    }
    
    .accordion__trigger:focus-visible {
      outline-width: var(--fsds-accordion-focus-width);
      outline-color: var(--fsds-accordion-focus-color);
      outline-offset: var(--fsds-accordion-focus-offset);
      outline-style: solid;
    }
    
    .accordion__chevron {
      display: inline-flex;
      flex-shrink: 0;
      width: var(--fsds-accordion-icon-size);
      height: var(--fsds-accordion-icon-size);
      align-items: center;
      justify-content: center;
      transition: transform 200ms ease;
      color: var(--fsds-accordion-color-icon);
    }
    
    .accordion__trigger[aria-expanded="true"] .accordion__chevron {
      transform: rotate(180deg);
    }
    
    .accordion__content {
      display: block;
      overflow: hidden;
    }
    
    .accordion__contentInner {
      padding: var(--fsds-accordion-spacing-paddingY);
      color: var(--fsds-accordion-color-textSecondary);
      font-size: var(--fsds-accordion-text-sizeContent);
      line-height: var(--fsds-accordion-text-lineHeightContent);
    }
    
    .accordion--disabled {
      opacity: var(--fsds-accordion-opacity-disabled);
      pointer-events: none;
    }
  `;

  override render() {
    return html`<fsds-stack as="li" class="accordion__item"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-accordion-item', AccordionItemElement);

export class AccordionTriggerElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .accordion {
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
      --fsds-accordion-color-background-hover: var(--fsds-semantic-interaction-background-hover, #efefef);
      --fsds-accordion-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-accordion-color-textSecondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-accordion-color-icon: var(--fsds-semantic-color-foreground-tertiary, #717171);
      --fsds-accordion-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-accordion-border-color: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-accordion-border-radius: var(--fsds-core-shape-radius-small, 4px);
      --fsds-accordion-spacing-gap: var(--fsds-core-spacing-size-07, 24px);
      --fsds-accordion-spacing-paddingX: var(--fsds-core-spacing-size-00, 0px);
      --fsds-accordion-spacing-paddingY: var(--fsds-core-spacing-size-04, 8px);
      --fsds-accordion-text-weight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-accordion-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-accordion-text-lineHeight: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-accordion-text-sizeContent: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-accordion-text-lineHeightContent: var(--fsds-semantic-typography-line-height-loose, 1.8);
      --fsds-accordion-icon-size: var(--fsds-core-spacing-size-04, 8px);
      --fsds-accordion-focus-width: var(--fsds-core-shape-border-width-thick, 2px);
      --fsds-accordion-focus-color: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-accordion-focus-offset: var(--fsds-core-spacing-size-01, 1px);
      --fsds-accordion-opacity-disabled: var(--fsds-semantic-interaction-disabled-opacity, 0.5);
      --fsds-accordion-color-textHover: var(--fsds-semantic-interaction-text-hover, #555555);
    }
    
    .accordion {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-accordion-spacing-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      flex-direction: column;
      border-color: var(--fsds-accordion-border-color);
      border-radius: var(--fsds-accordion-border-radius);
      font-size: var(--fsds-accordion-text-sizeContent);
      line-height: var(--fsds-accordion-text-lineHeightContent);
    }
    
    .accordion__item {
      background-color: transparent;
      border-color: var(--fsds-accordion-border-color);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-accordion-border-radius);
      overflow: hidden;
    }
    
    .accordion__header {
      margin: 0;
    }
    
    .accordion__trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: var(--fsds-accordion-spacing-paddingY);
      background: transparent;
      border: 0;
      cursor: pointer;
      font-size: var(--fsds-accordion-text-size);
      font-weight: var(--fsds-accordion-text-weight);
      color: var(--fsds-accordion-color-text);
      text-align: left;
      line-height: var(--fsds-accordion-text-lineHeight);
    }
    
    .accordion__trigger:hover {
      background-color: var(--fsds-accordion-color-background-hover);
      color: var(--fsds-accordion-color-textHover);
    }
    
    .accordion__trigger:focus-visible {
      outline-width: var(--fsds-accordion-focus-width);
      outline-color: var(--fsds-accordion-focus-color);
      outline-offset: var(--fsds-accordion-focus-offset);
      outline-style: solid;
    }
    
    .accordion__chevron {
      display: inline-flex;
      flex-shrink: 0;
      width: var(--fsds-accordion-icon-size);
      height: var(--fsds-accordion-icon-size);
      align-items: center;
      justify-content: center;
      transition: transform 200ms ease;
      color: var(--fsds-accordion-color-icon);
    }
    
    .accordion__trigger[aria-expanded="true"] .accordion__chevron {
      transform: rotate(180deg);
    }
    
    .accordion__content {
      display: block;
      overflow: hidden;
    }
    
    .accordion__contentInner {
      padding: var(--fsds-accordion-spacing-paddingY);
      color: var(--fsds-accordion-color-textSecondary);
      font-size: var(--fsds-accordion-text-sizeContent);
      line-height: var(--fsds-accordion-text-lineHeightContent);
    }
    
    .accordion--disabled {
      opacity: var(--fsds-accordion-opacity-disabled);
      pointer-events: none;
    }
  `;

  override render() {
    return html`<fsds-stack as="button" class="accordion__trigger"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-accordion-trigger', AccordionTriggerElement);

export class AccordionHeaderElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .accordion {
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
      --fsds-accordion-color-background-hover: var(--fsds-semantic-interaction-background-hover, #efefef);
      --fsds-accordion-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-accordion-color-textSecondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-accordion-color-icon: var(--fsds-semantic-color-foreground-tertiary, #717171);
      --fsds-accordion-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-accordion-border-color: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-accordion-border-radius: var(--fsds-core-shape-radius-small, 4px);
      --fsds-accordion-spacing-gap: var(--fsds-core-spacing-size-07, 24px);
      --fsds-accordion-spacing-paddingX: var(--fsds-core-spacing-size-00, 0px);
      --fsds-accordion-spacing-paddingY: var(--fsds-core-spacing-size-04, 8px);
      --fsds-accordion-text-weight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-accordion-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-accordion-text-lineHeight: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-accordion-text-sizeContent: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-accordion-text-lineHeightContent: var(--fsds-semantic-typography-line-height-loose, 1.8);
      --fsds-accordion-icon-size: var(--fsds-core-spacing-size-04, 8px);
      --fsds-accordion-focus-width: var(--fsds-core-shape-border-width-thick, 2px);
      --fsds-accordion-focus-color: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-accordion-focus-offset: var(--fsds-core-spacing-size-01, 1px);
      --fsds-accordion-opacity-disabled: var(--fsds-semantic-interaction-disabled-opacity, 0.5);
      --fsds-accordion-color-textHover: var(--fsds-semantic-interaction-text-hover, #555555);
    }
    
    .accordion {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-accordion-spacing-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      flex-direction: column;
      border-color: var(--fsds-accordion-border-color);
      border-radius: var(--fsds-accordion-border-radius);
      font-size: var(--fsds-accordion-text-sizeContent);
      line-height: var(--fsds-accordion-text-lineHeightContent);
    }
    
    .accordion__item {
      background-color: transparent;
      border-color: var(--fsds-accordion-border-color);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-accordion-border-radius);
      overflow: hidden;
    }
    
    .accordion__header {
      margin: 0;
    }
    
    .accordion__trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: var(--fsds-accordion-spacing-paddingY);
      background: transparent;
      border: 0;
      cursor: pointer;
      font-size: var(--fsds-accordion-text-size);
      font-weight: var(--fsds-accordion-text-weight);
      color: var(--fsds-accordion-color-text);
      text-align: left;
      line-height: var(--fsds-accordion-text-lineHeight);
    }
    
    .accordion__trigger:hover {
      background-color: var(--fsds-accordion-color-background-hover);
      color: var(--fsds-accordion-color-textHover);
    }
    
    .accordion__trigger:focus-visible {
      outline-width: var(--fsds-accordion-focus-width);
      outline-color: var(--fsds-accordion-focus-color);
      outline-offset: var(--fsds-accordion-focus-offset);
      outline-style: solid;
    }
    
    .accordion__chevron {
      display: inline-flex;
      flex-shrink: 0;
      width: var(--fsds-accordion-icon-size);
      height: var(--fsds-accordion-icon-size);
      align-items: center;
      justify-content: center;
      transition: transform 200ms ease;
      color: var(--fsds-accordion-color-icon);
    }
    
    .accordion__trigger[aria-expanded="true"] .accordion__chevron {
      transform: rotate(180deg);
    }
    
    .accordion__content {
      display: block;
      overflow: hidden;
    }
    
    .accordion__contentInner {
      padding: var(--fsds-accordion-spacing-paddingY);
      color: var(--fsds-accordion-color-textSecondary);
      font-size: var(--fsds-accordion-text-sizeContent);
      line-height: var(--fsds-accordion-text-lineHeightContent);
    }
    
    .accordion--disabled {
      opacity: var(--fsds-accordion-opacity-disabled);
      pointer-events: none;
    }
  `;

  override render() {
    return html`<fsds-stack as="header" class="accordion__header"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-accordion-header', AccordionHeaderElement);

export class AccordionContentElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .accordion {
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
      --fsds-accordion-color-background-hover: var(--fsds-semantic-interaction-background-hover, #efefef);
      --fsds-accordion-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-accordion-color-textSecondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-accordion-color-icon: var(--fsds-semantic-color-foreground-tertiary, #717171);
      --fsds-accordion-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-accordion-border-color: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-accordion-border-radius: var(--fsds-core-shape-radius-small, 4px);
      --fsds-accordion-spacing-gap: var(--fsds-core-spacing-size-07, 24px);
      --fsds-accordion-spacing-paddingX: var(--fsds-core-spacing-size-00, 0px);
      --fsds-accordion-spacing-paddingY: var(--fsds-core-spacing-size-04, 8px);
      --fsds-accordion-text-weight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-accordion-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-accordion-text-lineHeight: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-accordion-text-sizeContent: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-accordion-text-lineHeightContent: var(--fsds-semantic-typography-line-height-loose, 1.8);
      --fsds-accordion-icon-size: var(--fsds-core-spacing-size-04, 8px);
      --fsds-accordion-focus-width: var(--fsds-core-shape-border-width-thick, 2px);
      --fsds-accordion-focus-color: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-accordion-focus-offset: var(--fsds-core-spacing-size-01, 1px);
      --fsds-accordion-opacity-disabled: var(--fsds-semantic-interaction-disabled-opacity, 0.5);
      --fsds-accordion-color-textHover: var(--fsds-semantic-interaction-text-hover, #555555);
    }
    
    .accordion {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-accordion-spacing-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      flex-direction: column;
      border-color: var(--fsds-accordion-border-color);
      border-radius: var(--fsds-accordion-border-radius);
      font-size: var(--fsds-accordion-text-sizeContent);
      line-height: var(--fsds-accordion-text-lineHeightContent);
    }
    
    .accordion__item {
      background-color: transparent;
      border-color: var(--fsds-accordion-border-color);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-accordion-border-radius);
      overflow: hidden;
    }
    
    .accordion__header {
      margin: 0;
    }
    
    .accordion__trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: var(--fsds-accordion-spacing-paddingY);
      background: transparent;
      border: 0;
      cursor: pointer;
      font-size: var(--fsds-accordion-text-size);
      font-weight: var(--fsds-accordion-text-weight);
      color: var(--fsds-accordion-color-text);
      text-align: left;
      line-height: var(--fsds-accordion-text-lineHeight);
    }
    
    .accordion__trigger:hover {
      background-color: var(--fsds-accordion-color-background-hover);
      color: var(--fsds-accordion-color-textHover);
    }
    
    .accordion__trigger:focus-visible {
      outline-width: var(--fsds-accordion-focus-width);
      outline-color: var(--fsds-accordion-focus-color);
      outline-offset: var(--fsds-accordion-focus-offset);
      outline-style: solid;
    }
    
    .accordion__chevron {
      display: inline-flex;
      flex-shrink: 0;
      width: var(--fsds-accordion-icon-size);
      height: var(--fsds-accordion-icon-size);
      align-items: center;
      justify-content: center;
      transition: transform 200ms ease;
      color: var(--fsds-accordion-color-icon);
    }
    
    .accordion__trigger[aria-expanded="true"] .accordion__chevron {
      transform: rotate(180deg);
    }
    
    .accordion__content {
      display: block;
      overflow: hidden;
    }
    
    .accordion__contentInner {
      padding: var(--fsds-accordion-spacing-paddingY);
      color: var(--fsds-accordion-color-textSecondary);
      font-size: var(--fsds-accordion-text-sizeContent);
      line-height: var(--fsds-accordion-text-lineHeightContent);
    }
    
    .accordion--disabled {
      opacity: var(--fsds-accordion-opacity-disabled);
      pointer-events: none;
    }
  `;

  override render() {
    return html`<fsds-stack class="accordion__content"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-accordion-content', AccordionContentElement);
// @generated:end

// @custom:start trailing

// @custom:end