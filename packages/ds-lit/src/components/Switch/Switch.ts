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
      --fsds-switch-motion-duration: var(--fsds-semantic-motion-interaction-press-duration, 100ms);
      --fsds-switch-motion-easing: var(--fsds-semantic-motion-interaction-press-easing, ease-out);
      --fsds-switch-color-track-background-default: var(--fsds-semantic-color-background-tertiary, #cecece);
      --fsds-switch-color-track-background-checked: var(--fsds-semantic-color-foreground-accent, #d9292b);
      --fsds-switch-color-track-background-disabled: var(--fsds-semantic-color-background-disabled, #efefef);
      --fsds-switch-color-track-border-default: var(--fsds-semantic-color-border-subtle, #aeaeae);
      --fsds-switch-color-thumb-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-switch-color-thumb-background-checked: var(--fsds-semantic-color-foreground-on-brand, #ffffff);
      --fsds-switch-color-thumb-shadow-default: var(--fsds-semantic-elevation-surface-raised, 0 1px 2px rgba(0, 0, 0, 0.1));
      --fsds-switch-color-input-outline-focus: var(--fsds-semantic-color-border-focus, #d9292b);
      --fsds-switch-size-md-track-width: var(--fsds-core-spacing-size-09, 48px);
      --fsds-switch-size-md-track-height: var(--fsds-core-spacing-size-07, 24px);
      --fsds-switch-size-md-track-radius: var(--fsds-core-shape-radius-full, 9999px);
      --fsds-switch-size-md-track-padding: var(--fsds-core-spacing-size-01, 2px);
      --fsds-switch-size-md-thumb-size: var(--fsds-core-spacing-size-06, 20px);
      --fsds-switch-size-md-thumb-height: var(--fsds-core-spacing-size-06, 20px);
    }
    
    .switch {
      transition-duration: var(--fsds-switch-motion-duration);
      transition-timing-function: var(--fsds-switch-motion-easing);
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      position: relative;
    }
    
    .switch__track {
      background-color: var(--fsds-switch-color-track-background-default);
      border-color: var(--fsds-switch-color-track-border-default);
      width: var(--fsds-switch-size-md-track-width);
      height: var(--fsds-switch-size-md-track-height);
      border-radius: var(--fsds-switch-size-md-track-radius);
      padding: var(--fsds-switch-size-md-track-padding);
      display: inline-block;
      position: relative;
      box-sizing: border-box;
      border-style: solid;
      border-width: 1px;
    }
    
    .switch__thumb {
      background-color: var(--fsds-switch-color-thumb-background-default);
      box-shadow: var(--fsds-switch-color-thumb-shadow-default);
      width: var(--fsds-switch-size-md-thumb-size);
      height: var(--fsds-switch-size-md-thumb-height);
      top: var(--fsds-switch-size-md-track-padding);
      left: var(--fsds-switch-size-md-track-padding);
      display: block;
      position: absolute;
      border-radius: 50%;
      box-sizing: border-box;
    }
    
    .switch__input {
      outline-color: var(--fsds-switch-color-input-outline-focus);
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    
    :has(.switch__input:checked) .switch__track {
      background-color: var(--fsds-switch-color-track-background-checked);
    }
    
    :has(.switch__input:checked) .switch__thumb {
      background-color: var(--fsds-switch-color-thumb-background-checked);
    }
    
    :has(.switch__input:disabled) .switch__track {
      background-color: var(--fsds-switch-color-track-background-disabled);
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