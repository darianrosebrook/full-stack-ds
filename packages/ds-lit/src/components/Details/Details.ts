// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { DetailsBehavior } from './DetailsBehavior.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type DetailsVariant = "default" | "inline" | "compact";
export type DetailsIcon = "left" | "right" | "none";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class DetailsElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property() summary!: string;
  @property({ type: Boolean }) open?: boolean;
  @property({ type: Boolean }) defaultOpen?: boolean;
  @property({ type: Boolean }) disabled?: boolean;
  @property() variant?: DetailsVariant;
  @property() icon?: DetailsIcon;
  @property({ attribute: false }) onOpenChange?: (value: boolean) => void;

  private behavior = new DetailsBehavior(this, {
    open: () => this.open,
    defaultOpen: this.defaultOpen,
    onOpenChange: (v) => this.onOpenChange?.(v),
  });

  private computeClasses(): string {
    return [
      "details",
      this.variant ? `details--${this.variant}` : null,
      this.icon ? `details--${this.icon}` : null,
      this.behavior.open ? "details--open" : null,
      this.disabled ? "details--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<details class="${this.computeClasses()}" role="group" ?open=${this.behavior.open}>
  <summary class=${'details__summary'}>
    <span class=${'details__summaryContent'}>
      <span class=${'details__icon'}></span>
      <span class=${'details__summaryText'} .textContent=${this.summary}></span>
    </span>
  </summary>
  ${this.behavior.open ? html`
  <div class=${'details__content'}>
    <slot></slot>
  </div>
  ` : nothing}
</details>`;
  }
}

customElements.define('fsds-details', DetailsElement);

export class DetailsContentElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack class="details__content"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-details-content', DetailsContentElement);
// @generated:end

// @custom:start trailing

// @custom:end