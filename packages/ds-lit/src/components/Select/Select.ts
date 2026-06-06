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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-input-size-medium-padding-block, 8px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-input-size-medium-padding-block, 8px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-input-size-medium-padding-inline, 12px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-input-size-medium-padding-inline, 12px);
      --fsds-box-model-gap: var(--fsds-semantic-input-size-medium-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: var(--fsds-semantic-input-size-medium-min-height, 36px);
      --fsds-box-model-max-height: none;
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
      --fsds-select-color-icon-isOpen: var(--fsds-semantic-color-foreground-accent, #d9292b);
      --fsds-select-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-select-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0a65fe);
      --fsds-select-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-select-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }
    
    .select__trigger:focus-visible {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-accent, #d9292b);
    }
    
    .select__trigger:hover {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-bold, #8f8f8f);
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-hover, #cecece);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-hover, #3a3a3a);
    }
    
    .select--open .select__trigger {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-accent, #d9292b);
    }
    
    .select--disabled .select__trigger {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-disabled, #cecece);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-disabled, #aeaeae);
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-disabled, #cecece);
    }
    
    .select__option:hover {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-hover, #cecece);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-hover, #3a3a3a);
    }
    
    .select__option[aria-selected="true"] {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-highlight, #f7c1c2);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-accent, #d9292b);
    }
    
    .select {
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
      outline-width: var(--fsds-select-focus-ring-width);
      outline-color: var(--fsds-select-focus-ring-color);
      outline-style: var(--fsds-select-focus-ring-style);
      outline-offset: var(--fsds-select-focus-ring-offset);
    }
    
    .select--disabled .select__trigger {
      cursor: not-allowed;
      opacity: 0.5;
    }
    
    .select--sm .select__trigger {
      height: var(--fsds-select-size-sm-height);
    }
    
    .select--md .select__trigger {
      height: var(--fsds-select-size-md-height);
    }
    
    .select--lg .select__trigger {
      height: var(--fsds-select-size-lg-height);
    }
  `;

  @property({ attribute: false }) options?: SelectOption[] = [{"value":"alpha","label":"Alpha"},{"value":"beta","label":"Beta"},{"value":"gamma","label":"Gamma"}];
  @property({ attribute: false }) value?: string | string[];
  @property({ attribute: false }) defaultValue?: string | string[] = "beta";
  @property({ attribute: false }) onChange?: (value: string | string[]) => void;
  @property({ type: Boolean }) open?: boolean;
  @property({ type: Boolean }) defaultOpen?: boolean = true;
  @property({ attribute: false }) onOpenChange?: (open: boolean) => void;
  @property({ type: Boolean }) multiple?: boolean;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: String }) size?: SelectSize = "md";
  @property({ attribute: false }) filterFn?: ((option: SelectOption, searchTerm: string) => boolean);
  @property({ type: Boolean }) searchable?: boolean;
  @property({ type: Boolean }) empty?: boolean;
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
      ${(this.options ?? []).map((item, index) => html`
      <div class=${'select__option'} role="option" aria-selected=${((Array.isArray(this.behavior.selection) ? this.behavior.selection.includes(item.value) : item.value === this.behavior.selection)) ? 'true' : 'false'} data-value=${item.value}>
        <span>${item.label}</span>
      </div>
      `)}
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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-input-size-medium-padding-block, 8px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-input-size-medium-padding-block, 8px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-input-size-medium-padding-inline, 12px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-input-size-medium-padding-inline, 12px);
      --fsds-box-model-gap: var(--fsds-semantic-input-size-medium-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: var(--fsds-semantic-input-size-medium-min-height, 36px);
      --fsds-box-model-max-height: none;
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
      --fsds-select-color-icon-isOpen: var(--fsds-semantic-color-foreground-accent, #d9292b);
      --fsds-select-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-select-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0a65fe);
      --fsds-select-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-select-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }
    
    .select__trigger:focus-visible {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-accent, #d9292b);
    }
    
    .select__trigger:hover {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-bold, #8f8f8f);
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-hover, #cecece);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-hover, #3a3a3a);
    }
    
    .select--open .select__trigger {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-accent, #d9292b);
    }
    
    .select--disabled .select__trigger {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-disabled, #cecece);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-disabled, #aeaeae);
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-disabled, #cecece);
    }
    
    .select__option:hover {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-hover, #cecece);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-hover, #3a3a3a);
    }
    
    .select__option[aria-selected="true"] {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-highlight, #f7c1c2);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-accent, #d9292b);
    }
    
    .select {
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
      outline-width: var(--fsds-select-focus-ring-width);
      outline-color: var(--fsds-select-focus-ring-color);
      outline-style: var(--fsds-select-focus-ring-style);
      outline-offset: var(--fsds-select-focus-ring-offset);
    }
    
    .select--disabled .select__trigger {
      cursor: not-allowed;
      opacity: 0.5;
    }
    
    .select--sm .select__trigger {
      height: var(--fsds-select-size-sm-height);
    }
    
    .select--md .select__trigger {
      height: var(--fsds-select-size-md-height);
    }
    
    .select--lg .select__trigger {
      height: var(--fsds-select-size-lg-height);
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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-input-size-medium-padding-block, 8px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-input-size-medium-padding-block, 8px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-input-size-medium-padding-inline, 12px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-input-size-medium-padding-inline, 12px);
      --fsds-box-model-gap: var(--fsds-semantic-input-size-medium-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: var(--fsds-semantic-input-size-medium-min-height, 36px);
      --fsds-box-model-max-height: none;
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
      --fsds-select-color-icon-isOpen: var(--fsds-semantic-color-foreground-accent, #d9292b);
      --fsds-select-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-select-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0a65fe);
      --fsds-select-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-select-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }
    
    .select__trigger:focus-visible {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-accent, #d9292b);
    }
    
    .select__trigger:hover {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-bold, #8f8f8f);
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-hover, #cecece);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-hover, #3a3a3a);
    }
    
    .select--open .select__trigger {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-accent, #d9292b);
    }
    
    .select--disabled .select__trigger {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-disabled, #cecece);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-disabled, #aeaeae);
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-disabled, #cecece);
    }
    
    .select__option:hover {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-hover, #cecece);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-hover, #3a3a3a);
    }
    
    .select__option[aria-selected="true"] {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-highlight, #f7c1c2);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-accent, #d9292b);
    }
    
    .select {
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
      outline-width: var(--fsds-select-focus-ring-width);
      outline-color: var(--fsds-select-focus-ring-color);
      outline-style: var(--fsds-select-focus-ring-style);
      outline-offset: var(--fsds-select-focus-ring-offset);
    }
    
    .select--disabled .select__trigger {
      cursor: not-allowed;
      opacity: 0.5;
    }
    
    .select--sm .select__trigger {
      height: var(--fsds-select-size-sm-height);
    }
    
    .select--md .select__trigger {
      height: var(--fsds-select-size-md-height);
    }
    
    .select--lg .select__trigger {
      height: var(--fsds-select-size-lg-height);
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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-input-size-medium-padding-block, 8px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-input-size-medium-padding-block, 8px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-input-size-medium-padding-inline, 12px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-input-size-medium-padding-inline, 12px);
      --fsds-box-model-gap: var(--fsds-semantic-input-size-medium-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: var(--fsds-semantic-input-size-medium-min-height, 36px);
      --fsds-box-model-max-height: none;
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
      --fsds-select-color-icon-isOpen: var(--fsds-semantic-color-foreground-accent, #d9292b);
      --fsds-select-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-select-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0a65fe);
      --fsds-select-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-select-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }
    
    .select__trigger:focus-visible {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-accent, #d9292b);
    }
    
    .select__trigger:hover {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-bold, #8f8f8f);
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-hover, #cecece);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-hover, #3a3a3a);
    }
    
    .select--open .select__trigger {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-accent, #d9292b);
    }
    
    .select--disabled .select__trigger {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-disabled, #cecece);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-disabled, #aeaeae);
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-disabled, #cecece);
    }
    
    .select__option:hover {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-hover, #cecece);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-hover, #3a3a3a);
    }
    
    .select__option[aria-selected="true"] {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-highlight, #f7c1c2);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-accent, #d9292b);
    }
    
    .select {
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
      outline-width: var(--fsds-select-focus-ring-width);
      outline-color: var(--fsds-select-focus-ring-color);
      outline-style: var(--fsds-select-focus-ring-style);
      outline-offset: var(--fsds-select-focus-ring-offset);
    }
    
    .select--disabled .select__trigger {
      cursor: not-allowed;
      opacity: 0.5;
    }
    
    .select--sm .select__trigger {
      height: var(--fsds-select-size-sm-height);
    }
    
    .select--md .select__trigger {
      height: var(--fsds-select-size-md-height);
    }
    
    .select--lg .select__trigger {
      height: var(--fsds-select-size-lg-height);
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