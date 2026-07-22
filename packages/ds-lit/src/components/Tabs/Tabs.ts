// @generated:start imports
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { TabsBehavior } from './TabsBehavior.js';
import {
  createCompoundContext,
  provideContext,
  ContextConsumerController,
} from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type TabsOrientation = "horizontal" | "vertical";
export type TabsAppearance = "underline" | "pills";
export type TabsActivationMode = "automatic" | "manual";

export interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
  registerTab: (value: string) => void;
  unregisterTab: (value: string) => void;
  registeredTabs: string[];
  idBase: string;
  orientation: "horizontal" | "vertical";
  activationMode: "automatic" | "manual";
  loop: boolean;
  unmountInactive: boolean;
}

const TABS_CTX = createCompoundContext<TabsContextValue>("Tabs");
export { TABS_CTX };
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class TabsElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .tabs {
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
      --fsds-tabs-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-tabs-spacing-padding: var(--fsds-core-spacing-size-04, 8px);
      --fsds-tabs-spacing-pillPadding: 4px 10px;
      --fsds-tabs-spacing-panelGap: var(--fsds-core-spacing-size-06, 16px);
      --fsds-tabs-color-fg: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-tabs-color-disabled-fg: var(--fsds-semantic-color-foreground-disabled, #aeaeae);
      --fsds-tabs-color-indicator: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-tabs-shape-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-tabs-motion-indicator: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-tabs-color-hover-bg: var(--fsds-semantic-color-background-hover, #cecece);
      --fsds-tabs-color-hover-fg: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-tabs-color-active-fg: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-tabs-color-active-bg: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-tabs-color-focus: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-tabs-color-underline-active: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-tabs-size-indicator-thickness: 2px;
      --fsds-tabs-size-vertical-listWidth: 160px;
    }

    .tabs {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-tabs-spacing-panelGap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      flex-direction: column;
      padding: var(--fsds-tabs-spacing-padding);
      border-radius: var(--fsds-tabs-shape-radius);
    }

    .tabs__list {
      display: flex;
      flex-direction: row;
      gap: var(--fsds-tabs-spacing-gap);
      border-bottom-color: var(--fsds-tabs-color-indicator);
      border-bottom-style: solid;
      border-bottom-width: 1px;
      position: relative;
    }

    .tabs__tab {
      display: inline-flex;
      align-items: center;
      padding: var(--fsds-tabs-spacing-padding);
      color: var(--fsds-tabs-color-fg);
      background: transparent;
      border: none;
      cursor: pointer;
      position: relative;
    }

    .tabs__tab:hover {
      color: var(--fsds-tabs-color-hover-fg);
      background-color: var(--fsds-tabs-color-hover-bg);
    }

    .tabs__tab--active {
      color: var(--fsds-tabs-color-active-fg);
      background-color: var(--fsds-tabs-color-active-bg);
    }

    .tabs__tab:disabled {
      color: var(--fsds-tabs-color-disabled-fg);
      cursor: not-allowed;
    }

    .tabs__indicator {
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--fsds-tabs-color-indicator);
      transition: transform var(--fsds-tabs-motion-indicator) ease, width var(--fsds-tabs-motion-indicator) ease;
    }

    .tabs__panel {
      display: block;
      padding: var(--fsds-tabs-spacing-padding);
    }

    .tabs--underline .tabs__list {
      border-bottom-color: var(--fsds-tabs-color-underline-active);
      border-bottom-style: solid;
      border-bottom-width: var(--fsds-tabs-size-indicator-thickness);
    }

    .tabs--underline .tabs__indicator {
      height: var(--fsds-tabs-size-indicator-thickness);
      bottom: -1px;
      left: 0;
      right: 0;
      background-color: var(--fsds-tabs-color-underline-active);
    }

    .tabs--vertical .tabs__root {
      flex-direction: row;
    }

    .tabs--vertical .tabs__list {
      flex-direction: column;
      border-bottom-width: 0;
      border-inline-end-color: var(--fsds-tabs-color-indicator);
      border-inline-end-style: solid;
      border-inline-end-width: 1px;
      align-self: stretch;
    }

    .tabs--vertical .tabs__indicator {
      top: 0;
      bottom: 0;
      right: -1px;
      left: auto;
      width: var(--fsds-tabs-size-indicator-thickness);
      height: auto;
      transition: transform var(--fsds-tabs-motion-indicator) ease, height var(--fsds-tabs-motion-indicator) ease;
    }

    .tabs--pills .tabs__list {
      border-bottom-width: 0;
      gap: var(--fsds-tabs-spacing-gap);
    }

    .tabs--pills .tabs__tab {
      border-radius: var(--fsds-tabs-shape-radius);
      padding: var(--fsds-tabs-spacing-pillPadding);
    }

    .tabs--pills .tabs__tab--active {
      background-color: var(--fsds-tabs-color-active-bg);
      color: var(--fsds-tabs-color-active-fg);
    }

    .tabs--pills .tabs__indicator {
      display: none;
    }
  `;

  @property({ type: String })
  value?: string;
  @property({ type: String })
  defaultValue?: string;
  @property({ attribute: false })
  onValueChange?: (value: string) => void;
  @property({ type: String })
  orientation?: TabsOrientation = "horizontal";
  @property({ type: String })
  appearance?: TabsAppearance = "underline";
  @property({ type: String })
  activationMode?: TabsActivationMode = "automatic";
  @property({ type: Boolean })
  loop?: boolean = true;
  @property({ type: Boolean })
  unmountInactive?: boolean;
  @property({ type: String })
  idBase?: string;

  private behavior = new TabsBehavior(this, {
    value: () => this.value,
    defaultValue: this.defaultValue,
    onValueChange: (v) => this.onValueChange?.(v),
  });

  private _generatedIdBase: string | null = null;

  private get resolvedIdBase(): string {
    if (this.idBase) return this.idBase;
    if (!this._generatedIdBase) {
      this._generatedIdBase = "fsds-tabs-" + Math.random().toString(36).slice(2, 8);
    }
    return this._generatedIdBase;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // Sync the behavior's internal state from defaultValue if no controlled
    // value was set. This handles the case where defaultValue is set after
    // element construction (property set order issue with class fields).
    if (this.value === undefined && this.defaultValue !== undefined) {
      this.behavior.activeTabState["_internal"] = this.defaultValue;
    }
    this._provideCtx();
  }

  override updated(): void {
    this._provideCtx();
  }

  private _provideCtx(): void {
    if (!this.isConnected) return;
    provideContext(this, TABS_CTX.key, {
      activeTab: this.behavior.activeTab,
      setActiveTab: (v: string) => { this.behavior.setActiveTab(v); this._provideCtx(); },
      registerTab: (v: string) => { this.behavior.registerTab(v); this._provideCtx(); },
      unregisterTab: (v: string) => { this.behavior.unregisterTab(v); this._provideCtx(); },
      registeredTabs: this.behavior.registeredTabs,
      idBase: this.resolvedIdBase,
      orientation: this.orientation ?? "horizontal",
      activationMode: this.activationMode ?? "automatic",
      loop: this.loop ?? true,
      unmountInactive: this.unmountInactive ?? true,
    });
  }

  override render() {
    const classes = {
      'tabs': true,
      [`tabs--${(this.orientation ?? "horizontal")}`]: !!(this.orientation ?? "horizontal"),
      [`tabs--${(this.appearance ?? "underline")}`]: !!(this.appearance ?? "underline"),
      [`tabs--${(this.activationMode ?? "automatic")}`]: !!(this.activationMode ?? "automatic"),
    };
    return html`<div class=${classMap(classes)}><slot></slot></div>`;
  }
}

customElements.define('fsds-tabs', TabsElement);

export class TabsListElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .tabs {
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
      --fsds-tabs-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-tabs-spacing-padding: var(--fsds-core-spacing-size-04, 8px);
      --fsds-tabs-spacing-pillPadding: 4px 10px;
      --fsds-tabs-spacing-panelGap: var(--fsds-core-spacing-size-06, 16px);
      --fsds-tabs-color-fg: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-tabs-color-disabled-fg: var(--fsds-semantic-color-foreground-disabled, #aeaeae);
      --fsds-tabs-color-indicator: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-tabs-shape-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-tabs-motion-indicator: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-tabs-color-hover-bg: var(--fsds-semantic-color-background-hover, #cecece);
      --fsds-tabs-color-hover-fg: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-tabs-color-active-fg: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-tabs-color-active-bg: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-tabs-color-focus: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-tabs-color-underline-active: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-tabs-size-indicator-thickness: 2px;
      --fsds-tabs-size-vertical-listWidth: 160px;
    }

    .tabs {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-tabs-spacing-panelGap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      flex-direction: column;
      padding: var(--fsds-tabs-spacing-padding);
      border-radius: var(--fsds-tabs-shape-radius);
    }

    .tabs__list {
      display: flex;
      flex-direction: row;
      gap: var(--fsds-tabs-spacing-gap);
      border-bottom-color: var(--fsds-tabs-color-indicator);
      border-bottom-style: solid;
      border-bottom-width: 1px;
      position: relative;
    }

    .tabs__tab {
      display: inline-flex;
      align-items: center;
      padding: var(--fsds-tabs-spacing-padding);
      color: var(--fsds-tabs-color-fg);
      background: transparent;
      border: none;
      cursor: pointer;
      position: relative;
    }

    .tabs__tab:hover {
      color: var(--fsds-tabs-color-hover-fg);
      background-color: var(--fsds-tabs-color-hover-bg);
    }

    .tabs__tab--active {
      color: var(--fsds-tabs-color-active-fg);
      background-color: var(--fsds-tabs-color-active-bg);
    }

    .tabs__tab:disabled {
      color: var(--fsds-tabs-color-disabled-fg);
      cursor: not-allowed;
    }

    .tabs__indicator {
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--fsds-tabs-color-indicator);
      transition: transform var(--fsds-tabs-motion-indicator) ease, width var(--fsds-tabs-motion-indicator) ease;
    }

    .tabs__panel {
      display: block;
      padding: var(--fsds-tabs-spacing-padding);
    }

    .tabs--underline .tabs__list {
      border-bottom-color: var(--fsds-tabs-color-underline-active);
      border-bottom-style: solid;
      border-bottom-width: var(--fsds-tabs-size-indicator-thickness);
    }

    .tabs--underline .tabs__indicator {
      height: var(--fsds-tabs-size-indicator-thickness);
      bottom: -1px;
      left: 0;
      right: 0;
      background-color: var(--fsds-tabs-color-underline-active);
    }

    .tabs--vertical .tabs__root {
      flex-direction: row;
    }

    .tabs--vertical .tabs__list {
      flex-direction: column;
      border-bottom-width: 0;
      border-inline-end-color: var(--fsds-tabs-color-indicator);
      border-inline-end-style: solid;
      border-inline-end-width: 1px;
      align-self: stretch;
    }

    .tabs--vertical .tabs__indicator {
      top: 0;
      bottom: 0;
      right: -1px;
      left: auto;
      width: var(--fsds-tabs-size-indicator-thickness);
      height: auto;
      transition: transform var(--fsds-tabs-motion-indicator) ease, height var(--fsds-tabs-motion-indicator) ease;
    }

    .tabs--pills .tabs__list {
      border-bottom-width: 0;
      gap: var(--fsds-tabs-spacing-gap);
    }

    .tabs--pills .tabs__tab {
      border-radius: var(--fsds-tabs-shape-radius);
      padding: var(--fsds-tabs-spacing-pillPadding);
    }

    .tabs--pills .tabs__tab--active {
      background-color: var(--fsds-tabs-color-active-bg);
      color: var(--fsds-tabs-color-active-fg);
    }

    .tabs--pills .tabs__indicator {
      display: none;
    }
  `;

  private _ctx = new ContextConsumerController(this, TABS_CTX);

  private _handleKeyDown = (e: KeyboardEvent): void => {
    let ctx: TabsContextValue;
    try { ctx = this._ctx.value; } catch { return; }
    const tabs = ctx.registeredTabs;
    if (tabs.length === 0) return;
    const currentIndex = tabs.indexOf(ctx.activeTab);
    const isHorizontal = ctx.orientation !== "vertical";
    let nextIndex = currentIndex;
    if ((isHorizontal && e.key === "ArrowRight") || (!isHorizontal && e.key === "ArrowDown")) {
      e.preventDefault();
      nextIndex = ctx.loop ? (currentIndex + 1) % tabs.length : Math.min(currentIndex + 1, tabs.length - 1);
    } else if ((isHorizontal && e.key === "ArrowLeft") || (!isHorizontal && e.key === "ArrowUp")) {
      e.preventDefault();
      nextIndex = ctx.loop ? (currentIndex - 1 + tabs.length) % tabs.length : Math.max(currentIndex - 1, 0);
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = tabs.length - 1;
    } else if (e.key === "Enter" || e.key === " ") {
      if (ctx.activationMode === "manual") {
        e.preventDefault();
        // Find the currently focused tab host (it has data-value and role="tab").
        const focusedTab = this.querySelector("[role=\"tab\"]:focus") as HTMLElement | null;
        const val = focusedTab?.getAttribute("data-value");
        if (val) ctx.setActiveTab(val);
      }
      return;
    } else {
      return;
    }
    const targetValue = tabs[nextIndex];
    if (ctx.activationMode === "automatic") {
      ctx.setActiveTab(targetValue);
    }
    // Focus the target tab host element (which now has role="tab" on the host).
    const targetTabHost = this.querySelector(`[data-value="${targetValue}"]`) as HTMLElement | null;
    targetTabHost?.focus();
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("keydown", this._handleKeyDown);
  }

  override disconnectedCallback(): void {
    this.removeEventListener("keydown", this._handleKeyDown);
    super.disconnectedCallback();
  }

  override render() {
    let orientation = "horizontal";
    try { orientation = this._ctx.value.orientation; } catch { /* no context yet */ }
    return html`<div class="tabs__list" role="tablist" aria-orientation="${orientation}"><slot></slot><span class="tabs__indicator" aria-hidden="true"></span></div>`;
  }
}

