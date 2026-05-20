// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { SelectBehavior } from './SelectBehavior.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SelectOption = { value: string; label: string; disabled?: boolean };
export type SelectSize = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class SelectElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property({ attribute: false }) options!: SelectOption[];
  @property({ attribute: false }) value?: string | string[];
  @property({ attribute: false }) defaultValue?: string | string[];
  @property({ type: Boolean }) open?: boolean;
  @property({ type: Boolean }) defaultOpen?: boolean;
  @property({ type: Boolean }) multiple?: boolean;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ attribute: false }) size?: SelectSize = "md";
  @property({ attribute: false }) filterFn?: ((option: SelectOption, searchTerm: string) => boolean);
  @property({ type: Boolean }) searchable?: boolean;
  @property({ type: Boolean }) empty?: boolean;
  @property({ attribute: false }) onChange?: (value: string | string[]) => void;
  @property({ attribute: false }) onOpenChange?: (value: boolean) => void;
  @property() position?: string;

  private behavior = new SelectBehavior(this, {
    value: () => this.value,
    defaultValue: this.defaultValue,
    onChange: (v) => this.onChange?.(v),
    open: () => this.open,
    defaultOpen: this.defaultOpen,
    onOpenChange: (v) => this.onOpenChange?.(v),
  });

  private computeClasses(): string {
    return [
      "select",
      this.size ? `select--${this.size}` : null,
      this.position ? `select--${this.position}` : null,
      this.behavior.open ? "select--open" : null,
      this.disabled ? "select--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" role="combobox" aria-haspopup="listbox" aria-controls="fsds-select-listbox" aria-expanded=${this.behavior.open ? 'true' : 'false'} aria-disabled=${ifDefined(this.disabled === undefined ? undefined : (this.disabled ? 'true' : 'false'))}>
  <button class=${'select__trigger'} type="button" ?disabled=${this.disabled ?? false}>
    <span class=${'select__text'}></span>
  </button>
  ${this.behavior.open ? html`
  <div class=${'select__content'} role="listbox" id="fsds-select-listbox" data-fsds-channel-renders="open">
    ${this.searchable ? html`
    <div class=${'select__search'}>
      <input type="text" />
    </div>
    ` : nothing}
    <div class=${'select__options'}>
      <div class=${'select__option'} role="option"></div>
    </div>
    ${this.empty ? html`
    <div class=${'select__emptyState'}></div>
    ` : nothing}
  </div>
  ` : nothing}
</div>`;
  }
}

customElements.define('fsds-select', SelectElement);

export class SelectTriggerElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="button" class="select__trigger"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-select-trigger', SelectTriggerElement);

export class SelectContentElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack class="select__content"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-select-content', SelectContentElement);

export class SelectOptionElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="li" class="select__option"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-select-option', SelectOptionElement);
// @generated:end

// @custom:start trailing

// @custom:end