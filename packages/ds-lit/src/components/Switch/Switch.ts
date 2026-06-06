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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-action-size-medium-padding-block, 8px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-action-size-medium-padding-block, 8px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-action-size-medium-padding-inline, 12px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-action-size-medium-padding-inline, 12px);
      --fsds-box-model-gap: var(--fsds-semantic-action-size-medium-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-action-size-medium-min-width, 36px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: var(--fsds-semantic-action-size-medium-min-height, 36px);
      --fsds-box-model-max-height: none;
      --fsds-switch-motion-duration: var(--fsds-semantic-motion-interaction-press-duration, 100ms);
      --fsds-switch-motion-easing: var(--fsds-semantic-motion-interaction-press-easing, ease-out);
      --fsds-switch-color-track-background-default: var(--fsds-semantic-color-background-tertiary, #cecece);
      --fsds-switch-color-track-border-default: var(--fsds-semantic-color-border-subtle, #aeaeae);
      --fsds-switch-color-thumb-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-switch-color-thumb-shadow-default: var(--fsds-semantic-elevation-surface-raised, 0 1px 2px rgba(0, 0, 0, 0.1));
      --fsds-switch-color-input-outline-focus: var(--fsds-semantic-color-border-focus, #d9292b);
      --fsds-switch-size-md-track-width: var(--fsds-core-spacing-size-09, 48px);
      --fsds-switch-size-md-track-height: var(--fsds-core-spacing-size-07, 24px);
      --fsds-switch-size-md-track-radius: var(--fsds-core-shape-radius-full, 9999px);
      --fsds-switch-size-md-track-padding: var(--fsds-core-spacing-size-01, 2px);
      --fsds-switch-size-md-thumb-size: var(--fsds-core-spacing-size-06, 20px);
      --fsds-switch-size-md-thumb-height: var(--fsds-core-spacing-size-06, 20px);
      --fsds-switch-size-sm-track-width: var(--fsds-core-spacing-size-08, 32px);
      --fsds-switch-size-sm-track-height: var(--fsds-core-spacing-size-06, 16px);
      --fsds-switch-size-sm-track-radius: var(--fsds-core-shape-radius-full, 9999px);
      --fsds-switch-size-sm-track-padding: var(--fsds-core-spacing-size-01, 2px);
      --fsds-switch-size-sm-thumb-size: var(--fsds-core-spacing-size-05, 12px);
      --fsds-switch-size-sm-thumb-height: var(--fsds-core-spacing-size-05, 12px);
      --fsds-switch-size-lg-track-width: var(--fsds-core-spacing-size-10, 64px);
      --fsds-switch-size-lg-track-height: var(--fsds-core-spacing-size-08, 32px);
      --fsds-switch-size-lg-track-radius: var(--fsds-core-shape-radius-full, 9999px);
      --fsds-switch-size-lg-track-padding: var(--fsds-core-spacing-size-01, 2px);
      --fsds-switch-size-lg-thumb-size: var(--fsds-core-spacing-size-07, 24px);
      --fsds-switch-size-lg-thumb-height: var(--fsds-core-spacing-size-07, 24px);
      --fsds-switch-size-sm-thumb-translate-off: 0;
      --fsds-switch-size-sm-thumb-translate-on: 16px;
      --fsds-switch-size-md-thumb-translate-off: 0;
      --fsds-switch-size-md-thumb-translate-on: 24px;
      --fsds-switch-size-lg-thumb-translate-off: 0;
      --fsds-switch-size-lg-thumb-translate-on: 36px;
    
      &:has(.switch__input:checked) .switch__track {
        --fsds-switch-color-track-background-default: var(--fsds-semantic-color-foreground-accent, #d9292b);
      }
    
      &:has(.switch__input:checked) .switch__thumb {
        --fsds-switch-color-thumb-background-default: var(--fsds-semantic-color-foreground-on-brand, #ffffff);
      }
    
      &:has(.switch__input:disabled) .switch__track {
        --fsds-switch-color-track-background-default: var(--fsds-semantic-color-background-disabled, #efefef);
      }
    }
    
    .switch {
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
      align-items: center;
      cursor: pointer;
      position: relative;
    
      &:has(.switch__input:checked) .switch__thumb {
        translate: var(--fsds-switch-size-md-thumb-translate-on);
      }
    }
    
    .switch__track {
      transition: background-color var(--fsds-switch-motion-duration) var(--fsds-switch-motion-easing);
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
      transition: translate var(--fsds-switch-motion-duration) var(--fsds-switch-motion-easing), background-color var(--fsds-switch-motion-duration) var(--fsds-switch-motion-easing);
      background-color: var(--fsds-switch-color-thumb-background-default);
      box-shadow: var(--fsds-switch-color-thumb-shadow-default);
      width: var(--fsds-switch-size-md-thumb-size);
      height: var(--fsds-switch-size-md-thumb-height);
      top: var(--fsds-switch-size-md-track-padding);
      left: var(--fsds-switch-size-md-track-padding);
      translate: var(--fsds-switch-size-md-thumb-translate-off);
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
    
    .switch--sm .switch__track {
      width: var(--fsds-switch-size-sm-track-width);
      height: var(--fsds-switch-size-sm-track-height);
      border-radius: var(--fsds-switch-size-sm-track-radius);
      padding: var(--fsds-switch-size-sm-track-padding);
    }
    
    .switch--sm .switch__thumb {
      width: var(--fsds-switch-size-sm-thumb-size);
      height: var(--fsds-switch-size-sm-thumb-height);
      top: var(--fsds-switch-size-sm-track-padding);
      left: var(--fsds-switch-size-sm-track-padding);
      translate: var(--fsds-switch-size-sm-thumb-translate-off);
    }
    
    .switch--sm:has(.switch__input:checked) .switch__thumb {
      translate: var(--fsds-switch-size-sm-thumb-translate-on);
    }
    
    .switch--lg .switch__track {
      width: var(--fsds-switch-size-lg-track-width);
      height: var(--fsds-switch-size-lg-track-height);
      border-radius: var(--fsds-switch-size-lg-track-radius);
      padding: var(--fsds-switch-size-lg-track-padding);
    }
    
    .switch--lg .switch__thumb {
      width: var(--fsds-switch-size-lg-thumb-size);
      height: var(--fsds-switch-size-lg-thumb-height);
      top: var(--fsds-switch-size-lg-track-padding);
      left: var(--fsds-switch-size-lg-track-padding);
      translate: var(--fsds-switch-size-lg-thumb-translate-off);
    }
    
    .switch--lg:has(.switch__input:checked) .switch__thumb {
      translate: var(--fsds-switch-size-lg-thumb-translate-on);
    }
  `;

  @property({ type: Boolean }) checked?: boolean;
  @property({ type: Boolean }) defaultChecked?: boolean;
  @property({ attribute: false }) onChange?: (checked: boolean) => void;
  @property({ type: String }) size?: SwitchSize = "md";
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: String }) name?: string;
  @property({ type: String }) value?: string;

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
  <input class=${'switch__input'} type="checkbox" role="switch" @change=${(e: Event) => this.handleCheckedChange(e)} ?checked=${this.behavior.checked} ?disabled=${this.disabled ?? false} name=${ifDefined(this.name)} value=${ifDefined(this.value)} />
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