customElements.define('fsds-tabs-list', TabsListElement);

export class TabsTabElement extends LitElement {
  // Host element IS the tab — ARIA attrs on the host, slot-only shadow.
  static override styles = css`
    :host { display: inline-flex; cursor: pointer; } :host([disabled]), :host([aria-disabled="true"]) { cursor: not-allowed; pointer-events: none; }
    .tabs {
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
      --fsds-tabs-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-tabs-spacing-padding: var(--fsds-core-spacing-size-04, 8px);
      --fsds-tabs-spacing-pillPadding: 4px 10px;
      --fsds-tabs-spacing-panelGap: var(--fsds-core-spacing-size-06, 16px);
      --fsds-tabs-color-fg: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-tabs-color-disabled-fg: var(--fsds-semantic-color-foreground-disabled, #aeaeae);
      --fsds-tabs-color-indicator: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-tabs-shape-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-tabs-motion-indicator: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-tabs-color-hover-bg: var(--fsds-semantic-color-background-hover, #cecece);
      --fsds-tabs-color-hover-fg: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-tabs-color-active-fg: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-tabs-color-active-bg: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-tabs-color-focus: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-tabs-color-underline-active: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-tabs-size-indicator-thickness: 2px;
      --fsds-tabs-size-vertical-listWidth: 160px;
    }

    .tabs {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-tabs-spacing-panelGap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      flex-direction: column;
      padding: var(--fsds-tabs-spacing-padding);
      border-radius: var(--fsds-tabs-shape-radius);
    }

    .tabs__list {
      display: flex;
      flex-direction: row;
      gap: var(--fsds-tabs-spacing-gap);
      border-bottom-color: var(--fsds-tabs-color-indicator);
      border-bottom-style: solid;
      border-bottom-width: 1px;
      position: relative;
    }

    .tabs__tab {
      display: inline-flex;
      align-items: center;
      padding: var(--fsds-tabs-spacing-padding);
      color: var(--fsds-tabs-color-fg);
      background: transparent;
      border: none;
      cursor: pointer;
      position: relative;
    }

    .tabs__tab:hover {
      color: var(--fsds-tabs-color-hover-fg);
      background-color: var(--fsds-tabs-color-hover-bg);
    }

    .tabs__tab--active {
      color: var(--fsds-tabs-color-active-fg);
      background-color: var(--fsds-tabs-color-active-bg);
    }

    .tabs__tab:disabled {
      color: var(--fsds-tabs-color-disabled-fg);
      cursor: not-allowed;
    }

    .tabs__indicator {
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--fsds-tabs-color-indicator);
      transition: transform var(--fsds-tabs-motion-indicator) ease, width var(--fsds-tabs-motion-indicator) ease;
    }

    .tabs__panel {
      display: block;
      padding: var(--fsds-tabs-spacing-padding);
    }

    .tabs--underline .tabs__list {
      border-bottom-color: var(--fsds-tabs-color-underline-active);
      border-bottom-style: solid;
      border-bottom-width: var(--fsds-tabs-size-indicator-thickness);
    }

    .tabs--underline .tabs__indicator {
      height: var(--fsds-tabs-size-indicator-thickness);
      bottom: -1px;
      left: 0;
      right: 0;
      background-color: var(--fsds-tabs-color-underline-active);
    }

    .tabs--vertical .tabs__root {
      flex-direction: row;
    }

    .tabs--vertical .tabs__list {
      flex-direction: column;
      border-bottom-width: 0;
      border-inline-end-color: var(--fsds-tabs-color-indicator);
      border-inline-end-style: solid;
      border-inline-end-width: 1px;
      align-self: stretch;
    }

    .tabs--vertical .tabs__indicator {
      top: 0;
      bottom: 0;
      right: -1px;
      left: auto;
      width: var(--fsds-tabs-size-indicator-thickness);
      height: auto;
      transition: transform var(--fsds-tabs-motion-indicator) ease, height var(--fsds-tabs-motion-indicator) ease;
    }

    .tabs--pills .tabs__list {
      border-bottom-width: 0;
      gap: var(--fsds-tabs-spacing-gap);
    }

    .tabs--pills .tabs__tab {
      border-radius: var(--fsds-tabs-shape-radius);
      padding: var(--fsds-tabs-spacing-pillPadding);
    }

    .tabs--pills .tabs__tab--active {
      background-color: var(--fsds-tabs-color-active-bg);
      color: var(--fsds-tabs-color-active-fg);
    }

    .tabs--pills .tabs__indicator {
      display: none;
    }
  `;

