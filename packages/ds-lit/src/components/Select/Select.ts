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
  static override styles = css`
    :host { display: contents; }
    .select {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-primary, #f29495);
      --fsds-select-color-icon-default: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-select-color-placeholder-default: var(--fsds-semantic-color-foreground-placeholder, #8f8f8f);
      --fsds-select-size-padding-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-select-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-select-size-border-default: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-select-size-sm-height: var(--fsds-semantic-control-size-sm-height, 24px);
      --fsds-select-size-md-height: var(--fsds-semantic-control-size-md-height, 32px);
      --fsds-select-size-lg-height: var(--fsds-semantic-control-size-lg-height, 48px);
      --fsds-select-font-size-default: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-select-font-lineHeight-default: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-select-color-background-hover: var(--fsds-semantic-color-background-hover, #cecece);
      --fsds-select-color-foreground-hover: var(--fsds-semantic-color-foreground-hover, #3a3a3a);
      --fsds-select-color-border-hover: var(--fsds-semantic-color-border-bold, #8f8f8f);
      --fsds-select-color-background-disabled: var(--fsds-semantic-color-background-disabled, #cecece);
      --fsds-select-color-foreground-disabled: var(--fsds-semantic-color-foreground-disabled, #aeaeae);
      --fsds-select-color-border-disabled: var(--fsds-semantic-color-border-disabled, #cecece);
      --fsds-select-color-border-isOpen: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-select-color-icon-isOpen: var(--fsds-semantic-color-foreground-accent, #d9292b);
      --fsds-select-color-background-selected: var(--fsds-semantic-color-background-highlight, #f7c1c2);
      --fsds-select-color-foreground-selected: var(--fsds-semantic-color-foreground-accent, #d9292b);
    }
    
    .select {
      display: inline-flex;
      flex-direction: column;
      position: relative;
    }
    
    .select__text {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: left;
    }
    
    .select__trigger {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fsds-select-size-padding-default);
      padding: var(--fsds-select-size-padding-default);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default);
      border-radius: var(--fsds-select-size-radius-default);
      border-color: var(--fsds-select-color-border-default);
      background-color: var(--fsds-select-color-background-default);
      color: var(--fsds-select-color-foreground-default);
      font-size: var(--fsds-select-font-size-default);
      line-height: var(--fsds-select-font-lineHeight-default);
      cursor: pointer;
      width: 100%;
      box-sizing: border-box;
    }
    
    .select__content {
      background-color: var(--fsds-select-color-background-default);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default);
      border-radius: var(--fsds-select-size-radius-default);
      border-color: var(--fsds-select-color-border-default);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      padding: var(--fsds-select-size-padding-default);
      max-height: 320px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--fsds-select-size-padding-default);
    }
    
    .select__search {
      display: flex;
      align-items: center;
      padding: var(--fsds-select-size-padding-default);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default);
      border-radius: var(--fsds-select-size-radius-default);
      border-color: var(--fsds-select-color-border-default);
      background-color: var(--fsds-select-color-background-default);
      color: var(--fsds-select-color-foreground-default);
      font-size: var(--fsds-select-font-size-default);
    }
    
    .select__options {
      display: flex;
      flex-direction: column;
      gap: 2px;
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .select__option {
      display: flex;
      align-items: center;
      gap: var(--fsds-select-size-padding-default);
      padding: var(--fsds-select-size-padding-default);
      border-radius: var(--fsds-select-size-radius-default);
      color: var(--fsds-select-color-foreground-default);
      cursor: pointer;
    }
    
    .select__emptyState {
      text-align: center;
      padding: var(--fsds-select-size-padding-default);
      color: var(--fsds-select-color-placeholder-default);
    }
    
    .select__trigger:focus-visible {
      border-color: var(--fsds-select-color-border-isOpen);
      outline: 2px solid;
      outline-offset: 2px;
    }
    
    .select__trigger:hover {
      border-color: var(--fsds-select-color-border-hover);
      background-color: var(--fsds-select-color-background-hover);
      color: var(--fsds-select-color-foreground-hover);
    }
    
    .select--open .select__trigger {
      border-color: var(--fsds-select-color-border-isOpen);
    }
    
    .select--disabled .select__trigger {
      background-color: var(--fsds-select-color-background-disabled);
      color: var(--fsds-select-color-foreground-disabled);
      border-color: var(--fsds-select-color-border-disabled);
      cursor: not-allowed;
      opacity: 0.5;
    }
    
    .select__option:hover {
      background-color: var(--fsds-select-color-background-hover);
      color: var(--fsds-select-color-foreground-hover);
    }
    
    .select__option[aria-selected="true"] {
      background-color: var(--fsds-select-color-background-selected);
      color: var(--fsds-select-color-foreground-selected);
    }
  `;

  @property({ attribute: false }) options!: SelectOption[];
  @property({ attribute: false }) value?: string | string[];
  @property({ attribute: false }) defaultValue?: string | string[];
  @property({ type: Boolean }) open?: boolean;
  @property({ type: Boolean }) defaultOpen?: boolean;
  @property({ type: Boolean }) multiple?: boolean;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: String }) size?: SelectSize = "md";
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
  static override styles = css`
    :host { display: contents; }
    .select {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-primary, #f29495);
      --fsds-select-color-icon-default: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-select-color-placeholder-default: var(--fsds-semantic-color-foreground-placeholder, #8f8f8f);
      --fsds-select-size-padding-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-select-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-select-size-border-default: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-select-size-sm-height: var(--fsds-semantic-control-size-sm-height, 24px);
      --fsds-select-size-md-height: var(--fsds-semantic-control-size-md-height, 32px);
      --fsds-select-size-lg-height: var(--fsds-semantic-control-size-lg-height, 48px);
      --fsds-select-font-size-default: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-select-font-lineHeight-default: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-select-color-background-hover: var(--fsds-semantic-color-background-hover, #cecece);
      --fsds-select-color-foreground-hover: var(--fsds-semantic-color-foreground-hover, #3a3a3a);
      --fsds-select-color-border-hover: var(--fsds-semantic-color-border-bold, #8f8f8f);
      --fsds-select-color-background-disabled: var(--fsds-semantic-color-background-disabled, #cecece);
      --fsds-select-color-foreground-disabled: var(--fsds-semantic-color-foreground-disabled, #aeaeae);
      --fsds-select-color-border-disabled: var(--fsds-semantic-color-border-disabled, #cecece);
      --fsds-select-color-border-isOpen: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-select-color-icon-isOpen: var(--fsds-semantic-color-foreground-accent, #d9292b);
      --fsds-select-color-background-selected: var(--fsds-semantic-color-background-highlight, #f7c1c2);
      --fsds-select-color-foreground-selected: var(--fsds-semantic-color-foreground-accent, #d9292b);
    }
    
    .select {
      display: inline-flex;
      flex-direction: column;
      position: relative;
    }
    
    .select__text {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: left;
    }
    
    .select__trigger {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fsds-select-size-padding-default);
      padding: var(--fsds-select-size-padding-default);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default);
      border-radius: var(--fsds-select-size-radius-default);
      border-color: var(--fsds-select-color-border-default);
      background-color: var(--fsds-select-color-background-default);
      color: var(--fsds-select-color-foreground-default);
      font-size: var(--fsds-select-font-size-default);
      line-height: var(--fsds-select-font-lineHeight-default);
      cursor: pointer;
      width: 100%;
      box-sizing: border-box;
    }
    
    .select__content {
      background-color: var(--fsds-select-color-background-default);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default);
      border-radius: var(--fsds-select-size-radius-default);
      border-color: var(--fsds-select-color-border-default);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      padding: var(--fsds-select-size-padding-default);
      max-height: 320px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--fsds-select-size-padding-default);
    }
    
    .select__search {
      display: flex;
      align-items: center;
      padding: var(--fsds-select-size-padding-default);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default);
      border-radius: var(--fsds-select-size-radius-default);
      border-color: var(--fsds-select-color-border-default);
      background-color: var(--fsds-select-color-background-default);
      color: var(--fsds-select-color-foreground-default);
      font-size: var(--fsds-select-font-size-default);
    }
    
    .select__options {
      display: flex;
      flex-direction: column;
      gap: 2px;
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .select__option {
      display: flex;
      align-items: center;
      gap: var(--fsds-select-size-padding-default);
      padding: var(--fsds-select-size-padding-default);
      border-radius: var(--fsds-select-size-radius-default);
      color: var(--fsds-select-color-foreground-default);
      cursor: pointer;
    }
    
    .select__emptyState {
      text-align: center;
      padding: var(--fsds-select-size-padding-default);
      color: var(--fsds-select-color-placeholder-default);
    }
    
    .select__trigger:focus-visible {
      border-color: var(--fsds-select-color-border-isOpen);
      outline: 2px solid;
      outline-offset: 2px;
    }
    
    .select__trigger:hover {
      border-color: var(--fsds-select-color-border-hover);
      background-color: var(--fsds-select-color-background-hover);
      color: var(--fsds-select-color-foreground-hover);
    }
    
    .select--open .select__trigger {
      border-color: var(--fsds-select-color-border-isOpen);
    }
    
    .select--disabled .select__trigger {
      background-color: var(--fsds-select-color-background-disabled);
      color: var(--fsds-select-color-foreground-disabled);
      border-color: var(--fsds-select-color-border-disabled);
      cursor: not-allowed;
      opacity: 0.5;
    }
    
    .select__option:hover {
      background-color: var(--fsds-select-color-background-hover);
      color: var(--fsds-select-color-foreground-hover);
    }
    
    .select__option[aria-selected="true"] {
      background-color: var(--fsds-select-color-background-selected);
      color: var(--fsds-select-color-foreground-selected);
    }
  `;

  override render() {
    return html`<fsds-stack as="button" class="select__trigger"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-select-trigger', SelectTriggerElement);

export class SelectContentElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .select {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-primary, #f29495);
      --fsds-select-color-icon-default: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-select-color-placeholder-default: var(--fsds-semantic-color-foreground-placeholder, #8f8f8f);
      --fsds-select-size-padding-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-select-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-select-size-border-default: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-select-size-sm-height: var(--fsds-semantic-control-size-sm-height, 24px);
      --fsds-select-size-md-height: var(--fsds-semantic-control-size-md-height, 32px);
      --fsds-select-size-lg-height: var(--fsds-semantic-control-size-lg-height, 48px);
      --fsds-select-font-size-default: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-select-font-lineHeight-default: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-select-color-background-hover: var(--fsds-semantic-color-background-hover, #cecece);
      --fsds-select-color-foreground-hover: var(--fsds-semantic-color-foreground-hover, #3a3a3a);
      --fsds-select-color-border-hover: var(--fsds-semantic-color-border-bold, #8f8f8f);
      --fsds-select-color-background-disabled: var(--fsds-semantic-color-background-disabled, #cecece);
      --fsds-select-color-foreground-disabled: var(--fsds-semantic-color-foreground-disabled, #aeaeae);
      --fsds-select-color-border-disabled: var(--fsds-semantic-color-border-disabled, #cecece);
      --fsds-select-color-border-isOpen: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-select-color-icon-isOpen: var(--fsds-semantic-color-foreground-accent, #d9292b);
      --fsds-select-color-background-selected: var(--fsds-semantic-color-background-highlight, #f7c1c2);
      --fsds-select-color-foreground-selected: var(--fsds-semantic-color-foreground-accent, #d9292b);
    }
    
    .select {
      display: inline-flex;
      flex-direction: column;
      position: relative;
    }
    
    .select__text {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: left;
    }
    
    .select__trigger {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fsds-select-size-padding-default);
      padding: var(--fsds-select-size-padding-default);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default);
      border-radius: var(--fsds-select-size-radius-default);
      border-color: var(--fsds-select-color-border-default);
      background-color: var(--fsds-select-color-background-default);
      color: var(--fsds-select-color-foreground-default);
      font-size: var(--fsds-select-font-size-default);
      line-height: var(--fsds-select-font-lineHeight-default);
      cursor: pointer;
      width: 100%;
      box-sizing: border-box;
    }
    
    .select__content {
      background-color: var(--fsds-select-color-background-default);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default);
      border-radius: var(--fsds-select-size-radius-default);
      border-color: var(--fsds-select-color-border-default);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      padding: var(--fsds-select-size-padding-default);
      max-height: 320px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--fsds-select-size-padding-default);
    }
    
    .select__search {
      display: flex;
      align-items: center;
      padding: var(--fsds-select-size-padding-default);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default);
      border-radius: var(--fsds-select-size-radius-default);
      border-color: var(--fsds-select-color-border-default);
      background-color: var(--fsds-select-color-background-default);
      color: var(--fsds-select-color-foreground-default);
      font-size: var(--fsds-select-font-size-default);
    }
    
    .select__options {
      display: flex;
      flex-direction: column;
      gap: 2px;
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .select__option {
      display: flex;
      align-items: center;
      gap: var(--fsds-select-size-padding-default);
      padding: var(--fsds-select-size-padding-default);
      border-radius: var(--fsds-select-size-radius-default);
      color: var(--fsds-select-color-foreground-default);
      cursor: pointer;
    }
    
    .select__emptyState {
      text-align: center;
      padding: var(--fsds-select-size-padding-default);
      color: var(--fsds-select-color-placeholder-default);
    }
    
    .select__trigger:focus-visible {
      border-color: var(--fsds-select-color-border-isOpen);
      outline: 2px solid;
      outline-offset: 2px;
    }
    
    .select__trigger:hover {
      border-color: var(--fsds-select-color-border-hover);
      background-color: var(--fsds-select-color-background-hover);
      color: var(--fsds-select-color-foreground-hover);
    }
    
    .select--open .select__trigger {
      border-color: var(--fsds-select-color-border-isOpen);
    }
    
    .select--disabled .select__trigger {
      background-color: var(--fsds-select-color-background-disabled);
      color: var(--fsds-select-color-foreground-disabled);
      border-color: var(--fsds-select-color-border-disabled);
      cursor: not-allowed;
      opacity: 0.5;
    }
    
    .select__option:hover {
      background-color: var(--fsds-select-color-background-hover);
      color: var(--fsds-select-color-foreground-hover);
    }
    
    .select__option[aria-selected="true"] {
      background-color: var(--fsds-select-color-background-selected);
      color: var(--fsds-select-color-foreground-selected);
    }
  `;

  override render() {
    return html`<fsds-stack class="select__content"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-select-content', SelectContentElement);

export class SelectOptionElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .select {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-primary, #f29495);
      --fsds-select-color-icon-default: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-select-color-placeholder-default: var(--fsds-semantic-color-foreground-placeholder, #8f8f8f);
      --fsds-select-size-padding-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-select-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-select-size-border-default: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-select-size-sm-height: var(--fsds-semantic-control-size-sm-height, 24px);
      --fsds-select-size-md-height: var(--fsds-semantic-control-size-md-height, 32px);
      --fsds-select-size-lg-height: var(--fsds-semantic-control-size-lg-height, 48px);
      --fsds-select-font-size-default: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-select-font-lineHeight-default: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-select-color-background-hover: var(--fsds-semantic-color-background-hover, #cecece);
      --fsds-select-color-foreground-hover: var(--fsds-semantic-color-foreground-hover, #3a3a3a);
      --fsds-select-color-border-hover: var(--fsds-semantic-color-border-bold, #8f8f8f);
      --fsds-select-color-background-disabled: var(--fsds-semantic-color-background-disabled, #cecece);
      --fsds-select-color-foreground-disabled: var(--fsds-semantic-color-foreground-disabled, #aeaeae);
      --fsds-select-color-border-disabled: var(--fsds-semantic-color-border-disabled, #cecece);
      --fsds-select-color-border-isOpen: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-select-color-icon-isOpen: var(--fsds-semantic-color-foreground-accent, #d9292b);
      --fsds-select-color-background-selected: var(--fsds-semantic-color-background-highlight, #f7c1c2);
      --fsds-select-color-foreground-selected: var(--fsds-semantic-color-foreground-accent, #d9292b);
    }
    
    .select {
      display: inline-flex;
      flex-direction: column;
      position: relative;
    }
    
    .select__text {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: left;
    }
    
    .select__trigger {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fsds-select-size-padding-default);
      padding: var(--fsds-select-size-padding-default);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default);
      border-radius: var(--fsds-select-size-radius-default);
      border-color: var(--fsds-select-color-border-default);
      background-color: var(--fsds-select-color-background-default);
      color: var(--fsds-select-color-foreground-default);
      font-size: var(--fsds-select-font-size-default);
      line-height: var(--fsds-select-font-lineHeight-default);
      cursor: pointer;
      width: 100%;
      box-sizing: border-box;
    }
    
    .select__content {
      background-color: var(--fsds-select-color-background-default);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default);
      border-radius: var(--fsds-select-size-radius-default);
      border-color: var(--fsds-select-color-border-default);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      padding: var(--fsds-select-size-padding-default);
      max-height: 320px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--fsds-select-size-padding-default);
    }
    
    .select__search {
      display: flex;
      align-items: center;
      padding: var(--fsds-select-size-padding-default);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default);
      border-radius: var(--fsds-select-size-radius-default);
      border-color: var(--fsds-select-color-border-default);
      background-color: var(--fsds-select-color-background-default);
      color: var(--fsds-select-color-foreground-default);
      font-size: var(--fsds-select-font-size-default);
    }
    
    .select__options {
      display: flex;
      flex-direction: column;
      gap: 2px;
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .select__option {
      display: flex;
      align-items: center;
      gap: var(--fsds-select-size-padding-default);
      padding: var(--fsds-select-size-padding-default);
      border-radius: var(--fsds-select-size-radius-default);
      color: var(--fsds-select-color-foreground-default);
      cursor: pointer;
    }
    
    .select__emptyState {
      text-align: center;
      padding: var(--fsds-select-size-padding-default);
      color: var(--fsds-select-color-placeholder-default);
    }
    
    .select__trigger:focus-visible {
      border-color: var(--fsds-select-color-border-isOpen);
      outline: 2px solid;
      outline-offset: 2px;
    }
    
    .select__trigger:hover {
      border-color: var(--fsds-select-color-border-hover);
      background-color: var(--fsds-select-color-background-hover);
      color: var(--fsds-select-color-foreground-hover);
    }
    
    .select--open .select__trigger {
      border-color: var(--fsds-select-color-border-isOpen);
    }
    
    .select--disabled .select__trigger {
      background-color: var(--fsds-select-color-background-disabled);
      color: var(--fsds-select-color-foreground-disabled);
      border-color: var(--fsds-select-color-border-disabled);
      cursor: not-allowed;
      opacity: 0.5;
    }
    
    .select__option:hover {
      background-color: var(--fsds-select-color-background-hover);
      color: var(--fsds-select-color-foreground-hover);
    }
    
    .select__option[aria-selected="true"] {
      background-color: var(--fsds-select-color-background-selected);
      color: var(--fsds-select-color-foreground-selected);
    }
  `;

  override render() {
    return html`<fsds-stack as="li" class="select__option"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-select-option', SelectOptionElement);
// @generated:end

// @custom:start trailing

// @custom:end