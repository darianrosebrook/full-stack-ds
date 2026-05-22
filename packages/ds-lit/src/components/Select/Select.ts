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
      --fsds-select-size-padding-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-select-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-select-font-size-default: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-select-font-lineHeight-default: var(--fsds-semantic-typography-line-height-body, 1.5);
    
      &:hover {
        --fsds-select-color-background-hover: var(--fsds-semantic-color-background-hover, #cecece);
        --fsds-select-color-foreground-hover: var(--fsds-semantic-color-foreground-hover, #3a3a3a);
        --fsds-select-color-border-hover: var(--fsds-semantic-color-border-bold, #8f8f8f);
      }
    
      &:disabled {
        --fsds-select-color-background-disabled: var(--fsds-semantic-color-background-disabled, #cecece);
        --fsds-select-color-foreground-disabled: var(--fsds-semantic-color-foreground-disabled, #aeaeae);
        --fsds-select-color-border-disabled: var(--fsds-semantic-color-border-disabled, #cecece);
      }
    
      &[aria-selected="true"] {
        --fsds-select-color-background-selected: var(--fsds-semantic-color-background-highlight, #f7c1c2);
        --fsds-select-color-foreground-selected: var(--fsds-semantic-color-foreground-accent, #d9292b);
      }
    }
    
    .select--open {
      --fsds-select-color-border-isOpen: var(--fsds-semantic-color-border-accent, #d9292b);
    }
    
    .select {
      background-color: var(--fsds-select-color-background-default);
      color: var(--fsds-select-color-foreground-default);
      border-color: var(--fsds-select-color-border-default);
      padding: var(--fsds-select-size-padding-default);
      border-radius: var(--fsds-select-size-radius-default);
      font-size: var(--fsds-select-font-size-default);
      line-height: var(--fsds-select-font-lineHeight-default);
      /* --fsds-semantic-color-foreground-secondary: #555555; */
      /* --fsds-semantic-color-foreground-placeholder: #8f8f8f; */
      /* --fsds-core-shape-border-width-hairline: 1px; */
      /* --fsds-semantic-control-size-md-height: 32px; */
    
      &:hover {
        background-color: var(--fsds-select-color-background-hover);
        color: var(--fsds-select-color-foreground-hover);
        border-color: var(--fsds-select-color-border-hover);
      }
    
      &:disabled {
        background-color: var(--fsds-select-color-background-disabled);
        color: var(--fsds-select-color-foreground-disabled);
        border-color: var(--fsds-select-color-border-disabled);
      }
    
      &[aria-selected="true"] {
        background-color: var(--fsds-select-color-background-selected);
        color: var(--fsds-select-color-foreground-selected);
      }
    }
    
    .select--sm {
      /* --fsds-semantic-control-size-sm-height: 24px; */
    }
    
    .select--md {
      /* --fsds-semantic-control-size-md-height: 32px; */
    }
    
    .select--lg {
      /* --fsds-semantic-control-size-lg-height: 48px; */
    }
    
    .select--open {
      border-color: var(--fsds-select-color-border-isOpen);
      /* --fsds-semantic-color-foreground-accent: #d9292b; */
    }
  `;

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
  static override styles = css`
    :host { display: contents; }
    .select {
      --fsds-select-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-select-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-select-color-border-default: var(--fsds-semantic-color-border-primary, #f29495);
      --fsds-select-size-padding-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-select-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-select-font-size-default: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-select-font-lineHeight-default: var(--fsds-semantic-typography-line-height-body, 1.5);
    
      &:hover {
        --fsds-select-color-background-hover: var(--fsds-semantic-color-background-hover, #cecece);
        --fsds-select-color-foreground-hover: var(--fsds-semantic-color-foreground-hover, #3a3a3a);
        --fsds-select-color-border-hover: var(--fsds-semantic-color-border-bold, #8f8f8f);
      }
    
      &:disabled {
        --fsds-select-color-background-disabled: var(--fsds-semantic-color-background-disabled, #cecece);
        --fsds-select-color-foreground-disabled: var(--fsds-semantic-color-foreground-disabled, #aeaeae);
        --fsds-select-color-border-disabled: var(--fsds-semantic-color-border-disabled, #cecece);
      }
    
      &[aria-selected="true"] {
        --fsds-select-color-background-selected: var(--fsds-semantic-color-background-highlight, #f7c1c2);
        --fsds-select-color-foreground-selected: var(--fsds-semantic-color-foreground-accent, #d9292b);
      }
    }
    
    .select--open {
      --fsds-select-color-border-isOpen: var(--fsds-semantic-color-border-accent, #d9292b);
    }
    
    .select {
      background-color: var(--fsds-select-color-background-default);
      color: var(--fsds-select-color-foreground-default);
      border-color: var(--fsds-select-color-border-default);
      padding: var(--fsds-select-size-padding-default);
      border-radius: var(--fsds-select-size-radius-default);
      font-size: var(--fsds-select-font-size-default);
      line-height: var(--fsds-select-font-lineHeight-default);
      /* --fsds-semantic-color-foreground-secondary: #555555; */
      /* --fsds-semantic-color-foreground-placeholder: #8f8f8f; */
      /* --fsds-core-shape-border-width-hairline: 1px; */
      /* --fsds-semantic-control-size-md-height: 32px; */
    
      &:hover {
        background-color: var(--fsds-select-color-background-hover);
        color: var(--fsds-select-color-foreground-hover);
        border-color: var(--fsds-select-color-border-hover);
      }
    
      &:disabled {
        background-color: var(--fsds-select-color-background-disabled);
        color: var(--fsds-select-color-foreground-disabled);
        border-color: var(--fsds-select-color-border-disabled);
      }
    
      &[aria-selected="true"] {
        background-color: var(--fsds-select-color-background-selected);
        color: var(--fsds-select-color-foreground-selected);
      }
    }
    
    .select--sm {
      /* --fsds-semantic-control-size-sm-height: 24px; */
    }
    
    .select--md {
      /* --fsds-semantic-control-size-md-height: 32px; */
    }
    
    .select--lg {
      /* --fsds-semantic-control-size-lg-height: 48px; */
    }
    
    .select--open {
      border-color: var(--fsds-select-color-border-isOpen);
      /* --fsds-semantic-color-foreground-accent: #d9292b; */
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
      --fsds-select-size-padding-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-select-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-select-font-size-default: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-select-font-lineHeight-default: var(--fsds-semantic-typography-line-height-body, 1.5);
    
      &:hover {
        --fsds-select-color-background-hover: var(--fsds-semantic-color-background-hover, #cecece);
        --fsds-select-color-foreground-hover: var(--fsds-semantic-color-foreground-hover, #3a3a3a);
        --fsds-select-color-border-hover: var(--fsds-semantic-color-border-bold, #8f8f8f);
      }
    
      &:disabled {
        --fsds-select-color-background-disabled: var(--fsds-semantic-color-background-disabled, #cecece);
        --fsds-select-color-foreground-disabled: var(--fsds-semantic-color-foreground-disabled, #aeaeae);
        --fsds-select-color-border-disabled: var(--fsds-semantic-color-border-disabled, #cecece);
      }
    
      &[aria-selected="true"] {
        --fsds-select-color-background-selected: var(--fsds-semantic-color-background-highlight, #f7c1c2);
        --fsds-select-color-foreground-selected: var(--fsds-semantic-color-foreground-accent, #d9292b);
      }
    }
    
    .select--open {
      --fsds-select-color-border-isOpen: var(--fsds-semantic-color-border-accent, #d9292b);
    }
    
    .select {
      background-color: var(--fsds-select-color-background-default);
      color: var(--fsds-select-color-foreground-default);
      border-color: var(--fsds-select-color-border-default);
      padding: var(--fsds-select-size-padding-default);
      border-radius: var(--fsds-select-size-radius-default);
      font-size: var(--fsds-select-font-size-default);
      line-height: var(--fsds-select-font-lineHeight-default);
      /* --fsds-semantic-color-foreground-secondary: #555555; */
      /* --fsds-semantic-color-foreground-placeholder: #8f8f8f; */
      /* --fsds-core-shape-border-width-hairline: 1px; */
      /* --fsds-semantic-control-size-md-height: 32px; */
    
      &:hover {
        background-color: var(--fsds-select-color-background-hover);
        color: var(--fsds-select-color-foreground-hover);
        border-color: var(--fsds-select-color-border-hover);
      }
    
      &:disabled {
        background-color: var(--fsds-select-color-background-disabled);
        color: var(--fsds-select-color-foreground-disabled);
        border-color: var(--fsds-select-color-border-disabled);
      }
    
      &[aria-selected="true"] {
        background-color: var(--fsds-select-color-background-selected);
        color: var(--fsds-select-color-foreground-selected);
      }
    }
    
    .select--sm {
      /* --fsds-semantic-control-size-sm-height: 24px; */
    }
    
    .select--md {
      /* --fsds-semantic-control-size-md-height: 32px; */
    }
    
    .select--lg {
      /* --fsds-semantic-control-size-lg-height: 48px; */
    }
    
    .select--open {
      border-color: var(--fsds-select-color-border-isOpen);
      /* --fsds-semantic-color-foreground-accent: #d9292b; */
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
      --fsds-select-size-padding-default: var(--fsds-core-spacing-size-03, 4px);
      --fsds-select-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-select-font-size-default: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-select-font-lineHeight-default: var(--fsds-semantic-typography-line-height-body, 1.5);
    
      &:hover {
        --fsds-select-color-background-hover: var(--fsds-semantic-color-background-hover, #cecece);
        --fsds-select-color-foreground-hover: var(--fsds-semantic-color-foreground-hover, #3a3a3a);
        --fsds-select-color-border-hover: var(--fsds-semantic-color-border-bold, #8f8f8f);
      }
    
      &:disabled {
        --fsds-select-color-background-disabled: var(--fsds-semantic-color-background-disabled, #cecece);
        --fsds-select-color-foreground-disabled: var(--fsds-semantic-color-foreground-disabled, #aeaeae);
        --fsds-select-color-border-disabled: var(--fsds-semantic-color-border-disabled, #cecece);
      }
    
      &[aria-selected="true"] {
        --fsds-select-color-background-selected: var(--fsds-semantic-color-background-highlight, #f7c1c2);
        --fsds-select-color-foreground-selected: var(--fsds-semantic-color-foreground-accent, #d9292b);
      }
    }
    
    .select--open {
      --fsds-select-color-border-isOpen: var(--fsds-semantic-color-border-accent, #d9292b);
    }
    
    .select {
      background-color: var(--fsds-select-color-background-default);
      color: var(--fsds-select-color-foreground-default);
      border-color: var(--fsds-select-color-border-default);
      padding: var(--fsds-select-size-padding-default);
      border-radius: var(--fsds-select-size-radius-default);
      font-size: var(--fsds-select-font-size-default);
      line-height: var(--fsds-select-font-lineHeight-default);
      /* --fsds-semantic-color-foreground-secondary: #555555; */
      /* --fsds-semantic-color-foreground-placeholder: #8f8f8f; */
      /* --fsds-core-shape-border-width-hairline: 1px; */
      /* --fsds-semantic-control-size-md-height: 32px; */
    
      &:hover {
        background-color: var(--fsds-select-color-background-hover);
        color: var(--fsds-select-color-foreground-hover);
        border-color: var(--fsds-select-color-border-hover);
      }
    
      &:disabled {
        background-color: var(--fsds-select-color-background-disabled);
        color: var(--fsds-select-color-foreground-disabled);
        border-color: var(--fsds-select-color-border-disabled);
      }
    
      &[aria-selected="true"] {
        background-color: var(--fsds-select-color-background-selected);
        color: var(--fsds-select-color-foreground-selected);
      }
    }
    
    .select--sm {
      /* --fsds-semantic-control-size-sm-height: 24px; */
    }
    
    .select--md {
      /* --fsds-semantic-control-size-md-height: 32px; */
    }
    
    .select--lg {
      /* --fsds-semantic-control-size-lg-height: 48px; */
    }
    
    .select--open {
      border-color: var(--fsds-select-color-border-isOpen);
      /* --fsds-semantic-color-foreground-accent: #d9292b; */
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