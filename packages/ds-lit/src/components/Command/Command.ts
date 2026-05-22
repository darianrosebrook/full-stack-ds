// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { CommandBehavior } from './CommandBehavior.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class CommandElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .command {
      --fsds-command-color-overlay: var(--fsds-semantic-overlay-scrim-dialog, rgba(0,0,0,0.60));
      --fsds-command-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-command-color-border: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-command-color-borderLight: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-command-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-command-color-textMuted: var(--fsds-semantic-color-foreground-tertiary, #717171);
      --fsds-command-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-command-border-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-command-size-maxWidth: 640px;
      --fsds-command-size-maxHeight: 400px;
      --fsds-command-size-icon: var(--fsds-core-spacing-size-04, 8px);
      --fsds-command-spacing-dialogPadding: var(--fsds-core-spacing-size-04, 8px);
      --fsds-command-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-command-text-sizeSmall: var(--fsds-semantic-typography-body-04, 12px);
      --fsds-command-shadow: var(--fsds-semantic-elevation-surface-floating, 0 4px 24px rgba(0,0,0,0.12));
      --fsds-command-opacity-disabled: var(--fsds-semantic-interaction-disabled-opacity, 0.5);
      --fsds-command-color-backgroundHover: var(--fsds-semantic-interaction-background-hover, #efefef);
    }
    
    .command {
      background-color: var(--fsds-command-color-background);
      border-color: var(--fsds-command-color-borderLight);
      color: var(--fsds-command-color-textMuted);
      border-width: var(--fsds-command-border-width);
      border-radius: var(--fsds-command-border-radius);
      padding: var(--fsds-command-spacing-dialogPadding);
      font-size: var(--fsds-command-text-sizeSmall);
      box-shadow: var(--fsds-command-shadow);
      opacity: var(--fsds-command-opacity-disabled);
    
      &:hover {
        background-color: var(--fsds-command-color-backgroundHover);
      }
    }
  `;

  @property({ type: Boolean }) open?: boolean;
  @property({ type: Boolean }) defaultOpen?: boolean;
  @property({ type: String }) search?: string;
  @property({ type: String }) defaultSearch?: string;
  @property({ type: String }) placeholder?: string = "Search...";
  @property({ type: String }) emptyMessage?: string = "No results found.";
  @property({ type: String }) label?: string = "Command palette";
  @property({ type: Boolean }) shouldFilter?: boolean = true;
  @property({ attribute: false }) filter?: ((value: string, search: string) => number) | undefined;
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
  <div class=${'command__overlay'} aria-hidden="true" data-fsds-channel-renders="open"></div>
  ` : nothing}
  ${this.behavior.open ? html`
  <div class=${'command__dialog'} role="dialog" aria-modal="true" aria-label=${ifDefined(this.label)} data-fsds-channel-renders="open" @click=${(e: Event) => e.stopPropagation()}>
    <div class=${'command__inputWrapper'}>
      <span class=${'command__searchIcon'} aria-hidden="true"></span>
      <input class=${'command__input'} type="search" role="combobox" aria-autocomplete="list" aria-controls="fsds-command-listbox" aria-expanded=${this.behavior.open ? 'true' : 'false'} placeholder=${ifDefined(this.placeholder)} .value=${this.behavior.search} @change=${(e: Event) => this.handleSearchChange(e)} />
    </div>
    <div class=${'command__list'} role="listbox" id="fsds-command-listbox">
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
  static override styles = css`
    :host { display: contents; }
    .command {
      --fsds-command-color-overlay: var(--fsds-semantic-overlay-scrim-dialog, rgba(0,0,0,0.60));
      --fsds-command-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-command-color-border: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-command-color-borderLight: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-command-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-command-color-textMuted: var(--fsds-semantic-color-foreground-tertiary, #717171);
      --fsds-command-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-command-border-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-command-size-maxWidth: 640px;
      --fsds-command-size-maxHeight: 400px;
      --fsds-command-size-icon: var(--fsds-core-spacing-size-04, 8px);
      --fsds-command-spacing-dialogPadding: var(--fsds-core-spacing-size-04, 8px);
      --fsds-command-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-command-text-sizeSmall: var(--fsds-semantic-typography-body-04, 12px);
      --fsds-command-shadow: var(--fsds-semantic-elevation-surface-floating, 0 4px 24px rgba(0,0,0,0.12));
      --fsds-command-opacity-disabled: var(--fsds-semantic-interaction-disabled-opacity, 0.5);
      --fsds-command-color-backgroundHover: var(--fsds-semantic-interaction-background-hover, #efefef);
    }
    
    .command {
      background-color: var(--fsds-command-color-background);
      border-color: var(--fsds-command-color-borderLight);
      color: var(--fsds-command-color-textMuted);
      border-width: var(--fsds-command-border-width);
      border-radius: var(--fsds-command-border-radius);
      padding: var(--fsds-command-spacing-dialogPadding);
      font-size: var(--fsds-command-text-sizeSmall);
      box-shadow: var(--fsds-command-shadow);
      opacity: var(--fsds-command-opacity-disabled);
    
      &:hover {
        background-color: var(--fsds-command-color-backgroundHover);
      }
    }
  `;

  override render() {
    return html`<fsds-stack as="ul" variant="horizontal" class="command__list"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-command-list', CommandListElement);

export class CommandGroupElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .command {
      --fsds-command-color-overlay: var(--fsds-semantic-overlay-scrim-dialog, rgba(0,0,0,0.60));
      --fsds-command-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-command-color-border: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-command-color-borderLight: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-command-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-command-color-textMuted: var(--fsds-semantic-color-foreground-tertiary, #717171);
      --fsds-command-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-command-border-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-command-size-maxWidth: 640px;
      --fsds-command-size-maxHeight: 400px;
      --fsds-command-size-icon: var(--fsds-core-spacing-size-04, 8px);
      --fsds-command-spacing-dialogPadding: var(--fsds-core-spacing-size-04, 8px);
      --fsds-command-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-command-text-sizeSmall: var(--fsds-semantic-typography-body-04, 12px);
      --fsds-command-shadow: var(--fsds-semantic-elevation-surface-floating, 0 4px 24px rgba(0,0,0,0.12));
      --fsds-command-opacity-disabled: var(--fsds-semantic-interaction-disabled-opacity, 0.5);
      --fsds-command-color-backgroundHover: var(--fsds-semantic-interaction-background-hover, #efefef);
    }
    
    .command {
      background-color: var(--fsds-command-color-background);
      border-color: var(--fsds-command-color-borderLight);
      color: var(--fsds-command-color-textMuted);
      border-width: var(--fsds-command-border-width);
      border-radius: var(--fsds-command-border-radius);
      padding: var(--fsds-command-spacing-dialogPadding);
      font-size: var(--fsds-command-text-sizeSmall);
      box-shadow: var(--fsds-command-shadow);
      opacity: var(--fsds-command-opacity-disabled);
    
      &:hover {
        background-color: var(--fsds-command-color-backgroundHover);
      }
    }
  `;

  override render() {
    return html`<fsds-stack class="command__group"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-command-group', CommandGroupElement);

export class CommandItemElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .command {
      --fsds-command-color-overlay: var(--fsds-semantic-overlay-scrim-dialog, rgba(0,0,0,0.60));
      --fsds-command-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-command-color-border: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-command-color-borderLight: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-command-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-command-color-textMuted: var(--fsds-semantic-color-foreground-tertiary, #717171);
      --fsds-command-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-command-border-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-command-size-maxWidth: 640px;
      --fsds-command-size-maxHeight: 400px;
      --fsds-command-size-icon: var(--fsds-core-spacing-size-04, 8px);
      --fsds-command-spacing-dialogPadding: var(--fsds-core-spacing-size-04, 8px);
      --fsds-command-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-command-text-sizeSmall: var(--fsds-semantic-typography-body-04, 12px);
      --fsds-command-shadow: var(--fsds-semantic-elevation-surface-floating, 0 4px 24px rgba(0,0,0,0.12));
      --fsds-command-opacity-disabled: var(--fsds-semantic-interaction-disabled-opacity, 0.5);
      --fsds-command-color-backgroundHover: var(--fsds-semantic-interaction-background-hover, #efefef);
    }
    
    .command {
      background-color: var(--fsds-command-color-background);
      border-color: var(--fsds-command-color-borderLight);
      color: var(--fsds-command-color-textMuted);
      border-width: var(--fsds-command-border-width);
      border-radius: var(--fsds-command-border-radius);
      padding: var(--fsds-command-spacing-dialogPadding);
      font-size: var(--fsds-command-text-sizeSmall);
      box-shadow: var(--fsds-command-shadow);
      opacity: var(--fsds-command-opacity-disabled);
    
      &:hover {
        background-color: var(--fsds-command-color-backgroundHover);
      }
    }
  `;

  override render() {
    return html`<fsds-stack as="li" class="command__item"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-command-item', CommandItemElement);
// @generated:end

// @custom:start trailing

// @custom:end