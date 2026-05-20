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
  static override styles = css`:host { display: contents; }`;

  @property({ attribute: false }) type?: AccordionType = "single";
  @property({ attribute: false }) value?: string | string[];
  @property({ attribute: false }) defaultValue?: string | string[];
  @property({ type: Boolean }) collapsible?: boolean = false;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ attribute: false }) onValueChange?: (value: string | string[]) => void;

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
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="li" class="accordion__item"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-accordion-item', AccordionItemElement);

export class AccordionTriggerElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="button" class="accordion__trigger"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-accordion-trigger', AccordionTriggerElement);

export class AccordionHeaderElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="header" class="accordion__header"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-accordion-header', AccordionHeaderElement);

export class AccordionContentElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack class="accordion__content"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-accordion-content', AccordionContentElement);
// @generated:end

// @custom:start trailing

// @custom:end