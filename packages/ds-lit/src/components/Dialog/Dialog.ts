// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { DialogBehavior } from './DialogBehavior.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type DialogSize = "sm" | "md" | "lg" | "xl" | "full";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class DialogElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property({ type: Boolean }) open?: boolean;
  @property({ type: Boolean }) defaultOpen?: boolean;
  @property({ type: Boolean }) modal?: boolean = true;
  @property() size?: DialogSize = "md";
  @property({ type: Boolean }) dismissible?: boolean = true;
  @property({ type: Boolean }) closeOnEscape?: boolean = true;
  @property({ type: Boolean }) closeOnBackdropClick?: boolean = true;
  @property() initialFocus?: string;
  @property() returnFocus?: string;
  @property({ attribute: false }) onOpenChange?: (value: boolean) => void;

  private behavior = new DialogBehavior(this, {
    open: () => this.open,
    defaultOpen: this.defaultOpen,
    onOpenChange: (v) => this.onOpenChange?.(v),
    closeOnEscape: this.closeOnEscape,
    closeOnBackdropClick: this.closeOnBackdropClick,
  });

  private _handleOverlayClick = (): void => {
    if (this.closeOnBackdropClick !== false) {
      this.behavior.setOpenness(false);
    }
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this._handleOverlayClick);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('click', this._handleOverlayClick);
    super.disconnectedCallback();
  }

  private computeClasses(): string {
    return [
      "dialog",
      this.size ? `dialog--${this.size}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" role="dialog">
  ${this.behavior.openness ? html`
  <div class=${'dialog__backdrop'} aria-hidden="true" data-fsds-channel-renders="openness"></div>
  ` : nothing}
  ${this.behavior.openness ? html`
  <div class=${'dialog__modal'} role="dialog" aria-modal="true" aria-labelledby="dialog-title-id" aria-describedby="dialog-body-id" data-fsds-channel-renders="openness" @click=${(e: Event) => e.stopPropagation()}>
    <div class=${'dialog__header'}>
      <h2 class=${'dialog__title'}>
        <slot name="title"></slot>
      </h2>
      <button class=${'dialog__closeButton'} type="button" aria-label="Close dialog"></button>
    </div>
    <div class=${'dialog__body'}>
      <slot></slot>
    </div>
    <div class=${'dialog__footer'}></div>
  </div>
  ` : nothing}
</div>`;
  }
}

customElements.define('fsds-dialog', DialogElement);

export class DialogHeaderElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="header" class="dialog__header"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-dialog-header', DialogHeaderElement);

export class DialogTitleElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="h3" class="dialog__title"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-dialog-title', DialogTitleElement);

export class DialogBodyElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack class="dialog__body"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-dialog-body', DialogBodyElement);

export class DialogFooterElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="footer" variant="horizontal" class="dialog__footer"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-dialog-footer', DialogFooterElement);
// @generated:end

// @custom:start trailing

// @custom:end