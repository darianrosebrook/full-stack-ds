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
      --fsds-box-model-padding-block-start: var(--fsds-semantic-action-size-medium-padding-block, 4px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-action-size-medium-padding-block, 4px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-action-size-medium-padding-inline, 8px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-action-size-medium-padding-inline, 8px);
      --fsds-box-model-gap: var(--fsds-semantic-action-size-medium-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-action-size-medium-min-width, 32px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: var(--fsds-semantic-action-size-medium-min-height, 32px);
      --fsds-box-model-max-height: none;
      --fsds-switch-motion-duration: var(--fsds-semantic-motion-interaction-press-duration, 100ms);
      --fsds-switch-motion-easing: var(--fsds-semantic-motion-interaction-press-easing, cubic-bezier(0.4, 0, 0.2, 1));
      --fsds-switch-color-track-background-default: var(--fsds-semantic-color-background-tertiary, #b8b8b8);
      --fsds-switch-color-track-border-default: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-switch-color-thumb-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-switch-color-thumb-shadow-default: var(--fsds-semantic-elevation-surface-raised, 0px 1px 2px #0000000f, 0px 1px 3px #0000001a);
      --fsds-switch-color-input-outline-focus: var(--fsds-semantic-color-border-focus, #0566fe);
      --fsds-switch-size-md-track-width: var(--fsds-core-spacing-size-09, 48px);
      --fsds-switch-size-md-track-height: var(--fsds-core-spacing-size-07, 24px);
      --fsds-switch-size-md-track-radius: var(--fsds-semantic-shape-control-radius-pill, 9999px);
      --fsds-switch-size-md-track-padding: var(--fsds-core-spacing-size-01, 1px);
      --fsds-switch-size-md-thumb-size: var(--fsds-core-spacing-size-06, 16px);
      --fsds-switch-size-md-thumb-height: var(--fsds-core-spacing-size-06, 16px);
      --fsds-switch-size-sm-track-width: var(--fsds-core-spacing-size-08, 32px);
      --fsds-switch-size-sm-track-height: var(--fsds-core-spacing-size-06, 16px);
      --fsds-switch-size-sm-track-radius: var(--fsds-semantic-shape-control-radius-pill, 9999px);
      --fsds-switch-size-sm-track-padding: var(--fsds-core-spacing-size-01, 1px);
      --fsds-switch-size-sm-thumb-size: var(--fsds-core-spacing-size-05, 12px);
      --fsds-switch-size-sm-thumb-height: var(--fsds-core-spacing-size-05, 12px);
      --fsds-switch-size-lg-track-width: var(--fsds-core-spacing-size-10, 64px);
      --fsds-switch-size-lg-track-height: var(--fsds-core-spacing-size-08, 32px);
      --fsds-switch-size-lg-track-radius: var(--fsds-semantic-shape-control-radius-pill, 9999px);
      --fsds-switch-size-lg-track-padding: var(--fsds-core-spacing-size-01, 1px);
      --fsds-switch-size-lg-thumb-size: var(--fsds-core-spacing-size-07, 24px);
      --fsds-switch-size-lg-thumb-height: var(--fsds-core-spacing-size-07, 24px);
      --fsds-switch-size-sm-thumb-translate-off: 0;
      --fsds-switch-size-sm-thumb-translate-on: 16px;
      --fsds-switch-size-md-thumb-translate-off: 0;
      --fsds-switch-size-md-thumb-translate-on: 24px;
      --fsds-switch-size-lg-thumb-translate-off: 0;
      --fsds-switch-size-lg-thumb-translate-on: 36px;

      &:has(.switch__input:checked) .switch__track {
        --fsds-switch-color-track-background-default: var(--fsds-semantic-color-foreground-accent, #d92d2e);
      }

      &:has(.switch__input:checked) .switch__thumb {
        --fsds-switch-color-thumb-background-default: var(--fsds-semantic-color-foreground-on-brand, #ffffff);
      }

      &:has(.switch__input:disabled) .switch__track {
        --fsds-switch-color-track-background-default: var(--fsds-semantic-color-background-disabled, #d0d0d0);
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
        translate: var(--fsds-switch-size-md-thumb-translate-on, 24px);
      }
    }

    .switch__track {
      transition: background-color var(--fsds-switch-motion-duration) var(--fsds-switch-motion-easing);
      background-color: var(--fsds-switch-color-track-background-default, #b8b8b8);
      border-color: var(--fsds-switch-color-track-border-default, #d0d0d0);
      width: var(--fsds-switch-size-md-track-width, 48px);
      height: var(--fsds-switch-size-md-track-height, 24px);
      border-radius: var(--fsds-switch-size-md-track-radius, 9999px);
      padding: var(--fsds-switch-size-md-track-padding, 1px);
      display: inline-block;
      position: relative;
      box-sizing: border-box;
      border-style: solid;
      border-width: 1px;
    }

    .switch__thumb {
      transition: translate var(--fsds-switch-motion-duration) var(--fsds-switch-motion-easing), background-color var(--fsds-switch-motion-duration) var(--fsds-switch-motion-easing);
      background-color: var(--fsds-switch-color-thumb-background-default, #ffffff);
      box-shadow: var(--fsds-switch-color-thumb-shadow-default, 0px 1px 2px #0000000f, 0px 1px 3px #0000001a);
      width: var(--fsds-switch-size-md-thumb-size, 16px);
      height: var(--fsds-switch-size-md-thumb-height, 16px);
      top: var(--fsds-switch-size-md-track-padding, 1px);
      left: var(--fsds-switch-size-md-track-padding, 1px);
      translate: var(--fsds-switch-size-md-thumb-translate-off, 0);
      display: block;
      position: absolute;
      border-radius: 50%;
      box-sizing: border-box;
    }

    .switch__input {
      outline-color: var(--fsds-switch-color-input-outline-focus, #0566fe);
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
      width: var(--fsds-switch-size-sm-track-width, 32px);
      height: var(--fsds-switch-size-sm-track-height, 16px);
      border-radius: var(--fsds-switch-size-sm-track-radius, 9999px);
      padding: var(--fsds-switch-size-sm-track-padding, 1px);
    }

    .switch--sm .switch__thumb {
      width: var(--fsds-switch-size-sm-thumb-size, 12px);
      height: var(--fsds-switch-size-sm-thumb-height, 12px);
      top: var(--fsds-switch-size-sm-track-padding, 1px);
      left: var(--fsds-switch-size-sm-track-padding, 1px);
      translate: var(--fsds-switch-size-sm-thumb-translate-off, 0);
    }

    .switch--sm:has(.switch__input:checked) .switch__thumb {
      translate: var(--fsds-switch-size-sm-thumb-translate-on, 16px);
    }

    .switch--lg .switch__track {
      width: var(--fsds-switch-size-lg-track-width, 64px);
      height: var(--fsds-switch-size-lg-track-height, 32px);
      border-radius: var(--fsds-switch-size-lg-track-radius, 9999px);
      padding: var(--fsds-switch-size-lg-track-padding, 1px);
    }

    .switch--lg .switch__thumb {
      width: var(--fsds-switch-size-lg-thumb-size, 24px);
      height: var(--fsds-switch-size-lg-thumb-height, 24px);
      top: var(--fsds-switch-size-lg-track-padding, 1px);
      left: var(--fsds-switch-size-lg-track-padding, 1px);
      translate: var(--fsds-switch-size-lg-thumb-translate-off, 0);
    }

    .switch--lg:has(.switch__input:checked) .switch__thumb {
      translate: var(--fsds-switch-size-lg-thumb-translate-on, 36px);
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

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "switch");
  }

  private computeClasses(): string {
    return [
      "switch",
      (this.size ?? "md") ? `switch--${(this.size ?? "md")}` : null,
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
  <slot></slot>
</label>`;
  }
}

customElements.define('fsds-switch', SwitchElement);
// @generated:end

// @custom:start trailing

// @custom:end