  @property() value = "";
  @property({ type: Boolean }) disabled?: boolean;

  private _ctx = new ContextConsumerController(this, TABS_CTX);

  private _onClick = (): void => { if (!this.disabled) { try { this._ctx.value.setActiveTab(this.value); } catch { /* no context */ } } };

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("click", this._onClick);
    // Register after the context is available (provider fires provideContext in connectedCallback).
    // Use a microtask so the provider has connected first.
    Promise.resolve().then(() => {
      if (!this.isConnected) return;
      try { this._ctx.value.registerTab(this.value); } catch { /* no context */ }
    });
  }

  override disconnectedCallback(): void {
    this.removeEventListener("click", this._onClick);
    try { this._ctx.value.unregisterTab(this.value); } catch { /* no context */ }
    super.disconnectedCallback();
  }

  private _updateHostAttrs(isActive: boolean, idBase: string): void {
    this.setAttribute("role", "tab");
    this.setAttribute("id", `${idBase}-tab-${this.value}`);
    this.setAttribute("aria-controls", `${idBase}-panel-${this.value}`);
    this.setAttribute("aria-selected", isActive ? "true" : "false");
    this.setAttribute("tabindex", isActive ? "0" : "-1");
    this.setAttribute("data-value", this.value);
    if (this.disabled) this.setAttribute("aria-disabled", "true");
    else this.removeAttribute("aria-disabled");
  }

  override render() {
    let isActive = false;
    let idBase = "";
    try {
      const ctx = this._ctx.value;
      isActive = ctx.activeTab === this.value;
      idBase = ctx.idBase;
    } catch { /* no context yet */ }
    this._updateHostAttrs(isActive, idBase);
    // Render slot only — host IS the interactive element, no nested button needed.
    const cssClasses = [`tabs__tab`, isActive ? `tabs__tab--active` : ""].filter(Boolean).join(" ");
    this.className = cssClasses;
    return html`<slot></slot>`;
  }
}

