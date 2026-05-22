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
      --fsds-toggleSwitch-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-toggleSwitch-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-toggleSwitch-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-toggleSwitch-border-radius-default: var(--fsds-core-shape-radius-full, 9999px);
      --fsds-toggleSwitch-motion-duration-fast: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toggleSwitch-color-background-hover: var(--fsds-semantic-interaction-background-hover, #efefef);
      --fsds-toggleSwitch-color-background-checked: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
      --fsds-toggleSwitch-color-background-disabled: var(--fsds-semantic-color-background-disabled, #cecece);
    }
    
    .toggle-switch {
      background-color: var(--fsds-toggleSwitch-color-background-default);
      color: var(--fsds-toggleSwitch-color-foreground-default);
      border-color: var(--fsds-toggleSwitch-color-border-default);
      border-radius: var(--fsds-toggleSwitch-border-radius-default);
      transition-duration: var(--fsds-toggleSwitch-motion-duration-fast);
    
      &:hover {
        background-color: var(--fsds-toggleSwitch-color-background-hover);
      }
    
      &:checked {
        background-color: var(--fsds-toggleSwitch-color-background-checked);
      }
    
      &:disabled {
        background-color: var(--fsds-toggleSwitch-color-background-disabled);
      }
    }
  `;

  @property({ type: Boolean }) checked?: boolean;
  @property({ type: Boolean }) defaultChecked?: boolean;
  @property({ attribute: false }) size?: ToggleSwitchSize = "medium";
  @property({ type: Boolean }) disabled?: boolean;
  @property({ attribute: 'aria-label', reflect: true })
  override ariaLabel: string | null = null;
  @property({ type: String }) ariaDescribedby?: string;
  @property({ attribute: false }) onChange?: (value: boolean) => void;

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
    return html`<button class="${this.computeClasses()}" type="button" role="switch" aria-checked=${this.behavior.checked ? 'true' : 'false'} aria-label=${ifDefined(this.ariaLabel ?? undefined)} aria-describedby=${ifDefined(this.ariaDescribedby)} ?disabled=${this.disabled ?? false} @click=${(e: Event) => this.handleCheckedChange(e)}></button>`;
  }
}

customElements.define('fsds-toggle-switch', ToggleSwitchElement);
// @generated:end

// @custom:start trailing

// @custom:end