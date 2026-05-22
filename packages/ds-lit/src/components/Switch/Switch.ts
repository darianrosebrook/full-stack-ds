// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { SwitchBehavior } from './SwitchBehavior.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SwitchSize = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class SwitchElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .switch {
      --fsds-switch-color-track-background-default: var(--fsds-semantic-color-background-tertiary, #cecece);
      --fsds-switch-color-thumb-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-switch-size-md-track-width: var(--fsds-core-spacing-size-09, 48px);
      --fsds-switch-size-md-track-height: var(--fsds-core-spacing-size-07, 24px);
      --fsds-switch-size-md-track-radius: var(--fsds-core-shape-radius-full, 9999px);
      --fsds-switch-motion-duration: var(--fsds-semantic-motion-interaction-press-duration, 100ms);
    
      &--md {
        --fsds-switch-size-md-track-width: var(--fsds-core-spacing-size-09, 48px);
        --fsds-switch-size-md-track-height: var(--fsds-core-spacing-size-07, 24px);
        --fsds-switch-size-md-track-radius: var(--fsds-core-shape-radius-full, 9999px);
      }
    
      &:disabled {
        --fsds-switch-color-track-background-disabled: var(--fsds-semantic-color-background-disabled, #cecece);
      }
    
      &:checked {
        --fsds-switch-color-track-background-checked: var(--fsds-semantic-color-foreground-accent, #d9292b);
        --fsds-switch-color-thumb-background-checked: var(--fsds-semantic-color-foreground-on-brand, #ffffff);
      }
    }
    
    .switch {
      background-color: var(--fsds-switch-color-thumb-background-default);
      width: var(--fsds-switch-size-md-track-width);
      height: var(--fsds-switch-size-md-track-height);
      border-radius: var(--fsds-switch-size-md-track-radius);
      transition-duration: var(--fsds-switch-motion-duration);
    
      &--md {
        width: var(--fsds-switch-size-md-track-width);
        height: var(--fsds-switch-size-md-track-height);
        border-radius: var(--fsds-switch-size-md-track-radius);
      }
    
      &:disabled {
        background-color: var(--fsds-switch-color-track-background-disabled);
      }
    
      &:checked {
        background-color: var(--fsds-switch-color-thumb-background-checked);
      }
    }
  `;

  @property({ type: Boolean }) checked?: boolean;
  @property({ type: Boolean }) defaultChecked?: boolean;
  @property({ attribute: false }) size?: SwitchSize = "md";
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: String }) name?: string;
  @property({ type: String }) value?: string;
  @property({ attribute: false }) onChange?: (value: boolean) => void;

  private behavior = new SwitchBehavior(this, {
    checked: () => this.checked,
    defaultChecked: this.defaultChecked,
    onChange: (v) => this.onChange?.(v),
  });

  private handleCheckedChange(event: Event): void {
    this.behavior.setChecked((event.target as HTMLInputElement).checked);
  }

  private computeClasses(): string {
    return [
      "switch",
      this.size ? `switch--${this.size}` : null,
      this.behavior.checked ? "switch--checked" : null,
      this.disabled ? "switch--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<label class="${this.computeClasses()}">
  <input class=${'switch__input'} type="checkbox" role="switch" ?checked=${this.behavior.checked} @change=${(e: Event) => this.handleCheckedChange(e)} ?disabled=${this.disabled ?? false} name=${ifDefined(this.name)} value=${ifDefined(this.value)} />
  <span class=${'switch__track'} aria-hidden="true">
    <span class=${'switch__thumb'}></span>
  </span>
</label>`;
  }
}

customElements.define('fsds-switch', SwitchElement);
// @generated:end

// @custom:start trailing

// @custom:end