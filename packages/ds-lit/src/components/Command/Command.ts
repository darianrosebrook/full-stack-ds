// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { CommandBehavior } from './CommandBehavior.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class CommandElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property({ type: Boolean }) open?: boolean;
  @property({ type: Boolean }) defaultOpen?: boolean;
  @property() search?: string;
  @property() defaultSearch?: string;
  @property() placeholder?: string = "Search...";
  @property() emptyMessage?: string = "No results found.";
  @property() label?: string = "Command palette";
  @property({ type: Boolean }) shouldFilter?: boolean = true;
  @property({ type: Number }) filter?: ((value: string, search: string) => number) | undefined;
  @property({ attribute: false }) onOpenChange?: (value: boolean) => void;
  @property({ attribute: false }) onSearchChange?: (value: string) => void;

  private behavior = new CommandBehavior(this, {
    open: () => this.open,
    defaultOpen: this.defaultOpen,
    onOpenChange: (v) => this.onOpenChange?.(v),
    search: () => this.search,
    defaultSearch: this.defaultSearch,
    onSearchChange: (v) => this.onSearchChange?.(v),
  });

  private handleOpenChange(event: Event): void {
    this.behavior.setOpen((event.target as HTMLInputElement).checked);
  }

  private handleSearchChange(event: Event): void {
    this.behavior.setSearch((event.target as HTMLInputElement).value);
  }

  private _handleOverlayClick = (): void => {
    this.behavior.setOpen(false);
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
      "command",
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" role="dialog">
  ${this.behavior.open ? html`
  <div class=${'command__overlay'} aria-hidden="true"></div>
  ` : nothing}
  ${this.behavior.open ? html`
  <div class=${'command__dialog'} role="dialog" aria-modal="true" aria-label=${this.label} @click=${(e: Event) => e.stopPropagation()}>
    <div class=${'command__inputWrapper'}>
      <span class=${'command__searchIcon'} aria-hidden="true"></span>
      <input class=${'command__input'} type="search" role="combobox" aria-autocomplete="list" aria-expanded="true" .placeholder=${this.placeholder} .value=${this.behavior.search} @change=${(e: Event) => this.handleSearchChange(e)} />
    </div>
    <div class=${'command__list'} role="listbox">
      <div class=${'command__empty'}></div>
      <div class=${'command__group'}>
        <div class=${'command__groupHeading'}></div>
        <div class=${'command__groupItems'}>
          <div class=${'command__item'} role="option">
            <span class=${'command__itemIcon'}></span>
            <div class=${'command__itemContent'}>
              <span class=${'command__itemLabel'}></span>
              <span class=${'command__itemDescription'}></span>
            </div>
          </div>
        </div>
      </div>
      <div class=${'command__separator'} role="separator" aria-hidden="true"></div>
    </div>
  </div>
  ` : nothing}
</div>`;
  }
}

customElements.define('fsds-command', CommandElement);

export class CommandListElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="ul" variant="horizontal" class="command__list"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-command-list', CommandListElement);

export class CommandGroupElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack class="command__group"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-command-group', CommandGroupElement);

export class CommandItemElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="li" class="command__item"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-command-item', CommandItemElement);
// @generated:end

// @custom:start trailing

// @custom:end