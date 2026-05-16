// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { TooltipBehavior } from './TooltipBehavior.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type TooltipPlacement = "top" | "bottom" | "left" | "right" | "auto";
export type TooltipTrigger = "hover" | "focus" | "manual";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class TooltipElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property() content!: unknown;
  @property({ type: Boolean }) open?: boolean;
  @property({ type: Boolean }) defaultOpen?: boolean;
  @property() placement?: TooltipPlacement;
  @property() trigger?: TooltipTrigger = "hover";
  @property({ type: Number }) delay?: number;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: Boolean }) closeOnEscape?: boolean = true;
  @property({ type: Boolean }) closeOnBlur?: boolean = true;
  @property({ attribute: false }) onOpenChange?: (value: boolean) => void;

  private behavior = new TooltipBehavior(this, {
    open: () => this.open,
    defaultOpen: this.defaultOpen,
    onOpenChange: (v) => this.onOpenChange?.(v),
    closeOnEscape: this.closeOnEscape,
    closeOnBlur: this.closeOnBlur,
  });

  private handleOpenChange(event: Event): void {
    this.behavior.setOpen((event.target as HTMLInputElement).checked);
  }

  private computeClasses(): string {
    return [
      "tooltip",
      this.placement ? `tooltip--${this.placement}` : null,
      this.disabled ? "tooltip--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`${this.behavior.open ? html`
<div class="${this.computeClasses()}" role="tooltip">
  <slot></slot>
</div>
` : nothing}`;
  }
}

customElements.define('fsds-tooltip', TooltipElement);
// @generated:end

// @custom:start trailing

// @custom:end