// @generated:start imports
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { AccordionBehavior } from './AccordionBehavior.js';
import {
  createCompoundContext,
  provideContext,
  ContextConsumerController,
} from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AccordionType = "single" | "multiple";

export interface AccordionContextValue {
  openness: string | string[];
  toggleItem: (value: string) => void;
  isItemOpen: (value: string) => boolean;
  type: "single" | "multiple";
  collapsible: boolean;
  disabled: boolean;
  idBase: string;
}

const DISCLOSURE_CTX = createCompoundContext<AccordionContextValue>("Accordion");
export { DISCLOSURE_CTX };
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class AccordionElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .accordion {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-accordion-color-background-hover: var(--fsds-semantic-interaction-background-hover, #efefef);
      --fsds-accordion-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-accordion-color-textSecondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-accordion-color-icon: var(--fsds-semantic-color-foreground-tertiary, #717171);
      --fsds-accordion-border-width: var(--fsds-semantic-shape-control-border-defaultWidth, 1px);
      --fsds-accordion-border-color: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-accordion-border-radius: var(--fsds-semantic-shape-radius-small, 4px);
      --fsds-accordion-spacing-gap: var(--fsds-core-spacing-size-07, 24px);
      --fsds-accordion-spacing-paddingX: var(--fsds-core-spacing-size-00, 0px);
      --fsds-accordion-spacing-paddingY: var(--fsds-core-spacing-size-04, 8px);
      --fsds-accordion-text-weight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-accordion-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-accordion-text-lineHeight: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-accordion-text-sizeContent: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-accordion-text-lineHeightContent: var(--fsds-semantic-typography-line-height-loose, 1.8);
      --fsds-accordion-icon-size: var(--fsds-core-spacing-size-04, 8px);
      --fsds-accordion-focus-width: var(--fsds-semantic-shape-control-border-focusWidth, 2px);
      --fsds-accordion-focus-color: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-accordion-focus-offset: var(--fsds-core-spacing-size-01, 1px);
      --fsds-accordion-opacity-disabled: var(--fsds-semantic-interaction-disabled-opacity, 0.5);
      --fsds-accordion-color-textHover: var(--fsds-semantic-interaction-text-hover, #555555);
    }

    .accordion {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-accordion-spacing-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      flex-direction: column;
      border-color: var(--fsds-accordion-border-color);
      border-radius: var(--fsds-accordion-border-radius);
      font-size: var(--fsds-accordion-text-sizeContent);
      line-height: var(--fsds-accordion-text-lineHeightContent);
    }

    .accordion__item {
      background-color: transparent;
      border-color: var(--fsds-accordion-border-color);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-accordion-border-radius);
      overflow: hidden;
    }

    .accordion__header {
      margin: 0;
    }

    .accordion__trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: var(--fsds-accordion-spacing-paddingY);
      background: transparent;
      border: 0;
      cursor: pointer;
      font-size: var(--fsds-accordion-text-size);
      font-weight: var(--fsds-accordion-text-weight);
      color: var(--fsds-accordion-color-text);
      text-align: left;
      line-height: var(--fsds-accordion-text-lineHeight);
    }

    .accordion__trigger:hover {
      background-color: var(--fsds-accordion-color-background-hover);
      color: var(--fsds-accordion-color-textHover);
    }

    .accordion__trigger:focus-visible {
      outline-width: var(--fsds-accordion-focus-width);
      outline-color: var(--fsds-accordion-focus-color);
      outline-offset: var(--fsds-accordion-focus-offset);
      outline-style: solid;
    }

    .accordion__chevron {
      display: inline-flex;
      flex-shrink: 0;
      width: var(--fsds-accordion-icon-size);
      height: var(--fsds-accordion-icon-size);
      align-items: center;
      justify-content: center;
      transition: transform 200ms ease;
      color: var(--fsds-accordion-color-icon);
    }

    .accordion__trigger[aria-expanded="true"] .accordion__chevron {
      transform: rotate(180deg);
    }

    .accordion__content {
      display: block;
      overflow: hidden;
    }

    .accordion__contentInner {
      padding: var(--fsds-accordion-spacing-paddingY);
      color: var(--fsds-accordion-color-textSecondary);
      font-size: var(--fsds-accordion-text-sizeContent);
      line-height: var(--fsds-accordion-text-lineHeightContent);
    }

    .accordion--disabled {
      opacity: var(--fsds-accordion-opacity-disabled);
      pointer-events: none;
    }
  `;

  @property({ type: String })
  type?: AccordionType = "single";
  @property({ attribute: false })
  value?: string | string[];
  @property({ attribute: false })
  defaultValue?: string | string[];
  @property({ attribute: false })
  onValueChange?: (value: string | string[]) => void;
  @property({ type: Boolean })
  collapsible?: boolean = false;
  @property({ type: Boolean })
  disabled?: boolean;

  private behavior = new AccordionBehavior(this, {
    value: () => this.value,
    defaultValue: this.defaultValue,
    onValueChange: (v) => this.onValueChange?.(v),
  });

  private _generatedIdBase: string | null = null;
  private get resolvedIdBase(): string {
    if (!this._generatedIdBase) {
      this._generatedIdBase = "fsds-accordion-" + Math.random().toString(36).slice(2, 8);
    }
    return this._generatedIdBase;
  }

  isItemOpen(itemValue: string): boolean {
    const v = this.behavior.openness;
    return Array.isArray(v) ? v.includes(itemValue) : v === itemValue;
  }

  toggleItem(itemValue: string): void {
    const v = this.behavior.openness;
    if ((this.type ?? "single") === "multiple") {
      const current = Array.isArray(v) ? v : [];
      this.behavior.setOpenness(
        current.includes(itemValue)
          ? current.filter((x) => x !== itemValue)
          : [...current, itemValue],
      );
    } else {
      const current = typeof v === "string" ? v : "";
      this.behavior.setOpenness(current === itemValue && this.collapsible ? "" : itemValue);
    }
    this._provideCtx();
  }

  private _handleKeyDown = (e: KeyboardEvent): void => {
    const key = e.key;
    if (key !== "ArrowDown" && key !== "ArrowUp" && key !== "Home" && key !== "End") return;
    const triggers = Array.from(
      this.querySelectorAll<HTMLElement>("[data-disclosure-trigger]"),
    ).filter((el) => el.getAttribute("aria-disabled") !== "true");
    if (triggers.length === 0) return;
    const currentIndex = triggers.indexOf(document.activeElement as HTMLElement);
    let nextIndex = currentIndex;
    if (key === "ArrowDown") nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % triggers.length;
    else if (key === "ArrowUp") nextIndex = currentIndex < 0 ? triggers.length - 1 : (currentIndex - 1 + triggers.length) % triggers.length;
    else if (key === "Home") nextIndex = 0;
    else nextIndex = triggers.length - 1;
    e.preventDefault();
    triggers[nextIndex]?.focus();
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("keydown", this._handleKeyDown);
    this._provideCtx();
  }

  override disconnectedCallback(): void {
    this.removeEventListener("keydown", this._handleKeyDown);
    super.disconnectedCallback();
  }

  override updated(): void {
    this._provideCtx();
  }

  private _provideCtx(): void {
    if (!this.isConnected) return;
    provideContext(this, DISCLOSURE_CTX.key, {
      openness: this.behavior.openness,
      toggleItem: (v: string) => this.toggleItem(v),
      isItemOpen: (v: string) => this.isItemOpen(v),
      type: this.type ?? "single",
      collapsible: this.collapsible ?? false,
      disabled: this.disabled ?? false,
      idBase: this.resolvedIdBase,
    });
  }

  override render() {
    const classes = {
      'accordion': true,
      [`accordion--${this.type}`]: !!this.type,
      'accordion--disabled': !!this.disabled,
    };
    return html`<div class=${classMap(classes)}><slot></slot></div>`;
  }
}

customElements.define('fsds-accordion', AccordionElement);

export class AccordionItemElement extends LitElement {
  static override styles = css`
    :host { display: block; }
    .accordion {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-accordion-color-background-hover: var(--fsds-semantic-interaction-background-hover, #efefef);
      --fsds-accordion-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-accordion-color-textSecondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-accordion-color-icon: var(--fsds-semantic-color-foreground-tertiary, #717171);
      --fsds-accordion-border-width: var(--fsds-semantic-shape-control-border-defaultWidth, 1px);
      --fsds-accordion-border-color: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-accordion-border-radius: var(--fsds-semantic-shape-radius-small, 4px);
      --fsds-accordion-spacing-gap: var(--fsds-core-spacing-size-07, 24px);
      --fsds-accordion-spacing-paddingX: var(--fsds-core-spacing-size-00, 0px);
      --fsds-accordion-spacing-paddingY: var(--fsds-core-spacing-size-04, 8px);
      --fsds-accordion-text-weight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-accordion-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-accordion-text-lineHeight: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-accordion-text-sizeContent: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-accordion-text-lineHeightContent: var(--fsds-semantic-typography-line-height-loose, 1.8);
      --fsds-accordion-icon-size: var(--fsds-core-spacing-size-04, 8px);
      --fsds-accordion-focus-width: var(--fsds-semantic-shape-control-border-focusWidth, 2px);
      --fsds-accordion-focus-color: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-accordion-focus-offset: var(--fsds-core-spacing-size-01, 1px);
      --fsds-accordion-opacity-disabled: var(--fsds-semantic-interaction-disabled-opacity, 0.5);
      --fsds-accordion-color-textHover: var(--fsds-semantic-interaction-text-hover, #555555);
    }

    .accordion {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-accordion-spacing-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      flex-direction: column;
      border-color: var(--fsds-accordion-border-color);
      border-radius: var(--fsds-accordion-border-radius);
      font-size: var(--fsds-accordion-text-sizeContent);
      line-height: var(--fsds-accordion-text-lineHeightContent);
    }

    .accordion__item {
      background-color: transparent;
      border-color: var(--fsds-accordion-border-color);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-accordion-border-radius);
      overflow: hidden;
    }

    .accordion__header {
      margin: 0;
    }

    .accordion__trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: var(--fsds-accordion-spacing-paddingY);
      background: transparent;
      border: 0;
      cursor: pointer;
      font-size: var(--fsds-accordion-text-size);
      font-weight: var(--fsds-accordion-text-weight);
      color: var(--fsds-accordion-color-text);
      text-align: left;
      line-height: var(--fsds-accordion-text-lineHeight);
    }

    .accordion__trigger:hover {
      background-color: var(--fsds-accordion-color-background-hover);
      color: var(--fsds-accordion-color-textHover);
    }

    .accordion__trigger:focus-visible {
      outline-width: var(--fsds-accordion-focus-width);
      outline-color: var(--fsds-accordion-focus-color);
      outline-offset: var(--fsds-accordion-focus-offset);
      outline-style: solid;
    }

    .accordion__chevron {
      display: inline-flex;
      flex-shrink: 0;
      width: var(--fsds-accordion-icon-size);
      height: var(--fsds-accordion-icon-size);
      align-items: center;
      justify-content: center;
      transition: transform 200ms ease;
      color: var(--fsds-accordion-color-icon);
    }

    .accordion__trigger[aria-expanded="true"] .accordion__chevron {
      transform: rotate(180deg);
    }

    .accordion__content {
      display: block;
      overflow: hidden;
    }

    .accordion__contentInner {
      padding: var(--fsds-accordion-spacing-paddingY);
      color: var(--fsds-accordion-color-textSecondary);
      font-size: var(--fsds-accordion-text-sizeContent);
      line-height: var(--fsds-accordion-text-lineHeightContent);
    }

    .accordion--disabled {
      opacity: var(--fsds-accordion-opacity-disabled);
      pointer-events: none;
    }
  `;

  override render() {
    this.className = "accordion__item";
    return html`<slot></slot>`;
  }
}

customElements.define('fsds-accordion-item', AccordionItemElement);

export class AccordionTriggerElement extends LitElement {
  static override styles = css`
    :host { display: block; cursor: pointer; } :host([aria-disabled="true"]) { cursor: not-allowed; pointer-events: none; }
    .accordion {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-accordion-color-background-hover: var(--fsds-semantic-interaction-background-hover, #efefef);
      --fsds-accordion-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-accordion-color-textSecondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-accordion-color-icon: var(--fsds-semantic-color-foreground-tertiary, #717171);
      --fsds-accordion-border-width: var(--fsds-semantic-shape-control-border-defaultWidth, 1px);
      --fsds-accordion-border-color: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-accordion-border-radius: var(--fsds-semantic-shape-radius-small, 4px);
      --fsds-accordion-spacing-gap: var(--fsds-core-spacing-size-07, 24px);
      --fsds-accordion-spacing-paddingX: var(--fsds-core-spacing-size-00, 0px);
      --fsds-accordion-spacing-paddingY: var(--fsds-core-spacing-size-04, 8px);
      --fsds-accordion-text-weight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-accordion-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-accordion-text-lineHeight: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-accordion-text-sizeContent: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-accordion-text-lineHeightContent: var(--fsds-semantic-typography-line-height-loose, 1.8);
      --fsds-accordion-icon-size: var(--fsds-core-spacing-size-04, 8px);
      --fsds-accordion-focus-width: var(--fsds-semantic-shape-control-border-focusWidth, 2px);
      --fsds-accordion-focus-color: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-accordion-focus-offset: var(--fsds-core-spacing-size-01, 1px);
      --fsds-accordion-opacity-disabled: var(--fsds-semantic-interaction-disabled-opacity, 0.5);
      --fsds-accordion-color-textHover: var(--fsds-semantic-interaction-text-hover, #555555);
    }

    .accordion {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-accordion-spacing-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      flex-direction: column;
      border-color: var(--fsds-accordion-border-color);
      border-radius: var(--fsds-accordion-border-radius);
      font-size: var(--fsds-accordion-text-sizeContent);
      line-height: var(--fsds-accordion-text-lineHeightContent);
    }

    .accordion__item {
      background-color: transparent;
      border-color: var(--fsds-accordion-border-color);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-accordion-border-radius);
      overflow: hidden;
    }

    .accordion__header {
      margin: 0;
    }

    .accordion__trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: var(--fsds-accordion-spacing-paddingY);
      background: transparent;
      border: 0;
      cursor: pointer;
      font-size: var(--fsds-accordion-text-size);
      font-weight: var(--fsds-accordion-text-weight);
      color: var(--fsds-accordion-color-text);
      text-align: left;
      line-height: var(--fsds-accordion-text-lineHeight);
    }

    .accordion__trigger:hover {
      background-color: var(--fsds-accordion-color-background-hover);
      color: var(--fsds-accordion-color-textHover);
    }

    .accordion__trigger:focus-visible {
      outline-width: var(--fsds-accordion-focus-width);
      outline-color: var(--fsds-accordion-focus-color);
      outline-offset: var(--fsds-accordion-focus-offset);
      outline-style: solid;
    }

    .accordion__chevron {
      display: inline-flex;
      flex-shrink: 0;
      width: var(--fsds-accordion-icon-size);
      height: var(--fsds-accordion-icon-size);
      align-items: center;
      justify-content: center;
      transition: transform 200ms ease;
      color: var(--fsds-accordion-color-icon);
    }

    .accordion__trigger[aria-expanded="true"] .accordion__chevron {
      transform: rotate(180deg);
    }

    .accordion__content {
      display: block;
      overflow: hidden;
    }

    .accordion__contentInner {
      padding: var(--fsds-accordion-spacing-paddingY);
      color: var(--fsds-accordion-color-textSecondary);
      font-size: var(--fsds-accordion-text-sizeContent);
      line-height: var(--fsds-accordion-text-lineHeightContent);
    }

    .accordion--disabled {
      opacity: var(--fsds-accordion-opacity-disabled);
      pointer-events: none;
    }
  `;

  @property() value = "";

  private _ctx = new ContextConsumerController(this, DISCLOSURE_CTX);

  private _onActivate = (): void => {
    try { this._ctx.value.toggleItem(this.value); } catch { /* no context */ }
  };

  private _onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this._onActivate(); }
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("click", this._onActivate);
    this.addEventListener("keydown", this._onKeyDown);
  }

  override disconnectedCallback(): void {
    this.removeEventListener("click", this._onActivate);
    this.removeEventListener("keydown", this._onKeyDown);
    super.disconnectedCallback();
  }

  private _updateHostAttrs(isOpen: boolean, idBase: string, disabled: boolean): void {
    this.setAttribute("role", "button");
    this.setAttribute("data-disclosure-trigger", "");
    this.setAttribute("data-value", this.value);
    this.setAttribute("id", `${idBase}-trigger-${this.value}`);
    this.setAttribute("aria-controls", `${idBase}-content-${this.value}`);
    this.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (disabled) { this.setAttribute("aria-disabled", "true"); this.removeAttribute("tabindex"); }
    else { this.removeAttribute("aria-disabled"); this.setAttribute("tabindex", "0"); }
  }

  override render() {
    let isOpen = false;
    let idBase = "";
    let disabled = false;
    try {
      const ctx = this._ctx.value;
      isOpen = ctx.isItemOpen(this.value);
      idBase = ctx.idBase;
      disabled = ctx.disabled;
    } catch { /* no context yet */ }
    this._updateHostAttrs(isOpen, idBase, disabled);
    this.className = ["accordion__trigger", isOpen ? "accordion__trigger--open" : ""].filter(Boolean).join(" ");
    return html`<slot></slot><span class="accordion__chevron"></span>`;
  }
}

customElements.define('fsds-accordion-trigger', AccordionTriggerElement);

export class AccordionContentElement extends LitElement {
  static override styles = css`
    :host { display: block; } :host([hidden]) { display: none !important; }
    .accordion {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-accordion-color-background-hover: var(--fsds-semantic-interaction-background-hover, #efefef);
      --fsds-accordion-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-accordion-color-textSecondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-accordion-color-icon: var(--fsds-semantic-color-foreground-tertiary, #717171);
      --fsds-accordion-border-width: var(--fsds-semantic-shape-control-border-defaultWidth, 1px);
      --fsds-accordion-border-color: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-accordion-border-radius: var(--fsds-semantic-shape-radius-small, 4px);
      --fsds-accordion-spacing-gap: var(--fsds-core-spacing-size-07, 24px);
      --fsds-accordion-spacing-paddingX: var(--fsds-core-spacing-size-00, 0px);
      --fsds-accordion-spacing-paddingY: var(--fsds-core-spacing-size-04, 8px);
      --fsds-accordion-text-weight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-accordion-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-accordion-text-lineHeight: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-accordion-text-sizeContent: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-accordion-text-lineHeightContent: var(--fsds-semantic-typography-line-height-loose, 1.8);
      --fsds-accordion-icon-size: var(--fsds-core-spacing-size-04, 8px);
      --fsds-accordion-focus-width: var(--fsds-semantic-shape-control-border-focusWidth, 2px);
      --fsds-accordion-focus-color: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-accordion-focus-offset: var(--fsds-core-spacing-size-01, 1px);
      --fsds-accordion-opacity-disabled: var(--fsds-semantic-interaction-disabled-opacity, 0.5);
      --fsds-accordion-color-textHover: var(--fsds-semantic-interaction-text-hover, #555555);
    }

    .accordion {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-accordion-spacing-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      flex-direction: column;
      border-color: var(--fsds-accordion-border-color);
      border-radius: var(--fsds-accordion-border-radius);
      font-size: var(--fsds-accordion-text-sizeContent);
      line-height: var(--fsds-accordion-text-lineHeightContent);
    }

    .accordion__item {
      background-color: transparent;
      border-color: var(--fsds-accordion-border-color);
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-accordion-border-radius);
      overflow: hidden;
    }

    .accordion__header {
      margin: 0;
    }

    .accordion__trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: var(--fsds-accordion-spacing-paddingY);
      background: transparent;
      border: 0;
      cursor: pointer;
      font-size: var(--fsds-accordion-text-size);
      font-weight: var(--fsds-accordion-text-weight);
      color: var(--fsds-accordion-color-text);
      text-align: left;
      line-height: var(--fsds-accordion-text-lineHeight);
    }

    .accordion__trigger:hover {
      background-color: var(--fsds-accordion-color-background-hover);
      color: var(--fsds-accordion-color-textHover);
    }

    .accordion__trigger:focus-visible {
      outline-width: var(--fsds-accordion-focus-width);
      outline-color: var(--fsds-accordion-focus-color);
      outline-offset: var(--fsds-accordion-focus-offset);
      outline-style: solid;
    }

    .accordion__chevron {
      display: inline-flex;
      flex-shrink: 0;
      width: var(--fsds-accordion-icon-size);
      height: var(--fsds-accordion-icon-size);
      align-items: center;
      justify-content: center;
      transition: transform 200ms ease;
      color: var(--fsds-accordion-color-icon);
    }

    .accordion__trigger[aria-expanded="true"] .accordion__chevron {
      transform: rotate(180deg);
    }

    .accordion__content {
      display: block;
      overflow: hidden;
    }

    .accordion__contentInner {
      padding: var(--fsds-accordion-spacing-paddingY);
      color: var(--fsds-accordion-color-textSecondary);
      font-size: var(--fsds-accordion-text-sizeContent);
      line-height: var(--fsds-accordion-text-lineHeightContent);
    }

    .accordion--disabled {
      opacity: var(--fsds-accordion-opacity-disabled);
      pointer-events: none;
    }
  `;

  @property() value = "";

  private _ctx = new ContextConsumerController(this, DISCLOSURE_CTX);

  private _updateHostAttrs(isOpen: boolean, idBase: string): void {
    this.setAttribute("role", "region");
    this.setAttribute("id", `${idBase}-content-${this.value}`);
    this.setAttribute("aria-labelledby", `${idBase}-trigger-${this.value}`);
    if (isOpen) this.removeAttribute("hidden");
    else this.setAttribute("hidden", "");
  }

  override render() {
    let isOpen = false;
    let idBase = "";
    try {
      const ctx = this._ctx.value;
      isOpen = ctx.isItemOpen(this.value);
      idBase = ctx.idBase;
    } catch { /* no context yet */ }
    this._updateHostAttrs(isOpen, idBase);
    this.className = "accordion__content";
    return html`<div class="accordion__contentInner"><slot></slot></div>`;
  }
}

customElements.define('fsds-accordion-content', AccordionContentElement);
// @generated:end

// @custom:start trailing

// @custom:end