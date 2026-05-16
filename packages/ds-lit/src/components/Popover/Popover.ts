// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { PopoverBehavior } from './PopoverBehavior.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type PopoverPlacement = "top" | "bottom" | "left" | "right" | "auto";
export type PopoverTriggerStrategy = "click" | "hover";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class PopoverElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property({ type: Boolean }) open?: boolean;
  @property({ type: Boolean }) defaultOpen?: boolean;
  @property() placement?: PopoverPlacement = "auto";
  @property() triggerStrategy?: PopoverTriggerStrategy = "click";
  @property({ type: Number }) offset?: number = 8;
  @property({ type: Boolean }) closeOnOutsideClick?: boolean;
  @property({ type: Boolean }) closeOnEscape?: boolean;
  @property() anchor?: HTMLElement | null;
  @property({ attribute: false }) onOpenChange?: (value: boolean) => void;

  private behavior = new PopoverBehavior(this, {
    open: () => this.open,
    defaultOpen: this.defaultOpen,
    onOpenChange: (v) => this.onOpenChange?.(v),
    closeOnEscape: this.closeOnEscape,
    closeOnOutsideClick: this.closeOnOutsideClick,
  });

  private computeClasses(): string {
    return [
      "popover",
      this.placement ? `popover--${this.placement}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}">
  <button class=${'popover__trigger'} type="button" aria-haspopup="true" aria-expanded=${this.behavior.open ? 'true' : 'false'} aria-controls="popover-content">
    <slot></slot>
  </button>
  ${this.behavior.open ? html`
  <div class=${'popover__content'} id="popover-content">
    <slot></slot>
  </div>
  ` : nothing}
</div>`;
  }
}

customElements.define('fsds-popover', PopoverElement);

export class PopoverTriggerElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="button" class="popover__trigger"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-popover-trigger', PopoverTriggerElement);

export class PopoverContentElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack class="popover__content"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-popover-content', PopoverContentElement);
// @generated:end

// @custom:start trailing

// @custom:end