customElements.define('fsds-tabs-tab', TabsTabElement);

export class TabsPanelElement extends LitElement {
  static override styles = css`
    :host { display: block; } :host([hidden]) { display: none !important; }
    .tabs {
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
      --fsds-tabs-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-tabs-spacing-padding: var(--fsds-core-spacing-size-04, 8px);
      --fsds-tabs-spacing-pillPadding: 4px 10px;
      --fsds-tabs-spacing-panelGap: var(--fsds-core-spacing-size-06, 16px);
      --fsds-tabs-color-fg: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-tabs-color-disabled-fg: var(--fsds-semantic-color-foreground-disabled, #aeaeae);
      --fsds-tabs-color-indicator: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-tabs-shape-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-tabs-motion-indicator: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-tabs-color-hover-bg: var(--fsds-semantic-color-background-hover, #cecece);
      --fsds-tabs-color-hover-fg: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-tabs-color-active-fg: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-tabs-color-active-bg: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-tabs-color-focus: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-tabs-color-underline-active: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-tabs-size-indicator-thickness: 2px;
      --fsds-tabs-size-vertical-listWidth: 160px;
    }

    .tabs {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-tabs-spacing-panelGap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      flex-direction: column;
      padding: var(--fsds-tabs-spacing-padding);
      border-radius: var(--fsds-tabs-shape-radius);
    }

    .tabs__list {
      display: flex;
      flex-direction: row;
      gap: var(--fsds-tabs-spacing-gap);
      border-bottom-color: var(--fsds-tabs-color-indicator);
      border-bottom-style: solid;
      border-bottom-width: 1px;
      position: relative;
    }

    .tabs__tab {
      display: inline-flex;
      align-items: center;
      padding: var(--fsds-tabs-spacing-padding);
      color: var(--fsds-tabs-color-fg);
      background: transparent;
      border: none;
      cursor: pointer;
      position: relative;
    }

    .tabs__tab:hover {
      color: var(--fsds-tabs-color-hover-fg);
      background-color: var(--fsds-tabs-color-hover-bg);
    }

    .tabs__tab--active {
      color: var(--fsds-tabs-color-active-fg);
      background-color: var(--fsds-tabs-color-active-bg);
    }

    .tabs__tab:disabled {
      color: var(--fsds-tabs-color-disabled-fg);
      cursor: not-allowed;
    }

    .tabs__indicator {
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--fsds-tabs-color-indicator);
      transition: transform var(--fsds-tabs-motion-indicator) ease, width var(--fsds-tabs-motion-indicator) ease;
    }

    .tabs__panel {
      display: block;
      padding: var(--fsds-tabs-spacing-padding);
    }

    .tabs--underline .tabs__list {
      border-bottom-color: var(--fsds-tabs-color-underline-active);
      border-bottom-style: solid;
      border-bottom-width: var(--fsds-tabs-size-indicator-thickness);
    }

    .tabs--underline .tabs__indicator {
      height: var(--fsds-tabs-size-indicator-thickness);
      bottom: -1px;
      left: 0;
      right: 0;
      background-color: var(--fsds-tabs-color-underline-active);
    }

    .tabs--vertical .tabs__root {
      flex-direction: row;
    }

    .tabs--vertical .tabs__list {
      flex-direction: column;
      border-bottom-width: 0;
      border-inline-end-color: var(--fsds-tabs-color-indicator);
      border-inline-end-style: solid;
      border-inline-end-width: 1px;
      align-self: stretch;
    }

    .tabs--vertical .tabs__indicator {
      top: 0;
      bottom: 0;
      right: -1px;
      left: auto;
      width: var(--fsds-tabs-size-indicator-thickness);
      height: auto;
      transition: transform var(--fsds-tabs-motion-indicator) ease, height var(--fsds-tabs-motion-indicator) ease;
    }

    .tabs--pills .tabs__list {
      border-bottom-width: 0;
      gap: var(--fsds-tabs-spacing-gap);
    }

    .tabs--pills .tabs__tab {
      border-radius: var(--fsds-tabs-shape-radius);
      padding: var(--fsds-tabs-spacing-pillPadding);
    }

    .tabs--pills .tabs__tab--active {
      background-color: var(--fsds-tabs-color-active-bg);
      color: var(--fsds-tabs-color-active-fg);
    }

    .tabs--pills .tabs__indicator {
      display: none;
    }
  `;

