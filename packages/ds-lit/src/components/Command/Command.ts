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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 16px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-command-color-overlay: var(--fsds-semantic-overlay-scrim-strong, rgba(0,0,0,0.64));
      --fsds-command-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-command-color-border: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-command-color-border-light: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-command-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-command-color-text-muted: var(--fsds-semantic-color-foreground-tertiary, #727272);
      --fsds-command-border-width: var(--fsds-semantic-shape-control-border-default-width, 1px);
      --fsds-command-border-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-command-size-max-width: 640px;
      --fsds-command-size-max-height: 400px;
      --fsds-command-size-top-offset: 10vh;
      --fsds-command-size-icon: var(--fsds-core-spacing-size-04, 8px);
      --fsds-command-spacing-dialog-padding: var(--fsds-core-spacing-size-04, 8px);
      --fsds-command-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-command-text-size-small: var(--fsds-semantic-typography-body-04, 12px);
      --fsds-command-shadow: var(--fsds-semantic-elevation-surface-floating, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      --fsds-command-opacity-disabled: var(--fsds-semantic-interaction-disabled-opacity, 0.5);
      --fsds-command-color-background-hover: var(--fsds-semantic-interaction-background-hover, #d0d0d0);
    }

    .command {
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
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: var(--fsds-command-size-top-offset, 10vh);
      pointer-events: none;
    }

    .command__overlay {
      position: absolute;
      inset: 0;
      background-color: var(--fsds-command-color-overlay, rgba(0,0,0,0.64));
      pointer-events: auto;
    }

    .command__dialog {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: var(--fsds-command-size-max-width, 640px);
      max-height: var(--fsds-command-size-max-height, 400px);
      background-color: var(--fsds-command-color-background, #ffffff);
      color: var(--fsds-command-color-text, #141414);
      border-color: var(--fsds-command-color-border, #b8b8b8);
      border-style: solid;
      border-width: var(--fsds-command-border-width, 1px);
      border-radius: var(--fsds-command-border-radius, 6px);
      box-shadow: var(--fsds-command-shadow, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      overflow: hidden;
      pointer-events: auto;
      box-sizing: border-box;
    }

    .command__inputWrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: var(--fsds-command-spacing-dialog-padding, 8px);
      border-bottom-color: var(--fsds-command-color-border-light, #d0d0d0);
      border-bottom-style: solid;
      border-bottom-width: 1px;
    }

    .command__searchIcon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: var(--fsds-command-size-icon, 8px);
      height: var(--fsds-command-size-icon, 8px);
      color: var(--fsds-command-color-text-muted, #727272);
    }

    .command__input {
      flex: 1 1 auto;
      background: transparent;
      border: 0;
      outline: none;
      padding: 0;
      color: var(--fsds-command-color-text, #141414);
      font-size: var(--fsds-command-text-size, 16px);
      font-family: inherit;
    }

    .command__list {
      flex: 1 1 auto;
      overflow-y: auto;
      padding: 4px 0;
      margin: 0;
      list-style: none;
    }

    .command__empty {
      display: block;
      padding: var(--fsds-command-spacing-dialog-padding, 8px);
      text-align: center;
      color: var(--fsds-command-color-text-muted, #727272);
      font-size: var(--fsds-command-text-size-small, 12px);
    }

    .command__group {
      display: block;
    }

    .command__groupHeading {
      display: block;
      padding: 8px 12px 4px;
      color: var(--fsds-command-color-text-muted, #727272);
      font-size: var(--fsds-command-text-size-small, 12px);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .command__groupItems {
      display: flex;
      flex-direction: column;
    }

    .command__item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      color: var(--fsds-command-color-text, #141414);
      cursor: pointer;
      border-radius: var(--fsds-command-border-radius, 6px);
    }

    .command__item:hover:not([aria-disabled="true"]) {
      background-color: var(--fsds-command-color-background-hover, #d0d0d0);
    }

    .command__item[aria-selected="true"] {
      background-color: var(--fsds-command-color-background-hover, #d0d0d0);
      color: var(--fsds-command-color-text, #141414);
    }

    .command__itemIcon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: var(--fsds-command-size-icon, 8px);
      height: var(--fsds-command-size-icon, 8px);
      color: var(--fsds-command-color-text-muted, #727272);
    }

    .command__itemContent {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .command__itemLabel {
      display: block;
      color: var(--fsds-command-color-text, #141414);
      font-size: var(--fsds-command-text-size, 16px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .command__itemDescription {
      display: block;
      color: var(--fsds-command-color-text-muted, #727272);
      font-size: var(--fsds-command-text-size-small, 12px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .command__separator {
      display: block;
      height: 1px;
      margin: 4px 8px;
      background-color: var(--fsds-command-color-border-light, #d0d0d0);
    }
  `;

  @property({ type: Boolean }) open?: boolean;
  @property({ type: Boolean }) defaultOpen?: boolean;
  @property({ attribute: false }) onOpenChange?: (open: boolean) => void;
  @property({ type: String }) search?: string;
  @property({ type: String }) defaultSearch?: string;
  @property({ attribute: false }) onSearchChange?: (value: string) => void;
  @property({ type: String }) placeholder?: string = "Search...";
  @property({ type: String }) emptyMessage?: string = "No results found.";
  @property({ type: String }) label?: string = "Command palette";
  @property({ type: Boolean }) shouldFilter?: boolean = true;
  @property({ attribute: false }) filter?: ((value: string, search: string) => number) | undefined;

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

  private _moving = false;
  private _portaled = false;
  private _portalOriginParent: Node | null = null;
  private _portalOriginNext: Node | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "command");
    this.addEventListener('click', this._handleOverlayClick);
    if (!this._portaled && typeof document !== "undefined" && this.parentNode && this.parentNode !== document.body) {
      this._portalOriginParent = this.parentNode;
      this._portalOriginNext = this.nextSibling;
      this._portaled = true;
      this._moving = true;
      document.body.appendChild(this);
      this._moving = false;
    }
  }

  override disconnectedCallback(): void {
    this.removeEventListener('click', this._handleOverlayClick);
    if (!this._moving) {
      if (this._portalOriginParent && this._portalOriginParent.isConnected) {
        this._portalOriginParent.insertBefore(this, this._portalOriginNext);
      }
      this._portaled = false;
      this._portalOriginParent = null;
      this._portalOriginNext = null;
    }
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
  <div class=${'command__dialog'} role="dialog" aria-modal="true" aria-label=${ifDefined((this.label ?? "Command palette"))} data-fsds-channel-renders="open" @click=${(e: Event) => e.stopPropagation()}>
    <div class=${'command__inputWrapper'}>
      <span class=${'command__searchIcon'} aria-hidden="true"></span>
      <input class=${'command__input'} type="search" role="combobox" aria-autocomplete="list" aria-controls="fsds-command-listbox" @change=${(e: Event) => this.handleSearchChange(e)} aria-expanded=${this.behavior.open ? 'true' : 'false'} placeholder=${ifDefined((this.placeholder ?? "Search..."))} .value=${this.behavior.search} id="command-input" />
    </div>
    <div class=${'command__list'} role="listbox" id="fsds-command-listbox" aria-labelledby="command-input">
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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 16px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-command-color-overlay: var(--fsds-semantic-overlay-scrim-strong, rgba(0,0,0,0.64));
      --fsds-command-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-command-color-border: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-command-color-border-light: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-command-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-command-color-text-muted: var(--fsds-semantic-color-foreground-tertiary, #727272);
      --fsds-command-border-width: var(--fsds-semantic-shape-control-border-default-width, 1px);
      --fsds-command-border-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-command-size-max-width: 640px;
      --fsds-command-size-max-height: 400px;
      --fsds-command-size-top-offset: 10vh;
      --fsds-command-size-icon: var(--fsds-core-spacing-size-04, 8px);
      --fsds-command-spacing-dialog-padding: var(--fsds-core-spacing-size-04, 8px);
      --fsds-command-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-command-text-size-small: var(--fsds-semantic-typography-body-04, 12px);
      --fsds-command-shadow: var(--fsds-semantic-elevation-surface-floating, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      --fsds-command-opacity-disabled: var(--fsds-semantic-interaction-disabled-opacity, 0.5);
      --fsds-command-color-background-hover: var(--fsds-semantic-interaction-background-hover, #d0d0d0);
    }

    .command {
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
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: var(--fsds-command-size-top-offset, 10vh);
      pointer-events: none;
    }

    .command__overlay {
      position: absolute;
      inset: 0;
      background-color: var(--fsds-command-color-overlay, rgba(0,0,0,0.64));
      pointer-events: auto;
    }

    .command__dialog {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: var(--fsds-command-size-max-width, 640px);
      max-height: var(--fsds-command-size-max-height, 400px);
      background-color: var(--fsds-command-color-background, #ffffff);
      color: var(--fsds-command-color-text, #141414);
      border-color: var(--fsds-command-color-border, #b8b8b8);
      border-style: solid;
      border-width: var(--fsds-command-border-width, 1px);
      border-radius: var(--fsds-command-border-radius, 6px);
      box-shadow: var(--fsds-command-shadow, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      overflow: hidden;
      pointer-events: auto;
      box-sizing: border-box;
    }

    .command__inputWrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: var(--fsds-command-spacing-dialog-padding, 8px);
      border-bottom-color: var(--fsds-command-color-border-light, #d0d0d0);
      border-bottom-style: solid;
      border-bottom-width: 1px;
    }

    .command__searchIcon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: var(--fsds-command-size-icon, 8px);
      height: var(--fsds-command-size-icon, 8px);
      color: var(--fsds-command-color-text-muted, #727272);
    }

    .command__input {
      flex: 1 1 auto;
      background: transparent;
      border: 0;
      outline: none;
      padding: 0;
      color: var(--fsds-command-color-text, #141414);
      font-size: var(--fsds-command-text-size, 16px);
      font-family: inherit;
    }

    .command__list {
      flex: 1 1 auto;
      overflow-y: auto;
      padding: 4px 0;
      margin: 0;
      list-style: none;
    }

    .command__empty {
      display: block;
      padding: var(--fsds-command-spacing-dialog-padding, 8px);
      text-align: center;
      color: var(--fsds-command-color-text-muted, #727272);
      font-size: var(--fsds-command-text-size-small, 12px);
    }

    .command__group {
      display: block;
    }

    .command__groupHeading {
      display: block;
      padding: 8px 12px 4px;
      color: var(--fsds-command-color-text-muted, #727272);
      font-size: var(--fsds-command-text-size-small, 12px);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .command__groupItems {
      display: flex;
      flex-direction: column;
    }

    .command__item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      color: var(--fsds-command-color-text, #141414);
      cursor: pointer;
      border-radius: var(--fsds-command-border-radius, 6px);
    }

    .command__item:hover:not([aria-disabled="true"]) {
      background-color: var(--fsds-command-color-background-hover, #d0d0d0);
    }

    .command__item[aria-selected="true"] {
      background-color: var(--fsds-command-color-background-hover, #d0d0d0);
      color: var(--fsds-command-color-text, #141414);
    }

    .command__itemIcon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: var(--fsds-command-size-icon, 8px);
      height: var(--fsds-command-size-icon, 8px);
      color: var(--fsds-command-color-text-muted, #727272);
    }

    .command__itemContent {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .command__itemLabel {
      display: block;
      color: var(--fsds-command-color-text, #141414);
      font-size: var(--fsds-command-text-size, 16px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .command__itemDescription {
      display: block;
      color: var(--fsds-command-color-text-muted, #727272);
      font-size: var(--fsds-command-text-size-small, 12px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .command__separator {
      display: block;
      height: 1px;
      margin: 4px 8px;
      background-color: var(--fsds-command-color-border-light, #d0d0d0);
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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 16px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-command-color-overlay: var(--fsds-semantic-overlay-scrim-strong, rgba(0,0,0,0.64));
      --fsds-command-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-command-color-border: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-command-color-border-light: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-command-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-command-color-text-muted: var(--fsds-semantic-color-foreground-tertiary, #727272);
      --fsds-command-border-width: var(--fsds-semantic-shape-control-border-default-width, 1px);
      --fsds-command-border-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-command-size-max-width: 640px;
      --fsds-command-size-max-height: 400px;
      --fsds-command-size-top-offset: 10vh;
      --fsds-command-size-icon: var(--fsds-core-spacing-size-04, 8px);
      --fsds-command-spacing-dialog-padding: var(--fsds-core-spacing-size-04, 8px);
      --fsds-command-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-command-text-size-small: var(--fsds-semantic-typography-body-04, 12px);
      --fsds-command-shadow: var(--fsds-semantic-elevation-surface-floating, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      --fsds-command-opacity-disabled: var(--fsds-semantic-interaction-disabled-opacity, 0.5);
      --fsds-command-color-background-hover: var(--fsds-semantic-interaction-background-hover, #d0d0d0);
    }

    .command {
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
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: var(--fsds-command-size-top-offset, 10vh);
      pointer-events: none;
    }

    .command__overlay {
      position: absolute;
      inset: 0;
      background-color: var(--fsds-command-color-overlay, rgba(0,0,0,0.64));
      pointer-events: auto;
    }

    .command__dialog {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: var(--fsds-command-size-max-width, 640px);
      max-height: var(--fsds-command-size-max-height, 400px);
      background-color: var(--fsds-command-color-background, #ffffff);
      color: var(--fsds-command-color-text, #141414);
      border-color: var(--fsds-command-color-border, #b8b8b8);
      border-style: solid;
      border-width: var(--fsds-command-border-width, 1px);
      border-radius: var(--fsds-command-border-radius, 6px);
      box-shadow: var(--fsds-command-shadow, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      overflow: hidden;
      pointer-events: auto;
      box-sizing: border-box;
    }

    .command__inputWrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: var(--fsds-command-spacing-dialog-padding, 8px);
      border-bottom-color: var(--fsds-command-color-border-light, #d0d0d0);
      border-bottom-style: solid;
      border-bottom-width: 1px;
    }

    .command__searchIcon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: var(--fsds-command-size-icon, 8px);
      height: var(--fsds-command-size-icon, 8px);
      color: var(--fsds-command-color-text-muted, #727272);
    }

    .command__input {
      flex: 1 1 auto;
      background: transparent;
      border: 0;
      outline: none;
      padding: 0;
      color: var(--fsds-command-color-text, #141414);
      font-size: var(--fsds-command-text-size, 16px);
      font-family: inherit;
    }

    .command__list {
      flex: 1 1 auto;
      overflow-y: auto;
      padding: 4px 0;
      margin: 0;
      list-style: none;
    }

    .command__empty {
      display: block;
      padding: var(--fsds-command-spacing-dialog-padding, 8px);
      text-align: center;
      color: var(--fsds-command-color-text-muted, #727272);
      font-size: var(--fsds-command-text-size-small, 12px);
    }

    .command__group {
      display: block;
    }

    .command__groupHeading {
      display: block;
      padding: 8px 12px 4px;
      color: var(--fsds-command-color-text-muted, #727272);
      font-size: var(--fsds-command-text-size-small, 12px);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .command__groupItems {
      display: flex;
      flex-direction: column;
    }

    .command__item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      color: var(--fsds-command-color-text, #141414);
      cursor: pointer;
      border-radius: var(--fsds-command-border-radius, 6px);
    }

    .command__item:hover:not([aria-disabled="true"]) {
      background-color: var(--fsds-command-color-background-hover, #d0d0d0);
    }

    .command__item[aria-selected="true"] {
      background-color: var(--fsds-command-color-background-hover, #d0d0d0);
      color: var(--fsds-command-color-text, #141414);
    }

    .command__itemIcon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: var(--fsds-command-size-icon, 8px);
      height: var(--fsds-command-size-icon, 8px);
      color: var(--fsds-command-color-text-muted, #727272);
    }

    .command__itemContent {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .command__itemLabel {
      display: block;
      color: var(--fsds-command-color-text, #141414);
      font-size: var(--fsds-command-text-size, 16px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .command__itemDescription {
      display: block;
      color: var(--fsds-command-color-text-muted, #727272);
      font-size: var(--fsds-command-text-size-small, 12px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .command__separator {
      display: block;
      height: 1px;
      margin: 4px 8px;
      background-color: var(--fsds-command-color-border-light, #d0d0d0);
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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 16px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-command-color-overlay: var(--fsds-semantic-overlay-scrim-strong, rgba(0,0,0,0.64));
      --fsds-command-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-command-color-border: var(--fsds-semantic-color-border-light, #b8b8b8);
      --fsds-command-color-border-light: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-command-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-command-color-text-muted: var(--fsds-semantic-color-foreground-tertiary, #727272);
      --fsds-command-border-width: var(--fsds-semantic-shape-control-border-default-width, 1px);
      --fsds-command-border-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-command-size-max-width: 640px;
      --fsds-command-size-max-height: 400px;
      --fsds-command-size-top-offset: 10vh;
      --fsds-command-size-icon: var(--fsds-core-spacing-size-04, 8px);
      --fsds-command-spacing-dialog-padding: var(--fsds-core-spacing-size-04, 8px);
      --fsds-command-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-command-text-size-small: var(--fsds-semantic-typography-body-04, 12px);
      --fsds-command-shadow: var(--fsds-semantic-elevation-surface-floating, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      --fsds-command-opacity-disabled: var(--fsds-semantic-interaction-disabled-opacity, 0.5);
      --fsds-command-color-background-hover: var(--fsds-semantic-interaction-background-hover, #d0d0d0);
    }

    .command {
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
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: var(--fsds-command-size-top-offset, 10vh);
      pointer-events: none;
    }

    .command__overlay {
      position: absolute;
      inset: 0;
      background-color: var(--fsds-command-color-overlay, rgba(0,0,0,0.64));
      pointer-events: auto;
    }

    .command__dialog {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: var(--fsds-command-size-max-width, 640px);
      max-height: var(--fsds-command-size-max-height, 400px);
      background-color: var(--fsds-command-color-background, #ffffff);
      color: var(--fsds-command-color-text, #141414);
      border-color: var(--fsds-command-color-border, #b8b8b8);
      border-style: solid;
      border-width: var(--fsds-command-border-width, 1px);
      border-radius: var(--fsds-command-border-radius, 6px);
      box-shadow: var(--fsds-command-shadow, 0px 2px 4px #0000000f, 0px 4px 8px #0000001a);
      overflow: hidden;
      pointer-events: auto;
      box-sizing: border-box;
    }

    .command__inputWrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: var(--fsds-command-spacing-dialog-padding, 8px);
      border-bottom-color: var(--fsds-command-color-border-light, #d0d0d0);
      border-bottom-style: solid;
      border-bottom-width: 1px;
    }

    .command__searchIcon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: var(--fsds-command-size-icon, 8px);
      height: var(--fsds-command-size-icon, 8px);
      color: var(--fsds-command-color-text-muted, #727272);
    }

    .command__input {
      flex: 1 1 auto;
      background: transparent;
      border: 0;
      outline: none;
      padding: 0;
      color: var(--fsds-command-color-text, #141414);
      font-size: var(--fsds-command-text-size, 16px);
      font-family: inherit;
    }

    .command__list {
      flex: 1 1 auto;
      overflow-y: auto;
      padding: 4px 0;
      margin: 0;
      list-style: none;
    }

    .command__empty {
      display: block;
      padding: var(--fsds-command-spacing-dialog-padding, 8px);
      text-align: center;
      color: var(--fsds-command-color-text-muted, #727272);
      font-size: var(--fsds-command-text-size-small, 12px);
    }

    .command__group {
      display: block;
    }

    .command__groupHeading {
      display: block;
      padding: 8px 12px 4px;
      color: var(--fsds-command-color-text-muted, #727272);
      font-size: var(--fsds-command-text-size-small, 12px);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .command__groupItems {
      display: flex;
      flex-direction: column;
    }

    .command__item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      color: var(--fsds-command-color-text, #141414);
      cursor: pointer;
      border-radius: var(--fsds-command-border-radius, 6px);
    }

    .command__item:hover:not([aria-disabled="true"]) {
      background-color: var(--fsds-command-color-background-hover, #d0d0d0);
    }

    .command__item[aria-selected="true"] {
      background-color: var(--fsds-command-color-background-hover, #d0d0d0);
      color: var(--fsds-command-color-text, #141414);
    }

    .command__itemIcon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: var(--fsds-command-size-icon, 8px);
      height: var(--fsds-command-size-icon, 8px);
      color: var(--fsds-command-color-text-muted, #727272);
    }

    .command__itemContent {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .command__itemLabel {
      display: block;
      color: var(--fsds-command-color-text, #141414);
      font-size: var(--fsds-command-text-size, 16px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .command__itemDescription {
      display: block;
      color: var(--fsds-command-color-text-muted, #727272);
      font-size: var(--fsds-command-text-size-small, 12px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .command__separator {
      display: block;
      height: 1px;
      margin: 4px 8px;
      background-color: var(--fsds-command-color-border-light, #d0d0d0);
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