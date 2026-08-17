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
      --fsds-toggle-switch-color-background-default: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-toggle-switch-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-toggle-switch-color-border-default: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-toggle-switch-border-radius-default: var(--fsds-semantic-shape-control-radius-pill, 9999px);
      --fsds-toggle-switch-motion-duration-fast: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-toggle-switch-color-background-hover: var(--fsds-semantic-interaction-background-hover, #d0d0d0);
      --fsds-toggle-switch-color-background-checked: var(--fsds-semantic-color-action-background-primary-default, #0566fe);
      --fsds-toggle-switch-color-background-disabled: var(--fsds-semantic-color-background-disabled, #d0d0d0);
      --fsds-toggle-switch-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-toggle-switch-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0566fe);
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
      background-color: var(--fsds-toggle-switch-color-background-default, #d0d0d0);
      color: var(--fsds-toggle-switch-color-foreground-default, #141414);
      border-color: var(--fsds-toggle-switch-color-border-default, #b8b8b8);
      border-radius: var(--fsds-toggle-switch-border-radius-default, 9999px);
      transition-duration: var(--fsds-toggle-switch-motion-duration-fast, 150ms);
      border-style: solid;
      border-width: 1px;
      cursor: pointer;
      box-sizing: border-box;

      &:hover:not(:disabled) {
        background-color: var(--fsds-toggle-switch-color-background-hover, #d0d0d0);
      }

      &[aria-checked="true"] {
        background-color: var(--fsds-toggle-switch-color-background-checked, #0566fe);
      }

      &:disabled {
        background-color: var(--fsds-toggle-switch-color-background-disabled, #d0d0d0);
        cursor: not-allowed;
      }

      &:focus-visible:not(:disabled) {
        outline-width: var(--fsds-toggle-switch-focus-ring-width, 2px);
        outline-color: var(--fsds-toggle-switch-focus-ring-color, #0566fe);
        outline-style: var(--fsds-toggle-switch-focus-ring-style, solid);
        outline-offset: var(--fsds-toggle-switch-focus-ring-offset, 2px);
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

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "toggle-switch");
  }

  private computeClasses(): string {
    return [
      "toggle-switch",
      (this.size ?? "medium") ? `toggle-switch--${(this.size ?? "medium")}` : null,
      this.behavior.checked ? "toggle-switch--checked" : null,
      this.disabled ? "toggle-switch--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<button class="${this.computeClasses()}" type="button" role="switch" @click=${() => this.behavior.setChecked(!this.behavior.checked)} aria-checked=${this.behavior.checked ? 'true' : 'false'} aria-label=${ifDefined(this.ariaLabel ?? undefined)} aria-describedby=${ifDefined(this.ariaDescribedby)} ?disabled=${this.disabled ?? false}></button>`;
  }
}

customElements.define('fsds-toggle-switch', ToggleSwitchElement);

// @generated:end

// @custom:start trailing

// @custom:end