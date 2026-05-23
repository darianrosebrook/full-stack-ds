// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ToggleSwitchBehavior } from './ToggleSwitchBehavior.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ToggleSwitchSize = "small" | "medium" | "large";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class ToggleSwitchElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .toggle-switch {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: 0;
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-toggle-switch-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-toggle-switch-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-toggle-switch-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-toggle-switch-border-radius-default: var(--fsds-core-shape-radius-full, 9999px);
      --fsds-toggle-switch-motion-duration-fast: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toggle-switch-color-background-hover: var(--fsds-semantic-interaction-background-hover, #efefef);
      --fsds-toggle-switch-color-background-checked: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
      --fsds-toggle-switch-color-background-disabled: var(--fsds-semantic-color-background-disabled, #cecece);
      --fsds-toggle-switch-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-toggle-switch-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0a65fe);
      --fsds-toggle-switch-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-toggle-switch-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }
    
    .toggle-switch {
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
      background-color: var(--fsds-toggle-switch-color-background-default);
      color: var(--fsds-toggle-switch-color-foreground-default);
      border-color: var(--fsds-toggle-switch-color-border-default);
      border-radius: var(--fsds-toggle-switch-border-radius-default);
      transition-duration: var(--fsds-toggle-switch-motion-duration-fast);
      border-style: solid;
      border-width: 1px;
      cursor: pointer;
      box-sizing: border-box;
    
      &:hover {
        background-color: var(--fsds-toggle-switch-color-background-hover);
      }
    
      &[aria-checked="true"] {
        background-color: var(--fsds-toggle-switch-color-background-checked);
      }
    
      &:disabled {
        background-color: var(--fsds-toggle-switch-color-background-disabled);
        cursor: not-allowed;
      }
    
      &:focus-visible {
        outline-width: var(--fsds-toggle-switch-focus-ring-width);
        outline-color: var(--fsds-toggle-switch-focus-ring-color);
        outline-style: var(--fsds-toggle-switch-focus-ring-style);
        outline-offset: var(--fsds-toggle-switch-focus-ring-offset);
      }
    }
  `;

  @property({ type: Boolean }) checked?: boolean;
  @property({ type: Boolean }) defaultChecked?: boolean;
  @property({ attribute: false }) onChange?: (checked: boolean) => void;
  @property({ type: String }) size?: ToggleSwitchSize = "medium";
  @property({ type: Boolean }) disabled?: boolean;
  @property({ attribute: 'aria-label', reflect: true })
  override ariaLabel: string | null = null;
  @property({ type: String }) ariaDescribedby?: string;

  private behavior = new ToggleSwitchBehavior(this, {
    checked: () => this.checked,
    defaultChecked: this.defaultChecked,
    onChange: (v) => this.onChange?.(v),
  });

  private handleCheckedChange(event: Event): void {
    this.behavior.setChecked((event.target as HTMLInputElement).checked);
  }

  private computeClasses(): string {
    return [
      "toggle-switch",
      this.size ? `toggle-switch--${this.size}` : null,
      this.behavior.checked ? "toggle-switch--checked" : null,
      this.disabled ? "toggle-switch--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<button class="${this.computeClasses()}" type="button" role="switch" @click=${(e: Event) => this.handleCheckedChange(e)} aria-checked=${this.behavior.checked ? 'true' : 'false'} aria-label=${ifDefined(this.ariaLabel ?? undefined)} aria-describedby=${ifDefined(this.ariaDescribedby)} ?disabled=${this.disabled ?? false}></button>`;
  }
}

customElements.define('fsds-toggle-switch', ToggleSwitchElement);
// @generated:end

// @custom:start trailing

// @custom:end