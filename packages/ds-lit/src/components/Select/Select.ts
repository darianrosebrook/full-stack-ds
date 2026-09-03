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
      --fsds-box-model-padding-block-start: var(--fsds-semantic-input-size-medium-padding-block, 4px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-input-size-medium-padding-block, 4px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-input-size-medium-padding-inline, 8px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-input-size-medium-padding-inline, 8px);
      --fsds-box-model-gap: var(--fsds-semantic-input-size-medium-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: var(--fsds-semantic-input-size-medium-min-height, 32px);
      --fsds-box-model-max-height: none;
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-primary, #a0a0a1);
      --fsds-select-color-icon-default: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-select-color-placeholder-default: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-select-size-padding-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-select-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-select-size-border-default: var(--fsds-semantic-shape-control-border-default-width, 1px);
      --fsds-select-size-sm-height: var(--fsds-semantic-control-size-sm-height, 24px);
      --fsds-select-size-md-height: var(--fsds-semantic-control-size-md-height, 32px);
      --fsds-select-size-lg-height: var(--fsds-semantic-control-size-lg-height, 48px);
      --fsds-select-font-size-default: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-select-font-line-height-default: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-select-color-icon-is-open: var(--fsds-semantic-color-foreground-accent, #d92d2e);
      --fsds-select-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-select-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0566fe);
      --fsds-select-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-select-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }

    .select__trigger:focus-visible:not([aria-disabled="true"]) {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-accent, #d92d2e);
    }

    .select__trigger:hover:not([aria-disabled="true"]) {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-bold, #888889);
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-hover, #f7f7f7);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-hover, #474647);
    }

    .select--open .select__trigger {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-accent, #d92d2e);
    }

    .select--disabled .select__trigger {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-disabled, #d0d0d0);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-disabled, #727272);
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-disabled, #b8b8b8);
    }

    .select__option:hover:not([aria-disabled="true"]) {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-hover, #f7f7f7);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-hover, #474647);
    }

    .select__option[aria-selected="true"] {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-highlight, #f5a2a1);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-accent, #d92d2e);
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
      gap: var(--fsds-select-size-padding-default, 4px);
      padding: var(--fsds-select-size-padding-default, 4px);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default, 1px);
      border-radius: var(--fsds-select-size-radius-default, 6px);
      border-color: var(--fsds-select-color-border-default, #a0a0a1);
      background-color: var(--fsds-select-color-background-default, #ffffff);
      color: var(--fsds-select-color-foreground-default, #141414);
      font-size: var(--fsds-select-font-size-default, 16px);
      line-height: var(--fsds-select-font-line-height-default, 1.5);
      cursor: pointer;
      width: 100%;
      box-sizing: border-box;
    }

    .select__content {
      background-color: var(--fsds-select-color-background-default, #ffffff);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default, 1px);
      border-radius: var(--fsds-select-size-radius-default, 6px);
      border-color: var(--fsds-select-color-border-default, #a0a0a1);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      padding: var(--fsds-select-size-padding-default, 4px);
      max-height: 320px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--fsds-select-size-padding-default, 4px);
    }

    .select__search {
      display: flex;
      align-items: center;
      padding: var(--fsds-select-size-padding-default, 4px);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default, 1px);
      border-radius: var(--fsds-select-size-radius-default, 6px);
      border-color: var(--fsds-select-color-border-default, #a0a0a1);
      background-color: var(--fsds-select-color-background-default, #ffffff);
      color: var(--fsds-select-color-foreground-default, #141414);
      font-size: var(--fsds-select-font-size-default, 16px);
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
      gap: var(--fsds-select-size-padding-default, 4px);
      padding: var(--fsds-select-size-padding-default, 4px);
      border-radius: var(--fsds-select-size-radius-default, 6px);
      color: var(--fsds-select-color-foreground-default, #141414);
      cursor: pointer;
    }

    .select__emptyState {
      text-align: center;
      padding: var(--fsds-select-size-padding-default, 4px);
      color: var(--fsds-select-color-placeholder-default, #474647);
    }

    .select__trigger:focus-visible:not([aria-disabled="true"]) {
      outline-width: var(--fsds-select-focus-ring-width, 2px);
      outline-color: var(--fsds-select-focus-ring-color, #0566fe);
      outline-style: var(--fsds-select-focus-ring-style, solid);
      outline-offset: var(--fsds-select-focus-ring-offset, 2px);
    }

    .select--disabled .select__trigger {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .select--sm .select__trigger {
      height: var(--fsds-select-size-sm-height, 24px);
    }

    .select--md .select__trigger {
      height: var(--fsds-select-size-md-height, 32px);
    }

    .select--lg .select__trigger {
      height: var(--fsds-select-size-lg-height, 48px);
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

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "select");
  }

  private computeClasses(): string {
    return [
      "select",
      (this.size ?? "md") ? `select--${(this.size ?? "md")}` : null,
      this.position ? `select--${this.position}` : null,
      this.behavior.open ? "select--open" : null,
      this.disabled ? "select--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" role="combobox" aria-haspopup="listbox" aria-controls="fsds-select-listbox" aria-expanded=${this.behavior.open ? 'true' : 'false'} aria-disabled=${ifDefined(this.disabled === undefined ? undefined : (this.disabled ? 'true' : 'false'))}>
  <button class=${'select__trigger'} type="button" @click=${() => this.behavior.setOpen(!this.behavior.open)} ?disabled=${this.disabled ?? false} aria-controls="select-options">
    <span class=${'select__text'}></span>
  </button>
  ${this.behavior.open ? html`
  <div class=${'select__content'} role="listbox" id="fsds-select-listbox" data-fsds-channel-renders="open">
    ${this.searchable ? html`
    <div class=${'select__search'}>
      <input type="text" />
    </div>
    ` : nothing}
    <div class=${'select__options'} id="select-options">
      ${((this.options ?? [{"value":"alpha","label":"Alpha"},{"value":"beta","label":"Beta"},{"value":"gamma","label":"Gamma"}])).map((item, index) => html`
      <div class=${'select__option'} role="option" @click=${() => this.behavior.setSelection(this.multiple ? ((Array.isArray(this.behavior.selection) ? this.behavior.selection : this.behavior.selection == null ? [] : [this.behavior.selection]).includes(item.value) ? (Array.isArray(this.behavior.selection) ? this.behavior.selection : this.behavior.selection == null ? [] : [this.behavior.selection]).filter((v) => v !== item.value) : [...(Array.isArray(this.behavior.selection) ? this.behavior.selection : this.behavior.selection == null ? [] : [this.behavior.selection]), item.value]) : item.value)} aria-selected=${((Array.isArray(this.behavior.selection) ? this.behavior.selection.includes(item.value) : item.value === this.behavior.selection)) ? 'true' : 'false'} data-value=${item.value}>
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
      --fsds-box-model-padding-block-start: var(--fsds-semantic-input-size-medium-padding-block, 4px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-input-size-medium-padding-block, 4px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-input-size-medium-padding-inline, 8px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-input-size-medium-padding-inline, 8px);
      --fsds-box-model-gap: var(--fsds-semantic-input-size-medium-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: var(--fsds-semantic-input-size-medium-min-height, 32px);
      --fsds-box-model-max-height: none;
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-primary, #a0a0a1);
      --fsds-select-color-icon-default: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-select-color-placeholder-default: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-select-size-padding-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-select-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-select-size-border-default: var(--fsds-semantic-shape-control-border-default-width, 1px);
      --fsds-select-size-sm-height: var(--fsds-semantic-control-size-sm-height, 24px);
      --fsds-select-size-md-height: var(--fsds-semantic-control-size-md-height, 32px);
      --fsds-select-size-lg-height: var(--fsds-semantic-control-size-lg-height, 48px);
      --fsds-select-font-size-default: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-select-font-line-height-default: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-select-color-icon-is-open: var(--fsds-semantic-color-foreground-accent, #d92d2e);
      --fsds-select-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-select-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0566fe);
      --fsds-select-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-select-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }

    .select__trigger:focus-visible:not([aria-disabled="true"]) {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-accent, #d92d2e);
    }

    .select__trigger:hover:not([aria-disabled="true"]) {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-bold, #888889);
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-hover, #f7f7f7);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-hover, #474647);
    }

    .select--open .select__trigger {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-accent, #d92d2e);
    }

    .select--disabled .select__trigger {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-disabled, #d0d0d0);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-disabled, #727272);
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-disabled, #b8b8b8);
    }

    .select__option:hover:not([aria-disabled="true"]) {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-hover, #f7f7f7);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-hover, #474647);
    }

    .select__option[aria-selected="true"] {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-highlight, #f5a2a1);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-accent, #d92d2e);
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
      gap: var(--fsds-select-size-padding-default, 4px);
      padding: var(--fsds-select-size-padding-default, 4px);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default, 1px);
      border-radius: var(--fsds-select-size-radius-default, 6px);
      border-color: var(--fsds-select-color-border-default, #a0a0a1);
      background-color: var(--fsds-select-color-background-default, #ffffff);
      color: var(--fsds-select-color-foreground-default, #141414);
      font-size: var(--fsds-select-font-size-default, 16px);
      line-height: var(--fsds-select-font-line-height-default, 1.5);
      cursor: pointer;
      width: 100%;
      box-sizing: border-box;
    }

    .select__content {
      background-color: var(--fsds-select-color-background-default, #ffffff);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default, 1px);
      border-radius: var(--fsds-select-size-radius-default, 6px);
      border-color: var(--fsds-select-color-border-default, #a0a0a1);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      padding: var(--fsds-select-size-padding-default, 4px);
      max-height: 320px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--fsds-select-size-padding-default, 4px);
    }

    .select__search {
      display: flex;
      align-items: center;
      padding: var(--fsds-select-size-padding-default, 4px);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default, 1px);
      border-radius: var(--fsds-select-size-radius-default, 6px);
      border-color: var(--fsds-select-color-border-default, #a0a0a1);
      background-color: var(--fsds-select-color-background-default, #ffffff);
      color: var(--fsds-select-color-foreground-default, #141414);
      font-size: var(--fsds-select-font-size-default, 16px);
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
      gap: var(--fsds-select-size-padding-default, 4px);
      padding: var(--fsds-select-size-padding-default, 4px);
      border-radius: var(--fsds-select-size-radius-default, 6px);
      color: var(--fsds-select-color-foreground-default, #141414);
      cursor: pointer;
    }

    .select__emptyState {
      text-align: center;
      padding: var(--fsds-select-size-padding-default, 4px);
      color: var(--fsds-select-color-placeholder-default, #474647);
    }

    .select__trigger:focus-visible:not([aria-disabled="true"]) {
      outline-width: var(--fsds-select-focus-ring-width, 2px);
      outline-color: var(--fsds-select-focus-ring-color, #0566fe);
      outline-style: var(--fsds-select-focus-ring-style, solid);
      outline-offset: var(--fsds-select-focus-ring-offset, 2px);
    }

    .select--disabled .select__trigger {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .select--sm .select__trigger {
      height: var(--fsds-select-size-sm-height, 24px);
    }

    .select--md .select__trigger {
      height: var(--fsds-select-size-md-height, 32px);
    }

    .select--lg .select__trigger {
      height: var(--fsds-select-size-lg-height, 48px);
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
      --fsds-box-model-padding-block-start: var(--fsds-semantic-input-size-medium-padding-block, 4px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-input-size-medium-padding-block, 4px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-input-size-medium-padding-inline, 8px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-input-size-medium-padding-inline, 8px);
      --fsds-box-model-gap: var(--fsds-semantic-input-size-medium-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: var(--fsds-semantic-input-size-medium-min-height, 32px);
      --fsds-box-model-max-height: none;
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-primary, #a0a0a1);
      --fsds-select-color-icon-default: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-select-color-placeholder-default: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-select-size-padding-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-select-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-select-size-border-default: var(--fsds-semantic-shape-control-border-default-width, 1px);
      --fsds-select-size-sm-height: var(--fsds-semantic-control-size-sm-height, 24px);
      --fsds-select-size-md-height: var(--fsds-semantic-control-size-md-height, 32px);
      --fsds-select-size-lg-height: var(--fsds-semantic-control-size-lg-height, 48px);
      --fsds-select-font-size-default: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-select-font-line-height-default: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-select-color-icon-is-open: var(--fsds-semantic-color-foreground-accent, #d92d2e);
      --fsds-select-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-select-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0566fe);
      --fsds-select-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-select-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }

    .select__trigger:focus-visible:not([aria-disabled="true"]) {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-accent, #d92d2e);
    }

    .select__trigger:hover:not([aria-disabled="true"]) {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-bold, #888889);
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-hover, #f7f7f7);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-hover, #474647);
    }

    .select--open .select__trigger {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-accent, #d92d2e);
    }

    .select--disabled .select__trigger {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-disabled, #d0d0d0);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-disabled, #727272);
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-disabled, #b8b8b8);
    }

    .select__option:hover:not([aria-disabled="true"]) {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-hover, #f7f7f7);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-hover, #474647);
    }

    .select__option[aria-selected="true"] {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-highlight, #f5a2a1);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-accent, #d92d2e);
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
      gap: var(--fsds-select-size-padding-default, 4px);
      padding: var(--fsds-select-size-padding-default, 4px);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default, 1px);
      border-radius: var(--fsds-select-size-radius-default, 6px);
      border-color: var(--fsds-select-color-border-default, #a0a0a1);
      background-color: var(--fsds-select-color-background-default, #ffffff);
      color: var(--fsds-select-color-foreground-default, #141414);
      font-size: var(--fsds-select-font-size-default, 16px);
      line-height: var(--fsds-select-font-line-height-default, 1.5);
      cursor: pointer;
      width: 100%;
      box-sizing: border-box;
    }

    .select__content {
      background-color: var(--fsds-select-color-background-default, #ffffff);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default, 1px);
      border-radius: var(--fsds-select-size-radius-default, 6px);
      border-color: var(--fsds-select-color-border-default, #a0a0a1);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      padding: var(--fsds-select-size-padding-default, 4px);
      max-height: 320px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--fsds-select-size-padding-default, 4px);
    }

    .select__search {
      display: flex;
      align-items: center;
      padding: var(--fsds-select-size-padding-default, 4px);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default, 1px);
      border-radius: var(--fsds-select-size-radius-default, 6px);
      border-color: var(--fsds-select-color-border-default, #a0a0a1);
      background-color: var(--fsds-select-color-background-default, #ffffff);
      color: var(--fsds-select-color-foreground-default, #141414);
      font-size: var(--fsds-select-font-size-default, 16px);
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
      gap: var(--fsds-select-size-padding-default, 4px);
      padding: var(--fsds-select-size-padding-default, 4px);
      border-radius: var(--fsds-select-size-radius-default, 6px);
      color: var(--fsds-select-color-foreground-default, #141414);
      cursor: pointer;
    }

    .select__emptyState {
      text-align: center;
      padding: var(--fsds-select-size-padding-default, 4px);
      color: var(--fsds-select-color-placeholder-default, #474647);
    }

    .select__trigger:focus-visible:not([aria-disabled="true"]) {
      outline-width: var(--fsds-select-focus-ring-width, 2px);
      outline-color: var(--fsds-select-focus-ring-color, #0566fe);
      outline-style: var(--fsds-select-focus-ring-style, solid);
      outline-offset: var(--fsds-select-focus-ring-offset, 2px);
    }

    .select--disabled .select__trigger {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .select--sm .select__trigger {
      height: var(--fsds-select-size-sm-height, 24px);
    }

    .select--md .select__trigger {
      height: var(--fsds-select-size-md-height, 32px);
    }

    .select--lg .select__trigger {
      height: var(--fsds-select-size-lg-height, 48px);
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
      --fsds-box-model-padding-block-start: var(--fsds-semantic-input-size-medium-padding-block, 4px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-input-size-medium-padding-block, 4px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-input-size-medium-padding-inline, 8px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-input-size-medium-padding-inline, 8px);
      --fsds-box-model-gap: var(--fsds-semantic-input-size-medium-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: var(--fsds-semantic-input-size-medium-min-height, 32px);
      --fsds-box-model-max-height: none;
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-primary, #a0a0a1);
      --fsds-select-color-icon-default: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-select-color-placeholder-default: var(--fsds-semantic-color-foreground-secondary, #474647);
      --fsds-select-size-padding-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-select-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-select-size-border-default: var(--fsds-semantic-shape-control-border-default-width, 1px);
      --fsds-select-size-sm-height: var(--fsds-semantic-control-size-sm-height, 24px);
      --fsds-select-size-md-height: var(--fsds-semantic-control-size-md-height, 32px);
      --fsds-select-size-lg-height: var(--fsds-semantic-control-size-lg-height, 48px);
      --fsds-select-font-size-default: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-select-font-line-height-default: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-select-color-icon-is-open: var(--fsds-semantic-color-foreground-accent, #d92d2e);
      --fsds-select-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-select-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0566fe);
      --fsds-select-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-select-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }

    .select__trigger:focus-visible:not([aria-disabled="true"]) {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-accent, #d92d2e);
    }

    .select__trigger:hover:not([aria-disabled="true"]) {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-bold, #888889);
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-hover, #f7f7f7);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-hover, #474647);
    }

    .select--open .select__trigger {
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-accent, #d92d2e);
    }

    .select--disabled .select__trigger {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-disabled, #d0d0d0);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-disabled, #727272);
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-disabled, #b8b8b8);
    }

    .select__option:hover:not([aria-disabled="true"]) {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-hover, #f7f7f7);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-hover, #474647);
    }

    .select__option[aria-selected="true"] {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-highlight, #f5a2a1);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-accent, #d92d2e);
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
      gap: var(--fsds-select-size-padding-default, 4px);
      padding: var(--fsds-select-size-padding-default, 4px);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default, 1px);
      border-radius: var(--fsds-select-size-radius-default, 6px);
      border-color: var(--fsds-select-color-border-default, #a0a0a1);
      background-color: var(--fsds-select-color-background-default, #ffffff);
      color: var(--fsds-select-color-foreground-default, #141414);
      font-size: var(--fsds-select-font-size-default, 16px);
      line-height: var(--fsds-select-font-line-height-default, 1.5);
      cursor: pointer;
      width: 100%;
      box-sizing: border-box;
    }

    .select__content {
      background-color: var(--fsds-select-color-background-default, #ffffff);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default, 1px);
      border-radius: var(--fsds-select-size-radius-default, 6px);
      border-color: var(--fsds-select-color-border-default, #a0a0a1);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      padding: var(--fsds-select-size-padding-default, 4px);
      max-height: 320px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--fsds-select-size-padding-default, 4px);
    }

    .select__search {
      display: flex;
      align-items: center;
      padding: var(--fsds-select-size-padding-default, 4px);
      border-style: solid;
      border-width: var(--fsds-select-size-border-default, 1px);
      border-radius: var(--fsds-select-size-radius-default, 6px);
      border-color: var(--fsds-select-color-border-default, #a0a0a1);
      background-color: var(--fsds-select-color-background-default, #ffffff);
      color: var(--fsds-select-color-foreground-default, #141414);
      font-size: var(--fsds-select-font-size-default, 16px);
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
      gap: var(--fsds-select-size-padding-default, 4px);
      padding: var(--fsds-select-size-padding-default, 4px);
      border-radius: var(--fsds-select-size-radius-default, 6px);
      color: var(--fsds-select-color-foreground-default, #141414);
      cursor: pointer;
    }

    .select__emptyState {
      text-align: center;
      padding: var(--fsds-select-size-padding-default, 4px);
      color: var(--fsds-select-color-placeholder-default, #474647);
    }

    .select__trigger:focus-visible:not([aria-disabled="true"]) {
      outline-width: var(--fsds-select-focus-ring-width, 2px);
      outline-color: var(--fsds-select-focus-ring-color, #0566fe);
      outline-style: var(--fsds-select-focus-ring-style, solid);
      outline-offset: var(--fsds-select-focus-ring-offset, 2px);
    }

    .select--disabled .select__trigger {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .select--sm .select__trigger {
      height: var(--fsds-select-size-sm-height, 24px);
    }

    .select--md .select__trigger {
      height: var(--fsds-select-size-md-height, 32px);
    }

    .select--lg .select__trigger {
      height: var(--fsds-select-size-lg-height, 48px);
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("role", "listitem");
  }

  override render() {
    return html`<fsds-stack as="li" class="select__option"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-select-option', SelectOptionElement);
// @generated:end

// @custom:start trailing

// @custom:end