  @property() value = "";

  private _ctx = new ContextConsumerController(this, TABS_CTX);

  private _updateHostAttrs(isActive: boolean, unmountInactive: boolean, idBase: string): void {
    this.setAttribute("role", "tabpanel");
    this.setAttribute("id", `${idBase}-panel-${this.value}`);
    this.setAttribute("aria-labelledby", `${idBase}-tab-${this.value}`);
    this.setAttribute("tabindex", "0");
    if (!unmountInactive) {
      // Keep all panels in the DOM; toggle hidden attribute.
      if (isActive) this.removeAttribute("hidden");
      else this.setAttribute("hidden", "");
    } else {
      this.removeAttribute("hidden");
    }
  }

  override render() {
    let isActive = false;
    let unmountInactive = true;
    let idBase = "";
    try {
      const ctx = this._ctx.value;
      isActive = ctx.activeTab === this.value;
      unmountInactive = ctx.unmountInactive;
      idBase = ctx.idBase;
    } catch { /* no context yet */ }
    this._updateHostAttrs(isActive, unmountInactive, idBase);
    if (unmountInactive && !isActive) return html``;
    return html`<div class="tabs__panel"><slot></slot></div>`;
  }
}

customElements.define('fsds-tabs-panel', TabsPanelElement);
// @generated:end

// @custom:start trailing

// @custom:end